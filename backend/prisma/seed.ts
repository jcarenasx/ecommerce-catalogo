import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const productSeedData = [
  {
    model: "CAMISETA-001",
    name: "Camiseta básica",
    priceCents: 2000,
    category: "Ropa",
    brand: "Marca propia",
  },
  {
    model: "PANTALON-001",
    name: "Pantalón clásico",
    priceCents: 3500,
    category: "Ropa",
    brand: "Marca propia",
  },
  {
    model: "ZAPATO-001",
    name: "Zapato urbano",
    priceCents: 5000,
    category: "Calzado",
    brand: "Marca urbana",
  },
];

async function main(): Promise<void> {
  for (const product of productSeedData) {
    await prisma.product.upsert({
      where: { model: product.model },
      update: product,
      create: product,
    });
  }

  console.log("Products seeded ✅");
}

main()
  .catch(async (error: unknown) => {
    console.error("Failed to seed products", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
