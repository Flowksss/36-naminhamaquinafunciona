"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { FAZENDA_COOKIE } from "@/lib/fazenda-context";

/** Define a fazenda ativa (cookie). id vazio ou "ALL" = todas. */
export async function setFazendaContext(id: string) {
  cookies().set(FAZENDA_COOKIE, id || "ALL", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  revalidatePath("/operacao");
  revalidatePath("/mapa");
  revalidatePath("/dashboard");
}

/** Lista de fazendas + seleção atual, para o seletor. */
export async function getContextoFazenda() {
  const [fazendas, atualCookie] = await Promise.all([
    db.fazenda.findMany({ select: { id: true, nome: true }, orderBy: { nome: "asc" } }),
    Promise.resolve(cookies().get(FAZENDA_COOKIE)?.value ?? "ALL"),
  ]);
  return { fazendas, atual: atualCookie };
}
