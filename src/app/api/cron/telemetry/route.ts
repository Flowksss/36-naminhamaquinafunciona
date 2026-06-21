import { NextResponse } from "next/server";
import { sincronizarTodos } from "@/lib/telemetry/sync";

export const dynamic = "force-dynamic";

/**
 * Job de telemetria: sincroniza todas as orgs com máquinas ligadas ao provedor.
 * Pensado para o Vercel Cron (envia `Authorization: Bearer ${CRON_SECRET}`).
 * Para ativar em produção, adicione ao vercel.json:
 *   { "crons": [{ "path": "/api/cron/telemetry", "schedule": "* /10 * * * *" }] }
 * (só após o SimWorld estar hospedado num host alcançável pela Vercel.)
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const r = await sincronizarTodos();
    return NextResponse.json({ ok: true, ...r });
  } catch {
    return NextResponse.json({ ok: false, error: "sync failed" }, { status: 500 });
  }
}
