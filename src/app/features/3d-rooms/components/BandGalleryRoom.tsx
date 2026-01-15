"use client";

import React from "react";

interface BandGalleryRoomProps {
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
  onExitFullscreen?: () => void;
}

// Placeholder Band Gallery room; keeps layout intact until full 3D scene ships
export default function BandGalleryRoom({
  onRoomChange,
  isFullscreen = false,
  onExitFullscreen,
}: BandGalleryRoomProps) {
  return (
    <div className="min-h-[320px] flex items-center justify-center rounded-3xl border border-theme-secondary bg-black/40 p-10 text-center">
      <div className="space-y-3">
        <div className="text-4xl">🖼️</div>
        <h2 className="text-2xl font-semibold text-theme-primary">Band Gallery</h2>
        <p className="text-theme-secondary">Dieser 3D-Raum wird schrittweise implementiert.</p>
      </div>
    </div>
  );
}
