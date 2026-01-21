"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Color, DoubleSide, ShaderMaterial } from "three";

interface AdvancedShadersProps {
  beatData: {
    beat: boolean;
    intensity: number;
    frequencies?: number[];
  };
  isVideoStarted?: boolean;
}

// Holographic Material Shader
const holographicVertexShader = `
  uniform float time;
  uniform float beatIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    // Beat-reactive vertex displacement
    vec3 pos = position;
    pos += normal * sin(time * 2.0 + position.y * 0.1) * 0.1 * beatIntensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const holographicFragmentShader = `
  uniform float time;
  uniform float beatIntensity;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Fresnel effect
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - abs(dot(viewDir, vNormal));
    
    // Holographic scan lines
    float scanlines = sin(vUv.y * 100.0 + time * 5.0) * 0.1 + 0.9;
    
    // Beat-reactive colors
    vec3 color = mix(color1, color2, sin(time + vUv.x * 3.14) * 0.5 + 0.5);
    color = mix(color, color3, fresnel);
    
    // Pulsing intensity
    float pulse = sin(time * 10.0) * 0.3 + 0.7;
    pulse += beatIntensity * 2.0;
    
    gl_FragColor = vec4(color * scanlines * pulse * fresnel, fresnel * 0.8);
  }
`;

// Energy Field Shader
const energyFieldVertexShader = `
  uniform float time;
  uniform float beatIntensity;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const energyFieldFragmentShader = `
  uniform float time;
  uniform float beatIntensity;
  uniform vec3 centerPoint;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  float noise(vec2 uv) {
    return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Distance from center
    float dist = distance(vWorldPosition, centerPoint);
    
    // Energy waves
    float wave1 = sin(dist * 0.1 - time * 3.0) * 0.5 + 0.5;
    float wave2 = sin(dist * 0.05 - time * 2.0) * 0.5 + 0.5;
    
    // Beat-reactive energy
    float energy = wave1 * wave2 * (1.0 + beatIntensity * 2.0);
    
    // Add noise for turbulence
    float n = noise(uv * 10.0 + time);
    energy += n * 0.2;
    
    // Color gradient - GOLD und WEIß statt blau!
    vec3 color1 = vec3(1.0, 1.0, 1.0); // Weiß
    vec3 color2 = vec3(1.0, 0.8, 0.3); // Gold
    vec3 color = mix(color1, color2, energy);
    
    // Fade based on distance
    float alpha = 1.0 / (1.0 + dist * 0.01);
    alpha *= energy;
    
    gl_FragColor = vec4(color, alpha * 0.6);
  }
`;

// Holographic Sphere Component
export function HolographicSphere({
  position,
  size = 2,
  beatData,
  isVideoStarted = false,
}: {
  position: [number, number, number];
  size?: number;
  beatData: AdvancedShadersProps["beatData"];
  isVideoStarted?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const holographicMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: holographicVertexShader,
      fragmentShader: holographicFragmentShader,
      uniforms: {
        time: { value: 0 },
        beatIntensity: { value: 0 },
        color1: { value: new Color(1.0, 1.0, 1.0) }, // WEIß
        color2: { value: new Color(1.0, 0.8, 0.3) }, // GOLD
        color3: { value: new Color(0.8, 0.8, 0.8) }, // SILBER
      },
      transparent: true,
      side: DoubleSide,
    });
  }, []);

  useFrame(({ clock }) => {
    // Nur animieren wenn Video läuft!
    if (!isVideoStarted) return;
    
    if (meshRef.current && holographicMaterial) {
      const time = clock.getElapsedTime();

      // NULL-SAFE beatData handling!
      const safeIntensity = beatData?.intensity ?? 0;
      const safeBeat = beatData?.beat ?? false;

      holographicMaterial.uniforms.time.value = time;
      holographicMaterial.uniforms.beatIntensity.value = safeBeat
        ? safeIntensity * 8.0 // MASSIVE Beat-Reaktion!
        : 0;

      // Rotate the sphere
      if (safeBeat) {
        meshRef.current.rotation.y = time * (0.5 + safeIntensity * 5.0);
        meshRef.current.rotation.x = time * (0.3 + safeIntensity * 3.0);
        meshRef.current.rotation.z = time * safeIntensity * 2.0;
      } else {
        meshRef.current.rotation.y = time * 0.5;
        meshRef.current.rotation.x = time * 0.3;
      }

      // EXTREME Beat-reactive scale - wie explodierende Hologramme!
      const scale = 1 + (safeBeat ? safeIntensity * 2.5 : 0); // 8x extremer!
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={meshRef} position={position} material={holographicMaterial}>
      <sphereGeometry args={[size, 32, 32]} />
    </mesh>
  );
}

// Energy Field Component
export function EnergyField({
  center,
  size = 10,
  beatData,
}: {
  center: [number, number, number];
  size?: number;
  beatData: AdvancedShadersProps["beatData"];
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const energyMaterial = useMemo(() => {
    return new ShaderMaterial({
      vertexShader: energyFieldVertexShader,
      fragmentShader: energyFieldFragmentShader,
      uniforms: {
        time: { value: 0 },
        beatIntensity: { value: 0 },
        centerPoint: { value: new THREE.Vector3(...center) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, [center]);

  useFrame(({ clock }) => {
    if (meshRef.current && energyMaterial) {
      const time = clock.getElapsedTime();

      // NULL-SAFE beatData handling!
      const safeIntensity = beatData?.intensity ?? 0;
      const safeBeat = beatData?.beat ?? false;

      energyMaterial.uniforms.time.value = time;
      energyMaterial.uniforms.beatIntensity.value = safeBeat
        ? safeIntensity * 10.0 // ULTRA-EXTREME Beat-Reaktion!
        : 0;
    }
  });

  return (
    <mesh ref={meshRef} position={center} material={energyMaterial}>
      <sphereGeometry args={[size, 64, 64]} />
    </mesh>
  );
}

// Glowing Material Component
export function GlowingSphere({
  position,
  size = 1,
  color = "#ff6b35",
  beatData,
}: {
  position: [number, number, number];
  size?: number;
  color?: string;
  beatData: AdvancedShadersProps["beatData"];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && glowRef.current) {
      const time = clock.getElapsedTime();

      // NULL-SAFE beatData handling!
      const safeIntensity = beatData?.intensity ?? 0;
      const safeBeat = beatData?.beat ?? false;

      // Core sphere rotation
      meshRef.current.rotation.y = time;

      // Beat-reactive properties
      const beatMultiplier = safeBeat ? 1 + safeIntensity : 1;
      const emissiveIntensity = 0.5 * beatMultiplier;

      // Update materials
      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.emissiveIntensity = emissiveIntensity;
      }

      // EXTREME Glow sphere
      const glowScale = 1.5 * (safeBeat ? 1 + safeIntensity * 3.0 : 1); // 3x extremer!
      glowRef.current.scale.setScalar(glowScale);

      if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        glowRef.current.material.opacity = (safeBeat ? 0.3 + safeIntensity * 2.0 : 0.3); // ULTRA-hell!
      }
    }
  });

  return (
    <group position={position}>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// Metallic Crystal Component
export function MetallicCrystal({
  position,
  beatData,
}: {
  position: [number, number, number];
  beatData: AdvancedShadersProps["beatData"];
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();

      // NULL-SAFE beatData handling!
      const safeIntensity = beatData?.intensity ?? 0;
      const safeBeat = beatData?.beat ?? false;

      // ULTRA Complex rotation - wie verrückte Kristalle!
      if (safeBeat) {
        meshRef.current.rotation.y = time * (0.5 + safeIntensity * 8.0);
        meshRef.current.rotation.x = time * (0.3 + safeIntensity * 6.0);
        meshRef.current.rotation.z = time * (0.1 + safeIntensity * 4.0);
      } else {
        meshRef.current.rotation.y = time * 0.5;
        meshRef.current.rotation.x = time * 0.3;
        meshRef.current.rotation.z = time * 0.1;
      }

      // EXTREME Beat-reactive scale and material properties
      const beatMultiplier = safeBeat ? 1 + safeIntensity * 2.0 : 1; // 5x extremer!
      meshRef.current.scale.setScalar(beatMultiplier);

      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.emissiveIntensity = safeBeat
          ? safeIntensity * 2.0 // 6x extremer!
          : 0;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[2, 0]} />
      <meshPhysicalMaterial
        color="#ffffff" // WEIß statt silber!
        emissive="#ffd700" // GOLD statt blau!
        emissiveIntensity={0}
        roughness={0}
        metalness={1}
        clearcoat={1}
        clearcoatRoughness={0}
      />
    </mesh>
  );
}

// Main Advanced Shaders Component
export default function AdvancedShaders({ beatData, isVideoStarted = false }: AdvancedShadersProps) {
  return (
    <group>
      {/* Holographic Spheres */}
      <HolographicSphere
        position={[-40, 20, -80]}
        size={3}
        beatData={beatData}
        isVideoStarted={isVideoStarted}
      />
      <HolographicSphere
        position={[40, -30, -90]}
        size={2.5}
        beatData={beatData}
        isVideoStarted={isVideoStarted}
      />

      {/* Energy Fields */}
      <EnergyField center={[0, 0, -60]} size={15} beatData={beatData} />
      <EnergyField center={[-30, 40, -100]} size={12} beatData={beatData} />

      {/* Glowing Spheres - NUR GOLD/WEIß! */}
      <GlowingSphere
        position={[60, 10, -70]}
        size={1.5}
        color="#ffd700" // GOLD statt orange!
        beatData={beatData}
      />
      <GlowingSphere
        position={[-60, -20, -85]}
        size={2}
        color="#ffffff" // WEIß statt violett!
        beatData={beatData}
      />

      {/* Metallic Crystals */}
      <MetallicCrystal position={[20, 40, -50]} beatData={beatData} />
      <MetallicCrystal position={[-45, -35, -75]} beatData={beatData} />
    </group>
  );
}
