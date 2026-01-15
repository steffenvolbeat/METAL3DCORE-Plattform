// src/app/api/tickets/route.ts
import { access } from "fs";
import { NextResponse } from "next/server";

let warned = false; // Gemeinsame Warnung für alle Anfragen

export async function GET() {
  if (!process.env.DATABASE_URL && !warned) {
    console.warn("⚠️ DATABASE_URL fehlt. Tickets API läuft im Coming-Soon-Modus.");
    warned = true;
  }
  return NextResponse.json({ tickets: [], status: "coming-soon", accessControl: "Coming Soon" });
}

export async function POST() {
  return NextResponse.json(
    { error: "Ticket API coming soon", comingSoon: true, accessControl: "Coming Soon" },
    { status: 501 }
  );
}
