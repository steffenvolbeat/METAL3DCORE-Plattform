"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Color } from "three";
import {
  RoundedBox,
  Sphere,
  Cylinder,
  Torus,
  Plane,
  Sparkles,
} from "@react-three/drei";

// SPEKTAKULÄRE STAGE-LIGHTS - Laser & Pyrotechnik
export default function StageLights() {
  const laserRef1 = useRef<Mesh>(null);
  const laserRef2 = useRef<Mesh>(null);
  const laserRef3 = useRef<Mesh>(null);
  const laserRef4 = useRef<Mesh>(null);
  const scannerRef1 = useRef<Mesh>(null);
  const scannerRef2 = useRef<Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const beat = Math.sin(time * 4) > 0.5 ? 1 : 0; // Beat-Simulation

    // Laser-Scanner Bewegungen
    if (laserRef1.current) {
      laserRef1.current.rotation.y = time * 1.5;
      laserRef1.current.rotation.x = Math.sin(time * 0.8) * 0.5;
      laserRef1.current.rotation.z = Math.cos(time * 0.6) * 0.3;
    }
    if (laserRef2.current) {
      laserRef2.current.rotation.y = -time * 1.2;
      laserRef2.current.rotation.x = Math.cos(time * 0.9) * 0.4;
      laserRef2.current.rotation.z = Math.sin(time * 0.7) * 0.25;
    }
    if (laserRef3.current) {
      laserRef3.current.rotation.y = time * 2.0;
      laserRef3.current.rotation.x = Math.sin(time * 1.2) * 0.6;
    }
    if (laserRef4.current) {
      laserRef4.current.rotation.y = -time * 1.8;
      laserRef4.current.rotation.x = Math.cos(time * 1.1) * 0.55;
    }

    // Moving Head Scanner
    if (scannerRef1.current) {
      scannerRef1.current.rotation.y = Math.sin(time * 0.5) * Math.PI;
      scannerRef1.current.rotation.x = Math.cos(time * 0.3) * 0.8;
    }
    if (scannerRef2.current) {
      scannerRef2.current.rotation.y = Math.cos(time * 0.4) * Math.PI;
      scannerRef2.current.rotation.x = Math.sin(time * 0.35) * 0.7;
    }
  });

  return (
    <group>
      {/* HAUPT-LASER-SYSTEM Links */}
      <group position={[-25, 35, -20]}>
        <RoundedBox args={[2, 2, 3]} radius={0.2}>
          <meshPhysicalMaterial
            color={new Color(0.05, 0.05, 0.1)}
            roughness={0.1}
            metalness={0.95}
          />
        </RoundedBox>

        <mesh ref={laserRef1} position={[0, 0, 1.8]}>
          <coneGeometry args={[0.1, 15, 16, 1, true]} />
          <meshPhysicalMaterial
            color={new Color(1.0, 0.0, 0.0)}
            emissive={new Color(1.0, 0.0, 0.0)}
            emissiveIntensity={3.0}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* HAUPT-LASER-SYSTEM Rechts */}
      <group position={[25, 35, -20]}>
        <RoundedBox args={[2, 2, 3]} radius={0.2}>
          <meshPhysicalMaterial
            color={new Color(0.05, 0.05, 0.1)}
            roughness={0.1}
            metalness={0.95}
          />
        </RoundedBox>

        <mesh ref={laserRef2} position={[0, 0, 1.8]}>
          <coneGeometry args={[0.1, 15, 16, 1, true]} />
          <meshPhysicalMaterial
            color={new Color(0.0, 0.0, 1.0)}
            emissive={new Color(0.0, 0.0, 1.0)}
            emissiveIntensity={3.0}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* SEITEN-LASER-SCANNER */}
      <group position={[-20, 40, -15]}>
        <Sphere args={[1.2, 16, 12]}>
          <meshPhysicalMaterial
            color={new Color(0.02, 0.02, 0.05)}
            roughness={0.05}
            metalness={0.98}
            clearcoat={1.0}
          />
        </Sphere>

        <mesh ref={laserRef3} position={[0, 0, 1.5]}>
          <coneGeometry args={[0.15, 20, 16, 1, true]} />
          <meshPhysicalMaterial
            color={new Color(0.0, 1.0, 0.0)}
            emissive={new Color(0.0, 1.0, 0.0)}
            emissiveIntensity={2.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>

      <group position={[20, 40, -15]}>
        <Sphere args={[1.2, 16, 12]}>
          <meshPhysicalMaterial
            color={new Color(0.02, 0.02, 0.05)}
            roughness={0.05}
            metalness={0.98}
            clearcoat={1.0}
          />
        </Sphere>

        <mesh ref={laserRef4} position={[0, 0, 1.5]}>
          <coneGeometry args={[0.15, 20, 16, 1, true]} />
          <meshPhysicalMaterial
            color={new Color(1.0, 1.0, 0.0)}
            emissive={new Color(1.0, 1.0, 0.0)}
            emissiveIntensity={2.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>

      {/* PREMIUM MOVING-HEAD SCANNER */}
      <group position={[-15, 38, -25]}>
        <Torus args={[1.5, 0.3, 8, 16]}>
          <meshPhysicalMaterial
            color={new Color(0.1, 0.1, 0.15)}
            roughness={0.2}
            metalness={0.9}
          />
        </Torus>

        <mesh ref={scannerRef1}>
          <Sphere args={[0.8, 16, 12]}>
            <meshPhysicalMaterial
              color={new Color(1.0, 0.0, 1.0)}
              emissive={new Color(1.0, 0.0, 1.0)}
              emissiveIntensity={2.0}
              roughness={0.1}
              metalness={0.8}
            />
          </Sphere>
        </mesh>
      </group>

      <group position={[15, 38, -25]}>
        <Torus args={[1.5, 0.3, 8, 16]}>
          <meshPhysicalMaterial
            color={new Color(0.1, 0.1, 0.15)}
            roughness={0.2}
            metalness={0.9}
          />
        </Torus>

        <mesh ref={scannerRef2}>
          <Sphere args={[0.8, 16, 12]}>
            <meshPhysicalMaterial
              color={new Color(0.0, 1.0, 1.0)}
              emissive={new Color(0.0, 1.0, 1.0)}
              emissiveIntensity={2.0}
              roughness={0.1}
              metalness={0.8}
            />
          </Sphere>
        </mesh>
      </group>

      {/* WASH-LIGHTS Array */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = (i - 5.5) * 3.5;
        const colors = [
          new Color(1, 0.2, 0.2),
          new Color(0.2, 1, 0.2),
          new Color(0.2, 0.2, 1),
          new Color(1, 1, 0.2),
          new Color(1, 0.2, 1),
          new Color(0.2, 1, 1),
        ];

        return (
          <group key={`wash-light-${i}`} position={[x, 32, -22]}>
            <Cylinder args={[0.6, 0.6, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
              <meshPhysicalMaterial
                color={new Color(0.03, 0.03, 0.08)}
                roughness={0.2}
                metalness={0.9}
              />
            </Cylinder>

            <Cylinder
              args={[0.4, 0.4, 0.2]}
              position={[0, 0, 0.7]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshPhysicalMaterial
                color={colors[i % colors.length]}
                emissive={colors[i % colors.length]}
                emissiveIntensity={1.5}
                transparent
                opacity={0.8}
              />
            </Cylinder>
          </group>
        );
      })}

      {/* STROBE-ARRAY für Blitz-Effekte */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.sin(angle) * 20;
        const z = Math.cos(angle) * 20 - 25;

        return (
          <RoundedBox
            key={`strobe-${i}`}
            args={[0.8, 0.8, 0.3]}
            radius={0.1}
            position={[x, 32, z]}
          >
            <meshPhysicalMaterial
              color={new Color(5.0, 5.0, 5.0)}
              emissive={new Color(5.0, 5.0, 5.0)}
              emissiveIntensity={Math.random() > 0.85 ? 8 : 0.1}
            />
          </RoundedBox>
        );
      })}

      {/* ATMOSPHAERICS - Haze-Maschinen */}
      {[-25, 25].map((xPos, index) => (
        <group key={`haze-${index}`} position={[xPos, 3, -15]}>
          <RoundedBox args={[2, 1, 3]} radius={0.1}>
            <meshPhysicalMaterial
              color={new Color(0.15, 0.15, 0.2)}
              roughness={0.6}
              metalness={0.3}
            />
          </RoundedBox>

          {/* Haze-Effekt */}
          <Sparkles
            count={20}
            scale={[8, 12, 8]}
            position={[0, 6, 0]}
            size={1.5}
            speed={0.2}
            color={new Color(0.8, 0.8, 1.0)}
          />
        </group>
      ))}
    </group>
  );
}
