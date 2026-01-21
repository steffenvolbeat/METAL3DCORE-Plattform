"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SpaceshipControllerProps {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  velocity: THREE.Vector3;
  onPositionChange: (pos: THREE.Vector3) => void;
  onRotationChange: (rot: THREE.Euler) => void;
  onVelocityChange: (vel: THREE.Vector3) => void;
  enabled?: boolean;
}

export default function SpaceshipController({
  position,
  rotation,
  velocity,
  onPositionChange,
  onRotationChange,
  onVelocityChange,
  enabled = true,
}: SpaceshipControllerProps) {
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled]);

  useFrame((state, delta) => {
    if (!enabled) return;

    const newVelocity = velocity.clone();
    const newRotation = rotation.clone();
    const acceleration = 0.5;
    const rotationSpeed = 2;
    const damping = 0.95;

    // Rotation controls
    if (keys.current["a"]) newRotation.y += rotationSpeed * delta;
    if (keys.current["d"]) newRotation.y -= rotationSpeed * delta;
    if (keys.current["w"]) newRotation.x += rotationSpeed * delta;
    if (keys.current["s"]) newRotation.x -= rotationSpeed * delta;

    // Forward/backward movement
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(newRotation);
    if (keys.current["arrowup"] || keys.current[" "]) {
      newVelocity.add(forward.multiplyScalar(acceleration * delta));
    }
    if (keys.current["arrowdown"]) {
      newVelocity.sub(forward.multiplyScalar(acceleration * delta));
    }

    // Apply damping
    newVelocity.multiplyScalar(damping);

    // Update position
    const newPosition = position.clone().add(newVelocity);

    onPositionChange(newPosition);
    onRotationChange(newRotation);
    onVelocityChange(newVelocity);
  });

  return null;
}

export function SpaceshipControls() {
  return (
    <div className="fixed bottom-8 left-8 glass-panel px-6 py-4 text-sm text-theme-secondary">
      <p className="font-semibold mb-2">Spaceship Controls</p>
      <div className="space-y-1">
        <p>W/S - Pitch</p>
        <p>A/D - Yaw</p>
        <p>↑ / Space - Thrust</p>
        <p>↓ - Reverse</p>
      </div>
    </div>
  );
}
