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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isFormOpen ? "Cancelar" : "Nova Transação"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-gray-500">Receitas</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-gray-500">Despesas</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(saldo)}
          </p>
        </div>
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <TransacaoForm options={options} onSuccess={() => setIsFormOpen(false)} />
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Data</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Descrição</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Safra</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-900">Tipo</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-900">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transacoes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">Nenhuma transação registrada</td>
              </tr>
            ) : (
              transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">{formatDate(t.data)}</td>
                  <td className="px-4 py-3 text-gray-900">{t.descricao}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {t.safra ? `${t.safra.fazenda.nome} – ${t.safra.cultura}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.tipo === "RECEITA" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.tipo === "RECEITA" ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${t.tipo === "RECEITA" ? "text-green-600" : "text-red-600"}`}>
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
  );
}
