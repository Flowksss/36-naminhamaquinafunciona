import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

const tipoLabel: Record<string, string> = {
  SEMENTE: "Semente",
  FERTILIZANTE: "Fertilizante",
  DEFENSIVO: "Defensivo",
  COMBUSTIVEL: "Combustível",
  OUTRO: "Outro",
};

export default async function InsumosPage() {
  const insumos = await db.insumo.findMany({
    include: { fornecedor: true },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Insumos / Estoque</h1>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Novo Insumo
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-right px-4 py-3 font-medium">Estoque</th>
              <th className="text-left px-4 py-3 font-medium">Unidade</th>
              <th className="text-right px-4 py-3 font-medium">Preço Unit.</th>
              <th className="text-left px-4 py-3 font-medium">Fornecedor</th>
              <th className="text-center px-4 py-3 font-medium">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {insumos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum insumo cadastrado
                </td>
              </tr>
            ) : (
              insumos.map((i) => {
                const baixoEstoque = i.quantidadeEstoque <= i.estoqueMinimo;
                return (
                  <tr key={i.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{i.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{tipoLabel[i.tipo]}</td>
                    <td className={`px-4 py-3 text-right font-medium ${baixoEstoque ? "text-destructive" : ""}`}>
                      {i.quantidadeEstoque.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{i.unidade}</td>
                    <td className="px-4 py-3 text-right">
                      {i.precoUnitario ? formatCurrency(i.precoUnitario) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{i.fornecedor?.nome ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {baixoEstoque ? (
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                          Baixo Estoque
                        </span>
                      ) : (
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
