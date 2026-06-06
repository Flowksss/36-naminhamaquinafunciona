"use client";

import { useState } from "react";
import { SafraForm } from "./safra-form";
import { formatDate } from "@/lib/utils";
import { Plus, X } from "lucide-react";

type FazendaOption = { id: string; nome: string };

interface SafrasClientProps {
  safras: any[];
  fazendaOptions: FazendaOption[];
}

const statusLabel: Record<string, string> = {
  PLANEJADA: "Planejada",
  EM_ANDAMENTO: "Em Andamento",
  COLHIDA: "Colhida",
  CANCELADA: "Cancelada",
};

const statusColor: Record<string, string> = {
  PLANEJADA: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-green-100 text-green-700",
  COLHIDA: "bg-gray-100 text-gray-700",
  CANCELADA: "bg-red-100 text-red-700",
};

export function SafrasClient({ safras, fazendaOptions }: SafrasClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Safras</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isFormOpen ? "Cancelar" : "Nova Safra"}
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <SafraForm fazendaOptions={fazendaOptions} onSuccess={() => setIsFormOpen(false)} />
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Fazenda</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Cultura</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Plantio</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Colheita Prev.</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-900">Área (ha)</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {safras.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">Nenhuma safra cadastrada</td>
              </tr>
            ) : (
              safras.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.fazenda.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{s.cultura}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(s.dataPlantio)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(s.dataColheitaPrevista)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {s.areaPlantada.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[s.status]}`}>
                      {statusLabel[s.status]}
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
