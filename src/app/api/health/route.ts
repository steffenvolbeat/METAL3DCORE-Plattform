import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check database connection
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "METAL3DCORE-PLATTFORM",
      version: process.env.npm_package_version || "2.3.1",
      environment: process.env.NODE_ENV,
      database: "connected",
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "METAL3DCORE-PLATTFORM",
        error: "Database connection failed",
      },
      { status: 503 }
    );
  }
}
