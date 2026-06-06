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

export function SafrasClient({ safras, fazendaOptions }: SafrasClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <header className="od-topbar mb-6">
        <h1 className="od-title">Safras <span>Ciclos de Produção</span></h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="od-btn"
        >
          {isFormOpen ? <X size={16} /> : <Plus size={16} />}
          {isFormOpen ? "Cancelar" : "Nova Safra"}
        </button>
      </header>

      {isFormOpen && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <SafraForm fazendaOptions={fazendaOptions} onSuccess={() => setIsFormOpen(false)} />
        </div>
      )}

      <div className="od-panel">
        <div className="od-panelhead">
          <h2>Monitoramento de Safras</h2>
          <span className="od-muted">{safras.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="od-table">
            <thead>
              <tr>
                <th>Fazenda</th>
                <th>Cultura</th>
                <th>Plantio</th>
                <th>Colheita Prev.</th>
                <th className="text-right">Área (ha)</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {safras.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 od-muted">Nenhuma safra cadastrada</td>
                </tr>
              ) : (
                safras.map((s) => (
                  <tr key={s.id}>
                    <td className="font-semibold">{s.fazenda.nome}</td>
                    <td className="text-[var(--od-accent)]">{s.cultura}</td>
                    <td className="od-muted od-mono">{formatDate(s.dataPlantio)}</td>
                    <td className="od-muted od-mono">{formatDate(s.dataColheitaPrevista)}</td>
                    <td className="text-right od-mono">
                      {s.areaPlantada.toLocaleString("pt-BR")}
                    </td>
                    <td className="text-center">
                      <span className={`od-badge ${
                        s.status === "EM_ANDAMENTO" ? "od-badge-accent" : 
                        s.status === "PLANEJADA" ? "bg-[var(--od-blue-glow)] text-[var(--od-blue)] border border-[var(--od-blue)]" :
                        s.status === "COLHIDA" ? "bg-white/10 text-white/60 border border-white/20" :
                        "bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]"
                      }`}>
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
    </>
  );
}
