"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  MapPin,
  Radar,
  Map as MapIcon,
  Layers,
  LayoutGrid,
  Building2,
  Check,
} from "lucide-react";
import { ShaderBackground } from "@/components/shader-background";
import { getContextoFazenda, setFazendaContext } from "@/lib/fazenda-actions";

const navItems = [
  { href: "/operacao", label: "Centro de Operações", icon: Radar },
  { href: "/mapa", label: "Mapa GPS", icon: MapIcon },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/painel", label: "Painel Personalizável", icon: LayoutGrid },
  { href: "/fazendas", label: "Unidades", icon: MapPin },
  { href: "/planos", label: "Planos", icon: Layers },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [fazendasData, setFazendasData] = useState<{ fazendas: { id: string; nome: string }[]; atual: string } | null>(null);
  const [showFarmMenu, setShowFarmMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getContextoFazenda().then(setFazendasData);
  }, []);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowFarmMenu(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const handleSelectFazenda = async (id: string) => {
    await setFazendaContext(id);
    setShowFarmMenu(false);
    const updated = await getContextoFazenda();
    setFazendasData(updated);
  };

  return (
    <div className="od-console">
      <ShaderBackground />
      <div className="od-shell">
        {/* NAV RAIL */}
        <aside className="od-rail relative z-[200]">
          <div className="od-logo">CS</div>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowFarmMenu(!showFarmMenu)}
              className={`od-navitem mt-2 ${fazendasData?.atual !== "ALL" ? "text-[var(--od-accent)] bg-[rgba(0,255,157,0.1)]" : "text-[var(--od-amber)]"}`}
              data-label="Selecionar Unidade (Contexto)"
            >
              <Building2 size={22} />
            </button>
            {showFarmMenu && fazendasData && (
              <div className="absolute left-[70px] top-0 w-64 bg-[var(--od-surface)] border border-[var(--od-border)] rounded-xl shadow-xl overflow-hidden z-[300] backdrop-blur-xl">
                <div className="px-4 py-3 border-b border-[var(--od-border)] bg-[rgba(255,255,255,0.03)] text-[11px] font-bold uppercase tracking-wider text-[var(--od-muted)]">
                  Contexto Operacional
                </div>
                <div className="max-h-[350px] overflow-y-auto p-1">
                  <button
                    onClick={() => handleSelectFazenda("ALL")}
                    className="w-full text-left px-3 py-2.5 text-sm flex items-center justify-between rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  >
                    <span>Todas as Unidades</span>
                    {fazendasData.atual === "ALL" && <Check size={16} className="text-[var(--od-accent)]" />}
                  </button>
                  {fazendasData.fazendas.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelectFazenda(f.id)}
                      className="w-full text-left px-3 py-2.5 text-sm flex items-center justify-between rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                    >
                      <span className="truncate pr-2">{f.nome}</span>
                      {fazendasData.atual === f.id && <Check size={16} className="text-[var(--od-accent)]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-8 h-px bg-[var(--od-border)] my-2 opacity-50" />

          <nav className="od-nav">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`od-navitem ${active ? "od-active" : ""}`}
                  data-label={label}
                >
                  <Icon size={22} />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="od-main">
          {children}
        </main>
      </div>
    </div>
  );
}
