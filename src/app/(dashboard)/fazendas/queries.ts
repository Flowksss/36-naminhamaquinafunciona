import { db } from "@/lib/db";
import { requireOrgId } from "@/lib/session";

export async function getFazendas() {
  const orgId = await requireOrgId();
  return db.fazenda.findMany({
    where: { organizacaoId: orgId },
    include: { _count: { select: { safras: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFazenda(id: string) {
  const orgId = await requireOrgId();
  return db.fazenda.findFirst({
    where: { id, organizacaoId: orgId },
    include: { safras: true },
  });
}

export type FazendaListItem = Awaited<ReturnType<typeof getFazendas>>[number];
