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
      className="flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 w-full"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEdit ? "Atualizar Fazenda" : "Cadastrar Fazenda"}
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
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium">Nome da Fazenda</label>
        <input
          id="nome"
          name="nome"
          defaultValue={initialData?.nome}
          placeholder="Ex: Fazenda Santa Fé"
          className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
            state.errors?.nome ? "border-red-500" : "border-gray-300"
          }`}
        />
        {state.errors?.nome && <p className="text-sm text-red-500">{state.errors.nome}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="localizacao" className="text-sm font-medium">Localização</label>
        <input
          id="localizacao"
          name="localizacao"
          defaultValue={initialData?.localizacao}
          placeholder="Ex: Sorriso - MT"
          className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
            state.errors?.localizacao ? "border-red-500" : "border-gray-300"
          }`}
        />
        {state.errors?.localizacao && <p className="text-sm text-red-500">{state.errors.localizacao}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="area" className="text-sm font-medium">Área (ha)</label>
          <input
            id="area"
            name="area"
            defaultValue={initialData?.area}
            placeholder="0,00"
            className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
              state.errors?.area ? "border-red-500" : "border-gray-300"
            }`}
          />
          {state.errors?.area && <p className="text-sm text-red-500">{state.errors.area}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="tipoSolo" className="text-sm font-medium">Tipo de Solo</label>
          <input
            id="tipoSolo"
            name="tipoSolo"
            defaultValue={initialData?.tipoSolo ?? ""}
            placeholder="Ex: Argiloso"
            className="flex h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {state.message && (
        <div className={`p-3 rounded-md text-sm ${state.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}

      <SubmitButton isEdit={!!id} />
    </form>
  );
}
