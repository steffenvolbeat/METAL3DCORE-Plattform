"use client";

import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";

interface BlackHoleProps {
  position: [number, number, number];
  beatData: { beat: boolean; intensity: number };
}

// EPISCHES SCHWARZES LOCH mit Akkretionsscheibe!
const BlackHole: React.FC<BlackHoleProps> = ({ position, beatData }) => {
  const blackHoleRef = useRef<THREE.Group>(null);
  const accretionDiskRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Event Horizon (unsichtbare Kugel)
  const eventHorizonGeometry = useMemo(() => {
    return new THREE.SphereGeometry(2, 64, 64);
  }, []);

  // Akkretionsscheibe um das Schwarze Loch
  const accretionDiskGeometry = useMemo(() => {
    return new THREE.RingGeometry(3, 12, 64, 1);
  }, []);

  // Akkretionsscheiben-Textur mit wirbelnden Gasen
  const accretionTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;

    // Spiralförmige Gasströme
    for (let angle = 0; angle < Math.PI * 8; angle += 0.1) {
      const radius = (angle / (Math.PI * 8)) * 512 + 100;
      const x = 512 + Math.cos(angle) * radius;
      const y = 512 + Math.sin(angle) * radius;
      
      const intensity = 1 - (radius / 600);
      const hue = 25 + angle * 10; // Orange zu Rot
      
      ctx.fillStyle = `hsla(${hue % 60}, 90%, ${30 + intensity * 40}%, ${intensity})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, intensity * 8), 0, Math.PI * 2);
      ctx.fill();
    }

    // Zentrale Verdunklung (Event Horizon)
    const centralGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 150);
    centralGradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    centralGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    
    ctx.fillStyle = centralGradient;
    ctx.fillRect(0, 0, 1024, 1024);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  // Partikelsystem für umkreisende Materie
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Spiralförmige Verteilung
      const angle = Math.random() * Math.PI * 4;
      const radius = 4 + Math.random() * 15;
      const height = (Math.random() - 0.5) * 2;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Farben basierend auf Entfernung (heißer = näher)
      const distanceFactor = 1 - ((radius - 4) / 15);
      colors[i3] = 1; // Rot
      colors[i3 + 1] = distanceFactor * 0.8; // Grün
      colors[i3 + 2] = distanceFactor * 0.3; // Blau
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  const particleMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  const accretionMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      map: accretionTexture,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, [accretionTexture]);

  const eventHorizonMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#000000",
      transparent: true,
      opacity: 0.95,
    });
  }, []);

  // EXTREME Animation: Rotation und Beat-Effekte
  useFrame((state) => {
    if (blackHoleRef.current) {
      // ULTRA-schnelle Rotation bei Beat
      const rotationSpeed = beatData.beat ? 0.02 + beatData.intensity * 0.5 : 0.02;
      blackHoleRef.current.rotation.y += rotationSpeed;
      
      // Chaotisches Wobbling bei Beat
      if (beatData.beat) {
        const wobble = beatData.intensity * 0.5;
        blackHoleRef.current.position.x += Math.sin(state.clock.elapsedTime * 20) * wobble;
        blackHoleRef.current.position.z += Math.cos(state.clock.elapsedTime * 15) * wobble;
      }
    }

    if (accretionDiskRef.current) {
      // EXTREME Akkretionsscheibe rotiert viel schneller
      accretionDiskRef.current.rotation.z += 0.05 * (beatData.beat ? 15 + beatData.intensity * 20 : 1);
      
      // MASSIVE Beat-Pulsing der Scheibe
      if (beatData.beat) {
        const scale = 1 + beatData.intensity * 1.5; // 15x extremer!
        accretionDiskRef.current.scale.setScalar(scale);
      } else {
        accretionDiskRef.current.scale.setScalar(1);
      }
    }

    if (particlesRef.current) {
      // EXTREME Partikel rotieren ultra-schnell um das Schwarze Loch
      const particleSpeed = beatData.beat ? 1 + beatData.intensity * 10 : 1;
      particlesRef.current.rotation.y += 0.03 * particleSpeed;
      particlesRef.current.rotation.x += 0.01 * particleSpeed;
      particlesRef.current.rotation.z += 0.02 * (beatData.beat ? beatData.intensity * 5 : 0);
    }
  });

  return (
    <group ref={blackHoleRef} position={position}>
      {/* Event Horizon - komplett schwarz */}
      <mesh geometry={eventHorizonGeometry} material={eventHorizonMaterial} />
      
      {/* Akkretionsscheibe */}
      <mesh 
        ref={accretionDiskRef}
        geometry={accretionDiskGeometry} 
        material={accretionMaterial}
        rotation={[Math.PI / 2, 0, 0]}
      />
      
      {/* Umkreisende Partikel */}
      <points 
        ref={particlesRef}
        geometry={particleGeometry} 
        material={particleMaterial}
      />
      
      {/* Gravitationslinsen-Effekt (äußerer Ring) */}
      <mesh
        geometry={new THREE.RingGeometry(15, 18, 32)}
        material={new THREE.MeshBasicMaterial({
          color: "#4A90E2",
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide,
        })}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
};

export default BlackHole;