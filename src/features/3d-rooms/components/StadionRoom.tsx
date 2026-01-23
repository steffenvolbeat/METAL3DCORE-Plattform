"use client";

import React, { JSX } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Cylinder,
  Plane,
  Environment,
  Sphere,
  MeshReflectorMaterial,
  ContactShadows,
  RoundedBox,
  Box,
  Cone,
  Sparkles,
  Stars,
  Float,
  Html,
} from "@react-three/drei";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Group, Color } from "three";
import * as THREE from "three";
import { FPSControls } from "@/shared/components/3d";
import StageLights from "./stadium/StageLights";
import { LiveWebcamIntegration } from "./LiveWebcamIntegration";
import { StadiumWebcamDisplay } from "./StadiumWebcamDisplay";
import { RoomAccessControl } from "./RoomAccessControl";
import { WebGLCanvasWrapper } from "@/shared/components/WebGLCanvasWrapper";

// HALLENSTADION ZÜRICH - Fotorealistische Struktur
function StadiumStructure({
  onRoomChange,
  handleRoomChange,
}: {
  onRoomChange?: () => void;
  handleRoomChange?: () => void;
}) {
  const concreteTexture = useMemo(
    () => ({
      color: new Color(0.65, 0.65, 0.68),
      roughness: 0.9,
      metalness: 0.02,
    }),
    []
  );

  const structureElements = useMemo(() => {
    const elements: JSX.Element[] = [];

    // KOLLISIONS-BODEN - Verhindert durch Boden fallen
    elements.push(
      <Plane
        key="collision-floor"
        args={[300, 300]}
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>
    );

    // AUTHENTISCHER HALLENSTADION BODEN - Holz/Parkett bis zu den Wänden
    elements.push(
      <Plane
        key="arena-floor"
        args={[200, 200]} // Größer - reicht bis zu den Wänden (Radius 85m × 2 + Reserve)
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshPhysicalMaterial
          color={new Color(0.45, 0.38, 0.3)} // Holzboden-Farbe
          roughness={0.4}
          metalness={0.05}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
        />
      </Plane>
    );

    // BODEN-MARKIERUNGEN (Basketball/Hockey Lines)
    const floorLines = [
      // Center Circle
      { x: 0, z: 0, width: 15, depth: 0.15 },
      // Side Lines
      { x: -30, z: 0, width: 0.15, depth: 60 },
      { x: 30, z: 0, width: 0.15, depth: 60 },
      { x: 0, z: -30, width: 60, depth: 0.15 },
      { x: 0, z: 30, width: 60, depth: 0.15 },
    ];

    floorLines.forEach((line, i) => {
      elements.push(
        <Plane
          key={`floor-line-${i}`}
          args={[line.width, line.depth]}
          position={[line.x, 0.01, line.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshPhysicalMaterial
            color={new Color(0.9, 0.9, 0.95)}
            emissive={new Color(0.5, 0.5, 0.6)}
            emissiveIntensity={0.1}
          />
        </Plane>
      );
    });

    // DACH/DECKEN-STRUKTUR - Charakteristische Lichtrig-Gitter
    const roofHeight = 42;
    const roofGridSize = 12;

    for (let i = -4; i <= 4; i++) {
      for (let j = -4; j <= 4; j++) {
        elements.push(
          <Box
            key={`roof-beam-${i}-${j}`}
            args={[0.8, 1.2, 80]}
            position={[i * roofGridSize, roofHeight, j * roofGridSize]}
            rotation={[0, j % 2 === 0 ? 0 : Math.PI / 2, 0]}
          >
            <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.06)} roughness={0.3} metalness={0.9} />
          </Box>
        );
      }
    }

    // LICHTRIG-TRÄGER - Wie im Foto über der Bühne
    const lightRigPositions = [
      [0, 38, -15],
      [0, 38, 0],
      [0, 38, 15],
    ];

    lightRigPositions.forEach((pos, i) => {
      elements.push(
        <RoundedBox key={`light-rig-${i}`} args={[50, 1, 1]} radius={0.1} position={pos as [number, number, number]}>
          <meshPhysicalMaterial color={new Color(0.08, 0.08, 0.1)} roughness={0.2} metalness={0.95} />
        </RoundedBox>
      );

      // Hängende Spot-Lichter am Rig
      for (let j = -4; j <= 4; j++) {
        elements.push(
          <group key={`hanging-light-${i}-${j}`} position={[j * 5, pos[1] - 2, pos[2]]}>
            <Cylinder args={[0.3, 0.25, 1.2]}>
              <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.02)} roughness={0.2} metalness={0.8} />
            </Cylinder>
            <Sphere args={[0.2]} position={[0, -0.8, 0]}>
              <meshPhysicalMaterial
                color={new Color(1, 0.9, 0.7)}
                emissive={new Color(1, 0.8, 0.5)}
                emissiveIntensity={2}
              />
            </Sphere>
          </group>
        );
      }
    });

    // VIDEO-WÜRFEL (Center Hung Scoreboard) - Wie in echten Arenen
    elements.push(
      <group key="video-cube" position={[0, 35, 0]}>
        {/* Vier Seiten des Video-Cubes */}
        {[0, 1, 2, 3].map(side => (
          <Plane
            key={`video-screen-${side}`}
            args={[15, 8]}
            position={[side === 0 ? 7.5 : side === 2 ? -7.5 : 0, 0, side === 1 ? 7.5 : side === 3 ? -7.5 : 0]}
            rotation={[0, side === 0 ? Math.PI / 2 : side === 2 ? -Math.PI / 2 : side === 1 ? 0 : Math.PI, 0]}
          >
            <meshPhysicalMaterial
              color={new Color(0.1, 0.15, 0.3)}
              emissive={new Color(0.2, 0.4, 0.8)}
              emissiveIntensity={1.8}
            />
          </Plane>
        ))}

        {/* Cube Frame */}
        <RoundedBox args={[16, 9, 16]} radius={0.3}>
          <meshPhysicalMaterial
            color={new Color(0.05, 0.05, 0.05)}
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.3}
          />
        </RoundedBox>
      </group>
    );

    return elements;
  }, [concreteTexture]);

  return <group>{structureElements}</group>;
}

// REALISTISCHE HALLENSTADION TRIBÜNEN - Basierend auf echtem Foto
function StadiumSeats({ onRoomChange }: { onRoomChange?: (room: string) => void }) {
  const seatsRef = useRef<Group>(null);

  // Hallenstadion Zürich Kapazität: ca. 15,000 Zuschauer
  // TRIBÜNEN IN 4 SEKTOREN: NORD, SÜD, OST, WEST
  // Untere Tribüne hat 2 Ausgänge zu den Rooms
  const seatElements = useMemo(() => {
    const elements: JSX.Element[] = [];

    // AUSGÄNGE FÜR ROOMS - Position der 2 Türen in der unteren Tribüne
    // Ausgang 1: Nord-West (45°) -> Welcome, Bandgalerie, Community
    // Ausgang 2: Nord-Ost (315°) -> Contact, Backstage, Ticket
    const exitAngles = [
      Math.PI * 0.75, // Nord-West (135°)
      Math.PI * 0.25, // Nord-Ost (45°)
    ];
    const exitWidth = Math.PI / 10; // Breite jedes Ausgangs

    // Hilfsfunktion: Prüft ob Winkel in Ausgangsbereich liegt
    const isInExitZone = (angle: number, tier: "lower" | "mid" | "upper") => {
      if (tier !== "lower") return false; // Nur untere Tribüne hat Ausgänge

      const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

      for (const exitAngle of exitAngles) {
        const diff = Math.abs(normalizedAngle - exitAngle);
        if (diff < exitWidth / 2 || diff > Math.PI * 2 - exitWidth / 2) {
          return true;
        }
      }
      return false;
    };

    // ============ UNTERE TRIBÜNENEBENE ============
    // 4 Sektoren mit 2 Ausgängen
    const lowerTierSegments = 48;
    const lowerTierRadius = 55; // Noch weiter nach hinten
    const lowerTierHeight = 5;

    for (let i = 0; i < lowerTierSegments; i++) {
      const angle = (i / lowerTierSegments) * Math.PI * 2;

      // Überspringe Segmente an Ausgängen
      if (isInExitZone(angle, "lower")) continue;

      const x = Math.sin(angle) * lowerTierRadius;
      const z = Math.cos(angle) * lowerTierRadius;

      // Sitzreihen in Stufen
      for (let row = 0; row < 8; row++) {
        elements.push(
          <group
            key={`lower-seat-${i}-${row}`}
            position={[x * (1 + row * 0.02), 2 + row * 0.8, z * (1 + row * 0.02)]}
            rotation={[0, angle + Math.PI, 0]}
          >
            <RoundedBox args={[3, 0.4, 0.5]} radius={0.05}>
              <meshPhysicalMaterial color={new Color(0.15, 0.15, 0.18)} roughness={0.8} metalness={0.1} />
            </RoundedBox>
          </group>
        );
      }
    }

    // AUSGANGS-MARKIERUNGEN mit Beleuchtung und Navigation
    exitAngles.forEach((exitAngle, idx) => {
      const x = Math.sin(exitAngle) * lowerTierRadius;
      const z = Math.cos(exitAngle) * lowerTierRadius;

      // Definiere die Rooms für jeden Ausgang - BEIDE haben ALLE Rooms
      const allRooms = ["welcome", "bandgallery", "community", "contact", "backstage", "ticket"];
      const exitRooms = allRooms;

      // Kompaktere Ausgänge für bessere Darstellung
      const exitHeight = 11;
      const exitWidth = 12;

      elements.push(
        <group key={`exit-marker-${idx}`} position={[x, exitHeight / 2 + 1, z]} rotation={[0, exitAngle + Math.PI, 0]}>
          {/* Leuchtender Ausgangs-Bogen - GRÖßER */}
          <Box args={[exitWidth, exitHeight, 0.5]}>
            <meshPhysicalMaterial
              color={new Color(0.1, 0.8, 0.2)}
              emissive={new Color(0, 1, 0)}
              emissiveIntensity={1.5}
              transparent
              opacity={0.8}
            />
          </Box>

          {/* Ausgangs-Titel */}
          <Text
            position={[0, exitHeight / 2 - 0.8, 0.3]}
            fontSize={1.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {idx === 0 ? "AUSGANG 1" : "AUSGANG 2"}
          </Text>

          {/* Klickbare Room-Buttons */}
          {exitRooms.map((room, roomIdx) => {
            const roomLabels: { [key: string]: string } = {
              welcome: "Welcome",
              bandgallery: "Bandgalerie",
              community: "Community",
              contact: "Contact",
              backstage: "Backstage",
              ticket: "Ticket",
            };

            return (
              <Html
                key={`exit-${idx}-room-${room}`}
                position={[0, exitHeight / 2 - 2.5 - roomIdx * 1.3, 0.5]}
                center
                distanceFactor={8}
              >
                <button
                  onClick={() => onRoomChange?.(room)}
                  className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl font-bold text-lg shadow-xl border-2 border-white/30 hover:scale-110 transition-all cursor-pointer whitespace-nowrap"
                  style={{ pointerEvents: "auto" }}
                >
                  → {roomLabels[room]}
                </button>
              </Html>
            );
          })}
        </group>
      );
    });

    // ============ MITTLERE TRIBÜNENEBENE - DURCHGEHEND ============
    const midTierSegments = 60;
    const midTierRadius = 65; // Noch weiter nach hinten
    const midTierHeight = 12;

    for (let i = 0; i < midTierSegments; i++) {
      const angle = (i / midTierSegments) * Math.PI * 2;
      const x = Math.sin(angle) * midTierRadius;
      const z = Math.cos(angle) * midTierRadius;

      for (let row = 0; row < 12; row++) {
        elements.push(
          <group
            key={`mid-seat-${i}-${row}`}
            position={[x * (1 + row * 0.015), midTierHeight + row * 0.7, z * (1 + row * 0.015)]}
            rotation={[0, angle + Math.PI, 0]}
          >
            <RoundedBox args={[3.5, 0.4, 0.5]} radius={0.05}>
              <meshPhysicalMaterial color={new Color(0.12, 0.12, 0.15)} roughness={0.8} metalness={0.1} />
            </RoundedBox>
          </group>
        );
      }
    }

    // ============ OBERE TRIBÜNENEBENE - DURCHGEHEND ============
    const upperTierSegments = 72;
    const upperTierRadius = 75; // Noch weiter nach hinten
    const upperTierHeight = 22;

    for (let i = 0; i < upperTierSegments; i++) {
      const angle = (i / upperTierSegments) * Math.PI * 2;
      const x = Math.sin(angle) * upperTierRadius;
      const z = Math.cos(angle) * upperTierRadius;

      for (let row = 0; row < 10; row++) {
        elements.push(
          <group
            key={`upper-seat-${i}-${row}`}
            position={[x * (1 + row * 0.01), upperTierHeight + row * 0.9, z * (1 + row * 0.01)]}
            rotation={[0, angle + Math.PI, 0]}
          >
            <RoundedBox args={[3.5, 0.4, 0.5]} radius={0.05}>
              <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.13)} roughness={0.8} metalness={0.1} />
            </RoundedBox>
          </group>
        );
      }
    }

    // ============ SEKTOR-TRENNWÄNDE (Nord/Süd/Ost/West) ============
    // Nur bis zur unteren Tribüne - verdeckt NICHT die VIP Lounge
    const sectorAngles = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]; // N, O, S, W

    sectorAngles.forEach((sectorAngle, idx) => {
      const sectorNames = ["NORD", "OST", "SÜD", "WEST"];
      const x = Math.sin(sectorAngle) * 60;
      const z = Math.cos(sectorAngle) * 60;

      elements.push(
        <group key={`sector-divider-${idx}`} position={[x, 6, z]} rotation={[0, sectorAngle, 0]}>
          {/* Trennwand - NUR bis zur unteren Tribüne (Höhe 12m statt 30m) */}
          <Box args={[0.3, 12, 5]}>
            <meshPhysicalMaterial color={new Color(0.2, 0.2, 0.25)} roughness={0.5} metalness={0.6} />
          </Box>

          {/* Sektor-Beschriftung LINKS (von innen gesehen) */}
          <Text
            position={[-2, 5, 0]}
            fontSize={1.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI, 0]}
          >
            {sectorNames[idx]}
          </Text>

          {/* Sektor-Beschriftung RECHTS (von innen gesehen) */}
          <Text
            position={[2, 5, 0]}
            fontSize={1.2}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            rotation={[0, Math.PI, 0]}
          >
            {sectorNames[idx]}
          </Text>
        </group>
      );
    });

    // VIP LOUNGE BEREICH - Glasfassade mit beleuchteten Fenstern
    const vipLoungeHeight = 18;
    elements.push(
      <group key="vip-lounge" position={[0, vipLoungeHeight, 70]}>
        {/* VIP Lounge Hauptstruktur - Dunkler Rahmen */}
        <RoundedBox args={[65, 7, 10]} radius={0.5}>
          <meshPhysicalMaterial
            color={new Color(0.12, 0.1, 0.08)}
            roughness={0.3}
            metalness={0.7}
            emissive={new Color(0.3, 0.25, 0.15)}
            emissiveIntensity={0.4}
          />
        </RoundedBox>

        {/* GLASFENSTER - Große beleuchtete Fenster */}
        {Array.from({ length: 12 }).map((_, i) => (
          <group key={`vip-window-${i}`} position={[(i - 5.5) * 5, 0, 5.5]}>
            {/* Fensterrahmen - Dunkler Metallrahmen */}
            <Box args={[4.5, 5.5, 0.2]} position={[0, 0, 0]}>
              <meshPhysicalMaterial
                color={new Color(0.05, 0.05, 0.06)}
                roughness={0.2}
                metalness={0.95}
                emissive={new Color(0.1, 0.1, 0.15)}
                emissiveIntensity={0.2}
              />
            </Box>

            {/* Leuchtende Glasscheibe - SEHR HELL */}
            <Box args={[4, 5, 0.15]} position={[0, 0, 0.2]}>
              <meshPhysicalMaterial
                color={new Color(1, 0.95, 0.7)}
                emissive={new Color(1, 0.85, 0.5)}
                emissiveIntensity={2.5}
                transparent
                opacity={0.85}
                roughness={0.05}
                metalness={0}
              />
            </Box>

            {/* Fenster-Kreuzstreben - DICK und SICHTBAR */}
            <Box args={[4, 0.15, 0.1]} position={[0, 0, 0.3]}>
              <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.03)} roughness={0.1} metalness={1} />
            </Box>
            <Box args={[0.15, 5, 0.1]} position={[0, 0, 0.3]}>
              <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.03)} roughness={0.1} metalness={1} />
            </Box>

            {/* Lichtquelle hinter jedem Fenster */}
            <pointLight position={[0, 0, -1]} color={new Color(1, 0.9, 0.7)} intensity={15} distance={8} />
          </group>
        ))}

        {/* VIP LOUNGE Schriftzug */}
        <Text
          position={[0, 4.2, 9]}
          fontSize={2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          rotation={[0, Math.PI, 0]}
          outlineWidth={0.15}
          outlineColor="#000000"
        >
          VIP LOUNGE
        </Text>
      </group>
    );

    // TRIBÜNEN-WÄNDE & STRUKTUR - DURCHGEHEND GESCHLOSSEN
    const wallSegments = 48; // Viel mehr Segmente für durchgehende Wände
    const wallRadius = 85; // Angepasst an größere Tribünen
    const wallHeight = 35;

    for (let i = 0; i < wallSegments; i++) {
      const angle = (i / wallSegments) * Math.PI * 2;
      const nextAngle = ((i + 1) / wallSegments) * Math.PI * 2;

      const x = Math.sin(angle) * wallRadius;
      const z = Math.cos(angle) * wallRadius;

      // Berechne die Breite für nahtlose Verbindung
      const segmentWidth = (2 * Math.PI * wallRadius) / wallSegments;

      elements.push(
        <Box
          key={`stadium-wall-${i}`}
          args={[segmentWidth + 0.5, wallHeight, 3]} // +0.5 für Überlappung
          position={[x, wallHeight / 2, z]}
          rotation={[0, angle, 0]}
        >
          <meshPhysicalMaterial color={new Color(0.08, 0.08, 0.1)} roughness={0.9} metalness={0.1} />
        </Box>
      );
    }

    // ZUSÄTZLICHE ÄUSSERE RING-WAND für perfekten Abschluss
    elements.push(
      <Cylinder
        key="outer-ring-wall"
        args={[wallRadius + 1.5, wallRadius + 1.5, wallHeight, 64, 1, true]}
        position={[0, wallHeight / 2, 0]}
      >
        <meshPhysicalMaterial
          color={new Color(0.06, 0.06, 0.08)}
          roughness={0.95}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </Cylinder>
    );

    // PUBLIKUM SIMULATION - Kleine Figuren für Konzert-Atmosphäre
    const crowdCount = 300;
    for (let i = 0; i < crowdCount; i++) {
      const sectionAngle = Math.random() * Math.PI * 2;
      const sectionRadius = 55 + Math.random() * 18; // Nur auf Tribünen, weit hinter der Bühne
      const sectionRow = Math.floor(Math.random() * 15);

      const x = Math.sin(sectionAngle) * sectionRadius;
      const z = Math.cos(sectionAngle) * sectionRadius;
      const y = 2 + sectionRow * 0.7;

      // Überspringe ALLES was irgendwie nahe der LED-Wand ist
      // LED-Wand ist bei z=-47, also nur Publikum mit |z| > 50 erlauben
      if (Math.abs(z) < 52) continue;

      elements.push(
        <group key={`crowd-person-${i}`} position={[x, y, z]} rotation={[0, sectionAngle + Math.PI, 0]}>
          {/* Körper */}
          <Cylinder args={[0.15, 0.2, 0.8]}>
            <meshPhysicalMaterial
              color={new Color(Math.random() * 0.3, Math.random() * 0.3, Math.random() * 0.3)}
              roughness={0.8}
            />
          </Cylinder>
          {/* Kopf */}
          <Sphere args={[0.15]} position={[0, 0.6, 0]}>
            <meshPhysicalMaterial color={new Color(0.6, 0.5, 0.4)} roughness={0.9} />
          </Sphere>
        </group>
      );
    }

    return elements;
  }, []);

  return <group ref={seatsRef}>{seatElements}</group>;
}

// GIANT SCREEN YOUTUBE PLAYER COMPONENT - VEREINFACHTE STEUERUNG
// GIANT SCREEN YOUTUBE PLAYER COMPONENT - VEREINFACHTE STEUERUNG
function GiantScreenYouTubePlayer({
  screenMode,
  currentVideo,
  showVideoSelection,
  setShowVideoSelection,
  setCurrentVideo,
  inputUrl,
  setInputUrl,
}: {
  screenMode: "off" | "youtube" | "live";
  currentVideo: string;
  showVideoSelection: boolean;
  setShowVideoSelection: (show: boolean) => void;
  setCurrentVideo: (video: string) => void;
  inputUrl: string;
  setInputUrl: (url: string) => void;
}) {
  // Beliebte Metal Konzert Videos
  const presetVideos = [
    { id: "CD-E-LDc384", title: "Metallica - Master of Puppets" },
    { id: "X4bgXH3sJ2Q", title: "Iron Maiden - Fear of the Dark" },
    { id: "StZcUAPRRac", title: "Rammstein - Engel" },
    { id: "qw2LU1yS7aw", title: "Slipknot - Duality" },
    { id: "jJ1Qm1Z_D7w", title: "Metallica - Enter Sandman" },
  ];

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  const handleUrlSubmit = () => {
    const videoId = extractVideoId(inputUrl);
    if (videoId) {
      setCurrentVideo(videoId);
      setInputUrl("");
      setShowVideoSelection(false);
    } else {
      alert("⚠️ Bitte gib eine gültige YouTube URL ein!");
    }
  };

  // Wenn Screen AUS ist, zeige nichts (Bühne sichtbar)
  if (screenMode === "off") {
    return null;
  }

  return (
    <Html
      position={[0, 15, -46.5]}
      transform
      distanceFactor={20}
      style={{
        width: "3200px",
        height: "1760px",
        pointerEvents: "auto",
      }}
    >
      <div className="relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* SCREEN CONTENT - YouTube oder Live Event */}
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${currentVideo}?autoplay=${
            screenMode === "live" ? 1 : 0
          }&modestbranding=1&rel=0&showinfo=0`}
          title="Stadium Giant Screen"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />

        {/* LIVE EVENT Banner */}
        {screenMode === "live" && (
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-12 py-4 rounded-full font-bold text-4xl shadow-2xl animate-pulse z-40">
            🔴 LIVE EVENT - JETZT!
          </div>
        )}

        {/* ============ VIDEO AUSWAHL PANEL (nur wenn YouTube aktiv) ============ */}
        {screenMode === "youtube" && showVideoSelection && (
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-16">
            <div className="w-full max-w-7xl space-y-8">
              {/* Title */}
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-white font-bold text-6xl">🎸 VIDEO AUSWAHL</h2>
                <button
                  onClick={() => setShowVideoSelection(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-bold text-2xl"
                >
                  ✕ Schließen
                </button>
              </div>

              {/* URL Input */}
              <div className="flex gap-6 mb-12">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  placeholder="🔗 YouTube URL hier einfügen..."
                  className="flex-1 bg-gray-800 text-white px-8 py-6 rounded-2xl border-4 border-gray-600 focus:border-blue-500 focus:outline-none text-3xl"
                  onKeyPress={e => e.key === "Enter" && handleUrlSubmit()}
                />
                <button
                  onClick={handleUrlSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 rounded-2xl font-bold text-3xl shadow-2xl hover:scale-105 transition-transform"
                >
                  ▶ ABSPIELEN
                </button>
              </div>

              {/* Preset Videos */}
              <div className="grid grid-cols-3 gap-6">
                {presetVideos.map(video => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setCurrentVideo(video.id);
                      setShowVideoSelection(false);
                    }}
                    className={`px-8 py-8 rounded-2xl font-bold text-2xl transition-all hover:scale-105 ${
                      currentVideo === video.id
                        ? "bg-blue-600 text-white shadow-2xl scale-105"
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600 shadow-lg"
                    }`}
                  >
                    {video.title}
                  </button>
                ))}
              </div>

              <p className="text-gray-400 text-2xl text-center mt-8">
                💡 Wähle ein Video oder füge eine eigene YouTube URL ein
              </p>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

// KONZERT-BÜHNE mit Metal Equipment - BASIEREND AUF ECHTEM FOTO
interface MainStageProps {
  screenMode: "off" | "youtube" | "live";
  currentVideo: string;
  showVideoSelection: boolean;
  setShowVideoSelection: (show: boolean) => void;
  setCurrentVideo: (video: string) => void;
  inputUrl: string;
  setInputUrl: (url: string) => void;
}

function MainStage({
  screenMode,
  currentVideo,
  showVideoSelection,
  setShowVideoSelection,
  setCurrentVideo,
  inputUrl,
  setInputUrl,
}: MainStageProps) {
  const stageRef = useRef<Mesh>(null);
  const bandMembersRef = useRef<Group>(null);

  useFrame(state => {
    if (stageRef.current) {
      stageRef.current.position.y = 2.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }

    // Animierte Band-Mitglieder
    if (bandMembersRef.current) {
      bandMembersRef.current.children.forEach((member, i) => {
        member.rotation.y = Math.sin(state.clock.elapsedTime + i) * 0.1;
      });
    }
  });

  return (
    <group>
      {/* HAUPT-BÜHNE - Größer und realistischer */}
      <RoundedBox ref={stageRef} args={[45, 2.5, 20]} radius={0.3} position={[0, 2.5, -35]}>
        <meshPhysicalMaterial color={new Color(0.03, 0.03, 0.05)} roughness={0.3} metalness={0.7} clearcoat={0.8} />
      </RoundedBox>

      {/* BÜHNEN-FRONT - LED-Strip */}
      <Box args={[45, 0.3, 2.5]} position={[0, 1.3, -24.5]}>
        <meshPhysicalMaterial
          color={new Color(0.1, 0.1, 0.8)}
          emissive={new Color(0.3, 0.3, 1.0)}
          emissiveIntensity={2}
        />
      </Box>

      {/* MASSIVE LED-LEINWAND HINTEN - Wie im Foto */}
      <group position={[0, 15, -47]}>
        {/* LED Screen Background - wird vom YouTube Player überdeckt */}
        <Plane args={[40, 22]}>
          <meshPhysicalMaterial
            color={new Color(0.05, 0.1, 0.3)}
            emissive={new Color(0.1, 0.5, 1.0)}
            emissiveIntensity={2.5}
            roughness={0.1}
          />
        </Plane>

        {/* YOUTUBE PLAYER - Interaktiv auf der LED-Leinwand */}
        <GiantScreenYouTubePlayer
          screenMode={screenMode}
          currentVideo={currentVideo}
          showVideoSelection={showVideoSelection}
          setShowVideoSelection={setShowVideoSelection}
          setCurrentVideo={setCurrentVideo}
          inputUrl={inputUrl}
          setInputUrl={setInputUrl}
        />

        {/* LED-Rahmen - Professionell */}
        <RoundedBox args={[42, 2, 1]} radius={0.2} position={[0, 12, -1]}>
          <meshPhysicalMaterial color={new Color(0.08, 0.08, 0.1)} roughness={0.2} metalness={0.9} />
        </RoundedBox>
        <RoundedBox args={[42, 2, 1]} radius={0.2} position={[0, -12, -1]}>
          <meshPhysicalMaterial color={new Color(0.08, 0.08, 0.1)} roughness={0.2} metalness={0.9} />
        </RoundedBox>
        <RoundedBox args={[2, 26, 1]} radius={0.2} position={[21, 0, -1]}>
          <meshPhysicalMaterial color={new Color(0.08, 0.08, 0.1)} roughness={0.2} metalness={0.9} />
        </RoundedBox>
        <RoundedBox args={[2, 26, 1]} radius={0.2} position={[-21, 0, -1]}>
          <meshPhysicalMaterial color={new Color(0.08, 0.08, 0.1)} roughness={0.2} metalness={0.9} />
        </RoundedBox>
      </group>

      {/* BAND-MITGLIEDER AUF DER BÜHNE - Wie im Konzert-Foto */}
      <group ref={bandMembersRef}>
        {/* LEAD GITARRIST - LINKS wie im Foto */}
        <group position={[-12, 4.5, -32]}>
          {/* Körper */}
          <Cylinder args={[0.4, 0.5, 1.8]}>
            <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.08)} />
          </Cylinder>
          {/* Kopf */}
          <Sphere args={[0.4]} position={[0, 1.3, 0]}>
            <meshPhysicalMaterial color={new Color(0.5, 0.4, 0.3)} />
          </Sphere>
          {/* Gitarre */}
          <RoundedBox args={[0.3, 1.5, 0.1]} radius={0.05} position={[0.5, 0, 0.3]} rotation={[0, -0.3, 0]}>
            <meshPhysicalMaterial color={new Color(0.8, 0.1, 0.1)} metalness={0.8} roughness={0.2} />
          </RoundedBox>
        </group>

        {/* BASS GITARRIST - RECHTS wie im Foto */}
        <group position={[8, 4.5, -35]}>
          <Cylinder args={[0.4, 0.5, 1.8]}>
            <meshPhysicalMaterial color={new Color(0.08, 0.05, 0.1)} />
          </Cylinder>
          <Sphere args={[0.4]} position={[0, 1.3, 0]}>
            <meshPhysicalMaterial color={new Color(0.5, 0.4, 0.3)} />
          </Sphere>
          <RoundedBox args={[0.25, 1.6, 0.1]} radius={0.05} position={[-0.5, 0, 0.3]} rotation={[0, 0.3, 0]}>
            <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.1)} metalness={0.7} roughness={0.3} />
          </RoundedBox>
        </group>

        {/* SCHLAGZEUGER - HINTEN MITTE */}
        <group position={[0, 5, -42]}>
          <Cylinder args={[0.4, 0.5, 1.6]}>
            <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.05)} />
          </Cylinder>
          <Sphere args={[0.35]} position={[0, 1.2, 0]}>
            <meshPhysicalMaterial color={new Color(0.5, 0.4, 0.3)} />
          </Sphere>
        </group>

        {/* SÄNGER/FRONTMAN - VORNE MITTE */}
        <group position={[0, 4.5, -28]}>
          <Cylinder args={[0.45, 0.55, 1.9]}>
            <meshPhysicalMaterial color={new Color(0.1, 0.05, 0.05)} />
          </Cylinder>
          <Sphere args={[0.42]} position={[0, 1.4, 0]}>
            <meshPhysicalMaterial color={new Color(0.5, 0.4, 0.35)} />
          </Sphere>
          {/* Mikrofon */}
          <Cylinder args={[0.05, 0.05, 2]} position={[0, -0.5, 0.8]} rotation={[0.3, 0, 0]}>
            <meshPhysicalMaterial color={new Color(0.6, 0.6, 0.65)} metalness={0.9} roughness={0.1} />
          </Cylinder>
          <Sphere args={[0.15]} position={[0, 1, 1.5]}>
            <meshPhysicalMaterial color={new Color(0.3, 0.3, 0.35)} metalness={0.8} roughness={0.3} />
          </Sphere>
        </group>
      </group>

      {/* SCHLAGZEUG-SET */}
      <group position={[0, 4, -42]}>
        {/* Bass Drum */}
        <Cylinder args={[1.2, 1.2, 0.6]} rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
          <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.15)} metalness={0.6} roughness={0.4} />
        </Cylinder>

        {/* Snare Drum */}
        <Cylinder args={[0.4, 0.4, 0.2]} position={[-0.8, 0.5, 0.5]}>
          <meshPhysicalMaterial color={new Color(0.8, 0.8, 0.85)} metalness={0.9} roughness={0.1} />
        </Cylinder>

        {/* Toms */}
        <Cylinder args={[0.35, 0.35, 0.25]} position={[0.3, 0.8, 0]}>
          <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.15)} metalness={0.6} roughness={0.4} />
        </Cylinder>
        <Cylinder args={[0.4, 0.4, 0.3]} position={[0.9, 0.7, 0]}>
          <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.15)} metalness={0.6} roughness={0.4} />
        </Cylinder>

        {/* Cymbals */}
        <Cylinder args={[0.5, 0.5, 0.02]} position={[-1.2, 1.5, 0]}>
          <meshPhysicalMaterial color={new Color(0.9, 0.85, 0.3)} metalness={1} roughness={0.2} />
        </Cylinder>
        <Cylinder args={[0.45, 0.45, 0.02]} position={[0.7, 1.6, -0.3]}>
          <meshPhysicalMaterial color={new Color(0.9, 0.85, 0.3)} metalness={1} roughness={0.2} />
        </Cylinder>
      </group>

      {/* VERSTÄRKER-WÄNDE (Marshall-Style) */}
      {[-18, 18].map((x, i) => (
        <group key={`amp-wall-${i}`} position={[x, 5, -42]}>
          {/* Stack von Verstärkern */}
          {Array.from({ length: 6 }).map((_, row) =>
            Array.from({ length: 2 }).map((_, col) => (
              <RoundedBox
                key={`amp-${row}-${col}`}
                args={[2, 1.2, 1]}
                radius={0.05}
                position={[col * 2.2 - 1.1, row * 1.3, 0]}
              >
                <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.05)} roughness={0.8} metalness={0.2} />
              </RoundedBox>
            ))
          )}
        </group>
      ))}

      {/* PROFI-LICHTGESTELL (TRUSS-SYSTEM) */}
      <TrussLightingRig />

      {/* LASER-SYSTEM */}
      <LaserSystem />

      {/* PROFESSIONELLE BOX-SYSTEME */}
      <ProfessionalSoundSystem />

      {/* PYROTECHNIK-EFFEKTE */}
      <group position={[0, 4, -25]}>
        {[-15, -8, 0, 8, 15].map((x, i) => (
          <Cone key={`pyro-${i}`} args={[0.4, 3, 8]} position={[x, 0, 0]}>
            <meshPhysicalMaterial
              color={new Color(1, 0.3, 0.1)}
              emissive={new Color(1, 0.4, 0.0)}
              emissiveIntensity={1.5}
              transparent
              opacity={0.7}
            />
          </Cone>
        ))}
      </group>

      {/* BÜHNEN-TEXT */}
      <Float speed={1} rotationIntensity={0.1}>
        <Text
          position={[0, 18, -46]}
          fontSize={4}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.3}
          outlineColor="#ff0033"
          renderOrder={999}
        >
          🔴 LIVE IN ZÜRICH
        </Text>
      </Float>
    </group>
  );
}

// PROFESSIONELLES LICHTGESTELL - TRUSS SYSTEM
function TrussLightingRig() {
  const trussRef = useRef<Group>(null);

  useFrame(state => {
    if (trussRef.current) {
      trussRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  const trussElements = useMemo(() => {
    const elements: JSX.Element[] = [];

    // HAUPTTRÄGER - Horizontal über Bühne
    const mainTrussPositions = [
      [-12, 0, 0],
      [0, 0, 0],
      [12, 0, 0],
    ];

    mainTrussPositions.forEach((pos, i) => {
      elements.push(
        <group key={`main-truss-${i}`} position={[pos[0], 18, -25 + pos[2]]}>
          {/* Haupt-Truss-Balken */}
          <RoundedBox args={[20, 0.4, 0.4]} radius={0.05}>
            <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.12)} metalness={0.9} roughness={0.1} clearcoat={1} />
          </RoundedBox>

          {/* Verstrebungen */}
          <RoundedBox args={[0.2, 3, 0.2]} radius={0.02} position={[-8, 1.8, 0]}>
            <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.12)} metalness={0.9} roughness={0.1} />
          </RoundedBox>
          <RoundedBox args={[0.2, 3, 0.2]} radius={0.02} position={[8, 1.8, 0]}>
            <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.12)} metalness={0.9} roughness={0.1} />
          </RoundedBox>

          {/* Moving Head Lights */}
          {[-6, -2, 2, 6].map((x, idx) => (
            <group key={`moving-head-${i}-${idx}`} position={[x, -1.5, 0]}>
              <Cylinder args={[0.3, 0.25, 0.8]}>
                <meshPhysicalMaterial
                  color={new Color(0.05, 0.05, 0.05)}
                  metalness={0.8}
                  roughness={0.2}
                  emissive={new Color(0.2, 0.1, 0.8)}
                  emissiveIntensity={0.3}
                />
              </Cylinder>
              <Sphere args={[0.15]} position={[0, -0.5, 0]}>
                <meshPhysicalMaterial
                  color={new Color(0.9, 0.9, 0.95)}
                  emissive={new Color(1, 0.3, 0.1)}
                  emissiveIntensity={2}
                />
              </Sphere>
            </group>
          ))}
        </group>
      );
    });

    // SEITLICHE TÜRME
    [-15, 15].forEach((x, i) => {
      elements.push(
        <group key={`side-tower-${i}`} position={[x, 12, -25]}>
          {/* Turm-Struktur */}
          <RoundedBox args={[0.6, 12, 0.6]} radius={0.05}>
            <meshPhysicalMaterial color={new Color(0.08, 0.08, 0.1)} metalness={0.9} roughness={0.1} />
          </RoundedBox>

          {/* LED-Panels an Türmen */}
          {[0, 3, 6, 9].map((y, idx) => (
            <Plane
              key={`led-panel-${i}-${idx}`}
              args={[2, 1.5]}
              position={[x > 0 ? -0.4 : 0.4, y - 4, 0]}
              rotation={[0, x > 0 ? Math.PI / 4 : -Math.PI / 4, 0]}
            >
              <meshPhysicalMaterial
                color={new Color(0.1, 0.3, 1)}
                emissive={new Color(0.2, 0.5, 1)}
                emissiveIntensity={1.5}
                transparent
                opacity={0.9}
              />
            </Plane>
          ))}
        </group>
      );
    });

    return elements;
  }, []);

  return <group ref={trussRef}>{trussElements}</group>;
}

// LASER-SYSTEM
function LaserSystem() {
  const laserRef = useRef<Group>(null);

  useFrame(state => {
    const time = state.clock.elapsedTime;
    if (laserRef.current) {
      laserRef.current.children.forEach((child, i) => {
        if (child.type === "Group") {
          child.rotation.y = time * (0.5 + i * 0.2);
          child.rotation.x = Math.sin(time * 0.3 + i) * 0.3;
        }
      });
    }
  });

  const laserElements = useMemo(() => {
    const lasers: JSX.Element[] = [];

    // HAUPT-LASER-ARRAY
    const laserPositions: [number, number, number][] = [
      [-10, 22, -30],
      [0, 22, -30],
      [10, 22, -30],
      [-8, 16, -35],
      [8, 16, -35],
    ];

    laserPositions.forEach((pos, i) => {
      lasers.push(
        <group key={`laser-unit-${i}`} position={pos}>
          {/* Laser-Gehäuse */}
          <RoundedBox args={[1.2, 0.8, 1.5]} radius={0.1}>
            <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.02)} metalness={0.9} roughness={0.1} />
          </RoundedBox>

          {/* Laser-Strahlen */}
          {Array.from({ length: 8 }).map((_, j) => {
            const angle = (j / 8) * Math.PI * 2;
            const distance = 40;
            return (
              <group key={`laser-beam-${i}-${j}`} rotation={[0, angle, 0]}>
                <Cylinder args={[0.02, 0.01, distance]} position={[0, 0, -distance / 2]} rotation={[Math.PI / 2, 0, 0]}>
                  <meshPhysicalMaterial
                    color={new Color(1, 0.1, 0.1)}
                    emissive={new Color(1, 0.2, 0.2)}
                    emissiveIntensity={3}
                    transparent
                    opacity={0.8}
                  />
                </Cylinder>

                {/* Laser-Endpoint-Glow */}
                <Sphere args={[0.1]} position={[0, 0, -distance]}>
                  <meshPhysicalMaterial
                    color={new Color(1, 0.3, 0.3)}
                    emissive={new Color(1, 0.1, 0.1)}
                    emissiveIntensity={4}
                    transparent
                    opacity={0.6}
                  />
                </Sphere>
              </group>
            );
          })}
        </group>
      );
    });

    // BODEN-LASER
    [-20, -10, 0, 10, 20].forEach((x, i) => {
      lasers.push(
        <group key={`floor-laser-${i}`} position={[x, 4, -20]}>
          <Cylinder args={[0.15, 0.15, 0.8]}>
            <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.05)} metalness={0.9} roughness={0.1} />
          </Cylinder>

          {/* Vertikaler Laser-Strahl */}
          <Cylinder args={[0.03, 0.01, 25]} position={[0, 12.5, 0]}>
            <meshPhysicalMaterial
              color={new Color(0.1, 1, 0.1)}
              emissive={new Color(0.2, 1, 0.2)}
              emissiveIntensity={2.5}
              transparent
              opacity={0.7}
            />
          </Cylinder>
        </group>
      );
    });

    return lasers;
  }, []);

  return <group ref={laserRef}>{laserElements}</group>;
}

// PROFESSIONELLE BOX-SYSTEME
function ProfessionalSoundSystem() {
  const soundRef = useRef<Group>(null);

  useFrame(state => {
    if (soundRef.current) {
      const bass = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      soundRef.current.children.forEach((child, i) => {
        if (child.userData.isSubwoofer) {
          child.scale.setScalar(1 + bass);
        }
      });
    }
  });

  const soundElements = useMemo(() => {
    const elements: JSX.Element[] = [];

    // LINE-ARRAY SYSTEME
    [-25, 25].forEach((x, side) => {
      // Haupt-PA Tower
      const paElements = [];
      for (let i = 0; i < 8; i++) {
        paElements.push(
          <RoundedBox key={`pa-box-${side}-${i}`} args={[1.2, 0.8, 1.0]} radius={0.08} position={[0, i * 0.9, 0]}>
            <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.02)} metalness={0.1} roughness={0.8} />
          </RoundedBox>
        );

        // Lautsprecher-Membranen
        paElements.push(
          <Cylinder key={`speaker-${side}-${i}`} args={[0.25, 0.25, 0.05]} position={[0, i * 0.9, 0.5]}>
            <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.1)} metalness={0.3} roughness={0.7} />
          </Cylinder>
        );
      }

      elements.push(
        <group key={`pa-system-${side}`} position={[x, 10, -20]}>
          {paElements}
        </group>
      );

      // SUBWOOFER-ARRAYS
      for (let sub = 0; sub < 4; sub++) {
        elements.push(
          <group key={`sub-array-${side}-${sub}`} position={[x + (side === 0 ? 3 : -3), 2.5, -18 + sub * 2]}>
            <RoundedBox args={[2, 1.8, 1.8]} radius={0.1} userData={{ isSubwoofer: true }}>
              <meshPhysicalMaterial color={new Color(0.01, 0.01, 0.01)} metalness={0.1} roughness={0.9} />
            </RoundedBox>

            {/* Massive Sub-Woofer */}
            <Cylinder args={[0.6, 0.6, 0.1]} position={[0, 0, 0.9]}>
              <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.05)} metalness={0.4} roughness={0.8} />
            </Cylinder>
          </group>
        );
      }
    });

    // MONITOR-BOXEN auf der Bühne
    [-8, -3, 3, 8].forEach((x, i) => {
      elements.push(
        <group key={`monitor-${i}`} position={[x, 4.2, -18]}>
          <RoundedBox args={[1.5, 0.8, 1.2]} radius={0.08} rotation={[-Math.PI / 6, 0, 0]}>
            <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.02)} metalness={0.1} roughness={0.8} />
          </RoundedBox>

          <Cylinder args={[0.2, 0.2, 0.05]} position={[0, 0, 0.6]}>
            <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.1)} metalness={0.3} roughness={0.7} />
          </Cylinder>
        </group>
      );
    });

    // DELAY-TOWERS im Stadium
    const delayPositions: [number, number, number][] = [
      [0, 15, 10],
      [-30, 15, 0],
      [30, 15, 0],
    ];

    delayPositions.forEach((pos, i) => {
      elements.push(
        <group key={`delay-tower-${i}`} position={pos}>
          {/* Tower Structure */}
          <RoundedBox args={[0.8, 8, 0.8]} radius={0.05}>
            <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.05)} metalness={0.7} roughness={0.3} />
          </RoundedBox>

          {/* Delay Speakers */}
          {[0, 2, 4].map((y, idx) => (
            <RoundedBox key={`delay-speaker-${i}-${idx}`} args={[1.0, 0.6, 0.8]} radius={0.06} position={[0, y - 2, 0]}>
              <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.02)} metalness={0.1} roughness={0.8} />
            </RoundedBox>
          ))}
        </group>
      );
    });

    return elements;
  }, []);

  return <group ref={soundRef}>{soundElements}</group>;
}

// AUTHENTIC METAL CONCERT LIGHTING - Basiert auf echtem Konzert-Foto
function StadiumLighting() {
  return (
    <group>
      {/* DRAMATISCHE HAUPT-SPOTS wie im Foto - Starkes weißes Licht von oben */}
      <spotLight
        position={[0, 45, 0]}
        angle={Math.PI / 1.2}
        penumbra={0.1}
        intensity={20}
        color={new Color(1.0, 0.95, 0.9)}
        castShadow
        shadow-mapSize={[8192, 8192]}
      />

      {/* SEITLICHE HAUPT-SPOTS für dramatische Schatten */}
      {[-25, 25].map((x, i) => (
        <spotLight
          key={`main-side-spot-${i}`}
          position={[x, 40, -20]}
          angle={Math.PI / 3}
          penumbra={0.2}
          intensity={15}
          color={new Color(1, 0.9, 0.85)}
          target-position={[0, 3, -35]}
          castShadow
        />
      ))}

      {/* PYROTECHNIK-BELEUCHTUNG - Oranges Feuer-Licht */}
      {[-20, -10, 0, 10, 20].map((x, i) => (
        <pointLight
          key={`pyro-light-${i}`}
          position={[x, 8, -25]}
          intensity={20}
          color={new Color(1, 0.4, 0.1)}
          distance={30}
          decay={2}
        />
      ))}

      {/* BÜHNEN-SPOTS - Intensive Farben wie im echten Konzert */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = (i - 7.5) * 5;
        const colors = [
          new Color(1, 0.1, 0.1), // Rot
          new Color(0.1, 0.1, 1), // Blau
          new Color(1, 1, 0.1), // Gelb
          new Color(1, 0.1, 1), // Magenta
          new Color(0.1, 1, 0.1), // Grün
          new Color(1, 0.5, 0.1), // Orange
          new Color(0.5, 0.1, 1), // Lila
          new Color(0.1, 1, 1), // Cyan
        ];
        return (
          <spotLight
            key={`stage-spot-${i}`}
            position={[x, 28, -32]}
            angle={Math.PI / 5}
            penumbra={0.3}
            intensity={12}
            color={colors[i % colors.length]}
            target-position={[x * 0.3, 3, -35]}
          />
        );
      })}

      {/* LED-WAND RÜCKLICHT - Blaues Glow von der LED-Wand */}
      {[-20, -10, 0, 10, 20].map((x, i) => (
        <pointLight
          key={`led-backlight-${i}`}
          position={[x, 15, -48]}
          intensity={8}
          color={new Color(0.1, 0.4, 1.0)}
          distance={25}
        />
      ))}

      {/* TRIBÜNEN-BELEUCHTUNG - Gedimmt für Konzert-Atmosphäre */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const x = Math.sin(angle) * 75;
        const z = Math.cos(angle) * 75;
        return (
          <spotLight
            key={`audience-light-${i}`}
            position={[x, 38, z]}
            angle={Math.PI / 2.5}
            penumbra={0.7}
            intensity={2}
            color={new Color(0.4, 0.4, 0.6)}
            target-position={[x * 0.6, 8, z * 0.6]}
          />
        );
      })}

      {/* VIP LOUNGE BELEUCHTUNG - Warmes Licht */}
      {Array.from({ length: 6 }).map((_, i) => (
        <pointLight
          key={`vip-light-${i}`}
          position={[(i - 2.5) * 10, 18, 70]}
          intensity={5}
          color={new Color(1, 0.85, 0.6)}
          distance={15}
        />
      ))}

      {/* BODEN-SPOT-LICHTER für Bühne */}
      {[-15, -8, 0, 8, 15].map((x, i) => (
        <spotLight
          key={`floor-spot-${i}`}
          position={[x, 0.5, -22]}
          angle={Math.PI / 4}
          penumbra={0.4}
          intensity={8}
          color={new Color(1, 0.8, 0.9)}
          target-position={[x * 0.5, 6, -35]}
        />
      ))}

      {/* LASER-BEAM LICHTER */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <spotLight
            key={`laser-beam-light-${i}`}
            position={[0, 25, -30]}
            angle={0.05}
            penumbra={0}
            intensity={15}
            color={new Color(1, 0.1, 0.1)}
            target-position={[Math.sin(angle) * 40, 10, -30 + Math.cos(angle) * 40]}
          />
        );
      })}

      {/* AMBIENTE - Sehr dunkel für Metal-Atmosphäre wie im Foto */}
      <ambientLight intensity={0.08} color={new Color(0.15, 0.15, 0.25)} />

      {/* ATMOSPHÄRISCHE BELEUCHTUNG durch Nebel */}
      <directionalLight
        position={[60, 50, 50]}
        intensity={1.2}
        color={new Color(0.7, 0.7, 0.9)}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={350}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />

      {/* HINTERGRUND-FILL-LICHT für sanfte Schatten */}
      <hemisphereLight args={[new Color(0.2, 0.2, 0.3), new Color(0.05, 0.05, 0.08), 0.5]} />
    </group>
  );
}

interface StadionRoomProps {
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
  onFullscreen?: () => void;
}

// HALLENSTADION ZÜRICH - Hauptkomponente
export default function StadionRoom({ onRoomChange, isFullscreen = false, onFullscreen }: StadionRoomProps) {
  const [controlMode, setControlMode] = useState<"fps" | "orbit">("fps");

  // Giant Screen Control States
  const [screenMode, setScreenMode] = useState<"off" | "youtube" | "live">("youtube");
  const [currentVideo, setCurrentVideo] = useState("CD-E-LDc384");
  const [inputUrl, setInputUrl] = useState("");
  const [showVideoSelection, setShowVideoSelection] = useState(false);

  // 🎥 LIVE WEBCAM STATES - NEW FEATURE
  const [webcamUsers, setWebcamUsers] = useState<any[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const cameraRef = useRef<THREE.Camera>(null);

  const liveEventUrl = "dQw4w9WgXcQ";

  const handleControlMode = useCallback((mode: "fps" | "orbit") => {
    setControlMode(mode);
  }, []);

  const handleRoomChange = useCallback(() => {
    onRoomChange?.("welcome");
  }, [onRoomChange]);

  // 🎥 WEBCAM HANDLERS - NEW FEATURE
  const handleWebcamUsersUpdate = useCallback((users: any[]) => {
    setWebcamUsers(users);
  }, []);

  const handleLiveEvent = () => {
    setScreenMode("live");
    setCurrentVideo(liveEventUrl);
    setShowVideoSelection(false);
  };

  const handleYouTubeMode = () => {
    setScreenMode("youtube");
    setShowVideoSelection(true);
  };

  const handleScreenOff = () => {
    setScreenMode("off");
    setShowVideoSelection(false);
  };

  return (
    <RoomAccessControl
      requiredAccess="stadiumArena"
      roomName="Hallenstadion Zürich"
      roomDescription="Das Hallenstadion ist nur mit einem gültigen Konzert-Ticket zugänglich"
    >
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 bg-black"
            : "w-full h-64 sm:h-80 lg:h-96 bg-black rounded-lg overflow-hidden shadow-2xl border border-gray-800"
        }
      >
        {/* CONTROL PANEL - 2D OVERLAY oben links */}
        <div className="absolute top-4 left-4 z-50 flex flex-col gap-3 max-w-md">
          {/* Haupt-Control-Buttons */}
          <div className="flex gap-3 bg-black/90 backdrop-blur-md p-3 rounded-xl border-2 border-white/20">
            <button
              onClick={handleLiveEvent}
              className={`px-6 py-3 rounded-lg font-bold text-sm shadow-lg border-2 transition-all ${
                screenMode === "live"
                  ? "bg-red-600 text-white border-white/50 scale-105"
                  : "bg-red-600/70 hover:bg-red-600 text-white border-white/30"
              }`}
            >
              🔴 LIVE EVENT
            </button>

            <button
              onClick={handleYouTubeMode}
              className={`px-6 py-3 rounded-lg font-bold text-sm shadow-lg border-2 transition-all ${
                screenMode === "youtube"
                  ? "bg-blue-600 text-white border-white/50 scale-105"
                  : "bg-blue-600/70 hover:bg-blue-600 text-white border-white/30"
              }`}
            >
              ▶ YOUTUBE
            </button>

            <button
              onClick={handleScreenOff}
              className={`px-6 py-3 rounded-lg font-bold text-sm shadow-lg border-2 transition-all ${
                screenMode === "off"
                  ? "bg-gray-800 text-white border-green-500/70 scale-105"
                  : "bg-gray-800/70 hover:bg-gray-800 text-white border-white/30"
              }`}
            >
              ✕ SCREEN AUS
            </button>
          </div>

          {/* Status Anzeige */}
          {screenMode === "off" && (
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm text-center shadow-lg">
              🎸 Bühne ist sichtbar
            </div>
          )}

          {/* VIDEO AUSWAHL PANEL */}
          {showVideoSelection && screenMode === "youtube" && (
            <div className="bg-black/95 backdrop-blur-md p-4 rounded-xl border-2 border-blue-500/50 shadow-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-bold text-lg">🎸 VIDEO AUSWAHL</h3>
                <button
                  onClick={() => setShowVideoSelection(false)}
                  className="text-white hover:text-red-500 font-bold text-xl transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* URL Input */}
              <div className="mb-3">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={e => setInputUrl(e.target.value)}
                  placeholder="🔗 YouTube URL hier einfügen..."
                  className="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
                <button
                  onClick={() => {
                    if (inputUrl) {
                      const videoId = inputUrl.split("v=")[1]?.split("&")[0] || inputUrl.split("/").pop();
                      if (videoId) {
                        setCurrentVideo(videoId);
                        setShowVideoSelection(false);
                      }
                    }
                  }}
                  className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
                >
                  ▶ ABSPIELEN
                </button>
              </div>

              {/* Vordefinierte Videos */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[
                  { title: "Metallica - Master of Puppets", id: "xnKhsTXoKCI" },
                  {
                    title: "Iron Maiden - Fear of the Dark",
                    id: "v5EDTJmOpF8",
                  },
                  { title: "Rammstein - Engel", id: "x2rQzv8OWEY" },
                  { title: "Slipknot - Duality", id: "6Xmq7BgUjqw" },
                  { title: "Metallica - Enter Sandman", id: "CD-E-LDc384" },
                ].map(video => (
                  <button
                    key={video.id}
                    onClick={() => {
                      setCurrentVideo(video.id);
                      setShowVideoSelection(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg text-left font-semibold text-sm transition-all ${
                      currentVideo === video.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {video.title}
                  </button>
                ))}
              </div>

              <p className="text-gray-400 text-xs text-center mt-3">
                💡 Wähle ein Video oder füge eine eigene YouTube URL ein
              </p>
            </div>
          )}
        </div>

        <WebGLCanvasWrapper
          roomName="Metal Arena Stadium"
          roomIcon="🏟️"
          onRoomChange={onRoomChange}
          isFullscreen={isFullscreen}
        >
          <Canvas
            shadows
            camera={{
              position: [0, 12, 55],
              fov: 70,
              near: 0.1,
              far: 400,
            }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2,
            }}
            dpr={[1, 2]}
            onCreated={state => {
              console.log("Stadium Canvas created successfully with WebGL context");
            }}
            style={{
              background: "linear-gradient(to bottom, #000000, #0a0a0f, #050510)",
            }}
          >
            {/* UMGEBUNG - Metal Concert Atmosphere */}
            <Environment preset="night" background={false} />
            <fog attach="fog" args={[new Color(0.02, 0.02, 0.05), 40, 200]} />

            {/* BELEUCHTUNG */}
            <StadiumLighting />

            {/* STADIUM-STRUKTUR */}
            <StadiumStructure
              onRoomChange={onRoomChange ? () => onRoomChange("welcome") : undefined}
              handleRoomChange={handleRoomChange}
            />
            <StadiumSeats onRoomChange={onRoomChange} />
            <MainStage
              screenMode={screenMode}
              currentVideo={currentVideo}
              showVideoSelection={showVideoSelection}
              setShowVideoSelection={setShowVideoSelection}
              setCurrentVideo={setCurrentVideo}
              inputUrl={inputUrl}
              setInputUrl={setInputUrl}
            />
            <StageLights />

            {/* 🎥 LIVE WEBCAM DISPLAY - NEW FEATURE (non-intrusive) */}
            <StadiumWebcamDisplay
              webcamUsers={webcamUsers}
              scene={sceneRef.current}
              camera={cameraRef.current}
              renderer={rendererRef.current}
            />

            {/* ATMOSPHÄRISCHE EFFEKTE - Wie beim echten Konzert */}

            {/* SPARKLES für Konzert-Atmosphäre */}
            <Sparkles
              count={200}
              scale={[80, 40, 80]}
              size={2}
              speed={0.3}
              opacity={0.6}
              color={new Color(1, 0.8, 0.4)}
              position={[0, 15, 0]}
            />

            {/* BÜHNEN-NEBEL SIMULATION */}
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = (i / 30) * Math.PI * 2;
              const radius = 15 + Math.random() * 10;
              return (
                <Sphere
                  key={`fog-particle-${i}`}
                  args={[1 + Math.random() * 2]}
                  position={[Math.sin(angle) * radius, 1 + Math.random() * 3, -35 + Math.cos(angle) * radius]}
                >
                  <meshPhysicalMaterial color={new Color(0.3, 0.3, 0.4)} transparent opacity={0.1} depthWrite={false} />
                </Sphere>
              );
            })}

            {/* KONTAKT-SCHATTEN */}
            <ContactShadows
              position={[0, -0.1, 0]}
              scale={150}
              blur={2.5}
              far={60}
              opacity={0.7}
              color={new Color(0.03, 0.03, 0.05)}
            />

            {/* STADIUM-TITEL */}
            <Float speed={0.6} rotationIntensity={0.05} floatIntensity={0.2}>
              <Text
                position={[0, 38, 20]}
                fontSize={4.5}
                color={new Color(1.0, 0.3, 0.0)}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.15}
                outlineColor={new Color(0, 0, 0)}
              >
                🏟️ HALLENSTADION ZÜRICH 🏟️
              </Text>
            </Float>

            <Text
              position={[0, 32, 20]}
              fontSize={2}
              color={new Color(0.9, 0.9, 1.0)}
              anchorX="center"
              anchorY="middle"
            >
              FOTOREALISTISCHES 3D KONZERT-ERLEBNIS
            </Text>

            {/* LIVE INDICATOR */}
            <Float speed={2} floatIntensity={0.5}>
              <Text
                position={[0, 22, -46]}
                fontSize={2.5}
                color={new Color(1, 0, 0)}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.1}
                outlineColor={new Color(1, 1, 1)}
              >
                ● LIVE NOW
              </Text>
            </Float>

            {/* STERNEN-HIMMEL */}
            <Stars radius={200} depth={150} count={500} factor={4} saturation={0.1} fade speed={0.2} />

            {/* BEWEGUNGSSTEUERUNG */}
            {controlMode === "fps" ? (
              <FPSControls
                movementSpeed={12}
                lookSpeed={0.002}
                boundaries={{ minX: -95, maxX: 95, minZ: -95, maxZ: 95 }}
              />
            ) : (
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                enableRotate={true}
                maxDistance={180}
                minDistance={10}
                maxPolarAngle={Math.PI / 2.1}
                minPolarAngle={Math.PI / 8}
                enableDamping={true}
                dampingFactor={0.05}
                target={[0, 10, -20]}
                maxAzimuthAngle={Math.PI * 2}
                minAzimuthAngle={-Math.PI * 2}
              />
            )}

            {/* EXIT DOOR INSTRUCTIONS */}
            {onRoomChange && (
              <Html position={[0, 8, 40]} center distanceFactor={12}>
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-center">
                  <h3 className="text-white font-bold mb-2">🚪 Navigation</h3>
                  <p className="text-gray-300 text-xs mb-2">🛡️ Kollision aktiv - Boden sicher</p>
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleControlMode("fps")}
                      className={`px-3 py-1 rounded text-sm ${
                        controlMode === "fps" ? "bg-red-500 text-white" : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      🏃 FPS (WASD)
                    </button>
                    <button
                      onClick={() => handleControlMode("orbit")}
                      className={`px-3 py-1 rounded text-sm ${
                        controlMode === "orbit" ? "bg-red-500 text-white" : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      🎥 Orbit
                    </button>
                  </div>
                  {onFullscreen && (
                    <button
                      onClick={onFullscreen}
                      className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white w-full mb-2"
                      title={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
                    >
                      {isFullscreen ? "📱 Normal" : "🖥️ Vollbild"}
                    </button>
                  )}
                  <p className="text-green-400 text-sm font-bold mb-2">🚪 Klicke auf EXIT-Türen zum Verlassen</p>
                  <p className="text-yellow-400 text-xs font-bold">🔴 LIVE KONZERT Button auf Giant Screen!</p>
                </div>
              </Html>
            )}
          </Canvas>
        </WebGLCanvasWrapper>

        {/* 🎥 LIVE WEBCAM INTEGRATION - NEW FEATURE */}
        <LiveWebcamIntegration isInStadium={true} onWebcamUsersUpdate={handleWebcamUsersUpdate} />

        {/* Fullscreen Exit Button */}
        {isFullscreen && (
          <button
            onClick={handleRoomChange}
            className="absolute top-4 right-4 z-60 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
          >
            ✕ Exit Fullscreen
          </button>
        )}
      </div>
    </RoomAccessControl>
  );
}
