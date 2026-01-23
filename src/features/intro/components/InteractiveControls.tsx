"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, Euler } from "three";

interface InteractiveControlsProps {
  onPlanetClick?: (planetId: string) => void;
  onCameraMove?: (position: Vector3, rotation: Euler) => void;
  beatData: { beat: boolean; intensity: number };
}

export default function InteractiveControls({
  onPlanetClick,
  onCameraMove,
  beatData,
}: InteractiveControlsProps) {
  const { camera, gl } = useThree();
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    space: false,
  });

  const [mouseData, setMouseData] = useState({
    x: 0,
    y: 0,
    isLocked: false,
  });

  const [touchData, setTouchData] = useState({
    lastTouch: { x: 0, y: 0 },
    isMoving: false,
  });

  const velocityRef = useRef(new Vector3(0, 0, 0));
  const rotationRef = useRef({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState(true);

  // WASD Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      switch (key) {
        case "w":
          setKeys((prev) => ({ ...prev, w: true }));
          break;
        case "a":
          setKeys((prev) => ({ ...prev, a: true }));
          break;
        case "s":
          setKeys((prev) => ({ ...prev, s: true }));
          break;
        case "d":
          setKeys((prev) => ({ ...prev, d: true }));
          break;
        case "shift":
          setKeys((prev) => ({ ...prev, shift: true }));
          break;
        case " ":
          event.preventDefault();
          setKeys((prev) => ({ ...prev, space: true }));
          break;
        case "escape":
          // Exit pointer lock
          document.exitPointerLock();
          setMouseData((prev) => ({ ...prev, isLocked: false }));
          break;
        case "c":
          // Toggle controls
          setIsEnabled((prev) => !prev);
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      switch (key) {
        case "w":
          setKeys((prev) => ({ ...prev, w: false }));
          break;
        case "a":
          setKeys((prev) => ({ ...prev, a: false }));
          break;
        case "s":
          setKeys((prev) => ({ ...prev, s: false }));
          break;
        case "d":
          setKeys((prev) => ({ ...prev, d: false }));
          break;
        case "shift":
          setKeys((prev) => ({ ...prev, shift: false }));
          break;
        case " ":
          setKeys((prev) => ({ ...prev, space: false }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Mouse Controls (Pointer Lock)
  useEffect(() => {
    const handlePointerLockChange = () => {
      setMouseData((prev) => ({
        ...prev,
        isLocked: document.pointerLockElement === gl.domElement,
      }));
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseData.isLocked || !isEnabled) return;

      const sensitivity = 0.002;
      rotationRef.current.y -= event.movementX * sensitivity;
      rotationRef.current.x -= event.movementY * sensitivity;

      // Limit vertical rotation
      rotationRef.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, rotationRef.current.x)
      );
    };

    const handleClick = () => {
      if (!mouseData.isLocked && isEnabled) {
        gl.domElement.requestPointerLock();
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handleMouseMove);
    gl.domElement.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
      document.removeEventListener("mousemove", handleMouseMove);
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [gl, mouseData.isLocked, isEnabled]);

  // Touch Controls
  useEffect(() => {
    const handleTouchStart = (event: TouchEvent) => {
      if (!isEnabled) return;

      const touch = event.touches[0];
      setTouchData((prev) => ({
        ...prev,
        lastTouch: { x: touch.clientX, y: touch.clientY },
        isMoving: true,
      }));
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchData.isMoving || !isEnabled) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchData.lastTouch.x;
      const deltaY = touch.clientY - touchData.lastTouch.y;

      const sensitivity = 0.005;
      rotationRef.current.y -= deltaX * sensitivity;
      rotationRef.current.x -= deltaY * sensitivity;

      rotationRef.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, rotationRef.current.x)
      );

      setTouchData((prev) => ({
        ...prev,
        lastTouch: { x: touch.clientX, y: touch.clientY },
      }));
    };

    const handleTouchEnd = () => {
      setTouchData((prev) => ({ ...prev, isMoving: false }));
    };

    gl.domElement.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    gl.domElement.addEventListener("touchmove", handleTouchMove, {
      passive: true,
    });
    gl.domElement.addEventListener("touchend", handleTouchEnd);

    return () => {
      gl.domElement.removeEventListener("touchstart", handleTouchStart);
      gl.domElement.removeEventListener("touchmove", handleTouchMove);
      gl.domElement.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gl, touchData, isEnabled]);

  // Camera Movement Update
  useFrame((state, delta) => {
    if (!isEnabled) return;

    const speed = keys.shift ? 25 : 10; // Boost speed with Shift
    const beatBoost = beatData.beat ? 1 + beatData.intensity * 0.5 : 1;
    const finalSpeed = speed * beatBoost;

    // Calculate movement direction
    const direction = new Vector3(0, 0, 0);

    if (keys.w) direction.z -= 1;
    if (keys.s) direction.z += 1;
    if (keys.a) direction.x -= 1;
    if (keys.d) direction.x += 1;
    if (keys.space) direction.y += 1;

    // Normalize diagonal movement
    if (direction.length() > 0) {
      direction.normalize();
    }

    // Apply camera rotation to movement
    direction.applyEuler(new Euler(0, rotationRef.current.y, 0));

    // Update velocity with momentum
    velocityRef.current.lerp(direction.multiplyScalar(finalSpeed), delta * 8);

    // Apply movement
    camera.position.add(velocityRef.current.clone().multiplyScalar(delta));

    // Apply rotation
    camera.rotation.set(rotationRef.current.x, rotationRef.current.y, 0);

    // Callback for camera updates
    onCameraMove?.(camera.position, camera.rotation);
  });

  // Controls UI
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-black/80 backdrop-blur-sm border border-orange-500/30 rounded-lg p-4 space-y-2">
        <h4 className="text-orange-400 font-bold text-sm">
          🎮 Interactive Controls
        </h4>

        <div className="text-white text-xs space-y-1">
          <div className={`${keys.w ? "text-green-400" : "text-gray-400"}`}>
            W - Forward {keys.w ? "▲" : ""}
          </div>
          <div className={`${keys.a ? "text-green-400" : "text-gray-400"}`}>
            A - Left {keys.a ? "◄" : ""}
          </div>
          <div className={`${keys.s ? "text-green-400" : "text-gray-400"}`}>
            S - Backward {keys.s ? "▼" : ""}
          </div>
          <div className={`${keys.d ? "text-green-400" : "text-gray-400"}`}>
            D - Right {keys.d ? "►" : ""}
          </div>
          <div className={`${keys.space ? "text-green-400" : "text-gray-400"}`}>
            Space - Up {keys.space ? "⬆" : ""}
          </div>
          <div
            className={`${keys.shift ? "text-orange-400" : "text-gray-400"}`}
          >
            Shift - Speed Boost {keys.shift ? "🚀" : ""}
          </div>
        </div>

        <div className="border-t border-gray-600 pt-2 text-xs">
          <div
            className={`${
              mouseData.isLocked ? "text-green-400" : "text-yellow-400"
            }`}
          >
            Mouse: {mouseData.isLocked ? "Locked 🔒" : "Click to Lock"}
          </div>
          <div className="text-gray-400">ESC - Exit Mouse Lock</div>
          <div className={`${isEnabled ? "text-green-400" : "text-red-400"}`}>
            C - Toggle Controls ({isEnabled ? "ON" : "OFF"})
          </div>
        </div>

        {beatData.beat && (
          <div className="text-orange-400 animate-pulse text-xs">
            🎵 Beat Boost Active! ({(beatData.intensity * 100).toFixed(0)}%)
          </div>
        )}
      </div>
    </div>
  );
}

// Clickable Planets Component
export function ClickablePlanets({
  onPlanetClick,
  beatData,
}: {
  onPlanetClick?: (planetId: string) => void;
  beatData: { beat: boolean; intensity: number };
}) {
  const planets = [
    { id: "fire-planet", position: [-30, 15, -60], color: "#FF4500", size: 4 },
    { id: "ice-planet", position: [40, -20, -80], color: "#00BFFF", size: 3 },
    { id: "metal-planet", position: [0, 30, -40], color: "#C0C0C0", size: 2.5 },
    {
      id: "energy-planet",
      position: [-50, -10, -100],
      color: "#FFD700",
      size: 5,
    },
  ];

  return (
    <group>
      {planets.map((planet) => (
        <mesh
          key={planet.id}
          position={planet.position as [number, number, number]}
          onClick={() => onPlanetClick?.(planet.id)}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "auto";
          }}
        >
          <sphereGeometry args={[planet.size, 32, 32]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.color}
            emissiveIntensity={beatData.beat ? beatData.intensity * 0.5 : 0.1}
            roughness={0.3}
            metalness={0.7}
          />

          {/* Glow ring on hover/beat */}
          <mesh scale={beatData.beat ? 1.2 : 1.1}>
            <ringGeometry args={[planet.size * 1.2, planet.size * 1.4, 32]} />
            <meshBasicMaterial
              color={planet.color}
              transparent
              opacity={beatData.beat ? beatData.intensity * 0.6 : 0.2}
              side={2} // DoubleSide
            />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}
