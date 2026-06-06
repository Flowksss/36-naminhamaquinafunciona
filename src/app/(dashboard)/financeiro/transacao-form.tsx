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
      className="od-btn w-full"
    >
      {pending ? <Loader2 className="mr-2 h-4 w-4 od-spin" /> : null}
      {isEdit ? "Atualizar Registro" : "Confirmar Lançamento"}
    </button>
  );
}

export function TransacaoForm({ options, id, initialData, onSuccess }: TransacaoFormProps) {
  const action = id ? atualizarTransacao.bind(null, id) : criarTransacao;
  const [state, formAction] = useFormState(action, initialFormState);

  useEffect(() => {
    if (state.ok && onSuccess) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="od-panel p-6 space-y-5 max-w-4xl mx-auto">
      <div className="od-panelhead mb-4 -mx-6 -mt-6">
        <h2>{id ? "Editar Lançamento" : "Novo Lançamento Financeiro"}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="tipo" className="od-label">Tipo</label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={initialData?.tipo ?? ""}
            className={`od-select ${state.errors?.tipo ? "od-input-error" : ""}`}
          >
            <option value="">Selecione...</option>
            <option value="RECEITA">Receita (+)</option>
            <option value="DESPESA">Despesa (−)</option>
          </select>
          {state.errors?.tipo && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.tipo}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="valor" className="od-label">Valor (R$)</label>
          <input
            id="valor"
            name="valor"
            type="number"
            step="0.01"
            defaultValue={initialData?.valor}
            placeholder="0,00"
            className={`od-input ${state.errors?.valor ? "od-input-error" : ""}`}
          />
          {state.errors?.valor && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.valor}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="data" className="od-label">Data</label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={initialData?.data ?? new Date().toISOString().split("T")[0]}
            className={`od-input ${state.errors?.data ? "od-input-error" : ""}`}
          />
          {state.errors?.data && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.data}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="descricao" className="od-label">Descrição</label>
        <input
          id="descricao"
          name="descricao"
          defaultValue={initialData?.descricao}
          placeholder="Ex: Venda de soja safra 24/25"
          className={`od-input ${state.errors?.descricao ? "od-input-error" : ""}`}
        />
        {state.errors?.descricao && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.descricao}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="safraId" className="od-label">Safra <small className="opacity-50">(opc.)</small></label>
          <select id="safraId" name="safraId" defaultValue={initialData?.safraId ?? ""} className="od-select">
            <option value="">Nenhuma</option>
            {options.safras.map((s) => (
              <option key={s.id} value={s.id}>{s.fazenda.nome} – {s.cultura}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="fornecedorId" className="od-label">Fornecedor <small className="opacity-50">(opc.)</small></label>
          <select id="fornecedorId" name="fornecedorId" defaultValue={initialData?.fornecedorId ?? ""} className="od-select">
            <option value="">Nenhum</option>
            {options.fornecedores.map((f) => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="clienteId" className="od-label">Cliente <small className="opacity-50">(opc.)</small></label>
          <select id="clienteId" name="clienteId" defaultValue={initialData?.clienteId ?? ""} className="od-select">
            <option value="">Nenhum</option>
            {options.clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
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
