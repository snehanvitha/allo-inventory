import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Warehouses
  const chennaiWarehouse = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
      location: "Chennai",
    },
  });

  const hyderabadWarehouse = await prisma.warehouse.create({
    data: {
      name: "Hyderabad Warehouse",
      location: "Hyderabad",
    },
  });

  const bangaloreWarehouse = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
      location: "Bangalore",
    },
  });

  // Products
  const iphone = await prisma.product.create({
    data: {
      name: "iPhone 15",
      description: "Apple smartphone",
      price: 79999,
    },
  });

  const samsung = await prisma.product.create({
    data: {
      name: "Samsung Galaxy S24",
      description: "Samsung flagship smartphone",
      price: 74999,
    },
  });

  const airpods = await prisma.product.create({
    data: {
      name: "AirPods Pro",
      description: "Wireless earbuds",
      price: 24999,
    },
  });

  const sony = await prisma.product.create({
    data: {
      name: "Sony WH-1000XM5",
      description: "Noise cancelling headphones",
      price: 29999,
    },
  });

  // Inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: chennaiWarehouse.id,
        totalStock: 10,
        reservedStock: 0,
      },
      {
        productId: iphone.id,
        warehouseId: hyderabadWarehouse.id,
        totalStock: 5,
        reservedStock: 0,
      },
      {
        productId: samsung.id,
        warehouseId: bangaloreWarehouse.id,
        totalStock: 7,
        reservedStock: 0,
      },
      {
        productId: airpods.id,
        warehouseId: chennaiWarehouse.id,
        totalStock: 20,
        reservedStock: 0,
      },
      {
        productId: sony.id,
        warehouseId: hyderabadWarehouse.id,
        totalStock: 15,
        reservedStock: 0,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });