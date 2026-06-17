// Contrato único de telemetria. Hoje só existe o ManualProvider (Fase 0);
// amanhã LeafProvider / JohnDeereProvider / CnhProvider implementam a mesma
// interface e o resto do app não muda. A ingestão (ingest.ts) consome
// LeituraTelemetria venha de onde vier.

export type LeituraTelemetria = {
  ativoId: string;            // nosso Ativo.id (provedores mapeiam por externalId -> ativoId)
  consumoAtual?: number;      // L/h instantâneo
  nivelCombustivel?: number;  // % 0-100
  lat?: number;
  lng?: number;
  horasOperadas?: number;     // horas desde a última leitura (incrementa horímetro/manutenção)
  timestamp: Date;
};

export interface TelemetryProvider {
  readonly nome: string;
  /** Busca leituras novas para os ativos da organização. */
  fetchLeituras(orgId: string): Promise<LeituraTelemetria[]>;
}

/**
 * Provedor manual: não há nuvem para consultar — as leituras entram pela UI
 * (form "Nova leitura" → action registrarLeitura → ingest). O poll automático
 * não retorna nada.
 */
export const manualProvider: TelemetryProvider = {
  nome: "Manual",
  async fetchLeituras() {
    return [];
  },
};
