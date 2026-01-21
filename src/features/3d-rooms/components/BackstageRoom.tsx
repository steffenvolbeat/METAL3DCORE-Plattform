"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Box,
  Plane,
  Html,
  Text,
  Cylinder,
  Sphere,
  OrbitControls,
  Sparkles,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";
import { FPSControls } from "@/shared/components/3d";
import { useSession } from "next-auth/react";
import { RoomAccessControl } from "./RoomAccessControl";

interface BackstageRoomProps {
  isFullscreen?: boolean;
  onRoomChange?: (room: string) => void;
}

const EQUALIZER_BAR_COUNT = 24;

// ANIMATED LIGHT SHOW
function AnimatedLightShow() {
  const lightRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={lightRef}>
      <Sphere args={[0.5]} position={[0, 6, 0]}>
        <meshStandardMaterial color="#C0C0C0" metalness={1} roughness={0} />
      </Sphere>
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 8, 0]}>
          <pointLight
            position={[5, 6, 0]}
            color={`hsl(${i * 45}, 100%, 70%)`}
            intensity={0.3}
            distance={8}
          />
        </group>
      ))}
    </group>
  );
}

// MUSIC VISUALIZER - DYNAMIC EQUALIZER (WALL MOUNTED)
function MusicVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const barRefs = useRef<Array<THREE.Mesh | null>>([]);
  const intensitiesRef = useRef<number[]>(
    Array.from({ length: EQUALIZER_BAR_COUNT }, () => 0.4)
  );

  useEffect(() => {
    // Ensure ref arrays stay aligned with the rendered bar count
    if (barRefs.current.length !== EQUALIZER_BAR_COUNT) {
      barRefs.current = Array.from(
        { length: EQUALIZER_BAR_COUNT },
        (_, index) => barRefs.current[index] ?? null
      );
    }

    if (intensitiesRef.current.length !== EQUALIZER_BAR_COUNT) {
      intensitiesRef.current = Array.from(
        { length: EQUALIZER_BAR_COUNT },
        () => 0.4
      );
    }
  }, []);

  useFrame((state) => {
    const bars = barRefs.current;
    if (!bars.length) {
      return;
    }

    const time = state.clock.elapsedTime;
    const idleHeight = 0.35;
    const smoothing = isPlaying ? 0.22 : 0.1;

    if (intensitiesRef.current.length !== EQUALIZER_BAR_COUNT) {
      intensitiesRef.current = Array.from(
        { length: EQUALIZER_BAR_COUNT },
        () => idleHeight
      );
    }

    const intensities = intensitiesRef.current;

    for (let i = 0; i < EQUALIZER_BAR_COUNT; i += 1) {
      const mesh = bars[i];
      if (!mesh) {
        continue;
      }

      const previous = intensities[i] ?? idleHeight;
      const waveA = Math.abs(Math.sin(time * (2.8 + i * 0.25)));
      const waveB = Math.abs(Math.sin(time * (4.4 + i * 0.17)));
      const waveC = Math.abs(Math.sin(time * (5.6 + i * 0.11)));

      const targetScale = isPlaying
        ? idleHeight + (waveA * 1.6 + waveB * 1.1 + waveC * 0.9)
        : idleHeight;

      const next = previous + (targetScale - previous) * smoothing;
      intensities[i] = next;

      const height = Math.max(next, idleHeight);
      mesh.scale.y = height;
      mesh.position.y = (height - 1) * 0.5;

      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = isPlaying ? 0.35 + height * 0.4 : 0.12;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[-14.5, 3, 0]}
      rotation={[0, Math.PI / 2, 0]}
    >
      {/* Equalizer Background Panel */}
      <Box args={[12, 6, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#000000" metalness={0.9} roughness={0.1} />
      </Box>

      {/* Equalizer Bars - 24 Bars */}
      {Array.from({ length: EQUALIZER_BAR_COUNT }).map((_, i) => {
        const hue = (i / EQUALIZER_BAR_COUNT) * 360;
        return (
          <Box
            key={i}
            args={[0.4, 1, 0.15]}
            position={[-5.5 + i * 0.5, -2, 0.15]}
            ref={(mesh) => {
              barRefs.current[i] = mesh;
            }}
          >
            <meshStandardMaterial
              color={`hsl(${hue}, 100%, 60%)`}
              emissive={`hsl(${hue}, 100%, 40%)`}
              emissiveIntensity={0.8}
              metalness={0.3}
              roughness={0.4}
            />
          </Box>
        );
      })}

      {/* Equalizer Title - VOR den Bars */}
      <Text
        position={[0, 3.5, 0.25]}
        fontSize={0.4}
        color="#00FF00"
        anchorX="center"
        anchorY="middle"
      >
        🎵 AUDIO EQUALIZER 🎵
      </Text>
    </group>
  );
}

// TEXTURE READY FRAME
function TextureReadyFrame({
  position,
  size,
  imageId,
  placeholderColor,
}: {
  position: [number, number, number];
  size: [number, number];
  imageId: string;
  placeholderColor: string;
}) {
  return (
    <group position={position}>
      {/* Frame */}
      <Box args={[size[0] + 0.3, size[1] + 0.3, 0.1]}>
        <meshStandardMaterial color="#000000" roughness={0.1} metalness={0.8} />
      </Box>
      {/* Image Area */}
      <Plane args={[size[0], size[1]]} position={[0, 0, 0.06]}>
        <meshStandardMaterial color={placeholderColor} roughness={0.8} />
      </Plane>
    </group>
  );
}

// YOUTUBE TV CONTROL
function YouTubeTVControl({
  youtubeUrl,
  setYoutubeUrl,
  currentVideoId,
  handleUrlSubmit,
  showYouTubePlayer,
  setShowYouTubePlayer,
  setCurrentVideoId,
  isCollapsed,
  onToggleCollapse,
}: {
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  currentVideoId: string;
  handleUrlSubmit: () => void;
  showYouTubePlayer: boolean;
  setShowYouTubePlayer: (show: boolean) => void;
  setCurrentVideoId: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const presetVideos = [
    { id: "CD-E-LDc384", title: "🤘 Metallica - Enter Sandman" },
    { id: "JFYVcz7h3o0", title: "🎸 Iron Maiden - The Trooper" },
    { id: "L397TWLwrUU", title: "🔥 Slayer - Raining Blood" },
    { id: "Nnjh-zp6pP4", title: "⚡ AC/DC - Thunderstruck" },
  ];

  return (
    <div className="w-[360px] rounded-2xl border border-blue-400/60 bg-gradient-to-br from-blue-950/90 via-slate-950/85 to-black/90 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-blue-400/40">
        <h3 className="text-blue-200 font-semibold text-xl tracking-wide">
          📺 TV Control Deck
        </h3>
        <button
          onClick={onToggleCollapse}
          className="rounded-full border border-blue-400/40 bg-slate-900/70 px-3 py-1 text-blue-200 transition-colors hover:border-blue-300/70 hover:text-blue-100"
          title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          {isCollapsed ? "▶️" : "🔽"}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-5 py-5 space-y-4">
          {/* Preset Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {presetVideos.map((video) => (
              <button
                key={video.id}
                onClick={() => {
                  setCurrentVideoId(video.id);
                  setShowYouTubePlayer(true);
                }}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all ${
                  currentVideoId === video.id
                    ? "border-blue-400 bg-blue-600/80 text-white shadow-inner"
                    : "border-blue-400/30 bg-slate-900/70 text-blue-200 hover:border-blue-400/60 hover:bg-slate-900"
                }`}
              >
                <span>{video.title}</span>
                <span>{currentVideoId === video.id ? "✓" : "▶"}</span>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-blue-200 text-sm font-semibold mb-2">
              📹 Eigene YouTube URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1 rounded-lg border border-blue-400/40 bg-slate-900/70 px-3 py-2 text-blue-100 focus:border-blue-300 focus:outline-none"
                placeholder="https://youtu.be/..."
              />
              <button
                onClick={handleUrlSubmit}
                className="rounded-lg border border-blue-400/50 bg-blue-600/80 px-4 py-2 font-bold text-white transition-all hover:border-blue-300 hover:bg-blue-600"
              >
                ▶️
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-sm text-blue-100">
              <span>🎚️ Player sichtbar</span>
              <span>{showYouTubePlayer ? "Aktiv" : "Deaktiviert"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowYouTubePlayer(!showYouTubePlayer)}
                className={`rounded-lg border px-3 py-2 font-semibold transition-all ${
                  showYouTubePlayer
                    ? "border-emerald-400 bg-emerald-600/80 text-white shadow-inner"
                    : "border-rose-400 bg-rose-600/80 text-white hover:border-rose-300"
                }`}
              >
                {showYouTubePlayer ? "✓ ON" : "✕ OFF"}
              </button>
              <button
                onClick={() => setCurrentVideoId("CD-E-LDc384")}
                className="rounded-lg border border-purple-400 bg-purple-600/80 px-3 py-2 font-semibold text-white transition-all hover:border-purple-300"
              >
                🔄 RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// BACKSTAGE CONTROL PANEL
function BackstageControlPanel({
  isCollapsed,
  onToggleCollapse,
}: {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [loungeMode, setLoungeMode] = useState("relaxed");
  const [ambiance, setAmbiance] = useState(75);

  const backstageServices = [
    { name: "Photo Gallery", icon: "🖼️", status: "Active" },
    { name: "Interview Setup", icon: "🎤", status: "Ready" },
    { name: "Photo Session", icon: "📸", status: "Standby" },
    { name: "Media Relations", icon: "📺", status: "Active" },
  ];

  return (
    <div className="w-[360px] rounded-2xl border border-purple-400/60 bg-gradient-to-br from-purple-950/92 via-slate-950/85 to-black/90 shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-purple-400/40">
        <h3 className="text-purple-200 font-semibold text-xl tracking-wide">
          🎭 Gallery Director
        </h3>
        <button
          onClick={onToggleCollapse}
          className="rounded-full border border-purple-400/40 bg-slate-900/70 px-3 py-1 text-purple-200 transition-colors hover:border-purple-300/60 hover:text-purple-100"
          title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
        >
          {isCollapsed ? "◀️" : "🔽"}
        </button>
      </div>

      {!isCollapsed && (
        <div className="max-h-[calc(100vh-160px)] w-[350px] overflow-y-auto px-6 py-6 space-y-6">
          <div className="flex items-center justify-center">
            <button
              onClick={() =>
                setLoungeMode(
                  loungeMode === "relaxed" ? "interview" : "relaxed"
                )
              }
              className={`rounded-xl px-4 py-2 font-semibold transition-all ${
                loungeMode === "relaxed"
                  ? "border border-purple-300 bg-purple-600/80 text-white shadow-inner"
                  : "border border-amber-300 bg-amber-600/80 text-white shadow-inner"
              }`}
            >
              {loungeMode === "relaxed" ? "🛋️ RELAX" : "🎤 INTERVIEW"}
            </button>
          </div>

          <div className="rounded-xl border border-slate-500/50 bg-gradient-to-br from-slate-900/80 via-black/70 to-slate-900/80 p-5 shadow-inner">
            <h4 className="mb-3 text-lg font-semibold text-slate-200">
              🖼️ FRONT GALLERY
            </h4>
            <div className="mb-2 text-center text-sm text-slate-300">
              19 Frames - Front Wall
            </div>
            <div className="grid grid-cols-4 gap-1 text-[0.7rem] text-slate-200">
              <div className="rounded bg-slate-900/70 p-1 text-center">
                <div className="text-slate-300">Main</div>
                <div className="font-semibold text-white">1</div>
              </div>
              <div className="rounded bg-slate-900/70 p-1 text-center">
                <div className="text-slate-300">Top</div>
                <div className="font-semibold text-white">5</div>
              </div>
              <div className="rounded bg-slate-900/70 p-1 text-center">
                <div className="text-slate-300">Sides</div>
                <div className="font-semibold text-white">8</div>
              </div>
              <div className="rounded bg-slate-900/70 p-1 text-center">
                <div className="text-slate-300">Bottom</div>
                <div className="font-semibold text-white">6</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-400/50 bg-gradient-to-br from-blue-900/80 via-slate-900/80 to-black/70 p-5 shadow-inner">
            <h4 className="mb-3 text-lg font-semibold text-blue-200">
              📺 GIANT TV
            </h4>
            <div className="mb-2 text-center text-sm text-blue-200/90">
              Back Wall TV - 19.5m x 7.5m
            </div>
            <div className="text-center text-xs text-blue-300/90">
              📍 Full Back Wall Coverage
            </div>
          </div>

          <div className="rounded-xl border border-purple-400/50 bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-black/70 p-5 shadow-inner">
            <h4 className="mb-3 text-lg font-semibold text-purple-200">
              🎵 AMBIANCE
            </h4>
            <div className="mb-2 h-4 w-full rounded-full bg-slate-800/80">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-200 transition-all duration-300"
                style={{ width: `${ambiance}%` }}
              ></div>
            </div>
            <div className="text-center font-semibold text-purple-100">
              {ambiance}% Comfortable
            </div>
          </div>

          <div className="rounded-xl border border-purple-400/40 bg-slate-950/80 p-5 shadow-inner">
            <h4 className="mb-4 text-lg font-semibold text-purple-200">
              🏆 VIP SERVICES
            </h4>
            <div className="space-y-3">
              {backstageServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-purple-400/40 bg-purple-900/30 px-3 py-2"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{service.icon}</span>
                    <span className="text-white font-medium">
                      {service.name}
                    </span>
                  </div>
                  <span className="rounded bg-purple-800/70 px-2 py-1 text-xs font-semibold text-purple-100">
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BackstageControlStationProps {
  showTVControl: boolean;
  showBackstageControl: boolean;
  setShowTVControl: React.Dispatch<React.SetStateAction<boolean>>;
  setShowBackstageControl: React.Dispatch<React.SetStateAction<boolean>>;
  tvControlCollapsed: boolean;
  setTvControlCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  galleryControlCollapsed: boolean;
  setGalleryControlCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  currentVideoId: string;
  handleUrlSubmit: () => void;
  showYouTubePlayer: boolean;
  setShowYouTubePlayer: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentVideoId: (id: string) => void;
  fpsMode: boolean;
  setFpsMode: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  onRoomChange?: (room: string) => void;
}

function BackstageControlStation({
  showTVControl,
  showBackstageControl,
  setShowTVControl,
  setShowBackstageControl,
  tvControlCollapsed,
  setTvControlCollapsed,
  galleryControlCollapsed,
  setGalleryControlCollapsed,
  youtubeUrl,
  setYoutubeUrl,
  currentVideoId,
  handleUrlSubmit,
  showYouTubePlayer,
  setShowYouTubePlayer,
  setCurrentVideoId,
  fpsMode,
  setFpsMode,
  isFullscreen,
  onRoomChange,
}: BackstageControlStationProps) {
  return (
    <group position={[14.7, 2.6, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <Html
        transform
        sprite={false}
        distanceFactor={8}
        occlude={false}
        style={{ pointerEvents: "auto" }}
      >
        <div className="flex w-[380px] flex-col space-y-4">
          <div className="rounded-2xl border border-purple-500/60 bg-gradient-to-br from-purple-950/95 via-black/90 to-slate-950/90 px-5 py-4 shadow-[0_22px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-purple-200/80">
              Control Console
              <div className="mx-3 h-[1px] flex-1 bg-purple-500/40" />
              VIP Deck
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTVControl((prev) => !prev)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition-all ${
                  showTVControl
                    ? "border-blue-400 bg-blue-600/80 text-white shadow-inner"
                    : "border-blue-400/30 bg-slate-900/70 text-blue-200 hover:border-blue-400/60 hover:bg-slate-900"
                }`}
                title="Toggle TV Control (T)"
              >
                📺
              </button>
              <button
                onClick={() => setShowBackstageControl((prev) => !prev)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition-all ${
                  showBackstageControl
                    ? "border-emerald-400 bg-emerald-600/80 text-white shadow-inner"
                    : "border-emerald-400/30 bg-slate-900/70 text-emerald-200 hover:border-emerald-400/60 hover:bg-slate-900"
                }`}
                title="Toggle Gallery Control (G)"
              >
                🎭
              </button>
              <button
                onClick={() => setFpsMode((prev) => !prev)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition-all ${
                  fpsMode
                    ? "border-purple-400 bg-purple-600/80 text-white shadow-inner"
                    : "border-purple-400/30 bg-slate-900/70 text-purple-200 hover:border-purple-400/60 hover:bg-slate-900"
                }`}
                title="Toggle Walk/View Mode"
              >
                {fpsMode ? "🎮" : "👁️"}
              </button>
              {isFullscreen && onRoomChange && (
                <button
                  onClick={() => onRoomChange("welcome")}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-400 bg-rose-600/80 text-white transition-all hover:border-rose-300 hover:bg-rose-600"
                  title="Exit Backstage"
                >
                  ⬅️
                </button>
              )}
            </div>
            <div className="mt-3 text-[0.65rem] text-purple-100/70">
              <span className="font-semibold text-purple-200">T</span> TV |
              <span className="font-semibold text-purple-200"> G</span> Gallery
              | Panels collapsible
              {isFullscreen && " | Exit = ⬅️"}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {showTVControl && (
              <YouTubeTVControl
                youtubeUrl={youtubeUrl}
                setYoutubeUrl={setYoutubeUrl}
                currentVideoId={currentVideoId}
                handleUrlSubmit={handleUrlSubmit}
                showYouTubePlayer={showYouTubePlayer}
                setShowYouTubePlayer={setShowYouTubePlayer}
                setCurrentVideoId={setCurrentVideoId}
                isCollapsed={tvControlCollapsed}
                onToggleCollapse={() => setTvControlCollapsed((prev) => !prev)}
              />
            )}

            {showBackstageControl && (
              <BackstageControlPanel
                isCollapsed={galleryControlCollapsed}
                onToggleCollapse={() =>
                  setGalleryControlCollapsed((prev) => !prev)
                }
              />
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

// MAIN BACKSTAGE ENVIRONMENT
function BackstageEnvironment({
  showYouTubePlayer,
  currentVideoId,
}: {
  showYouTubePlayer: boolean;
  currentVideoId: string;
}) {
  return (
    <group>
      {/* FLOOR */}
      <Plane
        args={[30, 22]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.1} />
      </Plane>

      {/* WALLS */}
      <Plane args={[30, 10]} position={[0, 3, -11]} receiveShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </Plane>

      <Plane args={[30, 10]} position={[0, 3, 11]} receiveShadow>
        <meshStandardMaterial
          color="#F5F5DC"
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </Plane>

      <Plane
        args={[22, 10]}
        position={[-15, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F5F5DC" roughness={0.8} />
      </Plane>

      <Plane
        args={[22, 10]}
        position={[15, 3, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F5F5DC" roughness={0.8} />
      </Plane>

      {/* CEILING */}
      <Plane
        args={[30, 22]}
        position={[0, 8, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </Plane>

      {/* PURPLE COUCH */}
      <group position={[0, -1, 2]}>
        <Box args={[6, 1.5, 2]} position={[0, 0.75, 0]} castShadow>
          <meshStandardMaterial
            color="#8B008B"
            roughness={0.1}
            metalness={0.2}
          />
        </Box>
        <Box args={[6, 2, 0.5]} position={[0, 1.5, 0.75]} castShadow>
          <meshStandardMaterial
            color="#8B008B"
            roughness={0.1}
            metalness={0.2}
          />
        </Box>
        <Box args={[0.5, 2, 2]} position={[-2.75, 1.5, 0]} castShadow>
          <meshStandardMaterial
            color="#8B008B"
            roughness={0.1}
            metalness={0.2}
          />
        </Box>
        <Box args={[0.5, 2, 2]} position={[2.75, 1.5, 0]} castShadow>
          <meshStandardMaterial
            color="#8B008B"
            roughness={0.1}
            metalness={0.2}
          />
        </Box>
      </group>

      {/* COFFEE TABLE */}
      <group position={[0, -1.5, -1]}>
        <Box args={[3, 0.3, 1.5]} position={[0, 0.4, 0]} castShadow>
          <meshStandardMaterial
            color="#654321"
            roughness={0.2}
            metalness={0.1}
          />
        </Box>
        {Array.from({ length: 4 }).map((_, i) => (
          <Cylinder
            key={i}
            args={[0.08, 0.08, 0.8]}
            position={[i % 2 === 0 ? -1.3 : 1.3, 0, i < 2 ? -0.6 : 0.6]}
            castShadow
          >
            <meshStandardMaterial
              color="#654321"
              roughness={0.2}
              metalness={0.1}
            />
          </Cylinder>
        ))}
      </group>

      {/* GIANT TV WALL */}
      <group position={[0, 3, -10.8]}>
        <Box args={[24, 9, 0.3]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial
            color="#000000"
            metalness={0.9}
            roughness={0.1}
          />
        </Box>

        {showYouTubePlayer ? (
          <Html
            position={[0, 0, 0.16]}
            center
            distanceFactor={10}
            occlude={false}
            zIndexRange={[0, 0]}
            style={{
              width: "2350px",
              height: "850px",
              pointerEvents: "auto",
            }}
          >
            <iframe
              width="2350"
              height="850"
              src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=0&controls=1`}
              title="YouTube Backstage Player"
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                border: "none",
                borderRadius: "0px",
              }}
            />
          </Html>
        ) : (
          <Plane args={[23.5, 8.5]} position={[0, 0, 0.16]}>
            <meshStandardMaterial
              color="#001122"
              emissive="#003366"
              emissiveIntensity={0.5}
            />
          </Plane>
        )}
      </group>

      {/* FRONT WALL GALLERY */}
      <group position={[0, 3, 10.8]}>
        <TextureReadyFrame
          position={[0, 0, 0]}
          size={[3, 2.5]}
          imageId="main-featured"
          placeholderColor="#FF6347"
        />

        {Array.from({ length: 5 }).map((_, i) => (
          <TextureReadyFrame
            key={`top-${i}`}
            position={[-10 + i * 5, 3.5, 0]}
            size={[1.2, 1.5]}
            imageId={`top-row-${i + 1}`}
            placeholderColor={
              i % 3 === 0 ? "#FF4500" : i % 3 === 1 ? "#9370DB" : "#20B2AA"
            }
          />
        ))}

        {Array.from({ length: 3 }).map((_, i) => (
          <TextureReadyFrame
            key={`left-${i}`}
            position={[-7.5, -1.5 + i * 2.5, 0]}
            size={[1.1, 1.4]}
            imageId={`left-side-${i + 1}`}
            placeholderColor={i % 2 === 0 ? "#FFD700" : "#FF69B4"}
          />
        ))}

        {Array.from({ length: 3 }).map((_, i) => (
          <TextureReadyFrame
            key={`right-${i}`}
            position={[7.5, -1.5 + i * 2.5, 0]}
            size={[1.1, 1.4]}
            imageId={`right-side-${i + 1}`}
            placeholderColor={i % 2 === 0 ? "#32CD32" : "#87CEEB"}
          />
        ))}

        {Array.from({ length: 6 }).map((_, i) => (
          <TextureReadyFrame
            key={`bottom-${i}`}
            position={[-10 + i * 4, -3.5, 0]}
            size={[1.1, 0.9]}
            imageId={`bottom-row-${i + 1}`}
            placeholderColor={
              i % 3 === 0 ? "#DC143C" : i % 3 === 1 ? "#00CED1" : "#FFD700"
            }
          />
        ))}
      </group>

      {/* MUSIC VISUALIZER */}
      <MusicVisualizer isPlaying={showYouTubePlayer} />

      {/* ANIMATED LIGHTS */}
      <AnimatedLightShow />

      {/* MAIN LIGHTING */}
      <ambientLight intensity={0.6} color="#FFF8DC" />
      <directionalLight
        position={[5, 10, 5]}
        intensity={2.0}
        color="#FFFFFF"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-5, 10, 5]}
        intensity={1.5}
        color="#FFFFFF"
      />

      {/* POINT LIGHTS */}
      <pointLight
        position={[-5, 5, 0]}
        intensity={1.5}
        color="#FFE4B5"
        distance={15}
      />
      <pointLight
        position={[5, 5, 0]}
        intensity={1.5}
        color="#FFE4B5"
        distance={15}
      />
      <pointLight
        position={[0, 5, -5]}
        intensity={2.0}
        color="#F0E68C"
        distance={15}
      />
      <pointLight
        position={[0, 5, 5]}
        intensity={2.0}
        color="#F0E68C"
        distance={15}
      />

      {/* EFFECTS */}
      <Sparkles
        count={100}
        scale={[15, 8, 10]}
        size={3}
        speed={0.5}
        opacity={0.6}
        color="#FFD700"
      />

      <Stars
        radius={20}
        depth={50}
        count={200}
        factor={4}
        saturation={0.8}
        fade={true}
        speed={0.5}
      />

      <Environment preset="city" />
    </group>
  );
}

// ACCESS CONTROL handled by RoomAccessControl component

// MAIN COMPONENT
export default function BackstageRoom({
  isFullscreen = true,
  onRoomChange,
}: BackstageRoomProps) {
  const [fpsMode, setFpsMode] = useState(true);
  const [showTVControl, setShowTVControl] = useState(false);
  const [showBackstageControl, setShowBackstageControl] = useState(false);
  const [tvControlCollapsed, setTvControlCollapsed] = useState(false);
  const [galleryControlCollapsed, setGalleryControlCollapsed] = useState(false);

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState("CD-E-LDc384");
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);

  const extractVideoId = (url: string) => {
    const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
    return videoId || "CD-E-LDc384";
  };

  const handleUrlSubmit = () => {
    if (youtubeUrl) {
      const videoId = extractVideoId(youtubeUrl);
      setCurrentVideoId(videoId);
      setShowYouTubePlayer(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "t":
          setShowTVControl((prev) => !prev);
          break;
        case "g":
          setShowBackstageControl((prev) => !prev);
          break;
        case "h":
          setShowTVControl(false);
          setShowBackstageControl(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <RoomAccessControl
      requiredAccess="backstage"
      roomName="Backstage Lounge"
      roomDescription="Der Backstage-Bereich ist exklusiv für VIP und Backstage-Ticket Inhaber"
    >
      <div
        className={`${
          isFullscreen ? "fixed inset-0 z-50" : "w-full h-screen"
        } bg-gradient-to-br from-amber-900 via-purple-900 to-black relative overflow-hidden border-4 border-purple-500`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-900 to-black text-purple-300">
              <div className="text-center">
                <div className="animate-pulse text-6xl mb-4">🎭</div>
                <p className="text-2xl font-bold">Loading Backstage...</p>
              </div>
            </div>
          }
        >
          <Canvas
            camera={{
              position: [0, 3, 8],
              fov: 75,
            }}
            className="w-full h-full"
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            shadows
            onCreated={({ gl, scene }) => {
              gl.setClearColor(new THREE.Color("#1a0a2e"), 1);
              scene.background = new THREE.Color("#1a0a2e");
              scene.fog = new THREE.Fog("#1a0a2e", 10, 50);
            }}
          >
            <BackstageEnvironment
              showYouTubePlayer={showYouTubePlayer}
              currentVideoId={currentVideoId}
            />

            <BackstageControlStation
              showTVControl={showTVControl}
              showBackstageControl={showBackstageControl}
              setShowTVControl={setShowTVControl}
              setShowBackstageControl={setShowBackstageControl}
              tvControlCollapsed={tvControlCollapsed}
              setTvControlCollapsed={setTvControlCollapsed}
              galleryControlCollapsed={galleryControlCollapsed}
              setGalleryControlCollapsed={setGalleryControlCollapsed}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              currentVideoId={currentVideoId}
              handleUrlSubmit={handleUrlSubmit}
              showYouTubePlayer={showYouTubePlayer}
              setShowYouTubePlayer={setShowYouTubePlayer}
              setCurrentVideoId={setCurrentVideoId}
              fpsMode={fpsMode}
              setFpsMode={setFpsMode}
              isFullscreen={isFullscreen}
              onRoomChange={onRoomChange}
            />

            {fpsMode ? (
              <FPSControls
                movementSpeed={8}
                lookSpeed={0.003}
                enabled={true}
                boundaries={{ minX: -13, maxX: 13, minZ: -9, maxZ: 9 }}
              />
            ) : (
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={15}
                maxPolarAngle={Math.PI / 2}
                minPolarAngle={0.1}
              />
            )}
          </Canvas>
        </Suspense>
        {/* NAVIGATION CONTROLS */}
        {!isFullscreen && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-black/95 backdrop-blur-md rounded-xl px-8 py-6 border-2 border-purple-500">
              <p className="text-purple-300 text-lg text-center mb-4 font-bold">
                🎭 BACKSTAGE LOUNGE 🎭
              </p>
              {fpsMode && (
                <div className="text-center mb-4 text-sm text-blue-300 space-y-1">
                  <p>
                    🖱️ <strong>Click to Lock Mouse</strong> | 🎮{" "}
                    <strong>WASD</strong> = Move | <strong>Space/Shift</strong>{" "}
                    = Up/Down
                  </p>
                  <p className="text-xs text-blue-200">Press ESC to unlock</p>
                </div>
              )}
              <div className="flex space-x-6 text-sm text-purple-200 justify-center mb-4">
                <span>🛋️ Luxury Furniture</span>
                <span>🖼️ Front Gallery</span>
                <span>📺 Giant TV</span>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setFpsMode(!fpsMode)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all border-2 ${
                    fpsMode
                      ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-400"
                      : "bg-black hover:bg-gray-900 text-purple-300 border-purple-500"
                  }`}
                >
                  {fpsMode ? "🎮 WALK MODE" : "👁️ VIEW MODE"}
                </button>
                {onRoomChange && (
                  <button
                    onClick={() => onRoomChange("welcome")}
                    className="px-6 py-3 rounded-lg font-bold bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-600 transition-all"
                  >
                    ← EXIT
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AMBIENT OVERLAY */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-purple-400/20 text-6xl font-bold">
              🎭 VIP BACKSTAGE EXPERIENCE 🎭
            </div>
          </div>
        </div>
      </div>
    </RoomAccessControl>
  );
}
