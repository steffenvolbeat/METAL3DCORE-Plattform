"use client";

import * as THREE from "three";

interface NavigationHUDProps {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  nearestPlanet?: { name: string; distance: number } | null;
  gameMode?: "cinematic" | "game";
}

export default function NavigationHUD({
  position,
  rotation,
  velocity,
  nearestPlanet,
  gameMode = "game",
}: NavigationHUDProps) {
  if (gameMode !== "game") return null;

  const speed = velocity.length().toFixed(2);

  return (
    <div className="fixed top-8 left-8 glass-panel px-6 py-4 min-w-[280px]">
      <h3 className="font-semibold mb-3 text-orange-400">🚀 Navigation</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-theme-secondary">Position:</span>
          <span className="font-mono">
            {position.x.toFixed(1)}, {position.y.toFixed(1)},{" "}
            {position.z.toFixed(1)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-theme-secondary">Geschwindigkeit:</span>
          <span className="font-mono">{speed} m/s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-theme-secondary">Rotation:</span>
          <span className="font-mono">
            {((rotation.y * 180) / Math.PI).toFixed(0)}°
          </span>
        </div>
        {nearestPlanet && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-theme-secondary text-xs mb-1">
              Nächstes Ziel:
            </p>
            <p className="font-semibold">{nearestPlanet.name}</p>
            <p className="text-xs text-theme-secondary">
              {nearestPlanet.distance.toFixed(1)} Einheiten
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
