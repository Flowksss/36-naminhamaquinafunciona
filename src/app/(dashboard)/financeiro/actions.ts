"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { FormState } from "@/lib/types";

const TIPOS = ["RECEITA", "DESPESA"] as const;

function parseTransacao(formData: FormData) {
  const tipoRaw = String(formData.get("tipo") ?? "").trim();
  const valorRaw = String(formData.get("valor") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const dataRaw = String(formData.get("data") ?? "").trim();
  const safraId = String(formData.get("safraId") ?? "").trim();
  const fornecedorId = String(formData.get("fornecedorId") ?? "").trim();
  const clienteId = String(formData.get("clienteId") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!(TIPOS as readonly string[]).includes(tipoRaw)) errors.tipo = "Selecione Receita ou Despesa";
  if (!descricao) errors.descricao = "Descrição é obrigatória";
  if (!dataRaw) errors.data = "Data é obrigatória";

  const valor = Number(valorRaw.replace(",", "."));
  if (!valorRaw) errors.valor = "Valor é obrigatório";
  else if (Number.isNaN(valor) || valor <= 0) errors.valor = "Valor deve ser positivo";

  return {
    errors,
    data: {
      tipo: tipoRaw as (typeof TIPOS)[number],
      valor,
      descricao,
      data: new Date(dataRaw),
      safraId: safraId || null,
      fornecedorId: fornecedorId || null,
      clienteId: clienteId || null,
    },
  };
}

export async function criarTransacao(_prev: FormState, formData: FormData): Promise<FormState> {
  const { errors, data } = parseTransacao(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  try {
    await db.transacao.create({ data });
  } catch {
    return { ok: false, message: "Erro ao salvar transação." };
  }
  revalidatePath("/financeiro");
  return { ok: true, message: "Transação registrada com sucesso" };
}

export async function atualizarTransacao(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { errors, data } = parseTransacao(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  try {
    await db.transacao.update({ where: { id }, data });
  } catch {
    return { ok: false, message: "Erro ao atualizar transação." };
  }
  revalidatePath("/financeiro");
  return { ok: true, message: "Transação atualizada" };
}

export async function deletarTransacao(id: string): Promise<FormState> {
  try {
    await db.transacao.delete({ where: { id } });
  } catch {
    return { ok: false, message: "Erro ao excluir transação." };
  }
  revalidatePath("/financeiro");
  return { ok: true, message: "Transação excluída" };
}
