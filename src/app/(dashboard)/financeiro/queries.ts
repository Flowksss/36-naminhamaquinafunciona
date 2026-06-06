import { db } from "@/lib/db";

export async function getTransacoes() {
  return db.transacao.findMany({
    include: {
      safra: { include: { fazenda: true } },
      fornecedor: true,
      cliente: true,
    },
    orderBy: { data: "desc" },
    take: 100,
  });
}

export async function getTransacao(id: string) {
  return db.transacao.findUnique({
    where: { id },
    include: { safra: { include: { fazenda: true } }, fornecedor: true, cliente: true },
  });
}

/** Opções para os <select> do form de transação (UI/Gemini). */
export async function getTransacaoOptions() {
  const [safras, fornecedores, clientes] = await Promise.all([
    db.safra.findMany({
      select: { id: true, cultura: true, fazenda: { select: { nome: true } } },
      orderBy: { dataPlantio: "desc" },
    }),
    db.fornecedor.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    db.cliente.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);
  return { safras, fornecedores, clientes };
}

export type TransacaoListItem = Awaited<ReturnType<typeof getTransacoes>>[number];
