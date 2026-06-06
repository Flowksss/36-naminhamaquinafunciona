import { getFazendas } from "./queries";
import { FazendasClient } from "./fazendas-client";

export const dynamic = "force-dynamic";

export default async function FazendasPage() {
  const fazendas = await getFazendas();

  return <FazendasClient fazendas={fazendas} />;
}
