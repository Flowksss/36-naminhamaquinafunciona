import { db } from "@/lib/db";
import { requireOrgId } from "@/lib/session";

export async function getAtivoProfile(id: string) {
  const orgId = await requireOrgId();
  const ativo = await db.ativo.findFirst({
    where: { id, organizacaoId: orgId },
    include: { fazenda: { select: { nome: true } } },
  });
  if (!ativo) return null;

  const [historico, recomendacoes, frota] = await Promise.all([
    db.posicaoGPS.findMany({
      where: { ativoId: id },
      orderBy: { tick: "desc" },
      take: 15,
      select: { tick: true, consumo: true, nivel: true, lat: true, lng: true },
    }),
    db.recomendacao.findMany({ where: { ativoId: id, status: "ATIVA" } }),
    db.ativo.findMany({ where: { organizacaoId: orgId }, select: { consumoAtual: true } }),
  ]);

  const mediaFrota = frota.length ? frota.reduce((s, a) => s + a.consumoAtual, 0) / frota.length : 0;
  const diffPct = mediaFrota > 0 ? Math.round(((ativo.consumoAtual - mediaFrota) / mediaFrota) * 100) : 0;

  return {
    ativo,
    historico: historico.reverse(),
    recomendacoes,
    benchmark: {
      mediaFrota: Number(mediaFrota.toFixed(1)),
      consumoAtivo: ativo.consumoAtual,
      diffPct, // >0 = consome acima da média da frota
    },
  };
}

export type AtivoProfile = NonNullable<Awaited<ReturnType<typeof getAtivoProfile>>>;
