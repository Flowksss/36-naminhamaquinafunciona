// CONTRATO COMPARTILHADO entre backend (Claude) e UI (Gemini).
// NÃO mudar sem avisar o time — quebra todos os forms.

/**
 * Retorno padrão de toda Server Action.
 * Forms usam via: const [state, action] = useActionState(minhaAction, initialFormState)
 */
export type FormState = {
  ok: boolean;
  // Erros por campo. Chave = name do input. Ex: { nome: "Obrigatório" }
  errors?: Record<string, string>;
  // Mensagem geral (sucesso ou erro não atrelado a campo)
  message?: string;
};

export const initialFormState: FormState = { ok: false };
