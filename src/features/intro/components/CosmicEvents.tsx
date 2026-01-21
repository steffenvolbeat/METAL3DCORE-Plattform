"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Mesh, Points, ShaderMaterial } from "three";

interface CosmicEventsProps {
  beatData: {
    beat: boolean;
    intensity: number;
    frequencies?: number[];
  };
  isVideoStarted?: boolean;
}

// Black Hole Shader
const blackHoleVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const blackHoleFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Noise function for event horizon distortion
  float noise(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // Gravitational lensing effect
  vec2 lensDistortion(vec2 uv, float strength) {
    vec2 center = vec2(0.5);
    vec2 offset = uv - center;
    float dist = length(offset);
    
    // Schwarzschild radius effect
    float warp = strength / (dist * dist + 0.1);
    return uv + offset * warp * 0.3;
  }
  
  void main() {
    vec2 distortedUv = lensDistortion(vUv, uIntensity);
    
    // Distance from center for event horizon
    float dist = length(vUv - 0.5) * 2.0;
    
    // Event horizon gradient
    float horizon = 1.0 - smoothstep(0.0, 0.8, dist);
    
    // Accretion disk spirals
    float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
    float spiral = sin(angle * 3.0 + dist * 20.0 - uTime * 2.0) * 0.5 + 0.5;
    
    // Time-based pulsing
    float pulse = sin(uTime * 3.0 + dist * 5.0) * 0.3 + 0.7;
    
    // Combine effects
    vec3 color = uColor;
    color += vec3(1.0, 0.8, 0.3) * spiral * (1.0 - horizon); // GOLD statt violett!
    color *= pulse;
    color *= uIntensity;
    
    float alpha = horizon + spiral * 0.3;
    alpha *= smoothstep(1.0, 0.0, dist); // Fade at edges
    
    gl_FragColor = vec4(color, alpha * 0.8);
  }
`;

// Supernova Explosion Shader
const supernovaVertexShader = `
  uniform float uTime;
  uniform float uExplosionRadius;
  uniform float uIntensity;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying float vExplosionFactor;
  
  void main() {
    vUv = uv;
    
    // Explosion displacement
    vec3 explosionOffset = normalize(position) * uExplosionRadius * uIntensity;
    vec3 newPosition = position + explosionOffset;
    
    vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vExplosionFactor = uExplosionRadius;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const supernovaFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uCoreColor;
  uniform vec3 uShockwaveColor;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying float vExplosionFactor;
  
  float noise(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453123);
  }
  
  void main() {
    vec2 center = vec2(0.5);
    float dist = length(vUv - center);
    
    // Core explosion
    float coreIntensity = 1.0 - smoothstep(0.0, 0.3, dist);
    
    // Shockwave rings
    float shockwave = sin(dist * 30.0 - uTime * 10.0) * 0.5 + 0.5;
    shockwave *= 1.0 - smoothstep(0.0, 1.0, dist);
    
    // Turbulence in explosion
    vec3 turbulence = vec3(
      noise(vWorldPosition * 5.0 + uTime),
      noise(vWorldPosition * 7.0 + uTime * 1.3),
      noise(vWorldPosition * 3.0 + uTime * 0.8)
    );
    
    // Color mixing based on explosion intensity
    vec3 color = mix(uShockwaveColor, uCoreColor, coreIntensity);
    color += turbulence * 0.3;
    color *= uIntensity;
    
    // Dynamic alpha for explosive effect
    float alpha = (coreIntensity + shockwave * 0.7) * uIntensity;
    alpha *= smoothstep(1.0, 0.0, dist);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// Gravitational Lensing Effect
function GravitationalLens({
  position,
  beatData,
}: {
  position: [number, number, number];
  beatData: any;
}) {
  const meshRef = useRef<Mesh>(null);

  const shaderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: blackHoleVertexShader,
        fragmentShader: blackHoleFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0.5 },
          uColor: { value: new THREE.Color(0.0, 0.0, 0.0) }, // SCHWARZ für Schwarzes Loch!
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    []
  );

  useFrame((state) => {
    if (meshRef.current && shaderMaterial) {
      // NULL-SAFE beatData handling!
      const safeIntensity = beatData?.intensity ?? 0;
      const safeBeat = beatData?.beat ?? false;

      shaderMaterial.uniforms.uTime.value = state.clock.getElapsedTime();
      shaderMaterial.uniforms.uIntensity.value = safeBeat
        ? 0.5 + safeIntensity * 0.8
        : 0.3;

      // Gravitational rotation effect
      meshRef.current.rotation.z += safeBeat ? safeIntensity * 0.02 : 0.005;
    }
  });

  return (
    <mesh ref={meshRef} position={position} material={shaderMaterial}>
      <planeGeometry args={[15, 15, 50, 50]} />
    </mesh>
  );
}

// Event Horizon Component
function EventHorizon({
  position,
  beatData,
}: {
  position: [number, number, number];
  beatData: any;
}) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();

      // NULL-SAFE beatData handling!
      const safeIntensity = beatData?.intensity ?? 0;
      const safeBeat = beatData?.beat ?? false;

      // EXTREME Event horizon warping - wie ein explodierendes Schwarzes Loch!
      meshRef.current.rotation.x += (safeBeat ? 0.15 + safeIntensity * 0.8 : 0.01);
      meshRef.current.rotation.y += (safeBeat ? 0.2 + safeIntensity * 1.2 : 0.015);
      meshRef.current.rotation.z += (safeBeat ? 0.1 + safeIntensity * 0.5 : 0.005);

      // ULTRA Beat-reactive size - MASSIVE Skalierung!
      const scale = safeBeat ? 1 + safeIntensity * 5.0 : 1; // 10x extremer!
      meshRef.current.scale.setScalar(scale);

      // EXTREME Material opacity pulsing
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = safeBeat ? 0.6 + Math.sin(time * 20) * safeIntensity * 0.8 : 0.6 + Math.sin(time * 4) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial
        color="#000000"
        transparent
        opacity={0.6}
        blending={THREE.MultiplyBlending}
        premultipliedAlpha={true}
      />
    </mesh>
  );
}

// Supernova Explosion Component
function SupernovaExplosion({
  position,
  beatData,
  isExploding = false,
}: {
  position: [number, number, number];
  beatData: any;
  isExploding?: boolean;
}) {
  const meshRef = useRef<Mesh>(null);
  const [explosionStart, setExplosionStart] = useState<number>(0);

  const shaderMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: supernovaVertexShader,
        fragmentShader: supernovaFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uExplosionRadius: { value: 0 },
          uIntensity: { value: 1 },
          uCoreColor: { value: new THREE.Color(1, 0.8, 0.2) },
          uShockwaveColor: { value: new THREE.Color(1, 0.2, 0.1) },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    if (meshRef.current && shaderMaterial) {
      const time = state.clock.getElapsedTime();

      // NULL-SAFE beatData handling!
      const safeIntensity = beatData?.intensity ?? 0;
      const safeBeat = beatData?.beat ?? false;

      if (isExploding && explosionStart === 0) {
        setExplosionStart(time);
      }

      const explosionTime = explosionStart > 0 ? time - explosionStart : 0;

      shaderMaterial.uniforms.uTime.value = time;
      shaderMaterial.uniforms.uExplosionRadius.value = Math.min(
        explosionTime * 2,
        10
      );
      shaderMaterial.uniforms.uIntensity.value = isExploding
        ? Math.max(0, 2 - explosionTime * 0.3)
        : safeBeat
        ? safeIntensity
        : 0.3;

      // Explosion rotation
      if (isExploding) {
        meshRef.current.rotation.x += 0.02;
        meshRef.current.rotation.y += 0.03;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} material={shaderMaterial}>
      <sphereGeometry args={[5, 64, 64]} />
    </mesh>
  );
}

// Shockwave Particles
function ShockwaveParticles({
  position,
  beatData,
  isActive = false,
}: {
  position: [number, number, number];
  beatData: any;
  isActive?: boolean;
}) {
  const pointsRef = useRef<Points>(null);
  const particleCount = 800;

  const { positions, velocities, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Spherical explosion distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Velocity vectors for explosion
      const speed = 2 + Math.random() * 8;
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i * 3 + 2] = Math.cos(phi) * speed;

      // Hot explosion colors
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.7;
      colors[i * 3 + 2] = Math.random() * 0.3;

      sizes[i] = 1 + Math.random() * 3;
    }

    return { positions, velocities, colors, sizes };
  }, []);

  useFrame(() => {
    if (pointsRef.current && isActive) {
      const positionArray = pointsRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Update positions with velocity
        positionArray[i3] += velocities[i3];
        positionArray[i3 + 1] += velocities[i3 + 1];
        positionArray[i3 + 2] += velocities[i3 + 2];

        // Add some drag
        velocities[i3] *= 0.995;
        velocities[i3 + 1] *= 0.995;
        velocities[i3 + 2] *= 0.995;
      }

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!isActive) return null;

  return (
    <group position={position}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            args={[positions, 3]}
            attach="attributes-position"
            array={positions}
            count={particleCount}
            itemSize={3}
          />
          <bufferAttribute
            args={[colors, 3]}
            attach="attributes-color"
            array={colors}
            count={particleCount}
            itemSize={3}
          />
          <bufferAttribute
            args={[sizes, 1]}
            attach="attributes-size"
            array={sizes}
            count={particleCount}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={3}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

// Main Cosmic Events Component
export default function CosmicEvents({ beatData, isVideoStarted = false }: CosmicEventsProps) {
  const [supernovaActive, setSupernovaActive] = useState(false);
  const [shockwaveActive, setShockwaveActive] = useState(false);

  // Trigger supernova on intense beats - NULL-SAFE!
  useFrame(() => {
    const safeIntensity = beatData?.intensity ?? 0;
    const safeBeat = beatData?.beat ?? false;

    if (safeBeat && safeIntensity > 0.8 && !supernovaActive) {
      setSupernovaActive(true);
      setTimeout(() => setShockwaveActive(true), 500);
      setTimeout(() => {
        setSupernovaActive(false);
        setShockwaveActive(false);
      }, 8000);
    }
  });

  return (
    <group>
      {/* Black Hole with Gravitational Lensing */}
      <GravitationalLens position={[-100, 50, -150]} beatData={beatData} />
      <EventHorizon position={[-100, 50, -150]} beatData={beatData} />

      {/* Supernova */}
      <SupernovaExplosion
        position={[120, -60, -200]}
        beatData={beatData}
        isExploding={supernovaActive}
      />

      {/* Shockwave Particles */}
      <ShockwaveParticles
        position={[120, -60, -200]}
        beatData={beatData}
        isActive={shockwaveActive}
      />

      {/* Additional smaller black holes */}
      <GravitationalLens position={[80, 100, -100]} beatData={beatData} />
      <EventHorizon position={[80, 100, -100]} beatData={beatData} />

      <GravitationalLens position={[-150, -80, -180]} beatData={beatData} />
      <EventHorizon position={[-150, -80, -180]} beatData={beatData} />
    </group>
  );
}
