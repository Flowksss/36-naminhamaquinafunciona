import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  PLANEJADA: "Planejada",
  EM_ANDAMENTO: "Em Andamento",
  COLHIDA: "Colhida",
  CANCELADA: "Cancelada",
};

const statusColor: Record<string, string> = {
  PLANEJADA: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-green-100 text-green-700",
  COLHIDA: "bg-gray-100 text-gray-700",
  CANCELADA: "bg-red-100 text-red-700",
};

export default async function SafrasPage() {
  const safras = await db.safra.findMany({
    include: { fazenda: true },
    orderBy: { dataPlantio: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Safras</h1>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Nova Safra
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Fazenda</th>
              <th className="text-left px-4 py-3 font-medium">Cultura</th>
              <th className="text-left px-4 py-3 font-medium">Plantio</th>
              <th className="text-left px-4 py-3 font-medium">Colheita Prev.</th>
              <th className="text-right px-4 py-3 font-medium">Área (ha)</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {safras.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma safra cadastrada
                </td>
              </tr>
            ) : (
              safras.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{s.fazenda.nome}</td>
                  <td className="px-4 py-3">{s.cultura}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.dataPlantio)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.dataColheitaPrevista)}</td>
                  <td className="px-4 py-3 text-right">{s.areaPlantada.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[s.status]}`}>
                      {statusLabel[s.status]}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
