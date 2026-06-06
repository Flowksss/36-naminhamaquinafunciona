"use client";

import { useState } from "react";
import { avancarSimulacao } from "./actions";
import type { EstadoFrota } from "./queries";
import { Play, Loader2, AlertTriangle, Fuel, ArrowRightLeft, Users, Truck } from "lucide-react";

const sevStyle: Record<string, string> = {
  ALTA: "border-red-300 bg-red-50",
  MEDIA: "border-amber-300 bg-amber-50",
  BAIXA: "border-blue-300 bg-blue-50",
};
const sevBadge: Record<string, string> = {
  ALTA: "bg-red-600 text-white",
  MEDIA: "bg-amber-500 text-white",
  BAIXA: "bg-blue-500 text-white",
};
const tipoIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  REDESPACHO: ArrowRightLeft,
  FILA_ALTA: Users,
  ALERTA_CONSUMO: AlertTriangle,
  ABASTECIMENTO: Fuel,
};
const tipoLabel: Record<string, string> = {
  REDESPACHO: "Redespacho",
  FILA_ALTA: "Fila Alta",
  ALERTA_CONSUMO: "Consumo",
  ABASTECIMENTO: "Combustível",
};
const statusLabel: Record<string, string> = {
  EM_OPERACAO: "Em operação",
  NA_FILA: "Na fila",
  EM_TRANSITO: "Em trânsito",
  OCIOSO: "Ocioso",
  MANUTENCAO: "Manutenção",
};
const statusColor: Record<string, string> = {
  EM_OPERACAO: "bg-green-100 text-green-700",
  NA_FILA: "bg-amber-100 text-amber-700",
  EM_TRANSITO: "bg-blue-100 text-blue-700",
  OCIOSO: "bg-gray-100 text-gray-600",
  MANUTENCAO: "bg-red-100 text-red-700",
};

const ordemSev = { ALTA: 0, MEDIA: 1, BAIXA: 2 } as const;

export function OperacaoClient({ estado }: { estado: EstadoFrota }) {
  const [pending, setPending] = useState(false);

  async function handleAvancar() {
    setPending(true);
    try {
      await avancarSimulacao();
    } finally {
      setPending(false);
    }
  }

  const recs = [...estado.recomendacoes].sort(
    (a, b) => ordemSev[a.severidade as keyof typeof ordemSev] - ordemSev[b.severidade as keyof typeof ordemSev]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Centro de Operações</h1>
          <p className="text-sm text-muted-foreground">
            Motor de decisão · ciclo <span className="font-semibold">#{estado.tick}</span>
          </p>
        </div>
        <button
          onClick={handleAvancar}
          disabled={pending}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {pending ? "Processando..." : "Avançar Simulação"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recomendações — centro do produto */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Recomendações ({recs.length})
          </h2>
          {recs.length === 0 ? (
            <div className="border rounded-lg p-8 text-center text-muted-foreground bg-white">
              Nenhuma recomendação ativa. Avance a simulação para gerar decisões.
            </div>
          ) : (
            <div className="space-y-3">
              {recs.map((r) => {
                const Icon = tipoIcon[r.tipo] ?? AlertTriangle;
                return (
                  <div key={r.id} className={`border rounded-lg p-4 flex items-start gap-3 ${sevStyle[r.severidade]}`}>
                    <div className="mt-0.5">
                      <Icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${sevBadge[r.severidade]}`}>
                          {r.severidade}
                        </span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {tipoLabel[r.tipo]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{r.mensagem}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Estado da frota */}
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Fila por unidade</h2>
            <div className="space-y-2">
              {estado.filaPorUnidade.map((u) => (
                <div key={u.id} className="flex items-center justify-between border rounded-lg p-3 bg-white">
                  <div>
                    <p className="text-sm font-medium">{u.nome}</p>
                    <p className="text-xs text-muted-foreground">{u.ativos} ativos</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      u.fila >= 4 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    fila {u.fila}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
              <Truck className="h-4 w-4" /> Frota ({estado.ativos.length})
            </h2>
            <div className="border rounded-lg overflow-hidden bg-white">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-gray-100">
                  {estado.ativos.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{a.identificador}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 ${statusColor[a.status]}`}>
                          {statusLabel[a.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-gray-600">
                        {a.consumoAtual.toFixed(1)} L/h
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={(a.nivelCombustivel ?? 0) < 15 ? "text-red-600 font-semibold" : "text-gray-600"}>
                          {a.nivelCombustivel ?? 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
