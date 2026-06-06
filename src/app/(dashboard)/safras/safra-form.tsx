"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarSafra, atualizarSafra } from "./actions";
import { initialFormState } from "@/lib/types";
import { Loader2 } from "lucide-react";

type FazendaOption = { id: string; nome: string };

interface SafraFormProps {
  fazendaOptions: FazendaOption[];
  id?: string;
  initialData?: {
    fazendaId: string;
    cultura: string;
    dataPlantio: string;
    dataColheitaPrevista: string;
    areaPlantada: number;
    status: string;
    quantidadePrevista: number | null;
  };
  onSuccess?: () => void;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 w-full"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isEdit ? "Atualizar Safra" : "Cadastrar Safra"}
    </button>
  );
}

const inputBase =
  "flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export function SafraForm({ fazendaOptions, id, initialData, onSuccess }: SafraFormProps) {
  const action = id ? atualizarSafra.bind(null, id) : criarSafra;
  const [state, formAction] = useFormState(action, initialFormState);

  useEffect(() => {
    if (state.ok && onSuccess) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div className="space-y-2">
        <label htmlFor="fazendaId" className="text-sm font-medium">Fazenda</label>
        <select
          id="fazendaId"
          name="fazendaId"
          defaultValue={initialData?.fazendaId ?? ""}
          className={`${inputBase} ${state.errors?.fazendaId ? "border-red-500" : "border-gray-300"}`}
        >
          <option value="">Selecione...</option>
          {fazendaOptions.map((f) => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>
        {state.errors?.fazendaId && <p className="text-sm text-red-500">{state.errors.fazendaId}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="cultura" className="text-sm font-medium">Cultura</label>
        <input
          id="cultura"
          name="cultura"
          defaultValue={initialData?.cultura}
          placeholder="Ex: Soja"
          className={`${inputBase} ${state.errors?.cultura ? "border-red-500" : "border-gray-300"}`}
        />
        {state.errors?.cultura && <p className="text-sm text-red-500">{state.errors.cultura}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="dataPlantio" className="text-sm font-medium">Data de Plantio</label>
          <input
            id="dataPlantio"
            name="dataPlantio"
            type="date"
            defaultValue={initialData?.dataPlantio}
            className={`${inputBase} ${state.errors?.dataPlantio ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.dataPlantio && <p className="text-sm text-red-500">{state.errors.dataPlantio}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="dataColheitaPrevista" className="text-sm font-medium">Colheita Prevista</label>
          <input
            id="dataColheitaPrevista"
            name="dataColheitaPrevista"
            type="date"
            defaultValue={initialData?.dataColheitaPrevista}
            className={`${inputBase} ${state.errors?.dataColheitaPrevista ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.dataColheitaPrevista && (
            <p className="text-sm text-red-500">{state.errors.dataColheitaPrevista}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="areaPlantada" className="text-sm font-medium">Área Plantada (ha)</label>
          <input
            id="areaPlantada"
            name="areaPlantada"
            type="number"
            step="0.01"
            defaultValue={initialData?.areaPlantada}
            placeholder="0,00"
            className={`${inputBase} ${state.errors?.areaPlantada ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.areaPlantada && <p className="text-sm text-red-500">{state.errors.areaPlantada}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={initialData?.status ?? "PLANEJADA"}
            className={`${inputBase} border-gray-300`}
          >
            <option value="PLANEJADA">Planejada</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="COLHIDA">Colhida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="quantidadePrevista" className="text-sm font-medium">
          Quantidade Prevista (sc) <span className="text-gray-400">(opcional)</span>
        </label>
        <input
          id="quantidadePrevista"
          name="quantidadePrevista"
          type="number"
          step="0.01"
          defaultValue={initialData?.quantidadePrevista ?? ""}
          placeholder="0,00"
          className={`${inputBase} border-gray-300`}
        />
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
