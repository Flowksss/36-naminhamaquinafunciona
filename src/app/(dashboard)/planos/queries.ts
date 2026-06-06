import { db } from "@/lib/db";

export type Plano = {
  id: string;
  nome: string;
  limite: number;
  preco: number;
  destaque?: boolean;
};

// Planos por volume de ativos (pitch CCT-Sincro).
export const PLANOS: Plano[] = [
  { id: "START", nome: "Start", limite: 30, preco: 1490 },
  { id: "GROWTH", nome: "Growth", limite: 100, preco: 3990, destaque: true },
  { id: "ENTERPRISE", nome: "Enterprise", limite: 300, preco: 8990 },
];

export async function getPlanoInfo() {
  const totalAtivos = await db.ativo.count();
  const atual = PLANOS.find((p) => totalAtivos <= p.limite) ?? PLANOS[PLANOS.length - 1];
  return { totalAtivos, planoAtualId: atual.id, limiteAtual: atual.limite, planos: PLANOS };
}
