// 🎫 PDF Ticket Generation Service
// Professional PDF Tickets with QR Codes

import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Ticket, Event } from "@/shared/types";

export interface TicketPDFData {
  ticket: Ticket;
  event: Event;
  user: {
    name: string;
    email: string;
  };
}

/**
 * Generate PDF Ticket with QR Code
 */
export async function generateTicketPDF(data: TicketPDFData): Promise<{
  pdfBuffer: Buffer;
  filename: string;
}> {
  const { ticket, event, user } = data;

  // Create new PDF document with better font support
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
    compress: true,
  });

  // Verwende Standard-Fonts

  // Generate QR Code
  const qrCodeDataURL = await QRCode.toDataURL(
    JSON.stringify({
      ticketId: ticket.id,
      eventId: event.id,
      userId: user.email,
      timestamp: new Date().toISOString(),
    }),
    {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    }
  );

  // Set up styling
  doc.setFillColor(20, 20, 20); // Dark background
  doc.rect(0, 0, 210, 297, "F");

  // Header - Metal3DCore Branding (Safe ASCII only)
  doc.setTextColor(255, 102, 0); // Orange
  doc.setFontSize(28);

  doc.text("METAL3DCORE", 105, 25, { align: "center" });

  doc.setTextColor(255, 255, 255); // White
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("THE ULTIMATE 3D METAL EXPERIENCE", 105, 35, { align: "center" });

  // Ticket Type Badge - MUCH MORE PROMINENT
  const getTicketTypeName = (type: string) => {
    switch (type) {
      case "BACKSTAGE":
        return "BACKSTAGE PASS";
      case "VIP":
        return "VIP ACCESS";
      case "STANDARD":
        return "STANDARD";
      default:
        return type.replace("_", " ");
    }
  };

  const ticketTypeName = getTicketTypeName(ticket.type);
  const ticketTypeColor =
    ticket.type === "BACKSTAGE"
      ? ([255, 215, 0] as const) // Gold for Backstage
      : ticket.type === "VIP"
      ? ([255, 69, 0] as const) // Red-Orange for VIP
      : ([255, 102, 0] as const); // Orange for Standard

  // Large prominent ticket type banner
  doc.setFillColor(ticketTypeColor[0], ticketTypeColor[1], ticketTypeColor[2]);
  doc.roundedRect(15, 45, 180, 20, 3, 3, "F");
  doc.setTextColor(0, 0, 0); // Black text on badge
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(ticketTypeName, 105, 58, { align: "center" });

  // Event Details
  doc.setTextColor(255, 255, 255); // White
  doc.setFontSize(20);
  doc.text(event.title, 105, 85, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Venue: ${event.venue}`, 105, 100, { align: "center" });
  doc.text(`Location: ${event.city}, ${event.country}`, 105, 110, {
    align: "center",
  });

  const eventDate = new Date(event.startDate).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Date: ${eventDate}`, 105, 120, { align: "center" });

  // Ticket Details Box
  doc.setFillColor(40, 40, 40);
  doc.roundedRect(15, 135, 180, 60, 3, 3, "F");

  doc.setTextColor(255, 102, 0); // Orange
  doc.setFontSize(16);
  doc.text("TICKET DETAILS", 25, 150);

  doc.setTextColor(255, 255, 255); // White
  doc.setFontSize(12);
  doc.text(`Ticket ID: ${ticket.id}`, 25, 165);
  doc.text(`Owner: ${user.name}`, 25, 175);
  doc.text(`Email: ${user.email}`, 25, 185);
  doc.text(`Price: CHF ${ticket.price.toFixed(2)}`, 25, 195);

  const purchaseDate = new Date(ticket.purchasedAt).toLocaleDateString("de-DE");
  doc.text(`Purchased: ${purchaseDate}`, 120, 165);
  doc.text(`Status: Valid`, 120, 175);

  // Make ticket type more prominent in details
  doc.setTextColor(255, 215, 0); // Gold color for emphasis
  doc.text(`Access: ${getTicketTypeName(ticket.type)}`, 120, 185);

  // QR Code
  doc.addImage(qrCodeDataURL, "PNG", 75, 210, 60, 60);

  doc.setTextColor(255, 102, 0); // Orange
  doc.setFontSize(12);
  doc.text("SCAN FOR ENTRY", 105, 280, { align: "center" });

  // Footer
  doc.setTextColor(128, 128, 128); // Gray
  doc.setFontSize(8);
  doc.text(
    "Metal3DCore Platform - Generated on " + new Date().toLocaleDateString(),
    105,
    290,
    { align: "center" }
  );
  doc.text(
    "This ticket is non-transferable and valid for one entry only",
    105,
    295,
    { align: "center" }
  );

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  const filename = `ticket-${ticket.id}-${event.title.replace(
    /[^a-zA-Z0-9]/g,
    ""
  )}.pdf`;

  return {
    pdfBuffer,
    filename,
  };
}

/**
 * Generate QR Code for ticket validation
 */
export async function generateTicketQR(
  ticketId: string,
  eventId: string
): Promise<string> {
  const qrData = {
    ticketId,
    eventId,
    timestamp: new Date().toISOString(),
    platform: "Metal3DCore",
  };

  return await QRCode.toDataURL(JSON.stringify(qrData), {
    width: 300,
    margin: 2,
    color: {
      dark: "#FF6600",
      light: "#000000",
    },
  });
}
