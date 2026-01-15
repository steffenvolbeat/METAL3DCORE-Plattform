"use client";

import React from "react";

interface ContactStageProps {
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
  onExitFullscreen?: () => void;
}

// Placeholder Contact Stage; keeps layout consistent until full implementation ships
export default function ContactStage({ onRoomChange, isFullscreen = false, onExitFullscreen }: ContactStageProps) {
  return (
    <div className="min-h-[320px] flex items-center justify-center rounded-3xl border border-theme-secondary bg-black/40 p-10 text-center">
      <div className="space-y-3">
        <div className="text-4xl">📞</div>
        <h2 className="text-2xl font-semibold text-theme-primary">Contact Stage</h2>
        <p className="text-theme-secondary">Professioneller Support-Bereich · Coming Soon.</p>
      </div>
    </div>
  );
}
