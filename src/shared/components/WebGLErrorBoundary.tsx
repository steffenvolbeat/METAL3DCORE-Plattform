"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a WebGL related error with expanded detection
    const isWebGLError =
      error.message.includes("WebGL") ||
      error.message.includes("THREE.WebGLRenderer") ||
      error.message.includes("A WebGL context could not be created") ||
      error.message.includes("BindToCurrentSequence failed") ||
      error.message.includes("VENDOR = 0xffff") ||
      error.message.includes("DEVICE = 0xffff") ||
      error.message.includes("GL_VENDOR = Disabled") ||
      error.message.includes("GL_RENDERER = Disabled") ||
      error.message.includes("Could not create a WebGL context") ||
      error.message.includes("WebGLRenderingContext") ||
      error.message.includes("webgl context") ||
      error.stack?.includes("Canvas") ||
      error.stack?.includes("WebGL");

    if (isWebGLError) {
      console.warn("WebGL Error caught by boundary:", error.message);
      return { hasError: true, error };
    }

    // Re-throw non-WebGL errors
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("WebGL Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full bg-gradient-to-b from-gray-900 to-black rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4 p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">3D Engine Error</h2>
            <p className="text-gray-300 mb-6">
              3D rendering ist auf diesem System nicht verfügbar. WebGL wird möglicherweise nicht unterstützt.
            </p>

            <div className="text-xs text-gray-400 space-y-2">
              <p>💡 Lösungsvorschläge:</p>
              <ul className="list-disc list-inside text-left space-y-1">
                <li>Browser aktualisieren</li>
                <li>Hardware-Beschleunigung aktivieren</li>
                <li>Anderen Browser verwenden (Chrome/Firefox)</li>
                <li>GPU-Treiber aktualisieren</li>
              </ul>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              🔄 Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WebGLErrorBoundary;
