// 🎸 Intro Context
// Intro Animation State Management

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface IntroContextValue {
  isIntroActive: boolean;
  isIntroComplete: boolean;
  currentPhase: "galaxy" | "planets" | "blackhole" | "complete";
  skipIntro: () => void;
  startIntro: () => void;
  setPhase: (phase: IntroContextValue["currentPhase"]) => void;
}

const IntroContext = createContext<IntroContextValue | undefined>(undefined);

export interface IntroProviderProps {
  children: ReactNode;
}

/**
 * Intro Provider Component
 */
export function IntroProvider({ children }: IntroProviderProps) {
  const [isIntroActive, setIsIntroActive] = useState(true);
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [currentPhase, setCurrentPhase] =
    useState<IntroContextValue["currentPhase"]>("galaxy");

  function skipIntro() {
    setIsIntroActive(false);
    setIsIntroComplete(true);
    setCurrentPhase("complete");
  }

  function startIntro() {
    setIsIntroActive(true);
    setIsIntroComplete(false);
    setCurrentPhase("galaxy");
  }

  function setPhase(phase: IntroContextValue["currentPhase"]) {
    setCurrentPhase(phase);
    if (phase === "complete") {
      setIsIntroActive(false);
      setIsIntroComplete(true);
    }
  }

  const value: IntroContextValue = {
    isIntroActive,
    isIntroComplete,
    currentPhase,
    skipIntro,
    startIntro,
    setPhase,
  };

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

/**
 * Hook für Intro Context
 */
export function useIntroContext() {
  const context = useContext(IntroContext);
  if (context === undefined) {
    throw new Error("useIntroContext must be used within IntroProvider");
  }
  return context;
}
