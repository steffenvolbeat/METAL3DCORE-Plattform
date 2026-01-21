// 📧 Invoice Email API - Automatischer Rechnungsversand nach Ticket-Kauf
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import nodemailer from "nodemailer";
import { z } from "zod";

// Validation Schema für Invoice Request
const InvoiceSchema = z.object({
  ticketIds: z.array(z.string()),
  customerEmail: z.string().email(),
  paymentMethod: z.string(),
  totalAmount: z.number().positive(),
  currency: z.string().default("CHF"),
  billingAddress: z.object({
    company: z.string().optional(),
    name: z.string(),
    email: z.string().email(),
    taxNumber: z.string().optional(),
  }),
});

// Email Transporter für Rechnungsversand
function createInvoiceTransporter() {
  if (process.env.NODE_ENV === "development") {
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "ethereal.user@ethereal.email",
        pass: "ethereal.pass",
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// POST Handler für Rechnungsversand
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
    const validationResult = InvoiceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Ungültige Rechnungsdaten",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      ticketIds,
      customerEmail,
      paymentMethod,
      totalAmount,
      currency,
      billingAddress,
    } = validationResult.data;

    // Rechnung generieren
    const invoiceNumber = `M3DC-${Date.now()}`;
    const invoiceDate = new Date().toLocaleDateString("de-DE");

    // Email Content
    const invoiceHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a, #2d2d2d); padding: 30px; text-align: center;">
          <h1 style="color: #ff6b35; margin: 0; font-size: 28px;">🎸 Metal3DCore Platform</h1>
          <p style="color: #fff; margin: 10px 0 0 0; font-size: 16px;">Rechnung für Ticket-Kauf</p>
        </div>

        <!-- Invoice Content -->
        <div style="padding: 30px; background: white;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h2 style="color: #333; margin: 0 0 10px 0;">Rechnung</h2>
              <p style="color: #666; margin: 0;">Rechnungsnummer: <strong>${invoiceNumber}</strong></p>
              <p style="color: #666; margin: 0;">Datum: ${invoiceDate}</p>
            </div>
            <div style="text-align: right;">
              <h3 style="color: #ff6b35; margin: 0; font-size: 24px;">${currency} ${totalAmount.toFixed(
      2
    )}</h3>
              <p style="color: #666; margin: 0;">inkl. MwSt.</p>
            </div>
          </div>

          <!-- Billing Details -->
          <div style="margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Rechnungsadresse</h3>
            ${
              billingAddress.company
                ? `<p style="margin: 0; color: #666;"><strong>${billingAddress.company}</strong></p>`
                : ""
            }
            <p style="margin: 0; color: #666;">${billingAddress.name}</p>
            <p style="margin: 0; color: #666;">${billingAddress.email}</p>
            ${
              billingAddress.taxNumber
                ? `<p style="margin: 0; color: #666;">USt-IdNr.: ${billingAddress.taxNumber}</p>`
                : ""
            }
          </div>

          <!-- Ticket Details -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #333; margin: 0 0 15px 0;">Ticket Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; border: 1px solid #dee2e6;">Artikel</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">Anzahl</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Preis</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 12px; border: 1px solid #dee2e6;">
                    🎫 Metal Concert Tickets<br>
                    <small style="color: #666;">Ticket-IDs: ${ticketIds.join(
                      ", "
                    )}</small>
                  </td>
                  <td style="padding: 12px; text-align: center; border: 1px solid #dee2e6;">${
                    ticketIds.length
                  }</td>
                  <td style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${currency} ${totalAmount.toFixed(
      2
    )}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="background: #f8f9fa;">
                  <th colspan="2" style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">Gesamtbetrag:</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #dee2e6;">${currency} ${totalAmount.toFixed(
      2
    )}</th>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Payment Info -->
          <div style="margin-bottom: 30px; padding: 20px; background: #e8f5e8; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin: 0 0 10px 0;">💳 Zahlungsinformationen</h3>
            <p style="margin: 0; color: #666;">Zahlungsart: <strong>${paymentMethod}</strong></p>
            ${
              paymentMethod === "invoice"
                ? `<p style="margin: 5px 0 0 0; color: #666;">Zahlungsziel: 30 Tage netto</p>
               <p style="margin: 5px 0 0 0; color: #666;">Bitte überweisen Sie den Betrag auf unser Geschäftskonto.</p>`
                : `<p style="margin: 5px 0 0 0; color: #28a745;"><strong>✅ Zahlung erfolgreich verarbeitet</strong></p>`
            }
          </div>

          <!-- Ticket Access Info -->
          <div style="margin-bottom: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin: 0 0 10px 0;">🎫 Ticket-Zugang</h3>
            <p style="margin: 0; color: #856404;">Ihre Tickets sind in Ihrem Metal3DCore Account verfügbar:</p>
            <p style="margin: 10px 0 0 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                 style="background: #ff6b35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                🎸 Meine Tickets anzeigen
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #1a1a1a; padding: 20px; text-align: center;">
          <p style="color: #ccc; margin: 0; font-size: 14px;">
            Metal3DCore Platform - Ihr Partner für unvergessliche Metal-Erlebnisse
          </p>
          <p style="color: #888; margin: 10px 0 0 0; font-size: 12px;">
            Diese Rechnung wurde automatisch generiert. Bei Fragen kontaktieren Sie uns über unser Kontaktformular.
          </p>
        </div>
      </div>
    `;

    // Email versenden
    const transporter = createInvoiceTransporter();

    const mailOptions = {
      from: `"Metal3DCore Platform" <noreply@metal3dcore.com>`,
      to: customerEmail,
      subject: `🎫 Ihre Rechnung ${invoiceNumber} - Metal3DCore Platform`,
      html: invoiceHTML,
      text: `
        Metal3DCore Platform - Rechnung ${invoiceNumber}
        
        Vielen Dank für Ihren Ticket-Kauf!
        
        Rechnungsnummer: ${invoiceNumber}
        Datum: ${invoiceDate}
        Gesamtbetrag: ${currency} ${totalAmount.toFixed(2)}
        
        Ihre Tickets sind in Ihrem Account verfügbar: ${
          process.env.NEXTAUTH_URL
        }/dashboard
        
        Mit rockigen Grüßen,
        Das Metal3DCore Team
      `,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("📧 Invoice Email (Development Mode):");
      console.log("To:", customerEmail);
      console.log("Subject:", mailOptions.subject);
      console.log("Invoice Number:", invoiceNumber);
      console.log("Amount:", `${currency} ${totalAmount.toFixed(2)}`);
    } else {
      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({
      success: true,
      message: "📧 Rechnung wurde erfolgreich per E-Mail versendet",
      invoiceNumber,
      sentTo: customerEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Invoice API Error:", error);

    return NextResponse.json(
      {
        error: "Fehler beim Versenden der Rechnung",
        details: error instanceof Error ? error.message : "Unbekannter Fehler",
      },
      { status: 500 }
    );
  }
}
