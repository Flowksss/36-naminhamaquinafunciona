"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Play, Pause } from "lucide-react";
import { sincronizarTelemetria } from "@/app/(dashboard)/frota/actions";

/**
 * Puxa telemetria do provedor (SimWorld) sob demanda ou em loop. Substitui o
 * antigo "auto-sim" aleatório — agora o que flui é dado real (simulado) que
 * alimenta o motor de recomendações. setTimeout recursivo (sem overlap).
 */
export function TelemetrySync({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [auto, setAuto] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const autoRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = useCallback(async () => {
    setPending(true);
    try {
      const r = await sincronizarTelemetria();
      setMsg(r.ok ? r.message ?? "Sincronizado" : r.message ?? "Falha");
      router.refresh();
    } finally {
      setPending(false);
    }
  }, [router]);

  useEffect(() => {
    autoRef.current = auto;
    if (!auto) {
      if (timer.current) clearTimeout(timer.current);
      return;
    }
    const loop = async () => {
      if (!autoRef.current) return;
      await tick();
      if (!autoRef.current) return;
      timer.current = setTimeout(loop, intervalMs);
    };
    loop();
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [auto, tick, intervalMs]);

  useEffect(() => () => { autoRef.current = false; if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div className="flex items-center gap-2">
      {msg && <span className="od-muted" style={{ fontSize: 11, maxWidth: 240, textAlign: "right" }}>{msg}</span>}
      <button className="od-btn od-btn-secondary" onClick={tick} disabled={pending || auto}>
        <RefreshCw size={16} className={pending && !auto ? "od-spin" : ""} /> Sincronizar
      </button>
      <button className={auto ? "od-btn" : "od-btn od-btn-secondary"} onClick={() => setAuto((a) => !a)}>
        {auto ? <Pause size={16} /> : <Play size={16} />} {auto ? "Auto ON" : "Auto"}
      </button>
    </div>
  );
}
