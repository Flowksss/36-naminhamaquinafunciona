// Teste do motor de regras (função pura, sem DB). Rode: npx tsx scripts/engine-test.ts
import { gerarRecomendacoes, type AtivoEstado, type FazendaEstado } from "../src/lib/fleet/engine";

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean) => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  cond ? pass++ : fail++;
};

const FAZ: FazendaEstado[] = [{ id: "f1", nome: "Unidade 1" }, { id: "f2", nome: "Unidade 2" }];
const A = (over: Partial<AtivoEstado> & { id: string }): AtivoEstado => ({
  identificador: over.id, status: "OCIOSO", fazendaId: "f1",
  consumoMedio: 10, consumoAtual: 10, nivelCombustivel: 80, horasDesdeManutencao: 0,
  ...over,
});
const tipos = (recs: ReturnType<typeof gerarRecomendacoes>) => recs.map((r) => r.tipo);

// vazio
ok("sem ativos → sem recomendações", gerarRecomendacoes([], FAZ).length === 0);

// consumo
ok("consumo 1.3x da média → ALERTA_CONSUMO", tipos(gerarRecomendacoes([A({ id: "a", consumoAtual: 13 })], FAZ)).includes("ALERTA_CONSUMO"));
ok("consumo 1.1x (sob tolerância) → sem alerta", !tipos(gerarRecomendacoes([A({ id: "a", consumoAtual: 11 })], FAZ)).includes("ALERTA_CONSUMO"));

// combustível
const baixo = gerarRecomendacoes([A({ id: "a", nivelCombustivel: 10 })], FAZ);
ok("combustível 10% → ABASTECIMENTO", tipos(baixo).includes("ABASTECIMENTO"));
const critico = gerarRecomendacoes([A({ id: "a", nivelCombustivel: 5 })], FAZ).find((r) => r.tipo === "ABASTECIMENTO");
ok("combustível 5% → severidade ALTA", critico?.severidade === "ALTA");
ok("combustível 80% → sem abastecimento", !tipos(gerarRecomendacoes([A({ id: "a", nivelCombustivel: 80 })], FAZ)).includes("ABASTECIMENTO"));

// manutenção (e skip quando já em manutenção)
ok("300h desde manut. → MANUTENCAO", tipos(gerarRecomendacoes([A({ id: "a", horasDesdeManutencao: 300 })], FAZ)).includes("MANUTENCAO"));
ok("já em MANUTENCAO → não re-recomenda", !tipos(gerarRecomendacoes([A({ id: "a", horasDesdeManutencao: 300, status: "MANUTENCAO" })], FAZ)).includes("MANUTENCAO"));

// fila alta + redespacho
const fila = [
  A({ id: "q1", status: "NA_FILA", fazendaId: "f1" }),
  A({ id: "q2", status: "NA_FILA", fazendaId: "f1" }),
  A({ id: "q3", status: "NA_FILA", fazendaId: "f1" }),
  A({ id: "q4", status: "NA_FILA", fazendaId: "f1" }),
  A({ id: "livre", status: "OCIOSO", fazendaId: "f2" }),
];
const recsFila = tipos(gerarRecomendacoes(fila, FAZ));
ok("fila ≥ 4 → FILA_ALTA", recsFila.includes("FILA_ALTA"));
ok("ocioso em outra unidade → REDESPACHO", recsFila.includes("REDESPACHO"));
ok("fila de 1 → sem FILA_ALTA", !tipos(gerarRecomendacoes([A({ id: "a", status: "NA_FILA" })], FAZ)).includes("FILA_ALTA"));

// ordenação por severidade (ALTA primeiro)
const mix = gerarRecomendacoes([
  A({ id: "lo", nivelCombustivel: 13 }),   // ABASTECIMENTO MEDIA
  A({ id: "hi", nivelCombustivel: 4 }),    // ABASTECIMENTO ALTA
], FAZ);
ok("ordenado por severidade (ALTA primeiro)", mix[0]?.severidade === "ALTA");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
