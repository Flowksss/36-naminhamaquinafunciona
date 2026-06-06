import { db } from "@/lib/db";

export async function getFornecedores() {
  return db.fornecedor.findMany({
    include: { _count: { select: { insumos: true } } },
    orderBy: { nome: "asc" },
  });
}

export async function getFornecedor(id: string) {
  return db.fornecedor.findUnique({ where: { id } });
}

export type FornecedorListItem = Awaited<ReturnType<typeof getFornecedores>>[number];
