"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Color, MeshPhysicalMaterial, Vector3, Group } from "three";
import { RoundedBox, Sphere, Cylinder, Torus, Plane, Sparkles, Text, Billboard } from "@react-three/drei";

interface StageLightsProps {
  currentVideo?: string;
  screenMode?: "off" | "youtube" | "live";
  bpmOverride?: number;
  bandName?: string;
}

// SPEKTAKULÄRE STAGE-LIGHTS - Laser & Pyrotechnik (takt-/BPM-geführt)
// Hinweis: Audio-Beat kommt hier aus einer BPM-Tabelle, nicht direkt aus dem YouTube-Sound (Iframe bleibt gesperrt).
export default function StageLights({ currentVideo, screenMode = "youtube", bpmOverride, bandName }: StageLightsProps) {
  const laserRef1 = useRef<Mesh>(null);
  const laserRef2 = useRef<Mesh>(null);
  const laserRef3 = useRef<Mesh>(null);
  const laserRef4 = useRef<Mesh>(null);
  const scannerRef1 = useRef<Mesh>(null);
  const scannerRef2 = useRef<Mesh>(null);
  const phaseRef = useRef(0);
  const bannerRef = useRef<Group>(null);
  const camDir = useMemo(() => new Vector3(), []);
  const bpm = useMemo(() => {
    if (bpmOverride) return bpmOverride;
    const table: Record<string, number> = {
      OzjJDUVCuKM: 132, // Live Event (legacy)
      "https://www.youtube.com/watch?v=OzjJDUVCuKM&list=RDMM6yQRc6DeFIM&index=21": 132,
      "2Y3cPb9VGOg": 130, // Live Event (new requested)
      "https://www.youtube.com/watch?v=2Y3cPb9VGOg&list=RDMM6yQRc6DeFIM&index=11": 130,
      "https://www.youtube.com/watch?v=2Y3cPb9VGOg&list=RD2Y3cPb9VGOg&index=2": 130,

      "CD-E-LDc384": 123, // Metallica - Enter Sandman
      xnKhsTXoKCI: 220, // Metallica - Master of Puppets (approx double-time feel)
      v5EDTJmOpF8: 95, // Iron Maiden - Fear of the Dark (half-time feel)
      x2rQzv8OWEY: 90, // Rammstein - Engel
      "6Xmq7BgUjqw": 138, // Slipknot - Duality
    };
    return table[currentVideo ?? ""] ?? 124;
  }, [bpmOverride, currentVideo]);

  const label = useMemo(() => {
    if (bandName && bandName.trim().length > 0) return bandName;
    const map: Record<string, string> = {
      OzjJDUVCuKM: "Infected Rain",
      "https://www.youtube.com/watch?v=OzjJDUVCuKM&list=RDMM6yQRc6DeFIM&index=21": "Infected Rain",
      "2Y3cPb9VGOg": "Live Event",
      "https://www.youtube.com/watch?v=2Y3cPb9VGOg&list=RDMM6yQRc6DeFIM&index=11": "Live Event",
      "https://www.youtube.com/watch?v=2Y3cPb9VGOg&list=RD2Y3cPb9VGOg&index=2": "Live Event",
      xnKhsTXoKCI: "METALLICA",
      v5EDTJmOpF8: "IRON MAIDEN",
      x2rQzv8OWEY: "RAMMSTEIN",
      "6Xmq7BgUjqw": "SLIPKNOT",
    };
    return map[currentVideo ?? ""] ?? "METAL3DCORE LIVE";
  }, [bandName, currentVideo]);

  const bannerMetrics = useMemo(() => {
    const fontSize = 1.2;
    const outlineWidth = 0.06;
    const letterSpacing = 0.015;
    const estimatedTextWidth = Math.max(
      2.5,
      Math.min(12, label.length * (fontSize * 0.55) + letterSpacing * label.length)
    );
    const bannerWidth = estimatedTextWidth + 1.2; // small padding left/right
    const bannerHeight = fontSize * 1.6; // room for outline and descenders
    const sparkleCount = Math.round(Math.min(140, Math.max(60, bannerWidth * 12)));
    const sparkleScale: [number, number, number] = [bannerWidth * 3.5, bannerHeight * 4, 5];

    return { fontSize, outlineWidth, letterSpacing, bannerWidth, bannerHeight, sparkleCount, sparkleScale };
  }, [label]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const playing = screenMode !== "off";
    const beatHz = (playing ? bpm : 60) / 60; // fallback 1 Hz when off
    phaseRef.current = (phaseRef.current + delta * beatHz * Math.PI * 2) % (Math.PI * 2);
    const beatPulse = 0.5 + 0.5 * Math.sin(phaseRef.current); // 0..1
    const accent = beatPulse * beatPulse; // stronger peak near 1
    const sweep = 0.5 + 0.5 * Math.sin(time * 0.5); // langsame, große Bewegung
    const depthPulse = 8 + accent * 18; // extra Tiefe

    if (bannerRef.current) {
      const { camera } = state;
      camera.getWorldDirection(camDir);

      const hudDistance = 12; // how far in front of the camera
      const verticalOffset = 2.5; // lift slightly so it sits above center

      camDir.normalize().multiplyScalar(hudDistance);

      bannerRef.current.position.copy(camera.position).add(camDir);
      bannerRef.current.position.y += verticalOffset;
    }

    // Laser-Scanner Bewegungen
    if (laserRef1.current) {
      laserRef1.current.rotation.y = time * 1.5;
      laserRef1.current.rotation.x = Math.sin(time * 0.8) * 0.5;
      laserRef1.current.rotation.z = Math.cos(time * 0.6) * 0.3;
      laserRef1.current.scale.y = 1.5 + beatPulse * 1.5; // länger
      laserRef1.current.position.z = 1.8 - depthPulse * 0.04; // tiefer Auswurf
      laserRef1.current.position.y = sweep * 3 + 2; // langsames Wandern nach oben/unten
      const mat = laserRef1.current.material as MeshPhysicalMaterial | undefined;
      if (mat) mat.emissiveIntensity = 3.0 + accent * 4.5;
    }
    if (laserRef2.current) {
      laserRef2.current.rotation.y = -time * 1.2;
      laserRef2.current.rotation.x = Math.cos(time * 0.9) * 0.4;
      laserRef2.current.rotation.z = Math.sin(time * 0.7) * 0.25;
      laserRef2.current.scale.y = 1.5 + beatPulse * 1.5;
      laserRef2.current.position.z = 1.8 - depthPulse * 0.04;
      laserRef2.current.position.y = (1 - sweep) * 3 + 2;
      const mat = laserRef2.current.material as MeshPhysicalMaterial | undefined;
      if (mat) mat.emissiveIntensity = 3.0 + accent * 4.5;
    }
    if (laserRef3.current) {
      laserRef3.current.rotation.y = time * 2.0;
      laserRef3.current.rotation.x = Math.sin(time * 1.2) * 0.6;
      laserRef3.current.scale.y = 1.6 + beatPulse * 1.6;
      laserRef3.current.position.z = 1.5 - depthPulse * 0.05;
      laserRef3.current.position.y = sweep * 2 + 2.5;
      const mat = laserRef3.current.material as MeshPhysicalMaterial | undefined;
      if (mat) mat.emissiveIntensity = 3.0 + accent * 4.5;
    }
    if (laserRef4.current) {
      laserRef4.current.rotation.y = -time * 1.8;
      laserRef4.current.rotation.x = Math.cos(time * 1.1) * 0.55;
      laserRef4.current.scale.y = 1.6 + beatPulse * 1.6;
      laserRef4.current.position.z = 1.5 - depthPulse * 0.05;
      laserRef4.current.position.y = (1 - sweep) * 2 + 2.5;
      const mat = laserRef4.current.material as MeshPhysicalMaterial | undefined;
      if (mat) mat.emissiveIntensity = 3.0 + accent * 4.5;
    }

    // Moving Head Scanner
    if (scannerRef1.current) {
      scannerRef1.current.rotation.y = Math.sin(time * 0.5 + beatPulse) * Math.PI;
      scannerRef1.current.rotation.x = Math.cos(time * 0.3 + beatPulse) * 0.8;
      const mat = scannerRef1.current.material as MeshPhysicalMaterial | undefined;
      if (mat) mat.emissiveIntensity = 1.5 + accent * 2.0;
    }
    if (scannerRef2.current) {
      scannerRef2.current.rotation.y = Math.cos(time * 0.4 + beatPulse) * Math.PI;
      scannerRef2.current.rotation.x = Math.sin(time * 0.35 + beatPulse) * 0.7;
      const mat = scannerRef2.current.material as MeshPhysicalMaterial | undefined;
      if (mat) mat.emissiveIntensity = 1.5 + accent * 2.0;
    }
  });

  return (
    <group>
      {/* HAUPT-LASER-SYSTEM Links */}
      <group position={[-25, 35, -20]}>
        <RoundedBox args={[2, 2, 3]} radius={0.2}>
          <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.1)} roughness={0.1} metalness={0.95} />
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

      {/* LASER-SCHRIFTZUG: als Billboard auf die Tribüne ausgerichtet */}
      <Billboard ref={bannerRef} position={[0, 20, -14]} follow lockX lockY={false} lockZ={false}>
        <group rotation={[-0.05, 0, 0]} renderOrder={10000}>
          <Plane args={[bannerMetrics.bannerWidth, bannerMetrics.bannerHeight]} position={[0, 0, -0.01]}>
            <meshBasicMaterial
              color={new Color(0, 0, 0)}
              opacity={0.6}
              transparent
              depthTest={false}
              depthWrite={false}
            />
          </Plane>
          <Text
            position={[0, 0, 0]}
            fontSize={bannerMetrics.fontSize}
            color={new Color(1.0, 1.0, 1.0)}
            anchorX="center"
            anchorY="middle"
            outlineWidth={bannerMetrics.outlineWidth}
            outlineColor={new Color(0, 0, 0)}
            letterSpacing={bannerMetrics.letterSpacing}
            material-depthTest={false}
            material-depthWrite={false}
            renderOrder={10001}
          >
            {label}
          </Text>
          <Sparkles
            count={bannerMetrics.sparkleCount}
            scale={bannerMetrics.sparkleScale}
            position={[0, 0, 0]}
            size={1.8}
            speed={1.0}
            color={new Color(0.6, 1, 0.6)}
            opacity={0.8}
          />
        </group>
      </Billboard>

      {/* HAUPT-LASER-SYSTEM Rechts */}
      <group position={[25, 35, -20]}>
        <RoundedBox args={[2, 2, 3]} radius={0.2}>
          <meshPhysicalMaterial color={new Color(0.05, 0.05, 0.1)} roughness={0.1} metalness={0.95} />
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
          <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.05)} roughness={0.05} metalness={0.98} clearcoat={1.0} />
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
          <meshPhysicalMaterial color={new Color(0.02, 0.02, 0.05)} roughness={0.05} metalness={0.98} clearcoat={1.0} />
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
          <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.15)} roughness={0.2} metalness={0.9} />
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
          <meshPhysicalMaterial color={new Color(0.1, 0.1, 0.15)} roughness={0.2} metalness={0.9} />
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
              <meshPhysicalMaterial color={new Color(0.03, 0.03, 0.08)} roughness={0.2} metalness={0.9} />
            </Cylinder>

            <Cylinder args={[0.4, 0.4, 0.2]} position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
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
          <RoundedBox key={`strobe-${i}`} args={[0.8, 0.8, 0.3]} radius={0.1} position={[x, 32, z]}>
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
            <meshPhysicalMaterial color={new Color(0.15, 0.15, 0.2)} roughness={0.6} metalness={0.3} />
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
