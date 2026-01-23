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
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWebGL = () => {
      try {
        // Check if WebGL is available at all
        if (typeof WebGLRenderingContext === "undefined") {
          console.warn("WebGLRenderingContext not available");
          setWebglAvailable(false);
          return;
        }

        const canvas = document.createElement("canvas");

        // Try to get WebGL context with fail-fast options
        const gl =
          canvas.getContext("webgl", {
            failIfMajorPerformanceCaveat: true,
            antialias: false,
          }) ||
          canvas.getContext("experimental-webgl", {
            failIfMajorPerformanceCaveat: true,
            antialias: false,
          });

        if (!gl || !(gl instanceof WebGLRenderingContext)) {
          console.warn("WebGL context could not be created - using fallback");
          setWebglAvailable(false);
          return;
        }

        // Additional WebGL capability checks
        const vendor = gl.getParameter(gl.VENDOR) || "";
        const renderer = gl.getParameter(gl.RENDERER) || "";

        console.log("WebGL Info:", { vendor, renderer });

        // Check for disabled WebGL (common signs of WebGL being disabled)
        if (
          vendor.includes("Disabled") ||
          renderer.includes("Disabled") ||
          vendor === "0xffff" ||
          renderer === "0xffff" ||
          vendor.toLowerCase().includes("software") ||
          renderer.toLowerCase().includes("software") ||
          renderer.toLowerCase().includes("swiftshader") ||
          vendor === "" ||
          renderer === ""
        ) {
          console.warn("WebGL is disabled, software-only, or unavailable - using fallback");
          setWebglAvailable(false);
          return;
        }

        // Test basic WebGL functionality
        const buffer = gl.createBuffer();
        if (!buffer) {
          console.warn("WebGL basic functionality test failed - using fallback");
          setWebglAvailable(false);
          return;
        }

        // Test buffer operations
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, 2, 3, 4]), gl.STATIC_DRAW);

        // Check for errors
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
          console.warn("WebGL error during buffer test:", error);
          setWebglAvailable(false);
          return;
        }

        // Try shader compilation test
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        if (!vertexShader) {
          console.warn("Could not create vertex shader");
          setWebglAvailable(false);
          return;
        }

        gl.shaderSource(vertexShader, "attribute vec4 a_position; void main() { gl_Position = a_position; }");
        gl.compileShader(vertexShader);

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
          console.warn("Shader compilation failed");
          setWebglAvailable(false);
          return;
        }

        // Clean up test resources
        gl.deleteShader(vertexShader);
        gl.deleteBuffer(buffer);

        // Lose context to free resources
        const loseContext = gl.getExtension("WEBGL_lose_context");
        if (loseContext) {
          loseContext.loseContext();
        }

        console.log("WebGL is available and functional");
        setWebglAvailable(true);
      } catch (e) {
        console.warn("WebGL check failed with error:", e);
        setWebglAvailable(false);
      }
    };

    checkWebGL();
  }, []);

  if (webglAvailable === null) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400">Initializing 3D Environment...</p>
        </div>
      </div>
    );
  }

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
          ? "fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black"
          : "w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden flex items-center justify-center"
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
