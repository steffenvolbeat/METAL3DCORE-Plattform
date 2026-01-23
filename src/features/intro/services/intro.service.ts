// 🎸 Intro Service
// Intro Animation Configuration

export interface IntroPhase {
  id: "galaxy" | "planets" | "blackhole" | "complete";
  duration: number; // in seconds
  audioFile?: string;
}

/**
 * Intro-Phasen Konfiguration
 */
export const INTRO_PHASES: IntroPhase[] = [
  {
    id: "galaxy",
    duration: 3,
    audioFile: "/audio/intro-galaxy.mp3",
  },
  {
    id: "planets",
    duration: 4,
    audioFile: "/audio/intro-planets.mp3",
  },
  {
    id: "blackhole",
    duration: 5,
    audioFile: "/audio/intro-blackhole.mp3",
  },
  {
    id: "complete",
    duration: 0,
  },
];

/**
 * Gesamte Intro-Duration berechnen
 */
export function getTotalIntroDuration(): number {
  return INTRO_PHASES.filter((phase) => phase.id !== "complete").reduce(
    (total, phase) => total + phase.duration,
    0
  );
}

/**
 * Prüft ob Intro bereits gesehen wurde
 */
export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("intro-seen") === "true";
}

/**
 * Markiert Intro als gesehen
 */
export function markIntroAsSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("intro-seen", "true");
}

/**
 * Setzt Intro-Status zurück
 */
export function resetIntroStatus(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("intro-seen");
}
