const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "smiletvafrica10@gmail.com" } });
  if (user) {
    const profile = await prisma.agentProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, applicationStatus: "approved" },
      update: { applicationStatus: "approved" },
    });
    console.log(`Approved agent application for ${user.email}`);
  } else {
    console.log("User not found");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
