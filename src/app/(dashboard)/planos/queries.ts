import type { PlanoTier } from "@prisma/client";
import { db } from "@/lib/db";
import { requireOrgId } from "@/lib/session";

export type Plano = {
  id: PlanoTier;
  nome: string;
  limite: number;
  preco: number;
  destaque?: boolean;
};

// Planos por volume de ativos (pitch CCT SINCRO).
export const PLANOS: Plano[] = [
  { id: "START", nome: "Start", limite: 30, preco: 1490 },
  { id: "GROWTH", nome: "Growth", limite: 100, preco: 3990, destaque: true },
  { id: "ENTERPRISE", nome: "Enterprise", limite: 300, preco: 8990 },
];

// Plano atual = o que a org assinou (campo no tenant). O uso (totalAtivos)
// é comparado ao limite só para sinalizar quando faz sentido upgrade.
export async function getPlanoInfo() {
  const orgId = await requireOrgId();
  const [org, totalAtivos] = await Promise.all([
    db.organizacao.findUnique({ where: { id: orgId }, select: { plano: true } }),
    db.ativo.count({ where: { organizacaoId: orgId } }),
  ]);
  const planoId = org?.plano ?? "START";
  const atual = PLANOS.find((p) => p.id === planoId) ?? PLANOS[0];
  return { totalAtivos, planoAtualId: atual.id, limiteAtual: atual.limite, planos: PLANOS };
}
