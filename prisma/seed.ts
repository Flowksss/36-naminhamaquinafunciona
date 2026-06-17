import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

function monthsAgo(n: number, day = 15) {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - n, day);
}

const MODELOS = ["John Deere 8R", "Case IH Magnum", "New Holland T7", "Volvo FH 540", "Scania R450"];
const OPERADORES = ["João Silva", "Maria Souza", "Pedro Alves", "Ana Lima", "Carlos Dias", "Rita Gomes", "Luís Rocha", "Marta Nunes"];
const STATUS = ["EM_OPERACAO", "NA_FILA", "OCIOSO", "EM_TRANSITO"] as const;

/** Cria frota + simulação + histórico para uma org (isolado por organizacaoId). */
async function seedFrota(orgId: string, fazendaIds: string[], qtd: number, prefixo: string) {
  const ativos = [];
  for (let i = 1; i <= qtd; i++) {
    const fazendaId = fazendaIds[i % fazendaIds.length];
    const consumoMedio = 10 + Math.round(Math.random() * 6); // 10-16 L/h (baseline fixo)
    ativos.push({
      identificador: `${prefixo}-${String(i).padStart(2, "0")}`,
      tipo: "CAMINHAO" as const,
      status: STATUS[i % STATUS.length],
      organizacaoId: orgId,
      fazendaId,
      lat: -12 - Math.random() * 4,
      lng: -55 - Math.random() * 4,
      consumoMedio,
      consumoAtual: Number((consumoMedio * (0.92 + Math.random() * 0.16)).toFixed(1)),
      capacidadeTanque: 400,
      nivelCombustivel: 40 + Math.round(Math.random() * 55),
      horasDesdeManutencao: Math.round(Math.random() * 400), // alguns acima de 250 = manutenção
      modelo: MODELOS[i % MODELOS.length],
      ano: 2018 + (i % 7),
      operador: OPERADORES[i % OPERADORES.length],
      horimetroTotal: 2000 + Math.round(Math.random() * 6000),
    });
  }
  await db.ativo.createMany({ data: ativos });
  await db.simState.create({ data: { organizacaoId: orgId, tick: 10 } });

  // histórico GPS/consumo (8 ciclos) por ativo
  const criados = await db.ativo.findMany({ where: { organizacaoId: orgId } });
  const posicoes = [];
  for (const a of criados) {
    let nivel = a.nivelCombustivel ?? 80;
    for (let t = 1; t <= 8; t++) {
      nivel = Math.max(10, nivel - Math.round(Math.random() * 8));
      posicoes.push({
        ativoId: a.id,
        lat: (a.lat ?? -13) + (Math.random() - 0.5) * 0.15,
        lng: (a.lng ?? -56) + (Math.random() - 0.5) * 0.15,
        consumo: Number((a.consumoMedio * (0.9 + Math.random() * 0.25)).toFixed(1)),
        nivel,
        tick: t,
      });
    }
  }
  await db.posicaoGPS.createMany({ data: posicoes });

  // snapshots prévios (10 ciclos) — desperdício na escala do feed atual (R$/dia, menor = melhor)
  const snaps = [];
  for (let t = 1; t <= 10; t++) {
    const emFila = 2 + Math.round(Math.random() * 4);
    snaps.push({
      organizacaoId: orgId,
      tick: t,
      totalAtivos: qtd,
      emFila,
      emOperacao: qtd - emFila - Math.round(Math.random() * 2),
      alertas: 1 + Math.round(Math.random() * 4),
      manutencoes: Math.round(Math.random() * 2),
      consumoTotal: Number((qtd * 9 + Math.random() * 20).toFixed(1)),
      desperdicioDia: Math.round(200 + Math.random() * 500),
    });
  }
  await db.snapshotOperacional.createMany({ data: snaps });
}

async function main() {
  // --- limpa dados de demo (ordem respeitando FKs) ---
  await db.recomendacao.deleteMany();
  await db.snapshotOperacional.deleteMany();
  await db.posicaoGPS.deleteMany();
  await db.ativo.deleteMany();
  await db.simState.deleteMany();
  await db.transacao.deleteMany();
  await db.movimentoEstoque.deleteMany();
  await db.safra.deleteMany();
  await db.insumo.deleteMany();
  await db.fornecedor.deleteMany();
  await db.cliente.deleteMany();
  await db.talhao.deleteMany();
  await db.fazenda.deleteMany();
  await db.user.deleteMany();
  await db.organizacao.deleteMany();

  // ============================================================
  // ORGANIZAÇÕES (tenants) — duas, para demonstrar isolamento real
  // ============================================================
  const agroNorte = await db.organizacao.create({ data: { nome: "Agro Norte", plano: "GROWTH" } });
  const valeVerde = await db.organizacao.create({ data: { nome: "Vale Verde", plano: "START" } });

  // --- usuários (cada um pertence a uma org) ---
  await db.user.createMany({
    data: [
      { name: "Admin", email: "admin@cctsincro.com", password: await hash("admin123", 10), role: "ADMIN", organizacaoId: agroNorte.id },
      { name: "Gerente", email: "gerente@cctsincro.com", password: await hash("gerente123", 10), role: "GERENTE", organizacaoId: agroNorte.id },
      { name: "Operador", email: "operador@cctsincro.com", password: await hash("operador123", 10), role: "OPERADOR", organizacaoId: agroNorte.id },
      { name: "Gestor Vale Verde", email: "gestor@valeverde.com", password: await hash("vale123", 10), role: "ADMIN", organizacaoId: valeVerde.id },
    ],
  });

  // --- fazendas (Agro Norte: 2 unidades; Vale Verde: 2 unidades) ---
  const saoJoao = await db.fazenda.create({
    data: { nome: "Fazenda São João", area: 1200, localizacao: "Sorriso - MT", tipoSolo: "Latossolo", organizacaoId: agroNorte.id },
  });
  const boaVista = await db.fazenda.create({
    data: { nome: "Fazenda Boa Vista", area: 800, localizacao: "Rio Verde - GO", tipoSolo: "Argiloso", organizacaoId: agroNorte.id },
  });
  const santaFe = await db.fazenda.create({
    data: { nome: "Fazenda Santa Fé", area: 450, localizacao: "Londrina - PR", tipoSolo: "Latossolo Roxo", organizacaoId: valeVerde.id },
  });
  const primavera = await db.fazenda.create({
    data: { nome: "Fazenda Primavera", area: 620, localizacao: "Maracaju - MS", tipoSolo: "Arenoso", organizacaoId: valeVerde.id },
  });

  // --- safras (legado agro — vinculadas via fazenda) ---
  await db.safra.createMany({
    data: [
      { fazendaId: saoJoao.id, cultura: "Soja", dataPlantio: monthsAgo(8, 1), dataColheitaPrevista: monthsAgo(3, 1), dataColheitaReal: monthsAgo(3, 5), areaPlantada: 900, status: "COLHIDA", quantidadePrevista: 2700, quantidadeReal: 2820 },
      { fazendaId: saoJoao.id, cultura: "Milho 2ª safra", dataPlantio: monthsAgo(2, 10), dataColheitaPrevista: monthsAgo(-3, 10), areaPlantada: 850, status: "EM_ANDAMENTO", quantidadePrevista: 5100 },
      { fazendaId: boaVista.id, cultura: "Soja", dataPlantio: monthsAgo(7, 20), dataColheitaPrevista: monthsAgo(2, 20), dataColheitaReal: monthsAgo(2, 25), areaPlantada: 600, status: "COLHIDA", quantidadePrevista: 1800, quantidadeReal: 1750 },
      { fazendaId: santaFe.id, cultura: "Trigo", dataPlantio: monthsAgo(0, 5), dataColheitaPrevista: monthsAgo(-4, 5), areaPlantada: 400, status: "PLANEJADA", quantidadePrevista: 1200 },
    ],
  });

  // --- talhões / áreas produtivas (dentro das unidades) ---
  await db.talhao.createMany({
    data: [
      { organizacaoId: agroNorte.id, fazendaId: saoJoao.id, nome: "Talhão 1", cultura: "Soja", areaHa: 320, lat: -12.4, lng: -55.6 },
      { organizacaoId: agroNorte.id, fazendaId: saoJoao.id, nome: "Talhão 2", cultura: "Milho", areaHa: 280, lat: -12.5, lng: -55.7 },
      { organizacaoId: agroNorte.id, fazendaId: boaVista.id, nome: "Talhão A", cultura: "Soja", areaHa: 410, lat: -13.1, lng: -55.9 },
      { organizacaoId: valeVerde.id, fazendaId: santaFe.id, nome: "Quadra Norte", cultura: "Trigo", areaHa: 150, lat: -13.6, lng: -56.2 },
      { organizacaoId: valeVerde.id, fazendaId: primavera.id, nome: "Gleba 3", cultura: "Soja", areaHa: 220, lat: -13.8, lng: -56.4 },
    ],
  });

  // ============================================================
  // FROTA por organização (isolada)
  // ============================================================
  await seedFrota(agroNorte.id, [saoJoao.id, boaVista.id], 12, "AN");
  await seedFrota(valeVerde.id, [santaFe.id, primavera.id], 6, "VV");

  const counts = {
    orgs: await db.organizacao.count(),
    usuarios: await db.user.count(),
    fazendas: await db.fazenda.count(),
    ativos: await db.ativo.count(),
    ativosAgroNorte: await db.ativo.count({ where: { organizacaoId: agroNorte.id } }),
    ativosValeVerde: await db.ativo.count({ where: { organizacaoId: valeVerde.id } }),
  };
  console.log("Seed concluído:", counts);
  console.log("Login Agro Norte: admin@cctsincro.com / admin123 (ADMIN), operador@cctsincro.com / operador123 (OPERADOR)");
  console.log("Login Vale Verde: gestor@valeverde.com / vale123 (ADMIN)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
