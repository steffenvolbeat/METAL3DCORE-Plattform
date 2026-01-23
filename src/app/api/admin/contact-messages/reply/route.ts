import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import nodemailer from "nodemailer";
import { z } from "zod";

// 🎸 3DMetal Platform - Admin Reply API
// Antworten auf Contact Messages mit Email-Versand

// Validation Schema
const ReplySchema = z.object({
  messageId: z.string(),
  content: z.string().min(10, "Antwort muss mindestens 10 Zeichen lang sein"),
  isInternal: z.boolean().default(false),
  sendEmail: z.boolean().default(true),
});

// Email Transporter
function createEmailTransporter() {
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

// POST - Neue Antwort erstellen
export async function POST(request: NextRequest) {
  try {
    // Auth Check
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.role || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    // Validation
    const body = await request.json();
    const validationResult = ReplySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Ungültige Eingabedaten",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { messageId, content, isInternal, sendEmail } = validationResult.data;

    // Get original message
    const originalMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId },
    });

    if (!originalMessage) {
      return NextResponse.json({ error: "Contact message not found" }, { status: 404 });
    }

    // Create reply
    const reply = await prisma.contactReply.create({
      data: {
        messageId,
        content,
        isInternal,
        sentByEmail: sendEmail && !isInternal,
        adminId: session.user.id,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update message status
    await prisma.contactMessage.update({
      where: { id: messageId },
      data: {
        status: isInternal ? "IN_PROGRESS" : "RESPONDED",
        respondedAt: isInternal ? undefined : new Date(),
        respondedById: isInternal ? undefined : session.user.id,
      },
    });

    // Send Email wenn nicht intern
    if (sendEmail && !isInternal) {
      const transporter = createEmailTransporter();

      const mailOptions = {
        from: `"3DMetal Support" <support@3dmetal.com>`,
        to: originalMessage.email,
        replyTo: session.user.email || "support@3dmetal.com",
        subject: `Re: ${originalMessage.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; text-align: center;">🎸 3DMetal Platform</h1>
              <p style="color: white; margin: 5px 0 0 0; text-align: center;">Support Antwort</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
              <p style="color: #333;">Hallo ${originalMessage.name},</p>
              
              <p style="color: #555; line-height: 1.6;">
                vielen Dank für Ihre Nachricht. Hier ist die Antwort unseres Support-Teams:
              </p>

              <div style="background: white; padding: 15px; border-left: 4px solid #ff6b35; border-radius: 5px; margin: 20px 0; white-space: pre-wrap; line-height: 1.6; color: #333;">
${content}
              </div>

              <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Ihre ursprüngliche Nachricht:</p>
                <p style="margin: 0; color: #555; font-style: italic;">${originalMessage.message}</p>
              </div>

              <p style="color: #555; line-height: 1.6;">
                Falls Sie weitere Fragen haben, antworten Sie einfach auf diese E-Mail.
              </p>

              <div style="margin-top: 30px; text-align: center;">
                <a href="http://localhost:3000/contact" style="background: #ff6b35; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  🎸 Zur 3DMetal Platform
                </a>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
                <p>Mit rockigen Grüßen,<br>${session.user.name || "Das 3DMetal Support Team"}</p>
                <p style="font-size: 12px; color: #999;">Ticket-ID: ${messageId}</p>
              </div>
            </div>
          </div>
        `,
        text: `
          3DMetal Platform - Support Antwort
          ===================================

          Hallo ${originalMessage.name},

          vielen Dank für Ihre Nachricht. Hier ist die Antwort unseres Support-Teams:

          ${content}

          ---
          Ihre ursprüngliche Nachricht:
          ${originalMessage.message}

          ---
          Falls Sie weitere Fragen haben, antworten Sie einfach auf diese E-Mail.

          Mit rockigen Grüßen,
          ${session.user.name || "Das 3DMetal Support Team"}

          Ticket-ID: ${messageId}
        `,
      };

      if (process.env.NODE_ENV === "development") {
        console.log("📧 Reply Email (Development Mode):");
        console.log("To:", originalMessage.email);
        console.log("Subject:", mailOptions.subject);
        console.log("From:", session.user.name);
      } else {
        await transporter.sendMail(mailOptions);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      data: reply,
    });
  } catch (error) {
    console.error("❌ Reply API Error:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

// GET - Liste aller Replies für eine Message
export async function GET(request: NextRequest) {
  try {
    // Auth Check
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.role || !["ADMIN", "MODERATOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json({ error: "messageId is required" }, { status: 400 });
    }

    const replies = await prisma.contactReply.findMany({
      where: { messageId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: replies,
    });
  } catch (error) {
    console.error("❌ Get Replies Error:", error);
    return NextResponse.json({ error: "Failed to fetch replies" }, { status: 500 });
  }
}
