"use client";

import { useRef, useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import * as THREE from "three";

interface FPSControlsProps {
  movementSpeed?: number;
  lookSpeed?: number;
  enabled?: boolean;
  disableOnInput?: boolean; // Neue Option um automatisch bei Input-Focus zu deaktivieren
  boundaries?: {
    minX?: number;
    maxX?: number;
    minZ?: number;
    maxZ?: number;
  };
}

export default function FPSControls({
  movementSpeed = 10,
  lookSpeed = 0.002,
  enabled = true,
  disableOnInput = true, // Standardmäßig Input-aware
  boundaries,
}: FPSControlsProps) {
  const { camera, gl } = useThree();
  const moveVector = useRef(new Vector3(0, 0, 0));
  const velocity = useRef(new Vector3(0, 0, 0));
  const direction = useRef(new Vector3(0, 0, 0));
  const isLocked = useRef(false);
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    shift: false,
  });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Mouse look variables
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const PI_2 = Math.PI / 2;
  const lastPointerLockRequest = useRef(0);
  const POINTER_LOCK_COOLDOWN = 1000; // 1 second cooldown between requests

  useEffect(() => {
    const touch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setIsTouchDevice(!!touch);
  }, []);

  useEffect(() => {
    // Skip pointer-lock lifecycle on touch devices
    if (!enabled || isTouchDevice) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 🚨 CRITICAL: Prüfe ob Input-Felder aktiv sind
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.getAttribute("contenteditable") === "true" ||
          activeElement.getAttribute("role") === "textbox" ||
          activeElement.classList.contains("input-field") ||
          activeElement.closest("form") !== null ||
          activeElement.closest('[role="dialog"]') !== null ||
          activeElement.closest(".auth-modal") !== null);

      // Wenn disableOnInput aktiviert ist UND Input aktiv ist, nicht reagieren!
      if (disableOnInput && isInputActive) {
        console.log("🚨 FPSControls: Input detected, ignoring keyboard:", activeElement?.tagName);
        return;
      }

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.w = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.a = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.s = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.d = true;
          break;
        case "Space":
          // Nur preventDefault wenn NICHT in Input UND disableOnInput aktiv
          if (!isInputActive || !disableOnInput) {
            keys.current.space = true;
            event.preventDefault();
          }
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.shift = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // 🚨 CRITICAL: Prüfe ob Input-Felder aktiv sind
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.tagName === "SELECT" ||
          activeElement.getAttribute("contenteditable") === "true" ||
          activeElement.getAttribute("role") === "textbox" ||
          activeElement.classList.contains("input-field") ||
          activeElement.closest("form") !== null ||
          activeElement.closest('[role="dialog"]') !== null ||
          activeElement.closest(".auth-modal") !== null);

      // Wenn disableOnInput aktiviert ist UND Input aktiv ist, nicht reagieren!
      if (disableOnInput && isInputActive) {
        return;
      }

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.w = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.a = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.s = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.d = false;
          break;
        case "Space":
          keys.current.space = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.current.shift = false;
          break;
      }
    };

    const handleClick = async () => {
      // Prevent rapid-fire pointer lock requests
      const now = Date.now();
      if (now - lastPointerLockRequest.current < POINTER_LOCK_COOLDOWN) {
        return;
      }

      if (!isLocked.current && document.pointerLockElement !== gl.domElement) {
        lastPointerLockRequest.current = now;
        try {
          await gl.domElement.requestPointerLock();
        } catch (error) {
          // Silently handle - user may have cancelled quickly
          isLocked.current = false;
        }
      }
    };

    const handlePointerLockChange = () => {
      try {
        isLocked.current = document.pointerLockElement === gl.domElement;
      } catch (error) {
        // Fallback if pointer lock check fails
        isLocked.current = false;
      }
    };

    const handlePointerLockError = () => {
      isLocked.current = false;
      // Silently handle pointer lock errors
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isLocked.current || !document.pointerLockElement) return;

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= movementX * lookSpeed;
      euler.current.x -= movementY * lookSpeed;
      euler.current.x = Math.max(PI_2 - Math.PI, Math.min(PI_2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mozpointerlockchange", handlePointerLockChange);
    document.addEventListener("webkitpointerlockchange", handlePointerLockChange);
    document.addEventListener("pointerlockerror", handlePointerLockError);
    document.addEventListener("mozpointerlockerror", handlePointerLockError);
    document.addEventListener("webkitpointerlockerror", handlePointerLockError);
    gl.domElement.addEventListener("click", handleClick);
    document.addEventListener("mousemove", handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("mozpointerlockchange", handlePointerLockChange);
      document.removeEventListener("webkitpointerlockchange", handlePointerLockChange);
      document.removeEventListener("pointerlockerror", handlePointerLockError);
      document.removeEventListener("mozpointerlockerror", handlePointerLockError);
      document.removeEventListener("webkitpointerlockerror", handlePointerLockError);
      gl.domElement.removeEventListener("click", handleClick);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [PI_2, camera, gl.domElement, lookSpeed, enabled, disableOnInput, isTouchDevice]);

  useFrame((state, delta) => {
    if (!enabled || !camera || isTouchDevice) return;

    // 🛡️ ZUSÄTZLICHER SCHUTZ: Prüfe nochmals auf Input-Focus in useFrame
    const activeElement = document.activeElement;
    const isInputActive =
      disableOnInput &&
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT" ||
        activeElement.getAttribute("contenteditable") === "true" ||
        activeElement.getAttribute("role") === "textbox" ||
        activeElement.classList.contains("input-field") ||
        activeElement.closest("form") !== null ||
        activeElement.closest('[role="dialog"]') !== null ||
        activeElement.closest(".auth-modal") !== null);

    // Wenn Input aktiv ist, alle Bewegungen stoppen!
    if (isInputActive) {
      // Reset alle Key-States
      keys.current = {
        w: false,
        a: false,
        s: false,
        d: false,
        space: false,
        shift: false,
      };
      return;
    }

    try {
      // Reset movement vector
      moveVector.current.set(0, 0, 0);

      // Calculate movement based on camera direction
      camera.getWorldDirection(direction.current);

      // Forward/Backward
      if (keys.current.w) {
        moveVector.current.add(direction.current);
      }
      if (keys.current.s) {
        moveVector.current.sub(direction.current);
      }

      // Left/Right strafe
      const right = new Vector3();
      right.crossVectors(direction.current, camera.up).normalize();

      if (keys.current.a) {
        moveVector.current.sub(right);
      }
      if (keys.current.d) {
        moveVector.current.add(right);
      }

      // Up/Down
      if (keys.current.space) {
        moveVector.current.y += 1;
      }
      if (keys.current.shift) {
        moveVector.current.y -= 1;
      }

      // Normalize and apply speed
      if (moveVector.current.length() > 0) {
        moveVector.current.normalize();
        moveVector.current.multiplyScalar(movementSpeed * Math.min(delta, 0.1)); // Limit delta to prevent jitter

        // Apply movement to camera
        camera.position.add(moveVector.current);

        // Apply boundaries if specified
        if (boundaries) {
          if (boundaries.minX !== undefined) {
            camera.position.x = Math.max(camera.position.x, boundaries.minX);
          }
          if (boundaries.maxX !== undefined) {
            camera.position.x = Math.min(camera.position.x, boundaries.maxX);
          }
          if (boundaries.minZ !== undefined) {
            camera.position.z = Math.max(camera.position.z, boundaries.minZ);
          }
          if (boundaries.maxZ !== undefined) {
            camera.position.z = Math.min(camera.position.z, boundaries.maxZ);
          }
        }
      }

      // Keep camera above ground level
      camera.position.y = Math.max(camera.position.y, 2.5); // Augenhöhe - verhindert im Boden versinken
      camera.position.y = Math.min(camera.position.y, 15); // Maximale Höhe - verhindert durch Decke fliegen
    } catch (error) {
      console.warn("FPS Controls frame error:", error);
    }
  });

  return null;
}
