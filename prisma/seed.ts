// prisma/seed.ts
import { PrismaClient, UserRole, TicketType, TicketStatus, MessagePriority, ContactStatus } from "@prisma/client";
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
<<<<<<< HEAD
      password: hashSync("Admin123!", 10),
=======
      password: "hashed_password_placeholder",
      name: "Admin User",
>>>>>>> CheckoutMain
    },
  });

  const band = await prisma.user.upsert({
    where: { email: "band@example.com" },
    update: { role: UserRole.BAND },
    create: {
      email: "band@example.com",
      role: UserRole.BAND,
      username: "band",
<<<<<<< HEAD
      password: hashSync("Band123!", 10),
=======
      password: "hashed_password_placeholder",
      name: "Band User",
>>>>>>> CheckoutMain
    },
  });

  const fan = await prisma.user.upsert({
    where: { email: "fan@example.com" },
    update: { role: UserRole.FAN },
    create: {
      email: "fan@example.com",
      role: UserRole.FAN,
      username: "fan",
<<<<<<< HEAD
      password: hashSync("Fan123!", 10),
    },
  });

  // Ticket seeding skipped until event data is available; add tickets when events are seeded.
=======
      password: "hashed_password_placeholder",
      name: "Fan User",
    },
  });

  // Create a seed band
  await prisma.band.upsert({
    where: { id: "seed-band-1" },
    update: {},
    create: {
      id: "seed-band-1",
      name: "Metal3DCore",
      description: "The ultimate virtual metal experience",
      genre: "Metal",
      foundedYear: 2024,
    },
  });

  // Create a seed event
  await prisma.event.upsert({
    where: { id: "seed-event-1" },
    update: {},
    create: {
      id: "seed-event-1",
      title: "Metal3DCore Concert",
      description: "An epic metal concert experience",
      startDate: new Date("2024-06-01T20:00:00Z"),
      venue: "Virtual Arena",
      city: "Digital City",
      country: "Internet",
      maxCapacity: 1000,
      standardTicketPrice: 45.0,
      bandId: "seed-band-1",
    },
  });

  await prisma.ticket.createMany({
    data: [
      {
        userId: fan.id,
        type: TicketType.STANDARD,
        price: 45,
        status: TicketStatus.ACTIVE,
        ticketNumber: "STD-001",
        eventId: "seed-event-1",
      },
      {
        userId: fan.id,
        type: TicketType.VIP,
        price: 89,
        status: TicketStatus.ACTIVE,
        ticketNumber: "VIP-001",
        eventId: "seed-event-1",
      },
      {
        userId: fan.id,
        type: TicketType.BACKSTAGE,
        price: 150,
        status: TicketStatus.ACTIVE,
        ticketNumber: "BST-001",
        eventId: "seed-event-1",
      },
    ],
    skipDuplicates: true,
  });
>>>>>>> CheckoutMain

  await prisma.contactMessage.upsert({
    where: { id: "seed-contact-1" },
    update: {},
    create: {
      id: "seed-contact-1",
      name: "Seed User",
      email: "fan@example.com",
      subject: "Coming Soon",
      message: "Contact system seed message (coming soon).",
      priority: MessagePriority.NORMAL,
      status: ContactStatus.NEW,
<<<<<<< HEAD
      dataRetention: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
=======
      dataRetention: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
>>>>>>> CheckoutMain
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
