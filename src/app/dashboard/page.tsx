"use client";

import { UserDashboard } from "@/features/auth/components/UserDashboard";
import { useSession } from "next-auth/react";

const QUICK_STATS = [
  {
    label: "Ticket Wallet",
    value: "Live",
    detail: "Käufe + Upgrades in Echtzeit",
  },
  {
    label: "3D Rooms",
    value: "7 aktiv",
    detail: "FPS + Webcam bereit",
  },
  {
    label: "Support",
    value: "<30s",
    detail: "Response über Metal Concierge",
  },
  {
    label: "Security",
    value: "RBAC 2.1",
    detail: "Admin + Crew Isolation",
  },
];

const CONTROL_BLOCKS = [
  {
    title: "Access & Streams",
    bullets: [
      "Ticket Wallet synchronisiert mit Prisma Access Models.",
      "Livestream Pass + Webcam Token erscheinen nach jedem Kauf.",
      "3D Rooms lassen sich direkt aus dem Dashboard starten.",
    ],
  },
  {
    title: "Support & Sicherheit",
    bullets: [
      "Metal Concierge (Live) für Chat + Hotel Bot Übergabe.",
      "Audit Trail für jede Admin-/Crew-Aktion hinterlegt.",
      "Neue AI-Rollouts koppeln an denselben Access Layer.",
    ],
  },
];

function LoadingView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="section-card text-center">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-theme-secondary">Dashboard wird geladen…</p>
      </div>
    </div>
  );
}

function AuthWall() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary px-6">
      <div className="section-card max-w-lg text-center">
        <p className="text-5xl mb-4">🎸</p>
        <h1 className="panel-heading justify-center mb-2">
          Anmeldung erforderlich
        </h1>
        <p className="text-theme-secondary mb-6">
          Melde dich an, um Tickets, Livestreams und deine Zugänge zu verwalten.
        </p>
        <button
          className="button-primary w-full"
          onClick={() => (window.location.href = "/auth/login")}
        >
          Jetzt anmelden
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <LoadingView />;
  }

  if (status === "unauthenticated") {
    return <AuthWall />;
  }

  const displayName = session?.user?.name ?? "Metal Fan";
  const email = session?.user?.email ?? "";

  return (
    <div className="min-h-screen bg-theme-primary py-12">
      <div className="app-shell space-y-8">
        <header className="section-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-theme-secondary">
                Welcome back
              </p>
              <h1 className="panel-heading text-4xl mt-3">{displayName}</h1>
              <p className="text-theme-secondary mt-2">{email}</p>
            </div>
            <div className="glass-panel px-5 py-4 min-w-[220px] text-center">
              <p className="text-theme-secondary text-sm">Environment</p>
              <p className="text-2xl font-semibold">Metal Pulse</p>
              <p className="text-theme-secondary text-sm">
                Release v2.3.1-testing
              </p>
            </div>
          </div>
          <div className="action-row mt-6">
            <a className="button-primary" href="/#ticket-arena">
              Tickets kaufen
            </a>
            <button
              className="button-secondary"
              onClick={() => (window.location.href = "/")}
            >
              Zurück zur Platform
            </button>
          </div>
        </header>

        <section className="content-grid">
          {QUICK_STATS.map((stat) => (
            <article key={stat.label} className="section-card">
              <p className="text-sm text-theme-secondary uppercase mb-1">
                {stat.label}
              </p>
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="text-theme-secondary mt-2 text-sm">{stat.detail}</p>
            </article>
          ))}
        </section>

        <section className="section-card">
          <div className="layout-grid two-column gap-8">
            {CONTROL_BLOCKS.map((block) => (
              <article key={block.title} className="glass-panel p-5">
                <h2 className="panel-heading text-2xl mb-4">{block.title}</h2>
                <ul className="list-disc list-inside text-theme-secondary space-y-2 text-sm">
                  {block.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="section-card bg-transparent border-none shadow-none p-0">
          <UserDashboard />
        </section>
      </div>
    </div>
  );
}
