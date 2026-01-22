// 🎸 API Route - Coming Soon Data Management
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initial Coming Soon Data based on COMING_SOON.md
const INITIAL_DATA = {
  vision:
    "🎸 Metal3DCore Platform (M3DC) - Entwicklung läuft auf Hochtouren!\n\n🔄 SECURITY & TESTING PHASE (Januar 2026): Das Projekt ist fast abgeschlossen, aber Phase 6 (IT-Sicherheit) und Phase 6.5 (Testing & QA) müssen wiederholt werden, um höchste Qualitäts- und Sicherheitsstandards zu gewährleisten. Quality Gates wurden nicht vollständig erfüllt.\n\n⏸️ DEPLOYMENT PAUSIERT: Production-Launch verschoben bis alle Sicherheits- und Test-Reviews erfolgreich abgeschlossen sind. Enterprise-Level Qualität hat oberste Priorität.",

  features: [
    "🎸 7 Vollständig implementierte 3D-Räume (Welcome, Stadium, Gallery, Community, Contact, Ticket, Backstage)",
    "🎥 Live-YouTube-Integration mit reaktiven Audio-Equalizern",
    "🎫 Vollständiges Ticket-System mit CHF-Realpreisen (50-150 CHF)",
    "💳 10 Payment-Methoden inkl. Kreditkarte, PayPal, TWINT, Bank-Transfer",
    "🔐 NextAuth.js mit 5 User-Rollen (FAN, VIP_FAN, BAND, ADMIN, BENEFIZ)",
    "🗄️ PostgreSQL + Prisma ORM mit vollständiger Datenmodellierung",
    "🌐 TypeScript & Next.js 15.5.9 mit Turbopack",
    "🎯 Enterprise-Level Architecture mit Clean Code",
    "📊 Performance-optimierte 3D-Rendering (60+ FPS)",
    "🔄 Responsive Design mit Mobile-First Approach",
    "🌍 Mehrsprachigkeit (DE/EN) + Accessibility",
    "📧 Email-System für Tickets, Registrierung, Passwort-Reset",
    "🖱️ Advanced Drag & Drop UI-Positionierung",
    "📹 Webcam-Integration mit Live-Streaming-Support",
    "🎪 Photorealistische Venue-Recreation (Hallenstadion Zürich 1:1)",
  ],

  milestones: [
    {
      id: "1",
      title: "Foundation - Next.js 15.5.9 Setup ✅",
      description:
        "Next.js mit Turbopack, TypeScript, Tailwind CSS 4, Prisma ORM, PostgreSQL, NextAuth.js vollständig konfiguriert",
      status: "completed",
      date: "November 2025",
    },
    {
      id: "2",
      title: "3D Core Implementation ✅",
      description:
        "React Three Fiber Integration, FPS-Controls, 7 3D-Räume vollständig entwickelt (Welcome, Stadium, Backstage, Community, Gallery, Contact, Ticket)",
      status: "completed",
      date: "November 2025",
    },
    {
      id: "3",
      title: "User Management & E-Commerce ✅",
      description:
        "Vollständige User Registration/Login, Dashboard, 5 User-Rollen (FAN, VIP_FAN, BAND, ADMIN, BENEFIZ), komplettes Ticket-System mit CHF-Preisen",
      status: "completed",
      date: "November 2025",
    },
    {
      id: "4",
      title: "UI/UX Optimization ✅",
      description:
        "Professional Navigation, Responsive Design, Mobile-First, Accessibility Standards, moderne Tailwind CSS 4 Integration",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "5",
      title: "Photorealistic 3D Environments ✅",
      description:
        "Ticket Arena 120x120 Units, Deckenhöhe 37 Units, 1:1 Hallenstadion Zürich Recreation mit hochglanz Steinböden und LED-Beleuchtung",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "6",
      title: "Advanced Interactive Systems ✅",
      description:
        "Drag & Drop UI mit 3-Wand-System, frei positionierbare Concert Posters, Ticket Automaten mit localStorage Persistierung",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "7",
      title: "Payment & E-Commerce Integration ✅",
      description:
        "10 Payment-Methoden (Kreditkarte, PayPal, TWINT, etc.), vollständiger Kaufprozess, PDF-Invoices, E-Mail-Versand, Adress-Management",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "8",
      title: "Live Media Integration ✅",
      description:
        "YouTube TV mit Emissive Lighting, Full Screen Display, Live-Webcam-Support, Audio-Visualizer, optimierte Kamera-Positions",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "9",
      title: "Database & Backend Architecture ✅",
      description:
        "PostgreSQL-Schema vollständig, Prisma ORM, User/Ticket/Payment-Modelle, API-Routes, Middleware, Security-Layer",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "10",
      title: "Authentication & Authorization ✅",
      description:
        "NextAuth.js 4.24.13, User Registration, Login, Password Reset, Email Verification, Role-Based Access Control für alle Räume",
      status: "completed",
      date: "Januar 2026",
    },
    {
      id: "11",
      title: "🔄 Security Audit & Testing Phase 6 - REDO REQUIRED",
      description:
        "Security-Review erforderlich: Nochmalige Überprüfung aller Sicherheitsmaßnahmen, CSRF-Protection, Rate-Limiting, Input-Validation müssen verstärkt werden",
      status: "in_progress",
      date: "Januar 2026",
    },
    {
      id: "12",
      title: "📋 Testing & QA Phase 6.5 - RESTART NEEDED",
      description:
        "Vollständige Test-Suite muss wiederholt werden: E2E-Tests, Unit-Tests, Load-Tests, UAT, Security-Testing - Quality Gate nicht erfüllt",
      status: "planned",
      date: "Januar 2026",
    },
    {
      id: "13",
      title: "⏸️ Production Deployment - PAUSED",
      description:
        "Deployment pausiert bis Phase 6 & 6.5 erfolgreich abgeschlossen - Quality Gates müssen erfüllt werden",
      status: "blocked",
      date: "Verschoben",
    },
  ],

  upcomingFeatures: [
    "🥽 VR-Support für noch immersiveres Erlebnis",
    "🎭 Erweiterte 3D-Charakterinteraktionen",
    "🏟️ Weitere Venue-Recreations (Madison Square Garden, Wacken)",
    "📱 Native Mobile App (React Native)",
    "🎨 Advanced PBR Material System",
    "🎵 Real-time Music Visualizer mit Live-Audio-Analysis",
    "🌍 Erweiterte Mehrsprachigkeit (FR, ES, IT, RU)",
    "📅 Community-Events-Kalender mit Push-Notifications",
    "🖼️ User-Galerie für Fan-Art und Band-Content",
    "🏆 Achievement-System und Gamification",
    "📲 Social Media Deep-Integration (Instagram, TikTok, Spotify)",
    "🔮 AI-gestützte Empfehlungen für Events und Musik",
    "🎮 Interactive Mini-Games im 3D-Environment",
    "💫 Particle-Effects und Advanced Lighting",
    "🔊 Spatial Audio für realistisches Sounderlebnis",
    "⚡ WebGL 2.0 + WebGPU Performance-Boost",
    "🌐 PWA mit Offline-Funktionalität",
    "🤖 Chatbot-Integration für User-Support",
    "📊 Advanced Analytics Dashboard für Bands",
    "🎪 Event-Streaming direkt in der 3D-Umgebung",
  ],
};

// In-memory storage (replace with database in production)
let comingSoonData = { ...INITIAL_DATA };

// GET - Retrieve Coming Soon Data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is Admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    return NextResponse.json(comingSoonData);
  } catch (error) {
    console.error("Error fetching coming soon data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update Coming Soon Data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is Admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const body = await request.json();

    // Validate data structure
    if (!body.vision || !body.milestones || !body.upcomingFeatures) {
      return NextResponse.json({ error: "Invalid data structure" }, { status: 400 });
    }

    // Update data
    comingSoonData = {
      vision: body.vision,
      features: body.features || comingSoonData.features,
      milestones: body.milestones,
      upcomingFeatures: body.upcomingFeatures,
    };

    return NextResponse.json(comingSoonData);
  } catch (error) {
    console.error("Error updating coming soon data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
