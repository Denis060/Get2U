const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.user.update({
    where: { email: "smiletvafrica10@gmail.com" },
    data: { 
      role: "admin", 
      adminRole: "super_admin" 
    },
  });
  console.log(`Promoted ${updated.email} to admin and super_admin.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
