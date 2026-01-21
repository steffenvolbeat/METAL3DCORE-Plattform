// src/shared/components/3d/Scene3D.tsx

"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { DirectionalLight, Mesh } from "three";
import { div, int } from "three/tsl";

// Rotierende Box-Komponente für die erste 3D-Demo Scene
function RotatingBox() {
  const meshRef = useRef<Mesh>(null);

  // Animation: Der Box Komponente für die erste 3D-Demo Scene eine Rotation hinzufügen
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {/*Würfel-Geometrie*/}
      <boxGeometry args={[2, 2, 2]} />
      {/*Material: Metal-Look für die Zukunft*/}
      <meshStandardMaterial color="#ff6b35" metalness={0.8} roughness={0.2} />
    </mesh>
  );
}

// Hauptkomponente für die 3D-Szene
export default function Scene3D() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle WebGL context loss
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn("WebGL context lost. Attempting to restore...");
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored");
    };

    const canvas = canvasRef.current?.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("webglcontextlost", handleContextLost);
      canvas.addEventListener("webglcontextrestored", handleContextRestored);

      return () => {
        canvas.removeEventListener("webglcontextlost", handleContextLost);
        canvas.removeEventListener(
          "webglcontextrestored",
          handleContextRestored
        );
      };
    }
  }, []);

  return (
    <div
      ref={canvasRef}
      className="w-full h-64 sm:h-80 lg:h-96 bg-black rounded-lg overflow-hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          antialias: true,
        }}
        onCreated={({ gl }) => {
          // Ensure WebGL context restoration
          gl.domElement.addEventListener("webglcontextlost", (e) =>
            e.preventDefault()
          );
        }}
      >
        {/*Beleuchtung für realistische Darstellung*/}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {/*3D-Objekte*/}
        <RotatingBox />
        {/*Kamera-Steuerung - Benutzer kann die Szene erkunden */}
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
