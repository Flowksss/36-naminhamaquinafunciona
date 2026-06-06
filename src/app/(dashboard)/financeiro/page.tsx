import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function FinanceiroPage() {
  const transacoes = await db.transacao.findMany({
    include: { safra: { include: { fazenda: true } }, fornecedor: true, cliente: true },
    orderBy: { data: "desc" },
    take: 50,
  });

  const totalReceitas = transacoes
    .filter((t) => t.tipo === "RECEITA")
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === "DESPESA")
    .reduce((acc, t) => acc + t.valor, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Receitas</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Despesas</p>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(totalDespesas)}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Saldo</p>
          <p className={`text-2xl font-bold ${totalReceitas - totalDespesas >= 0 ? "text-green-600" : "text-destructive"}`}>
            {formatCurrency(totalReceitas - totalDespesas)}
          </p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Data</th>
              <th className="text-left px-4 py-3 font-medium">Descrição</th>
              <th className="text-left px-4 py-3 font-medium">Safra</th>
              <th className="text-center px-4 py-3 font-medium">Tipo</th>
              <th className="text-right px-4 py-3 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transacoes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma transação registrada
                </td>
              </tr>
            ) : (
              transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(t.data)}</td>
                  <td className="px-4 py-3">{t.descricao}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {t.safra ? `${t.safra.fazenda.nome} – ${t.safra.cultura}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        t.tipo === "RECEITA"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.tipo === "RECEITA" ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-medium ${
                      t.tipo === "RECEITA" ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    {t.tipo === "DESPESA" && "− "}
                    {formatCurrency(t.valor)}
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
