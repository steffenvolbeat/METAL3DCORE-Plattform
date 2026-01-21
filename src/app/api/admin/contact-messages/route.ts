import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🎸 3DMetal Platform - Admin Contact Messages API
// CRUD Operations für Ticket-Management System

// GET - Liste aller Contact Messages mit Filtering
export async function GET(request: NextRequest) {
  try {
    // Auth Check - Nur ADMIN & MODERATOR
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !session.user.role ||
      !["ADMIN", "MODERATOR"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    // Query Parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const assignedTo = searchParams.get("assignedTo");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build WHERE clause
    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { subject: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch messages with relations
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          respondedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          replies: {
            include: {
              admin: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    // Stats
    const stats = await prisma.contactMessage.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("❌ Admin Contact Messages API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update Message Status/Priority/Assignment
export async function PATCH(request: NextRequest) {
  try {
    // Auth Check
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !session.user.role ||
      !["ADMIN", "MODERATOR"].includes(session.user.role)
    ) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { messageId, status, priority, assignedToId, isSpam } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (isSpam !== undefined) updateData.isSpam = isSpam;

    // Auto-set closedAt wenn Status = CLOSED
    if (status === "CLOSED") {
      updateData.closedAt = new Date();
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: messageId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        replies: {
          include: {
            admin: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contact message updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("❌ Update Contact Message Error:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete Message (Soft delete or hard delete based on GDPR)
export async function DELETE(request: NextRequest) {
  try {
    // Auth Check - Nur ADMIN
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    // Hard delete (inkl. aller Replies durch Cascade)
    await prisma.contactMessage.delete({
      where: { id: messageId },
    });

    return NextResponse.json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Contact Message Error:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
