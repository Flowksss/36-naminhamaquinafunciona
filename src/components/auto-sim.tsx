"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { avancarSimulacao } from "@/app/(dashboard)/operacao/actions";
import { Play, Pause, Loader2, FastForward } from "lucide-react";

/**
 * Controle da simulação: "Avançar" manual + "Modo Demo" (auto-tick).
 * Auto usa setTimeout recursivo (nunca setInterval) — o próximo tick só
 * dispara após o anterior resolver, evitando overlap/estouro de conexões.
 */
export function AutoSim({ intervaloMs = 4000 }: { intervaloMs?: number }) {
  const [pending, setPending] = useState(false);
  const [auto, setAuto] = useState(false);
  const autoRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = useCallback(async () => {
    setPending(true);
    try {
      await avancarSimulacao();
    } finally {
      setPending(false);
    }
  }, []);

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
      timer.current = setTimeout(loop, intervaloMs);
    };
    loop();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [auto, tick, intervaloMs]);

  // garante parada ao desmontar
  useEffect(() => {
    return () => {
      autoRef.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <button className="od-btn" onClick={tick} disabled={pending || auto}>
        {pending && !auto ? <Loader2 size={16} className="od-spin" /> : <Play size={16} />}
        Avançar
      </button>
      <button
        className={auto ? "od-btn" : "od-btn od-btn-secondary"}
        onClick={() => setAuto((a) => !a)}
      >
        {auto ? <Pause size={16} /> : <FastForward size={16} />}
        {auto ? "Pausar Demo" : "Modo Demo"}
      </button>
    </div>
  );
}
