"use client";

import { useState } from "react";
import { FazendaForm } from "./fazenda-form";
import { Plus, X } from "lucide-react";

interface FazendasClientProps {
  fazendas: any[]; // Simplificado para o exemplo, idealmente usar tipo do Prisma
}

export function FazendasClient({ fazendas }: FazendasClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fazendas</h1>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isFormOpen ? "Cancelar" : "Nova Fazenda"}
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <FazendaForm onSuccess={() => setIsFormOpen(false)} />
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Localização</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-900">Área (ha)</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Tipo Solo</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-900">Safras</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fazendas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  Nenhuma fazenda cadastrada
                </td>
              </tr>
            ) : (
              fazendas.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{f.localizacao}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {f.area.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{f.tipoSolo ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {f._count?.safras ?? 0}
                    </span>
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
