"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarTransacao, atualizarTransacao } from "./actions";
import { initialFormState } from "@/lib/types";
import { Loader2 } from "lucide-react";

type SafraOption = { id: string; cultura: string; fazenda: { nome: string } };
type Option = { id: string; nome: string };

interface TransacaoFormProps {
  options: { safras: SafraOption[]; fornecedores: Option[]; clientes: Option[] };
  id?: string;
  initialData?: {
    tipo: string;
    valor: number;
    descricao: string;
    data: string;
    safraId: string | null;
    fornecedorId: string | null;
    clienteId: string | null;
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
      {isEdit ? "Atualizar Transação" : "Registrar Transação"}
    </button>
  );
}

const inputBase =
  "flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export function TransacaoForm({ options, id, initialData, onSuccess }: TransacaoFormProps) {
  const action = id ? atualizarTransacao.bind(null, id) : criarTransacao;
  const [state, formAction] = useFormState(action, initialFormState);

  useEffect(() => {
    if (state.ok && onSuccess) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="tipo" className="text-sm font-medium">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={initialData?.tipo ?? ""}
            className={`${inputBase} ${state.errors?.tipo ? "border-red-500" : "border-gray-300"}`}
          >
            <option value="">Selecione...</option>
            <option value="RECEITA">Receita</option>
            <option value="DESPESA">Despesa</option>
          </select>
          {state.errors?.tipo && <p className="text-sm text-red-500">{state.errors.tipo}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="valor" className="text-sm font-medium">Valor (R$)</label>
          <input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            defaultValue={initialData?.valor}
            placeholder="0,00"
            className={`${inputBase} ${state.errors?.valor ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.valor && <p className="text-sm text-red-500">{state.errors.valor}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="data" className="text-sm font-medium">Data</label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={initialData?.data}
            className={`${inputBase} ${state.errors?.data ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.data && <p className="text-sm text-red-500">{state.errors.data}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="descricao" className="text-sm font-medium">Descrição</label>
        <input
          id="descricao"
          name="descricao"
          defaultValue={initialData?.descricao}
          placeholder="Ex: Venda de soja safra 24/25"
          className={`${inputBase} ${state.errors?.descricao ? "border-red-500" : "border-gray-300"}`}
        />
        {state.errors?.descricao && <p className="text-sm text-red-500">{state.errors.descricao}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="safraId" className="text-sm font-medium">
            Safra <span className="text-gray-400">(opc.)</span>
          </label>
          <select id="safraId" name="safraId" defaultValue={initialData?.safraId ?? ""} className={`${inputBase} border-gray-300`}>
            <option value="">Nenhuma</option>
            {options.safras.map((s) => (
              <option key={s.id} value={s.id}>{s.fazenda.nome} – {s.cultura}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="fornecedorId" className="text-sm font-medium">
            Fornecedor <span className="text-gray-400">(opc.)</span>
          </label>
          <select id="fornecedorId" name="fornecedorId" defaultValue={initialData?.fornecedorId ?? ""} className={`${inputBase} border-gray-300`}>
            <option value="">Nenhum</option>
            {options.fornecedores.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="clienteId" className="text-sm font-medium">
            Cliente <span className="text-gray-400">(opc.)</span>
          </label>
          <select id="clienteId" name="clienteId" defaultValue={initialData?.clienteId ?? ""} className={`${inputBase} border-gray-300`}>
            <option value="">Nenhum</option>
            {options.clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
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
