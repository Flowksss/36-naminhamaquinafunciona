import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { LeituraTelemetria } from "./provider";

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Aplica UMA leitura de telemetria a um ativo (seam único de ingestão).
 * Atualiza os campos vivos (consumo/combustível/posição/horas) + ultimaLeitura
 * e grava um ponto em PosicaoGPS para o histórico/gráfico. Tanto o form manual
 * quanto o poll de um provedor real chamam exatamente esta função.
 *
 * Isolamento: valida que o ativo pertence à org (o caller já autenticou).
 */
export async function aplicarLeitura(orgId: string, l: LeituraTelemetria): Promise<{ tick: number }> {
  const ativo = await db.ativo.findFirst({ where: { id: l.ativoId, organizacaoId: orgId } });
  if (!ativo) throw new Error("Ativo não encontrado");

  const horas = l.horasOperadas && l.horasOperadas > 0 ? l.horasOperadas : 0;

  const data: Prisma.AtivoUpdateInput = { ultimaLeitura: l.timestamp };
  if (l.consumoAtual != null) data.consumoAtual = l.consumoAtual;
  if (l.nivelCombustivel != null) data.nivelCombustivel = clamp(l.nivelCombustivel, 0, 100);
  if (l.lat != null) data.lat = l.lat;
  if (l.lng != null) data.lng = l.lng;
  if (horas > 0) {
    data.horasDesdeManutencao = ativo.horasDesdeManutencao + horas;
    data.horimetroTotal = ativo.horimetroTotal + horas;
  }

  const ultimo = await db.posicaoGPS.findFirst({
    where: { ativoId: ativo.id },
    orderBy: { tick: "desc" },
    select: { tick: true },
  });
  const tick = (ultimo?.tick ?? 0) + 1;

  await db.$transaction([
    db.ativo.update({ where: { id: ativo.id }, data }),
    db.posicaoGPS.create({
      data: {
        ativoId: ativo.id,
        lat: l.lat ?? ativo.lat ?? 0,
        lng: l.lng ?? ativo.lng ?? 0,
        consumo: l.consumoAtual ?? ativo.consumoAtual,
        nivel: l.nivelCombustivel ?? ativo.nivelCombustivel,
        tick,
      },
    }),
  ]);

  return { tick };
}
