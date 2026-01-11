"use client";
import { useState } from "react";

// Coming Soon Platzhalter für die Original-Komponenten
const ComingSoonNavigationSidebar = ({ activeRoom, onRoomChange }: any) => (
  <div className="fixed left-4 top-20 z-50 bg-theme-card border border-theme-secondary rounded-lg p-4">
    <div className="text-xs text-theme-secondary mb-2">Navigation Coming Soon</div>
    <div className="space-y-2 text-sm">
      {["welcome", "gallery", "stadium", "ticket", "backstage", "community"].map(room => (
        <button
          key={room}
          onClick={() => onRoomChange(room)}
          className={`block w-full text-left px-2 py-1 rounded ${
            activeRoom === room ? "bg-theme-accent text-black" : "text-theme-secondary hover:text-theme-primary"
          }`}
        >
          {room}
        </button>
      ))}
    </div>
  </div>
);

const ComingSoon3DRoom = ({ roomName, icon }: { roomName: string; icon: string }) => (
  <div className="min-h-[600px] bg-black/50 rounded-[24px] flex items-center justify-center border border-theme-secondary">
    <div className="text-center space-y-4">
      <div className="text-6xl">{icon}</div>
      <h3 className="text-2xl font-semibold text-theme-primary">{roomName}</h3>
      <div className="chip">3D Room Coming Soon</div>
      <p className="text-theme-secondary max-w-md">Dieser 3D-Raum wird schrittweise implementiert.</p>
    </div>
  </div>
);

const ROOM_META: Record<string, { label: string; icon: string; description: string; helper: string }> = {
  welcome: {
    label: "Welcome Stage",
    icon: "🎸",
    description:
      "Erkunde den Welcome Stage! Verwende WASD zum Laufen, die Maus für den Blick und starte den 3D Game Mode für Vollbild.",
    helper: "Intro, Auth & globale Aktionen",
  },
  gallery: {
    label: "Band Gallery",
    icon: "🖼️",
    description: "Entdecke legendäre Metal-Bands. Nutze WASD + Maus oder tauche per Fullscreen tiefer ein.",
    helper: "Visual Showcase & Lore",
  },
  stadium: {
    label: "Metal Arena",
    icon: "🏟️",
    description: "Erlebe das Metal Arena Stadion mit 360° Rundgang. Optimal in Vollbild werden Bühne & Crowd sichtbar.",
    helper: "Main Concert Experience",
  },
  ticket: {
    label: "Ticket Arena",
    icon: "🎫",
    description: "Kaufe Tickets direkt an den Automaten. Räume betreten, Konzert wählen, Zahlung abschließen.",
    helper: "Checkout Flow",
  },
  backstage: {
    label: "Backstage VIP",
    icon: "🎭",
    description: "VIP Lounge mit Band Content & exklusiven Clips. Ideal für Partner & Sponsoren.",
    helper: "Premium Area",
  },
  community: {
    label: "Community Hub",
    icon: "💬",
    description: "Treffe andere Metal-Fans, chatten, teilen & gemeinsam streamen.",
    helper: "Social Layer",
  },
};

const MOVEMENT_TIPS = [
  { label: "Movement", value: "WASD + Maus" },
  { label: "Fullscreen", value: "Enter 3D Game Mode" },
  { label: "Audio", value: "Kopfhörer empfohlen" },
  { label: "Status", value: "Coming Soon" },
];

export default function Home() {
  const [activeRoom, setActiveRoom] = useState("welcome");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const activeMeta = ROOM_META[activeRoom] ?? ROOM_META.welcome;

  const handleRoomChange = (room: string) => {
    if (room === "fullscreen") {
      setIsFullscreen(true);
    } else if (room === "welcome" && isFullscreen) {
      setIsFullscreen(false);
    } else {
      setActiveRoom(room);
      setIsFullscreen(false);
    }
  };

  const handleEnterFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    setActiveRoom("welcome");
  };

  // Intro Page Platzhalter
  if (showIntro) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="text-6xl animate-pulse">🌌</div>
          <h1 className="text-4xl font-bold">Cosmic Intro</h1>
          <div className="chip">Coming Soon</div>
          <button onClick={handleIntroComplete} className="button-primary">
            Zurück zur Hauptseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-theme-primary overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.15]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.05) 40px, rgba(255,255,255,0.05) 80px)",
          }}
        />
      </div>

      {!isFullscreen && <ComingSoonNavigationSidebar activeRoom={activeRoom} onRoomChange={handleRoomChange} />}

      <main className="relative z-10 pt-20 pb-24">
        {!isFullscreen && (
          <div className="app-shell space-y-10">
            <section className="layout-grid two-column items-start">
              <article className="section-card space-y-6">
                <div className="flex flex-wrap items-center gap-3 text-sm text-theme-secondary">
                  <span className="chip">Metal3DCore</span>
                  <span className="chip">Room · {activeMeta.label}</span>
                </div>

                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg">
                    {activeMeta.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-theme-secondary">Aktueller Modus</p>
                    <h1 className="text-3xl font-black tracking-tight">{activeMeta.label}</h1>
                  </div>
                </div>

                <p className="text-theme-secondary text-base leading-relaxed">{activeMeta.description}</p>

                <div className="action-row">
                  <button onClick={() => setShowIntro(true)} className="button-secondary w-full sm:w-auto">
                    <span className="text-xl">🌌</span>
                    Cosmic Intro
                  </button>
                  <button onClick={handleEnterFullscreen} className="button-primary w-full sm:w-auto">
                    <span className="text-xl">🎮</span>
                    Enter 3D Game Mode
                  </button>
                </div>
              </article>

              <article className="section-card space-y-6">
                <div className="panel-heading">
                  <span>🧭 Navigationsstatus</span>
                </div>
                <p className="text-theme-secondary text-sm">{activeMeta.helper}</p>
                <div className="stat-grid">
                  {MOVEMENT_TIPS.map(tip => (
                    <div
                      key={tip.label}
                      className="glass-panel border border-theme-secondary p-4 rounded-2xl flex flex-col items-center justify-center text-center"
                    >
                      <p className="text-xs uppercase tracking-wide text-theme-secondary">{tip.label}</p>
                      <p className="text-xl font-semibold text-theme-primary">{tip.value}</p>
                    </div>
                  ))}
                  <div className="glass-panel border border-theme-secondary p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-xs uppercase tracking-wide text-theme-secondary">Aktiver Raum</p>
                    <p className="text-xl font-semibold">{activeMeta.label}</p>
                  </div>
                </div>
              </article>
            </section>

            <section className="section-card">
              <div className="layout-grid two-column items-start">
                <div className="space-y-4">
                  <h2 className="panel-heading">
                    <span>📡 Steuerung & Hinweise</span>
                  </h2>
                  <ul className="space-y-3 text-theme-secondary text-sm">
                    <li>• WASD zum Navigieren · Maus zum Umschauen</li>
                    <li>• SHIFT aktiviert Sprint, SPACE springt (wenn verfügbar)</li>
                    <li>• ESC beendet den Fullscreen Game Mode</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-theme-primary">Schnellzugriff</h3>
                  <div className="stat-grid">
                    <button
                      onClick={() => handleRoomChange("ticket")}
                      className="glass-panel p-4 text-center hover:border-theme-primary transition-colors flex flex-col items-center justify-center"
                    >
                      <p className="text-sm text-theme-secondary">Ticket Arena</p>
                      <p className="text-lg font-semibold text-theme-primary">🎫 Checkout öffnen</p>
                    </button>
                    <button
                      onClick={() => handleRoomChange("stadium")}
                      className="glass-panel p-4 text-center hover:border-theme-primary transition-colors flex flex-col items-center justify-center"
                    >
                      <p className="text-sm text-theme-secondary">Metal Arena</p>
                      <p className="text-lg font-semibold text-theme-primary">🏟️ Bühne betreten</p>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        <div className={isFullscreen ? "" : "app-shell"}>
          <div
            className={
              isFullscreen
                ? ""
                : "rounded-[32px] border border-theme-secondary bg-black/30 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
            }
          >
            {/* 3D Räume als Coming Soon Platzhalter */}
            {activeRoom === "welcome" && <ComingSoon3DRoom roomName="Welcome Stage" icon="🎸" />}
            {activeRoom === "gallery" && <ComingSoon3DRoom roomName="Band Gallery" icon="🖼️" />}
            {activeRoom === "stadium" && <ComingSoon3DRoom roomName="Metal Arena" icon="🏟️" />}
            {activeRoom === "community" && <ComingSoon3DRoom roomName="Community Hub" icon="💬" />}
            {activeRoom === "backstage" && <ComingSoon3DRoom roomName="Backstage VIP" icon="🎭" />}
            {activeRoom === "ticket" && <ComingSoon3DRoom roomName="Ticket Arena" icon="🎫" />}
          </div>
        </div>
      </main>
    </div>
  );
}
