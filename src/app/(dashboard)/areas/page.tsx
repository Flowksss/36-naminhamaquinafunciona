import { getAreasPageData } from "./queries";
import { AreasClient } from "./areas-client";

export const dynamic = "force-dynamic";

export default async function AreasPage() {
  const data = await getAreasPageData();
  return <AreasClient data={data} />;
}
