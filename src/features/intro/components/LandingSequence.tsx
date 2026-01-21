"use client";

import { useState, useEffect } from "react";
import type { PlanetPortal } from "./PlanetPortals";

interface LandingSequenceProps {
  planet: PlanetPortal | null;
  isActive: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function LandingSequence({
  planet,
  isActive,
  onComplete,
  onCancel,
}: LandingSequenceProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<
    "approach" | "alignment" | "descent" | "touchdown"
  >("approach");

  useEffect(() => {
    if (!isActive || !planet) {
      setProgress(0);
      setStage("approach");
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (planet.route) {
              window.location.href = planet.route;
            }
            onComplete?.();
          }, 500);
          return 100;
        }
        return next;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isActive, planet, onComplete]);

  useEffect(() => {
    if (progress < 25) setStage("approach");
    else if (progress < 50) setStage("alignment");
    else if (progress < 75) setStage("descent");
    else setStage("touchdown");
  }, [progress]);

  if (!isActive || !planet) return null;

  const stageLabels = {
    approach: "Annäherung",
    alignment: "Ausrichtung",
    descent: "Sinkflug",
    touchdown: "Landung",
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="glass-panel px-12 py-8 max-w-md w-full">
        <h2 className="panel-heading text-2xl mb-2">Landesequenz</h2>
        <p className="text-theme-secondary mb-6">{planet.name}</p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-theme-secondary">Status:</span>
              <span className="font-semibold text-cyan-400">
                {stageLabels[stage]}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div
                className="h-3 bg-gradient-to-r from-cyan-500 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-theme-secondary">
              {progress < 100
                ? "Automatische Landung läuft..."
                : "Landung erfolgreich! Weiterleitung..."}
            </p>
          </div>

          {progress < 50 && (
            <button onClick={onCancel} className="button-secondary w-full mt-4">
              Abbrechen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface QuickLandingPromptProps {
  planet: PlanetPortal | null;
  onConfirm?: () => void;
  onDismiss?: () => void;
}

export function QuickLandingPrompt({
  planet,
  onConfirm,
  onDismiss,
}: QuickLandingPromptProps) {
  if (!planet) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-panel px-6 py-4">
      <p className="text-sm text-theme-secondary mb-3">
        Drücke <kbd className="px-2 py-1 bg-orange-500/20 rounded">L</kbd> zum
        Landen auf
      </p>
      <p className="font-semibold text-center">{planet.name}</p>
    </div>
  );
}
