"use client";

import { useState, useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";

interface SettingsControlsProps {
  onSettingsChange?: (settings: PerformanceSettings) => void;
}

interface PerformanceSettings {
  particleDensity: number;
  shaderQuality: "low" | "medium" | "high";
  audioEnabled: boolean;
  cinematicEnabled: boolean;
  interactiveEnabled: boolean;
  antialiasing: boolean;
  shadows: boolean;
  autoQuality: boolean;
}

// Canvas-internal Performance Monitor
export function CanvasPerformanceMonitor() {
  const { gl, scene } = useThree();

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let lastStats = performance.now();

    const measurePerformance = () => {
      frameCount++;
      const now = performance.now();

      // Update stats every second
      if (now - lastStats >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastStats));

        // WebGL info
        const info = gl.info;

        // Store performance data globally for external UI
        if (typeof window !== "undefined") {
          (window as any).__3d_performance_stats = {
            fps,
            renderTime: now - lastTime,
            triangles: info.render.triangles,
            drawCalls: info.render.calls,
            geometries: info.memory.geometries,
            textures: info.memory.textures,
            memoryUsed: (performance as any).memory?.usedJSHeapSize
              ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
              : 0,
          };
        }

        frameCount = 0;
        lastStats = now;
      }

      lastTime = now;
      requestAnimationFrame(measurePerformance);
    };

    measurePerformance();
  }, [gl]);

  // Canvas components can only return THREE.js objects or null
  return null;
}

// External Performance Monitor (no hooks)
export function PerformanceMonitor() {
  const [stats, setStats] = useState({
    fps: 60,
    renderTime: 0,
    triangles: 0,
    drawCalls: 0,
    geometries: 0,
    textures: 0,
    memoryUsed: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      if (
        typeof window !== "undefined" &&
        (window as any).__3d_performance_stats
      ) {
        setStats((window as any).__3d_performance_stats);
      }
    };

    const interval = setInterval(updateStats, 100); // Update every 100ms
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-black/80 backdrop-blur-sm border border-blue-500/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 text-left text-blue-400 hover:bg-blue-900/20 transition-colors"
      >
        <span className="text-sm font-bold">
          📊 FPS: {stats.fps}{" "}
          {stats.fps < 30 ? "🔴" : stats.fps < 50 ? "🟡" : "🟢"}
        </span>
      </button>

      {isExpanded && (
        <div className="p-3 border-t border-blue-500/30 text-xs text-white space-y-1">
          <div>Render Time: {stats.renderTime.toFixed(1)}ms</div>
          <div>Draw Calls: {stats.drawCalls}</div>
          <div>Triangles: {stats.triangles.toLocaleString()}</div>
          <div>Geometries: {stats.geometries}</div>
          <div>Textures: {stats.textures}</div>
          {stats.memoryUsed > 0 && <div>Memory: {stats.memoryUsed}MB</div>}
          <div className="text-gray-400 text-xs mt-2">Click to minimize</div>
        </div>
      )}
    </div>
  );
}

// Asset Preloader Component
export function AssetPreloader({
  onProgress,
}: {
  onProgress?: (progress: number) => void;
}) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAssetIndex, setCurrentAssetIndex] = useState(0);

  const assets = useMemo(
    () => [
      "Audio System",
      "Particle Shaders",
      "Material Textures",
      "Geometry Buffers",
      "GLSL Shaders",
      "Interactive Controls",
      "Camera Sequences",
      "Mobile Optimization",
    ],
    []
  );

  useEffect(() => {
    let currentAsset = 0;
    const totalAssets = assets.length;

    const loadAsset = () => {
      if (currentAsset >= totalAssets) {
        // Ensure we complete the final asset visually
        setCurrentAssetIndex(totalAssets);
        setLoadingProgress(100);
        onProgress?.(100);

        // Wait a bit to show completion, then hide preloader
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
        return;
      }

      // Progressive loading per asset
      const assetProgress = (currentAsset / totalAssets) * 100;
      setLoadingProgress(assetProgress);
      setCurrentAssetIndex(currentAsset);
      onProgress?.(assetProgress);

      // Simulate realistic loading time per asset
      const loadTime = Math.random() * 800 + 400; // 400-1200ms per asset

      setTimeout(() => {
        currentAsset++;
        loadAsset();
      }, loadTime);
    };

    // Start loading after a short delay
    const startTimeout = setTimeout(() => {
      loadAsset();
    }, 300);

    return () => clearTimeout(startTimeout);
  }, [onProgress, assets]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 border border-orange-500/50 rounded-lg p-8 max-w-md w-full mx-4">
        <h3 className="text-orange-400 font-bold text-xl mb-4">
          🚀 Loading Metal3DCore Plattform
        </h3>

        <div className="space-y-3">
          {assets.map((asset, index) => (
            <div key={asset} className="flex items-center space-x-3">
              <div className="w-4 h-4">
                {index < currentAssetIndex ? (
                  <span className="text-green-400">✅</span>
                ) : index === currentAssetIndex ? (
                  <div className="w-3 h-3 border-2 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
                ) : (
                  <span className="text-gray-600">⭕</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  index < currentAssetIndex
                    ? "text-green-400"
                    : index === currentAssetIndex
                    ? "text-orange-400 font-bold"
                    : "text-gray-400"
                }`}
              >
                {asset}
                {index === currentAssetIndex && " ⏳"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm text-orange-400 font-bold">
              {Math.round(loadingProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Initializing cosmic engines...
        </div>
      </div>
    </div>
  );
}

// Advanced Settings Panel
export function AdvancedSettingsPanel({
  onSettingsChange,
}: SettingsControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PerformanceSettings>({
    particleDensity: 1.0,
    shaderQuality: "high",
    audioEnabled: true,
    cinematicEnabled: true,
    interactiveEnabled: true,
    antialiasing: true,
    shadows: false,
    autoQuality: true,
  });

  const handleSettingChange = <T extends keyof PerformanceSettings>(
    key: T,
    value: PerformanceSettings[T]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const presets = {
    ultra: {
      ...settings,
      particleDensity: 1.0,
      shaderQuality: "high" as const,
      antialiasing: true,
      shadows: true,
    },
    balanced: {
      ...settings,
      particleDensity: 0.7,
      shaderQuality: "medium" as const,
      antialiasing: true,
      shadows: false,
    },
    performance: {
      ...settings,
      particleDensity: 0.4,
      shaderQuality: "low" as const,
      antialiasing: false,
      shadows: false,
    },
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    const preset = presets[presetName];
    setSettings(preset);
    onSettingsChange?.(preset);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105"
      >
        ⚙️ Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 border border-purple-500/50 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-purple-400 font-bold text-xl">
                ⚙️ ULTRA Settings Panel
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Performance Presets */}
            <div className="mb-6">
              <h3 className="text-orange-400 font-bold mb-3">
                🎯 Quick Presets
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => applyPreset("ultra")}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-bold transition-colors"
                >
                  🔥 ULTRA
                </button>
                <button
                  onClick={() => applyPreset("balanced")}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-bold transition-colors"
                >
                  ⚖️ Balanced
                </button>
                <button
                  onClick={() => applyPreset("performance")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-bold transition-colors"
                >
                  ⚡ Fast
                </button>
              </div>
            </div>

            {/* Detailed Settings */}
            <div className="space-y-4">
              {/* Particle Density */}
              <div>
                <label className="text-blue-400 font-bold mb-2 block">
                  ✨ Particle Density:{" "}
                  {Math.round(settings.particleDensity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={settings.particleDensity}
                  onChange={(e) =>
                    handleSettingChange(
                      "particleDensity",
                      parseFloat(e.target.value)
                    )
                  }
                  className="w-full"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Lower values improve performance on older devices
                </div>
              </div>

              {/* Shader Quality */}
              <div>
                <label className="text-blue-400 font-bold mb-2 block">
                  🎨 Shader Quality
                </label>
                <select
                  value={settings.shaderQuality}
                  onChange={(e) =>
                    handleSettingChange("shaderQuality", e.target.value as any)
                  }
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="low">Low - Basic effects</option>
                  <option value="medium">Medium - Standard effects</option>
                  <option value="high">High - Full GLSL shaders</option>
                </select>
              </div>

              {/* Feature Toggles */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.audioEnabled}
                    onChange={(e) =>
                      handleSettingChange("audioEnabled", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-white text-sm">🎵 Audio System</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.cinematicEnabled}
                    onChange={(e) =>
                      handleSettingChange("cinematicEnabled", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-white text-sm">🎬 Cinematic Mode</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.interactiveEnabled}
                    onChange={(e) =>
                      handleSettingChange(
                        "interactiveEnabled",
                        e.target.checked
                      )
                    }
                    className="rounded"
                  />
                  <span className="text-white text-sm">
                    🎮 Interactive Controls
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.antialiasing}
                    onChange={(e) =>
                      handleSettingChange("antialiasing", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-white text-sm">🖼️ Anti-aliasing</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.shadows}
                    onChange={(e) =>
                      handleSettingChange("shadows", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-white text-sm">🌫️ Shadows</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.autoQuality}
                    onChange={(e) =>
                      handleSettingChange("autoQuality", e.target.checked)
                    }
                    className="rounded"
                  />
                  <span className="text-white text-sm">🤖 Auto Quality</span>
                </label>
              </div>
            </div>

            {/* Save/Reset */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setSettings({
                    particleDensity: 1.0,
                    shaderQuality: "high",
                    audioEnabled: true,
                    cinematicEnabled: true,
                    interactiveEnabled: true,
                    antialiasing: true,
                    shadows: false,
                    autoQuality: true,
                  });
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"
              >
                🔄 Reset to Defaults
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors"
              >
                💾 Apply & Close
              </button>
            </div>

            <div className="mt-4 p-3 bg-blue-900/30 rounded border border-blue-500/30">
              <div className="text-blue-400 text-sm font-bold mb-1">
                💡 Pro Tip:
              </div>
              <div className="text-gray-300 text-xs">
                Use Performance preset on mobile devices. ULTRA preset requires
                a powerful graphics card. Auto Quality adjusts settings based on
                your device capabilities.
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Main Settings and Performance Component
export default function SettingsAndPerformance({
  onSettingsChange,
}: SettingsControlsProps) {
  const [showPreloader, setShowPreloader] = useState(true);

  return (
    <>
      {showPreloader && (
        <AssetPreloader
          onProgress={(progress) => {
            if (progress >= 100) {
              setTimeout(() => setShowPreloader(false), 1000);
            }
          }}
        />
      )}

      <PerformanceMonitor />
      <AdvancedSettingsPanel onSettingsChange={onSettingsChange} />
    </>
  );
}
