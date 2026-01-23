"use client";
import { useState } from "react";
import { NavigationSidebar } from "@/shared/components/ui";

// ✅ Feature: 3D Rooms
import {
  WelcomeStage,
  StadionRoom,
  // BackstageRoom, // Original BackstageRoom disabled
  CommunityRoom, // Now Coming Soon
  BandGalleryRoom,
  ContactStage,
  TicketStage,
} from "@/features/3d-rooms/components";

// Import Coming Soon BackstageRoom
import BackstageRoom from "@/features/3d-rooms/components/BackstageRoomComingSoon";

// ✅ Feature: Authentication
// - Moved to WelcomeStage only
// import {
//   AuthModal,
// } from "@/features/auth/components";

// ✅ Feature: Intro
import { IntroPage } from "@/features/intro/components";

// ✅ Feature: Admin
// - Moved to specific admin areas only
// import { AdminButton } from "@/features/admin/components";

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
  { label: "Status", value: "Production Ready" },
];

export default function Home() {
  const [activeRoom, setActiveRoom] = useState("welcome");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIntro, setShowIntro] = useState(false); // Intro Page State
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

  // Intro Page anzeigen wenn aktiviert
  if (showIntro) {
    return <IntroPage onComplete={handleIntroComplete} />;
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

      {!isFullscreen && <NavigationSidebar activeRoom={activeRoom} onRoomChange={handleRoomChange} />}

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
                  <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-orange-500 to-pink-600 flex items-center justify-center text-3xl shadow-lg">
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
                : "rounded-4xl border border-theme-secondary bg-black/30 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
            }
          >
            {activeRoom === "welcome" && (
              <WelcomeStage
                onRoomChange={handleRoomChange}
                isFullscreen={isFullscreen}
                onFullscreen={handleToggleFullscreen}
                onOpenAuth={mode => {
                  // Auth handled internally in WelcomeStage now
                  console.log("Auth handled in WelcomeStage:", mode);
                }}
              />
            )}
            {activeRoom === "gallery" && (
              <BandGalleryRoom onRoomChange={handleRoomChange} isFullscreen={isFullscreen} />
            )}
            {activeRoom === "stadium" && (
              <StadionRoom
                onRoomChange={handleRoomChange}
                isFullscreen={isFullscreen}
                onFullscreen={handleToggleFullscreen}
              />
            )}
            {/* Future rooms */}
            {activeRoom === "community" && (
              <CommunityRoom onRoomChange={handleRoomChange} isFullscreen={isFullscreen} />
            )}
            {activeRoom === "backstage" && (
              <BackstageRoom onRoomChange={handleRoomChange} isFullscreen={isFullscreen} />
            )}
            {/* {activeRoom === "shop" && <MerchShopRoom />} */}
            {activeRoom === "contact" && (
              <ContactStage
                onRoomChange={handleRoomChange}
                isFullscreen={isFullscreen}
                onFullscreen={handleToggleFullscreen}
              />
            )}
            {activeRoom === "ticket" && (
              <TicketStage
                onRoomChange={handleRoomChange}
                isFullscreen={isFullscreen}
                onFullscreen={handleToggleFullscreen}
              />
            )}
            {/* */}
            {/* */}
          </div>
        </div>
      </main>
    </div>
  );
}
