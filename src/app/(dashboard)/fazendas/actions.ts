"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { FormState } from "@/lib/types";
import { requireRole } from "@/lib/session";

// --- validação leve (sem dep externa) ---
function parseFazenda(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const localizacao = String(formData.get("localizacao") ?? "").trim();
  const areaRaw = String(formData.get("area") ?? "").trim();
  const tipoSolo = String(formData.get("tipoSolo") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!nome) errors.nome = "Nome é obrigatório";
  if (!localizacao) errors.localizacao = "Localização é obrigatória";

  const area = Number(areaRaw.replace(",", "."));
  if (!areaRaw) errors.area = "Área é obrigatória";
  else if (Number.isNaN(area) || area <= 0) errors.area = "Área deve ser um número positivo";

  return {
    errors,
    data: { nome, localizacao, area, tipoSolo: tipoSolo || null },
  };
}

export async function criarFazenda(_prev: FormState, formData: FormData): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para criar fazendas." };
  }

  const { errors, data } = parseFazenda(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  try {
    await db.fazenda.create({ data: { ...data, organizacaoId: orgId } });
  } catch {
    return { ok: false, message: "Erro ao salvar fazenda. Tente novamente." };
  }

  revalidatePath("/fazendas");
  return { ok: true, message: "Fazenda criada com sucesso" };
}

export async function atualizarFazenda(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para editar fazendas." };
  }

  const { errors, data } = parseFazenda(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  try {
    // updateMany com filtro de org garante que só atualiza fazenda do próprio tenant
    const res = await db.fazenda.updateMany({ where: { id, organizacaoId: orgId }, data });
    if (res.count === 0) return { ok: false, message: "Fazenda não encontrada." };
  } catch {
    return { ok: false, message: "Erro ao atualizar fazenda." };
  }

  revalidatePath("/fazendas");
  return { ok: true, message: "Fazenda atualizada" };
}

export async function deletarFazenda(id: string): Promise<FormState> {
  let orgId: string;
  try {
    ({ orgId } = await requireRole("ADMIN", "GERENTE"));
  } catch {
    return { ok: false, message: "Você não tem permissão para excluir fazendas." };
  }

  try {
    const res = await db.fazenda.deleteMany({ where: { id, organizacaoId: orgId } });
    if (res.count === 0) return { ok: false, message: "Fazenda não encontrada." };
  } catch {
    return { ok: false, message: "Erro ao excluir. Verifique se há safras vinculadas." };
  }

  revalidatePath("/fazendas");
  return { ok: true, message: "Fazenda excluída" };
}
