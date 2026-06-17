"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2, Activity } from "lucide-react";
import { registrarLeitura } from "./actions";
import { initialFormState } from "@/lib/types";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="od-btn justify-center">
      {pending ? <Loader2 size={16} className="od-spin" /> : <Activity size={16} />}
      Registrar leitura
    </button>
  );
}

export function LeituraForm({ ativoId }: { ativoId: string }) {
  const router = useRouter();
  const [state, action] = useFormState(registrarLeitura.bind(null, ativoId), initialFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const err = state.errors ?? {};

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form ref={formRef} action={action} className="space-y-3 p-4">
      <p className="od-muted text-xs">Telemetria manual (Fase 0): informe os valores atuais da máquina.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="od-label">Consumo (L/h)</label>
          <input name="consumoAtual" placeholder="Ex: 14.2" className={`od-input ${err.consumoAtual ? "od-input-error" : ""}`} />
          {err.consumoAtual && <p className="text-xs text-[var(--od-red)]">{err.consumoAtual}</p>}
        </div>
        <div className="space-y-1">
          <label className="od-label">Combustível (%)</label>
          <input name="nivelCombustivel" placeholder="0 a 100" className={`od-input ${err.nivelCombustivel ? "od-input-error" : ""}`} />
          {err.nivelCombustivel && <p className="text-xs text-[var(--od-red)]">{err.nivelCombustivel}</p>}
        </div>
        <div className="space-y-1">
          <label className="od-label">Horas operadas</label>
          <input name="horasOperadas" placeholder="desde a última leitura" className={`od-input ${err.horasOperadas ? "od-input-error" : ""}`} />
          {err.horasOperadas && <p className="text-xs text-[var(--od-red)]">{err.horasOperadas}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="od-label">Latitude</label>
            <input name="lat" placeholder="-13.0" className="od-input" />
          </div>
          <div className="space-y-1">
            <label className="od-label">Longitude</label>
            <input name="lng" placeholder="-56.0" className="od-input" />
          </div>
        </div>
      </div>

      {state.message && (
        <div className={`p-3 rounded-xl text-sm ${state.ok ? "bg-[var(--od-accent-glow)] text-[var(--od-accent)] border border-[var(--od-accent)]" : "bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]"}`}>
          {state.message}
        </div>
      )}

      <SubmitBtn />
    </form>
  );
}
