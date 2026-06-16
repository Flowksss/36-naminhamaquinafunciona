"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-actions";
import { initialFormState } from "@/lib/types";
import { Loader2, KeyRound } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="od-btn w-full justify-center">
      {pending ? <Loader2 size={16} className="od-spin" /> : <KeyRound size={16} />}
      {pending ? "Salvando..." : "Redefinir senha"}
    </button>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPassword, initialFormState);

  if (state.ok) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-3 rounded-xl text-sm bg-[var(--od-accent-glow)] text-[var(--od-accent)] border border-[var(--od-accent)]">
          {state.message}
        </div>
        <Link href="/login" className="od-btn w-full justify-center">Ir para o login</Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <label htmlFor="password" className="od-label">Nova senha</label>
        <input id="password" name="password" type="password" required minLength={8} className={`od-input ${state.errors?.password ? "od-input-error" : ""}`} placeholder="mínimo 8 caracteres" />
        {state.errors?.password && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.password}</p>}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="confirm" className="od-label">Confirmar nova senha</label>
        <input id="confirm" name="confirm" type="password" required className={`od-input ${state.errors?.confirm ? "od-input-error" : ""}`} placeholder="••••••••" />
        {state.errors?.confirm && <p className="text-xs text-[var(--od-red)] mt-1">{state.errors.confirm}</p>}
      </div>

      {state.message && !state.ok && (
        <div className="p-3 rounded-xl text-sm bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]">
          {state.message}
        </div>
      )}

      <SubmitButton />

      <p className="text-center text-sm od-muted">
        <Link href="/forgot-password" className="text-[var(--od-accent)] hover:underline">Solicitar novo link</Link>
      </p>
    </form>
  );
}
