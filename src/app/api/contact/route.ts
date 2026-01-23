import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// 🎸 3DMetal Platform - Contact API Route
// Handles contact form submissions with email sending & database storage
// 🔒 GDPR Compliant with data retention & IP anonymization

// Validation Schema mit Zod
const ContactSchema = z.object({
  name: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen lang sein")
    .max(100, "Name darf maximal 100 Zeichen lang sein"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  subject: z
    .string()
    .min(5, "Betreff muss mindestens 5 Zeichen lang sein")
    .max(200, "Betreff darf maximal 200 Zeichen lang sein"),
  message: z
    .string()
    .min(10, "Nachricht muss mindestens 10 Zeichen lang sein")
    .max(2000, "Nachricht darf maximal 2000 Zeichen lang sein"),
  gdprConsent: z.boolean().optional().default(false),
});

// 🔒 IP-Adresse anonymisieren (GDPR konform)
function anonymizeIP(ip: string): string {
  const parts = ip.split(".");
  if (parts.length === 4) {
    // IPv4: Letzte 2 Oktette entfernen
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  // IPv6: Nur erste 4 Segmente behalten
  const ipv6Parts = ip.split(":");
  if (ipv6Parts.length > 4) {
    return `${ipv6Parts.slice(0, 4).join(":")}::xxxx`;
  }
  return "anonymized";
}

// 🔒 User-Agent kürzen (max 200 Zeichen)
function sanitizeUserAgent(ua: string | null): string | null {
  if (!ua) return null;
  return ua.substring(0, 200);
}

// Email Transporter konfigurieren
function createEmailTransporter() {
  // Für Development: Verwende ethereal.email für Tests
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

  // Für Production: Echte SMTP-Einstellungen
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465", // true für 465, false für andere ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// Rate Limiting (einfache In-Memory-Lösung)
const requestMap = new Map<string, { count: number; lastRequest: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 Minute
  const maxRequests = 5; // Max 5 Anfragen pro Minute

  const userRequests = requestMap.get(ip);

  if (!userRequests) {
    requestMap.set(ip, { count: 1, lastRequest: now });
    return true;
  }

  // Reset counter wenn Fenster abgelaufen
  if (now - userRequests.lastRequest > windowMs) {
    requestMap.set(ip, { count: 1, lastRequest: now });
    return true;
  }

  if (userRequests.count >= maxRequests) {
    return false;
  }

  userRequests.count++;
  userRequests.lastRequest = now;
  return true;
}

// POST Handler für Kontaktformular
export async function POST(request: NextRequest) {
  try {
    // IP für Rate Limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || "unknown";

    // Rate Limiting prüfen
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: "Zu viele Anfragen. Bitte warten Sie eine Minute.",
          code: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 }
      );
    }

    // Request Body parsen
    const body = await request.json();

    // Input-Validierung mit Zod
    const validationResult = ContactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabedaten",
          details: validationResult.error.issues,
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message, gdprConsent } =
      validationResult.data;

    // 🔒 GDPR Consent prüfen
    if (!gdprConsent) {
      return NextResponse.json(
        {
          error: "Datenschutzbestimmungen müssen akzeptiert werden",
          code: "GDPR_CONSENT_REQUIRED",
        },
        { status: 400 }
      );
    }

    // 🔒 Sicherheitsdaten vorbereiten
    const anonymizedIP = anonymizeIP(ip);
    const userAgent = sanitizeUserAgent(request.headers.get("user-agent"));
    const dataRetention = new Date();
    dataRetention.setDate(dataRetention.getDate() + 90); // 90 Tage Aufbewahrung

    // 🗄️ In Datenbank speichern (GDPR konform)
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        ipAddress: anonymizedIP,
        userAgent,
        gdprConsent,
        dataRetention,
        status: "NEW",
      },
    });

    // E-Mail-Transporter erstellen
    const transporter = createEmailTransporter();

    // E-Mail-Optionen
    const mailOptions = {
      from: `"3DMetal Platform" <noreply@3dmetal.com>`,
      to: process.env.CONTACT_EMAIL || "admin@3dmetal.com",
      replyTo: email,
      subject: `[3DMetal Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🎸 3DMetal Platform</h1>
            <p style="color: white; margin: 5px 0 0 0; text-align: center;">Neue Kontaktanfrage</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; border-bottom: 2px solid #ff6b35; padding-bottom: 10px;">Kontaktdetails</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Name:</td>
                <td style="padding: 8px 0; color: #333;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">E-Mail:</td>
                <td style="padding: 8px 0; color: #333;">
                  <a href="mailto:${email}" style="color: #ff6b35; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Betreff:</td>
                <td style="padding: 8px 0; color: #333;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Zeitstempel:</td>
                <td style="padding: 8px 0; color: #666; font-size: 14px;">${new Date().toLocaleString(
                  "de-DE"
                )}</td>
              </tr>
            </table>

            <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Nachricht:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #ff6b35; border-radius: 5px; white-space: pre-wrap; font-family: 'Arial', sans-serif; line-height: 1.6; color: #333;">
${message}
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
              <p>Diese E-Mail wurde über das Kontaktformular der 3DMetal Platform gesendet.</p>
              <p>Message ID: ${contactMessage.id}</p>
              <p>IP-Adresse (anonymisiert): ${anonymizedIP} | Zeitstempel: ${new Date().toISOString()}</p>
            </div>
          </div>
        </div>
      `,
      text: `
        3DMetal Platform - Neue Kontaktanfrage
        =====================================

        Name: ${name}
        E-Mail: ${email}
        Betreff: ${subject}
        Message ID: ${contactMessage.id}
        Zeitstempel: ${new Date().toLocaleString("de-DE")}

        Nachricht:
        ${message}

        ---
        Diese E-Mail wurde über das Kontaktformular der 3DMetal Platform gesendet.
        IP-Adresse (anonymisiert): ${anonymizedIP}
      `,
    };

    // Bestätigungs-E-Mail für den Absender
    const confirmationMailOptions = {
      from: `"3DMetal Platform" <noreply@3dmetal.com>`,
      to: email,
      subject: `Bestätigung: Ihre Nachricht an 3DMetal Platform`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">🎸 3DMetal Platform</h1>
            <p style="color: white; margin: 5px 0 0 0; text-align: center;">Nachricht erhalten</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333;">Vielen Dank, ${name}!</h2>
            
            <p style="color: #555; line-height: 1.6;">
              Wir haben Ihre Nachricht erfolgreich erhalten und werden uns schnellstmöglich bei Ihnen melden. 
              Hier ist eine Kopie Ihrer Nachricht:
            </p>

            <div style="background: white; padding: 15px; border-left: 4px solid #ff6b35; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #333;">Betreff: ${subject}</p>
              <div style="margin-top: 10px; white-space: pre-wrap; color: #555; line-height: 1.6;">${message}</div>
            </div>

            <p style="color: #555; line-height: 1.6;">
              Unser Team arbeitet daran, Ihre Anfrage innerhalb von 24-48 Stunden zu beantworten.
              Falls Sie dringende Fragen haben, können Sie uns auch direkt kontaktieren.
            </p>

            <div style="margin-top: 30px; text-align: center;">
              <a href="http://localhost:3000" style="background: #ff6b35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                🎸 Zurück zur 3DMetal Platform
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
              <p>Mit rockigen Grüßen,<br>Das 3DMetal Platform Team</p>
            </div>
          </div>
        </div>
      `,
      text: `
        3DMetal Platform - Bestätigung Ihrer Nachricht
        =============================================

        Hallo ${name},

        vielen Dank für Ihre Nachricht! Wir haben sie erfolgreich erhalten.

        Ihre Nachricht:
        Betreff: ${subject}
        ${message}

        Unser Team wird sich innerhalb von 24-48 Stunden bei Ihnen melden.

        Mit rockigen Grüßen,
        Das 3DMetal Platform Team
      `,
    };

    // E-Mails senden
    if (process.env.NODE_ENV === "development") {
      // Im Development-Modus: Nur loggen
      console.log("📧 Contact form submission (Development Mode):");
      console.log("From:", name, "<" + email + ">");
      console.log("Subject:", subject);
      console.log("Message ID:", contactMessage.id);
      console.log("Stored in DB with GDPR compliance ✅");
    } else {
      // Im Production-Modus: Echte E-Mails senden
      await transporter.sendMail(mailOptions);
      await transporter.sendMail(confirmationMailOptions);
    }

    // Erfolgreiche Antwort
    return NextResponse.json({
      success: true,
      message:
        "Ihre Nachricht wurde erfolgreich gesendet! Sie erhalten eine Bestätigungs-E-Mail.",
      messageId: contactMessage.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Contact API Error:", error);

    // Spezifische Fehlerbehandlung
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "Ungültiges JSON-Format",
          code: "INVALID_JSON",
        },
        { status: 400 }
      );
    }

    // Allgemeiner Server-Fehler
    return NextResponse.json(
      {
        error:
          "Ein Server-Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}

// GET Handler für API-Info
export async function GET() {
  return NextResponse.json({
    service: "3DMetal Platform Contact API",
    version: "1.0.0",
    methods: ["POST"],
    description: "Handles contact form submissions with email notifications",
    rateLimit: "5 requests per minute per IP",
    lastUpdated: "2025-11-12",
  });
}
