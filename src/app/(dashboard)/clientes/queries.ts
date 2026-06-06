import { db } from "@/lib/db";

export async function getClientes() {
  return db.cliente.findMany({ orderBy: { nome: "asc" } });
}

export async function getCliente(id: string) {
  return db.cliente.findUnique({ where: { id } });
}

export type ClienteListItem = Awaited<ReturnType<typeof getClientes>>[number];
