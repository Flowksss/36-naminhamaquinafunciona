import { getTransacoes, getTransacaoOptions } from "./queries";
import { FinanceiroClient } from "./financeiro-client";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const [transacoes, options] = await Promise.all([getTransacoes(), getTransacaoOptions()]);
  return <FinanceiroClient transacoes={transacoes} options={options} />;
}
