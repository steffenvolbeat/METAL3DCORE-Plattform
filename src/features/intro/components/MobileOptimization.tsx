"use client";

import { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";

interface MobileOptimizationProps {
  onPerformanceChange?: (level: "high" | "medium" | "low") => void;
}

// Mobile Detection Hook
export function useDeviceDetection() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isLowEnd: false,
    screenSize: "desktop" as "mobile" | "tablet" | "desktop",
    supportsTouch: false,
    pixelRatio: 1,
  });

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /mobile|android|ios|iphone|ipod|ipad/.test(userAgent);
      const isTablet = /tablet|ipad/.test(userAgent) && !isMobile;

      // Performance indicators
      const hardwareConcurrency = navigator.hardwareConcurrency || 1;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const isLowEnd = hardwareConcurrency < 4 || deviceMemory < 4;

      // Screen size detection
      const width = window.innerWidth;
      let screenSize: "mobile" | "tablet" | "desktop" = "desktop";
      if (width < 768) screenSize = "mobile";
      else if (width < 1024) screenSize = "tablet";

      setDeviceInfo({
        isMobile,
        isTablet,
        isLowEnd,
        screenSize,
        supportsTouch: "ontouchstart" in window,
        pixelRatio: window.devicePixelRatio || 1,
      });
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return deviceInfo;
}

// Canvas-interne Renderer Optimierung
export function CanvasPerformanceOptimizer({
  performanceLevel,
}: {
  performanceLevel: "high" | "medium" | "low";
}) {
  const { gl } = useThree();

  useEffect(() => {
    // Apply renderer optimizations inside Canvas
    switch (performanceLevel) {
      case "low":
        gl.setPixelRatio(Math.min(1, window.devicePixelRatio));
        break;
      case "medium":
        gl.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
        break;
      case "high":
        gl.setPixelRatio(window.devicePixelRatio);
        break;
    }
  }, [gl, performanceLevel]);

  return null; // Diese Komponente rendert nichts, optimiert nur
}

// Performance Optimizer Component (ohne useThree - läuft außerhalb Canvas)
export function PerformanceOptimizer({
  onPerformanceChange,
}: MobileOptimizationProps) {
  const device = useDeviceDetection();
  const [performanceLevel, setPerformanceLevel] = useState<
    "high" | "medium" | "low"
  >("high");
  const [fps, setFps] = useState(60);

  useEffect(() => {
    // Auto-adjust performance based on device
    let level: "high" | "medium" | "low" = "high";

    if (device.isMobile || device.isLowEnd) {
      level = "low";
    } else if (device.isTablet || device.pixelRatio > 2) {
      level = "medium";
    }

    setPerformanceLevel(level);
    onPerformanceChange?.(level);

    // Note: Renderer optimizations müssen innerhalb des Canvas gesetzt werden
    // Dies wird durch die Canvas-Props oder useEffect in den 3D-Komponenten gemacht
  }, [device, onPerformanceChange]);

  // FPS Monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();

      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }

      requestAnimationFrame(measureFPS);
    };

    measureFPS();
  }, []);

  return null; // Performance Display entfernt - sauberes Interface!
}

// Responsive UI Component
export function ResponsiveUI({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const device = useDeviceDetection();

  const getResponsiveClasses = () => {
    const base = className;

    if (device.screenSize === "mobile") {
      return `${base} text-sm p-2 space-y-2`;
    } else if (device.screenSize === "tablet") {
      return `${base} text-base p-3 space-y-3`;
    } else {
      return `${base} text-lg p-4 space-y-4`;
    }
  };

  return <div className={getResponsiveClasses()}>{children}</div>;
}

// Touch-friendly Controls
export function TouchControls({
  onAction,
  beatData,
}: {
  onAction?: (action: string) => void;
  beatData?: { beat: boolean; intensity: number };
}) {
  const device = useDeviceDetection();

  if (!device.supportsTouch) return null;

  const handleTouch = (action: string) => {
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    onAction?.(action);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex space-x-2">
      {device.screenSize === "mobile" && (
        <>
          {/* Virtual Joystick Area */}
          <div
            className="w-16 h-16 bg-black/60 rounded-full border-2 border-orange-500/50 flex items-center justify-center touch-manipulation"
            onTouchStart={() => handleTouch("move")}
          >
            <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-1">
            <button
              className={`w-12 h-12 bg-purple-600/80 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all touch-manipulation ${
                beatData?.beat ? "scale-110 bg-purple-500" : ""
              }`}
              onTouchStart={() => handleTouch("cinematic")}
            >
              🎬
            </button>
            <button
              className="w-12 h-12 bg-blue-600/80 rounded-full flex items-center justify-center text-white text-xs font-bold touch-manipulation"
              onTouchStart={() => handleTouch("interactive")}
            >
              🎮
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Adaptive Particle Count
export function useAdaptiveParticleCount() {
  const device = useDeviceDetection();
  const [particleCount, setParticleCount] = useState({
    stars: 5000,
    explosions: 2000,
    nebula: 1000,
    meteors: 150,
  });

  useEffect(() => {
    let multiplier = 1;

    if (device.isLowEnd || device.screenSize === "mobile") {
      multiplier = 0.3; // 70% reduction
    } else if (device.screenSize === "tablet") {
      multiplier = 0.6; // 40% reduction
    }

    setParticleCount({
      stars: Math.floor(5000 * multiplier),
      explosions: Math.floor(2000 * multiplier),
      nebula: Math.floor(1000 * multiplier),
      meteors: Math.floor(150 * multiplier),
    });
  }, [device]);

  return particleCount;
}

// Quality Settings Panel
export function QualitySettings({
  onQualityChange,
}: {
  onQualityChange?: (quality: "high" | "medium" | "low") => void;
}) {
  const device = useDeviceDetection();
  const [isOpen, setIsOpen] = useState(false);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");

  const handleQualityChange = (newQuality: "high" | "medium" | "low") => {
    setQuality(newQuality);
    onQualityChange?.(newQuality);
  };

  if (device.screenSize === "mobile") {
    // Mobile: Simple toggle
    return (
      <button
        onClick={() => {
          const newQuality = quality === "high" ? "low" : "high";
          handleQualityChange(newQuality);
        }}
        className={`fixed top-4 right-4 z-50 px-3 py-1 rounded text-xs font-bold ${
          quality === "high"
            ? "bg-green-600 text-white"
            : "bg-orange-600 text-white"
        }`}
      >
        Quality: {quality.toUpperCase()}
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold text-sm"
      >
        ⚙️ Quality
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-black/90 backdrop-blur-sm border border-gray-600 rounded-lg p-4 min-w-48">
          <h4 className="text-white font-bold mb-3">Quality Settings</h4>
          <div className="space-y-2">
            {(["high", "medium", "low"] as const).map((level) => (
              <button
                key={level}
                onClick={() => handleQualityChange(level)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  quality === level
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
                {level === "low" && device.isMobile && (
                  <span className="text-xs text-green-400 ml-2">
                    Recommended
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Mobile Optimization Component
export default function MobileOptimization({
  onPerformanceChange,
}: MobileOptimizationProps) {
  const device = useDeviceDetection();

  return (
    <>
      <PerformanceOptimizer onPerformanceChange={onPerformanceChange} />

      {device.supportsTouch && (
        <TouchControls
          onAction={(action) => console.log(`Touch action: ${action}`)}
        />
      )}

      <QualitySettings onQualityChange={onPerformanceChange} />
    </>
  );
}
