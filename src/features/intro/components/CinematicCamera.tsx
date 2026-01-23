"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Types
interface CinematicCameraProps {
  isActive: boolean;
  beatData?: {
    beat: boolean;
    intensity: number;
  };
}

interface CinematicStarterProps {
  onStart: () => void;
}

// Main Cinematic Camera Component
const CinematicCamera: React.FC<CinematicCameraProps> = ({
  isActive,
  beatData,
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { camera, scene } = useThree();
  const [cameraPosition, setCameraPosition] = useState(
    new THREE.Vector3(0, 50, 100)
  );
  const [targetPosition, setTargetPosition] = useState(
    new THREE.Vector3(0, 0, 0)
  );

  // Cinematic camera movements
  useFrame((state) => {
    if (!isActive || !cameraRef.current) return;

    const time = state.clock.elapsedTime;

    // VORWÄRTS-FLUG durch das Weltall! Wie ein Raumschiff!
    const speed = 20; // Geschwindigkeit der Vorwärtsbewegung
    const waveAmplitude = 50; // Wie stark die Kamera seitlich schwingt
    const heightVariation = 30; // Höhenvariation

    // Vorwärtsbewegung - Z-Achse bewegt sich kontinuierlich
    const z = -time * speed; // Negative Z = vorwärts ins All

    // Sanfte seitliche Wellenbewegung für dynamischen Flug
    const x = Math.sin(time * 0.3) * waveAmplitude;

    // Höhenvariation für mehr Dynamik
    const y = Math.sin(time * 0.2) * heightVariation + 20;

    // Beat-reactive camera shake
    const beatIntensity = beatData?.intensity || 0;
    const shakeAmount = beatData?.beat ? beatIntensity * 8 : 0;

    const shakeX = (Math.random() - 0.5) * shakeAmount;
    const shakeY = (Math.random() - 0.5) * shakeAmount;
    const shakeZ = (Math.random() - 0.5) * shakeAmount;

    // Apply position with beat effects - VORWÄRTS-FLUG!
    camera.position.set(x + shakeX, y + shakeY, z + shakeZ);

    // Schaue in die Flugrichtung (vorwärts) mit leichter Variation
    const lookAheadDistance = 100;
    const targetX = x + Math.sin(time * 0.1) * 20;
    const targetY = y + Math.sin(time * 0.15) * 15;
    const targetZ = z - lookAheadDistance; // Blick vorwärts in Flugrichtung

    camera.lookAt(targetX, targetY, targetZ);

    // Update camera
    camera.updateMatrixWorld();
  });

  return null; // This component only controls the camera
};

// Cinematic Starter Button Component
export const CinematicStarter: React.FC<CinematicStarterProps> = ({
  onStart,
}) => {
  return (
    <div className="text-center">
      <button
        onClick={onStart}
        className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold rounded-lg transform hover:scale-105 transition-all duration-300 shadow-2xl overflow-hidden"
      >
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Button content */}
        <div className="relative z-10 flex items-center space-x-3">
          <span className="text-2xl">🎬</span>
          <span className="text-lg">Cinematic Mode</span>
          <span className="text-2xl">🚀</span>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </button>

      <p className="mt-2 text-sm text-gray-400">
        🚀 Vorwärts-Flug durch das Weltall!
      </p>
    </div>
  );
};

// Cinematic UI Overlay Component
export const CinematicUI: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/70 backdrop-blur-md rounded-lg p-4 border border-purple-500/30">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-white font-medium">🎬 Cinematic Mode Active</span>
      </div>

      <div className="mt-2 text-sm text-gray-300">
        <div>� Vorwärts-Flug durch das All</div>
        <div>🎵 Beat-reaktive Bewegungen</div>
        <div>⭐ Epische Raumschiff-Perspektive</div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        Diese Nachricht verschwindet automatisch...
      </div>
    </div>
  );
};

export default CinematicCamera;
