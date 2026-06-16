import { db } from "@/lib/db";
import { requireOrgId } from "@/lib/session";
import { getFazendaContext } from "@/lib/fazenda-context";

export async function getAreasPageData() {
  const orgId = await requireOrgId();
  const ctx = getFazendaContext();

  const [talhoes, fazendas] = await Promise.all([
    db.talhao.findMany({
      where: { organizacaoId: orgId, ...(ctx ? { fazendaId: ctx } : {}) },
      include: { fazenda: { select: { nome: true } } },
      orderBy: { nome: "asc" },
    }),
    db.fazenda.findMany({ where: { organizacaoId: orgId }, select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
  ]);

  return {
    fazendas,
    talhoes: talhoes.map((t) => ({
      id: t.id,
      nome: t.nome,
      cultura: t.cultura,
      areaHa: t.areaHa,
      fazendaId: t.fazendaId,
      unidade: t.fazenda?.nome ?? null,
      lat: t.lat,
      lng: t.lng,
    })),
  };
}

export type AreasPageData = Awaited<ReturnType<typeof getAreasPageData>>;
export type TalhaoItem = AreasPageData["talhoes"][number];
export type UnidadeOpcao = AreasPageData["fazendas"][number];
