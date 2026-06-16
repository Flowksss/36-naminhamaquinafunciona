import { getDashboardStats, getEconomia, getAtivosPorStatus } from "../dashboard/queries";
import { getEstadoFrota } from "../operacao/queries";
import { getPlanoInfo } from "../planos/queries";

/** Bundle de dados para todos os blocos do painel personalizável. */
export async function getPainelData() {
  const [stats, economia, statusDist, frota, plano] = await Promise.all([
    getDashboardStats(),
    getEconomia(),
    getAtivosPorStatus(),
    getEstadoFrota(),
    getPlanoInfo(),
  ]);
  return { stats, economia, statusDist, frota, plano };
}

export type PainelData = Awaited<ReturnType<typeof getPainelData>>;
