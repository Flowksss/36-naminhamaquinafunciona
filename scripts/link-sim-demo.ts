// Liga as 3 primeiras máquinas da Agro Norte (AN-01..03) ao CCT SimWorld
// (provedor SIMULATOR, externalId M-001..003) no banco atual, sem reseed.
// Útil para preparar a demo do fluxo de telemetria sem apagar dados.
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const an01 = await db.ativo.findFirst({ where: { identificador: "AN-01" }, select: { organizacaoId: true } });
  if (!an01) throw new Error("AN-01 não encontrada — rode o seed primeiro.");
  const orgId = an01.organizacaoId;

  for (const i of [1, 2, 3]) {
    await db.ativo.updateMany({
      where: { identificador: `AN-0${i}`, organizacaoId: orgId },
      data: { provedorTelemetria: "SIMULATOR", externalId: `M-00${i}` },
    });
  }

  const linked = await db.ativo.findMany({
    where: { organizacaoId: orgId, provedorTelemetria: "SIMULATOR" },
    select: { identificador: true, externalId: true, consumoAtual: true, nivelCombustivel: true },
  });
  console.log("orgId =", orgId);
  console.log("ligadas ao SimWorld:", JSON.stringify(linked));
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
