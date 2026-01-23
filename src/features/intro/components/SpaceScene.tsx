"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface SpaceSceneProps {
  beatData: { beat: boolean; intensity: number };
  isVideoStarted?: boolean;
}

// Sternenfeld Generator - NUR WEIßE STERNE im schwarzen Raum!
function StarField({
  count = 5000,
  beatData,
  isVideoStarted = false,
}: {
  count?: number;
  beatData: any;
  isVideoStarted?: boolean;
}) {
  const ref = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Zufällige Positionen in großem Radius
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      // NUR WEIßE STERNE - wie im echten Weltall!
      const color = new THREE.Color(1, 1, 1); // Alle Sterne weiß!

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    // Nur animieren wenn Video läuft!
    if (!isVideoStarted) return;
    
    if (ref.current) {
      // EXTREME Rotation des Sternenfelds bei Beat - wie explodierende Galaxien!
      const rotationMultiplier = beatData.beat ? 25 + beatData.intensity * 30 : 1;
      ref.current.rotation.x = state.clock.elapsedTime * 0.0001 * rotationMultiplier;
      ref.current.rotation.y = state.clock.elapsedTime * 0.0002 * rotationMultiplier;
      ref.current.rotation.z = state.clock.elapsedTime * 0.0001 * rotationMultiplier;

      // ULTRA-INTENSIVE Beat-Reaktion: Sterne explodieren!
      if (beatData.beat) {
        const scale = 1 + beatData.intensity * 3.0; // EXTREME Pulsation
        ref.current.scale.setScalar(scale);
        const material = ref.current.material as THREE.PointsMaterial;
        material.size = 10 + beatData.intensity * 25; // RIESIGE Beat-Reaktion!
      } else {
        const material = ref.current.material as THREE.PointsMaterial;
        material.size = Math.max(1.5, material.size * 0.98);
      }
    }
  });

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [positions, colors]);

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={2}
        sizeAttenuation={true}
        alphaTest={0.5}
        transparent
      />
    </points>
  );
}

// Haupt-Szene - NUR STERNE, KEIN BUNTER NEBEL!
export default function SpaceScene({ beatData, isVideoStarted = false }: SpaceSceneProps) {
  const sceneRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Nur animieren wenn Video läuft!
    if (!isVideoStarted) return;
    
    if (sceneRef.current) {
      // Sehr langsame Gesamt-Bewegung der Szene
      sceneRef.current.position.x =
        Math.sin(state.clock.elapsedTime * 0.0001) * 2;
      sceneRef.current.position.y =
        Math.cos(state.clock.elapsedTime * 0.0001) * 1;

      // EXTREME Beat-Reaktion: Gesamte Szene EXPLODIERT!
      if (beatData.beat) {
        const scale = 1 + beatData.intensity * 0.5; // 10x stärker!
        sceneRef.current.scale.setScalar(scale);
        
        // Zusätzliches extremes Wobbling der gesamten Szene
        sceneRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 20) * beatData.intensity * 0.2;
        sceneRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 15) * beatData.intensity * 0.3;
        sceneRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 25) * beatData.intensity * 0.15;
      } else {
        sceneRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        sceneRef.current.rotation.x *= 0.95;
        sceneRef.current.rotation.y *= 0.95;
        sceneRef.current.rotation.z *= 0.95;
      }
    }
  });

  return (
    <group ref={sceneRef}>
      {/* NUR STERNE - KEIN BUNTER NEBEL! */}
      <StarField count={8000} beatData={beatData} isVideoStarted={isVideoStarted} />
    </group>
  );
}
