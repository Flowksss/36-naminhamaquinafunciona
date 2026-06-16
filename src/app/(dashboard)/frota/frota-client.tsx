"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Truck, MapPin } from "lucide-react";
import type { FrotaPageData, AtivoItem } from "./queries";
import { AtivoForm } from "./ativo-form";
import { deletarAtivo } from "./actions";

const statusLabel: Record<string, string> = {
  EM_OPERACAO: "Em operação", NA_FILA: "Na fila", EM_TRANSITO: "Em trânsito", OCIOSO: "Ocioso", MANUTENCAO: "Manutenção",
};

type Modo = { tipo: "lista" } | { tipo: "nova" } | { tipo: "edita"; ativo: AtivoItem };

export function FrotaClient({ data }: { data: FrotaPageData }) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>({ tipo: "lista" });
  const [removendo, setRemovendo] = useState<string | null>(null);

  async function remover(a: AtivoItem) {
    if (!confirm(`Excluir a máquina ${a.identificador}? Esta ação não pode ser desfeita.`)) return;
    setRemovendo(a.id);
    const res = await deletarAtivo(a.id);
    setRemovendo(null);
    if (!res.ok) alert(res.message ?? "Erro ao excluir.");
    router.refresh();
  }

  const fechar = () => {
    setModo({ tipo: "lista" });
    router.refresh();
  };

  const semUnidade = data.fazendas.length === 0;

  return (
    <>
      <header className="od-topbar">
        <div className="od-title">Frota <span>Máquinas</span></div>
        {!semUnidade && modo.tipo === "lista" && (
          <button className="od-btn" onClick={() => setModo({ tipo: "nova" })}>
            <Plus size={16} /> Nova Máquina
          </button>
        )}
      </header>

      {semUnidade ? (
        <div className="od-panel mt-4 p-8 text-center space-y-3">
          <MapPin size={28} className="mx-auto text-[var(--od-muted)]" />
          <p className="od-muted">Você precisa cadastrar uma <strong>Unidade</strong> antes de adicionar máquinas.</p>
          <Link href="/fazendas" className="od-btn inline-flex"><Plus size={16} /> Criar Unidade</Link>
        </div>
      ) : modo.tipo !== "lista" ? (
        <div className="od-panel mt-4 p-6 max-w-3xl">
          <div className="od-panelhead -mx-6 -mt-6 mb-5">
            <h2>{modo.tipo === "nova" ? "Nova Máquina" : `Editar ${modo.ativo.identificador}`}</h2>
          </div>
          <AtivoForm
            fazendas={data.fazendas}
            ativo={modo.tipo === "edita" ? modo.ativo : undefined}
            onSuccess={fechar}
            onCancel={() => setModo({ tipo: "lista" })}
          />
        </div>
      ) : (
        <div className="od-panel od-fleetwrap mt-4">
          {data.ativos.length === 0 ? (
            <div className="od-empty">Nenhuma máquina cadastrada. Clique em “Nova Máquina”.</div>
          ) : (
            <div className="od-fleetscroll">
              <table className="od-fleet w-full">
                <thead>
                  <tr className="text-left od-muted text-xs uppercase">
                    <th className="p-3">Identificador</th>
                    <th className="p-3">Modelo</th>
                    <th className="p-3">Unidade</th>
                    <th className="p-3">Operador</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Consumo méd.</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ativos.map((a) => (
                    <tr key={a.id}>
                      <td className="p-3 od-mono">
                        <span className="inline-flex items-center gap-2"><Truck size={14} className="text-[var(--od-muted)]" />{a.identificador}</span>
                      </td>
                      <td className="p-3 od-muted">{a.modelo ?? "—"}</td>
                      <td className="p-3">{a.unidade ?? "—"}</td>
                      <td className="p-3 od-muted">{a.operador ?? "—"}</td>
                      <td className="p-3"><span className="od-status">{statusLabel[a.status]}</span></td>
                      <td className="p-3 text-right od-mono">{a.consumoMedio.toFixed(1)} L/h</td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setModo({ tipo: "edita", ativo: a })} className="od-muted hover:text-[var(--od-accent)]" title="Editar">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => remover(a)} disabled={removendo === a.id} className="od-muted hover:text-[var(--od-red)] disabled:opacity-40" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
