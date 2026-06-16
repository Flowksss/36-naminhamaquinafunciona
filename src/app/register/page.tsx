"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ShaderBackground } from "@/components/shader-background";
import { registerUser } from "@/lib/auth-actions";
import type { FormState } from "@/lib/types";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({ ok: false });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const result = await registerUser(formData);

    if (!result.ok) {
      setState(result);
      setLoading(false);
      return;
    }

    // auto-login após cadastro
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const signin = await signIn("credentials", { email, password, redirect: false });

    if (signin?.error) {
      router.push("/login");
      return;
    }
    router.push("/fazendas"); // org nova começa vazia: criar a primeira unidade
  }

  const err = state.errors ?? {};

  return (
    <div className="od-console flex items-center justify-center">
      <ShaderBackground />
      <div className="relative z-10 w-full max-w-md od-panel p-8">
        <div className="mb-8 text-center">
          <div className="od-logo text-3xl mb-1">CCT <span className="text-[var(--od-fg)]">SINCRO</span></div>
          <p className="od-muted">Criar nova conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="organizacao" className="od-label">Empresa / Organização</label>
            <input id="organizacao" name="organizacao" required className={`od-input ${err.organizacao ? "od-input-error" : ""}`} placeholder="Ex: Agro Norte" />
            {err.organizacao && <p className="text-xs text-[var(--od-red)] mt-1">{err.organizacao}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="name" className="od-label">Seu nome</label>
            <input id="name" name="name" required className={`od-input ${err.name ? "od-input-error" : ""}`} placeholder="Ex: Maria Souza" />
            {err.name && <p className="text-xs text-[var(--od-red)] mt-1">{err.name}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="od-label">Email</label>
            <input id="email" name="email" type="email" required className={`od-input ${err.email ? "od-input-error" : ""}`} placeholder="voce@empresa.com" />
            {err.email && <p className="text-xs text-[var(--od-red)] mt-1">{err.email}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="od-label">Senha</label>
            <input id="password" name="password" type="password" required minLength={8} className={`od-input ${err.password ? "od-input-error" : ""}`} placeholder="mínimo 8 caracteres" />
            {err.password && <p className="text-xs text-[var(--od-red)] mt-1">{err.password}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="od-label">Confirmar senha</label>
            <input id="confirm" name="confirm" type="password" required className={`od-input ${err.confirm ? "od-input-error" : ""}`} placeholder="••••••••" />
            {err.confirm && <p className="text-xs text-[var(--od-red)] mt-1">{err.confirm}</p>}
          </div>

          {state.message && !state.ok && (
            <div className="p-3 rounded-xl text-sm bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]">
              {state.message}
            </div>
          )}

          <button type="submit" disabled={loading} className="od-btn w-full justify-center">
            {loading ? <Loader2 size={16} className="od-spin" /> : <UserPlus size={16} />}
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm od-muted mt-6">
          Já tem conta? <Link href="/login" className="text-[var(--od-accent)] hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
