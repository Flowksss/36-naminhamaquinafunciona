import { db } from "@/lib/db";
import { aplicarLeitura } from "./ingest";
import { simulatorProvider } from "./simulator-provider";

/**
 * Sincroniza a telemetria de UMA organização: puxa as leituras do provedor
 * (hoje o SimWorld) e aplica cada uma pelo seam de ingestão. Retorna quantas
 * máquinas foram atualizadas.
 */
export async function sincronizarOrg(orgId: string): Promise<number> {
  const leituras = await simulatorProvider.fetchLeituras(orgId);
  for (const l of leituras) {
    await aplicarLeitura(orgId, l);
  }
  return leituras.length;
}

/**
 * Sincroniza TODAS as organizações com máquinas ligadas ao simulador.
 * Usado pelo job de Cron (poll automático em produção).
 */
export async function sincronizarTodos(): Promise<{ orgs: number; leituras: number }> {
  const orgs = await db.ativo.findMany({
    where: { provedorTelemetria: "SIMULATOR", externalId: { not: null } },
    select: { organizacaoId: true },
    distinct: ["organizacaoId"],
  });
  let leituras = 0;
  for (const o of orgs) leituras += await sincronizarOrg(o.organizacaoId);
  return { orgs: orgs.length, leituras };
}
