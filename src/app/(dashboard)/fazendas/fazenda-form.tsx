"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarFazenda, atualizarFazenda } from "./actions";
import { initialFormState } from "@/lib/types";
import { Loader2 } from "lucide-react";

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="od-btn w-full"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 od-spin" /> : null}
      {isEdit ? "Atualizar Unidade" : "Efetivar Cadastro"}
    </button>
  );
}

interface FazendaFormProps {
  id?: string;
  initialData?: {
    nome: string;
    localizacao: string;
    area: number;
    tipoSolo: string | null;
  };
  onSuccess?: () => void;
}

export function FazendaForm({ id, initialData, onSuccess }: FazendaFormProps) {
  const action = id ? atualizarFazenda.bind(null, id) : criarFazenda;
  const [state, formAction] = useFormState(action, initialFormState);

  useEffect(() => {
    if (state.ok && onSuccess) {
      onSuccess();
    }
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="od-panel p-6 space-y-5 max-w-2xl mx-auto">
      <div className="od-panelhead mb-4 -mx-6 -mt-6">
        <h2>{id ? "Editar Unidade" : "Nova Unidade de Produção"}</h2>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="nome" className="od-label">Nome da Fazenda</label>
        <input
          id="nome"
          name="nome"
          defaultValue={initialData?.nome}
          placeholder="Ex: Fazenda Santa Fé"
          className={`od-input ${state.errors?.nome ? "od-input-error" : ""}`}
        />
        {state.errors?.nome && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.nome}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="localizacao" className="od-label">Localização</label>
        <input
          id="localizacao"
          name="localizacao"
          defaultValue={initialData?.localizacao}
          placeholder="Ex: Sorriso - MT"
          className={`od-input ${state.errors?.localizacao ? "od-input-error" : ""}`}
        />
        {state.errors?.localizacao && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.localizacao}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="area" className="od-label">Área (ha)</label>
          <input
            id="area"
            name="area"
            defaultValue={initialData?.area}
            placeholder="0,00"
            className={`od-input ${state.errors?.area ? "od-input-error" : ""}`}
          />
          {state.errors?.area && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.area}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tipoSolo" className="od-label">Tipo de Solo</label>
          <input
            id="tipoSolo"
            name="tipoSolo"
            defaultValue={initialData?.tipoSolo ?? ""}
            placeholder="Ex: Argiloso"
            className="od-input"
          />
        </div>
      </div>

      {state.message && (
        <div className={`p-4 rounded-xl text-xs font-bold uppercase tracking-wider ${state.ok ? "bg-[var(--od-accent-glow)] text-[var(--od-accent)]" : "bg-[var(--od-red-glow)] text-[var(--od-red)]"}`}>
          {state.message}
        </div>
      )}

      <SubmitButton isEdit={!!id} />
    </form>
  );
}
