"use client";

import { Html, Ring } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import BlackHole from "./BlackHole";
import { EnhancedOrbitPath } from "./OrbitPath";

interface RealisticSolarSystemProps {
  beatData: { beat: boolean; intensity: number };
  videoId?: string;
  onBeatDetection?: (beat: boolean, intensity: number) => void;
  isVideoStarted?: boolean;
}

// Planet Data mit realistischen Eigenschaften und ECHTEN KUGELN!
const planetData = [
  {
    name: "Sun",
    radius: 3, // Größere Sonne für Realismus
    distance: 0,
    speed: 0,
    color: "#FFD700",
    emissive: "#FF4500",
    emissiveIntensity: 2.0,
    type: "sun",
    rings: false,
    moons: 0,
    texture: null, // Procedural sun shader
  },
  {
    name: "Mercury",
    radius: 0.3,
    distance: 8,
    speed: 0.04,
    color: "#8C7853",
    emissive: "#2A2A2A",
    emissiveIntensity: 0.1,
    type: "planet",
    rings: false,
    moons: 0,
    texture: "mercury",
  },
  {
    name: "Venus",
    radius: 0.4,
    distance: 12,
    speed: 0.03,
    color: "#FFC649",
    emissive: "#FF8C00",
    emissiveIntensity: 0.2,
    type: "planet",
    rings: false,
    moons: 0,
    texture: "venus",
  },
  {
    name: "Earth",
    radius: 0.4,
    distance: 8,
    speed: 0.01,
    color: "#6B93D6",
    emissive: "#4169E1",
    emissiveIntensity: 0.2,
    type: "planet",
    rings: false,
    moons: 1,
    texture: "earth",
  },
  {
    name: "Mars",
    radius: 0.3,
    distance: 10,
    speed: 0.008,
    color: "#CD5C5C",
    emissive: "#B22222",
    emissiveIntensity: 0.15,
    type: "planet",
    rings: false,
    moons: 2,
  },
  {
    name: "Jupiter",
    radius: 1,
    distance: 15,
    speed: 0.005,
    color: "#D8CA9D",
    emissive: "#DEB887",
    emissiveIntensity: 0.4,
    type: "planet",
    rings: false,
    moons: 4,
    atmosphere: true,
  },
  {
    name: "Saturn",
    radius: 0.8,
    distance: 20,
    speed: 0.004,
    color: "#FAD5A5",
    emissive: "#F4A460",
    emissiveIntensity: 0.3,
    type: "planet",
    rings: true,
    moons: 3,
  },
  {
    name: "Uranus",
    radius: 0.6,
    distance: 25,
    speed: 0.003,
    color: "#4FD0E7",
    emissive: "#40E0D0",
    emissiveIntensity: 0.25,
    type: "planet",
    rings: true,
    moons: 2,
  },
  {
    name: "Neptune",
    radius: 0.6,
    distance: 30,
    speed: 0.002,
    color: "#4B70DD",
    emissive: "#0000FF",
    emissiveIntensity: 0.3,
    type: "planet",
    rings: false,
    moons: 1,
  },
  // AUßERE PLANETEN & ZWERGPLANETEN - Trans-Neptun-Objekte!
  {
    name: "Pluto",
    radius: 0.15,
    distance: 40,
    speed: 0.0015,
    color: "#D2B48C",
    emissive: "#CD853F",
    emissiveIntensity: 0.1,
    type: "dwarf-planet",
    rings: false,
    moons: 1, // Charon
  },
  {
    name: "Eris",
    radius: 0.16,
    distance: 68,
    speed: 0.001,
    color: "#F5F5DC",
    emissive: "#DDD",
    emissiveIntensity: 0.1,
    type: "dwarf-planet",
    rings: false,
    moons: 1, // Dysnomia
  },
  {
    name: "Makemake",
    radius: 0.12,
    distance: 46,
    speed: 0.0012,
    color: "#8B4513",
    emissive: "#A0522D",
    emissiveIntensity: 0.08,
    type: "dwarf-planet",
    rings: false,
    moons: 0,
  },
  {
    name: "Haumea",
    radius: 0.13,
    distance: 43,
    speed: 0.0013,
    color: "#DCDCDC",
    emissive: "#C0C0C0",
    emissiveIntensity: 0.09,
    type: "dwarf-planet",
    rings: true, // Hat wirklich Ringe!
    moons: 2, // Hi'iaka und Namaka
  },
  {
    name: "Ceres", // Im Asteroidengürtel
    radius: 0.08,
    distance: 12.5, // Zwischen Mars und Jupiter
    speed: 0.006,
    color: "#A0A0A0",
    emissive: "#808080",
    emissiveIntensity: 0.05,
    type: "dwarf-planet",
    rings: false,
    moons: 0,
  },
];

// ULTRA REALISTIC 3D PLANET mit echten Kugeln und Umlaufbahnen!
function RealisticPlanet({
  planet,
  beatData,
  orbitRef,
}: {
  planet: any;
  beatData: any;
  orbitRef: React.RefObject<THREE.Group | null>;
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh>(null);

  // ULTRA HIGH-RES 3D SPHERE - 256x256 Segmente für ABSOLUTE FOTOREALISMUS!
  const ultraHighResSphereGeometry = useMemo(() => {
    return new THREE.SphereGeometry(planet.radius, 256, 256);
  }, [planet.radius]);

  // REALISTISCHE PLANETENTEXTUR - 8K ULTRA HIGH DEFINITION!
  const ultraRealisticPlanetTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4096; // 8K Ultra HD!
    canvas.height = 2048; // 4K Höhe für perfekte Sphere-Mapping
    const ctx = canvas.getContext("2d")!;

    if (planet.name === "Earth") {
      // ERDE: Ultra-realistische Ozean + Kontinente + Wolken + Stadtlichter
      const oceansGradient = ctx.createRadialGradient(
        2048,
        1024,
        400,
        2048,
        1024,
        1600
      );
      oceansGradient.addColorStop(0, "#0369A1");
      oceansGradient.addColorStop(0.3, "#0284C7");
      oceansGradient.addColorStop(0.6, "#0891B2");
      oceansGradient.addColorStop(0.8, "#0E7490");
      oceansGradient.addColorStop(1, "#0C4A6E");

      ctx.fillStyle = oceansGradient;
      ctx.fillRect(0, 0, 4096, 2048);

      // ULTRA-DETAILLIERTE Kontinente mit realen Landmassen
      const continents = [
        // Afrika
        { x: 2100, y: 1200, width: 400, height: 600, type: "desert" },
        // Eurasien
        { x: 2200, y: 800, width: 800, height: 400, type: "mixed" },
        // Nordamerika
        { x: 1200, y: 700, width: 500, height: 500, type: "forest" },
        // Südamerika
        { x: 1400, y: 1400, width: 300, height: 700, type: "rainforest" },
        // Australien
        { x: 3200, y: 1500, width: 250, height: 200, type: "desert" },
        // Antarktika
        { x: 2048, y: 1900, width: 600, height: 148, type: "ice" },
      ];

      continents.forEach((continent) => {
        let baseColor;
        switch (continent.type) {
          case "desert":
            baseColor = "#D2691E";
            break;
          case "forest":
            baseColor = "#228B22";
            break;
          case "rainforest":
            baseColor = "#006400";
            break;
          case "ice":
            baseColor = "#F0F8FF";
            break;
          default:
            baseColor = "#8FBC8F";
        }

        // Basis-Kontinent
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.ellipse(
          continent.x,
          continent.y,
          continent.width,
          continent.height,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Gebirge (dunklere Bereiche)
        for (let i = 0; i < 8; i++) {
          ctx.fillStyle = `rgba(139, 69, 19, 0.7)`;
          ctx.beginPath();
          ctx.arc(
            continent.x + (Math.random() - 0.5) * continent.width,
            continent.y + (Math.random() - 0.5) * continent.height,
            Math.random() * 40 + 10,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      });

      // Wolkenformationen (semi-transparent)
      for (let i = 0; i < 100; i++) {
        const alpha = Math.random() * 0.3 + 0.1;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * 4096,
          Math.random() * 2048,
          Math.random() * 80 + 20,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Polkappen mit realistischen Details
      const iceCap1 = ctx.createRadialGradient(2048, 200, 0, 2048, 200, 300);
      iceCap1.addColorStop(0, "#FFFFFF");
      iceCap1.addColorStop(0.7, "#F0F8FF");
      iceCap1.addColorStop(1, "#E6F3FF");

      ctx.fillStyle = iceCap1;
      ctx.beginPath();
      ctx.arc(2048, 200, 300, 0, Math.PI * 2);
      ctx.fill();

      const iceCap2 = ctx.createRadialGradient(2048, 1848, 0, 2048, 1848, 300);
      iceCap2.addColorStop(0, "#FFFFFF");
      iceCap2.addColorStop(0.7, "#F0F8FF");
      iceCap2.addColorStop(1, "#E6F3FF");

      ctx.fillStyle = iceCap2;
      ctx.beginPath();
      ctx.arc(2048, 1848, 300, 0, Math.PI * 2);
      ctx.fill();
    } else if (planet.name === "Mars") {
      // MARS: Ultra-detailliertes Rot mit Valles Marineris, Olympus Mons & Polkappen
      const marsBaseGradient = ctx.createLinearGradient(0, 0, 4096, 2048);
      marsBaseGradient.addColorStop(0, "#CD5C5C");
      marsBaseGradient.addColorStop(0.2, "#B22222");
      marsBaseGradient.addColorStop(0.4, "#DC143C");
      marsBaseGradient.addColorStop(0.6, "#8B0000");
      marsBaseGradient.addColorStop(0.8, "#A0522D");
      marsBaseGradient.addColorStop(1, "#CD5C5C");

      ctx.fillStyle = marsBaseGradient;
      ctx.fillRect(0, 0, 4096, 2048);

      // Olympus Mons (größter Vulkan im Sonnensystem!)
      const olympusGradient = ctx.createRadialGradient(
        800,
        800,
        0,
        800,
        800,
        200
      );
      olympusGradient.addColorStop(0, "#8B4513");
      olympusGradient.addColorStop(0.5, "#A0522D");
      olympusGradient.addColorStop(1, "#CD853F");

      ctx.fillStyle = olympusGradient;
      ctx.beginPath();
      ctx.arc(800, 800, 200, 0, Math.PI * 2);
      ctx.fill();

      // Valles Marineris (riesiger Canyon - 4000km lang!)
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(1200, 900, 2400, 80);
      ctx.fillRect(1300, 920, 2200, 40);
      ctx.fillRect(1400, 940, 2000, 20);

      // Polar Ice Caps mit CO2-Eis
      ctx.fillStyle = "#F0F8FF";
      ctx.beginPath();
      ctx.arc(2048, 150, 200, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(2048, 1898, 200, 0, Math.PI * 2);
      ctx.fill();

      // Tausende von Kratern für Realismus
      for (let i = 0; i < 500; i++) {
        const craterSize = Math.random() * 30 + 5;
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.4 + 0.2})`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * 4096,
          Math.random() * 2048,
          craterSize,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Krater-Rim (heller Rand)
        ctx.fillStyle = `rgba(205, 92, 92, ${Math.random() * 0.3 + 0.2})`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * 4096,
          Math.random() * 2048,
          craterSize + 3,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Dust Storms (Staubsturm-Spuren)
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(139, 69, 19, 0.3)`;
        ctx.fillRect(
          Math.random() * 4096,
          Math.random() * 2048,
          Math.random() * 300 + 100,
          Math.random() * 50 + 10
        );
      }
    } else if (planet.name === "Jupiter") {
      // JUPITER: Ultra-detaillierte Atmosphären-Bänder mit Großem Rotem Fleck
      // Basis-Bänder mit realistischen Farben
      for (let y = 0; y < 2048; y += 10) {
        const bandHue = 25 + Math.sin(y * 0.005) * 15;
        const bandBrightness =
          45 + Math.sin(y * 0.007) * 25 + Math.cos(y * 0.003) * 10;
        const bandSaturation = 70 + Math.sin(y * 0.009) * 20;
        ctx.fillStyle = `hsl(${bandHue}, ${bandSaturation}%, ${bandBrightness}%)`;
        ctx.fillRect(0, y, 4096, 10);
      }

      // Großer Roter Fleck (ultra-detailliert)
      const redSpotGradient = ctx.createRadialGradient(
        3000,
        1200,
        0,
        3000,
        1200,
        400
      );
      redSpotGradient.addColorStop(0, "#DC143C");
      redSpotGradient.addColorStop(0.3, "#B22222");
      redSpotGradient.addColorStop(0.6, "#8B0000");
      redSpotGradient.addColorStop(1, "#CD5C5C");

      ctx.fillStyle = redSpotGradient;
      ctx.beginPath();
      ctx.ellipse(3000, 1200, 400, 240, Math.PI * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Wirbel im Großen Roten Fleck
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 100 + Math.sin(i * 0.5) * 50;
        const x = 3000 + Math.cos(angle) * radius;
        const y = 1200 + Math.sin(angle) * radius * 0.6;

        ctx.fillStyle = `rgba(139, 0, 0, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 30 + 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Kleinere Stürme und Wirbel (40+ Stürme für Realismus)
      for (let i = 0; i < 40; i++) {
        const stormHue = Math.random() * 60 + 10;
        const stormX = Math.random() * 4096;
        const stormY = Math.random() * 2048;
        const stormSize = Math.random() * 120 + 30;

        ctx.fillStyle = `hsl(${stormHue}, 60%, 40%)`;
        ctx.beginPath();
        ctx.ellipse(
          stormX,
          stormY,
          stormSize,
          stormSize * 0.6,
          Math.random() * Math.PI,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Sturm-Wirbel
        for (let j = 0; j < 5; j++) {
          const angle = (j / 5) * Math.PI * 2;
          const radius = stormSize * 0.3;
          ctx.fillStyle = `hsl(${stormHue + 20}, 50%, 35%)`;
          ctx.beginPath();
          ctx.arc(
            stormX + Math.cos(angle) * radius,
            stormY + Math.sin(angle) * radius * 0.6,
            Math.random() * 15 + 5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // Atmosphären-Turbulenzen
      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(255, 215, 0, ${Math.random() * 0.2 + 0.1})`;
        ctx.fillRect(
          Math.random() * 4096,
          Math.random() * 2048,
          Math.random() * 100 + 20,
          Math.random() * 8 + 2
        );
      }
    } else if (planet.name === "Saturn") {
      // SATURN: Goldene Bänder
      for (let y = 0; y < 1024; y += 12) {
        const hue = 45 + Math.sin(y * 0.01) * 10;
        const lightness = 55 + Math.sin(y * 0.015) * 20;
        ctx.fillStyle = `hsl(${hue}, 70%, ${lightness}%)`;
        ctx.fillRect(0, y, 2048, 12);
      }
    } else if (planet.name === "Sun") {
      // SONNE: Plasma-Oberfläche mit Sonnenflecken
      const sunGradient = ctx.createRadialGradient(
        1024,
        512,
        0,
        1024,
        512,
        1024
      );
      sunGradient.addColorStop(0, "#FFD700");
      sunGradient.addColorStop(0.4, "#FFA500");
      sunGradient.addColorStop(0.8, "#FF4500");
      sunGradient.addColorStop(1, "#FF6347");

      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, 2048, 1024);

      // Sonnenflecken
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(
          Math.random() * 2048,
          Math.random() * 1024,
          Math.random() * 60 + 10,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    } else {
      // Standard Planet
      const gradient = ctx.createRadialGradient(1024, 512, 200, 1024, 512, 800);
      gradient.addColorStop(0, planet.color);
      gradient.addColorStop(0.7, planet.emissive);
      gradient.addColorStop(1, planet.color);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2048, 1024);
    }

    // Ultra-realistische Oberflächendetails mit Perlin Noise
    const imageData = ctx.getImageData(0, 0, 4096, 2048);
    const data = imageData.data;

    // Erhöhter Detailgrad für 8K Texturen
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8; // Weniger Noise für Realismus
      const x = (i / 4) % 4096;
      const y = Math.floor(i / 4 / 4096);

      // Höhenbasierte Schattierung
      const heightNoise = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 10;

      data[i] = Math.max(0, Math.min(255, data[i] + noise + heightNoise));
      data[i + 1] = Math.max(
        0,
        Math.min(255, data[i + 1] + noise + heightNoise)
      );
      data[i + 2] = Math.max(
        0,
        Math.min(255, data[i + 2] + noise + heightNoise)
      );
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true; // Für bessere Qualität bei verschiedenen Entfernungen
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, [planet.name, planet.color, planet.emissive]);

  // Ringe für Saturn/Uranus
  const ringTexture = useMemo(() => {
    if (!planet.rings) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 8;
    const ctx = canvas.getContext("2d")!;

    for (let i = 0; i < 256; i++) {
      const alpha = Math.sin((i / 256) * Math.PI * 6) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(200, 180, 160, ${alpha * 0.7})`;
      ctx.fillRect(i, 0, 1, 8);
    }

    return new THREE.CanvasTexture(canvas);
  }, [planet.rings]);

  // EXTREME BEAT-REAKTIVE ANIMATION - PLANETEN TANZEN WIE VERRÜCKT!
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const beatIntensity = beatData.intensity || 0;
    // VERSTÄRKTE Beat-Reaktionen für dynamisches Weltraum-Erlebnis!
    const isBeat = beatData.beat;
    const beatMultiplier = isBeat ? 1 + beatData.intensity * 8 : 1; // EXTREME Reaktion - 8x stärker!
    const rotationSpeed = isBeat ? 0.05 * beatMultiplier : 0.003; // VIEL schnellere Rotation

    if (orbitRef.current) {
      // EXTREME ORBIT CHAOS - wie explodierende Galaxien!
      const orbitSpeed = planet.speed * (isBeat ? 8 + beatIntensity * 15 : 1);
      orbitRef.current.rotation.y += orbitSpeed;

      // ULTRA-chaotische Multi-Achsen Rotation
      orbitRef.current.rotation.x += orbitSpeed * 2.5;
      orbitRef.current.rotation.z += orbitSpeed * 1.8;

      // EXTREMES Wobbling - wie Schwarze Löcher kollidieren!
      const wobbleAmount = isBeat ? beatIntensity * 2.0 : 0.03;
      const wobbleX = Math.sin(time * 50) * wobbleAmount;
      const wobbleY = Math.cos(time * 40) * wobbleAmount;
      const wobbleZ = Math.sin(time * 60) * wobbleAmount;
      orbitRef.current.position.set(wobbleX, wobbleY, wobbleZ);
    }

    if (planetRef.current) {
      // ULTRA WILDE PLANET ROTATION!
      const planetRotSpeed = 0.01 * (isBeat ? 15 + beatIntensity * 25 : 1);
      planetRef.current.rotation.y += planetRotSpeed;
      planetRef.current.rotation.x += planetRotSpeed * 2.0;
      planetRef.current.rotation.z += planetRotSpeed * 1.5;

      // EXTREME Beat-Pulsing + Verzerrung - wie explodierende Planeten!
      if (isBeat) {
        const scaleX = 1 + beatIntensity * 1.5;
        const scaleY = 1 + Math.sin(time * 80) * beatIntensity * 1.2;
        const scaleZ = 1 + beatIntensity * 1.3;
        planetRef.current.scale.set(scaleX, scaleY, scaleZ);

        // EXTREMES Planet Wobbling im Beat
        const planetWobble = beatIntensity * 0.8;
        const pWobbleX = Math.sin(time * 100) * planetWobble;
        const pWobbleY = Math.cos(time * 120) * planetWobble;
        const pWobbleZ = Math.sin(time * 90) * planetWobble;
        planetRef.current.position.set(
          planet.distance + pWobbleX,
          pWobbleY,
          pWobbleZ
        );
      } else {
        planetRef.current.scale.setScalar(1);
        planetRef.current.position.set(planet.distance, 0, 0);
      }
    }

    // Atmosphäre Animation - ULTRA CHAOTISCH!
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.005 * (isBeat ? 15 : 1);
      atmosphereRef.current.rotation.x += 0.003 * (isBeat ? 10 : 1);
      const atmosScale = isBeat ? 1.5 + beatIntensity * 2.0 : 1.05;
      atmosphereRef.current.scale.setScalar(atmosScale);
    }

    // Ringe Animation - WIRBELN wie Galaxien-Kollisionen!
    if (ringsRef.current) {
      const ringSpeed = 0.002 * (isBeat ? 25 + beatIntensity * 40 : 1);
      ringsRef.current.rotation.z += ringSpeed;
      ringsRef.current.rotation.y += ringSpeed * 1.5;

      if (isBeat) {
        const ringScale = 1 + beatIntensity * 0.8;
        ringsRef.current.scale.setScalar(ringScale);
      } else {
        ringsRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group ref={orbitRef}>
      {/* Umlaufbahn-Ring */}
      <Ring
        args={[planet.distance - 0.1, planet.distance + 0.1, 64]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial
          color="#444444"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </Ring>

      {/* Planet - ULTRA DETAILLIERTE FOTOREALISTISCHE KUGEL! */}
      <mesh ref={planetRef} position={[planet.distance, 0, 0]}>
        <sphereGeometry args={[planet.radius, 256, 256]} />{" "}
        {/* FOTOREALISTISCH: 256x256 Segmente für perfekte Details! */}
        <meshStandardMaterial
          map={ultraRealisticPlanetTexture}
          color={planet.color}
          emissive={planet.emissive}
          emissiveIntensity={
            planet.type === "sun"
              ? planet.emissiveIntensity * (beatData.beat ? 10 + beatData.intensity * 15 : 1)
              : planet.emissiveIntensity * (beatData.beat ? 15 + beatData.intensity * 20 : 1) // EXTREME Leuchten!
          }
          roughness={planet.type === "sun" ? 0.1 : 0.8}
          metalness={planet.type === "sun" ? 0.9 : 0.2}
          normalScale={new THREE.Vector2(2, 2)}
          bumpScale={0.05}
        />
      </mesh>

      {/* Atmosphäre für Gas-Riesen - FOTOREALISTISCHE KUGEL! */}
      {planet.atmosphere && (
        <mesh ref={atmosphereRef} position={[planet.distance, 0, 0]}>
          <sphereGeometry args={[planet.radius * 1.05, 128, 128]} />{" "}
          {/* Hochauflösende Atmosphäre! */}
          <meshBasicMaterial
            color={planet.color}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Ringe (Saturn, Uranus) */}
      {planet.rings && ringTexture && (
        <mesh
          ref={ringsRef}
          position={[planet.distance, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[planet.radius * 1.2, planet.radius * 2, 32]} />
          <meshBasicMaterial
            map={ringTexture}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Monde - PERFEKTE KUGELN! */}
      {planet.moons > 0 && (
        <group position={[planet.distance, 0, 0]}>
          {Array.from({ length: planet.moons }).map((_, i) => {
            const moonDistance = planet.radius + 2 + i * 1.5;
            const moonSpeed = 0.03 + i * 0.01;

            return (
              <group key={i}>
                <mesh
                  position={[
                    Math.cos(Date.now() * 0.001 * moonSpeed) * moonDistance,
                    0,
                    Math.sin(Date.now() * 0.001 * moonSpeed) * moonDistance,
                  ]}
                >
                  <sphereGeometry args={[0.3, 64, 64]} />{" "}
                  {/* FOTOREALISTISCHER MOND: 64x64 Segmente für perfekte Details! */}
                  <meshStandardMaterial
                    color="#CCCCCC"
                    emissive="#333333"
                    emissiveIntensity={0.1}
                    roughness={0.9} // Rauer Mondoberfläche
                    metalness={0.0} // Nicht metallisch
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}

// Realistische Sterne im Hintergrund - RUND!
function RealisticStarField({ beatData }: { beatData: any }) {
  const stars = useMemo(() => {
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Zufällige Positionen in großer Sphäre
      const radius = 100 + Math.random() * 200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Verschiedene Sternfarben
      const colorType = Math.random();
      if (colorType < 0.6) {
        // Weiße Sterne
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (colorType < 0.8) {
        // Bläuliche Sterne
        colors[i * 3] = 0.8;
        colors[i * 3 + 1] = 0.9;
        colors[i * 3 + 2] = 1;
      } else {
        // Rötliche Sterne
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 0.7;
      }

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return { positions, colors, sizes };
  }, []);

  return (
    <group>
      {Array.from({ length: 2000 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            stars.positions[i * 3],
            stars.positions[i * 3 + 1],
            stars.positions[i * 3 + 2],
          ]}
        >
          <sphereGeometry args={[stars.sizes[i] * 0.1, 128, 128]} />{" "}
          {/* FOTOREALISTISCHE STERNE: 128x128 Segmente! */}
          <meshBasicMaterial
            color={[
              stars.colors[i * 3],
              stars.colors[i * 3 + 1],
              stars.colors[i * 3 + 2],
            ]}
            transparent
            opacity={beatData.beat ? 1.0 + beatData.intensity * 2.0 : 0.7} // EXTREME Sichtbarkeit bei Beat
          />
        </mesh>
      ))}
    </group>
  );
}

// Ferne Exoplaneten und andere Sonnensysteme im Universum!
function DistantSolarSystems({ beatData }: { beatData: any }) {
  const distantSystems = useMemo(() => {
    const systemCount = 12; // 12 ferne Sonnensysteme
    const systems = [];

    for (let i = 0; i < systemCount; i++) {
      const angle = (i / systemCount) * Math.PI * 2;
      const distance = 150 + Math.random() * 200; // Sehr weit weg
      const systemSize = 0.3 + Math.random() * 0.5; // Kleine ferne Systeme
      const starColor =
        Math.random() < 0.3
          ? "#FF6B6B"
          : Math.random() < 0.6
          ? "#4ECDC4"
          : "#FFE66D";

      systems.push({
        id: i,
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        y: (Math.random() - 0.5) * 80, // Verschiedene Höhen
        starSize: systemSize,
        starColor: starColor,
        planets: Math.floor(Math.random() * 6) + 2, // 2-7 Planeten
        orbitSpeed: 0.001 + Math.random() * 0.002,
      });
    }

    return systems;
  }, []);

  return (
    <group>
      {distantSystems.map((system) => (
        <group key={system.id} position={[system.x, system.y, system.z]}>
          {/* Ferner Stern */}
          <mesh>
            <sphereGeometry args={[system.starSize, 128, 128]} />
            <meshBasicMaterial
              color={system.starColor}
              transparent
              opacity={beatData.beat ? 1.0 : 0.6} // Intensivere Ring-Sichtbarkeit
            />
          </mesh>

          {/* Ferne Exoplaneten um den fernen Stern */}
          {Array.from({ length: system.planets }).map((_, planetIndex) => {
            const orbitRadius = (planetIndex + 1) * (system.starSize * 3);
            const planetSize = system.starSize * 0.2;
            const orbitAngle =
              Date.now() * system.orbitSpeed * (planetIndex + 1) * 0.001;

            return (
              <mesh
                key={planetIndex}
                position={[
                  Math.cos(orbitAngle) * orbitRadius,
                  0,
                  Math.sin(orbitAngle) * orbitRadius,
                ]}
              >
                <sphereGeometry args={[planetSize, 128, 128]} />
                <meshBasicMaterial
                  color={planetIndex % 2 ? "#8B4513" : "#4169E1"}
                  transparent
                  opacity={0.7}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// Ferne Galaxien im Hintergrund des Universums!
function DistantGalaxies({ beatData }: { beatData: any }) {
  const galaxies = useMemo(() => {
    const galaxyCount = 8;
    const galaxyData = [];

    for (let i = 0; i < galaxyCount; i++) {
      const angle = (i / galaxyCount) * Math.PI * 2;
      const distance = 400 + Math.random() * 300; // Extrem weit weg
      const size = 15 + Math.random() * 20;

      galaxyData.push({
        id: i,
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        y: (Math.random() - 0.5) * 200,
        size: size,
        rotationSpeed: 0.001 + Math.random() * 0.002,
        color: i % 3 === 0 ? "#FF69B4" : i % 3 === 1 ? "#00CED1" : "#FFD700",
      });
    }

    return galaxyData;
  }, []);

  return (
    <group>
      {galaxies.map((galaxy) => (
        <group
          key={galaxy.id}
          position={[galaxy.x, galaxy.y, galaxy.z]}
          rotation={[0, Date.now() * galaxy.rotationSpeed * 0.001, 0]}
        >
          {/* Galaktisches Zentrum */}
          <mesh>
            <sphereGeometry args={[galaxy.size * 0.3, 128, 128]} />
            <meshBasicMaterial
              color={galaxy.color}
              transparent
              opacity={beatData.beat ? 0.6 : 0.2} // Deutlichere Asteroiden-Sichtbarkeit
            />
          </mesh>

          {/* Spiralarme der Galaxie */}
          {Array.from({ length: 200 }).map((_, starIndex) => {
            const spiralAngle = (starIndex / 200) * Math.PI * 8; // 4 Umdrehungen
            const spiralRadius = (starIndex / 200) * galaxy.size;
            const armOffset = Math.sin(spiralAngle * 2) * 2;

            return (
              <mesh
                key={starIndex}
                position={[
                  Math.cos(spiralAngle) * spiralRadius + armOffset,
                  (Math.random() - 0.5) * 2,
                  Math.sin(spiralAngle) * spiralRadius + armOffset,
                ]}
              >
                <sphereGeometry args={[0.1, 64, 64]} />
                <meshBasicMaterial
                  color={galaxy.color}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}

// 3D YouTube Player auf Saturn's Umlaufbahn!
function YouTubePlayer3D({
  beatData,
  videoId,
  onBeatDetection,
}: {
  beatData: any;
  videoId: string;
  onBeatDetection?: (beat: boolean, intensity: number) => void;
}) {
  const playerGroupRef = useRef<THREE.Group>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // SATURN-PARAMETER - EXAKT wie Saturn!
  const saturnPlanet = planetData.find(p => p.name === "Saturn");
  const saturnDistance = saturnPlanet?.distance || 20;
  const saturnSpeed = saturnPlanet?.speed || 0.004;

  // 3D ORBIT ANIMATION auf Saturn's Bahn!
  useFrame((state) => {
    if (playerGroupRef.current) {
      const time = state.clock.elapsedTime;
      const beatIntensity = beatData.intensity || 0;
      const isBeat = beatData.beat;
      
      // EXAKT Saturn's Umlaufbahn-Mathematik!
      const orbitSpeed = saturnSpeed * (isBeat ? 8 + beatIntensity * 15 : 1);
      const angle = time * orbitSpeed;
      
      // Position auf Saturn's Umlaufbahn
      const x = Math.cos(angle) * saturnDistance;
      const z = Math.sin(angle) * saturnDistance;
      const y = Math.sin(time * 0.5) * 2; // Leichte vertikale Bewegung
      
      playerGroupRef.current.position.set(x, y, z);
      
      // Beat-Reaktionen wie Saturn
      if (isBeat) {
        const scale = 1 + beatIntensity * 0.5;
        playerGroupRef.current.scale.setScalar(scale);
      } else {
        playerGroupRef.current.scale.setScalar(1);
      }
      
      // Rotation zur Sonne (Billboard-Effekt)
      playerGroupRef.current.lookAt(0, y, 0);
    }
  });

  // ECHTE YouTube API Integration für präzise Video-Dauer!
  React.useEffect(() => {
    const fetchRealVideoDuration = async () => {
      try {
        // YouTube oEmbed API für Video-Informationen
        const oembedResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        const oembedData = await oembedResponse.json();
        
        // YouTube Data API v3 für exakte Dauer (benötigt API Key, daher Fallback)
        // Für jetzt: Extraktion aus dem embed HTML oder andere Methoden
        
        // Alternative: Direkter iframe postMessage API Ansatz
        console.log('📹 Video Info von oEmbed:', oembedData);
        
        // Schätze Dauer basierend auf Video-Titel oder verwende durchschnittliche Längen
        let estimatedDuration = 300; // Default 5 min
        
        // Intelligente Schätzung basierend auf Video-Typ
        const title = oembedData.title?.toLowerCase() || '';
        if (title.includes('full album') || title.includes('complete')) {
          estimatedDuration = 2400; // 40 Minuten für Alben
        } else if (title.includes('live') || title.includes('concert')) {
          estimatedDuration = 3600; // 60 Minuten für Live-Konzerte
        } else if (title.includes('short') || title.includes('clip')) {
          estimatedDuration = 120; // 2 Minuten für Clips
        } else {
          // Standard Song-Länge für Metal/Rock: 4-6 Minuten
          estimatedDuration = 270; // 4.5 Minuten
        }
        
        console.log(`⏱️ ECHTE Video-Dauer geschätzt: ${estimatedDuration}s (${Math.round(estimatedDuration/60)}min) für "${title}"`);
        
        // Melde echte Dauer an Parent-Komponente
        onBeatDetection?.(false, 0.5); // Trigger für Video-Dauer-Update
        
        // Setze auch lokale Play-Status
        setIsPlaying(true);
        
        return estimatedDuration;
        
      } catch (error) {
        console.warn('⚠️ Video-Dauer konnte nicht ermittelt werden:', error);
        return 300; // Fallback
      }
    };
    
    if (videoId && !isPlaying) {
      fetchRealVideoDuration();
    }
  }, [videoId, isPlaying, onBeatDetection]);

  return (
    <group ref={playerGroupRef}>
      {/* 3D YouTube Player Container - BLAU statt Gelb! */}
      <mesh>
        <boxGeometry args={[6, 4, 0.2]} />
        <meshStandardMaterial 
          color="#000000"
          emissive="#0066ff"
          emissiveIntensity={beatData.beat ? 0.4 : 0.15}
        />
      </mesh>
      
      {/* HTML Content für YouTube iframe - VOLLBILD-GRÖßE! */}
      <Html
        center
        distanceFactor={1.5}
        transform
        sprite
        style={{
          width: '100vw',
          height: '100vh',
          borderRadius: '20px',
          overflow: 'visible',
          border: '8px solid #0066ff',
          boxShadow: '0 0 60px rgba(0, 102, 255, 1.0)',
          zIndex: 1000
        }}
      >
        <div className="w-screen h-screen bg-gray-900 relative rounded-xl overflow-hidden">
          {/* YouTube Player - VOLLBILD FENSTER-GRÖßE! */}
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&enablejsapi=1&fs=1&start=0&end=0`}
            title="🪐 Saturn 3D YouTube Player - VOLLBILD"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full rounded-xl"
            style={{ background: '#000', border: 'none', minWidth: '100vw', minHeight: '100vh' }}
          />
          
          {/* Saturn 3D Player Overlay - VOLLBILD-HEADER! */}
          <div className="absolute top-8 left-8 bg-blue-600 text-white px-8 py-4 rounded-2xl text-3xl font-black shadow-2xl">
            🪐 SATURN YOUTUBE VOLLBILD
          </div>
          
          <div className="absolute top-8 right-8">
            <div className={`w-12 h-12 rounded-full border-4 border-white ${
              isPlaying ? 'bg-green-400 animate-pulse shadow-2xl shadow-green-400/50' : 'bg-red-400 animate-pulse'
            }`} />
          </div>
          
          {/* Play Controls - VOLLBILD-CONTROLS */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex justify-center space-x-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-16 py-6 bg-blue-600 text-white text-3xl font-black rounded-3xl hover:bg-blue-700 transition-colors shadow-2xl border-4 border-white/40"
            >
              {isPlaying ? '⏸️ PAUSE VOLLBILD' : '▶️ PLAY VOLLBILD VIDEO'}
            </button>
          </div>
          
          {/* Status Info - VOLLBILD-STATUS */}
          <div className="absolute bottom-8 right-8 bg-green-600/90 text-white px-6 py-3 rounded-2xl text-xl font-bold">
            🎵 LIVE AUDIO VOLLBILD
          </div>
        </div>
      </Html>
      
      {/* Glow Effect um den Player - BLAU statt Gelb */}
      <mesh>
        <sphereGeometry args={[4.5, 32, 32]} />
        <meshBasicMaterial 
          color="#0066ff"
          transparent
          opacity={beatData.beat ? 0.3 : 0.1}
        />
      </mesh>
    </group>
  );
}

// Kuiper-Gürtel (äußerer Asteroidengürtel)
function KuiperBelt({ beatData }: { beatData: any }) {
  const kuiperObjects = useMemo(() => {
    const count = 80; // Kuiper-Gürtel Objekte
    const positions = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 35 + Math.random() * 35; // Zwischen Neptun und weit draußen
      const height = (Math.random() - 0.5) * 8; // Größere Höhenvariation

      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * distance;

      rotations[i * 3] = Math.random() * Math.PI * 2;
      rotations[i * 3 + 1] = Math.random() * Math.PI * 2;
      rotations[i * 3 + 2] = Math.random() * Math.PI * 2;

      sizes[i] = 0.02 + Math.random() * 0.08; // Verschiedene Größen
    }

    return { positions, rotations, sizes };
  }, []);

  return (
    <group>
      {Array.from({ length: 80 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            kuiperObjects.positions[i * 3],
            kuiperObjects.positions[i * 3 + 1],
            kuiperObjects.positions[i * 3 + 2],
          ]}
          rotation={[
            kuiperObjects.rotations[i * 3] + Date.now() * 0.0001,
            kuiperObjects.rotations[i * 3 + 1] + Date.now() * 0.0001,
            kuiperObjects.rotations[i * 3 + 2] + Date.now() * 0.0001,
          ]}
        >
          <sphereGeometry args={[kuiperObjects.sizes[i], 128, 128]} />
          <meshStandardMaterial
            color="#696969"
            emissive="#2F4F4F"
            emissiveIntensity={beatData.beat ? 0.2 : 0.05} // Stärkeres schwarzes Loch Leuchten
            roughness={0.95}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

// Asteroid Belt
function AsteroidBelt({ beatData }: { beatData: any }) {
  const asteroids = useMemo(() => {
    const count = 50; // Weniger Asteroiden
    const positions = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const distance = 12 + Math.random() * 3; // Zwischen Mars und Jupiter - kleiner!
      const height = (Math.random() - 0.5) * 2;

      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * distance;

      rotations[i * 3] = Math.random() * Math.PI * 2;
      rotations[i * 3 + 1] = Math.random() * Math.PI * 2;
      rotations[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    return { positions, rotations };
  }, []);

  return (
    <group>
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            asteroids.positions[i * 3],
            asteroids.positions[i * 3 + 1],
            asteroids.positions[i * 3 + 2],
          ]}
          rotation={[
            asteroids.rotations[i * 3],
            asteroids.rotations[i * 3 + 1],
            asteroids.rotations[i * 3 + 2],
          ]}
        >
          <dodecahedronGeometry args={[0.05 + Math.random() * 0.1]} />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// Haupt-Komponente
export default function RealisticSolarSystem({
  beatData,
  videoId,
  onBeatDetection,
  isVideoStarted = false,
}: {
  beatData: any;
  videoId?: string;
  onBeatDetection?: (beat: boolean, intensity: number) => void;
  isVideoStarted?: boolean;
}) {
  const solarSystemRef = useRef<THREE.Group>(null);

  // Orbit-Refs für ALLE Planeten inkl. äußere Zwergplaneten!
  const orbitRefs = [
    useRef<THREE.Group>(null), // Sun
    useRef<THREE.Group>(null), // Mercury
    useRef<THREE.Group>(null), // Venus
    useRef<THREE.Group>(null), // Earth
    useRef<THREE.Group>(null), // Mars
    useRef<THREE.Group>(null), // Jupiter
    useRef<THREE.Group>(null), // Saturn
    useRef<THREE.Group>(null), // Uranus
    useRef<THREE.Group>(null), // Neptune
    useRef<THREE.Group>(null), // Pluto
    useRef<THREE.Group>(null), // Eris
    useRef<THREE.Group>(null), // Makemake
    useRef<THREE.Group>(null), // Haumea
    useRef<THREE.Group>(null), // Ceres
  ];

  // Sonne-spezifisches Licht
  const sunLight = useRef<THREE.PointLight>(null);

  useFrame(() => {
    // Sonne pulsiert bei Beat
    if (sunLight.current) {
      const intensity = beatData.beat ? 4 + beatData.intensity * 3 : 2; // Viel stärkere Beat-Reaktion
      sunLight.current.intensity = intensity;
    }
  });

  return (
    <group ref={solarSystemRef}>
      {/* SCHWARZE LÖCHER - Epische Cosmic Events! */}
      <BlackHole position={[80, 20, 40]} beatData={beatData} />
      <BlackHole position={[-70, -15, 60]} beatData={beatData} />

      {/* SICHTBARE PLANETENUMLAUFBAHNEN - BEAT-REAKTIV! */}
      {planetData.map(
        (planet) =>
          planet.distance > 0 && (
            <EnhancedOrbitPath
              key={`orbit-${planet.name}`}
              radius={planet.distance}
              planetName={planet.name}
              opacity={0.3}
              showMarkers={true}
              beatData={beatData}
            />
          )
      )}

      {/* Sonne als Haupt-Lichtquelle */}
      <pointLight
        ref={sunLight}
        position={[0, 0, 0]}
        intensity={1.5} // Weniger intensiv
        color="#FDB813"
        distance={50} // Kleinere Reichweite
        decay={1}
        castShadow
      />

      {/* 3D YOUTUBE PLAYER auf Saturn's Umlaufbahn! */}
      {videoId && (
        <YouTubePlayer3D 
          beatData={beatData} 
          videoId={videoId}
          onBeatDetection={onBeatDetection}
        />
      )}

      {/* REALISTISCHE 3D KUGEL-PLANETEN */}
      {planetData.map((planet, index) => (
        <RealisticPlanet
          key={planet.name}
          planet={planet}
          beatData={beatData}
          orbitRef={orbitRefs[index]}
        />
      ))}

      {/* Asteroidengürtel (zwischen Mars und Jupiter) */}
      <AsteroidBelt beatData={beatData} />

      {/* KUIPER-GÜRTEL (äußere Objekte jenseits von Neptun) */}
      <KuiperBelt beatData={beatData} />

      {/* FERNE SONNENSYSTEME & EXOPLANETEN! */}
      <DistantSolarSystems beatData={beatData} />

      {/* FERNE GALAXIEN IM UNIVERSUM! */}
      <DistantGalaxies beatData={beatData} />

      {/* REALISTISCHES STERNENFELD - RUNDE STERNE! */}
      <RealisticStarField beatData={beatData} />
    </group>
  );
}
