"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarInsumo, atualizarInsumo } from "./actions";
import { initialFormState } from "@/lib/types";
import { Loader2 } from "lucide-react";

type FornecedorOption = { id: string; nome: string };

interface InsumoFormProps {
  fornecedorOptions: FornecedorOption[];
  id?: string;
  initialData?: {
    nome: string;
    tipo: string;
    unidade: string;
    quantidadeEstoque: number;
    estoqueMinimo: number;
    precoUnitario: number | null;
    fornecedorId: string | null;
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
      {isEdit ? "Atualizar Insumo" : "Cadastrar Insumo"}
    </button>
  );
}

const inputBase =
  "flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export function InsumoForm({ fornecedorOptions, id, initialData, onSuccess }: InsumoFormProps) {
  const action = id ? atualizarInsumo.bind(null, id) : criarInsumo;
  const [state, formAction] = useFormState(action, initialFormState);

  useEffect(() => {
    if (state.ok && onSuccess) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">Nome</label>
          <input
            id="nome"
            name="nome"
            defaultValue={initialData?.nome}
            placeholder="Ex: Ureia 45%"
            className={`${inputBase} ${state.errors?.nome ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.nome && <p className="text-sm text-red-500">{state.errors.nome}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="tipo" className="text-sm font-medium">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={initialData?.tipo ?? ""}
            className={`${inputBase} ${state.errors?.tipo ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Selecione...</option>
            <option value="SEMENTE">Semente</option>
            <option value="FERTILIZANTE">Fertilizante</option>
            <option value="DEFENSIVO">Defensivo</option>
            <option value="COMBUSTIVEL">Combustível</option>
            <option value="OUTRO">Outro</option>
          </select>
          {state.errors?.tipo && <p className="text-sm text-red-500">{state.errors.tipo}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="unidade" className="text-sm font-medium">Unidade</label>
          <input
            id="unidade"
            name="unidade"
            defaultValue={initialData?.unidade}
            placeholder="kg, L, sc"
            className={`${inputBase} ${state.errors?.unidade ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.unidade && <p className="text-sm text-red-500">{state.errors.unidade}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="quantidadeEstoque" className="text-sm font-medium">Estoque</label>
          <input
            id="quantidadeEstoque"
            name="quantidadeEstoque"
            type="number"
            step="0.01"
            defaultValue={initialData?.quantidadeEstoque ?? 0}
            className={`${inputBase} ${state.errors?.quantidadeEstoque ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.quantidadeEstoque && (
            <p className="text-sm text-red-500">{state.errors.quantidadeEstoque}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="estoqueMinimo" className="text-sm font-medium">Estoque Mín.</label>
          <input
            id="estoqueMinimo"
            name="estoqueMinimo"
            type="number"
            step="0.01"
            defaultValue={initialData?.estoqueMinimo ?? 0}
            className={`${inputBase} ${state.errors?.estoqueMinimo ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.estoqueMinimo && (
            <p className="text-sm text-red-500">{state.errors.estoqueMinimo}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="precoUnitario" className="text-sm font-medium">
            Preço Unit. (R$) <span className="text-gray-400">(opcional)</span>
          </label>
          <input
            id="precoUnitario"
            name="precoUnitario"
            type="number"
            step="0.01"
            defaultValue={initialData?.precoUnitario ?? ""}
            placeholder="0,00"
            className={`${inputBase} ${state.errors?.precoUnitario ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.precoUnitario && (
            <p className="text-sm text-red-500">{state.errors.precoUnitario}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="fornecedorId" className="text-sm font-medium">
            Fornecedor <span className="text-gray-400">(opcional)</span>
          </label>
          <select
            id="fornecedorId"
            name="fornecedorId"
            defaultValue={initialData?.fornecedorId ?? ""}
            className={`${inputBase} border-gray-300`}
          >
            <option value="">Nenhum</option>
            {fornecedorOptions.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
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
