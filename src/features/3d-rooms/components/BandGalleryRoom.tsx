"use client";

import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Plane,
  Text,
  Image,
  Environment,
  Html,
  Float,
  RoundedBox,
  Box,
  Cylinder,
  Sphere,
  Sparkles,
} from "@react-three/drei";
import { useState, Suspense } from "react";
import { Color, Vector3 } from "three";
import { FPSControls } from "@/shared/components/3d";

// BAND GALLERY ROOM Images - 360° Galerie mit Medien-Daten
const bandImages = [
  // Rückwand (North Wall) - Z = -9
  {
    url: "/gallery/bild1.jpg",
    position: [-6, 6, -9.5],
    rotation: [0, 0, 0],
    title: "Metallica",
    videoUrl: "https://www.youtube.com/embed/E0ozmU9cJDg", // Master of Puppets (Official)
    events: [
      { date: "15.12.2025", venue: "Olympiahalle München", price: "89€" },
      { date: "20.01.2026", venue: "Mercedes-Benz Arena Berlin", price: "95€" },
      { date: "05.03.2026", venue: "Barclaycard Arena Hamburg", price: "79€" },
    ],
  },
  {
    url: "/gallery/bild2.jpg",
    position: [-2, 6, -9.5],
    rotation: [0, 0, 0],
    title: "Iron Maiden",
    videoUrl: "https://www.youtube.com/embed/86URGgqONvA", // The Trooper (Official)
    events: [
      { date: "22.11.2025", venue: "Zenith München", price: "75€" },
      { date: "18.02.2026", venue: "Columbiahalle Berlin", price: "82€" },
    ],
  },
  {
    url: "/gallery/bild3.jpg",
    position: [2, 6, -9.5],
    rotation: [0, 0, 0],
    title: "Slipknot",
    videoUrl: "https://www.youtube.com/embed/6fVE8kSM43I", // Duality (Official)
    events: [
      { date: "10.01.2026", venue: "Palladium Köln", price: "65€" },
      { date: "25.04.2026", venue: "Gasometer Wien", price: "70€" },
    ],
  },
  {
    url: "/gallery/bild4.png",
    position: [6, 6, -9.5],
    rotation: [0, 0, 0],
    title: "Rammstein",
    videoUrl: "https://www.youtube.com/embed/W3q8Od5qJio", // Du Hast (Official)
    events: [
      { date: "08.06.2026", venue: "Olympiastadion Berlin", price: "120€" },
      { date: "15.07.2026", venue: "Wacken Open Air", price: "150€" },
    ],
  },
  {
    url: "/gallery/bild8.png",
    position: [-6, 2, -9.5],
    rotation: [0, 0, 0],
    title: "Volbeat",
    videoUrl: "https://www.youtube.com/embed/7M9bUDc8n-A", // Still Counting (Official)
    events: [{ date: "13.07.2026", venue: "Arena Genève", price: "95 CHF" }],
  },
  {
    url: "/gallery/bild9.png",
    position: [-2, 2, -9.5],
    rotation: [0, 0, 0],
    title: "Linkin Park",
    videoUrl: "https://www.youtube.com/embed/kXYiU_JCYtU", // Numb
    events: [{ date: "28.07.2026", venue: "Hallenstadion Zürich", price: "149 CHF" }],
  },
  {
    url: "/gallery/bild7.png",
    position: [2, 2, -9.5],
    rotation: [0, 0, 0],
    title: "Disturbed",
    videoUrl: "https://www.youtube.com/embed/66gSvNeqevg", // The Sound of Silence (Official)
    events: [{ date: "05.08.2026", venue: "Mercedes-Benz Arena Berlin", price: "98€" }],
  },
  {
    url: "/gallery/bild6.png",
    position: [6, 2, -9.5],
    rotation: [0, 0, 0],
    title: "Arch Enemy",
    videoUrl: "https://www.youtube.com/embed/InBXu-y952w", // The World Is Yours (Official)
    events: [{ date: "25.06.2026", venue: "Barclaycard Arena Hamburg", price: "72€" }],
  },
  {
    url: "/gallery/bild5.png",
    position: [-6, -2, -9.5],
    rotation: [0, 0, 0],
    title: "Stone Sour",
    videoUrl: "https://www.youtube.com/embed/CM0y65VZK84", // Through Glass (Official)
    events: [{ date: "12.09.2026", venue: "Gasometer Wien", price: "78€" }],
  },
  {
    url: "/gallery/bild10.png",
    position: [-2, -2, -9.5],
    rotation: [0, 0, 0],
    title: "Asking Alexandria",
    videoUrl: "https://www.youtube.com/embed/NPHTH2vbzO8", // The Final Episode
    events: [{ date: "15.05.2026", venue: "Columbiahalle Berlin", price: "68€" }],
  },
];

interface BandGalleryRoomProps {
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
}

// LUXURIÖSE VIP-GALLERY - Premium Metal Art Experience - GRÖßER
function VipGalleryArchitecture() {
  return (
    <group>
      {/* ELEGANTER DUNKLER BODEN - KEIN MARMOR */}
      <Plane args={[60, 60]} position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          color={new Color(0.15, 0.15, 0.15)} // Dunkler eleganter Boden
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          reflectivity={0.6}
        />
      </Plane>

      {/* SCHWARZE RÜCKWAND */}
      <Box args={[60, 25, 1]} position={[0, 10.5, -25]}>
        <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.02)} roughness={0.8} metalness={0.0} />
      </Box>

      {/* Linke Wand - Heller */}
      <Box args={[60, 25, 0.5]} position={[-30, 10.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshPhysicalMaterial color={new Color(0.2, 0.2, 0.25)} roughness={0.6} metalness={0.1} clearcoat={0.3} />
      </Box>

      {/* Rechte Wand - Heller */}
      <Box args={[60, 25, 0.5]} position={[30, 10.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <meshPhysicalMaterial color={new Color(0.2, 0.2, 0.25)} roughness={0.6} metalness={0.1} clearcoat={0.3} />
      </Box>

      {/* HELLERE DECKE */}
      <Box args={[60, 60, 1.2]} position={[0, 23, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial color={new Color(0.3, 0.3, 0.35)} roughness={0.6} metalness={0.1} clearcoat={0.4} />
      </Box>

      {/* NUR ECKSÄULEN - BERÜHREN DEN BODEN */}
      <Cylinder args={[1.5, 1.5, 25]} position={[-28, 10.5, 28]}>
        <meshPhysicalMaterial
          color={new Color(0.9, 0.9, 0.95)}
          roughness={0.2}
          metalness={0.0}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </Cylinder>

      <Cylinder args={[1.5, 1.5, 25]} position={[28, 10.5, 28]}>
        <meshPhysicalMaterial
          color={new Color(0.9, 0.9, 0.95)}
          roughness={0.2}
          metalness={0.0}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </Cylinder>

      <Cylinder args={[1.5, 1.5, 25]} position={[-28, 10.5, -28]}>
        <meshPhysicalMaterial
          color={new Color(0.9, 0.9, 0.95)}
          roughness={0.2}
          metalness={0.0}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </Cylinder>

      <Cylinder args={[1.5, 1.5, 25]} position={[28, 10.5, -28]}>
        <meshPhysicalMaterial
          color={new Color(0.9, 0.9, 0.95)}
          roughness={0.2}
          metalness={0.0}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </Cylinder>
    </group>
  );
}

// BandGalleryRoom-Komponente für die 3D-Band-Galerie
// INTERAKTIVE KOMPONENTE FÜR BILDER
function InteractiveArtwork({ img, index, position, rotation }: any) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [editableEvents, setEditableEvents] = useState(img.events || []);

  const handleClick = () => {
    if (!isFlipped) {
      // Erste Drehung: Video anzeigen (wenn vorhanden), sonst direkt Events
      setIsFlipped(true);
      setVideoStarted(false); // Reset video state
      if (img.videoUrl) {
        setShowVideo(true);
      } else {
        setShowVideo(false);
      }
    } else if (showVideo) {
      // Zweite Drehung: Event-Daten anzeigen
      setShowVideo(false);
      setVideoStarted(false); // Reset video state
    } else {
      // Zurück zum Original
      setIsFlipped(false);
      setVideoStarted(false); // Reset video state
    }
  };

  const updateEvent = (eventIndex: number, field: string, value: string) => {
    const newEvents = [...editableEvents];
    newEvents[eventIndex] = { ...newEvents[eventIndex], [field]: value };
    setEditableEvents(newEvents);
  };

  return (
    <group
      position={position}
      rotation={[0, rotation[1] + (isFlipped ? Math.PI : 0), 0]}
      onClick={handleClick}
      onPointerOver={e => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={e => {
        e.stopPropagation();
        document.body.style.cursor = "auto";
      }}
    >
      {/* WEIßER RAHMEN */}
      <Box args={[4.5, 6.5, 0.3]} position={[0, 3.25, 0]}>
        <meshPhysicalMaterial
          color={new Color(0.95, 0.95, 0.95)}
          roughness={0.1}
          metalness={0.0}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </Box>

      {/* VORDERSEITE: ARTWORK ODER VIDEO */}
      {!isFlipped ? (
        <>
          {/* BAND BILD */}
          <Suspense fallback={null}>
            {/* Drei Image ist kein DOM-Image; Alt-Regel lokal unterdrücken */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image url={img.url} position={[0, 3.25, 0.2]} scale={[4.2, 6.2]} transparent toneMapped={false} />
          </Suspense>

          {/* BAND NAME - GROß UND GOLDEN */}
          <Text
            position={[0, -0.5, 0.2]}
            fontSize={0.45}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.06}
            outlineColor="#000000"
            fontWeight="bold"
          >
            🎸 {img.title}
          </Text>

          {/* INTERAKTIONS-HINWEIS */}
          <Text
            position={[0, -1.2, 0.2]}
            fontSize={0.28}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000000"
          >
            {img.videoUrl ? "👆 Klick für Video!" : "👆 Klick für Events!"}
          </Text>
        </>
      ) : showVideo ? (
        // VIDEO-SEITE - YOUTUBE DIREKT-LINK
        <>
          <Box args={[4.3, 6.3, 0.35]} position={[0, 3.25, 0.05]}>
            <meshBasicMaterial color={new Color(0, 0, 0)} />
          </Box>
          <Html position={[0, 3.25, 0.25]} center distanceFactor={1}>
            <div
              className="bg-gradient-to-br from-purple-900 via-black to-purple-900"
              style={{
                width: "min(95vw, 800px)",
                minHeight: "600px",
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "clamp(20px, 5vw, 50px)",
                margin: "0",
                border: "4px solid rgba(168, 85, 247, 0.5)",
                boxShadow: "0 0 50px rgba(147, 51, 234, 0.5)",
                borderRadius: "20px",
                overflow: "auto",
              }}
            >
              {/* VIDEO ICON & BAND INFO */}
              <div className="text-center mb-8">
                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-red-500/50 mx-auto animate-pulse">
                  <span className="text-6xl md:text-7xl lg:text-9xl">🎬</span>
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent px-4">
                  {img.title}
                </h2>
                <p className="text-2xl md:text-3xl lg:text-4xl text-purple-300 mb-3">Official Music Video</p>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-400">Video wird auf YouTube abgespielt</p>
              </div>

              {/* PLAY BUTTON */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  const videoId = img.videoUrl.split("/embed/")[1]?.split("?")[0];
                  if (videoId) {
                    // Vollbild YouTube-Fenster (fast maximiert)
                    const width = window.screen.availWidth;
                    const height = window.screen.availHeight;
                    window.open(
                      `https://www.youtube.com/watch?v=${videoId}`,
                      "_blank",
                      `width=${width},height=${height},left=0,top=0`
                    );
                  }
                }}
                className="w-full max-w-lg bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white text-2xl md:text-4xl lg:text-5xl font-black py-6 md:py-8 lg:py-10 rounded-3xl shadow-2xl shadow-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-red-400/70 flex items-center justify-center gap-4 md:gap-6 mb-6"
              >
                <span className="text-4xl md:text-6xl lg:text-7xl">▶️</span>
                <span className="leading-tight">VIDEO ABSPIELEN</span>
              </button>

              {/* EVENT DATA BUTTON */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowVideo(false);
                  setVideoStarted(false);
                }}
                className="w-full max-w-lg bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white text-xl md:text-3xl lg:text-4xl font-black py-5 md:py-7 lg:py-8 rounded-2xl shadow-2xl shadow-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-orange-400/70 flex items-center justify-center gap-3 md:gap-4"
              >
                <span>🎟️</span>
                <span className="leading-tight">Event-Daten anzeigen</span>
                <span>🔄</span>
              </button>
            </div>
          </Html>
        </>
      ) : (
        // EVENT-DATEN SEITE (EDITIERBAR) - VOLLBILDGRÖSSE
        <>
          {/* SCHWARZER HINTERGRUND DAMIT NICHTS DURCHSCHIMMERT - EXAKTE BILDGRÖßE */}
          <Box args={[4.3, 6.3, 0.35]} position={[0, 3.25, -0.05]}>
            <meshBasicMaterial color={new Color(0, 0, 0)} />
          </Box>
          <Html position={[0, 3.25, -0.25]} center distanceFactor={1}>
            <div
              className="bg-gradient-to-br from-purple-900 to-black text-white"
              style={{
                width: "min(95vw, 900px)",
                minHeight: "500px",
                maxHeight: "90vh",
                overflow: "auto",
                padding: "clamp(20px, 5vw, 50px)",
                margin: "0",
                border: "3px solid rgba(168, 85, 247, 0.6)",
                boxShadow: "0 0 40px rgba(147, 51, 234, 0.6)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent px-4">
                  🎸 {img.title}
                </h2>
                <p className="text-xl md:text-2xl text-purple-300">🎟️ Tour Dates & Tickets 🎟️</p>
              </div>
              {editableEvents.map((event: any, eventIndex: number) => (
                <div
                  key={eventIndex}
                  className="mb-8 p-6 md:p-8 lg:p-10 bg-gradient-to-br from-black/90 to-purple-900/50 rounded-2xl border-3 border-purple-400 shadow-2xl shadow-purple-500/50 hover:border-yellow-400 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="mb-6">
                    <label className="block text-lg md:text-xl lg:text-2xl text-purple-200 mb-3 font-black">
                      📅 Datum
                    </label>
                    <input
                      type="text"
                      value={event.date}
                      onChange={e => updateEvent(eventIndex, "date", e.target.value)}
                      className="w-full bg-gradient-to-r from-purple-700 to-purple-800 text-white p-4 md:p-5 lg:p-6 rounded-xl text-base md:text-lg lg:text-xl border-3 border-purple-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/50 focus:outline-none font-bold shadow-lg transition-all duration-200 hover:shadow-yellow-400/30"
                      placeholder="z.B. 15.05.2026"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-lg md:text-xl lg:text-2xl text-purple-200 mb-3 font-black">
                      🏟️ Location
                    </label>
                    <input
                      type="text"
                      value={event.venue}
                      onChange={e => updateEvent(eventIndex, "venue", e.target.value)}
                      className="w-full bg-gradient-to-r from-purple-700 to-purple-800 text-white p-4 md:p-5 lg:p-6 rounded-xl text-base md:text-lg lg:text-xl border-3 border-purple-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/50 focus:outline-none font-bold shadow-lg transition-all duration-200 hover:shadow-yellow-400/30"
                      placeholder="z.B. Mercedes-Benz Arena Berlin"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-lg md:text-xl lg:text-2xl text-purple-200 mb-3 font-black">
                      💎 Ticket-Preis
                    </label>
                    <input
                      type="text"
                      value={event.price}
                      onChange={e => updateEvent(eventIndex, "price", e.target.value)}
                      className="w-full bg-gradient-to-r from-purple-700 to-purple-800 text-white p-4 md:p-5 lg:p-6 rounded-xl text-base md:text-lg lg:text-xl border-3 border-purple-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/50 focus:outline-none font-bold shadow-lg transition-all duration-200 hover:shadow-yellow-400/30"
                      placeholder="z.B. 89€"
                    />
                  </div>
                </div>
              ))}
              <button className="w-full mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black text-xl md:text-2xl lg:text-3xl py-5 md:py-6 rounded-2xl shadow-2xl shadow-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/70">
                🖼️ Zurück zum Artwork 🔄
              </button>
            </div>
          </Html>
        </>
      )}

      {/* SPOTLIGHT */}
      <spotLight
        position={[0, 15, 3]}
        angle={Math.PI / 6}
        penumbra={0.3}
        intensity={3}
        color="#ffffff"
        target-position={[0, 3.25, 0]}
        castShadow
      />
    </group>
  );
}

export default function BandGalleryRoom({ onRoomChange, isFullscreen = false }: BandGalleryRoomProps) {
  const [controlMode, setControlMode] = useState<"fps" | "orbit">("fps");
  return (
    <div
      className={
        isFullscreen ? "fixed inset-0 z-50 bg-black" : "w-full h-64 sm:h-80 lg:h-96 bg-black rounded-lg overflow-hidden"
      }
    >
      <Canvas
        camera={{ position: [0, 12, 35], fov: 80 }}
        style={{ background: "linear-gradient(to bottom, #000000, #1a1a1a)" }}
      >
        <Environment preset="city" />

        {/* Bewegungssteuerung */}
        {controlMode === "fps" ? (
          <FPSControls
            movementSpeed={10}
            lookSpeed={0.002}
            boundaries={{
              minX: -28, // Linke Wand
              maxX: 28, // Rechte Wand (inkl. Bar-Bereich)
              minZ: -12, // Rückwand
              maxZ: 32, // Vorderwand
            }}
          />
        ) : (
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            maxDistance={30}
            minDistance={5}
            maxPolarAngle={Math.PI / 2}
            target={[0, 5, 0]}
          />
        )}

        {/* LUXURIÖSE VIP-GALLERY ARCHITEKTUR */}
        <VipGalleryArchitecture />

        {/* MINIMALISTISCHE BELEUCHTUNG - WIE IM BILDSCHIRMFOTO */}
        <ambientLight intensity={0.2} color="#404040" />

        {/* Hauptlicht von oben */}
        <directionalLight position={[0, 20, 0]} intensity={1} color="#ffffff" castShadow />

        {/* Dezente Akzentbeleuchtung */}
        <pointLight position={[0, 15, 0]} intensity={0.8} color="#ffffff" distance={40} decay={1} />

        {/* VIP-LOUNGE BEREICH - LEDERSESSEL KREISFÖRMIG VERSETZT - ENGER */}
        {/* Luxuriöse Ledersessel im engeren Kreis */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          const radius = 8;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius + 5;
          return (
            <group key={`sessel-${i}`} position={[x, 0, z]} rotation={[0, -angle + Math.PI, 0]}>
              {/* Sessel-Basis */}
              <RoundedBox args={[1.8, 0.8, 1.8]} position={[0, 0.4, 0]}>
                <meshPhysicalMaterial
                  color={new Color(0.2, 0.1, 0.05)}
                  roughness={0.8}
                  metalness={0.0}
                  clearcoat={0.3}
                />
              </RoundedBox>

              {/* Rückenlehne */}
              <RoundedBox args={[1.8, 1.5, 0.3]} position={[0, 1.2, -0.7]}>
                <meshPhysicalMaterial
                  color={new Color(0.2, 0.1, 0.05)}
                  roughness={0.8}
                  metalness={0.0}
                  clearcoat={0.3}
                />
              </RoundedBox>

              {/* Armlehnen */}
              <RoundedBox args={[0.3, 1, 1.2]} position={[0.8, 0.9, 0]}>
                <meshPhysicalMaterial
                  color={new Color(0.2, 0.1, 0.05)}
                  roughness={0.8}
                  metalness={0.0}
                  clearcoat={0.3}
                />
              </RoundedBox>
              <RoundedBox args={[0.3, 1, 1.2]} position={[-0.8, 0.9, 0]}>
                <meshPhysicalMaterial
                  color={new Color(0.2, 0.1, 0.05)}
                  roughness={0.8}
                  metalness={0.0}
                  clearcoat={0.3}
                />
              </RoundedBox>
            </group>
          );
        })}

        {/* PREMIUM BAR-BEREICH ZURÜCK */}
        <group position={[20, 0, 10]}>
          {/* Bar-Theke */}
          <RoundedBox args={[1.5, 4, 10]} position={[0, 2, 0]}>
            <meshPhysicalMaterial
              color={new Color(0.1, 0.1, 0.12)}
              roughness={0.2}
              metalness={0.8}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
            />
          </RoundedBox>

          {/* Glasregal */}
          <Box args={[0.4, 3, 8]} position={[-0.5, 5, 0]}>
            <meshPhysicalMaterial
              color={new Color(0.95, 0.95, 1.0)}
              transmission={0.95}
              thickness={0.4}
              ior={1.52}
              transparent
              roughness={0.02}
            />
          </Box>

          {/* Champagner-Flaschen */}
          {Array.from({ length: 6 }).map((_, i) => (
            <Cylinder key={`bottle-${i}`} args={[0.12, 0.1, 1.2]} position={[-0.4, 5.6, (i - 2.5) * 1.3]}>
              <meshPhysicalMaterial
                color={new Color(0.1, 0.3, 0.1)}
                roughness={0.1}
                metalness={0.0}
                transmission={0.7}
                thickness={0.1}
                ior={1.5}
                transparent
              />
            </Cylinder>
          ))}
        </group>

        {/* INTERAKTIVE BILDER VERSETZT UM DIE SESSEL VERTEILT - ENGER */}
        {bandImages.slice(0, 10).map((img, i) => {
          const angle = (i * Math.PI * 2) / 10;
          const radius = 15;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius + 5;
          return (
            <InteractiveArtwork key={i} img={img} index={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI, 0]} />
          );
        })}

        {/* Verbesserte Beleuchtung */}
        <ambientLight intensity={0.4} color="#4a4a4a" />
        <spotLight position={[0, 10, 0]} angle={Math.PI / 3} penumbra={0.5} intensity={2} color="#9333ea" castShadow />
        <spotLight position={[8, 8, 8]} angle={Math.PI / 4} penumbra={0.3} intensity={1.5} color="#ffffff" />
        <spotLight position={[-8, 8, 8]} angle={Math.PI / 4} penumbra={0.3} intensity={1.5} color="#ffffff" />

        {/* VIP GALLERY TITEL */}
        <Text
          position={[0, 20, -28]}
          fontSize={2.5}
          color="#ffd700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          � VIP METAL LEGENDS GALLERY
        </Text>

        <Text
          position={[0, 17, -28]}
          fontSize={1.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          Premium Art Experience • WASD Movement • Mouse Look • Luxury Atmosphere
        </Text>

        {/* Portal back to Welcome Stage */}
        {onRoomChange && (
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <group
              onClick={() => onRoomChange("welcome")}
              onPointerOver={e => (document.body.style.cursor = "pointer")}
              onPointerOut={e => (document.body.style.cursor = "auto")}
            >
              <RoundedBox args={[2, 3, 0.5]} position={[0, 1.5, 9]}>
                <meshPhysicalMaterial
                  color="#ff6b35"
                  metalness={0.8}
                  roughness={0.2}
                  clearcoat={1}
                  emissive="#ff6b35"
                  emissiveIntensity={0.3}
                />
              </RoundedBox>
              <Text position={[0, 2.5, 9.3]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle">
                🚪 BACK TO WELCOME
              </Text>
            </group>
          </Float>
        )}

        {/* Control Mode Toggle UI */}
        <Html position={[0, -1, 8]} center distanceFactor={10}>
          <div className="bg-gradient-to-br from-black/90 to-purple-900/80 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl border-2 border-purple-500/50">
            <h3 className="text-white font-black mb-6 text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              🎮 Steuerung
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setControlMode("fps")}
                className={`px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
                  controlMode === "fps"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
                }`}
              >
                🎮 FPS Mode
                <div className="text-xs mt-1">WASD + Maus</div>
              </button>
              <button
                onClick={() => setControlMode("orbit")}
                className={`px-8 py-4 rounded-xl text-lg font-bold transition-all duration-300 ${
                  controlMode === "orbit"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50 scale-105"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105"
                }`}
              >
                🖱️ Orbit Mode
                <div className="text-xs mt-1">Drag & Scroll</div>
              </button>
            </div>
          </div>
        </Html>
      </Canvas>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <button
          onClick={() => onRoomChange?.("welcome")}
          className="absolute top-4 right-4 z-60 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg"
        >
          ✕ Exit Fullscreen
        </button>
      )}
    </div>
  );
}
