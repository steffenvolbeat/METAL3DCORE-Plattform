// 🎸 API Route - Coming Soon Data Management
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initial Coming Soon Data based on COMING_SOON.md
const INITIAL_DATA = {
  vision:
    "Metal3DCore Platform (M3DC) revolutioniert das digitale Metal-Erlebnis durch die Verschmelzung von immersiver 3D-Technologie und authentischer Metal-Kultur. Die Plattform schafft virtuelle Räume, in denen Fans nicht nur passive Zuschauer sind, sondern aktiv Teil der Metal-Community werden.\n\n🎯 CORE PLATFORM COMPLETE: Das 3D-Environment mit allen wesentlichen Räumen ist vollständig implementiert. Fokus liegt auf stabiler, hochperformanter 3D-Erfahrung mit fotorealistischen Materialien und immersiver Navigation.\n\n🚀 ENTERPRISE-READY ARCHITEKTUR: Saubere, skalierbare Codebasis mit TypeScript, Next.js 15 und modernsten Web-Standards.",

  features: [
    "🎸 Immersive 3D-Räume mit First-Person-Navigation",
    "🎥 Live-YouTube-Integration mit reaktiven Equalizern",
    "🎫 Ticket-System mit Role-Based Access Control",
    "🔐 NextAuth.js Authentication System",
    "�️ PostgreSQL mit Prisma ORM",
    "🌐 TypeScript & Next.js 15 Foundation",
    "🎯 Enterprise-Level Architecture",
    "📊 Performance Optimized 3D Rendering",
    "🔄 Responsive Design & Mobile Support",
    "🌍 Internationalization (DE/EN)",
  ],

  milestones: [
    {
      id: "1",
      title: "Foundation - Next.js 15.5.7 Setup",
      description:
        "Next.js mit Turbopack, TypeScript, Tailwind CSS 4, Prisma ORM, PostgreSQL, NextAuth.js",
      status: "completed",
      date: "November 2025",
    },
    {
      id: "2",
      title: "3D Core Implementation",
      description:
        "React Three Fiber Integration, FPS-Controls, 7 3D-Räume (Welcome, Stadium, Backstage, Community, Gallery, Contact, Ticket)",
      status: "completed",
      date: "November 2025",
    },
    {
      id: "3",
      title: "User Management & E-Commerce",
      description:
        "User Registration/Login, Dashboard, Role-Based Access Control (FAN, VIP, BAND_MEMBER), Ticket-System",
      status: "completed",
      date: "November 2025",
    },
    {
      id: "4",
      title: "UI/UX Optimization",
      description:
        "Professional Sidebar Navigation, Responsive Design, Accessibility",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "5",
      title: "Room Enlargement & Realistic Scaling",
      description:
        "Ticket Arena auf 120x120 Units erweitert, Deckenhöhe 37 Units für realistisches Arena-Feeling",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "6",
      title: "Interactive Drag & Drop System",
      description:
        "3-Wand Card-System mit Boundary Constraints, frei positionierbare Concert Posters und Ticket Automaten",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "7",
      title: "Wall-Based Card Architecture",
      description:
        "Rückwand: Concert Posters, Rechte Wand: Ticket Automaten, Vorderwand: Info Counter - optimierte 3D-Navigation",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "8",
      title: "Advanced YouTube TV Integration",
      description:
        "Feste Wandmontage mit Emissive Lighting, Full Screen Display (h-screen), verbesserte Kamera-Position",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "9",
      title: "Persistent Card Positioning System",
      description:
        "localStorage-Integration für alle 3 Wände, Positionen bleiben nach Raumwechsel erhalten, Click-to-Position für alle Wände",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "10",
      title: "Central Cash Desk System",
      description:
        "3D Kassen-Pult in Arena-Mitte, vollständiger Ticket-Kaufprozess (digital/Papier), E-Mail/Post-Versand, Adress-Verwaltung",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "11",
      title: "Photorealistic Venue Recreation",
      description:
        "1:1 WelcomeStage Recreation des originalen Hallenstadion Zürich mit hochglanz Steinboden, LED-Deckenstreifen, blauen HALLENSTADION-Displays und Multi-Level-Galerien",
      status: "completed",
      date: "Dezember 2025",
    },
    {
      id: "12",
      title: "Performance & Optimization",
      description:
        "3D-Performance Optimierung, Bundle Size Reduction, SEO Verbesserungen",
      status: "planned",
      date: "Januar 2025",
    },
    {
      id: "13",
      title: "Community Features",
      description:
        "Erweiterte Community-Funktionen, User-Interaktionen, Social Features",
      status: "planned",
      date: "Februar 2025",
    },
    {
      id: "14",
      title: "Testing & Quality Assurance",
      description:
        "Umfassende Tests, Performance-Optimierung, Accessibility Validation",
      status: "planned",
      date: "März 2025",
    },
    {
      id: "15",
      title: "Production Deployment",
      description:
        "Live Deployment, Performance Monitoring, Final Documentation",
      status: "planned",
      date: "April 2025",
    },
  ],

  upcomingFeatures: [
    "VR-Support für immersives Erlebnis",
    "Erweiterte 3D-Interaktionen",
    "Zusätzliche Venue-Recreations",
    "Mobile App (React Native)",
    "Advanced Material System (PBR)",
    "Real-time Music Visualizer",
    "Multi-Language Support (FR, ES, IT)",
    "Community-Events-Kalender",
    "User-Galerie für Fan-Art",
    "Achievement-System für Fans",
    "Social Media Integration",
    "Fotorealistische Texturen",
    "Interactive 3D-Overlays",
    "Performance Analytics Dashboard",
    "Accessibility Improvements",
    "SEO Optimization",
    "PWA Support (Offline-Fähigkeit)",
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
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(comingSoonData);
  } catch (error) {
    console.error("Error fetching coming soon data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update Coming Soon Data
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is Admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate data structure
    if (!body.vision || !body.milestones || !body.upcomingFeatures) {
      return NextResponse.json(
        { error: "Invalid data structure" },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
