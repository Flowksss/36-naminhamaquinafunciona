// Motor de regras — inteligência operacional da frota.
// FUNÇÃO PURA: sem DB, sem efeitos. Recebe estado, devolve recomendações.
// Testável isolada. O caller (action) adiciona tick + persiste.

export type AtivoEstado = {
  id: string;
  identificador: string;
  status: "EM_OPERACAO" | "NA_FILA" | "EM_TRANSITO" | "OCIOSO" | "MANUTENCAO";
  fazendaId: string | null;
  consumoMedio: number;
  consumoAtual: number;
  nivelCombustivel: number | null;
  horasDesdeManutencao: number;
};

export type FazendaEstado = { id: string; nome: string };

export type RecomendacaoGerada = {
  tipo: "REDESPACHO" | "FILA_ALTA" | "ALERTA_CONSUMO" | "ABASTECIMENTO" | "MANUTENCAO";
  severidade: "BAIXA" | "MEDIA" | "ALTA";
  mensagem: string;
  ativoId?: string;
  fazendaOrigemId?: string;
  fazendaDestinoId?: string;
};

// --- limiares (ajustáveis p/ demo) ---
export const LIMITE_FILA = 4; // fila a partir daqui = alta
export const TOL_CONSUMO = 0.2; // 20% acima da média = alerta
export const LIMITE_COMBUSTIVEL = 15; // % abaixo daqui = abastecer
export const LIMITE_MANUTENCAO = 250; // horas de operação antes da manutenção preventiva

export function gerarRecomendacoes(
  ativos: AtivoEstado[],
  fazendas: FazendaEstado[]
): RecomendacaoGerada[] {
  const recs: RecomendacaoGerada[] = [];
  const nome = (id: string | null) => fazendas.find((f) => f.id === id)?.nome ?? "Unidade";

  // fila por unidade
  const filaPorFazenda = new Map<string, number>();
  for (const a of ativos) {
    if (a.status === "NA_FILA" && a.fazendaId) {
      filaPorFazenda.set(a.fazendaId, (filaPorFazenda.get(a.fazendaId) ?? 0) + 1);
    }
  }

  // unidades com folga (ociosos) para redespacho
  const ociososPorFazenda = new Map<string, AtivoEstado[]>();
  for (const a of ativos) {
    if (a.status === "OCIOSO" && a.fazendaId) {
      const arr = ociososPorFazenda.get(a.fazendaId) ?? [];
      arr.push(a);
      ociososPorFazenda.set(a.fazendaId, arr);
    }
  }

  // REGRA 1 — fila alta + redespacho
  for (const [fazId, fila] of filaPorFazenda) {
    if (fila >= LIMITE_FILA) {
      const sev = fila >= LIMITE_FILA + 3 ? "ALTA" : fila >= LIMITE_FILA + 1 ? "MEDIA" : "BAIXA";
      recs.push({
        tipo: "FILA_ALTA",
        severidade: sev,
        mensagem: `Fila de ${fila} ativos em ${nome(fazId)}. Capacidade saturada.`,
        fazendaOrigemId: fazId,
      });

      // procura unidade com ocioso para puxar capacidade / redistribuir
      const destino = [...ociososPorFazenda.entries()].find(([fid]) => fid !== fazId);
      if (destino) {
        const [destId, ociosos] = destino;
        const ativo = ociosos[0];
        recs.push({
          tipo: "REDESPACHO",
          severidade: sev === "ALTA" ? "ALTA" : "MEDIA",
          mensagem: `Redespachar ${ativo.identificador} (ocioso em ${nome(destId)}) para aliviar fila em ${nome(fazId)}.`,
          ativoId: ativo.id,
          fazendaOrigemId: destId,
          fazendaDestinoId: fazId,
        });
      }
    }
  }

  // REGRA 2 — consumo acima da média
  for (const a of ativos) {
    if (a.consumoMedio > 0 && a.consumoAtual > a.consumoMedio * (1 + TOL_CONSUMO)) {
      const excesso = Math.round(((a.consumoAtual - a.consumoMedio) / a.consumoMedio) * 100);
      const sev = excesso >= 40 ? "ALTA" : excesso >= 25 ? "MEDIA" : "BAIXA";
      recs.push({
        tipo: "ALERTA_CONSUMO",
        severidade: sev,
        mensagem: `${a.identificador} consome ${excesso}% acima da média (${a.consumoAtual.toFixed(1)} vs ${a.consumoMedio.toFixed(1)} L/h). Verificar.`,
        ativoId: a.id,
        fazendaOrigemId: a.fazendaId ?? undefined,
      });
    }
  }

  // REGRA 3 — combustível baixo
  for (const a of ativos) {
    if (a.nivelCombustivel !== null && a.nivelCombustivel < LIMITE_COMBUSTIVEL) {
      recs.push({
        tipo: "ABASTECIMENTO",
        severidade: a.nivelCombustivel < 7 ? "ALTA" : "MEDIA",
        mensagem: `${a.identificador} com ${a.nivelCombustivel.toFixed(0)}% de combustível. Abastecer antes de parar a operação.`,
        ativoId: a.id,
        fazendaOrigemId: a.fazendaId ?? undefined,
      });
    }
  }

  // REGRA 4 — manutenção preventiva
  for (const a of ativos) {
    if (a.horasDesdeManutencao >= LIMITE_MANUTENCAO) {
      const excesso = a.horasDesdeManutencao - LIMITE_MANUTENCAO;
      const sev = excesso >= 100 ? "ALTA" : excesso >= 40 ? "MEDIA" : "BAIXA";
      recs.push({
        tipo: "MANUTENCAO",
        severidade: sev,
        mensagem: `${a.identificador} com ${Math.round(a.horasDesdeManutencao)}h desde a última manutenção (limite ${LIMITE_MANUTENCAO}h). Agendar preventiva — reativa custa até 3x mais.`,
        ativoId: a.id,
        fazendaOrigemId: a.fazendaId ?? undefined,
      });
    }
  }

  // ordena por severidade (ALTA primeiro)
  const ordem = { ALTA: 0, MEDIA: 1, BAIXA: 2 };
  return recs.sort((x, y) => ordem[x.severidade] - ordem[y.severidade]);
}
