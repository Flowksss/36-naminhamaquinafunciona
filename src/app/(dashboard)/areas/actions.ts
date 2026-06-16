"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import type { FormState } from "@/lib/types";

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function parseTalhao(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const cultura = String(formData.get("cultura") ?? "").trim();
  const fazendaId = String(formData.get("fazendaId") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!nome) errors.nome = "Nome é obrigatório";
  if (!fazendaId) errors.fazendaId = "Selecione a unidade";

  const areaHa = num(formData.get("areaHa"));
  if (areaHa !== null && areaHa < 0) errors.areaHa = "Valor inválido";

  return {
    errors,
    fazendaId,
    data: {
      nome,
      cultura: cultura || null,
      areaHa: areaHa ?? 0,
      lat: num(formData.get("lat")),
      lng: num(formData.get("lng")),
    },
  };
}

async function fazendaPertenceOrg(fazendaId: string, orgId: string) {
  const f = await db.fazenda.findFirst({ where: { id: fazendaId, organizacaoId: orgId }, select: { id: true } });
  return !!f;
}

export async function criarTalhao(_prev: FormState, formData: FormData): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para cadastrar áreas." };
  }

  const { errors, data, fazendaId } = parseTalhao(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  if (!(await fazendaPertenceOrg(fazendaId, orgId))) return { ok: false, errors: { fazendaId: "Unidade inválida" } };

  try {
    await db.talhao.create({ data: { ...data, fazendaId, organizacaoId: orgId } });
  } catch {
    return { ok: false, message: "Erro ao salvar área. Tente novamente." };
  }

  revalidatePath("/areas");
  return { ok: true, message: "Área cadastrada" };
}

export async function atualizarTalhao(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para editar áreas." };
  }

  const { errors, data, fazendaId } = parseTalhao(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  if (!(await fazendaPertenceOrg(fazendaId, orgId))) return { ok: false, errors: { fazendaId: "Unidade inválida" } };

  try {
    const res = await db.talhao.updateMany({ where: { id, organizacaoId: orgId }, data: { ...data, fazendaId } });
    if (res.count === 0) return { ok: false, message: "Área não encontrada." };
  } catch {
    return { ok: false, message: "Erro ao atualizar área." };
  }

  revalidatePath("/areas");
  return { ok: true, message: "Área atualizada" };
}

export async function deletarTalhao(id: string): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para excluir áreas." };
  }

  try {
    const res = await db.talhao.deleteMany({ where: { id, organizacaoId: orgId } });
    if (res.count === 0) return { ok: false, message: "Área não encontrada." };
  } catch {
    return { ok: false, message: "Erro ao excluir área." };
  }

  revalidatePath("/areas");
  return { ok: true, message: "Área excluída" };
}
