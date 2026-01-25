// prisma/seed.ts
import { PrismaClient, UserRole, MessagePriority, ContactStatus } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();
let warned = false;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ Keine DATABASE_URL gesetzt. Seed wird übersprungen (Coming Soon).");
    warned = true;
    return;
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: UserRole.ADMIN },
    create: {
      email: "admin@example.com",
      role: UserRole.ADMIN,
      username: "admin",
      password: hashSync("Admin123!", 10),
    },
  });

  const band = await prisma.user.upsert({
    where: { email: "band@example.com" },
    update: { role: UserRole.BAND },
    create: {
      email: "band@example.com",
      role: UserRole.BAND,
      username: "band",
      password: hashSync("Band123!", 10),
    },
  });

  const fan = await prisma.user.upsert({
    where: { email: "fan@example.com" },
    update: { role: UserRole.FAN },
    create: {
      email: "fan@example.com",
      role: UserRole.FAN,
      username: "fan",
      password: hashSync("Fan123!", 10),
    },
  });

  // Ticket seeding skipped: Ticket requires eventId and richer fields. Add when event seed is ready.

  await prisma.contactMessage.upsert({
    where: { id: "seed-contact-1" },
    update: {},
    create: {
      id: "seed-contact-1",
      userId: fan.id,
      name: "Seed User",
      email: "fan@example.com",
      subject: "Coming Soon",
      message: "Contact system seed message (coming soon).",
      priority: MessagePriority.NORMAL,
      status: ContactStatus.NEW,
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    if (!warned) process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
