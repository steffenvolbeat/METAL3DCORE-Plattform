"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Color } from "three";
import { RoundedBox, Sphere, Cylinder, Torus, Plane, Sparkles } from "@react-three/drei";

// Spektakualäre Stage-Lights - Laser & Pyrotechnik Effekte
export default function StageLights() {
  const laserRef1 = useRef<Mesh>(null);
  const laserRef2 = useRef<Mesh>(null);
  const laserRef3 = useRef<Mesh>(null);
  const laserRef4 = useRef<Mesh>(null);
  const scannerRef1 = useRef<Mesh>(null);
  const scannerRef2 = useRef<Mesh>(null);

  useFrame(state => {
    const time = state.clock.elapsedTime; // Zeit für Animationen

    const beat = Math.sin(time * 10) > 0.5 ? 1 : 0; // Einfacher Beat-Effekt

    // Laser-Scanner Animationen
  });
}
