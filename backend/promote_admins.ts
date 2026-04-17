import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.updateMany({
    where: { role: "admin" },
    data: { adminRole: "super_admin" },
  });
  console.log(`Promoted ${updated.count} admins to super_admin.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
