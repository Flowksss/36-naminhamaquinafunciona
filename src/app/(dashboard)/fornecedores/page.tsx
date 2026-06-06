import { db } from "@/lib/db";

export default async function FornecedoresPage() {
  const fornecedores = await db.fornecedor.findMany({
    include: { _count: { select: { insumos: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Novo Fornecedor
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">CNPJ</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Telefone</th>
              <th className="text-right px-4 py-3 font-medium">Insumos</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fornecedores.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum fornecedor cadastrado
                </td>
              </tr>
            ) : (
              fornecedores.map((f) => (
                <tr key={f.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{f.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.cnpj ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{f.telefone ?? "—"}</td>
                  <td className="px-4 py-3 text-right">{f._count.insumos}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
