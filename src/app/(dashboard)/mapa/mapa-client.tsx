"use client";

import { useState } from "react";
import type { MapaFrota, Machine } from "./queries";
import { Truck, Fuel, Gauge, MapPin } from "lucide-react";

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
  const [selId, setSelId] = useState<string | null>(data.machines[0]?.id ?? null);

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
          <div className="flex items-center gap-1.5 ml-2 bg-[rgba(0,255,157,0.1)] px-2.5 py-1 rounded-full border border-[var(--od-accent-glow)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--od-accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--od-accent)]"></span>
            </span>
            <span className="text-[10px] text-[var(--od-accent)] font-bold uppercase tracking-wider leading-none mt-[1px]">Ao Vivo</span>
          </div>
        </div>
      </header>

      <div className="od-grid">
        {/* MAPA */}
        <div className="od-panel od-col" style={{ padding: 0, overflow: "hidden" }}>
          {data.machines.length === 0 ? (
            <div className="od-empty">Sem máquinas posicionadas. Cadastre máquinas com latitude/longitude para vê-las no mapa.</div>
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

                {/* setas das rotas */}
                {Object.entries(STATUS_COR).map(([status, cor]) => (
                  <marker key={`arrow-${status}`} id={`arrow-${status}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={cor} opacity="0.8" />
                  </marker>
                ))}

                {/* gradientes das rotas */}
                {data.machines.map(m => {
                  if (m.rota.length < 2) return null;
                  const start = m.rota[0], end = m.rota[m.rota.length - 1];
                  return (
                    <linearGradient key={`grad-${m.id}`} id={`grad-${m.id}`} x1={px(start.lng)} y1={py(start.lat)} x2={px(end.lng)} y2={py(end.lat)} gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor={STATUS_COR[m.status] ?? "var(--od-muted)"} stopOpacity="0.05" />
                      <stop offset="100%" stopColor={STATUS_COR[m.status] ?? "var(--od-muted)"} stopOpacity="0.9" />
                    </linearGradient>
                  );
                })}
              </defs>
              <rect width={W} height={H} fill="url(#grid-large)" />
              <rect width={W} height={H} fill="url(#map-glow)" pointerEvents="none" />

              {/* Rótulos de coordenadas */}
              {Array.from({ length: Math.ceil(W / 200) }).map((_, i) => {
                const x = i * 200;
                if (x === 0 || x >= W) return null;
                const lng = minLng + ((x - PAD) / (W - 2 * PAD)) * spanLng;
                return (
                  <text key={`x-${x}`} x={x + 4} y={14} fontSize={10} fill="var(--od-muted)" opacity={0.5} fontFamily="JetBrains Mono, monospace">
                    {lng.toFixed(4)}°
                  </text>
                );
              })}
              {Array.from({ length: Math.ceil(H / 200) }).map((_, i) => {
                const y = i * 200;
                if (y === 0 || y >= H) return null;
                const lat = maxLat - ((y - PAD) / (H - 2 * PAD)) * spanLat;
                return (
                  <text key={`y-${y}`} x={4} y={y - 4} fontSize={10} fill="var(--od-muted)" opacity={0.5} fontFamily="JetBrains Mono, monospace">
                    {lat.toFixed(4)}°
                  </text>
                );
              })}

              {/* rotas */}
              {data.machines.map((m) => {
                if (m.rota.length < 2) return null;
                const d = m.rota.map((p, i) => `${i === 0 ? "M" : "L"} ${px(p.lng).toFixed(1)} ${py(p.lat).toFixed(1)}`).join(" ");
                return (
                  <path
                    key={`rota-${m.id}`}
                    d={d}
                    fill="none"
                    stroke={`url(#grad-${m.id})`}
                    strokeWidth={m.id === selId ? 3 : 1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd={`url(#arrow-${m.status})`}
                    strokeDasharray={m.id === selId ? "none" : "4 4"}
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
                    {ativo && (
                      <circle cx={x} cy={y} r={8} fill={cor} opacity={0.5}>
                        <animate attributeName="r" values="8;24;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={x} cy={y} r={ativo ? 8 : 6} fill={cor} stroke="var(--od-bg)" strokeWidth={2} />
                    <text x={x + 12} y={y + 4} fontSize={13} fill="var(--od-fg)" fontFamily="JetBrains Mono, monospace" fontWeight={ativo ? "bold" : "normal"}>
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

              {/* Bússola */}
              <g transform={`translate(${W - 40}, ${H - 50})`}>
                <circle cx={0} cy={0} r={24} fill="var(--od-surface)" stroke="var(--od-border)" strokeWidth={1} opacity={0.8} />
                <path d="M 0 -14 L 4 -2 L 0 0 L -4 -2 Z" fill="var(--od-red)" />
                <path d="M 0 14 L 4 2 L 0 0 L -4 2 Z" fill="var(--od-muted)" />
                <text x={0} y={-18} fontSize={10} fill="var(--od-fg)" textAnchor="middle" fontWeight="bold">N</text>
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
                <InfoRow icon={<Gauge size={14} />} label="Consumo" value={sel.consumoAtual > 0 ? `${sel.consumoAtual.toFixed(1)} L/h` : "sem dados"} />
                <InfoRow icon={<Fuel size={14} />} label="Combustível" value={sel.nivelCombustivel == null ? "sem dados" : `${sel.nivelCombustivel}%`}
                  danger={sel.nivelCombustivel != null && sel.nivelCombustivel < 15} />
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
                        {m.nivelCombustivel == null ? (
                          <span className="od-muted">—</span>
                        ) : (
                          <span className={m.nivelCombustivel < 15 ? "od-fuel-low" : "od-muted"}>
                            {m.nivelCombustivel}%
                          </span>
                        )}
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
