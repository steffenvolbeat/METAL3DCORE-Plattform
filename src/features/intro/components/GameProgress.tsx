"use client";

import { useState, useCallback } from "react";

interface GameProgress {
  visitedPlanets: string[];
  unlockedZones: string[];
  achievements: string[];
  totalScore: number;
}

export default function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>({
    visitedPlanets: [],
    unlockedZones: ["sol-system"],
    achievements: [],
    totalScore: 0,
  });

  const visitPlanet = useCallback((planetId: string) => {
    setProgress((prev) => {
      if (prev.visitedPlanets.includes(planetId)) return prev;
      return {
        ...prev,
        visitedPlanets: [...prev.visitedPlanets, planetId],
        totalScore: prev.totalScore + 10,
      };
    });
  }, []);

  const unlockZone = useCallback((zoneId: string) => {
    setProgress((prev) => {
      if (prev.unlockedZones.includes(zoneId)) return prev;
      return {
        ...prev,
        unlockedZones: [...prev.unlockedZones, zoneId],
        totalScore: prev.totalScore + 50,
      };
    });
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setProgress((prev) => {
      if (prev.achievements.includes(achievementId)) return prev;
      return {
        ...prev,
        achievements: [...prev.achievements, achievementId],
        totalScore: prev.totalScore + 25,
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({
      visitedPlanets: [],
      unlockedZones: ["sol-system"],
      achievements: [],
      totalScore: 0,
    });
  }, []);

  const progressPercentage = Math.min(
    100,
    (progress.visitedPlanets.length / 4) * 100
  );

  return {
    progress: { ...progress, progressPercentage },
    visitPlanet,
    unlockZone,
    unlockAchievement,
    resetProgress,
  };
}

interface GameProgressPanelProps {
  progress: ReturnType<typeof useGameProgress>["progress"];
  isOpen?: boolean;
  onToggle?: () => void;
}

export function GameProgressPanel({
  progress,
  isOpen = false,
  onToggle,
}: GameProgressPanelProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-8 right-8 glass-panel px-4 py-2"
      >
        🎯 {progress.totalScore} Punkte
      </button>

      {isOpen && (
        <div className="fixed top-20 right-8 glass-panel px-6 py-4 w-80">
          <h3 className="font-semibold mb-4">Fortschritt</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-theme-secondary">Gesamt:</span>
                <span className="font-semibold">
                  {progress.progressPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 bg-orange-500 rounded-full transition-all"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-theme-secondary mb-2">
                Besuchte Planeten:
              </p>
              <p className="font-semibold">{progress.visitedPlanets.length}/4</p>
            </div>

            <div>
              <p className="text-sm text-theme-secondary mb-2">
                Freigeschaltete Zonen:
              </p>
              <p className="font-semibold">{progress.unlockedZones.length}/3</p>
            </div>

            <div>
              <p className="text-sm text-theme-secondary mb-2">Achievements:</p>
              <p className="font-semibold">{progress.achievements.length}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
