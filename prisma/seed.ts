import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

function monthsAgo(n: number, day = 15) {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - n, day);
}

async function main() {
  // --- limpa dados de demo (mantém usuários) ---
  await db.recomendacao.deleteMany();
  await db.ativo.deleteMany();
  await db.simState.deleteMany();
  await db.transacao.deleteMany();
  await db.movimentoEstoque.deleteMany();
  await db.safra.deleteMany();
  await db.insumo.deleteMany();
  await db.fornecedor.deleteMany();
  await db.cliente.deleteMany();
  await db.fazenda.deleteMany();

  // --- usuários ---
  await db.user.upsert({
    where: { email: "admin@agroerp.com" },
    update: {},
    create: { name: "Admin", email: "admin@agroerp.com", password: await hash("admin123", 10), role: "ADMIN" },
  });
  await db.user.upsert({
    where: { email: "gerente@agroerp.com" },
    update: {},
    create: { name: "Gerente", email: "gerente@agroerp.com", password: await hash("gerente123", 10), role: "GERENTE" },
  });

  // --- fazendas ---
  const saoJoao = await db.fazenda.create({
    data: { nome: "Fazenda São João", area: 1200, localizacao: "Sorriso - MT", tipoSolo: "Latossolo" },
  });
  const boaVista = await db.fazenda.create({
    data: { nome: "Fazenda Boa Vista", area: 800, localizacao: "Rio Verde - GO", tipoSolo: "Argiloso" },
  });
  const santaFe = await db.fazenda.create({
    data: { nome: "Fazenda Santa Fé", area: 450, localizacao: "Londrina - PR", tipoSolo: "Latossolo Roxo" },
  });

  // --- safras ---
  await db.safra.createMany({
    data: [
      { fazendaId: saoJoao.id, cultura: "Soja", dataPlantio: monthsAgo(8, 1), dataColheitaPrevista: monthsAgo(3, 1), dataColheitaReal: monthsAgo(3, 5), areaPlantada: 900, status: "COLHIDA", quantidadePrevista: 2700, quantidadeReal: 2820 },
      { fazendaId: saoJoao.id, cultura: "Milho 2ª safra", dataPlantio: monthsAgo(2, 10), dataColheitaPrevista: monthsAgo(-3, 10), areaPlantada: 850, status: "EM_ANDAMENTO", quantidadePrevista: 5100 },
      { fazendaId: boaVista.id, cultura: "Soja", dataPlantio: monthsAgo(7, 20), dataColheitaPrevista: monthsAgo(2, 20), dataColheitaReal: monthsAgo(2, 25), areaPlantada: 600, status: "COLHIDA", quantidadePrevista: 1800, quantidadeReal: 1750 },
      { fazendaId: boaVista.id, cultura: "Sorgo", dataPlantio: monthsAgo(1, 5), dataColheitaPrevista: monthsAgo(-4, 5), areaPlantada: 500, status: "EM_ANDAMENTO", quantidadePrevista: 1500 },
      { fazendaId: santaFe.id, cultura: "Trigo", dataPlantio: monthsAgo(0, 5), dataColheitaPrevista: monthsAgo(-4, 5), areaPlantada: 400, status: "PLANEJADA", quantidadePrevista: 1200 },
    ],
  });
  const safras = await db.safra.findMany();
  const safraSoja = safras.find((s) => s.cultura === "Soja" && s.fazendaId === saoJoao.id)!;

  // --- fornecedores ---
  const agroMax = await db.fornecedor.create({
    data: { nome: "AgroMax Insumos LTDA", cnpj: "12.345.678/0001-90", email: "vendas@agromax.com", telefone: "(66) 3211-0001", endereco: "Sorriso - MT" },
  });
  const sementesSul = await db.fornecedor.create({
    data: { nome: "Sementes Sul S/A", cnpj: "98.765.432/0001-10", email: "comercial@sementessul.com", telefone: "(43) 3322-0002", endereco: "Londrina - PR" },
  });

  // --- insumos (alguns abaixo do mínimo p/ alerta) ---
  await db.insumo.createMany({
    data: [
      { nome: "Semente Soja TMG", tipo: "SEMENTE", unidade: "sc", quantidadeEstoque: 320, estoqueMinimo: 100, precoUnitario: 480, fornecedorId: sementesSul.id },
      { nome: "Ureia 45%", tipo: "FERTILIZANTE", unidade: "t", quantidadeEstoque: 8, estoqueMinimo: 15, precoUnitario: 3200, fornecedorId: agroMax.id },
      { nome: "Glifosato", tipo: "DEFENSIVO", unidade: "L", quantidadeEstoque: 45, estoqueMinimo: 60, precoUnitario: 28, fornecedorId: agroMax.id },
      { nome: "Óleo Diesel S10", tipo: "COMBUSTIVEL", unidade: "L", quantidadeEstoque: 4200, estoqueMinimo: 2000, precoUnitario: 6.1, fornecedorId: agroMax.id },
      { nome: "Fungicida Triazol", tipo: "DEFENSIVO", unidade: "L", quantidadeEstoque: 12, estoqueMinimo: 20, precoUnitario: 95, fornecedorId: sementesSul.id },
    ],
  });

  // --- clientes ---
  const coopGraos = await db.cliente.create({
    data: { nome: "Cooperativa Grãos do Cerrado", cnpj: "11.222.333/0001-44", email: "compras@coopgraos.com", telefone: "(64) 3600-1000", endereco: "Rio Verde - GO" },
  });
  const tradingABC = await db.cliente.create({
    data: { nome: "ABC Trading Commodities", cnpj: "55.666.777/0001-88", email: "negocios@abctrading.com", telefone: "(11) 4000-2000", endereco: "São Paulo - SP" },
  });

  // --- transações (espalhadas nos últimos 6 meses p/ o gráfico) ---
  await db.transacao.createMany({
    data: [
      // receitas (vendas de produção)
      { tipo: "RECEITA", valor: 540000, descricao: "Venda soja - lote 1", data: monthsAgo(5, 8), safraId: safraSoja.id, clienteId: coopGraos.id },
      { tipo: "RECEITA", valor: 380000, descricao: "Venda soja - lote 2", data: monthsAgo(4, 12), safraId: safraSoja.id, clienteId: tradingABC.id },
      { tipo: "RECEITA", valor: 210000, descricao: "Venda milho antecipada", data: monthsAgo(2, 20), clienteId: coopGraos.id },
      { tipo: "RECEITA", valor: 165000, descricao: "Venda soja Boa Vista", data: monthsAgo(1, 10), clienteId: tradingABC.id },
      // despesas (insumos / operação)
      { tipo: "DESPESA", valor: 96000, descricao: "Compra fertilizante (ureia)", data: monthsAgo(5, 3), fornecedorId: agroMax.id },
      { tipo: "DESPESA", valor: 153600, descricao: "Compra sementes soja", data: monthsAgo(5, 18), fornecedorId: sementesSul.id },
      { tipo: "DESPESA", valor: 64000, descricao: "Diesel - plantio", data: monthsAgo(3, 6), fornecedorId: agroMax.id },
      { tipo: "DESPESA", valor: 42000, descricao: "Defensivos - aplicação", data: monthsAgo(2, 14), fornecedorId: agroMax.id },
      { tipo: "DESPESA", valor: 88000, descricao: "Mão de obra e manutenção", data: monthsAgo(1, 22) },
      { tipo: "DESPESA", valor: 37000, descricao: "Fungicida + frete", data: monthsAgo(0, 4), fornecedorId: sementesSul.id },
    ],
  });

  // --- frota (ativos) distribuída nas unidades ---
  const STATUS = ["EM_OPERACAO", "NA_FILA", "OCIOSO", "EM_TRANSITO"] as const;
  const unidades = [saoJoao, boaVista, santaFe];
  const ativos = [];
  for (let i = 1; i <= 10; i++) {
    const unidade = unidades[i % unidades.length];
    const consumoMedio = 10 + Math.round(Math.random() * 6); // 10-16 L/h
    ativos.push({
      identificador: `CAM-${String(i).padStart(2, "0")}`,
      tipo: "CAMINHAO" as const,
      status: STATUS[i % STATUS.length],
      fazendaId: unidade.id,
      lat: -12 - Math.random() * 4,
      lng: -55 - Math.random() * 4,
      consumoMedio,
      consumoAtual: consumoMedio,
      capacidadeTanque: 400,
      nivelCombustivel: 40 + Math.round(Math.random() * 55),
      horasDesdeManutencao: Math.round(Math.random() * 400), // alguns acima de 250 = manutenção
    });
  }
  await db.ativo.createMany({ data: ativos });
  await db.simState.create({ data: { tick: 0 } });

  const counts = {
    fazendas: await db.fazenda.count(),
    ativos: await db.ativo.count(),
    safras: await db.safra.count(),
    insumos: await db.insumo.count(),
    fornecedores: await db.fornecedor.count(),
    clientes: await db.cliente.count(),
    transacoes: await db.transacao.count(),
  };
  console.log("Seed concluído:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
