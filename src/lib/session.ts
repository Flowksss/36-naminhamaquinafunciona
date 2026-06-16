import { getServerSession } from "next-auth";
import type { Role } from "@prisma/client";
import { authOptions } from "./auth";

/** Sessão atual (ou null). Server-only. */
export function getAuthSession() {
  return getServerSession(authOptions);
}

/**
 * Org da sessão. Fonte de verdade do isolamento multiunidade — todas as
 * queries de dados do tenant DEVEM filtrar por este id. Nunca vem de cookie
 * ou input do cliente. Lança se não autenticado.
 */
export async function requireOrgId(): Promise<string> {
  const session = await getAuthSession();
  if (!session?.user?.organizacaoId) {
    throw new Error("Não autenticado");
  }
  return session.user.organizacaoId;
}

/**
 * Exige sessão com um dos papéis informados. Usado em server actions que
 * mutam dados. Retorna { orgId, role } já validados.
 */
export async function requireRole(...roles: Role[]): Promise<{ orgId: string; role: Role }> {
  const session = await getAuthSession();
  if (!session?.user?.organizacaoId) {
    throw new Error("Não autenticado");
  }
  if (roles.length > 0 && !roles.includes(session.user.role)) {
    throw new Error("Permissão insuficiente");
  }
  return { orgId: session.user.organizacaoId, role: session.user.role };
}
