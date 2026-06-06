import { db } from "@/lib/db";

export async function getFazendas() {
  return db.fazenda.findMany({
    include: { _count: { select: { safras: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFazenda(id: string) {
  return db.fazenda.findUnique({
    where: { id },
    include: { safras: true },
  });
}

export type FazendaListItem = Awaited<ReturnType<typeof getFazendas>>[number];
