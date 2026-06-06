import { cookies } from "next/headers";

export const FAZENDA_COOKIE = "cct_fazenda";

/**
 * Fazenda selecionada (cookie). null = "Todas as fazendas".
 * Lido em Server Components / queries.
 */
export function getFazendaContext(): string | null {
  const v = cookies().get(FAZENDA_COOKIE)?.value;
  return v && v !== "ALL" ? v : null;
}
