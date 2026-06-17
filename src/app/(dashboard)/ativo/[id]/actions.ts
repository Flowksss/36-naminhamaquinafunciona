"use server";

import { revalidatePath } from "next/cache";
import { requireOrgId } from "@/lib/session";
import { aplicarLeitura } from "@/lib/telemetry/ingest";
import type { FormState } from "@/lib/types";

function num(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Registra uma leitura manual de telemetria para um ativo (Fase 0). */
export async function registrarLeitura(ativoId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  let orgId: string;
  try {
    orgId = await requireOrgId();
  } catch {
    return { ok: false, message: "Sessão expirada. Entre novamente." };
  }

  const consumoAtual = num(formData.get("consumoAtual"));
  const nivelCombustivel = num(formData.get("nivelCombustivel"));
  const lat = num(formData.get("lat"));
  const lng = num(formData.get("lng"));
  const horasOperadas = num(formData.get("horasOperadas"));

  const errors: Record<string, string> = {};
  if (consumoAtual !== null && consumoAtual < 0) errors.consumoAtual = "Valor inválido";
  if (nivelCombustivel !== null && (nivelCombustivel < 0 || nivelCombustivel > 100)) errors.nivelCombustivel = "0 a 100";
  if (horasOperadas !== null && horasOperadas < 0) errors.horasOperadas = "Valor inválido";
  if (consumoAtual === null && nivelCombustivel === null && lat === null && lng === null && (horasOperadas ?? 0) === 0) {
    return { ok: false, message: "Informe ao menos um valor para registrar a leitura." };
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  try {
    await aplicarLeitura(orgId, {
      ativoId,
      consumoAtual: consumoAtual ?? undefined,
      nivelCombustivel: nivelCombustivel ?? undefined,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      horasOperadas: horasOperadas ?? undefined,
      timestamp: new Date(),
    });
  } catch {
    return { ok: false, message: "Não foi possível registrar a leitura." };
  }

  revalidatePath(`/ativo/${ativoId}`);
  revalidatePath("/operacao");
  revalidatePath("/mapa");
  revalidatePath("/dashboard");
  return { ok: true, message: "Leitura registrada" };
}
