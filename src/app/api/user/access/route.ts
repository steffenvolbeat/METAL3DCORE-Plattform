// 🎸 3DMetal Platform - User Access API
// Zeigt alle Zugänge und Tickets eines angemeldeten Users

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
      return NextResponse.json(
        { error: "Benutzer nicht gefunden" },
        { status: 404 }
      );
    }

    // 🎫 Format ticket data
    const tickets = user.tickets.map((ticket) => ({
      id: ticket.id,
      type: ticket.type,
      status: ticket.status,
      eventName: ticket.event?.title || "Event",
      purchasedAt: ticket.purchaseDate,
    }));

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
        hasVIPAccess: user.hasVIPAccess,
        hasPremiumAccess: user.hasPremiumAccess,
        hasBackstageAccess: user.hasBackstageAccess,
        hasFullAccess: user.hasFullAccess,
        canBuyTickets: user.canBuyTickets,
        tickets,
      },
    });
  } catch (error) {
    console.error("User access API error:", error);
    return NextResponse.json(
      { error: "Server Fehler beim Abrufen der Benutzerdaten" },
      { status: 500 }
    );
  }
}
