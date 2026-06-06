import { notFound } from "next/navigation";
import { getAtivoProfile } from "./queries";
import { AtivoProfileClient } from "./profile-client";

export const dynamic = "force-dynamic";

export default async function AtivoPage({ params }: { params: { id: string } }) {
  const data = await getAtivoProfile(params.id);
  if (!data) notFound();
  return <AtivoProfileClient data={data} />;
}
