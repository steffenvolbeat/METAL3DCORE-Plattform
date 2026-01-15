"use client";

import React from "react";

interface WelcomeStageProps {
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
  onExitFullscreen?: () => void;
}

// Placeholder Welcome Stage; mirrors the static screen shown in the design until the full 3D scene is implemented
export default function WelcomeStage({ onRoomChange, isFullscreen = false, onExitFullscreen }: WelcomeStageProps) {
  return (
    <div className="min-h-[320px] flex items-center justify-center rounded-3xl border border-theme-secondary bg-black/40 p-10 text-center">
      <div className="space-y-3">
        <div className="text-4xl">🎸</div>
        <h2 className="text-2xl font-semibold text-theme-primary">Welcome Stage</h2>
        <p className="text-theme-secondary">Dieser 3D-Raum wird schrittweise implementiert.</p>
      </div>
    </div>
  );
}
