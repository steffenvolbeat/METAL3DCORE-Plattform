"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface PlanetPortal {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  color: string;
  description: string;
  route?: string;
}

export const PLANET_PORTALS: PlanetPortal[] = [
  {
    id: "ticket-arena",
    name: "Ticket Arena",
    position: [50, 0, 0],
    radius: 8,
    color: "#ff6b35",
    description: "Kaufe Tickets für kommende Events",
    route: "/tickets",
  },
  {
    id: "backstage",
    name: "Backstage Lounge",
    position: [-40, 10, 30],
    radius: 6,
    color: "#9b59b6",
    description: "VIP Backstage-Erlebnis",
    route: "/3d-rooms/backstage",
  },
  {
    id: "hallenstadion",
    name: "Hallenstadion",
    position: [0, -20, 60],
    radius: 10,
    color: "#e74c3c",
    description: "Live-Konzert-Erlebnis",
    route: "/3d-rooms/hallenstadion",
  },
  {
    id: "webcam",
    name: "Webcam Station",
    position: [-60, 0, -20],
    radius: 7,
    color: "#3498db",
    description: "Live-Webcam-Stream",
    route: "/3d-rooms/webcam",
  },
];

interface PlanetPortalsSystemProps {
  shipPosition: THREE.Vector3;
  onPlanetApproach?: (planetId: string, distance: number) => void;
  onPlanetEnter?: (planetId: string) => void;
}

export default function PlanetPortalsSystem({
  shipPosition,
  onPlanetApproach,
  onPlanetEnter,
}: PlanetPortalsSystemProps) {
  useFrame(() => {
    PLANET_PORTALS.forEach((planet) => {
      const planetPos = new THREE.Vector3(...planet.position);
      const distance = shipPosition.distanceTo(planetPos);

      if (onPlanetApproach) {
        onPlanetApproach(planet.id, distance);
      }

      if (distance < planet.radius && onPlanetEnter) {
        onPlanetEnter(planet.id);
      }
    });
  });

  return (
    <group>
      {PLANET_PORTALS.map((planet) => (
        <PortalRing key={planet.id} planet={planet} />
      ))}
    </group>
  );
}

function PortalRing({ planet }: { planet: PlanetPortal }) {
  const ringGeometry = useMemo(() => {
    return new THREE.RingGeometry(planet.radius, planet.radius + 0.5, 64);
  }, [planet.radius]);

  return (
    <group position={planet.position}>
      <mesh geometry={ringGeometry}>
        <meshBasicMaterial
          color={planet.color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
        />
      </mesh>
      <pointLight color={planet.color} intensity={2} distance={50} />
    </group>
  );
}

interface PlanetInfoPanelProps {
  planet: PlanetPortal | null;
  distance?: number;
}

export function PlanetInfoPanel({ planet, distance }: PlanetInfoPanelProps) {
  if (!planet) return null;

  return (
    <div className="fixed top-24 right-8 glass-panel px-6 py-4 max-w-xs">
      <h3 className="font-semibold text-lg mb-2">{planet.name}</h3>
      <p className="text-theme-secondary text-sm mb-3">{planet.description}</p>
      {distance !== undefined && (
        <p className="text-xs text-theme-secondary">
          Distanz: {distance.toFixed(1)} Einheiten
        </p>
      )}
    </div>
  );
}
