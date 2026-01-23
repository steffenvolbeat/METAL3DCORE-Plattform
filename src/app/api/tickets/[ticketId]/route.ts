import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const { ticketId } = await context.params;

    // Finde Ticket und prüfe ob es dem User gehört
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket nicht gefunden" },
        { status: 404 }
      );
    }

    if (ticket.user.email !== session.user.email) {
      return NextResponse.json(
        { error: "Kein Zugriff auf dieses Ticket" },
        { status: 403 }
      );
    }

    // Lösche das Ticket und alle verknüpften Payments (CASCADE)
    await prisma.$transaction([
      // Zuerst alle Payments löschen
      prisma.payment.deleteMany({
        where: { ticketId: ticketId },
      }),
      // Dann das Ticket löschen
      prisma.ticket.delete({
        where: { id: ticketId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Ticket erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("Fehler beim Löschen des Tickets:", error);
    return NextResponse.json(
      { error: "Serverfehler beim Löschen" },
      { status: 500 }
    );
  }
}
