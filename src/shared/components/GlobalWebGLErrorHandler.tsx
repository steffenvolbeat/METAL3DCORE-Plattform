"use client";

import { useEffect } from "react";

export function GlobalWebGLErrorHandler() {
  useEffect(() => {
    // Global error handler for uncaught WebGL errors
    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error || event.message;

      // Check if it's a WebGL related error
      const isWebGLError =
        (typeof error === "string" &&
          (error.includes("WebGL") ||
            error.includes("THREE.WebGLRenderer") ||
            error.includes("A WebGL context could not be created") ||
            error.includes("BindToCurrentSequence failed") ||
            error.includes("VENDOR = 0xffff") ||
            error.includes("DEVICE = 0xffff") ||
            error.includes("GL_VENDOR = Disabled") ||
            error.includes("GL_RENDERER = Disabled"))) ||
        (error?.message &&
          (error.message.includes("WebGL") ||
            error.message.includes("THREE.WebGLRenderer") ||
            error.message.includes("A WebGL context could not be created") ||
            error.message.includes("BindToCurrentSequence failed")));

      if (isWebGLError) {
        console.warn("Global WebGL error caught and suppressed:", error);
        event.preventDefault();
        return false;
      }
    };

    // Global unhandled rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;

      const isWebGLError =
        (typeof reason === "string" &&
          (reason.includes("WebGL") ||
            reason.includes("THREE.WebGLRenderer") ||
            reason.includes("A WebGL context could not be created"))) ||
        (reason?.message &&
          (reason.message.includes("WebGL") ||
            reason.message.includes("THREE.WebGLRenderer") ||
            reason.message.includes("A WebGL context could not be created")));

      if (isWebGLError) {
        console.warn("Global WebGL promise rejection caught and suppressed:", reason);
        event.preventDefault();
        return false;
      }
    };

    // Add event listeners
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
