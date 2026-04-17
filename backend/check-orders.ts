import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      agent: true
    }
  });
  console.log(JSON.stringify(orders, null, 2));
}
main();
