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
    <>
      <header className="od-topbar mb-6">
        <h1 className="od-title">Unidades <span>Produção</span></h1>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="od-btn"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}
          {isFormOpen ? "Cancelar" : "Nova Unidade"}
        </button>
      </header>

      {isFormOpen && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <FazendaForm onSuccess={() => setIsFormOpen(false)} />
        </div>
      )}

      <div className="od-panel">
        <div className="od-panelhead">
          <h2>Fazendas Cadastradas</h2>
          <span className="od-muted">{fazendas.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="od-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Localização</th>
                <th className="text-right">Área (ha)</th>
                <th>Tipo Solo</th>
                <th className="text-right">Safras</th>
              </tr>
            </thead>
            <tbody>
              {fazendas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 od-muted">
                    Nenhuma fazenda cadastrada
                  </td>
                </tr>
              ) : (
                fazendas.map((f) => (
                  <tr key={f.id}>
                    <td className="font-semibold text-[var(--od-accent)]">{f.nome}</td>
                    <td className="od-muted">{f.localizacao}</td>
                    <td className="text-right od-mono">
                      {f.area.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td>{f.tipoSolo ?? "—"}</td>
                    <td className="text-right">
                      <span className="od-badge">
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
    </>
  );
}
