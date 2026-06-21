import { db } from "@/lib/db";
import type { TelemetryProvider, LeituraTelemetria } from "./provider";

const SIMWORLD_URL = process.env.SIMWORLD_URL ?? "http://localhost:3100";

type SimMachine = {
  id: string;
  lat: number;
  lng: number;
  fuelLevelPct: number;
  fuelRateLh: number;
  status: string;
};
type SimWorld = { machines: SimMachine[] };

/**
 * Provedor que consome o CCT SimWorld (mundo de simulação) pelo feed unificado
 * /api/world. Mapeia cada máquina virtual (externalId) para o Ativo do tenant
 * marcado com provedorTelemetria=SIMULATOR. É a primeira implementação real da
 * interface TelemetryProvider — Leaf/JD/CNH seguem o mesmo molde.
 */
export const simulatorProvider: TelemetryProvider = {
  nome: "Simulator",
  async fetchLeituras(orgId: string): Promise<LeituraTelemetria[]> {
    const ativos = await db.ativo.findMany({
      where: { organizacaoId: orgId, provedorTelemetria: "SIMULATOR", externalId: { not: null } },
      select: { id: true, externalId: true },
    });
    if (ativos.length === 0) return [];

    const res = await fetch(`${SIMWORLD_URL}/api/world`, { cache: "no-store" });
    if (!res.ok) throw new Error(`SimWorld respondeu ${res.status}`);
    const world = (await res.json()) as SimWorld;
    const byExternal = new Map(world.machines.map((m) => [m.id, m]));

    const now = new Date();
    const leituras: LeituraTelemetria[] = [];
    for (const a of ativos) {
      const m = byExternal.get(a.externalId!);
      if (!m) continue;
      leituras.push({
        ativoId: a.id,
        consumoAtual: m.fuelRateLh,
        nivelCombustivel: m.fuelLevelPct,
        lat: m.lat,
        lng: m.lng,
        timestamp: now,
      });
    }
    return leituras;
  },
};
