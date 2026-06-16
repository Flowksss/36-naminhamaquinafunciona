import { ShaderBackground } from "@/components/shader-background";
import { ResetForm } from "./reset-form";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token ?? "";

  return (
    <div className="od-console flex items-center justify-center">
      <ShaderBackground />
      <div className="relative z-10 w-full max-w-md od-panel p-8">
        <div className="mb-8 text-center">
          <div className="od-logo text-3xl mb-1">CCT <span className="text-[var(--od-fg)]">SINCRO</span></div>
          <p className="od-muted">Definir nova senha</p>
        </div>
        <ResetForm token={token} />
      </div>
    </div>
  );
}
