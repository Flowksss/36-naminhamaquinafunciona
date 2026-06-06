"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarFornecedor, atualizarFornecedor } from "./actions";
import { initialFormState } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface FornecedorFormProps {
  id?: string;
  initialData?: {
    nome: string;
    cnpj: string | null;
    email: string | null;
    telefone: string | null;
    endereco: string | null;
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
      {isEdit ? "Atualizar Fornecedor" : "Cadastrar Fornecedor"}
    </button>
  );
}

const inputBase =
  "flex h-10 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

export function FornecedorForm({ id, initialData, onSuccess }: FornecedorFormProps) {
  const action = id ? atualizarFornecedor.bind(null, id) : criarFornecedor;
  const [state, formAction] = useFormState(action, initialFormState);

  useEffect(() => {
    if (state.ok && onSuccess) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium">Nome / Razão Social</label>
        <input
          id="nome"
          name="nome"
          defaultValue={initialData?.nome}
          placeholder="Ex: AgroInsumos LTDA"
          className={`${inputBase} ${state.errors?.nome ? "border-red-500" : "border-gray-300"}`}
        />
        {state.errors?.nome && <p className="text-sm text-red-500">{state.errors.nome}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="cnpj" className="text-sm font-medium">
            CNPJ <span className="text-gray-400">(opcional)</span>
          </label>
          <input id="cnpj" name="cnpj" defaultValue={initialData?.cnpj ?? ""} placeholder="00.000.000/0000-00" className={`${inputBase} border-gray-300`} />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-gray-400">(opcional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={initialData?.email ?? ""}
            placeholder="contato@empresa.com"
            className={`${inputBase} ${state.errors?.email ? "border-red-500" : "border-gray-300"}`}
          />
          {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="telefone" className="text-sm font-medium">
            Telefone <span className="text-gray-400">(opcional)</span>
          </label>
          <input id="telefone" name="telefone" defaultValue={initialData?.telefone ?? ""} placeholder="(00) 00000-0000" className={`${inputBase} border-gray-300`} />
        </div>
        <div className="space-y-2">
          <label htmlFor="endereco" className="text-sm font-medium">
            Endereço <span className="text-gray-400">(opcional)</span>
          </label>
          <input id="endereco" name="endereco" defaultValue={initialData?.endereco ?? ""} placeholder="Cidade - UF" className={`${inputBase} border-gray-300`} />
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
