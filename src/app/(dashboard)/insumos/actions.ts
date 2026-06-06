"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { FormState } from "@/lib/types";

const TIPOS = ["SEMENTE", "FERTILIZANTE", "DEFENSIVO", "COMBUSTIVEL", "OUTRO"] as const;

function parseInsumo(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const tipoRaw = String(formData.get("tipo") ?? "").trim();
  const unidade = String(formData.get("unidade") ?? "").trim();
  const estoqueRaw = String(formData.get("quantidadeEstoque") ?? "").trim();
  const minimoRaw = String(formData.get("estoqueMinimo") ?? "").trim();
  const precoRaw = String(formData.get("precoUnitario") ?? "").trim();
  const fornecedorId = String(formData.get("fornecedorId") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!nome) errors.nome = "Nome é obrigatório";
  if (!(TIPOS as readonly string[]).includes(tipoRaw)) errors.tipo = "Selecione um tipo válido";
  if (!unidade) errors.unidade = "Unidade é obrigatória (ex: kg, L, sc)";

  const quantidadeEstoque = estoqueRaw ? Number(estoqueRaw.replace(",", ".")) : 0;
  if (Number.isNaN(quantidadeEstoque) || quantidadeEstoque < 0)
    errors.quantidadeEstoque = "Estoque deve ser >= 0";

  const estoqueMinimo = minimoRaw ? Number(minimoRaw.replace(",", ".")) : 0;
  if (Number.isNaN(estoqueMinimo) || estoqueMinimo < 0)
    errors.estoqueMinimo = "Estoque mínimo deve ser >= 0";

  const precoUnitario = precoRaw ? Number(precoRaw.replace(",", ".")) : null;
  if (precoUnitario !== null && (Number.isNaN(precoUnitario) || precoUnitario < 0))
    errors.precoUnitario = "Preço inválido";

  return {
    errors,
    data: {
      nome,
      tipo: tipoRaw as (typeof TIPOS)[number],
      unidade,
      quantidadeEstoque,
      estoqueMinimo,
      precoUnitario,
      fornecedorId: fornecedorId || null,
    },
  };
}

export async function criarInsumo(_prev: FormState, formData: FormData): Promise<FormState> {
  const { errors, data } = parseInsumo(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  try {
    await db.insumo.create({ data });
  } catch {
    return { ok: false, message: "Erro ao salvar insumo." };
  }
  revalidatePath("/insumos");
  return { ok: true, message: "Insumo criado com sucesso" };
}

export async function atualizarInsumo(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { errors, data } = parseInsumo(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  try {
    await db.insumo.update({ where: { id }, data });
  } catch {
    return { ok: false, message: "Erro ao atualizar insumo." };
  }
  revalidatePath("/insumos");
  return { ok: true, message: "Insumo atualizado" };
}

export async function deletarInsumo(id: string): Promise<FormState> {
  try {
    await db.insumo.delete({ where: { id } });
  } catch {
    return { ok: false, message: "Erro ao excluir. Verifique movimentos de estoque vinculados." };
  }
  revalidatePath("/insumos");
  return { ok: true, message: "Insumo excluído" };
}
