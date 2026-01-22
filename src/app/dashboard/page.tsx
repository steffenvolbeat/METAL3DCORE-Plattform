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
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 text-center max-w-md mx-auto">
        <div className="animate-spin h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-6" />
        <p className="text-xl text-gray-300 font-mono">Dashboard wird geladen…</p>
        <p className="text-sm text-orange-400 mt-2 font-mono">Metal3DCore System</p>
      </div>
    </div>
  );
}

function AuthWall() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="bg-gray-900 rounded-xl p-10 border border-gray-700 hover:border-orange-500 transition-all duration-300 max-w-lg mx-auto text-center">
        <div className="text-6xl mb-6">🎸</div>
        <h1 className="text-4xl font-bold text-orange-400 font-mono mb-4">Anmeldung erforderlich</h1>
        <p className="text-gray-300 mb-8 text-lg leading-relaxed">
          Melde dich an, um Tickets, Livestreams und deine Zugänge zu verwalten.
        </p>
        <button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          onClick={() => (window.location.href = "/login")}
        >
          🚀 Jetzt anmelden
        </button>
        <p className="text-sm text-gray-400 mt-4 font-mono">Metal3DCore Dashboard</p>
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
    <div className="min-h-screen bg-black text-white flex items-center justify-center pt-16">
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center space-y-24">
        {/* Header Section */}
        <header className="w-full max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-orange-500 transition-all duration-300">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <p className="text-sm uppercase tracking-[0.3em] text-orange-400 font-mono">Welcome back</p>
                <h1 className="text-4xl md:text-5xl font-bold text-orange-400 font-mono mt-3">{displayName}</h1>
                <p className="text-gray-300 mt-3 text-lg">{email}</p>
              </div>
              <div className="bg-gray-800 border border-gray-600 rounded-lg px-6 py-5 min-w-[250px] text-center hover:border-orange-500 transition-all duration-300">
                <p className="text-gray-400 text-sm font-mono">Environment</p>
                <p className="text-2xl font-bold text-orange-400 font-mono my-2">Metal Pulse</p>
                <p className="text-gray-400 text-sm font-mono">Release v2.3.1-testing</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-8 justify-center">
              <a
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-center"
                href="/tickets"
              >
                🎫 Tickets kaufen
              </a>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200 text-center border border-gray-600 hover:border-orange-500"
                onClick={() => (window.location.href = "/")}
              >
                🏠 Zurück zur Platform
              </button>
            </div>
          </div>
        </header>

        {/* Quick Stats Grid */}
        <section className="w-full max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-orange-400 font-mono mb-10 text-center">📊 Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {QUICK_STATS.map(stat => (
              <article
                key={stat.label}
                className="bg-gray-900 rounded-xl p-6 border border-gray-700 hover:border-orange-500 hover:shadow-2xl transition-all duration-300 w-full max-w-sm text-center"
              >
                <p className="text-sm text-orange-400 uppercase mb-3 font-mono tracking-wide">{stat.label}</p>
                <p className="text-3xl font-bold text-white mb-3 font-mono">{stat.value}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{stat.detail}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Control Blocks Section */}
        <section className="w-full max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-orange-400 font-mono mb-10 text-center">⚙️ System Control</h2>
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {CONTROL_BLOCKS.map(block => (
                <article
                  key={block.title}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-8 hover:border-orange-500 transition-all duration-300 flex flex-col items-center text-center"
                >
                  <h3 className="text-2xl font-bold text-orange-400 font-mono mb-6 text-center">{block.title}</h3>
                  <ul className="space-y-4 text-gray-300 max-w-md">
                    {block.bullets.map(bullet => (
                      <li key={bullet} className="flex items-start text-sm leading-relaxed text-left">
                        <span className="text-orange-400 mr-3 font-bold text-lg">•</span>
                        <span className="flex-1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* User Dashboard Component */}
        <section className="w-full max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <UserDashboard />
          </div>
        </section>
      </div>
    </div>
  );
}
