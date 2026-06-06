"use client";

import { useState } from "react";
import { TransacaoForm } from "./transacao-form";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, X } from "lucide-react";

type SafraOption = { id: string; cultura: string; fazenda: { nome: string } };
type Option = { id: string; nome: string };

interface FinanceiroClientProps {
  transacoes: any[];
  options: { safras: SafraOption[]; fornecedores: Option[]; clientes: Option[] };
}

export function FinanceiroClient({ transacoes, options }: FinanceiroClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const totalReceitas = transacoes
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = transacoes
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  return (
    <>
      <header className="od-topbar mb-6">
        <h1 className="od-title">Financeiro <span>Fluxo de Caixa</span></h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="od-btn"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}
          {isFormOpen ? "Cancelar" : "Nova Transação"}
        </button>
      </header>

      <div className="od-kpis mb-8">
        <div className="od-panel od-kpi">
          <span className="od-kpilabel">Receitas</span>
          <span className="od-kpivalue text-[var(--od-accent)]">{formatCurrency(totalReceitas)}</span>
        </div>
        <div className="od-panel od-kpi">
          <span className="od-kpilabel">Despesas</span>
          <span className="od-kpivalue text-[var(--od-red)]">{formatCurrency(totalDespesas)}</span>
        </div>
        <div className="od-panel od-kpi">
          <span className="od-kpilabel">Saldo</span>
          <span className={`od-kpivalue ${saldo >= 0 ? "text-[var(--od-accent)]" : "text-[var(--od-red)]"}`}>
            {formatCurrency(saldo)}
          </span>
        </div>
      </div>

      {isFormOpen && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <TransacaoForm options={options} onSuccess={() => setIsFormOpen(false)} />
        </div>
      )}

      <div className="od-panel">
        <div className="od-panelhead">
          <h2>Transações</h2>
          <span className="od-muted">{transacoes.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="od-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Safra</th>
                <th className="text-center">Tipo</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 od-muted">Nenhuma transação registrada</td>
                </tr>
              ) : (
                transacoes.map((t) => (
                  <tr key={t.id}>
                    <td className="od-muted od-mono">{formatDate(t.data)}</td>
                    <td className="font-medium">{t.descricao}</td>
                    <td className="od-muted text-xs">
                      {t.safra ? `${t.safra.fazenda.nome} – ${t.safra.cultura}` : "—"}
                    </td>
                    <td className="text-center">
                      <span
                        className={`od-badge ${
                          t.tipo === "RECEITA" ? "od-badge-accent" : "bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]"
                        }`}
                      >
                        {t.tipo === "RECEITA" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td className={`text-right od-mono font-bold ${t.tipo === "RECEITA" ? "text-[var(--od-accent)]" : "text-[var(--od-red)]"}`}>
                      {t.tipo === "DESPESA" && "− "}
                      {formatCurrency(t.valor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
