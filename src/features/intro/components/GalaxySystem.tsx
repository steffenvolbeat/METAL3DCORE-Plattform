"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface GalaxySystemProps {
  beatData: { beat: boolean; intensity: number };
}

// Einzelne Galaxie
function Galaxy({
  position,
  color,
  size = 1,
  rotationSpeed = 1,
  beatData,
}: {
  position: [number, number, number];
  color: string;
  size?: number;
  rotationSpeed?: number;
  beatData: any;
}) {
  const galaxyRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const galaxyGeometry = useMemo(() => {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 20 * size;
      const angle = Math.random() * Math.PI * 8;
      const height = (Math.random() - 0.5) * 2 * size;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const colorObj = new THREE.Color(color);
      const intensity = 1 - radius / (20 * size);
      colorObj.multiplyScalar(intensity);

      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [color, size]);

  useFrame(state => {
    if (galaxyRef.current) {
      // Basis-Rotation
      galaxyRef.current.rotation.y += rotationSpeed * 0.001;

      // EXTREME Beat-Reaktion: Galaxie EXPLODIERT und wirbelt!
      if (beatData.beat) {
        const scale = size + beatData.intensity * 2.5; // 8x extremer!
        galaxyRef.current.scale.setScalar(scale);
        galaxyRef.current.rotation.y += beatData.intensity * 0.15; // 15x schneller!

        // Zusätzliches chaotisches Wirbeln
        galaxyRef.current.rotation.x += beatData.intensity * 0.08;
        galaxyRef.current.rotation.z += beatData.intensity * 0.12;
      } else {
        galaxyRef.current.scale.lerp(new THREE.Vector3(size, size, size), 0.1);
      }
    }

    if (particlesRef.current) {
      // EXTREME Partikel-Rotation - wie explodierende Spiralarme!
      const rotSpeed = beatData.beat ? rotationSpeed * 0.1 + beatData.intensity * 1.5 : rotationSpeed * 0.1;
      particlesRef.current.rotation.y = state.clock.elapsedTime * rotSpeed;
      particlesRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 2) * (beatData.beat ? beatData.intensity * 0.5 : 0);
      particlesRef.current.rotation.z =
        Math.cos(state.clock.elapsedTime * 3) * (beatData.beat ? beatData.intensity * 0.3 : 0);
    }
  });

  return (
    <group ref={galaxyRef} position={position}>
      <points ref={particlesRef} geometry={galaxyGeometry}>
        <pointsMaterial vertexColors size={0.5} sizeAttenuation={true} transparent alphaTest={0.5} />
      </points>

      {/* Galaxie-Kern */}
      <mesh>
        <sphereGeometry args={[2 * size, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// 3D Text für Projekt-Name
function ProjectNameOrbit({ beatData }: { beatData: any }) {
  const orbitRef = useRef<THREE.Group>(null);

  useFrame(state => {
    if (orbitRef.current) {
      // Text kreist um die Galaxie
      orbitRef.current.rotation.y = state.clock.elapsedTime * 0.2;

      // Beat-Reaktion: Text leuchtet auf
      const children = orbitRef.current.children;
      children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          if (beatData.beat) {
            child.material.emissive = new THREE.Color("#FF6B35").multiplyScalar(beatData.intensity);
          } else {
            child.material.emissive.lerp(new THREE.Color(0x000000), 0.1);
          }
        }
      });
    }
  });

  return (
    <group ref={orbitRef}>
      {/* Temporär: Leuchtende Kugeln statt 3D Text (bis Font verfügbar) */}
      <group position={[30, 0, 0]}>
        <mesh>
          <sphereGeometry args={[2, 16, 16]} />
          <meshStandardMaterial
            color="#FF6B35"
            emissive="#FF6B35"
            emissiveIntensity={beatData.beat ? beatData.intensity * 0.5 : 0.2}
          />
        </mesh>
      </group>

      <group position={[-30, 5, 0]}>
        <mesh>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshStandardMaterial
            color="#4A90E2"
            emissive="#4A90E2"
            emissiveIntensity={beatData.beat ? beatData.intensity * 0.5 : 0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

// Haupt Galaxien-System
export default function GalaxySystem({ beatData }: GalaxySystemProps) {
  const systemRef = useRef<THREE.Group>(null);

  useFrame(state => {
    if (systemRef.current) {
      // Langsame System-Bewegung
      systemRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 5;
      systemRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.1) * 3;

      // EXTREME Beat-Reaktion: Ganzes System wirbelt chaotisch!
      if (beatData.beat && beatData.intensity > 0.7) {
        // EXTREME Bewegung - wie Galaxien-Kollisionen!
        const targetX = Math.sin(state.clock.elapsedTime * 20) * beatData.intensity * 25;
        const targetZ = Math.cos(state.clock.elapsedTime * 15) * beatData.intensity * 20;
        const targetY = Math.sin(state.clock.elapsedTime * 10) * beatData.intensity * 10;

        systemRef.current.position.x = THREE.MathUtils.lerp(systemRef.current.position.x, targetX, 0.3);
        systemRef.current.position.z = THREE.MathUtils.lerp(systemRef.current.position.z, targetZ, 0.3);
        systemRef.current.position.y = THREE.MathUtils.lerp(systemRef.current.position.y, targetY, 0.2);

        // Zusätzliche Rotation des ganzen Systems
        systemRef.current.rotation.y += beatData.intensity * 0.1;
        systemRef.current.rotation.x += beatData.intensity * 0.05;
        systemRef.current.rotation.z += beatData.intensity * 0.08;
      }
    }
  });

  return (
    <group ref={systemRef}>
      {/* Haupt-Galaxie mit Projekt-Namen */}
      <group position={[-40, 10, -20]}>
        <Galaxy position={[0, 0, 0]} color="#FF6B35" size={1.5} rotationSpeed={1.2} beatData={beatData} />
        <ProjectNameOrbit beatData={beatData} />
      </group>

      {/* Weitere Galaxien */}
      <Galaxy position={[60, -15, -30]} color="#4A90E2" size={1} rotationSpeed={-0.8} beatData={beatData} />

      <Galaxy position={[-20, -25, -50]} color="#9B59B6" size={0.8} rotationSpeed={1.5} beatData={beatData} />

      <Galaxy position={[30, 30, -40]} color="#E74C3C" size={0.6} rotationSpeed={-1.1} beatData={beatData} />

      <Galaxy position={[-60, 0, -60]} color="#F39C12" size={1.2} rotationSpeed={0.9} beatData={beatData} />

      {/* Kleine Satelliten-Galaxien */}
      <Galaxy position={[80, 20, -15]} color="#1ABC9C" size={0.4} rotationSpeed={2} beatData={beatData} />

      <Galaxy position={[-80, -10, -25]} color="#E67E22" size={0.3} rotationSpeed={-2.5} beatData={beatData} />
    </group>
  );
}
