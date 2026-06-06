"use client";

import { useState } from "react";
import { FornecedorForm } from "./fornecedor-form";
import { Plus, X } from "lucide-react";

interface FornecedoresClientProps {
  fornecedores: any[];
}

export function FornecedoresClient({ fornecedores }: FornecedoresClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isFormOpen ? "Cancelar" : "Novo Fornecedor"}
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8">
          <FornecedorForm onSuccess={() => setIsFormOpen(false)} />
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Nome</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">CNPJ</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-900">Telefone</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-900">Insumos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {fornecedores.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">Nenhum fornecedor cadastrado</td>
              </tr>
            ) : (
              fornecedores.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.nome}</td>
                  <td className="px-4 py-3 text-gray-600">{f.cnpj ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{f.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{f.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{f._count?.insumos ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
