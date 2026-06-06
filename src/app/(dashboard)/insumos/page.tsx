import { getInsumos, getFornecedorOptions } from "./queries";
import { InsumosClient } from "./insumos-client";

export const dynamic = "force-dynamic";

export default async function InsumosPage() {
  const [insumos, fornecedorOptions] = await Promise.all([getInsumos(), getFornecedorOptions()]);
  return <InsumosClient insumos={insumos} fornecedorOptions={fornecedorOptions} />;
}
