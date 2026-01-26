"use client";

import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { LiveConcertWebcamProps, WebcamUser } from "../types/webcam.types";

export function LiveWebcamIntegration({ isInStadium, onWebcamUsersUpdate }: LiveConcertWebcamProps) {
  const { data: session } = useSession();
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamUsers, setWebcamUsers] = useState<WebcamUser[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [autoTestResult, setAutoTestResult] = useState<string>("🔍 Testing...");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  // 🔧 BROWSER-SPEZIFISCHE REPARATUR-ANWEISUNGEN
  const showBrowserFixInstructions = () => {
    const isChrome = navigator.userAgent.includes("Chrome");
    const isFirefox = navigator.userAgent.includes("Firefox");
    const isSafari = navigator.userAgent.includes("Safari") && !isChrome;

    let instructions = "";

    if (isChrome) {
      instructions = `
🔧 CHROME REPARATUR - SCHRITT FÜR SCHRITT:

1. Klicken Sie auf das 🔒 Schloss-Symbol (links neben localhost:3000)
2. Setzen Sie "Kamera" auf "Zulassen"  
3. Laden Sie die Seite neu (F5)

ODER:

Globale Einstellungen ändern:
1. Geben Sie ein: chrome://settings/content/camera
2. Wählen Sie "Seiten dürfen Kamera verwenden"
3. Unter "Zulassen" → Button klicken → localhost:3000 hinzufügen

NUCLEAR OPTION:
• Chrome komplett schließen
• Als Administrator neu starten
• Andere Programme schließen (Teams, Zoom, OBS)`;
    } else if (isFirefox) {
      instructions = `
🔧 FIREFOX REPARATUR:

1. Klicken Sie auf das Schild-Symbol in der Adressleiste
2. "Berechtigungen" → Kamera auf "Zulassen"
3. Seite neu laden

ODER:

1. about:preferences#privacy eingeben
2. Berechtigungen → Kamera → Einstellungen
3. localhost:3000 hinzufügen`;
    } else if (isSafari) {
      instructions = `
🔧 SAFARI REPARATUR:

1. Website → Einstellungen für Website
2. Kamera auf "Zulassen" 
3. Seite neu laden`;
    } else {
      instructions = `
🔧 UNBEKANNTER BROWSER:

Versuchen Sie:
• Chrome oder Firefox installieren
• Browser-Einstellungen → Kamera → Zulassen
• Als Administrator starten`;
    }

    alert(instructions);
  };

  const startWebcam = useCallback(async () => {
    try {
      console.log("🚀 Starting webcam activation...");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("UNSUPPORTED_BROWSER");
      }

      console.log("✅ MediaDevices API available");
      console.log("🔓 FORCING permission request...");

      const webcamConfigs = [
        { video: true, audio: false },
        {
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
          },
          audio: false,
        },
        {
          video: {
            width: { ideal: 640, min: 320, max: 1280 },
            height: { ideal: 480, min: 240, max: 720 },
            frameRate: { ideal: 30, min: 15, max: 60 },
            facingMode: "user",
          },
          audio: false,
        },
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        },
      ];

      let mediaStream: MediaStream | null = null;
      let configUsed = -1;

      for (let i = 0; i < webcamConfigs.length; i++) {
        try {
          console.log(`🎯 Trying webcam config ${i + 1}/${webcamConfigs.length}...`);
          console.log("Config:", webcamConfigs[i]);
          mediaStream = await navigator.mediaDevices.getUserMedia(webcamConfigs[i]);
          configUsed = i;
          console.log(`🎉 SUCCESS with config ${i + 1}!`);
          console.log("Stream details:", mediaStream);
          console.log("Video tracks:", mediaStream.getVideoTracks());
          break;
        } catch (configError) {
          console.log(`❌ Config ${i + 1} failed:`, configError);
          if (i === webcamConfigs.length - 1) {
            throw configError;
          }
        }
      }

      if (!mediaStream) {
        throw new Error("ALL_CONFIGS_FAILED");
      }

      console.log("🎉 Webcam stream obtained!", mediaStream);
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        console.log("📊 Video track settings:", videoTrack.getSettings());
        console.log("📊 Video track capabilities:", videoTrack.getCapabilities());
      }

      setStream(mediaStream);

      if (localVideoRef.current) {
        console.log("🔧 FORCING video element stream assignment...");
        localVideoRef.current.srcObject = null;
        localVideoRef.current.src = "";
        await new Promise(resolve => setTimeout(resolve, 100));
        localVideoRef.current.srcObject = mediaStream;
        console.log("📺 Video element updated with NEW stream");
      }

      setIsWebcamActive(true);
      setAutoTestResult(`✅ Bereit! Config ${configUsed + 1}`);

      if (session?.user) {
        const user: WebcamUser = {
          id: session.user.id,
          name: session.user.name || "Metal Fan",
          videoRef: localVideoRef,
          position: { x: 0, y: 0.1, z: 0 },
          isActive: true,
        };

        const updatedUsers = [...webcamUsers, user];
        setWebcamUsers(updatedUsers);
        onWebcamUsersUpdate(updatedUsers);
      }
    } catch (error: any) {
      console.warn("⚠️ Webcam access denied or unavailable:", error.message);

      switch (error?.name) {
        case "NotAllowedError":
          setAutoTestResult("🚫 Zugriff verweigert! Bitte Kamera freigeben");
          showBrowserFixInstructions();
          break;
        case "NotFoundError":
          setAutoTestResult("❌ Keine Kamera gefunden");
          break;
        case "NotReadableError":
          setAutoTestResult("⚠️ Kamera wird bereits verwendet (Teams/Zoom?)");
          break;
        default:
          setAutoTestResult("⚠️ Kamera-Aktivierung fehlgeschlagen");
      }
    }
  }, [onWebcamUsersUpdate, session?.user, webcamUsers]);

  const performAutoWebcamTest = useCallback(async () => {
    try {
      console.log("🚀 AUTO-TEST: Webcam-Kompatibilität wird geprüft...");

      if (!navigator.mediaDevices) {
        setAutoTestResult("❌ Browser zu alt!");
        return;
      }

      // Test: Geräte auflisten
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === "videoinput");

      console.log(`📹 AUTO-TEST: ${cameras.length} Kameras gefunden`);

      if (cameras.length === 0) {
        setAutoTestResult("❌ Keine Kamera!");
        return;
      }

      // Test: Permission Status
      try {
        const permission = await navigator.permissions.query({ name: "camera" as PermissionName });
        console.log(`🔒 AUTO-TEST: Permission = ${permission.state}`);

        if (permission.state === "granted") {
          setAutoTestResult("✅ Bereit! Auto-Start...");
          // Auto-start if permission already granted
          setTimeout(() => startWebcam(), 2000);
          return;
        } else if (permission.state === "denied") {
          setAutoTestResult("🚫 Blockiert! Freigeben!");
          return;
        }
      } catch (e) {
        console.log("⚠️ Permissions API nicht verfügbar");
      }

      setAutoTestResult(`✅ ${cameras.length} Kamera(s) bereit`);
    } catch (error) {
      console.warn("AUTO-TEST Issue (normal):", error.message);
      setAutoTestResult("⚠️ Test fehlgeschlagen");
    }
  }, [startWebcam]);

  useEffect(() => {
    if (isInStadium) {
      performAutoWebcamTest();
    }
  }, [isInStadium, performAutoWebcamTest]);

  // 🎯 STREAM-TO-VIDEO CONNECTION EFFECT
  useEffect(() => {
    if (stream && localVideoRef.current) {
      console.log("🔗 CONNECTING stream to video element...");

      const videoElement = localVideoRef.current;

      // FORCE CONNECTION
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.autoplay = true;
      videoElement.playsInline = true;

      console.log("📺 Stream connected to video!");

      // FORCE PLAY after connection
      const forcePlay = async () => {
        try {
          await videoElement.play();
        } catch (err) {
          console.log("⚠️ Play failed, retrying...", err);
          setTimeout(forcePlay, 500);
        }
      };

      setTimeout(forcePlay, 100);
    }
  }, [stream]);

  // 🛑 WEBCAM DEACTIVATION
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);

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
  }, [isInStadium, onWebcamUsersUpdate, webcamUsers.length]);

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

        {/* LOCAL VIDEO PREVIEW - ENHANCED */}
        {isWebcamActive && (
          <div className="relative mb-4 border-2 border-green-500 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              controls={false}
              className="w-full h-32 bg-black rounded-lg object-cover"
              style={{
                minHeight: "128px",
                backgroundColor: "#1f2937", // Dark gray background (normal)
                display: "block",
                transform: "scaleX(-1)", // Mirror effect
              }}
              onLoadedMetadata={e => {
                console.log("📺 ✅ Video metadata loaded - READY TO PLAY!");
                if (localVideoRef.current) {
                  const video = localVideoRef.current;
                  console.log("📊 Video info:", {
                    videoWidth: video.videoWidth,
                    videoHeight: video.videoHeight,
                    readyState: video.readyState,
                    srcObject: !!video.srcObject,
                  });

                  // IMMEDIATE PLAY
                  video.play().catch(err => {
                    console.log("⚠️ Immediate play failed:", err);
                  });
                }
              }}
              onLoadedData={() => {
                console.log("📁 ✅ Video data loaded - FORCING PLAY NOW!");
                if (localVideoRef.current) {
                  localVideoRef.current.play().catch(() => {}); // Ignore autoplay restrictions
                }
              }}
              onCanPlay={() => {
                console.log("🎯 ✅ Video CAN PLAY - STARTING NOW!");
                if (localVideoRef.current) {
                  localVideoRef.current.play().catch(() => {}); // Ignore autoplay restrictions
                }
              }}
              onPlaying={() => {
                console.log("▶️ 🎉 VIDEO IS PLAYING - YOU SHOULD SEE YOURSELF NOW!");
              }}
              onWaiting={() => {
                console.log("⏳ Video waiting for data...");
              }}
              onStalled={() => {
                console.log("🛑 Video stalled - retrying...");
                if (localVideoRef.current) {
                  localVideoRef.current.load();
                }
              }}
              onError={e => {
                const video = e.target as HTMLVideoElement | null;

                // Only log in development, reduce noise in production
                if (process.env.NODE_ENV === "development") {
                  console.warn("⚠️ Video stream issue (normal for webcam):", {
                    type: e.type,
                    readyState: video?.readyState,
                    srcObject: !!video?.srcObject,
                  });
                }

                // Try to restart the webcam if there's an error and stream exists
                if (localVideoRef.current?.srcObject) {
                  const currentStream = localVideoRef.current.srcObject as MediaStream;
                  const hasLiveTracks = currentStream?.getTracks().some(track => track.readyState === "live");

                  if (!hasLiveTracks) {
                    console.log("🔄 Restarting dead webcam stream...");
                    currentStream?.getTracks().forEach(track => track.stop());

                    // Request webcam again with better error handling
                    setTimeout(() => {
                      navigator.mediaDevices
                        .getUserMedia({
                          video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: "user",
                          },
                        })
                        .then(stream => {
                          if (localVideoRef.current) {
                            localVideoRef.current.srcObject = stream;
                            console.log("✅ Webcam restarted successfully");
                          }
                        })
                        .catch(err => {
                          console.warn("🚫 Webcam restart failed:", err.message);
                        });
                    }, 1000);
                  }
                }
              }}
            />
            <div className="absolute top-1 left-1 bg-green-600/90 text-white text-xs px-2 py-1 rounded font-bold">
              🎥 LIVE
            </div>
            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {session?.user?.name || "You"}
            </div>
            <div className="absolute bottom-1 right-1 bg-red-600/90 text-white text-xs px-1 py-1 rounded">⬤ REC</div>
          </div>
        )}

        {/* STREAM-STATUS für Debugging */}
        {stream && (
          <div className="mb-4 bg-green-900/50 border border-green-500 rounded p-2 text-xs">
            <div className="text-green-400 font-bold">🔍 STREAM DEBUG:</div>
            <div className="text-white">
              Tracks: {stream.getVideoTracks().length} Video, {stream.getAudioTracks().length} Audio
            </div>
            {stream.getVideoTracks()[0] && (
              <div className="text-white">Status: {stream.getVideoTracks()[0].readyState}</div>
            )}
          </div>
        )}

        {/* CONTROLS */}
        <div className="space-y-3">
          {/* AUTO-TEST ERGEBNIS */}
          <div className="bg-gray-900/60 border border-orange-500/30 text-orange-200 text-xs font-mono rounded px-2 py-1">
            {autoTestResult}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startWebcam}
              className="px-3 py-2 rounded bg-green-600 text-white text-xs font-bold hover:bg-green-500 transition"
            >
              🚀 Webcam starten
            </button>

            <button
              type="button"
              onClick={stopWebcam}
              disabled={!isWebcamActive}
              className="px-3 py-2 rounded bg-red-700 text-white text-xs font-bold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🛑 Stoppen
            </button>

            <button
              type="button"
              onClick={joinDemoMode}
              className="px-3 py-2 rounded bg-blue-700 text-white text-xs font-bold hover:bg-blue-600 transition"
            >
              🎪 Demo-Modus
            </button>

            <button
              type="button"
              onClick={performAutoWebcamTest}
              className="px-3 py-2 rounded bg-orange-700 text-white text-xs font-bold hover:bg-orange-600 transition"
            >
              🔄 Auto-Test
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE USERS LIST */}
      {webcamUsers.length > 0 && (
        <div className="mt-3 bg-gray-950/80 border border-orange-500/30 rounded-lg p-3 max-w-sm text-xs text-orange-100">
          <div className="font-bold text-orange-300 mb-2">Aktive Zuschauer</div>
          <ul className="space-y-1">
            {webcamUsers.map(user => (
              <li key={user.id} className="flex items-center justify-between">
                <span>{user.name}</span>
                <span className="text-[10px] uppercase tracking-wide text-orange-400">
                  {user.isActive ? "LIVE" : "OFF"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
