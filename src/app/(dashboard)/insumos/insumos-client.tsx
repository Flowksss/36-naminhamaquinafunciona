"use client";

import { useState } from "react";
import { InsumoForm } from "./insumo-form";
import { formatCurrency } from "@/lib/utils";
import { Plus, X } from "lucide-react";

type FornecedorOption = { id: string; nome: string };

interface InsumosClientProps {
  insumos: any[];
  fornecedorOptions: FornecedorOption[];
}

const tipoLabel: Record<string, string> = {
  SEMENTE: "Semente",
  FERTILIZANTE: "Fertilizante",
  DEFENSIVO: "Defensivo",
  COMBUSTIVEL: "Combustível",
  OUTRO: "Outro",
};

export function InsumosClient({ insumos, fornecedorOptions }: InsumosClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Insumos / Estoque</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isFormOpen ? "Cancelar" : "Novo Insumo"}
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <InsumoForm fornecedorOptions={fornecedorOptions} onSuccess={() => setIsFormOpen(false)} />
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Tipo</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-900">Estoque</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Unidade</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-900">Preço Unit.</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Fornecedor</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-900">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {insumos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">Nenhum insumo cadastrado</td>
              </tr>
            ) : (
              insumos.map((i) => {
                const baixo = i.quantidadeEstoque <= i.estoqueMinimo;
                return (
                  <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{i.nome}</td>
                    <td className="px-4 py-3 text-gray-600">{tipoLabel[i.tipo]}</td>
                    <td className={`px-4 py-3 text-right font-medium ${baixo ? "text-red-600" : "text-gray-600"}`}>
                      {i.quantidadeEstoque.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{i.unidade}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {i.precoUnitario ? formatCurrency(i.precoUnitario) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{i.fornecedor?.nome ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {baixo ? (
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                          Baixo Estoque
                        </span>
                      ) : (
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
