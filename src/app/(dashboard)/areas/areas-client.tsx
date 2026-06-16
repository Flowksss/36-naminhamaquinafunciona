"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Sprout, MapPin } from "lucide-react";
import type { AreasPageData, TalhaoItem } from "./queries";
import { TalhaoForm } from "./talhao-form";
import { deletarTalhao } from "./actions";

type Modo = { tipo: "lista" } | { tipo: "nova" } | { tipo: "edita"; talhao: TalhaoItem };

export function AreasClient({ data }: { data: AreasPageData }) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>({ tipo: "lista" });
  const [removendo, setRemovendo] = useState<string | null>(null);

  async function remover(t: TalhaoItem) {
    if (!confirm(`Excluir a área ${t.nome}? Esta ação não pode ser desfeita.`)) return;
    setRemovendo(t.id);
    const res = await deletarTalhao(t.id);
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
        <div className="od-title">Áreas <span>Talhões</span></div>
        {!semUnidade && modo.tipo === "lista" && (
          <button className="od-btn" onClick={() => setModo({ tipo: "nova" })}>
            <Plus size={16} /> Nova Área
          </button>
        )}
      </header>

      {semUnidade ? (
        <div className="od-panel mt-4 p-8 text-center space-y-3">
          <MapPin size={28} className="mx-auto text-[var(--od-muted)]" />
          <p className="od-muted">Você precisa cadastrar uma <strong>Unidade</strong> antes de adicionar áreas.</p>
          <Link href="/fazendas" className="od-btn inline-flex"><Plus size={16} /> Criar Unidade</Link>
        </div>
      ) : modo.tipo !== "lista" ? (
        <div className="od-panel mt-4 p-6 max-w-3xl">
          <div className="od-panelhead -mx-6 -mt-6 mb-5">
            <h2>{modo.tipo === "nova" ? "Nova Área" : `Editar ${modo.talhao.nome}`}</h2>
          </div>
          <TalhaoForm
            fazendas={data.fazendas}
            talhao={modo.tipo === "edita" ? modo.talhao : undefined}
            onSuccess={fechar}
            onCancel={() => setModo({ tipo: "lista" })}
          />
        </div>
      ) : (
        <div className="od-panel od-fleetwrap mt-4">
          {data.talhoes.length === 0 ? (
            <div className="od-empty">Nenhuma área cadastrada. Clique em “Nova Área”.</div>
          ) : (
            <div className="od-fleetscroll">
              <table className="od-fleet w-full">
                <thead>
                  <tr className="text-left od-muted text-xs uppercase">
                    <th className="p-3">Área</th>
                    <th className="p-3">Cultura</th>
                    <th className="p-3">Unidade</th>
                    <th className="p-3 text-right">Tamanho</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.talhoes.map((t) => (
                    <tr key={t.id}>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-2"><Sprout size={14} className="text-[var(--od-accent)]" />{t.nome}</span>
                      </td>
                      <td className="p-3 od-muted">{t.cultura ?? "—"}</td>
                      <td className="p-3">{t.unidade ?? "—"}</td>
                      <td className="p-3 text-right od-mono">{t.areaHa.toFixed(1)} ha</td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => setModo({ tipo: "edita", talhao: t })} className="od-muted hover:text-[var(--od-accent)]" title="Editar">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => remover(t)} disabled={removendo === t.id} className="od-muted hover:text-[var(--od-red)] disabled:opacity-40" title="Excluir">
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
