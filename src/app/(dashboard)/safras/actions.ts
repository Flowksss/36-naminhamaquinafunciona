"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { FormState } from "@/lib/types";

const STATUS = ["PLANEJADA", "EM_ANDAMENTO", "COLHIDA", "CANCELADA"] as const;

function parseSafra(formData: FormData) {
  const fazendaId = String(formData.get("fazendaId") ?? "").trim();
  const cultura = String(formData.get("cultura") ?? "").trim();
  const dataPlantioRaw = String(formData.get("dataPlantio") ?? "").trim();
  const dataColheitaRaw = String(formData.get("dataColheitaPrevista") ?? "").trim();
  const areaRaw = String(formData.get("areaPlantada") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "PLANEJADA").trim();
  const qtdRaw = String(formData.get("quantidadePrevista") ?? "").trim();

  const errors: Record<string, string> = {};
  if (!fazendaId) errors.fazendaId = "Selecione a fazenda";
  if (!cultura) errors.cultura = "Cultura é obrigatória";
  if (!dataPlantioRaw) errors.dataPlantio = "Data de plantio é obrigatória";
  if (!dataColheitaRaw) errors.dataColheitaPrevista = "Data de colheita prevista é obrigatória";

  const areaPlantada = Number(areaRaw.replace(",", "."));
  if (!areaRaw) errors.areaPlantada = "Área plantada é obrigatória";
  else if (Number.isNaN(areaPlantada) || areaPlantada <= 0)
    errors.areaPlantada = "Área deve ser um número positivo";

  const status = (STATUS as readonly string[]).includes(statusRaw) ? statusRaw : "PLANEJADA";
  const quantidadePrevista = qtdRaw ? Number(qtdRaw.replace(",", ".")) : null;

  return {
    errors,
    data: {
      fazendaId,
      cultura,
      dataPlantio: new Date(dataPlantioRaw),
      dataColheitaPrevista: new Date(dataColheitaRaw),
      areaPlantada,
      status: status as (typeof STATUS)[number],
      quantidadePrevista,
    },
  };
}

export async function criarSafra(_prev: FormState, formData: FormData): Promise<FormState> {
  const { errors, data } = parseSafra(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  try {
    await db.safra.create({ data });
  } catch {
    return { ok: false, message: "Erro ao salvar safra." };
  }
  revalidatePath("/safras");
  return { ok: true, message: "Safra criada com sucesso" };
}

export async function atualizarSafra(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { errors, data } = parseSafra(formData);
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  try {
    await db.safra.update({ where: { id }, data });
  } catch {
    return { ok: false, message: "Erro ao atualizar safra." };
  }
  revalidatePath("/safras");
  return { ok: true, message: "Safra atualizada" };
}

export async function deletarSafra(id: string): Promise<FormState> {
  try {
    await db.safra.delete({ where: { id } });
  } catch {
    return { ok: false, message: "Erro ao excluir. Verifique vínculos (estoque/transações)." };
  }
  revalidatePath("/safras");
  return { ok: true, message: "Safra excluída" };
}
