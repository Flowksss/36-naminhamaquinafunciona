"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { FormState } from "@/lib/types";

function parseFornecedor(formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim();
  const endereco = String(formData.get("endereco") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!nome) errors.nome = "Nome é obrigatório";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Email inválido";

  return {
    errors,
    data: {
      nome,
      cnpj: cnpj || null,
      email: email || null,
      telefone: telefone || null,
      endereco: endereco || null,
    },
  };
}

export async function criarFornecedor(_prev: FormState, formData: FormData): Promise<FormState> {
  const { errors, data } = parseFornecedor(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  try {
    await db.fornecedor.create({ data });
  } catch {
    return { ok: false, message: "Erro ao salvar. CNPJ pode já estar cadastrado." };
  }
  revalidatePath("/fornecedores");
  return { ok: true, message: "Fornecedor criado com sucesso" };
}

export async function atualizarFornecedor(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { errors, data } = parseFornecedor(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  try {
    await db.fornecedor.update({ where: { id }, data });
  } catch {
    return { ok: false, message: "Erro ao atualizar fornecedor." };
  }
  revalidatePath("/fornecedores");
  return { ok: true, message: "Fornecedor atualizado" };
}

export async function deletarFornecedor(id: string): Promise<FormState> {
  try {
    await db.fornecedor.delete({ where: { id } });
  } catch {
    return { ok: false, message: "Erro ao excluir. Verifique insumos/transações vinculados." };
  }
  revalidatePath("/fornecedores");
  return { ok: true, message: "Fornecedor excluído" };
}
