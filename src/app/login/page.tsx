"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShaderBackground } from "@/components/shader-background";
import { getContextoFazenda, setFazendaContext } from "@/lib/fazenda-actions";
import { Loader2, ArrowRight, MapPin, Layers } from "lucide-react";

type Fazenda = { id: string; nome: string };

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou senha inválidos");
      setLoading(false);
      return;
    }

    // carrega fazendas e vai p/ etapa 2
    const ctx = await getContextoFazenda();
    setFazendas(ctx.fazendas);
    setLoading(false);
    setStep(2);
  }

  async function escolherFazenda(id: string) {
    setLoading(true);
    await setFazendaContext(id);
    router.push("/operacao");
  }

  return (
    <div className="od-console flex items-center justify-center">
      <ShaderBackground />
      <div className="relative z-10 w-full max-w-md od-panel p-8">
        <div className="mb-8 text-center">
          <div className="od-logo text-3xl mb-1">CCT <span className="text-[var(--od-fg)]">SINCRO</span></div>
          <p className="od-muted">Inteligência operacional para o agro</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleCredentials} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="od-label">Email</label>
              <input id="email" name="email" type="email" required className="od-input" placeholder="gestor@cctsincro.com" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="od-label">Senha</label>
              <input id="password" name="password" type="password" required className="od-input" placeholder="••••••••" />
            </div>
            {error && (
              <div className="p-3 rounded-xl text-sm bg-[var(--od-red-glow)] text-[var(--od-red)] border border-[var(--od-red)]">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="od-btn w-full justify-center">
              {loading ? <Loader2 size={16} className="od-spin" /> : <ArrowRight size={16} />}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-center mb-2">Qual unidade deseja acessar?</p>

            <button
              onClick={() => escolherFazenda("ALL")}
              disabled={loading}
              className="w-full flex items-center gap-3 od-panel p-4 hover:border-[var(--od-accent)] transition-colors text-left disabled:opacity-50"
            >
              <Layers size={18} className="text-[var(--od-accent)]" />
              <span className="font-medium">Todas as fazendas</span>
              <span className="od-muted ml-auto text-xs">visão geral</span>
            </button>

            {fazendas.map((f) => (
              <button
                key={f.id}
                onClick={() => escolherFazenda(f.id)}
                disabled={loading}
                className="w-full flex items-center gap-3 od-panel p-4 hover:border-[var(--od-accent)] transition-colors text-left disabled:opacity-50"
              >
                <MapPin size={18} className="text-[var(--od-muted)]" />
                <span className="font-medium">{f.nome}</span>
              </button>
            ))}

            {loading && (
              <div className="flex items-center justify-center gap-2 od-muted pt-2">
                <Loader2 size={16} className="od-spin" /> Carregando...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
