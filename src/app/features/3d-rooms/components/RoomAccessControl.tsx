"use client";

// 🎸 Room Access Control Component
// Lightweight placeholder that gates protected 3D rooms until real access checks are added

// import { useSession } from "next-auth/react";
import { useState, useEffect, ReactNode } from "react";
// import { userRole, TicketType } from "@prisma/client";
// import {calculateAccessRights} from "@/app/lib/access-rights";

interface RoomAccessControlProps {
  requiredRoom?: string;
  roomName?: string;
  roomDescription?: string;
  isFullscreen?: boolean;
  onRoomChange?: (room: string) => void;
  children: ReactNode;
}

export function RoomAccessControl({
  requiredRoom,
  roomName,
  roomDescription,
  isFullscreen,
  onRoomChange,
  children,
}: RoomAccessControlProps) {
  return (
    <div className="w-full h-full">
      {/* Placeholder banner; replace with real auth/ticket checks later */}
      <div className="mb-4 rounded-2xl border border-theme-secondary/70 bg-black/40 px-4 py-3 text-sm text-theme-secondary">
        <div className="font-semibold text-theme-primary">{roomName ?? "Protected Room"}</div>
        <div>{roomDescription ?? "Zugriffskontrolle wird noch implementiert."}</div>
        {isFullscreen && <div className="mt-2 text-xs text-theme-secondary/80">Fullscreen aktiv</div>}
        {onRoomChange && (
          <button
            className="mt-3 button-secondary"
            onClick={() => onRoomChange("welcome")}
            aria-label="Zurück zur Welcome Stage"
          >
            Zurück zur Welcome Stage
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
