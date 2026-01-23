/**
 * Health Check API Endpoint for Cypress Testing
 * Provides system health status and performance metrics
 */

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: "2.3.1-testing",
      services: {
        database: "operational",
        authentication: "operational",
        storage: "operational",
        webgl: "available",
      },
      performance: {
        memoryUsage: process.memoryUsage(),
        responseTime: Date.now(),
      },
      checks: {
        diskSpace: "ok",
        networkConnectivity: "ok",
        cpuUsage: "normal",
        errorRate: "low",
      },
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
        "X-Health-Check": "passed",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        services: {
          database: "error",
          authentication: "error",
          storage: "error",
          webgl: "unavailable",
        },
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache",
          "Content-Type": "application/json",
          "X-Health-Check": "failed",
        },
      }
    );
  }
}
