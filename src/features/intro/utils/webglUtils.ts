/**
 * WebGL Context Loss Handler
 * Handles WebGL context loss and restoration
 */
export function setupWebGLContextLossHandler() {
  if (typeof window === "undefined") return;

  const canvas = document.querySelector("canvas");
  if (!canvas) return;

  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    console.warn("⚠️ WebGL context lost. Attempting to restore...");
  });

  canvas.addEventListener("webglcontextrestored", () => {
    console.log("✅ WebGL context restored successfully.");
  });
}

/**
 * Performance Monitor
 * Monitors and logs performance metrics
 */
export function monitorPerformance() {
  if (typeof window === "undefined") return;

  let frameCount = 0;
  let lastTime = performance.now();

  const checkFPS = () => {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      if (fps < 30) {
        console.warn(`⚠️ Low FPS detected: ${fps} fps`);
      }
      frameCount = 0;
      lastTime = currentTime;
    }

    requestAnimationFrame(checkFPS);
  };

  requestAnimationFrame(checkFPS);
}

/**
 * Check WebGL Support
 */
export function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Get optimal pixel ratio based on device performance
 */
export function getOptimalPixelRatio(): number {
  if (typeof window === "undefined") return 1;

  const dpr = window.devicePixelRatio || 1;

  // Limit pixel ratio on mobile devices for better performance
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  ) {
    return Math.min(dpr, 1.5);
  }

  return Math.min(dpr, 2);
}
