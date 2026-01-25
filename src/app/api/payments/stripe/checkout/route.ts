// 💳 Stripe Checkout API - Test Mode für sichere Demo
// Real Stripe Integration aber mit Test-Keys

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Only initialize Stripe if secret key is available and not a disabled placeholder
const stripe =
  stripeSecretKey && !stripeSecretKey.includes("dev_disabled")
    ? new Stripe(stripeSecretKey, {
        apiVersion: "2025-12-15.clover",
      })
    : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is available
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured - payment system disabled" }, { status: 503 });
    }

    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Anmeldung erforderlich" }, { status: 401 });
    }

    const { ticketIds, eventId } = await request.json();

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return NextResponse.json({ error: "Ticket IDs erforderlich" }, { status: 400 });
    }

    // Tickets aus Datenbank holen
    const tickets = await prisma.ticket.findMany({
      where: {
        id: { in: ticketIds },
        user: { email: session.user.email },
      },
      include: {
        event: true,
      },
    });

    if (tickets.length === 0) {
      return NextResponse.json({ error: "Keine gültigen Tickets gefunden" }, { status: 404 });
    }

    // Line Items für Stripe Checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = tickets.map(ticket => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `🎫 Metal3DCore Ticket - ${ticket.type}`,
          description: `${ticket.event.title} - ${ticket.event.venue}`,
          images: ["https://via.placeholder.com/800x600/FF6600/FFFFFF?text=Metal3DCore+Ticket"],
          metadata: {
            ticketId: ticket.id,
            eventId: ticket.eventId,
            ticketType: ticket.type,
          },
        },
        unit_amount: Math.round(Number(ticket.price) * 100), // Preis in Cents
      },
      quantity: 1,
    }));

    // Stripe Checkout Session erstellen
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/tickets/cancel`,
      customer_email: session.user.email,
      metadata: {
        userId: session.user.email,
        eventId: eventId || tickets[0].eventId,
        ticketCount: tickets.length.toString(),
        mode: "test", // Markierung für Test-Mode
      },
      // Automatische Steuer-Berechnung deaktiviert für Demo
      automatic_tax: { enabled: false },
      // Shipping nicht erforderlich für digitale Tickets
      shipping_address_collection: { allowed_countries: [] },
      // Test-Mode Hinweise
      payment_intent_data: {
        metadata: {
          test_mode: "true",
          platform: "Metal3DCore",
        },
      },
    });

    // Payment Record mit Stripe Session ID aktualisieren
    for (const ticket of tickets) {
      await prisma.payment.updateMany({
        where: { ticketId: ticket.id },
        data: {
          status: "PENDING",
          // paymentMethod: "STRIPE", // Falls das Feld nicht existiert
        },
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
      testMode: true,
      message: "Stripe Checkout Session erstellt (TEST-MODE)",
      testCards: {
        visa: "4242 4242 4242 4242",
        mastercard: "5555 5555 5555 4444",
        amex: "3782 822463 10005",
        note: "Alle Dates in der Zukunft, CVV beliebig",
      },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Stripe Error: " + error.message,
          type: error.type,
          code: error.code,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Fehler beim Erstellen der Checkout Session" }, { status: 500 });
  }
}

// GET - Session Status überprüfen
export async function GET(request: NextRequest) {
  try {
    // Check if Stripe is available
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured - payment system disabled" }, { status: 503 });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID erforderlich" }, { status: 400 });
    }

    // Stripe Session abrufen
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      totalAmount: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      testMode: session.livemode === false,
    });
  } catch (error) {
    console.error("Stripe session retrieval error:", error);
    return NextResponse.json({ error: "Fehler beim Abrufen der Session" }, { status: 500 });
  }
}
