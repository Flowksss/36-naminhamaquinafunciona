"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { getContextoFazenda, setFazendaContext } from "@/lib/fazenda-actions";

type Fazenda = { id: string; nome: string };

export function FarmSwitcher() {
  const router = useRouter();
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [atual, setAtual] = useState("ALL");

  useEffect(() => {
    getContextoFazenda().then((c) => {
      setFazendas(c.fazendas);
      setAtual(c.atual);
    });
  }, []);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    setAtual(v);
    await setFazendaContext(v);
    router.refresh();
  }

  return (
    <div
      style={{ position: "fixed", top: 18, right: 24, zIndex: 50 }}
      className="flex items-center gap-2 bg-[var(--od-surface)] backdrop-blur-xl border border-[var(--od-border)] rounded-full px-3 py-1.5 shadow-lg"
    >
      <MapPin size={14} className="text-[var(--od-accent)]" />
      <select
        value={atual}
        onChange={onChange}
        className="bg-transparent text-sm text-[var(--od-fg)] outline-none cursor-pointer pr-1"
      >
        <option value="ALL">Todas as fazendas</option>
        {fazendas.map((f) => (
          <option key={f.id} value={f.id}>{f.nome}</option>
        ))}
      </select>
    </div>
  );
}
