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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-16 flex justify-center">
      {/* Zentraler Container mit maximaler Breite */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section - Modernes Card Design */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20 shadow-2xl hover:border-blue-500/40 transition-all duration-500">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {/* User Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-widest text-blue-400 font-mono mb-1">WELCOME BACK</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{displayName}</h1>
                    <p className="text-gray-400 mt-1">{email}</p>
                  </div>
                </div>
              </div>

              {/* Environment Info */}
              <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30 rounded-xl p-6 text-center">
                <p className="text-blue-400 text-sm font-mono uppercase tracking-wide mb-2">Environment</p>
                <p className="text-2xl font-bold text-white mb-2">Metal Pulse</p>
                <p className="text-gray-300 text-sm font-mono">Release v2.3.1-testing</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center items-center max-w-md mx-auto">
              <a
                href="/tickets"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-xl text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🎫 Tickets kaufen
              </a>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full sm:w-auto bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300"
              >
                🏠 Zurück zur Platform
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid - Modernisiert und zentriert */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-8">
            📊 Quick Stats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={`bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-center ${
                  index === 0
                    ? "hover:shadow-blue-500/20"
                    : index === 1
                      ? "hover:shadow-green-500/20"
                      : index === 2
                        ? "hover:shadow-purple-500/20"
                        : "hover:shadow-cyan-500/20"
                }`}
              >
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-mono mb-3">{stat.label}</p>
                  <p
                    className={`text-3xl font-bold mb-2 ${
                      index === 0
                        ? "text-blue-400"
                        : index === 1
                          ? "text-green-400"
                          : index === 2
                            ? "text-purple-400"
                            : "text-cyan-400"
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">{stat.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Control Section - Verbessert */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-8">
            ⚙️ System Control
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {CONTROL_BLOCKS.map((block, index) => (
              <div
                key={block.title}
                className={`bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-[1.02] ${
                  index === 0
                    ? "hover:shadow-2xl hover:shadow-blue-500/10"
                    : "hover:shadow-2xl hover:shadow-purple-500/10"
                }`}
              >
                <h3 className={`text-2xl font-bold mb-6 ${index === 0 ? "text-blue-400" : "text-purple-400"}`}>
                  {block.title}
                </h3>
                <ul className="space-y-4">
                  {block.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start text-gray-300 leading-relaxed">
                      <span
                        className={`mr-3 font-bold text-lg flex-shrink-0 ${
                          index === 0 ? "text-blue-400" : "text-purple-400"
                        }`}
                      >
                        •
                      </span>
                      <span className="text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* User Dashboard Component - Proper Integration */}
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <UserDashboard />
        </div>
      </div>
    </div>
  );
}
