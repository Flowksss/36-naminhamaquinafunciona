import { getMapaFrota } from "./queries";
import { MapaClient } from "./mapa-client";

export const dynamic = "force-dynamic";

export default async function MapaPage() {
  const data = await getMapaFrota();
  return <MapaClient data={data} />;
}
