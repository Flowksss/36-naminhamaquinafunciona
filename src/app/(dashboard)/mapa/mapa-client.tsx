"use client";

import { useState } from "react";
import type { MapaFrota, Machine } from "./queries";
import { avancarSimulacao } from "../operacao/actions";
import { Play, Loader2, Truck, Fuel, Gauge, MapPin } from "lucide-react";

const STATUS_COR: Record<string, string> = {
  EM_OPERACAO: "var(--od-accent)",
  EM_TRANSITO: "var(--od-blue)",
  NA_FILA: "var(--od-amber)",
  OCIOSO: "var(--od-muted)",
  MANUTENCAO: "var(--od-red)",
};
const statusLabel: Record<string, string> = {
  EM_OPERACAO: "Em operação", NA_FILA: "Na fila", EM_TRANSITO: "Em trânsito", OCIOSO: "Ocioso", MANUTENCAO: "Manutenção",
};

const W = 1000, H = 620, PAD = 50;

export function MapaClient({ data }: { data: MapaFrota }) {
  const [pending, setPending] = useState(false);
  const [selId, setSelId] = useState<string | null>(data.machines[0]?.id ?? null);

  async function handleAvancar() {
    setPending(true);
    try { await avancarSimulacao(); } finally { setPending(false); }
  }

  // bounding box de todos os pontos (posições + rotas)
  const pts: { lat: number; lng: number }[] = [];
  for (const m of data.machines) {
    pts.push({ lat: m.lat, lng: m.lng });
    for (const p of m.rota) pts.push({ lat: p.lat, lng: p.lng });
  }
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat || 1;
  const spanLng = maxLng - minLng || 1;

  // projeta lat/lng -> coords SVG (Y invertido: norte em cima)
  const px = (lng: number) => PAD + ((lng - minLng) / spanLng) * (W - 2 * PAD);
  const py = (lat: number) => PAD + ((maxLat - lat) / spanLat) * (H - 2 * PAD);

  const sel = data.machines.find((m) => m.id === selId) ?? null;

  return (
    <>
      <header className="od-topbar">
        <div className="od-title">
          Mapa <span>GPS da Frota</span>
        </div>
        <button className="od-btn" onClick={handleAvancar} disabled={pending}>
          {pending ? <Loader2 size={16} className="od-spin" /> : <Play size={16} />}
          {pending ? "Processando" : "Avançar Simulação"}
        </button>
      </header>

      <div className="od-grid">
        {/* MAPA */}
        <div className="od-panel od-col" style={{ padding: 0, overflow: "hidden" }}>
          {data.machines.length === 0 ? (
            <div className="od-empty">Sem posições GPS. Avance a simulação para gerar trilhas.</div>
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block" }}>
              {/* fundo sólido */}
              <rect width={W} height={H} fill="var(--od-bg)" />
              
              {/* grid de fundo melhorado */}
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                </pattern>
                {/* linhas de setor / cruzes */}
                <pattern id="grid-large" width="200" height="200" patternUnits="userSpaceOnUse">
                  <rect width="200" height="200" fill="url(#grid)" />
                  <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                </pattern>
                {/* brilho radial no centro */}
                <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--od-accent)" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="var(--od-bg)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={W} height={H} fill="url(#grid-large)" />
              <rect width={W} height={H} fill="url(#map-glow)" pointerEvents="none" />

              {/* rotas */}
              {data.machines.map((m) => {
                if (m.rota.length < 2) return null;
                const d = m.rota.map((p, i) => `${i === 0 ? "M" : "L"} ${px(p.lng).toFixed(1)} ${py(p.lat).toFixed(1)}`).join(" ");
                const cor = STATUS_COR[m.status] ?? "var(--od-muted)";
                return (
                  <path
                    key={`rota-${m.id}`}
                    d={d}
                    fill="none"
                    stroke={cor}
                    strokeWidth={m.id === selId ? 2.5 : 1}
                    strokeOpacity={m.id === selId ? 0.9 : 0.35}
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* markers */}
              {data.machines.map((m) => {
                const x = px(m.lng), y = py(m.lat);
                const cor = STATUS_COR[m.status] ?? "var(--od-muted)";
                const ativo = m.id === selId;
                return (
                  <g key={m.id} onClick={() => setSelId(m.id)} style={{ cursor: "pointer" }}>
                    {ativo && <circle cx={x} cy={y} r={16} fill={cor} opacity={0.15} />}
                    <circle cx={x} cy={y} r={ativo ? 8 : 6} fill={cor} stroke="var(--od-bg)" strokeWidth={2} />
                    <text x={x + 12} y={y + 4} fontSize={13} fill="var(--od-fg)" fontFamily="JetBrains Mono, monospace">
                      {m.identificador}
                    </text>
                  </g>
                );
              })}

              {/* Status Legend */}
              <g transform={`translate(20, ${H - 120})`}>
                <rect x={0} y={0} width={160} height={110} fill="var(--od-surface)" stroke="var(--od-border)" strokeWidth={1} rx={4} opacity={0.9} />
                <text x={12} y={20} fontSize={12} fill="var(--od-fg)" fontWeight="bold">Legenda de Status</text>
                {Object.entries(statusLabel).map(([status, label], i) => (
                  <g key={status} transform={`translate(12, ${40 + i * 16})`}>
                    <circle cx={4} cy={-4} r={4} fill={STATUS_COR[status]} />
                    <text x={14} y={0} fontSize={11} fill="var(--od-muted)">{label}</text>
                  </g>
                ))}
              </g>
            </svg>
          )}
        </div>

        {/* INFO LATERAL */}
        <div className="od-col od-side">
          {/* detalhe selecionado */}
          <div className="od-panel">
            <div className="od-panelhead"><h2>Detalhe do Ativo</h2></div>
            {sel ? (
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Truck size={20} style={{ color: STATUS_COR[sel.status] }} />
                  <span className="od-mono" style={{ fontSize: 18, fontWeight: 700 }}>{sel.identificador}</span>
                  <span className="od-status" style={{ marginLeft: "auto" }}>{statusLabel[sel.status]}</span>
                </div>
                <InfoRow icon={<MapPin size={14} />} label="Unidade" value={sel.unidade ?? "—"} />
                <InfoRow icon={<Gauge size={14} />} label="Consumo" value={`${sel.consumoAtual.toFixed(1)} L/h`} />
                <InfoRow icon={<Fuel size={14} />} label="Combustível" value={`${sel.nivelCombustivel ?? 0}%`}
                  danger={(sel.nivelCombustivel ?? 0) < 15} />
                <InfoRow icon={<MapPin size={14} />} label="Posição" value={`${sel.lat.toFixed(4)}, ${sel.lng.toFixed(4)}`} />
                <div className="od-muted od-sm">Pontos de rota: {sel.rota.length}</div>
              </div>
            ) : (
              <div className="od-empty">Selecione um ativo no mapa.</div>
            )}
          </div>

          {/* lista / legenda */}
          <div className="od-panel od-fleetwrap">
            <div className="od-panelhead"><h2>Frota ({data.machines.length})</h2></div>
            <div className="od-fleetscroll">
              <table className="od-fleet">
                <tbody>
                  {data.machines.map((m) => (
                    <tr key={m.id} onClick={() => setSelId(m.id)}
                      style={{ cursor: "pointer", background: m.id === selId ? "rgba(255,255,255,0.04)" : undefined }}>
                      <td>
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 99, background: STATUS_COR[m.status], marginRight: 8 }} />
                        <span className="od-mono">{m.identificador}</span>
                      </td>
                      <td className="od-muted od-sm">{statusLabel[m.status]}</td>
                      <td className="od-right">
                        <span className={(m.nivelCombustivel ?? 0) < 15 ? "od-fuel-low" : "od-muted"}>
                          {m.nivelCombustivel ?? 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value, danger }: { icon: React.ReactNode; label: string; value: string; danger?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: "var(--od-muted)" }}>{icon}</span>
      <span className="od-muted" style={{ flex: 1 }}>{label}</span>
      <span className={danger ? "od-fuel-low" : ""} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>{value}</span>
    </div>
  );
}
