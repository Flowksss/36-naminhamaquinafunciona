import { db } from "@/lib/db";

export async function getSafras() {
  return db.safra.findMany({
    include: { fazenda: true },
    orderBy: { dataPlantio: "desc" },
  });
}

export async function getSafra(id: string) {
  return db.safra.findUnique({
    where: { id },
    include: { fazenda: true },
  });
}

/** Opções para o <select> de fazenda no form de safra (UI/Gemini). */
export async function getFazendaOptions() {
  return db.fazenda.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
}

export type SafraListItem = Awaited<ReturnType<typeof getSafras>>[number];
