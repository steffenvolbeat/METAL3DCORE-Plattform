// 🎸 Intro Feature - TypeScript Types

export interface BeatData {
  energy: number;
  bass: number;
  mid: number;
  treble: number;
  isBeat: boolean;
}

export interface GalaxyConfig {
  particleCount: number;
  radius: number;
  rotationSpeed: number;
  color: string;
}

export interface PlanetConfig {
  name: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: string;
  texture?: string;
}

export interface IntroSettings {
  quality: "low" | "medium" | "high" | "ultra";
  particleCount: number;
  enablePostProcessing: boolean;
  enableShadows: boolean;
}
