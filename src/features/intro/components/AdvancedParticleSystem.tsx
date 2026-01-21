"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointsMaterial } from "three";
import * as THREE from "three";

interface ParticleSystemProps {
  beatData: {
    beat: boolean;
    intensity: number;
    frequencies?: number[];
  };
  particleCount?: {
    stars: number;
    explosions: number;
    nebula: number;
    meteors: number;
  };
}

// Explodierende Sterne Komponente - Mobile Optimized
function ExplodingStars({ beatData, particleCount }: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  const starCount = particleCount?.explosions || 2000;

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Spherical distribution for explosion effect
      const radius = Math.random() * 100 + 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Warme Metal-Farben
      const r = 0.8 + Math.random() * 0.2;
      const g = 0.2 + Math.random() * 0.4;
      const b = 0.1;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;

      sizes[i] = Math.random() * 3 + 1;
    }

    return { positions, colors, sizes };
  }, [starCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();

      // Beat-reaktive Explosion
      if (beatData.beat) {
        pointsRef.current.scale.setScalar(1 + beatData.intensity * 0.3);
        pointsRef.current.rotation.x += beatData.intensity * 0.01;
        pointsRef.current.rotation.y += beatData.intensity * 0.015;
      } else {
        pointsRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        pointsRef.current.rotation.x += 0.002;
        pointsRef.current.rotation.y += 0.003;
      }

      // Particle movement
      const positionArray = pointsRef.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        const x = positionArray[i3];
        const y = positionArray[i3 + 1];
        const z = positionArray[i3 + 2];

        // Pulsing expansion effect
        const distance = Math.sqrt(x * x + y * y + z * z);
        const factor = 1 + Math.sin(time * 2 + distance * 0.01) * 0.1;

        positionArray[i3] = x * factor;
        positionArray[i3 + 1] = y * factor;
        positionArray[i3 + 2] = z * factor;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
          array={positions}
          count={starCount}
          itemSize={3}
        />
        <bufferAttribute
          args={[colors, 3]}
          attach="attributes-color"
          array={colors}
          count={starCount}
          itemSize={3}
        />
        <bufferAttribute
          args={[sizes, 1]}
          attach="attributes-size"
          array={sizes}
          count={starCount}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Weltraum Nebel Komponente - Mobile Optimized
function SpaceNebula({ beatData, particleCount }: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  const nebulaCount = particleCount?.nebula || 1000;

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(nebulaCount * 3);
    const colors = new Float32Array(nebulaCount * 3);
    const sizes = new Float32Array(nebulaCount);

    for (let i = 0; i < nebulaCount; i++) {
      // Nebula-artige Verteilung
      const radius = Math.random() * 200 + 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.5; // Flachere Verteilung

      positions[i * 3] = radius * Math.cos(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = radius * Math.cos(phi) * Math.sin(theta);

      // Lila-bläuliche Nebel-Farben
      const r = 0.4 + Math.random() * 0.3;
      const g = 0.2 + Math.random() * 0.5;
      const b = 0.7 + Math.random() * 0.3;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;

      sizes[i] = Math.random() * 5 + 2;
    }

    return { positions, colors, sizes };
  }, [nebulaCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();

      // Beat-reaktive Nebel-Bewegung
      if (beatData.beat) {
        pointsRef.current.rotation.z += beatData.intensity * 0.02;
        (pointsRef.current.material as PointsMaterial).size =
          4 + beatData.intensity * 3;
      } else {
        pointsRef.current.rotation.z += 0.001;
        (pointsRef.current.material as PointsMaterial).size = 3;
      }

      pointsRef.current.rotation.x += 0.0005;
      pointsRef.current.rotation.y += 0.001;

      // Sanfte Nebel-Animation
      const positionArray = pointsRef.current.geometry.attributes.position
        .array as Float32Array;
      for (let i = 0; i < nebulaCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];

        // Floating effect
        positionArray[i3] = x + Math.sin(time * 0.5 + i * 0.01) * 5;
        positionArray[i3 + 1] = y + Math.cos(time * 0.3 + i * 0.01) * 3;
        positionArray[i3 + 2] = z + Math.sin(time * 0.7 + i * 0.01) * 4;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
          array={positions}
          count={nebulaCount}
          itemSize={3}
        />
        <bufferAttribute
          args={[colors, 3]}
          attach="attributes-color"
          array={colors}
          count={nebulaCount}
          itemSize={3}
        />
        <bufferAttribute
          args={[sizes, 1]}
          attach="attributes-size"
          array={sizes}
          count={nebulaCount}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={3}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Meteor Schauer Komponente - Mobile Optimized
function MeteorShower({ beatData, particleCount }: ParticleSystemProps) {
  const pointsRef = useRef<Points>(null);
  const meteorCount = particleCount?.meteors || 150;

  const { positions, colors, sizes, velocities } = useMemo(() => {
    const positions = new Float32Array(meteorCount * 3);
    const colors = new Float32Array(meteorCount * 3);
    const sizes = new Float32Array(meteorCount);
    const velocities = new Float32Array(meteorCount * 3);

    for (let i = 0; i < meteorCount; i++) {
      // Start-Position am Rand
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = 200 + Math.random() * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;

      // Meteorfarben (weiß-gelblich)
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.4 + Math.random() * 0.4;

      sizes[i] = Math.random() * 2 + 0.5;

      // Velocity für downward movement
      velocities[i * 3] = (Math.random() - 0.5) * 2;
      velocities[i * 3 + 1] = -3 - Math.random() * 5;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }

    return { positions, colors, sizes, velocities };
  }, [meteorCount]);

  useFrame((state) => {
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime();

      // Beat-reaktive Meteor-Geschwindigkeit
      const speedMultiplier = beatData.beat ? 1 + beatData.intensity : 1;

      const positionArray = pointsRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < meteorCount; i++) {
        const i3 = i * 3;

        // Update position based on velocity
        positionArray[i3] += velocities[i3] * speedMultiplier;
        positionArray[i3 + 1] += velocities[i3 + 1] * speedMultiplier;
        positionArray[i3 + 2] += velocities[i3 + 2] * speedMultiplier;

        // Reset meteor if it goes too far down
        if (positionArray[i3 + 1] < -200) {
          positionArray[i3] = (Math.random() - 0.5) * 400;
          positionArray[i3 + 1] = 200 + Math.random() * 100;
          positionArray[i3 + 2] = (Math.random() - 0.5) * 400;
        }
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          args={[positions, 3]}
          attach="attributes-position"
          array={positions}
          count={meteorCount}
          itemSize={3}
        />
        <bufferAttribute
          args={[colors, 3]}
          attach="attributes-color"
          array={colors}
          count={meteorCount}
          itemSize={3}
        />
        <bufferAttribute
          args={[sizes, 1]}
          attach="attributes-size"
          array={sizes}
          count={meteorCount}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={2}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Haupt Komponente
export default function AdvancedParticleSystem({
  beatData,
  particleCount,
}: ParticleSystemProps) {
  return (
    <group>
      <ExplodingStars beatData={beatData} particleCount={particleCount} />
      <SpaceNebula beatData={beatData} particleCount={particleCount} />
      <MeteorShower beatData={beatData} particleCount={particleCount} />
    </group>
  );
}
