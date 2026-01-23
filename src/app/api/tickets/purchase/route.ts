// 🎫 3DMetal Platform - Ticket Purchase API
// Ticket-Kauf System mit Access Control

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TicketType, TicketStatus, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { TICKET_PRICES } from "@/lib/access-control";
import { Ticket } from "@/shared/types";
import {
  generateTicketPDF,
  generateTicketQR,
} from "@/features/tickets/services/pdf.service";
import { promises as fs } from "fs";
import path from "path";

// 🎫 Ticket Purchase Schema
const purchaseSchema = z.object({
  eventId: z.string().min(1, "Event ID erforderlich"),
  ticketType: z.nativeEnum(TicketType),
  quantity: z.number().min(1).max(5, "Maximal 5 Tickets pro Kauf"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Anmeldung erforderlich" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, ticketType, quantity } = purchaseSchema.parse(body);

    console.log("🎫 Purchase request received:", {
      eventId,
      ticketType,
      quantity,
    });

    // 🔍 User aus Datenbank holen
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            type: true,
            status: true,
            purchaseDate: true,
            eventId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User nicht gefunden" },
        { status: 404 }
      );
    }

    // 🎸 BAND Members können keine Tickets kaufen (haben bereits Vollzugang)
    if (user.role === UserRole.BAND) {
      return NextResponse.json(
        {
          error:
            "Band Members haben bereits Vollzugang und brauchen keine Tickets",
        },
        { status: 400 }
      );
    }

    // 🎫 Event prüfen
    let event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tickets: {
          select: {
            id: true,
            status: true,
            eventId: true,
          },
        },
      },
    });

    console.log("🎫 Event lookup result:", { eventId, found: !!event });

    // 🎸 Fallback: Falls Event nicht existiert, erstelle Demo-Event
    if (!event && (eventId === "fallback-event-id" || /^\d+$/.test(eventId))) {
      console.log("🎫 Creating demo event for ID:", eventId);

      // Erst prüfen ob ein Demo Band existiert
      let demoBand = await prisma.band.findFirst({
        where: { name: "Metal3DCore Demo Band" },
      });

      if (!demoBand) {
        demoBand = await prisma.band.create({
          data: {
            name: "Metal3DCore Demo Band",
            description: "Offizielle Demo Band für die Metal3DCore Platform",
            genre: "Metal",
            verified: true,
          },
        });
      }

      event = await prisma.event.create({
        data: {
          id: eventId,
          title: `Metal3DCore Demo Konzert #${eventId}`,
          description: "Exklusives Demo-Konzert für die Metal3DCore Platform",
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage in der Zukunft
          venue: "Hallenstadion",
          city: "Zürich",
          country: "Schweiz",
          maxCapacity: 1000,
          basicTicketPrice: 45.0,
          standardTicketPrice: 89.5,
          vipTicketPrice: 150.0,
          status: "UPCOMING",
          bandId: demoBand.id,
        },
        include: {
          tickets: {
            select: {
              id: true,
              status: true,
              eventId: true,
            },
          },
        },
      });

      console.log("✅ Fallback event created:", event.id);
    }

    if (!event) {
      return NextResponse.json(
        { error: `Event mit ID "${eventId}" nicht gefunden` },
        { status: 404 }
      );
    }

    if (event.status !== "UPCOMING") {
      return NextResponse.json(
        { error: "Tickets können nur für zukünftige Events gekauft werden" },
        { status: 400 }
      );
    }

    // 🎫 Kapazität prüfen
    if (event.maxCapacity) {
      const soldTickets = event.tickets.filter(
        (t) => t.status === "ACTIVE"
      ).length;
      if (soldTickets + quantity > event.maxCapacity) {
        return NextResponse.json(
          {
            error:
              "Event ist ausverkauft oder nicht genügend Tickets verfügbar",
          },
          { status: 400 }
        );
      }
    }

    // ❌ Bestimmte Ticket Types können nicht gekauft werden
    if (
      ticketType === TicketType.BAND_PASS ||
      ticketType === TicketType.ADMIN_PASS
    ) {
      return NextResponse.json(
        { error: "Dieser Ticket Type kann nicht gekauft werden" },
        { status: 400 }
      );
    }

    // 💰 Preis berechnen
    const ticketPrice = TICKET_PRICES[ticketType as keyof typeof TICKET_PRICES];
    if (!ticketPrice) {
      return NextResponse.json(
        { error: "Ungültiger Ticket Type" },
        { status: 400 }
      );
    }
    const totalPrice = ticketPrice * quantity;

    // 🎫 Tickets erstellen
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketNumber = `${event.id.slice(
        0,
        8
      )}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      // Access Rights basierend auf Ticket Type
      const accessRights = {
        allowsBasicAccess: false,
        allowsConcertAccess: true, // Alle Tickets haben Konzert-Zugang
        allowsPremiumAccess: false,
        allowsVIPAccess: false,
        allowsBackstageAccess: false,
      };

      // Access Rights basierend auf Ticket Type - using if-else to avoid TypeScript issues
      if (ticketType === TicketType.STANDARD) {
        accessRights.allowsBasicAccess = true;
        accessRights.allowsPremiumAccess = true;
      } else if (ticketType === TicketType.VIP) {
        accessRights.allowsBasicAccess = true;
        accessRights.allowsPremiumAccess = true;
        accessRights.allowsVIPAccess = true;
      } else if (ticketType === TicketType.BACKSTAGE) {
        accessRights.allowsBasicAccess = true;
        accessRights.allowsPremiumAccess = true;
        accessRights.allowsVIPAccess = true;
        accessRights.allowsBackstageAccess = true;
      } else if (ticketType === TicketType.BAND_PASS) {
        // Band members get full access
        accessRights.allowsBasicAccess = true;
        accessRights.allowsPremiumAccess = true;
        accessRights.allowsVIPAccess = true;
        accessRights.allowsBackstageAccess = true;
      } else if (ticketType === TicketType.ADMIN_PASS) {
        // Admins get full access
        accessRights.allowsBasicAccess = true;
        accessRights.allowsPremiumAccess = true;
        accessRights.allowsVIPAccess = true;
        accessRights.allowsBackstageAccess = true;
      }

      const ticket = await prisma.ticket.create({
        data: {
          ticketNumber,
          type: ticketType,
          price: ticketPrice,
          status: TicketStatus.ACTIVE,
          userId: user.id,
          eventId: event.id,
          qrCode: null, // Später generiert
          // PDF wird später über separaten Service generiert
          allowsBasicAccess: accessRights.allowsBasicAccess,
          allowsConcertAccess: accessRights.allowsConcertAccess || true,
          allowsPremiumAccess: accessRights.allowsPremiumAccess,
          allowsVIPAccess: accessRights.allowsVIPAccess,
          allowsBackstageAccess: accessRights.allowsBackstageAccess,
        },
      });

      tickets.push(ticket);
    }

    // 👤 User Access Rights aktualisieren basierend auf gekauften Tickets
    const hasVIPTicket =
      user.tickets.some(
        (t) => t.type === TicketType.VIP && t.status === "ACTIVE"
      ) || tickets.some((t) => t.type === TicketType.VIP);
    const hasStandardTicket =
      user.tickets.some(
        (t) => t.type === TicketType.STANDARD && t.status === "ACTIVE"
      ) || tickets.some((t) => t.type === TicketType.STANDARD);
    const hasBackstageTicket =
      user.tickets.some(
        (t) => t.type === TicketType.BACKSTAGE && t.status === "ACTIVE"
      ) || tickets.some((t) => t.type === TicketType.BACKSTAGE);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hasVIPAccess: hasVIPTicket,
        hasPremiumAccess: hasVIPTicket || hasStandardTicket,
        hasBackstageAccess: hasBackstageTicket,
      },
    });

    // � PDF Generation für jedes Ticket (vorher deklarieren)
    const ticketsWithPDF = [];
    for (const ticket of tickets) {
      try {
        // QR Code generieren
        const qrCodeUrl = await generateTicketQR(ticket.id, eventId);

        ticketsWithPDF.push({
          id: ticket.id,
          type: ticket.type,
          price: Number(ticket.price),
          qrCode: ticket.qrCode,
          pdfUrl: null,
          validated: false,
          purchasedAt: ticket.purchaseDate,
          downloadReady: false, // Download-Status - disabled until PDF feature implemented
        });
      } catch (pdfError) {
        console.error(
          `📄 PDF generation failed for ticket ${ticket.id}:`,
          pdfError
        );

        // Add ticket ohne PDF
        ticketsWithPDF.push({
          id: ticket.id,
          type: ticket.type,
          price: Number(ticket.price),
          qrCode: ticket.qrCode,
          pdfUrl: null,
          validated: false,
          purchasedAt: ticket.purchaseDate,
          downloadReady: false, // Download-Status - disabled until PDF feature implemented
        });
      }
    }

    // �💳 Payment erstellen und optional Stripe Checkout Session
    const useStripeCheckout =
      process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production";

    if (useStripeCheckout) {
      // Create Stripe Checkout Session
      try {
        const stripeResponse = await fetch(
          `${process.env.NEXTAUTH_URL}/api/payments/stripe/checkout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ticketIds: tickets.map((t) => t.id),
              eventId: eventId,
            }),
          }
        );

        if (stripeResponse.ok) {
          const stripeResult = await stripeResponse.json();

          return NextResponse.json({
            success: true,
            tickets: ticketsWithPDF,
            totalPrice,
            checkoutUrl: stripeResult.checkoutUrl,
            sessionId: stripeResult.sessionId,
            testMode: stripeResult.testMode,
            message: "Ticket reserviert - Weiterleitung zur Stripe-Zahlung",
            testCards: stripeResult.testCards,
          });
        }
      } catch (stripeError) {
        console.warn(
          "⚠️ Stripe checkout failed, falling back to direct purchase:",
          stripeError
        );
      }
    }

    // Fallback: Direct Payment (für Development/Demo)
    for (const ticket of tickets) {
      await prisma.payment.create({
        data: {
          amount: ticketPrice,
          currency: "EUR",
          status: "COMPLETED", // Direct completion for demo
          ticketId: ticket.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `🎫 ${quantity} ${ticketType} Ticket(s) erfolgreich gekauft!`,
      tickets: ticketsWithPDF.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.id, // Use ID as ticket number
        type: ticket.type,
        price: ticket.price,
        eventTitle: event.title,
        eventDate: event.startDate,
        accessRights: getAccessDescription(ticketType),
        pdfUrl: null, // 📄 PDF Download Link - feature not implemented yet
        qrCode: ticket.qrCode, // 📱 QR Code für Mobile
        downloadReady: false, // Download-Status - disabled until PDF feature implemented
      })),
      totalPrice,
      userAccessRights: {
        canAccessConcert:
          hasBackstageTicket || hasStandardTicket || hasVIPTicket,
        canAccessPremium: hasStandardTicket || hasVIPTicket,
        canAccessVIP: hasVIPTicket,
        canAccessBackstage: hasBackstageTicket,
      },
      pdfGenerated: 0, // PDF feature not implemented yet
      message2:
        "🎫 Tickets wurden erfolgreich gekauft! PDF-Feature kommt in v2.2.0",
    });
  } catch (error) {
    console.error("🚨 Ticket purchase error DETAILS:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      name: error instanceof Error ? error.name : "Unknown name",
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Interner Server Fehler",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}

// 🎫 GET - User Tickets anzeigen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Anmeldung erforderlich" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        tickets: {
          include: {
            event: {
              select: {
                title: true,
                startDate: true,
                venue: true,
                city: true,
              },
            },
          },
          orderBy: { purchaseDate: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      tickets: user.tickets.map((ticket) => ({
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        type: ticket.type,
        price: ticket.price,
        status: ticket.status,
        purchaseDate: ticket.purchaseDate,
        event: ticket.event,
        accessRights: getAccessDescription(ticket.type),
      })),
      userAccessRights: {
        canAccessConcert: user.tickets.some((t) => t.status === "ACTIVE"),
        canAccessPremium: user.tickets.some(
          (t) =>
            (t.type === TicketType.STANDARD || t.type === TicketType.VIP) &&
            t.status === "ACTIVE"
        ),
        canAccessVIP: user.tickets.some(
          (t) => t.type === TicketType.VIP && t.status === "ACTIVE"
        ),
        canAccessBackstage: user.tickets.some(
          (t) => t.type === TicketType.BACKSTAGE && t.status === "ACTIVE"
        ),
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    return NextResponse.json(
      { error: "Interner Server Fehler" },
      { status: 500 }
    );
  }
}

// 🎫 Helper Function - Access Description
function getAccessDescription(ticketType: TicketType) {
  switch (ticketType) {
    case TicketType.STANDARD:
      return {
        name: "Standard Ticket",
        access: ["🎤 Konzert-Zugang", "⭐ Premium Bereich"],
        description: "Konzert + Premium Bereich",
      };
    case TicketType.VIP:
      return {
        name: "VIP Ticket",
        access: ["🎤 Konzert-Zugang", "⭐ Premium Bereich", "👑 VIP Bereich"],
        description: "Konzert + Premium + VIP Bereich",
      };
    case TicketType.BACKSTAGE:
      return {
        name: "Backstage Ticket",
        access: [
          "🎤 Konzert-Zugang",
          "⭐ Premium Bereich",
          "👑 VIP Bereich",
          "🎸 Backstage-Zugang",
        ],
        description: "VOLLZUGANG zu allen Bereichen",
      };
    case TicketType.BAND_PASS:
      return {
        name: "Band Pass",
        access: [
          "🎤 Konzert-Zugang",
          "⭐ Premium Bereich",
          "👑 VIP Bereich",
          "🎸 Backstage-Zugang",
          "🎵 Band Access",
        ],
        description: "Band Member - Vollzugang",
      };
    case TicketType.ADMIN_PASS:
      return {
        name: "Admin Pass",
        access: [
          "🎤 Konzert-Zugang",
          "⭐ Premium Bereich",
          "👑 VIP Bereich",
          "🎸 Backstage-Zugang",
          "👑 Admin Access",
        ],
        description: "Administrator - Vollzugang",
      };
    default:
      return {
        name: "Unknown",
        access: [],
        description: "Unbekanntes Ticket",
      };
  }
}
