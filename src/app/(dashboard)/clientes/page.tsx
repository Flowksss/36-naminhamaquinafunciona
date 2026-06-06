import { getClientes } from "./queries";
import { ClientesClient } from "./clientes-client";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await getClientes();
  return <ClientesClient clientes={clientes} />;
}
