"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { initialFormState } from "@/lib/types";
import { criarTalhao, atualizarTalhao } from "./actions";
import type { TalhaoItem, UnidadeOpcao } from "./queries";

function SubmitButton({ edit }: { edit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="od-btn justify-center">
      {pending && <Loader2 size={16} className="od-spin" />}
      {edit ? "Salvar alterações" : "Cadastrar área"}
    </button>
  );
}

export function TalhaoForm({
  fazendas,
  talhao,
  onSuccess,
  onCancel,
}: {
  fazendas: UnidadeOpcao[];
  talhao?: TalhaoItem;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const action = talhao ? atualizarTalhao.bind(null, talhao.id) : criarTalhao;
  const [state, formAction] = useFormState(action, initialFormState);
  const err = state.errors ?? {};

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="od-label">Nome da área *</label>
          <input name="nome" defaultValue={talhao?.nome} placeholder="Ex: Talhão 12" className={`od-input ${err.nome ? "od-input-error" : ""}`} />
          {err.nome && <p className="text-xs text-[var(--od-red)]">{err.nome}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Unidade *</label>
          <select name="fazendaId" defaultValue={talhao?.fazendaId ?? ""} className={`od-select ${err.fazendaId ? "od-input-error" : ""}`}>
            <option value="" disabled>Selecione…</option>
            {fazendas.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          {err.fazendaId && <p className="text-xs text-[var(--od-red)]">{err.fazendaId}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Cultura</label>
          <input name="cultura" defaultValue={talhao?.cultura ?? ""} placeholder="Ex: Soja" className="od-input" />
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Área (ha)</label>
          <input name="areaHa" defaultValue={talhao?.areaHa ?? ""} placeholder="Ex: 120" className={`od-input ${err.areaHa ? "od-input-error" : ""}`} />
          {err.areaHa && <p className="text-xs text-[var(--od-red)]">{err.areaHa}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Latitude (centro)</label>
          <input name="lat" defaultValue={talhao?.lat ?? ""} placeholder="-13.0" className="od-input" />
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Longitude (centro)</label>
          <input name="lng" defaultValue={talhao?.lng ?? ""} placeholder="-56.0" className="od-input" />
        </div>
      </div>

      {state.message && !state.ok && (
        <div className="p-3 rounded-xl text-sm bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]">{state.message}</div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="od-btn od-btn-secondary">Cancelar</button>
        <SubmitButton edit={!!talhao} />
      </div>
    </form>
  );
}
