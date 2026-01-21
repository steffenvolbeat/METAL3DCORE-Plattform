"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

interface OrbitPathProps {
  radius: number;
  color?: string;
  opacity?: number;
  segments?: number;
  beatData?: { beat: boolean; intensity: number };
}

// SICHTBARE PLANETENUMLAUFBAHNEN wie in den NASA-Bildern!
const OrbitPath: React.FC<OrbitPathProps> = ({
  radius,
  color = "#4A90E2",
  opacity = 0.3,
  segments = 128,
  beatData,
}) => {
  const orbitGroupRef = useRef<THREE.Group>(null);

  // Erstelle Punkt-Array für Line Komponente
  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return points;
  }, [radius, segments]);

  // BEAT-REAKTIVE ANIMATION - WIRBELN UND TANZEN!
  useFrame((state) => {
    if (orbitGroupRef.current && beatData) {
      const time = state.clock.elapsedTime;
      const beatIntensity = beatData.intensity || 0;
      const isBeat = beatData.beat;

      // EXTREME GALAXIEN-STYLE ROTATION um alle Achsen!
      const rotationSpeed = isBeat ? 0.2 + beatIntensity * 2.0 : 0.005; // 40x extremer!

      // Ultra-chaotische Multi-achsen Rotation
      orbitGroupRef.current.rotation.y += rotationSpeed;
      orbitGroupRef.current.rotation.x += rotationSpeed * 2.5;
      orbitGroupRef.current.rotation.z += rotationSpeed * 1.8;

      // EXTREME Beat-Wobble-Effekt - wie kolidierende Schwarze Löcher!
      const wobbleAmount = isBeat ? beatIntensity * 1.5 : 0.01; // 15x extremer!
      const wobbleX = Math.sin(time * 50) * wobbleAmount;
      const wobbleY = Math.cos(time * 40) * wobbleAmount;
      const wobbleZ = Math.sin(time * 60) * wobbleAmount;

      orbitGroupRef.current.position.set(wobbleX, wobbleY, wobbleZ);

      // EXTREME Beat-Pulsing der gesamten Umlaufbahn
      if (isBeat) {
        const scale = 1 + beatIntensity * 0.8; // 8x extremer!
        orbitGroupRef.current.scale.setScalar(scale);
      } else {
        orbitGroupRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group ref={orbitGroupRef}>
      <Line
        points={orbitPoints}
        color={color}
        transparent
        opacity={beatData?.beat ? opacity + beatData.intensity * 1.5 : opacity} // 5x extremer!
        lineWidth={beatData?.beat ? 1.5 + beatData.intensity * 8 : 1} // 4x extremer!
      />
    </group>
  );
};

// ERWEITERTE UMLAUFBAHN mit Markierungen
export const EnhancedOrbitPath: React.FC<
  OrbitPathProps & {
    planetName?: string;
    showMarkers?: boolean;
  }
> = ({
  radius,
  color = "#4A90E2",
  opacity = 0.4,
  segments = 128,
  planetName,
  showMarkers = true,
  beatData,
}) => {
  const enhancedOrbitGroupRef = useRef<THREE.Group>(null);

  // Erstelle Punkte-Array für Line Komponente
  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      points.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return points;
  }, [radius, segments]);

  // Markierungen alle 90° (Jahreszeiten-Positionen)
  const markerPositions = useMemo(() => {
    if (!showMarkers) return [];

    const positions: [number, number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      positions.push([Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius]);
    }
    return positions;
  }, [radius, showMarkers]);

  // Adaptive Farbe basierend auf Planetenname
  const adaptiveColor = useMemo(() => {
    const planetColors: { [key: string]: string } = {
      Mercury: "#8C7853",
      Venus: "#FFC649",
      Earth: "#6B93D6",
      Mars: "#CD5C5C",
      Jupiter: "#FAD5A5",
      Saturn: "#FFC649",
      Uranus: "#4FD0E7",
      Neptune: "#4B70DD",
    };

    return planetColors[planetName || ""] || color;
  }, [planetName, color]);

  const orbitMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: adaptiveColor,
      transparent: true,
      opacity: opacity,
    });
  }, [adaptiveColor, opacity]);

  const markerMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: adaptiveColor,
      transparent: true,
      opacity: opacity * 2,
    });
  }, [adaptiveColor, opacity]);

  // EXTREME Beat-reaktive Werte
  const beatOpacity = beatData?.beat
    ? opacity + beatData.intensity * 2.0 // 5x extremer!
    : opacity;
  const beatLineWidth = beatData?.beat ? 1.2 + beatData.intensity * 10 : 0.8; // MASSIVE Linien!
  const beatMarkerScale = beatData?.beat ? 1 + beatData.intensity * 3.0 : 1; // 6x extremer!

  // ERWEITERTE BEAT-REAKTIVE ANIMATION - WIRBELN WIE GALAXIEN!
  useFrame((state) => {
    if (enhancedOrbitGroupRef.current && beatData) {
      const time = state.clock.elapsedTime;
      const beatIntensity = beatData.intensity || 0;
      const isBeat = beatData.beat;

      // ULTRA WILD DANCING für Enhanced Orbits!
      const baseRotationSpeed = 0.008;
      const rotationSpeed = isBeat
        ? baseRotationSpeed + beatIntensity * 0.8 // 10x extremer!
        : baseRotationSpeed;

      // EXTREME Multi-dimensionale Rotation wie explodierende Galaxien
      enhancedOrbitGroupRef.current.rotation.y += rotationSpeed;
      enhancedOrbitGroupRef.current.rotation.x += rotationSpeed * 4.0; // 6x extremer!
      enhancedOrbitGroupRef.current.rotation.z += rotationSpeed * 3.0; // 7.5x extremer!

      // ULTRA-Chaotische Beat-Bewegungen wie kolidierende Schwarze Löcher
      const wobbleAmount = isBeat ? beatIntensity * 2.0 : 0.02; // 13x extremer!
      const chaosX =
        Math.sin(time * 80) * wobbleAmount + // Viel schneller!
        Math.cos(time * 50) * wobbleAmount * 2.0;
      const chaosY =
        Math.cos(time * 60) * wobbleAmount +
        Math.sin(time * 100) * wobbleAmount * 1.5;
      const chaosZ =
        Math.sin(time * 90) * wobbleAmount +
        Math.cos(time * 70) * wobbleAmount * 2.5;

      enhancedOrbitGroupRef.current.position.set(chaosX, chaosY, chaosZ);

      // ULTRA Extreme Beat-Pulsing + Verzerrungs-Effekte
      if (isBeat) {
        const scaleX = 1 + beatIntensity * 1.2; // 8x extremer!
        const scaleY = 1 + Math.sin(time * 100) * beatIntensity * 1.0; // 10x extremer!
        const scaleZ = 1 + beatIntensity * 1.0; // 8x extremer!
        enhancedOrbitGroupRef.current.scale.set(scaleX, scaleY, scaleZ);
      } else {
        enhancedOrbitGroupRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group ref={enhancedOrbitGroupRef}>
      {/* Hauptumlaufbahn - BEAT-REAKTIV! */}
      <Line
        points={orbitPoints}
        color={adaptiveColor}
        transparent
        opacity={beatOpacity}
        lineWidth={beatLineWidth}
      />

      {/* Markierungen an wichtigen Positionen - BEAT-REAKTIV! */}
      {showMarkers &&
        markerPositions.map((position, index) => (
          <mesh
            key={index}
            position={position as [number, number, number]}
            scale={[beatMarkerScale, beatMarkerScale, beatMarkerScale]}
            geometry={new THREE.SphereGeometry(0.05, 8, 8)}
            material={
              new THREE.MeshBasicMaterial({
                color: adaptiveColor,
                transparent: true,
                opacity: beatOpacity * 1.5,
              })
            }
          />
        ))}

      {/* Innere und äußere Hilfslinien für 3D-Effekt - BEAT-REAKTIV! */}
      <Line
        points={[
          [radius * 0.98, 0, 0] as [number, number, number],
          [radius * 1.02, 0, 0] as [number, number, number],
        ]}
        color={adaptiveColor}
        transparent
        opacity={beatOpacity * 0.5}
        lineWidth={beatLineWidth * 0.5}
      />
      <Line
        points={[
          [0, 0, radius * 0.98] as [number, number, number],
          [0, 0, radius * 1.02] as [number, number, number],
        ]}
        color={adaptiveColor}
        transparent
        opacity={beatOpacity * 0.5}
        lineWidth={beatLineWidth * 0.5}
      />
    </group>
  );
};

export default OrbitPath;
