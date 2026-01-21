"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { WebcamUser, LiveConcertWebcamProps, DEFAULT_WEBCAM_CONFIG } from "../types/webcam.types";

export function LiveWebcamIntegration({ isInStadium, onWebcamUsersUpdate }: LiveConcertWebcamProps) {
  const { data: session } = useSession();
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamUsers, setWebcamUsers] = useState<WebcamUser[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // 🎥 WEBCAM ACTIVATION with enhanced error handling
  const startWebcam = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("UNSUPPORTED_BROWSER");
      }

      // Check for available video devices first
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");

      if (videoDevices.length === 0) {
        throw new Error("NO_CAMERA_FOUND");
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(DEFAULT_WEBCAM_CONFIG);

      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
      setIsWebcamActive(true);

      // Add current user to webcam users
      const newUser: WebcamUser = {
        id: session?.user?.id || "anonymous",
        name: session?.user?.name || "Anonymous Rocker",
        videoRef: localVideoRef,
        position: generateRandomStadiumPosition(),
        isActive: true,
      };

      const updatedUsers = [...webcamUsers, newUser];
      setWebcamUsers(updatedUsers);
      onWebcamUsersUpdate(updatedUsers);
    } catch (error: any) {
      console.error("🚨 Webcam access failed:", error);

      let errorMessage = "⚠️ Webcam-Zugriff fehlgeschlagen!";
      let suggestion = "";

      if (error.name === "NotFoundError" || error.message === "NO_CAMERA_FOUND") {
        errorMessage = "📷 Keine Kamera gefunden!";
        suggestion = "Möchtest du trotzdem im Demo-Modus am Konzert teilnehmen?";

        // Auto-suggest Demo Mode for no camera
        if (
          confirm(
            `${errorMessage}\n\n${suggestion}\n\n🎪 Klicke OK für Demo-Modus oder Abbrechen um es später zu versuchen.`
          )
        ) {
          joinDemoMode();
          return; // Skip the alert at the end
        }
        return; // Don't show the alert if user cancelled
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "🚫 Kamera-Berechtigung verweigert!";
        suggestion = "Bitte erlaube Kamera-Zugriff in deinen Browser-Einstellungen und lade die Seite neu.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "⚡ Kamera wird bereits verwendet!";
        suggestion = "Bitte schließe andere Apps die deine Kamera verwenden und versuche es erneut.";
      } else if (error.message === "UNSUPPORTED_BROWSER") {
        errorMessage = "🌐 Browser nicht unterstützt!";
        suggestion = "Bitte verwende einen modernen Browser wie Chrome, Firefox oder Safari.";
      } else {
        errorMessage = "🔧 Technisches Problem!";
        suggestion = "Versuche es später erneut oder verwende einen anderen Browser.";
      }

      alert(`${errorMessage}\n\n💡 ${suggestion}\n\n🎸 Du kannst trotzdem das Konzert genießen ohne Live-Cam!`);
    }
  };

  // 🛑 WEBCAM DEACTIVATION
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);

    // Remove current user from webcam users
    const updatedUsers = webcamUsers.filter(user => user.id !== session?.user?.id);
    setWebcamUsers(updatedUsers);
    onWebcamUsersUpdate(updatedUsers);
  };

  // 🏟️ GENERATE RANDOM STADIUM POSITION
  const generateRandomStadiumPosition = () => {
    const radius = Math.random() * 8 + 5; // 5-13 units from center
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle) * radius,
      y: 0.1, // Just above stadium floor
      z: Math.sin(angle) * radius,
    };
  };

  // 🎸 SIMULATE OTHER USERS (for demo purposes)
  useEffect(() => {
    if (isInStadium) {
      // Simulate some other concert-goers
      const simulatedUsers: WebcamUser[] = [
        {
          id: "demo-user-1",
          name: "MetalFan_2025",
          videoRef: React.createRef(),
          position: { x: -3, y: 0.1, z: 4 },
          isActive: true,
        },
        {
          id: "demo-user-2",
          name: "RockGirl_🤘",
          videoRef: React.createRef(),
          position: { x: 5, y: 0.1, z: -2 },
          isActive: true,
        },
        {
          id: "demo-user-3",
          name: "HeadBanger_Pro",
          videoRef: React.createRef(),
          position: { x: -1, y: 0.1, z: -6 },
          isActive: true,
        },
      ];

      // Only add simulated users if no real users yet
      if (webcamUsers.length === 0) {
        setWebcamUsers(simulatedUsers);
        onWebcamUsersUpdate(simulatedUsers);
      }
    }
  }, [isInStadium]);

  // 🎪 DEMO MODE - Join without webcam
  const joinDemoMode = () => {
    const demoUser: WebcamUser = {
      id: session?.user?.id || "demo-anonymous",
      name: `${session?.user?.name || "Anonymous"}_Demo`,
      videoRef: React.createRef(),
      position: generateRandomStadiumPosition(),
      isActive: true,
    };

    const updatedUsers = [...webcamUsers, demoUser];
    setWebcamUsers(updatedUsers);
    onWebcamUsersUpdate(updatedUsers);
    setIsWebcamActive(true); // Set as active for demo
  };

  // 🧹 CLEANUP
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!isInStadium) {
    return null; // Only show in Stadium Arena
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* WEBCAM CONTROL PANEL */}
      <div className="bg-black/80 backdrop-blur-sm border border-orange-500/50 rounded-xl p-4 max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-orange-400 font-bold text-sm font-mono">🎥 LIVE CONCERT CAM</h3>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-400 text-xs font-mono">LIVE</span>
          </div>
        </div>

        {/* LOCAL VIDEO PREVIEW */}
        {isWebcamActive && (
          <div className="relative mb-4">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-24 bg-gray-900 rounded-lg object-cover"
            />
            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {session?.user?.name || "You"}
            </div>
          </div>
        )}

        {/* CONTROLS */}
        <div className="space-y-3">
          {!isWebcamActive ? (
            <>
              <button
                onClick={startWebcam}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
              >
                🎥 JOIN WITH WEBCAM!
              </button>

              <button
                onClick={joinDemoMode}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
              >
                🎪 JOIN DEMO MODE
              </button>

              <div className="text-xs text-gray-400 text-center">💡 Demo-Mode falls Webcam nicht verfügbar</div>
            </>
          ) : (
            <button
              onClick={stopWebcam}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
            >
              🛑 LEAVE STAGE
            </button>
          )}

          {/* USERS COUNT */}
          <div className="flex justify-between items-center text-gray-300 text-xs">
            <span>Concert-goers:</span>
            <span className="text-orange-400 font-bold">{webcamUsers.length} 🤘</span>
          </div>

          {/* STATUS INFO */}
          <div className="text-gray-400 text-xs font-mono">
            {isWebcamActive ? (
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Du rockst live im Stadion!</span>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-gray-500">🎤 Bereit für Live-Experience</div>
                <div className="text-xs text-green-400">
                  {navigator.mediaDevices ? "✅ Webcam unterstützt" : "⚠️ Webcam nicht verfügbar"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DEBUG INFO (for development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-2 bg-gray-900/90 border border-gray-600 rounded p-2 text-xs font-mono">
          <div className="text-green-400">DEBUG:</div>
          <div className="text-gray-300">Active Users: {webcamUsers.length}</div>
          <div className="text-gray-300">Webcam: {isWebcamActive ? "ON" : "OFF"}</div>
          <div className="text-gray-300">Stadium: {isInStadium ? "YES" : "NO"}</div>
        </div>
      )}
    </div>
  );
}
