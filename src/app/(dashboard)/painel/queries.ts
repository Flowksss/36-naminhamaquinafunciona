import { getDashboardStats, getEconomia, getAtivosPorStatus, getSnapshots } from "../dashboard/queries";
import { getEstadoFrota } from "../operacao/queries";
import { getPlanoInfo } from "../planos/queries";

/** Bundle de dados para todos os blocos do painel personalizável. */
export async function getPainelData() {
  const [stats, economia, statusDist, snapshots, frota, plano] = await Promise.all([
    getDashboardStats(),
    getEconomia(),
    getAtivosPorStatus(),
    getSnapshots(),
    getEstadoFrota(),
    getPlanoInfo(),
  ]);
  return { stats, economia, statusDist, snapshots, frota, plano };
}

export type PainelData = Awaited<ReturnType<typeof getPainelData>>;
