"use client";

import React, { useState, useEffect } from "react";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

interface WebGLCanvasWrapperProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  roomName?: string;
  roomIcon?: string;
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
}

// WebGL Availability Check Component
function WebGLAvailabilityChecker({ children, fallback }: { children: React.ReactNode; fallback: React.ReactNode }) {
  const [webglAvailable, setWebglAvailable] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (typeof WebGLRenderingContext === "undefined") {
        console.warn("WebGLRenderingContext not available");
        setWebglAvailable(false);
        return;
      }

      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2", { antialias: false }) ||
        canvas.getContext("webgl", { antialias: false }) ||
        canvas.getContext("experimental-webgl", { antialias: false });

      if (!gl) {
        console.warn("WebGL context could not be created - using fallback");
        setWebglAvailable(false);
      }
    } catch (e) {
      console.warn("WebGL check failed with error:", e);
      setWebglAvailable(false);
    }
  }, []);

  return webglAvailable ? <>{children}</> : <>{fallback}</>;
}

// Generic fallback component
function GenericWebGLFallback({
  roomName = "3D Room",
  roomIcon = "🎮",
  onRoomChange,
  isFullscreen = false,
}: {
  roomName?: string;
  roomIcon?: string;
  onRoomChange?: (room: string) => void;
  isFullscreen?: boolean;
}) {
  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-linear-to-b from-gray-900 to-black"
          : "w-full h-full bg-linear-to-b from-gray-900 to-black rounded-lg overflow-hidden flex items-center justify-center"
      }
    >
      <div className="text-center space-y-6 p-8 max-w-md mx-auto">
        <div className="text-8xl mb-6 animate-bounce">{roomIcon}</div>
        <h2 className="text-4xl font-bold text-white mb-4">{roomName}</h2>
        <p className="text-gray-300 mb-8 text-lg leading-relaxed">
          3D-Navigation ist auf diesem System nicht verfügbar.
          <br />
          WebGL wird möglicherweise nicht unterstützt.
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <button
            onClick={() => onRoomChange?.("welcome")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            🏠 Welcome
          </button>
          <button
            onClick={() => onRoomChange?.("gallery")}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
          >
            🖼️ Gallery
          </button>
          <button
            onClick={() => onRoomChange?.("tickets")}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
          >
            🎫 Tickets
          </button>
          <button
            onClick={() => onRoomChange?.("backstage")}
            className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded transition-colors"
          >
            🎸 Backstage
          </button>
        </div>

        <div className="text-xs text-gray-400 mt-6 space-y-2">
          <p>💡 Lösungsvorschläge:</p>
          <ul className="list-disc list-inside text-left space-y-1">
            <li>Browser aktualisieren</li>
            <li>Hardware-Beschleunigung aktivieren</li>
            <li>Anderen Browser verwenden (Chrome/Firefox)</li>
            <li>GPU-Treiber aktualisieren</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function WebGLCanvasWrapper({
  children,
  fallbackComponent,
  roomName,
  roomIcon,
  onRoomChange,
  isFullscreen = false,
}: WebGLCanvasWrapperProps) {
  const fallback = fallbackComponent || (
    <GenericWebGLFallback
      roomName={roomName}
      roomIcon={roomIcon}
      onRoomChange={onRoomChange}
      isFullscreen={isFullscreen}
    />
  );

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <WebGLAvailabilityChecker fallback={fallback}>{children}</WebGLAvailabilityChecker>
    </WebGLErrorBoundary>
  );
}

export default WebGLCanvasWrapper;
