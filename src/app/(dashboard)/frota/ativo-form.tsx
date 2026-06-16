"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { initialFormState } from "@/lib/types";
import { criarAtivo, atualizarAtivo } from "./actions";
import type { AtivoItem, UnidadeOpcao } from "./queries";

const TIPOS = [
  { v: "CAMINHAO", l: "Caminhão" },
  { v: "COLHEDORA", l: "Colhedora" },
  { v: "TRATOR", l: "Trator" },
  { v: "PULVERIZADOR", l: "Pulverizador" },
  { v: "OUTRO", l: "Outro" },
];
const STATUS = [
  { v: "OCIOSO", l: "Ocioso" },
  { v: "EM_OPERACAO", l: "Em operação" },
  { v: "NA_FILA", l: "Na fila" },
  { v: "EM_TRANSITO", l: "Em trânsito" },
  { v: "MANUTENCAO", l: "Manutenção" },
];

function SubmitButton({ edit }: { edit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="od-btn justify-center">
      {pending && <Loader2 size={16} className="od-spin" />}
      {edit ? "Salvar alterações" : "Cadastrar máquina"}
    </button>
  );
}

export function AtivoForm({
  fazendas,
  ativo,
  onSuccess,
  onCancel,
}: {
  fazendas: UnidadeOpcao[];
  ativo?: AtivoItem;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const action = ativo ? atualizarAtivo.bind(null, ativo.id) : criarAtivo;
  const [state, formAction] = useFormState(action, initialFormState);
  const err = state.errors ?? {};

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="od-label">Identificador *</label>
          <input name="identificador" defaultValue={ativo?.identificador} placeholder="Ex: CAM-01" className={`od-input ${err.identificador ? "od-input-error" : ""}`} />
          {err.identificador && <p className="text-xs text-[var(--od-red)]">{err.identificador}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Unidade *</label>
          <select name="fazendaId" defaultValue={ativo?.fazendaId ?? ""} className={`od-select ${err.fazendaId ? "od-input-error" : ""}`}>
            <option value="" disabled>Selecione…</option>
            {fazendas.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
          </select>
          {err.fazendaId && <p className="text-xs text-[var(--od-red)]">{err.fazendaId}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Tipo</label>
          <select name="tipo" defaultValue={ativo?.tipo ?? "CAMINHAO"} className="od-select">
            {TIPOS.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Status</label>
          <select name="status" defaultValue={ativo?.status ?? "OCIOSO"} className="od-select">
            {STATUS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Modelo</label>
          <input name="modelo" defaultValue={ativo?.modelo ?? ""} placeholder="Ex: John Deere 8R" className="od-input" />
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Operador</label>
          <input name="operador" defaultValue={ativo?.operador ?? ""} placeholder="Ex: João Silva" className="od-input" />
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Consumo médio (L/h)</label>
          <input name="consumoMedio" defaultValue={ativo?.consumoMedio ?? ""} placeholder="Ex: 12" className={`od-input ${err.consumoMedio ? "od-input-error" : ""}`} />
          {err.consumoMedio && <p className="text-xs text-[var(--od-red)]">{err.consumoMedio}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Capacidade tanque (L)</label>
          <input name="capacidadeTanque" defaultValue={ativo?.capacidadeTanque ?? ""} placeholder="Ex: 400" className="od-input" />
        </div>
        <div className="space-y-1.5">
          <label className="od-label">Ano</label>
          <input name="ano" defaultValue={ativo?.ano ?? ""} placeholder="Ex: 2022" className="od-input" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="od-label">Latitude</label>
            <input name="lat" defaultValue={ativo?.lat ?? ""} placeholder="-13.0" className="od-input" />
          </div>
          <div className="space-y-1.5">
            <label className="od-label">Longitude</label>
            <input name="lng" defaultValue={ativo?.lng ?? ""} placeholder="-56.0" className="od-input" />
          </div>
        </div>
      </div>

      {state.message && !state.ok && (
        <div className="p-3 rounded-xl text-sm bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]">{state.message}</div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="od-btn od-btn-secondary">Cancelar</button>
        <SubmitButton edit={!!ativo} />
      </div>
    </form>
  );
}
