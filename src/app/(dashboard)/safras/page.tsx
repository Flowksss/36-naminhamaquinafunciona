import { getSafras, getFazendaOptions } from "./queries";
import { SafrasClient } from "./safras-client";

export const dynamic = "force-dynamic";

export default async function SafrasPage() {
  const [safras, fazendaOptions] = await Promise.all([getSafras(), getFazendaOptions()]);
  return <SafrasClient safras={safras} fazendaOptions={fazendaOptions} />;
}
