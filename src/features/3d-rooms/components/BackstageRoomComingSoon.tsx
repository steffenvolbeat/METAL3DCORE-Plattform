"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Plane } from "@react-three/drei";
import * as THREE from "three";
import { useSession } from "next-auth/react";
import { FPSControls } from "@/shared/components/3d";
import { RoomAccessControl } from "./RoomAccessControl";
import { WebGLCanvasWrapper } from "@/shared/components/WebGLCanvasWrapper";

interface BackstageRoomProps {
  isFullscreen?: boolean;
  onRoomChange?: (room: string) => void;
}

// Vereinfachte 3D Scene für Coming Soon
function BackstageScene3D() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#9333ea" />
      <pointLight position={[10, 5, -10]} intensity={0.8} color="#ec4899" />

      {/* Floor */}
      <Plane args={[40, 40]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
      </Plane>

      {/* Walls */}
      <Plane args={[40, 25]} position={[0, 10.5, -20]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Plane>

      <Plane args={[40, 25]} position={[20, 10.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Plane>

      <Plane args={[40, 25]} position={[-20, 10.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Plane>

      {/* VIP Stage Platform */}
      <Box args={[12, 1, 8]} position={[0, -1, -10]} castShadow>
        <meshStandardMaterial color="#4a0080" metalness={0.6} roughness={0.3} />
      </Box>

      {/* Luxury Furniture - Sofas */}
      {[-8, -2, 4].map((x, i) => (
        <group key={i} position={[x, 0.5, 8]}>
          <Box args={[2, 0.8, 2]} castShadow>
            <meshStandardMaterial color="#4a0000" />
          </Box>
        </group>
      ))}

      {/* Decorative Elements */}
      <Box args={[1, 3, 1]} position={[-15, 1.5, -15]} castShadow>
        <meshStandardMaterial color="#8B0000" />
      </Box>
      <Box args={[1, 3, 1]} position={[15, 1.5, -15]} castShadow>
        <meshStandardMaterial color="#8B0000" />
      </Box>

      {/* Ceiling */}
      <Plane args={[40, 40]} rotation={[Math.PI / 2, 0, 0]} position={[0, 23, 0]}>
        <meshStandardMaterial color="#2a2a2a" />
      </Plane>
    </>
  );
}

// MAIN COMPONENT - COMING SOON PAGE
export default function BackstageRoomComingSoon({ isFullscreen = true, onRoomChange }: BackstageRoomProps) {
  const { data: session } = useSession();
  const [countdown, setCountdown] = useState({
    days: 22,
    hours: 14,
    minutes: 37,
    seconds: 52,
  });

  // Countdown Timer Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <RoomAccessControl
      requiredAccess="backstage"
      roomName="Backstage VIP Lounge - Coming Soon"
      roomDescription="Die Backstage VIP Lounge kommt bald - exklusiver Premium-Bereich für VIP-Ticket Inhaber!"
    >
      <div
        className={`${
          isFullscreen ? "fixed inset-0 z-50" : "w-full h-screen"
        } bg-gradient-to-br from-amber-900 via-purple-900 to-black relative overflow-hidden border-4 border-purple-500`}
      >
        <WebGLCanvasWrapper
          roomName="Backstage VIP Lounge"
          roomIcon="🎭"
          onRoomChange={onRoomChange}
          isFullscreen={isFullscreen}
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
              camera={{ position: [0, 8, 20], fov: 60 }}
              shadows
              className="w-full h-full"
              onCreated={state => {
                console.log("Backstage Canvas created successfully with WebGL context");
              }}
            >
              <BackstageScene3D />
              <FPSControls
                movementSpeed={10}
                lookSpeed={0.002}
                enabled={true}
                boundaries={{ minX: -18, maxX: 18, minZ: -18, maxZ: 18 }}
              />
            </Canvas>
          </Suspense>
        </WebGLCanvasWrapper>

        {/* Coming Soon Interface */}
        <div className="absolute top-4 left-4 bg-gray-900/95 backdrop-blur-md p-6 rounded-xl border border-purple-500 w-96 max-h-[80vh] overflow-y-auto">
          <div className="text-center mb-4">
            <h3 className="text-purple-400 font-bold text-xl mb-2">🎭 Backstage VIP Lounge</h3>
            <div className="text-yellow-400 font-bold text-lg">COMING SOON</div>
          </div>

          {/* VIP Preview Badge */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg mb-4 text-center">
            <div className="text-2xl mb-2">👑</div>
            <div className="text-white font-bold">PREMIUM VIP EXPERIENCE</div>
            <div className="text-purple-200 text-sm">Exklusiv für VIP-Tickets</div>
          </div>

          {/* Countdown */}
          <div className="bg-black/30 p-4 rounded-lg mb-4">
            <div className="text-center text-white mb-3">
              <div className="text-sm text-gray-400 mb-2">VIP Launch Countdown</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-purple-600 rounded p-2">
                  <div className="text-xl font-bold">{countdown.days}</div>
                  <div className="text-xs">Tage</div>
                </div>
                <div className="bg-purple-600 rounded p-2">
                  <div className="text-xl font-bold">{countdown.hours}</div>
                  <div className="text-xs">Std</div>
                </div>
                <div className="bg-purple-600 rounded p-2">
                  <div className="text-xl font-bold">{countdown.minutes}</div>
                  <div className="text-xs">Min</div>
                </div>
                <div className="bg-purple-600 rounded p-2">
                  <div className="text-xl font-bold">{countdown.seconds}</div>
                  <div className="text-xs">Sek</div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Features Preview */}
          <div className="space-y-3 text-sm">
            <div className="text-center text-purple-300 font-bold mb-3">👑 VIP Features:</div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-yellow-400">📺</span>
              <span>Exklusive Band Interviews</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-purple-400">🎵</span>
              <span>Backstage YouTube Sessions</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-pink-400">🍸</span>
              <span>VIP Lounge Bar & Catering</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-blue-400">📸</span>
              <span>Meet & Greet Fotoshootings</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-green-400">🎤</span>
              <span>Private Band Acoustic Sets</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-orange-400">🏆</span>
              <span>Signed Merchandise</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-red-400">⚡</span>
              <span>Soundcheck Access</span>
            </div>
          </div>

          {/* Access Requirements */}
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="text-xs text-center mb-3">
              <span className="text-gray-400">Zugang erfordert:</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between bg-purple-800/30 p-2 rounded">
                <span className="text-purple-300">VIP Ticket</span>
                <span className="text-yellow-400 font-bold">CHF 149+</span>
              </div>
              <div className="flex items-center justify-between bg-pink-800/30 p-2 rounded">
                <span className="text-pink-300">Backstage Pass</span>
                <span className="text-green-400 font-bold">CHF 249+</span>
              </div>
            </div>
          </div>

          {/* User Status */}
          {session?.user && (
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-xs text-center">
                <span className="text-gray-400">VIP Bereit:</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="text-lg">{session.user.image || "👑"}</span>
                  <span className="text-purple-300 font-semibold">{session.user.name || "VIP Fan"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-purple-500">
          <div className="space-y-3">
            <button
              onClick={() => onRoomChange && onRoomChange("welcome")}
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              ← EXIT zu Welcome Stage
            </button>
          </div>
        </div>

        {/* AMBIENT OVERLAY */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-purple-400/20 text-6xl font-bold">👑 VIP BACKSTAGE COMING SOON 👑</div>
          </div>
        </div>
      </div>
    </RoomAccessControl>
  );
}
