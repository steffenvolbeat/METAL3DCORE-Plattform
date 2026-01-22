"use client";

import React, { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center, Float, Box, Plane, Html, Text, Cylinder } from "@react-three/drei";
import { useSession } from "next-auth/react";
import * as THREE from "three";
import { FPSControls } from "@/shared/components/3d";
import PaymentOptions, { usePaymentOptions } from "@/features/tickets/components/PaymentOptions";
import { TICKET_PRICES } from "@/lib/access-control";

// Typen für Props
interface TicketStageProps {
  isFullscreen?: boolean;
  onRoomChange?: (room: string) => void;
  onFullscreen?: () => void;
}

// SINGLE CONCERT DATA - Only Metallica
const concerts = [
  {
    id: 1,
    band: "Metal3DCore Demo Band",
    date: "Dienstag, 17. Februar 2026 um 18:50",
    venue: "Hallenstadion, Zürich",
    price: "CHF 125",
    available: true,
    ticketsAvailable: 1000,
    image: "🎸",
    description: "Metal3DCore Demo Konzert #1",
    category: "Metal",
  },
  // 🚧 All other concerts will be added in future updates
  // Currently showing only 1 ticket for demo purposes
];

// Loading mit Metal Pulse Design
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="section-card max-w-md text-center">
        <div className="animate-spin h-14 w-14 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="panel-heading text-xl mb-2">Metal Ticket Arena</p>
        <p className="text-theme-secondary">Lädt 3D-Erlebnis...</p>
      </div>
    </div>
  );
}

// Ticket Boden mit Muster
function TicketFloor() {
  return (
    <group>
      {/* Haupt Boden */}
      <Plane args={[120, 120]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#2a2a2a" emissive="#1a1a1a" emissiveIntensity={0.2} />
      </Plane>

      {/* Ticket Muster auf dem Boden */}
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 8 }).map((_, col) => (
          <Html
            key={`${row}-${col}`}
            position={[-30 + col * 8, -1.9, -30 + row * 8]}
            rotation={[-Math.PI / 2, 0, 0]}
            transform
            occlude
            distanceFactor={12}
          >
            <div className="w-32 h-20 bg-gradient-to-r from-red-900 via-black to-red-900 border-2 border-red-500 rounded-lg shadow-lg opacity-60 transform rotate-12">
              {/* Ticket Header */}
              <div className="bg-red-600 text-white text-center py-1 text-xs font-bold">🎸 METAL TICKET 🎸</div>

              {/* Ticket Content */}
              <div className="p-2 text-white text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">METALLICA</span>
                  <span className="text-yellow-400">CHF 125</span>
                </div>
                <div className="text-gray-300 text-xs space-y-1">
                  <div>📅 15.12.2025</div>
                  <div>🏟️ Metal Arena</div>
                  <div className="text-center text-red-400 font-bold text-xs">⚡ LIVE ⚡</div>
                </div>
              </div>

              {/* Ticket Perforationen */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-red-500 opacity-50"></div>
              <div className="absolute right-2 top-2 bottom-2 border-l border-dashed border-red-400 opacity-30"></div>
            </div>
          </Html>
        ))
      )}

      {/* Zusätzliche schwarze/rote Muster */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Box
          key={`pattern-${i}`}
          args={[2, 0.1, 1]}
          position={[(Math.random() - 0.5) * 70, -1.8, (Math.random() - 0.5) * 70]}
          rotation={[0, Math.random() * Math.PI, 0]}
        >
          <meshBasicMaterial color={i % 2 === 0 ? "#000000" : "#8B0000"} transparent opacity={0.3} />
        </Box>
      ))}

      {/* Metal-Logo Muster */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Html
          key={`logo-${i}`}
          position={[(Math.random() - 0.5) * 60, -1.85, (Math.random() - 0.5) * 60]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
          transform
          distanceFactor={20}
        >
          <div className="text-6xl opacity-20 text-red-800 font-bold">
            {i % 4 === 0 ? "🎸" : i % 4 === 1 ? "⚡" : i % 4 === 2 ? "🔥" : "🤘"}
          </div>
        </Html>
      ))}
    </group>
  );
}

// YouTube TV Wand
function YouTubeTVWall() {
  const [videoUrl, setVideoUrl] = useState("");
  const [currentVideo, setCurrentVideo] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  // Extrahiert YouTube Video ID aus URL
  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handlePlayVideo = () => {
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      setCurrentVideo(videoId);
      setIsPlaying(true);
    } else {
      alert("⚠️ Bitte gib eine gültige YouTube URL ein!");
    }
  };

  const stopVideo = () => {
    setIsPlaying(false);
    setCurrentVideo("");
  };

  return (
    <group position={[-60, 16.5, 0]}>
      {/* TV Wand (gesamte linke Wand) */}
      <Plane args={[120, 37]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#2a2a2a" emissive="#1a1a1a" emissiveIntensity={0.3} />
      </Plane>

      {/* TV Rahmen */}
      <Plane args={[100, 30]} position={[0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial
          color="#3a3a3a"
          metalness={0.9}
          roughness={0.1}
          emissive="#2a2a2a"
          emissiveIntensity={0.2}
        />
      </Plane>

      {/* Zusätzliche Beleuchtung für die Wand */}
      <pointLight position={[5, 0, 0]} intensity={2} color="#ffffff" distance={40} />
      <pointLight position={[5, 0, 15]} intensity={1.5} color="#9333ea" distance={35} />

      {/* YouTube TV Screen */}
      <Html position={[0.2, 0, 0]} rotation-y={Math.PI / 2} transform sprite>
        <div className="w-[1200px] h-[800px] bg-black border-8 border-gray-800 rounded-lg shadow-2xl">
          {/* TV Header */}
          <div className="bg-gradient-to-r from-red-600 to-black p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">📺</div>
              <h2 className="text-white font-bold text-2xl">METAL TV - YouTube Player</h2>
              <div className="text-red-500 text-xl animate-pulse">🔴 LIVE</div>
            </div>
            <div className="flex space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Video Player Area */}
          <div className="p-6 h-full bg-gray-900">
            {isPlaying && currentVideo ? (
              <div className="w-full h-[600px] bg-black rounded-lg overflow-hidden shadow-lg">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
                  title="YouTube Metal TV"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            ) : (
              <div className="w-full h-[600px] bg-gradient-to-br from-gray-800 to-black rounded-lg flex flex-col items-center justify-center border-2 border-red-500">
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4">🎸</div>
                  <h3 className="text-white font-bold text-4xl mb-4">Metal YouTube Player</h3>
                  <p className="text-gray-300 text-xl">Spiele deine Lieblings-Metal-Videos ab!</p>
                </div>

                {/* Preset Metal Videos */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => {
                      setVideoUrl("https://www.youtube.com/watch?v=JFYVcz7h3o0");
                      setCurrentVideo("JFYVcz7h3o0");
                      setIsPlaying(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    🎸 Metallica - Enter Sandman
                  </button>
                  <button
                    onClick={() => {
                      setVideoUrl("https://www.youtube.com/watch?v=WM8bTdBs-cw");
                      setCurrentVideo("WM8bTdBs-cw");
                      setIsPlaying(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    ⚔️ Iron Maiden - Number of Beast
                  </button>
                  <button
                    onClick={() => {
                      setVideoUrl("https://www.youtube.com/watch?v=hkXHsK4AQPs");
                      setCurrentVideo("hkXHsK4AQPs");
                      setIsPlaying(true);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    🦇 Black Sabbath - Paranoid
                  </button>
                  <button
                    onClick={() => {
                      setVideoUrl("https://www.youtube.com/watch?v=L397TWLwrUU");
                      setCurrentVideo("L397TWLwrUU");
                      setIsPlaying(true);
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    🔥 Judas Priest - Breaking Law
                  </button>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="mt-6 bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="YouTube URL eingeben... (z.B. https://www.youtube.com/watch?v=...)"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  className="flex-1 bg-gray-700 text-white px-5 py-4 rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none text-base"
                />
                <button
                  onClick={handlePlayVideo}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  ▶️ PLAY
                </button>
                <button
                  onClick={stopVideo}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  ⏹️ STOP
                </button>
              </div>

              <div className="flex justify-between items-center text-gray-400 text-base">
                <div className="flex items-center space-x-4">
                  <span>📺 Status: {isPlaying ? "🔴 Playing" : "⏸️ Stopped"}</span>
                  {currentVideo && <span>🎬 Video ID: {currentVideo}</span>}
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎮 Controls: WASD zum Bewegen</span>
                  <span>👀 Maus zum Schauen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Html>

      {/* TV Glow Effect */}
      {isPlaying && <pointLight position={[2, 0, 0]} intensity={2} color="#ff0000" distance={10} />}
    </group>
  );
}

// Info Counter - An der Vorderwand
function InfoCounter({
  isSelected,
  onSelect,
  position,
  onPositionChange,
}: {
  isSelected: boolean;
  onSelect: () => void;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
}) {
  const handleDrag = useCallback(
    (movementX: number, movementY: number) => {
      onPositionChange({
        x: Math.max(-50, Math.min(50, position.x + movementX * 0.05)),
        y: Math.max(-15, Math.min(15, position.y - movementY * 0.05)),
      });
    },
    [position, onPositionChange]
  );

  return (
    <group position={[0, 16.5, 60]}>
      {/* Info Display an der Vorderwand */}
      <Html position={[position.x, position.y, -0.5]} rotation-y={Math.PI} transform distanceFactor={12}>
        <div
          className={`bg-gray-900/95 backdrop-blur-md p-8 rounded-xl shadow-2xl w-96 cursor-grab active:cursor-grabbing ${
            isSelected ? "border-4 border-green-500 ring-4 ring-green-400" : "border-2 border-blue-500"
          }`}
          draggable
          onDoubleClick={e => {
            e.stopPropagation();
            onSelect();
          }}
          onDragStart={e => {
            e.dataTransfer.effectAllowed = "move";
          }}
          onDrag={e => {
            if (e.clientX !== 0 && e.clientY !== 0) {
              handleDrag(e.movementX, e.movementY);
            }
          }}
        >
          <div className="text-center mb-6">
            <h3 className="text-blue-400 font-bold text-2xl mb-3">ℹ️ TICKET INFO</h3>
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
          </div>

          <div className="space-y-5 text-white text-base">
            <div className="bg-gray-800/50 p-5 rounded-lg">
              <h4 className="text-blue-400 font-bold text-lg mb-3">🎫 Ticket-Kategorien</h4>
              <ul className="space-y-2 text-base">
                <li>
                  • <span className="text-green-400">Standard</span> - Grundpreis
                </li>
                <li>
                  • <span className="text-yellow-400">VIP</span> - +CHF 44 (bessere Plätze)
                </li>
                <li>
                  • <span className="text-red-400">Backstage</span> - +CHF 105 (Meet & Greet)
                </li>
              </ul>
            </div>

            <div className="bg-gray-800/50 p-5 rounded-lg">
              <h4 className="text-blue-400 font-bold text-lg mb-3">📱 Zahlungsmethoden</h4>
              <div className="text-base space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span>💳 Kreditkarte (Visa, Mastercard, Amex)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span>💰 EC-Card / Debitkarte</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span>🏦 PayPal</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span>📱 Apple Pay / Google Pay</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span>📄 Kauf auf Rechnung</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span>🎫 Gutscheine & Vouchers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span>🇨🇭 TWINT (Mobile Payment CH)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✅</span>
                  <span>⚡ Sofortüberweisung</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-orange-400">🔄</span>
                  <span className="text-gray-400">🪙 Crypto (Coming Soon)</span>
                </div>
                <div className="text-xs text-blue-300 mt-3 p-2 bg-blue-900/30 rounded">
                  💡 Sichere Zahlung über Stripe - SSL-verschlüsselt
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 p-5 rounded-lg">
              <h4 className="text-blue-400 font-bold text-lg mb-3">🔒 Sicher & Geschützt</h4>
              <p className="text-base text-gray-300">
                Alle Transaktionen sind SSL-verschlüsselt und sicher. Ihre Tickets werden sofort per E-Mail zugestellt.
              </p>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// 3D Scene Komponente
function TicketScene() {
  // Selected Card State (null = keine ausgewählt, Index = welche Card)
  const [selectedPoster, setSelectedPoster] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [selectedInfo, setSelectedInfo] = useState(false);

  // State für Info Counter Position (Vorderwand) - mit localStorage
  const [infoPosition, setInfoPosition] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticketArena_infoCounterPosition");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse info counter position:", e);
        }
      }
    }
    return { x: 0, y: 0 };
  });

  // Speichere Info Position in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ticketArena_infoCounterPosition", JSON.stringify(infoPosition));
    }
  }, [infoPosition]);

  // State für Concert Posters Positionen (Rückwand) - mit localStorage
  const [posterPositions, setPosterPositions] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticketArena_posterPositions");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure we have enough positions for all concerts
          if (parsed.length >= concerts.length) {
            return parsed;
          }
        } catch (e) {
          console.error("Failed to parse poster positions:", e);
        }
      }
    }
    // Generate positions for all concerts in a single row layout
    return concerts.map((_, index) => ({
      x: -120 + (index % 16) * 15, // Spread horizontally across back wall
      y: 5, // Single row at comfortable height
    }));
  });

  // State für Ticket Automaten Positionen (Rechte Wand) - mit localStorage
  const [ticketPositions, setTicketPositions] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticketArena_ticketPositions");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure we have enough positions for all concerts
          if (parsed.length >= concerts.length) {
            return parsed;
          }
        } catch (e) {
          console.error("Failed to parse ticket positions:", e);
        }
      }
    }
    // Generate positions for all concerts in 4 rows of 4
    return concerts.map((_, index) => ({
      y: 5 + (index % 4) * 10, // 4 rows with smaller spacing
      z: -60 + Math.floor(index / 4) * 30, // 4 columns
    }));
  });

  // State für Info Counter Positionen (Vorderwand) - mit localStorage
  const [infoPositions, setInfoPositions] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ticketArena_infoPositions");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse info positions:", e);
        }
      }
    }
    return concerts.map((_, index) => ({ x: -45 + index * 30, y: 0 }));
  });

  // Speichere Positionen in localStorage wenn sie sich ändern
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ticketArena_posterPositions", JSON.stringify(posterPositions));
    }
  }, [posterPositions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ticketArena_ticketPositions", JSON.stringify(ticketPositions));
    }
  }, [ticketPositions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ticketArena_infoPositions", JSON.stringify(infoPositions));
    }
  }, [infoPositions]);

  // Drag Handler für Concert Posters
  const handlePosterDrag = useCallback((index: number, movementX: number, movementY: number) => {
    setPosterPositions((prev: Array<{ x: number; y: number }>) => {
      const newPositions = [...prev];
      newPositions[index] = {
        x: Math.max(-55, Math.min(55, prev[index].x + movementX * 0.1)),
        y: Math.max(-15, Math.min(15, prev[index].y - movementY * 0.1)),
      };
      return newPositions;
    });
  }, []);

  // Drag Handler für Ticket Automaten
  const handleTicketDrag = useCallback((index: number, movementX: number, movementY: number) => {
    setTicketPositions((prev: Array<{ y: number; z: number }>) => {
      const newPositions = [...prev];
      newPositions[index] = {
        y: Math.max(-15, Math.min(15, prev[index].y - movementY * 0.05)),
        z: Math.max(-55, Math.min(55, prev[index].z + movementX * 0.05)),
      };
      return newPositions;
    });
  }, []);

  return (
    <>
      {/* Vereinfachte Beleuchtung */}
      <ambientLight intensity={0.8} color="#ffffff" />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[10, 5, 10]} intensity={1} color="#9333ea" />
      <pointLight position={[-10, 5, 10]} intensity={1} color="#3b82f6" />

      {/* Ticket Boden mit Muster */}
      <TicketFloor />

      {/* Decke */}
      <Plane args={[120, 120]} rotation={[Math.PI / 2, 0, 0]} position={[0, 35, 0]}>
        <meshStandardMaterial color="#4a4a4a" emissive="#3a3a3a" emissiveIntensity={0.5} />
      </Plane>

      {/* Seitenwände */}
      {/* Rechte Wand - Ticket Kaufwand */}
      <group position={[60, 16.5, 0]}>
        <Plane
          args={[120, 37]}
          rotation={[0, -Math.PI / 2, 0]}
          onClick={e => {
            if (selectedTicket !== null) {
              e.stopPropagation();
              const point = e.point;
              setTicketPositions((prev: Array<{ y: number; z: number }>) => {
                const newPositions = [...prev];
                newPositions[selectedTicket] = {
                  y: Math.max(-15, Math.min(15, point.y - 16.5)),
                  z: Math.max(-55, Math.min(55, point.z)),
                };
                return newPositions;
              });
              setSelectedTicket(null);
            }
          }}
        >
          <meshStandardMaterial color="#2a2a2a" emissive="#2a2a2a" emissiveIntensity={0.3} />
        </Plane>

        {/* Ticket-Automaten auf der rechten Wand */}
        {concerts.map((concert, index) => {
          const [isSelected, setIsSelected] = React.useState(false);

          return (
            <Html
              key={concert.id}
              position={[0.5, ticketPositions[index].y, ticketPositions[index].z]}
              rotation-y={-Math.PI / 2}
              transform
              distanceFactor={12}
            >
              <div
                className={`bg-gray-900/95 backdrop-blur-md p-8 rounded-lg border-2 shadow-2xl w-96 cursor-grab active:cursor-grabbing ${
                  selectedTicket === index ? "border-green-500 ring-4 ring-green-400" : "border-purple-500"
                }`}
                draggable
                onDoubleClick={e => {
                  e.stopPropagation();
                  setSelectedTicket(index);
                }}
                onDragStart={e => {
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDrag={e => {
                  if (e.clientX !== 0 && e.clientY !== 0) {
                    handleTicketDrag(index, e.movementX, e.movementY);
                  }
                }}
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{concert.image}</div>
                  <h3 className="text-purple-400 font-bold text-2xl">{concert.band}</h3>
                  <p className="text-white text-base">{concert.description}</p>
                </div>

                <div className="space-y-3 text-white text-base">
                  <div className="flex justify-between">
                    <span>📅 Datum:</span>
                    <span className="text-purple-300">{concert.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🏟️ Venue:</span>
                    <span className="text-purple-300">{concert.venue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>💰 Preis:</span>
                    <span className="text-green-400 font-bold">{concert.price}</span>
                  </div>
                </div>

                {concert.available ? (
                  <button
                    className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors"
                    onClick={() => setIsSelected(true)}
                  >
                    🎫 TICKETS KAUFEN
                  </button>
                ) : (
                  <div className="w-full mt-6 bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg text-center">
                    ❌ AUSVERKAUFT
                  </div>
                )}

                {/* Purchase Modal - Erweitert mit Payment Options */}
                {isSelected && <PurchaseModal concert={concert} onClose={() => setIsSelected(false)} />}
              </div>
            </Html>
          );
        })}

        <pointLight position={[-5, 0, 0]} intensity={3} color="#9333ea" distance={50} />
      </group>

      {/* Linke Wand mit YouTube TV */}
      <YouTubeTVWall />

      {/* Hintere Wand - Concert Poster Information */}
      <group position={[0, 16.5, -60]}>
        <Plane
          args={[120, 37]}
          rotation={[0, 0, 0]}
          onClick={e => {
            if (selectedPoster !== null) {
              e.stopPropagation();
              const point = e.point;
              setPosterPositions((prev: Array<{ x: number; y: number }>) => {
                const newPositions = [...prev];
                newPositions[selectedPoster] = {
                  x: Math.max(-55, Math.min(55, point.x)),
                  y: Math.max(-15, Math.min(15, point.y - 16.5)),
                };
                return newPositions;
              });
              setSelectedPoster(null);
            }
          }}
        >
          <meshStandardMaterial color="#1a1a1a" emissive="#0a0a0a" emissiveIntensity={0.5} />
        </Plane>

        {/* Concert Posters auf der Rückwand */}
        {concerts.map((concert, index) => (
          <Html
            key={concert.id}
            position={[posterPositions[index].x, posterPositions[index].y, 0.5]}
            transform
            occlude
            distanceFactor={12}
          >
            <div
              className={`bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 backdrop-blur-sm p-8 rounded-2xl border-4 shadow-2xl w-[400px] hover:scale-105 transition-transform cursor-grab active:cursor-grabbing ${
                selectedPoster === index ? "border-green-500 ring-4 ring-green-400" : "border-purple-500"
              }`}
              draggable
              onDoubleClick={e => {
                e.stopPropagation();
                setSelectedPoster(index);
              }}
              onDragStart={e => {
                e.dataTransfer.effectAllowed = "move";
              }}
              onDrag={e => {
                if (e.clientX !== 0 && e.clientY !== 0) {
                  handlePosterDrag(index, e.movementX, e.movementY);
                }
              }}
            >
              <div className="text-center">
                <div className="text-7xl mb-5">{concert.image}</div>

                {/* Zentraler Concert Title - Komplett zentriert */}
                <div className="text-center mb-6">
                  <h2 className="text-purple-400 font-bold text-4xl mb-2 uppercase tracking-wide">
                    {concert.description}
                  </h2>
                  <h3 className="text-white font-bold text-2xl mb-1">🎸 {concert.band} (Metal)</h3>
                </div>

                {/* Event Details - Zentriert */}
                <div className="text-center text-lg text-gray-300 space-y-3 bg-black/30 p-6 rounded-lg">
                  <p className="font-semibold text-xl">📍 {concert.venue}</p>
                  <p className="font-semibold text-xl">📅 {concert.date}</p>
                  <p className="font-bold text-2xl text-green-400">
                    🎫 Noch {concert.ticketsAvailable} Tickets verfügbar
                  </p>
                </div>

                {!concert.available && (
                  <div className="mt-5 bg-red-600 text-white font-bold text-xl py-3 rounded-lg animate-pulse shadow-lg">
                    ⚠️ AUSVERKAUFT
                  </div>
                )}
              </div>
            </div>
          </Html>
        ))}

        <pointLight position={[0, 0, 5]} intensity={3} color="#9333ea" distance={50} />
      </group>

      {/* Vordere Wand */}
      <Plane
        args={[120, 37]}
        position={[0, 16.5, 60]}
        rotation={[0, Math.PI, 0]}
        onClick={e => {
          if (selectedInfo) {
            e.stopPropagation();
            const point = e.point;
            setInfoPosition({
              x: Math.max(-50, Math.min(50, point.x)),
              y: Math.max(-15, Math.min(15, point.y - 16.5)),
            });
            setSelectedInfo(false);
          }
        }}
      >
        <meshStandardMaterial color="#2a2a2a" emissive="#1a1a1a" emissiveIntensity={0.3} />
      </Plane>
      <pointLight position={[0, 16.5, 55]} intensity={2} color="#ffffff" distance={40} />

      {/* Epischer schwebender Titel */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Center position={[0, 18, 0]}>
          <mesh>
            <boxGeometry args={[20, 2, 0.5]} />
            <meshBasicMaterial color="#9333ea" />
          </mesh>
        </Center>
      </Float>

      {/* Info Counter */}
      <InfoCounter
        isSelected={selectedInfo}
        onSelect={() => setSelectedInfo(true)}
        position={infoPosition}
        onPositionChange={setInfoPosition}
      />

      {/* Atmosphäre Partikel */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Float key={i} speed={0.5 + i * 0.1} rotationIntensity={0.2} floatIntensity={0.3}>
          <Box
            position={[(Math.random() - 0.5) * 60, 8 + Math.random() * 12, (Math.random() - 0.5) * 50]}
            args={[0.2, 0.2, 0.2]}
          >
            <meshBasicMaterial color={i % 3 === 0 ? "#9333ea" : i % 3 === 1 ? "#3b82f6" : "#ef4444"} />
          </Box>
        </Float>
      ))}

      {/* Zentrales Kassen-Pult in der Mitte */}
      <group position={[0, 0, 0]}>
        {/* Pult-Basis */}
        <Box position={[0, 2.5, 0]} args={[6, 5, 4]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </Box>

        {/* Pult-Top (Theke) */}
        <Box position={[0, 5.2, 0]} args={[7, 0.4, 5]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.3} />
        </Box>

        {/* Dekorative Lichter am Pult */}
        <pointLight position={[0, 6, 0]} intensity={2} color="#3b82f6" distance={15} />
        <pointLight position={[-3, 4, 2]} intensity={1.5} color="#9333ea" distance={10} />
        <pointLight position={[3, 4, 2]} intensity={1.5} color="#ef4444" distance={10} />

        {/* Kassen-Interface */}
        <CashDeskInterface />
      </group>

      {/* FPS-Steuerung */}
      <FPSControls
        movementSpeed={12}
        lookSpeed={0.002}
        enabled={true}
        boundaries={{ minX: -58, maxX: 58, minZ: -58, maxZ: 58 }}
      />
    </>
  );
}

// Kassen-Pult Interface Komponente
function CashDeskInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Konzert, 2: Details, 3: Payment, 4: Success
  const [selectedConcert, setSelectedConcert] = useState<(typeof concerts)[0] | null>(null);
  const [ticketType, setTicketType] = useState<"digital" | "paper">("digital");
  const [ticketCategory, setTicketCategory] = useState<"standard" | "vip" | "backstage">("standard");
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"email" | "post">("email");
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // PaymentOptions Integration
  const { selectedMethod, setSelectedMethod, processPayment } = usePaymentOptions();

  const calculatePrice = () => {
    // Band-spezifische Basispreise (Standard-Tickets)
    const getBandBasePrice = (concertId: number) => {
      switch (concertId) {
        case 1:
          return 125; // Metallica - Weltstar
        case 2:
          return 110; // Iron Maiden - Legende
        case 3:
          return 140; // Black Sabbath - Farewell Premium
        case 4:
          return 95; // Judas Priest - Klassiker
        case 5:
          return 115; // Slayer - Thrash Legende
        case 6:
          return 105; // Megadeth - Big Four Thrash
        case 7:
          return 130; // Motörhead - Lemmy Tribute
        case 8:
          return 120; // Pantera - Groove Metal Kings
        case 9:
          return 100; // Dio - Holy Diver Legend
        case 10:
          return 85; // Anthrax - Thrash Veterans
        case 11:
          return 135; // Ozzy - Prince of Darkness
        case 12:
          return 145; // Tool - Progressive Metal Art
        case 13:
          return 125; // System of a Down - Nu-Metal Icons
        case 14:
          return 155; // Rammstein - Industrial Spectacle
        case 15:
          return 90; // Nightwish - Symphonic Beauty
        case 16:
          return 88; // Amon Amarth - Viking Metal
        default:
          return TICKET_PRICES.STANDARD;
      }
    };

    const basePrice = selectedConcert ? getBandBasePrice(selectedConcert.id) : TICKET_PRICES.STANDARD;

    // VIP/Backstage Aufpreise
    const categoryMultiplier = ticketCategory === "vip" ? 1.5 : ticketCategory === "backstage" ? 2.2 : 1;
    const paperSurcharge = ticketType === "paper" ? 5 : 0;

    return (basePrice * categoryMultiplier + paperSurcharge) * quantity;
  };

  const [purchaseData, setPurchaseData] = useState<any>(null);

  const { data: session } = useSession();

  const handlePurchase = async () => {
    // Session-Check
    if (!session) {
      alert("🔒 Bitte melde dich an, um Tickets zu kaufen!");
      return;
    }

    if (!selectedConcert || !customerData.name || !customerData.email) {
      alert("Bitte alle Felder ausfüllen!");
      return;
    }

    setIsPurchasing(true);

    try {
      console.log("🎫 Starting ticket purchase...");

      // Map category to TicketType
      const ticketTypeMap = {
        standard: "STANDARD",
        vip: "VIP",
        backstage: "VIP", // VIP includes backstage
      };

      const ticketType = ticketTypeMap[ticketCategory as keyof typeof ticketTypeMap];

      const requestData = {
        eventId: String(selectedConcert.id || "fallback-event-id"), // Ensure string type
        ticketType,
        quantity,
      };

      console.log("📬 Sending request:", requestData);

      // Real API call für Ticket-Kauf mit PDF Generation
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("📬 Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Response error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Purchase result:", result);

      if (response.ok && result.success) {
        // Check if Stripe checkout URL is provided
        if (result.checkoutUrl) {
          console.log("🔄 Redirecting to Stripe Checkout...");

          // Show user-friendly message
          alert(
            "🎫 Ticket reserviert! Sie werden zur sicheren Stripe-Zahlung weitergeleitet.\n\n" +
              "💡 Test-Kreditkarte: 4242 4242 4242 4242\n" +
              "📅 Datum: Beliebig in der Zukunft\n" +
              "🔐 CVV: Beliebige 3 Ziffern"
          );

          // Redirect to Stripe Checkout
          window.location.href = result.checkoutUrl;
          return;
        }

        // Fallback for direct purchase (if no Stripe)
        setPurchaseData(result);
        setIsPurchasing(false);
        setPurchaseSuccess(true);

        console.log("🎫 Tickets erfolgreich gekauft:", result);
        console.log(`📄 ${result.pdfGenerated || 0} PDF-Tickets generiert`);
      } else {
        throw new Error(result.error || "Ticket-Kauf fehlgeschlagen");
      }
    } catch (error) {
      console.error("🚨 Ticket purchase error:", error);

      let errorMessage = "Unbekannter Fehler";

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "Netzwerk-Fehler: Server nicht erreichbar. Bitte prüfe deine Internetverbindung.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(`❌ Fehler beim Ticket-Kauf: ${errorMessage}`);
      setIsPurchasing(false);
    }
  };

  // PDF Download Handler
  const handleDownloadPDF = async (ticket: any) => {
    try {
      if (!ticket.pdfUrl) {
        alert("PDF nicht verfügbar für dieses Ticket");
        return;
      }

      // Direct PDF download
      const link = document.createElement("a");
      link.href = ticket.pdfUrl;
      link.download = `Metal3DCore-Ticket-${ticket.ticketNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`📄 PDF downloaded: ${ticket.pdfUrl}`);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Fehler beim PDF-Download");
    }
  };

  // Auto-close success message after 10 seconds
  useEffect(() => {
    if (purchaseSuccess) {
      const timer = setTimeout(() => {
        setPurchaseSuccess(false);
        setIsOpen(false);
        setSelectedConcert(null);
        setPurchaseData(null);
        setCustomerData({
          name: "",
          email: "",
          address: "",
          city: "",
          zipCode: "",
          country: "",
        });
      }, 10000); // 10 seconds to allow PDF downloads

      return () => clearTimeout(timer);
    }
  }, [purchaseSuccess]);

  return (
    <Html position={[0, 6, 2.5]} transform distanceFactor={8}>
      {!isOpen ? (
        <div className="text-center">
          <button
            onClick={() => setIsOpen(true)}
            className="px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 border-4 border-white/20"
          >
            🎫 KASSEN-PULT
            <br />
            <span className="text-lg">Tickets hier kaufen</span>
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-12 rounded-3xl border-4 border-blue-500 shadow-2xl w-[800px] max-h-[600px] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 border-b-2 border-blue-500 pb-6">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              🎫 Ticket-Kasse
            </h2>
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedConcert(null);
                setPurchaseSuccess(false);
              }}
              className="text-3xl hover:text-red-500 transition-colors text-white"
            >
              ✕
            </button>
          </div>

          {purchaseSuccess ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-8">✅</div>
              <h3 className="text-4xl font-bold text-green-400 mb-6">Kauf erfolgreich!</h3>
              <div className="text-xl text-gray-300 mb-8">Ihre Tickets wurden erfolgreich über Stripe verarbeitet.</div>

              <div className="bg-green-900/30 border border-green-500 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
                <h4 className="text-green-400 font-bold text-lg mb-4">🎫 Ticket-Details</h4>
                {purchaseData && (
                  <div className="text-left space-y-2">
                    <div>
                      📧 <strong>E-Mail:</strong> {customerData.email}
                    </div>
                    <div>
                      🎤 <strong>Konzert:</strong> {selectedConcert?.band}
                    </div>
                    <div>
                      🎫 <strong>Kategorie:</strong> {ticketCategory.toUpperCase()}
                    </div>
                    <div>
                      🔢 <strong>Anzahl:</strong> {quantity}
                    </div>
                    <div>
                      💰 <strong>Preis:</strong> CHF {calculatePrice().toFixed(2)}
                    </div>
                    <div>
                      💳 <strong>Zahlung:</strong> Stripe (SSL-gesichert)
                    </div>
                  </div>
                )}
              </div>
              <p className="text-2xl text-gray-300 mb-4">
                {ticketType === "digital"
                  ? `Ihre Tickets wurden an ${customerData.email} gesendet!`
                  : `Ihre Tickets werden an ${customerData.address} verschickt!`}
              </p>
              <p className="text-xl text-gray-400">Vielen Dank für Ihren Kauf! 🎉</p>
            </div>
          ) : !selectedConcert ? (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Wählen Sie ein Konzert:</h3>
              <div className="space-y-4">
                {concerts.map(concert => (
                  <button
                    key={concert.id}
                    onClick={() => setSelectedConcert(concert)}
                    className="w-full p-6 bg-gray-800/50 hover:bg-gray-700/50 rounded-2xl border-2 border-gray-600 hover:border-purple-500 transition-all text-left"
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-5xl">{concert.image}</div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-white mb-2">{concert.band}</h4>
                        <p className="text-lg text-gray-400 mb-1">{concert.description}</p>
                        <div className="flex gap-6 text-base text-gray-300">
                          <span>📅 {concert.date}</span>
                          <span>🏟️ {concert.venue}</span>
                          <span className="text-green-400 font-bold">💰 {concert.price}</span>
                        </div>
                      </div>
                      <div className="text-3xl text-purple-400">→</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Gewähltes Konzert */}
              <div className="bg-purple-900/30 p-6 rounded-2xl border-2 border-purple-500">
                <div className="flex items-center gap-6">
                  <div className="text-6xl">{selectedConcert.image}</div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">{selectedConcert.band}</h3>
                    <p className="text-xl text-gray-300">
                      {selectedConcert.date} • {selectedConcert.venue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket-Typ Auswahl */}
              <div>
                <label className="block text-xl font-bold text-white mb-4">🎟️ Ticket-Art:</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setTicketType("digital");
                      setDeliveryMethod("email");
                    }}
                    className={`p-6 rounded-xl border-4 transition-all text-left ${
                      ticketType === "digital"
                        ? "bg-blue-600 border-blue-400"
                        : "bg-gray-800 border-gray-600 hover:border-blue-500"
                    }`}
                  >
                    <div className="text-4xl mb-3">📱</div>
                    <h4 className="text-xl font-bold text-white mb-2">Virtuelles Ticket</h4>
                    <p className="text-base text-gray-300">Per E-Mail sofort erhalten</p>
                  </button>
                  <button
                    onClick={() => {
                      setTicketType("paper");
                      setDeliveryMethod("post");
                    }}
                    className={`p-6 rounded-xl border-4 transition-all text-left ${
                      ticketType === "paper"
                        ? "bg-orange-600 border-orange-400"
                        : "bg-gray-800 border-gray-600 hover:border-orange-500"
                    }`}
                  >
                    <div className="text-4xl mb-3">📮</div>
                    <h4 className="text-xl font-bold text-white mb-2">Papier-Ticket</h4>
                    <p className="text-base text-gray-300">Per Post zugestellt (+CHF 5)</p>
                  </button>
                </div>
              </div>

              {/* Ticket-Kategorie */}
              <div>
                <label className="block text-xl font-bold text-white mb-4">🎭 Kategorie:</label>
                <select
                  value={ticketCategory}
                  onChange={e => setTicketCategory(e.target.value as any)}
                  className="w-full p-4 bg-gray-800 text-white text-xl rounded-xl border-2 border-gray-600 focus:border-purple-500 focus:outline-none"
                >
                  <option value="standard">Standard</option>
                  <option value="vip">VIP (+50%)</option>
                  <option value="backstage">Backstage (+150%)</option>
                </select>
              </div>

              {/* Anzahl */}
              <div>
                <label className="block text-xl font-bold text-white mb-4">🔢 Anzahl:</label>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-2xl rounded-xl"
                  >
                    −
                  </button>
                  <span className="text-3xl font-bold text-white min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-2xl rounded-xl"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Kundendaten */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">
                  {ticketType === "digital" ? "📧 E-Mail-Adresse:" : "📮 Lieferadresse:"}
                </h3>

                <input
                  type="text"
                  placeholder="Name"
                  value={customerData.name}
                  onChange={e => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full p-4 bg-gray-800 text-white text-lg rounded-xl border-2 border-gray-600 focus:border-purple-500 focus:outline-none"
                />

                <input
                  type="email"
                  placeholder="E-Mail"
                  value={customerData.email}
                  onChange={e => setCustomerData({ ...customerData, email: e.target.value })}
                  className="w-full p-4 bg-gray-800 text-white text-lg rounded-xl border-2 border-gray-600 focus:border-purple-500 focus:outline-none"
                />

                {ticketType === "paper" && (
                  <>
                    <input
                      type="text"
                      placeholder="Straße & Hausnummer"
                      value={customerData.address}
                      onChange={e =>
                        setCustomerData({
                          ...customerData,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-gray-800 text-white text-lg rounded-xl border-2 border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="PLZ"
                        value={customerData.zipCode}
                        onChange={e =>
                          setCustomerData({
                            ...customerData,
                            zipCode: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-gray-800 text-white text-lg rounded-xl border-2 border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Stadt"
                        value={customerData.city}
                        onChange={e =>
                          setCustomerData({
                            ...customerData,
                            city: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-gray-800 text-white text-lg rounded-xl border-2 border-gray-600 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Land"
                      value={customerData.country}
                      onChange={e =>
                        setCustomerData({
                          ...customerData,
                          country: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-gray-800 text-white text-lg rounded-xl border-2 border-gray-600 focus:border-purple-500 focus:outline-none"
                    />
                  </>
                )}
              </div>

              {/* Zahlungsoptionen Sektion */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">💳 Zahlungsart auswählen</h3>

                <PaymentOptions
                  selectedMethod={selectedMethod}
                  onMethodSelect={setSelectedMethod}
                  totalAmount={calculatePrice()}
                  currency="CHF"
                />
              </div>

              {/* Gesamtpreis & Kaufen */}
              <div className="bg-gradient-to-r from-green-900/50 to-blue-900/50 p-6 rounded-2xl border-2 border-green-500">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-2xl font-bold text-white">Gesamtpreis:</span>
                  <span className="text-4xl font-bold text-green-400">CHF {calculatePrice().toFixed(2)}</span>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing || !customerData.name || !customerData.email || !selectedMethod}
                  className="w-full py-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white text-2xl font-bold rounded-xl transition-all disabled:cursor-not-allowed shadow-lg"
                >
                  {isPurchasing ? (
                    <span className="flex items-center justify-center gap-4">
                      <span className="animate-spin text-3xl">⏳</span>
                      Wird verarbeitet...
                    </span>
                  ) : selectedMethod ? (
                    <span>
                      💳 KAUFEN - {selectedMethod.toUpperCase()}
                      {ticketType === "digital" ? " (E-Mail)" : " (Post)"}
                    </span>
                  ) : (
                    <span>⚠️ ZAHLUNGSART WÄHLEN</span>
                  )}
                </button>

                <div className="text-center mt-3">
                  <div className="flex justify-center items-center space-x-4 text-sm text-gray-400">
                    <span>🔒 SSL-gesichert</span>
                    <span>•</span>
                    <span>💳 Stripe Checkout</span>
                    <span>•</span>
                    <span>⚡ Sofortiger Download</span>
                  </div>
                </div>

                <p className="text-center text-sm text-gray-400 mt-4">
                  {ticketType === "digital"
                    ? "✉️ Tickets werden sofort per E-Mail an Sie versendet"
                    : "📮 Tickets werden innerhalb von 3-5 Werktagen per Post zugestellt"}
                </p>
              </div>

              <button
                onClick={() => setSelectedConcert(null)}
                className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white text-xl rounded-xl transition-all"
              >
                ← Zurück zur Konzertauswahl
              </button>
            </div>
          )}
        </div>
      )}
    </Html>
  );
}

// Hauptkomponente mit responsivem Metal Pulse Design
export default function TicketStage({ isFullscreen = false, onRoomChange, onFullscreen }: TicketStageProps) {
  const [selectedConcert, setSelectedConcert] = useState<(typeof concerts)[0] | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "3d">("list");

  return (
    <div className={isFullscreen ? "h-screen bg-theme-primary overflow-hidden" : "min-h-screen bg-theme-primary"}>
      {/* Header */}
      <div className={isFullscreen ? "p-4" : "app-shell py-8"}>
        <div className={isFullscreen ? "bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-4" : "section-card mb-8"}>
          <div
            className={
              isFullscreen
                ? "flex flex-wrap items-center justify-between gap-4"
                : "flex flex-col lg:flex-row items-start justify-between gap-6"
            }
          >
            <div className={isFullscreen ? "flex items-center gap-3" : "flex items-center gap-4"}>
              <span className={isFullscreen ? "text-3xl" : "text-4xl sm:text-5xl"}>🎫</span>
              <div>
                <h1
                  className={isFullscreen ? "panel-heading text-xl sm:text-2xl" : "panel-heading text-2xl sm:text-4xl"}
                >
                  Metal Ticket Arena
                </h1>
                {!isFullscreen && (
                  <p className="text-theme-secondary mt-2">Sichere dir Tickets für legendäre Metal-Konzerte</p>
                )}
              </div>
            </div>

            <div className="action-row w-full lg:w-auto">
              <button
                onClick={() => setViewMode(viewMode === "list" ? "3d" : "list")}
                className="button-secondary flex-1 sm:flex-none"
              >
                {viewMode === "list" ? "🎮 3D Modus" : "📋 Listen Modus"}
              </button>
              {onFullscreen && (
                <button
                  onClick={onFullscreen}
                  className="button-secondary flex-1 sm:flex-none"
                  title={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
                >
                  {isFullscreen ? "📱 Normal" : "🖥️ Vollbild"}
                </button>
              )}
              {!isFullscreen && onRoomChange && (
                <button onClick={() => onRoomChange("welcome")} className="button-primary flex-1 sm:flex-none">
                  ← Welcome Stage
                </button>
              )}
            </div>
          </div>

          {!isFullscreen && (
            <div className="action-row mt-6">
              <div className="chip">🔒 SSL-gesichert</div>
              <div className="chip">💳 Stripe Checkout</div>
              <div className="chip">📱 Mobile Tickets</div>
              <div className="chip">⚡ Sofortiger Versand</div>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === "list" ? (
          <div className={isFullscreen ? "space-y-6 px-4" : "space-y-8"}>
            {/* Stats Grid */}
            <div className="content-grid">
              <div className="section-card text-center">
                <p className="text-3xl font-bold text-orange-500 mb-2">{concerts.filter(c => c.available).length}</p>
                <p className="text-theme-secondary">Verfügbare Events</p>
              </div>
              <div className="section-card text-center">
                <p className="text-3xl font-bold text-green-500 mb-2">CHF 89-189</p>
                <p className="text-theme-secondary">Preisspanne</p>
              </div>
              <div className="section-card text-center">
                <p className="text-3xl font-bold text-blue-500 mb-2">24 Bands</p>
                <p className="text-theme-secondary">Metal Vielfalt</p>
              </div>
            </div>

            {/* Concert List */}
            <div
              className={
                isFullscreen
                  ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[calc(100vh-300px)] overflow-y-auto"
                  : "space-y-6"
              }
            >
              {concerts.map(concert => (
                <TicketCard key={concert.id} concert={concert} onPurchase={() => setSelectedConcert(concert)} />
              ))}
            </div>
          </div>
        ) : (
          /* 3D View */
          <div
            className={
              isFullscreen
                ? "h-screen relative overflow-hidden"
                : "section-card h-96 sm:h-[600px] relative overflow-hidden"
            }
          >
            <Suspense fallback={<LoadingFallback />}>
              <Canvas
                camera={{ position: [0, 2, 8], fov: 75 }}
                className="w-full h-full rounded-2xl"
                gl={{ antialias: true, alpha: false }}
              >
                <TicketScene />
                <Environment preset="night" />
              </Canvas>
            </Suspense>

            {/* 3D Overlay Controls */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="glass-panel p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="flex gap-4">
                    <span className="text-theme-secondary">WASD: Bewegung</span>
                    <span className="text-theme-secondary">Maus: Umschauen</span>
                  </div>
                  <button onClick={() => setViewMode("list")} className="button-primary text-sm">
                    📋 Liste anzeigen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {selectedConcert && <PurchaseModal concert={selectedConcert} onClose={() => setSelectedConcert(null)} />}
    </div>
  );
}

// Responsive Ticket Card mit Metal Pulse Design
function TicketCard({ concert, onPurchase }: { concert: any; onPurchase: () => void }) {
  return (
    <article className="section-card hover:border-theme-accent transition-all duration-300 group overflow-hidden">
      {/* Header Section mit Icon und Category */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-5xl sm:text-6xl">{concert.image}</div>
        <div className="chip text-xs">{concert.category}</div>
      </div>

      {/* Band Info - Komplett Zentriert */}
      <div className="text-center mb-6">
        <h2 className="panel-heading text-3xl sm:text-4xl text-theme-accent mb-3">{concert.description}</h2>
        <h3 className="panel-heading text-xl sm:text-2xl text-theme-primary mb-2">🎸 {concert.band} (Metal)</h3>
        <div className="text-theme-secondary text-lg">
          📍 {concert.venue} • 📅 {concert.date}
        </div>
        <div className="mt-3 text-green-500 font-bold text-lg">
          🎫 Noch {concert.ticketsAvailable} Tickets verfügbar
        </div>
      </div>

      {/* Kompakte Info-Leiste */}
      <div className="bg-theme-secondary/20 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-secondary">📅 Datum:</span>
          <span className="font-semibold text-theme-primary">{concert.date}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-theme-secondary">📍 Venue:</span>
          <span className="font-semibold text-theme-primary">{concert.venue}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-theme-secondary/30">
          <span className="text-orange-500 font-semibold">💰 Preis ab:</span>
          <span className="text-2xl font-bold text-orange-500">{concert.price}</span>
        </div>
      </div>

      {/* Call-to-Action */}
      <div className="action-row">
        {concert.available ? (
          <button
            onClick={onPurchase}
            className="button-primary w-full group-hover:scale-[1.02] transition-transform text-lg py-4"
          >
            <span className="text-xl">🎫</span>
            Tickets kaufen
          </button>
        ) : (
          <div className="px-6 py-4 bg-red-600/20 border border-red-500 rounded-xl text-red-400 font-semibold text-center">
            ❌ Ausverkauft
          </div>
        )}
      </div>
    </article>
  );
}

// Responsive Purchase Modal mit Metal Pulse Design
function PurchaseModal({ concert, onClose }: { concert: any; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [ticketType, setTicketType] = useState("STANDARD");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { selectedMethod, setSelectedMethod } = usePaymentOptions();
  const { data: session } = useSession();

  const getTicketPrice = (type: string) => {
    const basePrice = parseInt(concert.price.replace("CHF ", ""));
    switch (type) {
      case "VIP":
        return Math.round(basePrice * 1.5);
      case "BACKSTAGE":
        return Math.round(basePrice * 2.2);
      default:
        return basePrice;
    }
  };

  const totalPrice = getTicketPrice(ticketType) * quantity;

  const handlePurchase = async () => {
    if (!session) {
      alert("🔒 Bitte melde dich an, um Tickets zu kaufen!");
      return;
    }

    if (!customerEmail || !customerData.name) {
      alert("Bitte alle Pflichtfelder ausfüllen!");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: String(concert.id),
          ticketType,
          quantity,
          customerEmail,
          customerData,
        }),
      });

      const result = await response.json();

      if (result.checkoutUrl) {
        alert("🎫 Weiterleitung zur sicheren Stripe-Zahlung...");
        window.location.href = result.checkoutUrl;
        return;
      }

      if (result.success) {
        setCurrentStep(3);
      } else {
        throw new Error(result.error || "Fehler beim Ticket-Kauf");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      alert(`❌ Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="section-card max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 pb-6 border-b border-theme-secondary">
          <div className="flex items-center gap-4">
            <span className="text-4xl sm:text-5xl">{concert.image}</span>
            <div>
              <h2 className="panel-heading text-xl sm:text-2xl">{concert.band}</h2>
              <p className="text-theme-secondary">
                {concert.date} • {concert.venue}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500 text-red-400 hover:bg-red-600/30 transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {[1, 2, 3].map(step => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  currentStep >= step ? "bg-orange-500 text-black" : "bg-theme-secondary text-theme-primary"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 rounded transition-colors ${
                    currentStep > step ? "bg-orange-500" : "bg-theme-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="content-grid">
              <div className="glass-panel p-4">
                <label className="block text-sm uppercase tracking-wide text-theme-secondary mb-2">
                  Anzahl Tickets
                </label>
                <select
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full bg-theme-secondary border border-theme-secondary rounded-lg px-4 py-3 text-theme-primary focus:border-orange-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>
                      {num} Ticket{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="glass-panel p-4">
                <label className="block text-sm uppercase tracking-wide text-theme-secondary mb-2">Kategorie</label>
                <select
                  value={ticketType}
                  onChange={e => setTicketType(e.target.value)}
                  className="w-full bg-theme-secondary border border-theme-secondary rounded-lg px-4 py-3 text-theme-primary focus:border-orange-500 focus:outline-none"
                >
                  <option value="STANDARD">Standard - CHF {getTicketPrice("STANDARD")}</option>
                  <option value="VIP">VIP - CHF {getTicketPrice("VIP")}</option>
                  <option value="BACKSTAGE">Backstage - CHF {getTicketPrice("BACKSTAGE")}</option>
                </select>
              </div>

              <div className="glass-panel p-4 border border-orange-500">
                <p className="text-sm uppercase tracking-wide text-orange-500 mb-2">Gesamtpreis</p>
                <p className="text-2xl font-bold text-orange-500">CHF {totalPrice.toFixed(2)}</p>
                <p className="text-xs text-theme-secondary">inkl. MwSt.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="panel-heading text-lg">Kontaktdaten</h3>
              <div className="layout-grid two-column">
                <div>
                  <label className="block text-sm text-theme-secondary mb-2">E-Mail *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    className="w-full bg-theme-secondary border border-theme-secondary rounded-lg px-4 py-3 text-theme-primary focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-theme-secondary mb-2">Name *</label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={e => setCustomerData({ ...customerData, name: e.target.value })}
                    className="w-full bg-theme-secondary border border-theme-secondary rounded-lg px-4 py-3 text-theme-primary focus:border-orange-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="action-row">
              <button onClick={onClose} className="button-secondary">
                Abbrechen
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!customerEmail || !customerData.name}
                className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Weiter zur Zahlung
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="glass-panel p-6 text-center">
              <h3 className="panel-heading text-lg mb-2">Zahlungsart wählen</h3>
              <p className="text-theme-secondary">
                {quantity}x {ticketType} für {concert.band}
              </p>
              <p className="text-2xl font-bold text-orange-500 mt-2">CHF {totalPrice.toFixed(2)}</p>
            </div>

            <PaymentOptions
              selectedMethod={selectedMethod}
              onMethodSelect={setSelectedMethod}
              totalAmount={totalPrice}
              currency="CHF"
            />

            <div className="action-row">
              <button onClick={() => setCurrentStep(1)} className="button-secondary">
                ← Zurück
              </button>
              <button
                onClick={handlePurchase}
                disabled={!selectedMethod || isProcessing}
                className="button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Verarbeitung...
                  </span>
                ) : (
                  `Jetzt kaufen - CHF ${totalPrice.toFixed(2)}`
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="panel-heading text-2xl text-green-500">Kauf erfolgreich!</h3>
            <div className="glass-panel p-6">
              <p className="text-theme-secondary mb-4">Ihre Tickets für {concert.band} wurden erfolgreich gekauft.</p>
              <p className="text-theme-primary">
                Tickets wurden an <strong className="text-orange-500">{customerEmail}</strong> gesendet.
              </p>
            </div>
            <button onClick={onClose} className="button-primary">
              🎸 Zurück zur Arena
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
