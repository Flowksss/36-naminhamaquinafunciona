import { getFrotaPageData } from "./queries";
import { FrotaClient } from "./frota-client";

export const dynamic = "force-dynamic";

export default async function FrotaPage() {
  const data = await getFrotaPageData();
  return <FrotaClient data={data} />;
}
