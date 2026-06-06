import { db } from "@/lib/db";

export default async function FazendasPage() {
  const fazendas = await db.fazenda.findMany({
    include: { _count: { select: { safras: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fazendas</h1>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Nova Fazenda
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Localização</th>
              <th className="text-right px-4 py-3 font-medium">Área (ha)</th>
              <th className="text-left px-4 py-3 font-medium">Tipo Solo</th>
              <th className="text-right px-4 py-3 font-medium">Safras</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fazendas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma fazenda cadastrada
                </td>
              </tr>
            ) : (
              fazendas.map((f) => (
                <tr key={f.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{f.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.localizacao}</td>
                  <td className="px-4 py-3 text-right">{f.area.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.tipoSolo ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{f._count.safras}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
