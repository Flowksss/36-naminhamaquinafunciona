import { getFornecedores } from "./queries";
import { FornecedoresClient } from "./fornecedores-client";

export const dynamic = "force-dynamic";

export default async function FornecedoresPage() {
  const fornecedores = await getFornecedores();
  return <FornecedoresClient fornecedores={fornecedores} />;
}
