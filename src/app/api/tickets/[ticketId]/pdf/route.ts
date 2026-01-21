// 🎫 Ticket PDF Download API
// Secure PDF Download with Access Control

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params; // Await the params promise
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Anmeldung erforderlich" },
        { status: 401 }
      );
    }

    // Ticket aus Datenbank holen mit User-Verifikation
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        user: {
          email: session.user.email,
        },
      },
      include: {
        event: true,
        user: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket nicht gefunden oder keine Berechtigung" },
        { status: 404 }
      );
    }

    // TODO: PDF Generation noch nicht implementiert
    // Das pdfUrl Feld ist im Schema deaktiviert
    return NextResponse.json(
      {
        error:
          "PDF-Generierung ist noch nicht verfügbar. Feature kommt in v2.2.0!",
      },
      { status: 501 } // Not Implemented
    );

    /* Später aktivieren wenn pdfUrl im Schema aktiviert wird:
    if (!ticket.pdfUrl) {
      return NextResponse.json(
        { error: "PDF für dieses Ticket nicht verfügbar" },
        { status: 404 }
      );
    }
    */

    /* PDF-Feature disabled - to be implemented in v2.2.0
    // PDF-Datei lesen
    const pdfPath = path.join(process.cwd(), "public", ticket.pdfUrl);

    try {
      const pdfBuffer = await fs.readFile(pdfPath);

      // Download-Statistik aktualisieren
      await prisma.ticket.update({
        where: { id: ticketId },
        data: {
          // Hier könnten wir Download-Counter hinzufügen
        },
      });

      // PDF als Download zurückgeben
      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="Metal3DCore-Ticket-${ticket.ticketNumber}.pdf"`,
          "Cache-Control": "private, no-cache",
        },
      });
    } catch (fileError) {
      console.error("PDF file read error:", fileError);
      return NextResponse.json(
        { error: "PDF-Datei konnte nicht gelesen werden" },
        { status: 500 }
      );
    }
    */
  } catch (error) {
    console.error("PDF download error:", error);
    return NextResponse.json(
      { error: "Server error beim PDF-Download" },
      { status: 500 }
    );
  }
}

/* Optional: DELETE Route für PDF cleanup - Disabled until PDF feature is implemented
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params; // Await the params promise
    const session = await getServerSession();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket?.pdfUrl) {
      return NextResponse.json(
        { error: "Ticket oder PDF nicht gefunden" },
        { status: 404 }
      );
    }

    // PDF-Datei löschen
    const pdfPath = path.join(process.cwd(), "public", ticket.pdfUrl);

    try {
      await fs.unlink(pdfPath);
    } catch (fileError) {
      console.warn("PDF file deletion failed:", fileError);
    }

    // PDF URL aus Database entfernen
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        pdfUrl: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "PDF erfolgreich gelöscht",
    });
  } catch (error) {
    console.error("PDF deletion error:", error);
    return NextResponse.json(
      { error: "Server error beim PDF-Löschen" },
      { status: 500 }
    );
  }
}
*/
