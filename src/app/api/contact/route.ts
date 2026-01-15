// src/app / api / contact / route.ts;
import { NextResponse } from "next/server";

let warned = false;

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL && !warned) {
    console.warn("⚠️ DATABASE_URL fehlt. Contact API läuft im Coming-Soon-Modus.");
    warned = true;
  }

  const body = await request.json().catch(() => null);
  const { name, email, subject, message } = body || {};

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "name, email, subject, message sind erforderlich" }, { status: 400 });
  }

  // ComingSoon – keine Persistenz, nur Ack
  return NextResponse.json({ status: "queued", comingSoon: true, accessControl: "Coming Soon" }, { status: 202 });
}
