import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  // Admin user
  await db.user.upsert({
    where: { email: "admin@agroerp.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@agroerp.com",
      password: await hash("admin123", 10),
      role: "ADMIN",
    },
  });

  // Sample farm
  const fazenda = await db.fazenda.upsert({
    where: { id: "fazenda-seed-1" },
    update: {},
    create: {
      id: "fazenda-seed-1",
      nome: "Fazenda São João",
      area: 500,
      localizacao: "Sorriso, MT",
      tipoSolo: "Latossolo",
    },
  });

  // Sample harvest
  await db.safra.upsert({
    where: { id: "safra-seed-1" },
    update: {},
    create: {
      id: "safra-seed-1",
      fazendaId: fazenda.id,
      cultura: "Soja",
      dataPlantio: new Date("2025-10-01"),
      dataColheitaPrevista: new Date("2026-02-28"),
      areaPlantada: 450,
      status: "EM_ANDAMENTO",
      quantidadePrevista: 1350,
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
