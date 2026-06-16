"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { ShaderBackground } from "@/components/shader-background";
import { requestPasswordReset } from "@/lib/auth-actions";
import { initialFormState } from "@/lib/types";
import { Loader2, Mail } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="od-btn w-full justify-center">
      {pending ? <Loader2 size={16} className="od-spin" /> : <Mail size={16} />}
      {pending ? "Enviando..." : "Enviar link de recuperação"}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordReset, initialFormState);

  return (
    <div className="od-console flex items-center justify-center">
      <ShaderBackground />
      <div className="relative z-10 w-full max-w-md od-panel p-8">
        <div className="mb-8 text-center">
          <div className="od-logo text-3xl mb-1">CCT <span className="text-[var(--od-fg)]">SINCRO</span></div>
          <p className="od-muted">Recuperar senha</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="od-label">Email da conta</label>
            <input id="email" name="email" type="email" required className={`od-input ${state.errors?.email ? "od-input-error" : ""}`} placeholder="voce@empresa.com" />
            {state.errors?.email && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.email}</p>}
          </div>

          {state.message && (
            <div className={`p-3 rounded-xl text-sm ${state.ok ? "bg-[var(--od-accent-glow)] text-[var(--od-accent)] border border-[var(--od-accent)]" : "bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]"}`}>
              {state.message}
            </div>
          )}

          <SubmitButton />
        </form>

        <p className="text-center text-sm od-muted mt-6">
          <Link href="/login" className="text-[var(--od-accent)] hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </div>
  );
}
