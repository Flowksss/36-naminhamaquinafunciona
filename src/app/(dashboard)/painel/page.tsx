import { getPainelData } from "./queries";
import { PainelClient } from "./painel-client";

export const dynamic = "force-dynamic";

export default async function PainelPage() {
  const data = await getPainelData();
  return <PainelClient data={data} />;
}
