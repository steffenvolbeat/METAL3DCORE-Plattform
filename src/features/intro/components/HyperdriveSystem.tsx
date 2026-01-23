"use client";

import { useState, useEffect } from "react";

export interface GalaxyZone {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  requiredProgress?: number;
}

export const GALAXY_ZONES: GalaxyZone[] = [
  {
    id: "sol-system",
    name: "Sol System",
    description: "Heimatsystem mit allen Hauptplaneten",
    unlocked: true,
  },
  {
    id: "alpha-centauri",
    name: "Alpha Centauri",
    description: "Nächstes Sternsystem - 4.37 Lichtjahre entfernt",
    unlocked: false,
    requiredProgress: 50,
  },
  {
    id: "sirius",
    name: "Sirius Sector",
    description: "Hellster Stern am Nachthimmel",
    unlocked: false,
    requiredProgress: 75,
  },
];

interface HyperdriveSystemProps {
  currentZone: string;
  onJumpInitiate?: (zone: GalaxyZone) => void;
  charging?: boolean;
  progress?: number;
}

export default function HyperdriveSystem({
  currentZone,
  onJumpInitiate,
  charging = false,
  progress = 0,
}: HyperdriveSystemProps) {
  return null; // Logic component
}

interface HyperdriveUIProps {
  zones: GalaxyZone[];
  currentZone: string;
  onSelectZone?: (zone: GalaxyZone) => void;
  charging?: boolean;
  progress?: number;
}

export function HyperdriveUI({
  zones,
  currentZone,
  onSelectZone,
  charging = false,
  progress = 0,
}: HyperdriveUIProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 left-8 button-primary"
      >
        ⚡ Hyperdrive
      </button>

      {isOpen && (
        <div className="fixed top-40 left-8 glass-panel px-6 py-4 w-80">
          <h3 className="font-semibold mb-4">Galaktische Navigation</h3>
          <div className="space-y-3">
            {zones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => zone.unlocked && onSelectZone?.(zone)}
                disabled={!zone.unlocked || zone.id === currentZone}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  zone.id === currentZone
                    ? "bg-orange-500/20 border border-orange-500"
                    : zone.unlocked
                    ? "bg-white/5 hover:bg-white/10 border border-white/10"
                    : "bg-white/5 opacity-50 cursor-not-allowed border border-white/5"
                }`}
              >
                <p className="font-semibold text-sm">{zone.name}</p>
                <p className="text-xs text-theme-secondary mt-1">
                  {zone.description}
                </p>
                {!zone.unlocked && zone.requiredProgress && (
                  <p className="text-xs text-amber-400 mt-1">
                    🔒 Benötigt {zone.requiredProgress}% Progress
                  </p>
                )}
              </button>
            ))}
          </div>

          {charging && (
            <div className="mt-4">
              <p className="text-sm text-theme-secondary mb-2">
                Hyperantrieb lädt...
              </p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 bg-cyan-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
