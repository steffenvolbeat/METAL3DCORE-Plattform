"use client";

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetarySystemProps {
  beatData: { beat: boolean; intensity: number };
}

// Einzelner Planet
function Planet({ 
  orbitRadius, 
  planetSize, 
  color, 
  orbitSpeed, 
  beatData,
  position = [0, 0, 0]
}: { 
  orbitRadius: number; 
  planetSize: number; 
  color: string; 
  orbitSpeed: number; 
  beatData: any;
  position?: [number, number, number];
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (orbitRef.current) {
      // Planet-Umlaufbahn
      orbitRef.current.rotation.y += orbitSpeed * 0.001;
      
      // Beat-Reaktion: Orbit wird schneller
      if (beatData.beat) {
        orbitRef.current.rotation.y += beatData.intensity * orbitSpeed * 0.002;
      }
    }

    if (planetRef.current) {
      // Planet-Eigenrotation
      planetRef.current.rotation.x += 0.01;
      planetRef.current.rotation.y += 0.005;
      
      // Beat-Reaktion: Planet pulsiert
      if (beatData.beat) {
        const scale = planetSize + beatData.intensity * planetSize * 0.3;
        planetRef.current.scale.setScalar(scale);
      } else {
        planetRef.current.scale.lerp(new THREE.Vector3(planetSize, planetSize, planetSize), 0.1);
      }
    }
  });

  return (
    <group position={position}>
      {/* Umlaufbahn-Ring */}
      <Ring args={[orbitRadius - 0.1, orbitRadius + 0.1, 64]}>
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </Ring>
      
      {/* Planet auf Umlaufbahn */}
      <group ref={orbitRef}>
        <mesh ref={planetRef} position={[orbitRadius, 0, 0]}>
          <sphereGeometry args={[planetSize, 32, 32]} />
          <meshStandardMaterial 
            color={color}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}

// Sonne mit Supernova-Potential
function Sun({ 
  position, 
  size, 
  color, 
  beatData,
  triggerSupernova 
}: { 
  position: [number, number, number]; 
  size: number; 
  color: string; 
  beatData: any;
  triggerSupernova: boolean;
}) {
  const sunRef = useRef<THREE.Mesh>(null);
  const [isSupernova, setIsSupernova] = useState(false);
  const [supernovaTime, setSupernovaTime] = useState(0);

  useFrame((state, delta) => {
    if (sunRef.current) {
      // Normale Sonne: sanft pulsieren
      if (!isSupernova) {
        const basePulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
        const beatPulse = beatData.beat ? 1 + beatData.intensity * 0.3 : 1;
        sunRef.current.scale.setScalar(size * basePulse * beatPulse);
        
        // Supernova auslösen bei starken Beats
        if (triggerSupernova && beatData.beat && beatData.intensity > 0.8) {
          setIsSupernova(true);
          setSupernovaTime(0);
          console.log("💥 SUPERNOVA AUSGELÖST!");
        }
      } else {
        // Supernova-Animation
        setSupernovaTime(prev => prev + delta);
        
        if (supernovaTime < 2) {
          // Phase 1: Aufblähen
          const scale = size + (supernovaTime / 2) * size * 5;
          sunRef.current.scale.setScalar(scale);
        } else if (supernovaTime < 3) {
          // Phase 2: Explosion
          const scale = size * 6 + (supernovaTime - 2) * size * 10;
          sunRef.current.scale.setScalar(scale);
          
          // Material wird transparenter
          const material = sunRef.current.material as THREE.MeshStandardMaterial;
          material.opacity = 1 - (supernovaTime - 2);
        } else {
          // Phase 3: Reset
          setIsSupernova(false);
          setSupernovaTime(0);
          sunRef.current.scale.setScalar(size);
          const material = sunRef.current.material as THREE.MeshStandardMaterial;
          material.opacity = 1;
        }
      }
    }
  });

  return (
    <group position={position}>
      <mesh ref={sunRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={isSupernova ? "#FFFFFF" : color}
          emissive={isSupernova ? "#FF0000" : color}
          emissiveIntensity={isSupernova ? 2 : 0.5}
          transparent={isSupernova}
        />
      </mesh>
      
      {/* Sonne-Licht */}
      <pointLight 
        color={color} 
        intensity={isSupernova ? 5 : 1} 
        distance={isSupernova ? 200 : 50}
      />
      
      {/* Supernova-Partikel-Effekt */}
      {isSupernova && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(1000 * 3).map(() => (Math.random() - 0.5) * 100), 3]}
            />
          </bufferGeometry>
          <pointsMaterial 
            color="#FF4500" 
            size={2} 
            transparent 
            opacity={0.8}
          />
        </points>
      )}
    </group>
  );
}

// Katapultierter Planet (fliegt auf User zu)
function CatapultedPlanet({ 
  startPosition, 
  targetPosition, 
  size, 
  color, 
  isActive,
  onExplosion 
}: {
  startPosition: [number, number, number];
  targetPosition: [number, number, number];
  size: number;
  color: string;
  isActive: boolean;
  onExplosion: () => void;
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);
  const [hasExploded, setHasExploded] = useState(false);

  useFrame((state, delta) => {
    if (planetRef.current && isActive && !hasExploded) {
      setProgress(prev => {
        const newProgress = prev + delta * 0.5; // Geschwindigkeit
        
        if (newProgress >= 1) {
          // Explosion beim User
          setHasExploded(true);
          onExplosion();
          return 1;
        }
        
        return newProgress;
      });
      
      // Planet-Position interpolieren
      const currentPos = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...startPosition),
        new THREE.Vector3(...targetPosition),
        progress
      );
      
      planetRef.current.position.copy(currentPos);
      
      // Rotation während Flug
      planetRef.current.rotation.x += 0.1;
      planetRef.current.rotation.y += 0.05;
      
      // Größer werden beim Annähern
      const scale = size + progress * size * 2;
      planetRef.current.scale.setScalar(scale);
    }
  });

  if (hasExploded) return null;

  return (
    <mesh ref={planetRef} position={startPosition}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial 
        color={color}
        emissive={isActive ? color : "#000000"}
        emissiveIntensity={isActive ? 0.3 : 0}
      />
    </mesh>
  );
}

// Haupt Planetensystem
export default function PlanetarySystem({ beatData }: PlanetarySystemProps) {
  const [supernovaTriggered, setSupernovaTriggered] = useState(false);
  const [catapultActive, setCatapultActive] = useState(false);
  const [explosionCount, setExplosionCount] = useState(0);

  // Supernova auslösen bei sehr starken Beats
  useFrame(() => {
    if (beatData.beat && beatData.intensity > 0.85 && !supernovaTriggered) {
      setSupernovaTriggered(true);
      
      // 2 Sekunden später: Planet-Katapult aktivieren
      setTimeout(() => {
        setCatapultActive(true);
      }, 2000);
      
      // Reset nach 10 Sekunden
      setTimeout(() => {
        setSupernovaTriggered(false);
        setCatapultActive(false);
        setExplosionCount(0);
      }, 10000);
    }
  });

  const handlePlanetExplosion = () => {
    setExplosionCount(prev => prev + 1);
    console.log(`💥 Planet-Explosion #${explosionCount + 1}`);
  };

  return (
    <group>
      {/* Sonnen-Systeme */}
      
      {/* Haupt-Sonne */}
      <Sun 
        position={[-80, 0, -100]}
        size={8}
        color="#FFA500"
        beatData={beatData}
        triggerSupernova={supernovaTriggered}
      />
      
      {/* Zweites Sonne-System */}
      <Sun 
        position={[100, 30, -120]}
        size={6}
        color="#FF6B35"
        beatData={beatData}
        triggerSupernova={false}
      />
      
      {/* Planet-Systeme um erste Sonne */}
      <group position={[-80, 0, -100]}>
        <Planet 
          orbitRadius={25}
          planetSize={3}
          color="#8B4513"
          orbitSpeed={1.5}
          beatData={beatData}
        />
        
        <Planet 
          orbitRadius={35}
          planetSize={4}
          color="#4A90E2"
          orbitSpeed={1.2}
          beatData={beatData}
        />
        
        <Planet 
          orbitRadius={50}
          planetSize={2.5}
          color="#E74C3C"
          orbitSpeed={0.8}
          beatData={beatData}
        />
      </group>
      
      {/* Planet-Systeme um zweite Sonne */}
      <group position={[100, 30, -120]}>
        <Planet 
          orbitRadius={20}
          planetSize={2}
          color="#9B59B6"
          orbitSpeed={2}
          beatData={beatData}
        />
        
        <Planet 
          orbitRadius={30}
          planetSize={3.5}
          color="#1ABC9C"
          orbitSpeed={1}
          beatData={beatData}
        />
      </group>
      
      {/* Katapultierte Planeten */}
      {catapultActive && (
        <>
          <CatapultedPlanet
            startPosition={[-55, 0, -100]} // Von erster Sonne
            targetPosition={[0, 0, 20]} // Zum User/Kamera
            size={3}
            color="#FF0000"
            isActive={catapultActive}
            onExplosion={handlePlanetExplosion}
          />
          
          <CatapultedPlanet
            startPosition={[130, 30, -120]} // Von zweiter Sonne
            targetPosition={[5, -5, 25]} // Zum User/Kamera (leicht versetzt)
            size={2.5}
            color="#FF4500"
            isActive={catapultActive}
            onExplosion={handlePlanetExplosion}
          />
        </>
      )}
      
      {/* Asteroid-Gürtel */}
      <group position={[0, -20, -80]}>
        {Array.from({ length: 50 }, (_, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos((i / 50) * Math.PI * 2) * 60,
              (Math.random() - 0.5) * 10,
              Math.sin((i / 50) * Math.PI * 2) * 60
            ]}
          >
            <sphereGeometry args={[Math.random() * 0.5 + 0.2, 8, 8]} />
            <meshStandardMaterial color="#8C7853" />
          </mesh>
        ))}
      </group>
    </group>
  );
}