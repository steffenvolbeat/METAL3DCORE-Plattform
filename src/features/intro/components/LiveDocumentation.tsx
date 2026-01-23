"use client";

import { useEffect, useRef, useState } from "react";

interface LiveDocumentationProps {
  isVideoStarted: boolean;
  beatData: { beat: boolean; intensity: number };
  videoDuration?: number; // Video-Länge in Sekunden
  onVideoEnd?: () => void; // Callback wenn Video zu Ende ist
}

// Dokumentations-Inhalte
const documentationContent = [
  "🌌 Metal3DCore Plattform (M3DC) - Final Portfolio Projekt 2026",
  "",
  "🎯 Vision:",
  "Fotorealistisches virtuelles 3D Event-Erlebnis",
  "",
  "🏗️ Technologie-Stack:",
  "• Next.js 15.5.9 + React 19.1.0 (Turbopack)",
  "• React Three Fiber + Three.js",
  "• Tailwind CSS 4 + TypeScript",
  "• Prisma ORM + PostgreSQL",
  "• NextAuth.js Authentication",
  "",
  "🌠 Aktuelle Features:",
  "✅ Fotorealistischer Welcome Stage",
  "✅ Vollständige 3D-Raumsysteme (6 Räume)",
  "✅ Coming Soon Pages mit Countdown",
  "✅ Galaxy Intro System (11 Komponenten)",
  "✅ FPS Navigation & Mobile Controls",
  "✅ Ticket-System mit API Integration",
  "✅ YouTube Player mit Orbital Animation",
  "",
  "🎸 3D-Räume System:",
  "✅ Welcome Stage (Hallenstadion Zürich)",
  "✅ Band-Galerie mit Fotorealismus",
  "✅ Virtuelles Stadium mit Navigation",
  "🚧 Community Hub - Coming Soon (15d 8h 42m)",
  "🚧 Backstage VIP - Coming Soon (22d 14h 37m)",
  "✅ Ticket-Arena (Einzelticket: Metallica CHF 125)",
  "",
  "🚀 Intro Page Features:",
  "✨ Dynamisches Sternenfeld (20.000+ Sterne)",
  "✨ Fotorealistische Galaxien & Nebel",
  "🪐 Planetensysteme mit echten Umlaufbahnen",
  "💥 Supernova-Effekte & Partikel",
  "🎵 Beat-synchronisierte Animationen",
  "📺 YouTube Player (RF0HhrwIwp0)",
  "",
  "🎵 Beat-Reaktionen:",
  "• Galaxien rotieren schneller",
  "• Planeten pulsieren",
  "• Sterne werden heller",
  "• Nebel ändern Intensität",
  "• Text-Effekte leuchten auf",
  "",
  "⚡ Performance-Optimierungen:",
  "• LOD (Level of Detail) System",
  "• Frustum Culling",
  "• Instance Rendering",
  "• Progressive Asset Loading",
  "• Mobile-optimierte Qualität",
  "• Turbopack für schnellere Builds",
  "",
  "🔧 Technische Verbesserungen:",
  "✅ useEffect Dependency Fixes",
  "✅ RoomAccessControl API Error Handling",
  "✅ Syntax-Highlighting Konfiguration",
  "✅ Coming Soon Access Control",
  "✅ Sidebar Navigation Updates",
  "✅ Database Schema vollständig",
  "",
  "📋 Coming Soon Features:",
  "📅 Community Hub: Chat, Musik, Trivia",
  "📅 Backstage VIP: Interviews, Meet & Greet",
  "📅 Erweiterte 3D-Interaktionen",
  "📅 Mobile Responsive Verbesserungen",
  "📅 Fotorealistische Texturen",
  "📅 VR-Support Evaluation",
  "",
  "🎓 Lernziele:",
  "• Fullstack Web Development",
  "• 3D-Web-Programmierung",
  "• Database Design & ORM",
  "• Real-time Communication",
  "• Payment Processing",
  "• Performance Optimization",
  "• Modern React Patterns",
  "",
  "📊 Entwicklungsfortschritt:",
  "Phase 1: Foundation ✅ (100%)",
  "Phase 2: Database & Auth ✅ (100%)",
  "Phase 3: 3D-Räume System ✅ (100%)",
  "Phase 4: Coming Soon Pages ✅ (100%)",
  "Phase 5: Testing & Deployment 🚧 (80%)",
  "",
  "⏰ Timeline Update:",
  "✅ November 2025: 3D Intro + Database",
  "✅ Dezember 2025: Alle 3D-Räume",
  "✅ Januar 2026: Coming Soon Implementation",
  "🚧 Januar 2026: Final Testing & Polish",
  "📅 Februar 2026: Portfolio Finalisierung",
  "📅 März 2026: Portfolio Präsentation",
  "",
  "🌐 Development Status:",
  "Server: http://localhost:3000 ✅",
  "Database: PostgreSQL + Prisma ✅",
  "Error-Free Console: ✅",
  "Mobile Optimized: ✅",
  "",
  "👨‍💻 Entwickelt von:",
  "nu-metal-ubuntu",
  "",
  "🎸 Für echte Metal-Fans entwickelt!",
  "",
  "🚀 WELCOME TO METAL3DCORE PLATTFORM (M3DC)! 🚀",
];

export default function LiveDocumentation({
  isVideoStarted,
  beatData,
  videoDuration = 300, // Default: 5 Minuten
  onVideoEnd,
}: LiveDocumentationProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const latestLineRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Cleanup function falls noch ein interval läuft
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isVideoStarted) {
      return;
    }

    // Reset state komplett when video starts
    setCurrentLineIndex(0);
    setVisibleLines([]);
    setIsScrolling(false);
    setIsVideoComplete(false);

    // ECHTE VIDEO-SYNCHRONISATION - Adaptiert sich an JEDES Video!
    const totalLines = documentationContent.length;
    const totalChars = documentationContent.join('').length;
    
    // INTELLIGENTE Synchronisation basierend auf Video-Länge - LANGSAM!
    let syncPercentage = 0.95; // Standard: 95% der Video-Zeit für Docs (MEHR Zeit!)
    let minTimePerLine = 650; // Minimum Zeit pro Zeile (etwas schneller)
    let maxTimePerLine = 2500; // Maximum Zeit pro Zeile (etwas schneller)
    
    // Adaptive Parameter basierend auf Video-Länge
    if (videoDuration < 180) { // Videos unter 3 Minuten
      syncPercentage = 0.90; // Weniger Zeit für Docs, mehr Buffer
      minTimePerLine = 500;   // etwas schneller
      maxTimePerLine = 1700;  // etwas schneller
    } else if (videoDuration > 600) { // Videos über 10 Minuten
      syncPercentage = 0.95; // Mehr Zeit für Docs
      minTimePerLine = 800;   // etwas schneller
      maxTimePerLine = 3200;  // etwas schneller
    }
    
    const availableTime = videoDuration * syncPercentage * 1000; // In Millisekunden
    const baseTimePerLine = availableTime / totalLines;
    
    // SMART TIME CALCULATION: Berücksichtigt Zeilenlänge und Inhalt
    const timePerLine = Math.max(minTimePerLine, Math.min(maxTimePerLine, baseTimePerLine));
    
    console.log(`🎯 PRÄZISE Video-Documentation Sync:`, {
      videoDuration: `${videoDuration}s (${Math.floor(videoDuration/60)}:${String(videoDuration%60).padStart(2, '0')})`,
      videoType: videoDuration < 180 ? 'KURZ' : videoDuration > 600 ? 'LANG' : 'NORMAL',
      totalLines,
      totalChars,
      syncPercentage: `${Math.round(syncPercentage*100)}%`,
      documentationTime: `${Math.round(availableTime/1000)}s`,
      timePerLine: `${Math.round(timePerLine)}ms`,
      bufferTime: `${Math.round(videoDuration * (1-syncPercentage))}s`,
      estimated: `Docs: ${Math.floor((availableTime/1000)/60)}:${String(Math.round((availableTime/1000)%60)).padStart(2, '0')} + Buffer: ${Math.round(videoDuration * (1-syncPercentage))}s`
    });

    // Zeilen nacheinander einblenden - AN VIDEO-LÄNGE ANGEPASST!
    intervalRef.current = setInterval(() => {
      setCurrentLineIndex((prevIndex) => {
        if (prevIndex < documentationContent.length) {
          setVisibleLines((prev) => {
            // Verhindere Dopplungen - prüfe ob Line bereits existiert
            const newLine = documentationContent[prevIndex];
            if (prev.includes(newLine) && prev.length > prevIndex) {
              return prev; // Keine Änderung wenn bereits vorhanden
            }
            return [...prev, newLine];
          });

          // Auto-Scroll aktivieren wenn viele Zeilen
          if (prevIndex > 8) {
            setIsScrolling(true);
          }

          return prevIndex + 1;
        } else {
          // Documentation ist fertig - Video sollte auch bald zu Ende sein
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Warte kurz, dann zeige M3DC Button
          setTimeout(() => {
            setIsVideoComplete(true);
            onVideoEnd?.();
          }, 2000);
          
          return prevIndex;
        }
      });
}, timePerLine); // PRÄZISE SYNC: Adaptiert an jede Video-Länge mit intelligenter Zeitberechnung!

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVideoStarted, videoDuration, onVideoEnd]);

  // AUTO-SCROLL bei neuen Zeilen!
  useEffect(() => {
    if (isScrolling && latestLineRef.current && scrollContainerRef.current) {
      latestLineRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [visibleLines, isScrolling]);

  // Styling für Zeilen - OHNE Beat-Reaktionen!
  const getLineStyle = (index: number, line: string) => {
    const isNewLine = index === visibleLines.length - 1;
    const isHeader =
      line.startsWith("🌌") || line.startsWith("🎯") || line.startsWith("🏗️");
    const isFeature =
      line.startsWith("✅") || line.startsWith("🔄") || line.startsWith("📅");
    const isImportant =
      line.includes("🚀") || line.includes("💥") || line.includes("🎸");

    let baseClasses = "transition-all duration-300 ";

    if (isNewLine) {
      baseClasses += "animate-pulse ";
    }

    // STATISCHE FARBEN - KEINE Beat-Reaktionen!
    if (isHeader) {
      baseClasses += "text-orange-300/70 ";
    } else if (isFeature) {
      baseClasses += "text-blue-200/60 ";
    } else if (isImportant) {
      baseClasses += "text-red-300/70 font-bold ";
    } else {
      baseClasses += "text-gray-300/50 ";
    }

    return baseClasses;
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm border-l-2 border-orange-500/20 h-full overflow-hidden">
      <div className="p-4 h-full flex flex-col">
        {/* Video Complete - M3DC Button */}
        {isVideoComplete ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 bg-clip-text animate-pulse">
                  Metal3DCore
                </h1>
                <p className="text-2xl font-bold text-orange-400/80">
                  M3DC
                </p>
                <p className="text-sm text-gray-400/60">
                  Final Portfolio Projekt 2026
                </p>
              </div>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 hover:from-orange-700 hover:via-red-700 hover:to-purple-700 text-white font-bold text-xl rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-orange-500/50"
              >
                <span className="relative z-10 flex items-center gap-3">
                  🚀 Hauptseite betreten
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              </button>
              
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500/60">
                <span>🎸 Für echte Metal-Fans entwickelt</span>
                <span>•</span>
                <span>💻 nu-metal-ubuntu</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header - OHNE Beat-Reaktionen */}
            <div className="mb-4 pb-2 border-b border-orange-500/30 transition-all duration-300">
              <h2 className="text-lg font-bold text-orange-300/80 transition-all duration-300">
                📊 Live Projekt-Dokumentation
              </h2>
              <p className="text-xs text-gray-400/60 mt-1">
                {isVideoStarted
                  ? `🎯 PRÄZISE Sync: ${Math.floor(videoDuration/60)}:${String(videoDuration%60).padStart(2, '0')} Video mit adaptiver Dokumentation`
                  : "⏳ Warten auf Video-Start..."}
              </p>
            </div>

            {/* Dokumentations-Content mit AUTO-SCROLL */}
            <div
              ref={scrollContainerRef}
              className={`flex-1 overflow-hidden ${
                isScrolling ? "overflow-y-auto" : ""
              }`}
              style={{ scrollBehavior: "smooth" }}
            >
              <div className="space-y-1 text-sm font-mono">
                {visibleLines.map((line, index) => (
                  <div
                    key={index}
                    ref={index === visibleLines.length - 1 ? latestLineRef : null}
                    className={getLineStyle(index, line)}
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {line === "" ? <div className="h-2" /> : <span>{line}</span>}
                  </div>
                ))}

                {/* Cursor-Effekt für aktuelle Zeile */}
                {currentLineIndex < documentationContent.length && (
                  <div
                    ref={
                      currentLineIndex === visibleLines.length
                        ? latestLineRef
                        : null
                    }
                    className="inline-block w-2 h-4 bg-orange-500 animate-pulse ml-1"
                  />
                )}
              </div>
            </div>

            {/* Progress Indicator - OHNE Beat-Reaktionen */}
            <div className="mt-4 pt-2 border-t border-gray-600/30">
              <div className="flex items-center justify-between text-xs text-gray-400/50 mb-2">
                <span>Video-Progress:</span>
                <span>
                  {Math.round(
                    (currentLineIndex / documentationContent.length) * 100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-1">
                <div
                  className="h-1 rounded-full bg-orange-500/50 transition-all duration-300"
                  style={{
                    width: `${
                      (currentLineIndex / documentationContent.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Beat Indicator - NUR ANZEIGE, keine Styling-Änderungen */}
            <div className="mt-2 flex items-center justify-center">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-100 ${
                  beatData.beat ? "bg-green-400 scale-125" : "bg-gray-600"
                }`}
              />
              <span className="ml-2 text-xs text-gray-400/50">
                Beat: {beatData.beat ? "ON" : "OFF"} (
                {beatData.intensity.toFixed(2)})
              </span>
            </div>

            {/* Status */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500/40">
                {currentLineIndex >= documentationContent.length
                  ? "✅ Video endet bald... M3DC Button wird geladen!"
                  : `⏳ Zeile ${currentLineIndex + 1} von ${
                      documentationContent.length
                    }`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
