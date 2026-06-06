import { db } from "@/lib/db";

export async function getInsumos() {
  return db.insumo.findMany({
    include: { fornecedor: true },
    orderBy: { nome: "asc" },
  });
}

export async function getInsumo(id: string) {
  return db.insumo.findUnique({
    where: { id },
    include: { fornecedor: true },
  });
}

/** Opções para o <select> de fornecedor no form de insumo (UI/Gemini). */
export async function getFornecedorOptions() {
  return db.fornecedor.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
}

export type InsumoListItem = Awaited<ReturnType<typeof getInsumos>>[number];
