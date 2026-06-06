import { getEstadoFrota } from "./queries";
import { OperacaoClient } from "./operacao-client";

export const dynamic = "force-dynamic";

export default async function OperacaoPage() {
  const estado = await getEstadoFrota();
  return <OperacaoClient estado={estado} />;
}
