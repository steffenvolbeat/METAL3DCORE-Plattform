// 🎸 3DMetal Platform - User Access API
// Zeigt alle Zugänge und Tickets eines angemeldeten Users

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 🔍 Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
    }

    // 📋 Get user with all access rights and tickets
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tickets: {
          include: {
            event: true,
          },
          orderBy: { purchaseDate: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    // 🎫 Format ticket data
    const tickets = user.tickets.map(ticket => ({
      id: ticket.id,
      type: ticket.type,
      status: ticket.status,
      eventName: ticket.event?.title || "Event",
      purchasedAt: ticket.purchaseDate,
    }));

    // 🎸 Role-based access logic
    const isAdmin = user.role === "ADMIN";
    const isBandMember = user.role === "BAND";
    const isVIP = user.role === "VIP_FAN";
    const isBenefiz = user.role === "BENEFIZ";

    // Band Members and Admins get full access automatically
    const hasVIPAccess = user.hasVIPAccess || isBandMember || isAdmin || isVIP || isBenefiz;
    const hasPremiumAccess = user.hasPremiumAccess || isBandMember || isAdmin || isVIP || isBenefiz;
    const hasBackstageAccess = user.hasBackstageAccess || isBandMember || isAdmin;
    const hasFullAccess = user.hasFullAccess || isBandMember || isAdmin;

    // 📊 Return user access information
    return NextResponse.json({
      success: true,
      role: user.role,
      tickets,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        hasVIPAccess,
        hasPremiumAccess,
        hasBackstageAccess,
        hasFullAccess,
        canBuyTickets: user.canBuyTickets,
        tickets,
      },
    });
  } catch (error) {
    console.error("User access API error:", error);
    return NextResponse.json({ error: "Server Fehler beim Abrufen der Benutzerdaten" }, { status: 500 });
  }
}
