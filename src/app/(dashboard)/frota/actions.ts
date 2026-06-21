"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, requireOrgId } from "@/lib/session";
import { sincronizarOrg } from "@/lib/telemetry/sync";
import type { FormState } from "@/lib/types";

const TIPOS = ["CAMINHAO", "COLHEDORA", "TRATOR", "PULVERIZADOR", "OUTRO"] as const;
const STATUS = ["EM_OPERACAO", "NA_FILA", "EM_TRANSITO", "OCIOSO", "MANUTENCAO"] as const;
const PROVEDORES = ["MANUAL", "SIMULATOR", "JOHN_DEERE", "CNH", "LEAF"] as const;

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseAtivo(formData: FormData) {
  const identificador = String(formData.get("identificador") ?? "").trim();
  const modelo = String(formData.get("modelo") ?? "").trim();
  const operador = String(formData.get("operador") ?? "").trim();
  const tipoRaw = String(formData.get("tipo") ?? "CAMINHAO");
  const statusRaw = String(formData.get("status") ?? "OCIOSO");
  const fazendaId = String(formData.get("fazendaId") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!identificador) errors.identificador = "Identificador é obrigatório";
  if (!fazendaId) errors.fazendaId = "Selecione a unidade";

  const tipo = (TIPOS as readonly string[]).includes(tipoRaw) ? (tipoRaw as (typeof TIPOS)[number]) : "CAMINHAO";
  const status = (STATUS as readonly string[]).includes(statusRaw) ? (statusRaw as (typeof STATUS)[number]) : "OCIOSO";

  const provedorRaw = String(formData.get("provedorTelemetria") ?? "MANUAL");
  const provedorTelemetria = (PROVEDORES as readonly string[]).includes(provedorRaw) ? (provedorRaw as (typeof PROVEDORES)[number]) : "MANUAL";
  const externalId = String(formData.get("externalId") ?? "").trim();

  const consumoMedio = num(formData.get("consumoMedio"));
  if (consumoMedio !== null && consumoMedio < 0) errors.consumoMedio = "Valor inválido";

  return {
    errors,
    fazendaId,
    data: {
      identificador,
      modelo: modelo || null,
      operador: operador || null,
      tipo,
      status,
      provedorTelemetria,
      externalId: externalId || null,
      consumoMedio: consumoMedio ?? 0,
      capacidadeTanque: num(formData.get("capacidadeTanque")),
      lat: num(formData.get("lat")),
      lng: num(formData.get("lng")),
      ano: num(formData.get("ano")),
    },
  };
}

/** Confirma que a unidade escolhida pertence à org da sessão (anti-IDOR). */
async function fazendaPertenceOrg(fazendaId: string, orgId: string) {
  const f = await db.fazenda.findFirst({ where: { id: fazendaId, organizacaoId: orgId }, select: { id: true } });
  return !!f;
}

export async function criarAtivo(_prev: FormState, formData: FormData): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para cadastrar máquinas." };
  }

  const { errors, data, fazendaId } = parseAtivo(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  if (!(await fazendaPertenceOrg(fazendaId, orgId))) return { ok: false, errors: { fazendaId: "Unidade inválida" } };

  try {
    await db.ativo.create({ data: { ...data, fazendaId, organizacaoId: orgId, ano: data.ano ?? undefined } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, errors: { identificador: "Já existe uma máquina com esse identificador." } };
    }
    return { ok: false, message: "Erro ao salvar máquina. Tente novamente." };
  }

  revalidatePath("/frota");
  revalidatePath("/mapa");
  return { ok: true, message: "Máquina cadastrada" };
}

export async function atualizarAtivo(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para editar máquinas." };
  }

  const { errors, data, fazendaId } = parseAtivo(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  if (!(await fazendaPertenceOrg(fazendaId, orgId))) return { ok: false, errors: { fazendaId: "Unidade inválida" } };

  try {
    // updateMany scoped por org garante que só edita máquina do próprio tenant
    const res = await db.ativo.updateMany({ where: { id, organizacaoId: orgId }, data: { ...data, fazendaId } });
    if (res.count === 0) return { ok: false, message: "Máquina não encontrada." };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, errors: { identificador: "Já existe uma máquina com esse identificador." } };
    }
    return { ok: false, message: "Erro ao atualizar máquina." };
  }

  revalidatePath("/frota");
  revalidatePath("/mapa");
  return { ok: true, message: "Máquina atualizada" };
}

export async function deletarAtivo(id: string): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para excluir máquinas." };
  }

  try {
    const res = await db.ativo.deleteMany({ where: { id, organizacaoId: orgId } });
    if (res.count === 0) return { ok: false, message: "Máquina não encontrada." };
  } catch {
    return { ok: false, message: "Erro ao excluir máquina." };
  }

  revalidatePath("/frota");
  revalidatePath("/mapa");
  return { ok: true, message: "Máquina excluída" };
}

/**
 * Sincroniza a telemetria da org com o provedor (CCT SimWorld): puxa as
 * leituras das máquinas marcadas como SIMULATOR (com ID externo) e alimenta
 * o motor de recomendações com dado real-simulado.
 */
export async function sincronizarTelemetria(): Promise<FormState> {
  let orgId: string;
  try {
    orgId = await requireOrgId();
  } catch {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }

  try {
    const n = await sincronizarOrg(orgId);
    revalidatePath("/frota");
    revalidatePath("/operacao");
    revalidatePath("/mapa");
    revalidatePath("/dashboard");
    return {
      ok: true,
      message: n > 0
        ? `${n} máquina(s) sincronizada(s) com o SimWorld.`
        : "Nenhuma máquina ligada ao simulador. Defina Provedor = SIMULATOR e o ID externo (ex: M-001) na máquina.",
    };
  } catch (e) {
    const url = process.env.SIMWORLD_URL ?? "http://localhost:3100";
    const detalhe = e instanceof Error && e.message ? e.message : `Falha ao conectar no SimWorld (${url}). Ele está rodando?`;
    return { ok: false, message: detalhe };
  }
}
