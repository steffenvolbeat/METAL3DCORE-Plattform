export const COMING_SOON_CONFIG = {
  launchDate: new Date("2026-02-14T10:00:00Z"),
  statusChips: [
    "Version v2.5.0",
    "Build ✓ 04.01.2026 18:45",
    "✅ UAT: 100% PASSED",
    "📅 PHASE 7: PLANNED",
  ],
  metrics: [
    {
      label: "Build-Status",
      value: "GRÜN",
      detail: "npm run build am 10.01.2026 bestätigt",
      tone: "success" as const,
    },
    {
      label: "IT-Sicherheit",
      value: "GRÜN",
      detail: "Alle 13 Schwachstellen behoben - Security Audit bestanden",
      tone: "success" as const,
    },
    {
      label: "Testing & QA",
      value: "100% ✅",
      detail:
        "E2E (40/40) + Unit (28/28) + Load (1,438 req, 0% errors) + UAT (10/10, 0 bugs) ✅ - All tests passed! GO FOR PRODUCTION!",
      tone: "success" as const,
    },
    {
      label: "Production Setup",
      value: "� PLANNED",
      detail:
        "Phase 7: Deployment vorbereitet. UAT abgeschlossen (10/10 tests, 0 bugs). Bereit für Production Setup.",
      tone: "warning" as const,
    },
  ],
  roadmap: [
    {
      title: "Phase 1-2: Infrastruktur & 3D Engine",
      status: "Abgeschlossen",
      progress: 100,
      detail: "Sieben 3D-Räume, Three.js, Auth und Payments live.",
    },
    {
      title: "Phase 3: User System (✅ COMPLETE)",
      status: "Abgeschlossen",
      progress: 100,
      detail:
        "NextAuth.js 4.24.13 vollständig konfiguriert, User Registration + Login, Password Reset + Magic Links, Email Verification, User Profiles, Role-Based Access Control (5 Rollen: FAN, BAND, VIP_FAN, BENEFIZ, ADMIN), Session Management.",
    },
    {
      title: "Phase 4: Business Logic (✅ COMPLETE)",
      status: "Abgeschlossen",
      progress: 100,
      detail:
        "Ticket System (3 Typen: Standard, VIP, Backstage), Real-World Pricing (CHF 45, 89, 150), Access Level Mapping, Ticket Purchase API, QR Code Generation, PDF Invoice Generation, Payment Models (Stripe Integration vorbereitet).",
    },
    {
      title: "Phase 5: Live Webcam (✅ COMPLETE)",
      status: "Abgeschlossen",
      progress: 100,
      detail:
        "WebRTC Live-Video Integration, 3D Video Billboard System, Multi-User Live Concert, Smart Error-Handling, Demo-Mode Fallback, Floating Video-Screens, Automatic Webcam Detection.",
    },
    {
      title: "Phase 6: IT-Sicherheit (✅ COMPLETE)",
      status: "Abgeschlossen",
      progress: 100,
      detail:
        "Alle 13 kritischen Schwachstellen behoben: Secrets Manager, CSRF, Rate-Limiting, Input Validation, Password Policy, XSS Protection, HTTPS Headers, Session Security, Error Handling, Audit Logging, API Auth, Security Audit, CSP Worker Policy (v2 mit script-src-elem).",
    },
    {
      title: "Phase 6.5: Testing & QA (✅ COMPLETE)",
      status: "Abgeschlossen",
      progress: 100,
      detail:
        "Cypress E2E (40/40 ✅), Jest (28/28 ✅), Load Testing (1,438 req ✅), UAT Infrastructure (Guide, Tracking, Invitations ✅), Contact & Support Ticket System (GDPR-Compliant ✅) - All 11/11 tests passed!",
    },
    {
      title: "Phase 7: Deployment (� PLANNED)",
      status: "Geplant",
      progress: 0,
      detail:
        "Production Deployment vorbereitet. UAT abgeschlossen (10/10, 0 bugs). Bereit für Vercel Setup. Target: Feb 14, 2026.",
    },
    {
      title: "Phase 8: Ticket Intelligence (📅 PLANNED)",
      status: "Geplant",
      progress: 0,
      detail:
        "AI-Powered Pricing (Dynamic price adjustments, Competitor monitoring, Revenue optimization), Seat Selection System (Interactive 3D heatmaps, Real-time availability, Best seat suggestions), Upselling Engine (Smart checkout triggers, Cross-sell recommendations, Add-on packages), Analytics Dashboard (Sales forecasting, Demand patterns, Customer behavior). ETA: März 2026.",
    },
    {
      title: "Phase 9: Admin Console V2 (📅 PLANNED)",
      status: "Geplant",
      progress: 0,
      detail:
        "Multi-User Workspaces (Crew + Admin separate areas, Role-based dashboards, Collaborative tools), Activity Logging (Complete audit trail, User action tracking, Change history), Incident Management (Timeline visualization, Priority system, Assignment workflow), Deploy Control (One-click deployments, Rollback functionality, Environment management), AI Concierge Panel (Embedded chatbot, Smart suggestions, Automated reports). ETA: April 2026.",
    },
    {
      title: "Phase 10: Fan Journeys (📅 PLANNED)",
      status: "Geplant",
      progress: 0,
      detail:
        "Personalized Onboarding (Custom welcome experience, Music preference detection, Recommended events), Loyalty System (Ribbon badges, Points for activities, Level progression, Exclusive rewards), Hotel Bot Integration (Automatic recommendations, Price comparison, Booking integration), Travel Kit (Directions to venue, Parking information, Public transport), Metal TV Hub (Live concert clips, Band interviews, Behind-the-scenes, User-generated videos), Gamification (Achievement system, Leaderboards, Challenges, Social sharing). ETA: Mai 2026.",
    },
  ],
  deliverables: [
    {
      title: "✅ COMPLETE: Security-Sprint Week 1 (Fixes 1-4)",
      eta: "✅ DONE",
      bullets: [
        "[1/13] Secrets Management: DATABASE_URL aus .env → Vault/AWS Secrets. ✅",
        "[2/13] CSRF Protection: Token-Middleware auf alle POST/PUT/DELETE. ✅",
        "[3/13] Rate-Limiting: Upstash Redis + 100 req/min Limit. ✅",
        "[4/13] Input Validation: Zod-Schemas für alle API-Endpoints. ✅",
      ],
    },
    {
      title: "✅ COMPLETE: Security-Sprint Week 2 (Fixes 5-8)",
      eta: "✅ DONE",
      bullets: [
        "[5/13] Password-Policy: Min. 12 Zeichen + Have I Been Pwned API. ✅",
        "[6/13] XSS-Sanitization: DOMPurify auf user-generated content. ✅",
        "[7/13] HTTPS/TLS: Let's Encrypt + HSTS + CSP Headers. ✅",
        "[8/13] Session-Security: Timeout 1h + Rotation bei kritischen Ops. ✅",
      ],
    },
    {
      title: "✅ COMPLETE: Security-Sprint Week 3 (Fixes 9-13)",
      eta: "✅ DONE",
      bullets: [
        "[9/13] Error Handling: Generic Messages (keine Stack-Traces). ✅",
        "[10/13] Audit Logging: Pino/Winston für alle kritischen Events. ✅",
        "[11/13] API Authentication: Bearer-Token auf /api/admin/*. ✅",
        "[12/13] Dependency Scan: Snyk CI/CD Integration + Auto-Updates. ✅",
        "[13/13] CSP Worker Policy: script-src-elem + worker-src blob: für Troika. ✅",
      ],
    },
    {
      title: "✅ 100% COMPLETE: Testing & QA Phase (Phase 6.5 + UAT)",
      eta: "✅ ALL TESTS PASSED - GO FOR PRODUCTION",
      bullets: [
        "[1/10] Cypress E2E Tests: 40/40 Tests passing - Alle 7 3D-Räume + Auth + Security. ✅",
        "[2/10] Jest Unit Tests: 28/28 Tests passing - Validation, Security, Prisma, Utils. ✅",
        "[3/10] UI/UX Polish: Navigation spacing, text centering, button alignment. ✅",
        "[4/10] Security Audit: CSP Worker Fix v2, 13/13 Fixes complete. ✅",
        "[5/10] Database Testing: Prisma models via Jest Unit Tests. ✅",
        "[6/10] Load Testing: Node.js - 1,438 req, 0% errors, p95: 339ms. ✅",
        "[7/10] UAT Infrastructure: Guide, Invitations, Tracking, Account Setup. ✅",
        "[8/10] Contact & Support System: GDPR-Compliant Ticket Management + Admin Dashboard. ✅",
        "[9/10] User Acceptance Testing: 10/10 test cases PASSED, 0 bugs, 45 min duration. ✅",
        "[10/10] UAT Sign-Off: GO FOR PRODUCTION decision approved. See: docs/PHASE_7_UAT_SIGN_OFF.md ✅",
      ],
    },
    {
      title: "� Phase 7: Production Deployment (PLANNED)",
      eta: "Feb 2026 - Launch Feb 14, 2026",
      bullets: [
        "✅ Phase 6.5: UAT Complete (10/10 tests, 0 bugs, GO FOR PRODUCTION)",
        "📅 Week 1-2: Vercel Production Setup",
        "📅 Week 3: Database & Environment Configuration",
        "📅 Week 4: Domain & SSL Setup",
        "📅 Week 5: Initial Deployment & Testing",
        "📅 Week 6: Pre-Launch Preparation",
        "🚀 Launch: Feb 14, 2026",
      ],
    },
    {
      title: "📅 Phase 8-10: Future Features (Nach Launch)",
      eta: "JAN-MÄR 2026",
      bullets: [
        "Phase 8: AI Pricing Assist, Seat Heatmaps, Dynamic Bundles.",
        "Phase 9: Admin Console V2, Activity Log, Deploy Control.",
        "Phase 10: Fan Journeys, Loyalty System, Hotel Bot, Metal TV.",
      ],
    },
  ],
  phases: [
    {
      id: "phase-1",
      title: "Phase 1 · Core Infrastructure",
      status: "Complete",
      progress: 100,
      detail: "7 Räume, Auth-System, Payment Models, Role Access.",
    },
    {
      id: "phase-2",
      title: "Phase 2 · 3D Engine",
      status: "Complete",
      progress: 100,
      detail: "Three.js Scenegraph, HDR Lighting, Collision Layer.",
    },
    {
      id: "phase-3",
      title: "Phase 3 · User System",
      status: "Complete",
      progress: 100,
      detail: "NextAuth, Prisma Roles, Password Reset + Magic Links.",
    },
    {
      id: "phase-4",
      title: "Phase 4 · Business Logic",
      status: "Complete",
      progress: 100,
      detail: "Ticket APIs, pricing engine, CHF harmonisation.",
    },
    {
      id: "phase-5",
      title: "Phase 5 · Live Webcam",
      status: "Complete",
      progress: 100,
      detail: "WebRTC integration, arena billboards, fallback flows.",
    },
    {
      id: "phase-6",
      title: "Phase 6 · IT-Sicherheit (✅ COMPLETE)",
      status: "Complete",
      progress: 100,
      detail: "Alle 13 Schwachstellen behoben - Production Ready!",
    },
    {
      id: "phase-6-5",
      title: "Phase 6.5 · Testing & QA (✅ COMPLETE)",
      status: "Complete",
      progress: 100,
      detail:
        "Cypress E2E (40/40 ✅), Jest (28/28 ✅), Load Testing (1,438 req ✅), UAT Infrastructure ✅, Contact Ticket System ✅ - All tests passed!",
    },
    {
      id: "phase-7",
      title: "Phase 7 · Deployment (� PLANNED)",
      status: "Planned",
      progress: 0,
      detail:
        "Production Deployment vorbereitet. UAT abgeschlossen (10/10, 0 bugs). Bereit für Vercel Setup. Launch: Feb 14, 2026.",
    },
    {
      id: "phase-8",
      title: "Phase 8 · Ticket Intelligence (📅 PLANNED)",
      status: "Planned",
      progress: 0,
      detail:
        "AI Pricing Assist, Seat Heatmaps, Dynamic Bundles, Upsell-Trigger.",
    },
    {
      id: "phase-9",
      title: "Phase 9 · Admin Console V2 (📅 PLANNED)",
      status: "Planned",
      progress: 0,
      detail:
        "Crew Workspaces, Activity Log, Incident Timeline, AI Concierge Panel.",
    },
    {
      id: "phase-10",
      title: "Phase 10 · Fan Journeys (📅 PLANNED)",
      status: "Planned",
      progress: 0,
      detail:
        "Personalized Onboarding, Loyalty System, Hotel Bot, Metal TV Hub.",
    },
  ],
  upcomingFeaturePhases: [
    {
      title: "Phase 8 · Ticket Intelligence",
      eta: "MÄR 2026",
      bullets: [
        "AI Pricing Assist & dynamic bundles.",
        "Seat heatmaps direkt im TicketStage.",
        "Upsell-Trigger entlang Checkout Timeline.",
      ],
    },
    {
      title: "Phase 9 · Admin Console V2",
      eta: "APR 2026",
      bullets: [
        "Crew+Admin Workspaces mit Activity Log.",
        "Incident Timeline + Deploy Control.",
        "Embedded AI Concierge Panel.",
      ],
    },
    {
      title: "Phase 10 · Fan Journeys",
      eta: "MAI 2026",
      bullets: [
        "Personalized onboarding & loyalty ribbons.",
        "Hotel Bot Hand-off + travel kit.",
        "Metal TV Hub mit Live Clips.",
      ],
    },
  ],
  phaseTimeline: [
    {
      label: "Phase 1",
      title: "Core Infrastructure",
      window: "Okt 2025",
      status: "Complete",
    },
    {
      label: "Phase 2",
      title: "3D Engine",
      window: "Okt 2025",
      status: "Complete",
    },
    {
      label: "Phase 3",
      title: "User System",
      window: "Nov 2025",
      status: "Complete",
    },
    {
      label: "Phase 4",
      title: "Business Logic",
      window: "Nov 2025",
      status: "Complete",
    },
    {
      label: "Phase 5",
      title: "Live Webcam",
      window: "Dez 2025",
      status: "Complete",
    },
    {
      label: "Phase 6",
      title: "IT-Sicherheit",
      window: "Dez 2025",
      status: "Complete",
    },
    {
      label: "Phase 6.5",
      title: "Testing & QA",
      window: "Jan 2026",
      status: "Complete",
    },
    {
      label: "Phase 7",
      title: "Deployment",
      window: "Feb 2026",
      status: "In progress",
    },
    {
      label: "Phase 8",
      title: "Ticket Intelligence",
      window: "Mär 2026",
      status: "Pending",
    },
    {
      label: "Phase 9",
      title: "Admin Console V2",
      window: "Apr 2026",
      status: "Pending",
    },
    {
      label: "Phase 10",
      title: "Fan Journeys",
      window: "Mai 2026",
      status: "Pending",
    },
    {
      label: "🎸 Launch",
      title: "Metal3DCore v3.0",
      window: "Juni 2026",
      status: "Pending",
    },
  ],
  stack: [
    {
      title: "Frontend",
      items: [
        "Next.js 15.5.7",
        "React 19",
        "Three.js 0.180",
        "Tailwind 4 + Metal Pulse tokens",
      ],
    },
    {
      title: "Backend",
      items: [
        "Prisma ORM 6.18",
        "PostgreSQL 18",
        "NextAuth 4",
        "WebRTC relays",
      ],
    },
    {
      title: "Ops",
      items: [
        "Render blueprints",
        "CI/CD templates",
        "QA device lab",
        "Synthetics",
      ],
    },
  ],
  aiSystems: [
    {
      title: "Metal Band Avatar",
      impact: "Ticket + webcam concierge",
      effort: "1 Tag",
    },
    {
      title: "Smart Hotel Bot",
      impact: "Cross-sell shuttle + stay",
      effort: "1-2 Tage",
    },
    {
      title: "24/7 Support",
      impact: "Ops automation + triage",
      effort: "1 Tag",
    },
  ],
  deploymentChecks: [
    { label: "UAT Testing", value: "✅ Complete (10/10, 0 bugs)" },
    { label: "Git repo", value: "✅ Live & Ready" },
    { label: "Production Database", value: "📅 Pending" },
    { label: "Vercel Setup", value: "📅 Pending" },
    { label: "Environment Variables", value: "📅 Pending" },
    { label: "Domain & SSL", value: "📅 Pending" },
    { label: "Initial Deployment", value: "📅 Pending" },
  ],
  nextSteps: [
    "✅ Phase 6.5: UAT Complete (10/10 tests, 0 bugs, GO FOR PRODUCTION)",
    "📅 Phase 7 Week 1-2: Vercel Production Configuration",
    "📅 Phase 7 Week 3: Production Database Setup & ENV Variables",
    "📅 Phase 7 Week 4: Domain & SSL Configuration",
    "📅 Phase 7 Week 5: Initial Deployment & Testing",
    "📅 Phase 7 Week 6: Pre-Launch Preparation",
    "🚀 Launch: Feb 14, 2026",
  ],
  ciCd: {
    pipelines: [
      {
        name: "GitHub Actions",
        status: "Draft",
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        description: "Workflow-Definition in Arbeit (lint, test, build)",
        link: "https://github.com/metal3dcore/platform/actions",
      },
      {
        name: "Render Deploy",
        status: "Not configured",
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        description: "Service wartet auf API-Token & environment setup",
        link: "https://render.com/",
      },
      {
        name: "Vercel Production",
        status: "Not configured",
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        description:
          "Bereit für Setup nach UAT Abschluss. Deployment zu Vercel geplant.",
        link: "https://vercel.com/dashboard",
      },
    ],
    deploymentWindows: [
      {
        label: "Staging",
        window: "TBD",
        notes: "Wird nach erfolgreicher Render-Provisionierung festgelegt",
      },
      {
        label: "Production",
        window: "TBD",
        notes: "Go-Live Slot folgt nach erstem Staging-Deploy",
      },
    ],
    summary:
      "Phase 7: Production Deployment geplant. UAT abgeschlossen (10/10 tests, 0 bugs, GO FOR PRODUCTION). Bereit für Vercel Setup & Database Configuration. Launch: Feb 14, 2026.",
  },
};

export type ComingSoonConfig = typeof COMING_SOON_CONFIG;
