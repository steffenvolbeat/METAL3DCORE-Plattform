"use client";

import React, { useRef, useEffect, useState } from "react";
import { Canvas, CanvasProps } from "@react-three/fiber";

interface SafeCanvasProps extends CanvasProps {
  fallback?: React.ReactNode;
  onWebGLFail?: () => void;
}

export function SafeCanvas({ children, fallback, onWebGLFail, ...props }: SafeCanvasProps) {
  const [canRender, setCanRender] = useState<boolean | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const testWebGL = async () => {
      try {
        // Create test canvas
        const testCanvas = document.createElement("canvas");
        testCanvas.width = 1;
        testCanvas.height = 1;

        // Try to get WebGL context with the same settings as we'll use
        const gl = testCanvas.getContext("webgl", {
          antialias: true,
          alpha: false,
          failIfMajorPerformanceCaveat: true,
          preserveDrawingBuffer: false,
        });

        if (!gl) {
          console.warn("SafeCanvas: WebGL context creation failed");
          setCanRender(false);
          onWebGLFail?.();
          return;
        }

        // Check for problematic renderers
        const renderer = gl.getParameter(gl.RENDERER) || "";
        const vendor = gl.getParameter(gl.VENDOR) || "";

        if (
          renderer.includes("Disabled") ||
          vendor.includes("Disabled") ||
          renderer.includes("0xffff") ||
          vendor.includes("0xffff") ||
          renderer === "" ||
          vendor === ""
        ) {
          console.warn("SafeCanvas: WebGL renderer is disabled or problematic");
          setCanRender(false);
          onWebGLFail?.();
          return;
        }

        // Test basic WebGL operations
        const buffer = gl.createBuffer();
        if (!buffer) {
          console.warn("SafeCanvas: WebGL buffer creation failed");
          setCanRender(false);
          onWebGLFail?.();
          return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0]), gl.STATIC_DRAW);

        if (gl.getError() !== gl.NO_ERROR) {
          console.warn("SafeCanvas: WebGL operations failed");
          setCanRender(false);
          onWebGLFail?.();
          return;
        }

        // Clean up
        gl.deleteBuffer(buffer);
        const loseContext = gl.getExtension("WEBGL_lose_context");
        loseContext?.loseContext();

        console.log("SafeCanvas: WebGL test passed");
        setCanRender(true);
      } catch (error) {
        console.warn("SafeCanvas: WebGL test error:", error);
        setCanRender(false);
        onWebGLFail?.();
      }
    };

    testWebGL();
  }, [onWebGLFail]);

  if (canRender === null) {
    return (
      <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-lg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400">Testing 3D Support...</p>
        </div>
      </div>
    );
  }

  if (!canRender) {
    return (
      fallback || (
        <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🚫</div>
            <h3 className="text-xl font-bold text-white mb-2">3D Not Available</h3>
            <p className="text-gray-400">WebGL is not supported on this device</p>
          </div>
        </div>
      )
    );
  }

  return (
    <Canvas
      ref={canvasRef}
      gl={{
        antialias: true,
        alpha: false,
        failIfMajorPerformanceCaveat: true,
        preserveDrawingBuffer: false,
      }}
      onError={error => {
        console.error("SafeCanvas: Canvas error:", error);
        setCanRender(false);
        onWebGLFail?.();
      }}
      {...props}
    >
      {children}
    </Canvas>
  );
}

export default SafeCanvas;
