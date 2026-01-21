"use client";

import React from "react";

interface IntroPageProps {
  onComplete?: () => void;
}

// Simple intro overlay to keep the UI consistent when Cosmic Intro is triggered
export default function IntroPage({ onComplete }: IntroPageProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="max-w-xl w-full mx-4 rounded-3xl border border-theme-secondary bg-gradient-to-br from-slate-900 via-black to-slate-950 p-10 shadow-2xl space-y-6 text-center">
        <div className="text-4xl">🌌</div>
        <h2 className="text-2xl font-bold text-theme-primary">Cosmic Intro</h2>
        <p className="text-theme-secondary">
          Dieser 3D-Intro-Bereich wird schrittweise implementiert. Bis dahin kannst du direkt in die Welcome Stage
          einsteigen.
        </p>
        <button
          onClick={onComplete}
          className="button-primary w-full sm:w-auto mx-auto"
          aria-label="Intro schließen und zur Welcome Stage zurückkehren"
        >
          Zurück zur Welcome Stage
        </button>
      </div>
    </div>
  );
}
