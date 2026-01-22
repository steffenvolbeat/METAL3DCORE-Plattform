// 🎸 3DMetal Platform - Enhanced User Registration API
// Account-Erstellung für Bands und Fans mit automatischen Zugriffsrechten

import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";

// 📋 Enhanced Validation Schema
const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail Adresse"),
  username: z.string().min(3, "Username muss mindestens 3 Zeichen haben"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen haben"),
  password: z.string().min(6, "Passwort muss mindestens 6 Zeichen haben"),
  role: z.nativeEnum(UserRole),
  // Für BAND Accounts
  bandName: z.string().optional(),
  bandDescription: z.string().optional(),
  bandGenre: z.string().optional(),
});

export async function POST(request: NextRequest) {
  console.log("🎸 Registration API called");
  try {
    const body = await request.json();
    console.log("📨 Request body:", body);

    const validatedData = registerSchema.parse(body);
    console.log("✅ Validation passed:", validatedData);

    // 🔍 Prüfe ob User bereits existiert
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email }, { username: validatedData.username }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "E-Mail oder Username bereits vergeben" }, { status: 400 });
    }

    // 🔐 Hash Password
    const hashedPassword = await hash(validatedData.password, 12);

    // 🎸 Erstelle User Account mit automatischen Zugriffsrechten
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,

        // 🎸 BAND Members bekommen sofort VOLLZUGANG zu allen Bereichen
        hasFullAccess: validatedData.role === UserRole.BAND,
        hasVIPAccess: validatedData.role === UserRole.BAND,
        hasPremiumAccess: validatedData.role === UserRole.BAND,
        hasBackstageAccess: validatedData.role === UserRole.BAND,
        canBuyTickets: validatedData.role === UserRole.FAN,
      },
    });

    // 🎸 Erstelle Band Profile falls BAND Account
    if (validatedData.role === UserRole.BAND && validatedData.bandName) {
      // Prüfe ob Band Name bereits existiert
      const existingBand = await prisma.band.findUnique({
        where: { name: validatedData.bandName },
      });

      if (existingBand) {
        // User löschen falls Band Name bereits vergeben
        await prisma.user.delete({ where: { id: newUser.id } });
        return NextResponse.json({ error: "Band Name bereits vergeben" }, { status: 400 });
      }

      // Erstelle Band
      const newBand = await prisma.band.create({
        data: {
          name: validatedData.bandName,
          description: validatedData.bandDescription,
          genre: validatedData.bandGenre,
          verified: false,
        },
      });

      // Verbinde User mit Band
      await prisma.bandProfile.create({
        data: {
          userId: newUser.id,
          bandId: newBand.id,
          role: "Band Leader",
        },
      });
    }

    // ✅ Erfolgreiche Registrierung
    return NextResponse.json({
      success: true,
      message:
        validatedData.role === UserRole.BAND
          ? "🎸 Band Account erfolgreich erstellt! VOLLZUGANG zu allen Bereichen aktiviert (VIP, Premium, Konzert, Backstage)."
          : "🎫 Fan Account erfolgreich erstellt! Du kannst jetzt Tickets kaufen.",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        hasFullAccess: newUser.hasFullAccess,
        accessRights: {
          canAccessConcert: validatedData.role === UserRole.BAND,
          canAccessPremium: validatedData.role === UserRole.BAND,
          canAccessVIP: validatedData.role === UserRole.BAND,
          canAccessBackstage: validatedData.role === UserRole.BAND,
          canBuyTickets: validatedData.role === UserRole.FAN,
        },
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);

    if (error instanceof z.ZodError) {
      console.log("📋 Validation errors:", error.issues);
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Interner Server Fehler" }, { status: 500 });
  }
}
