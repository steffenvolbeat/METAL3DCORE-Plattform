"use client";

import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import {
    LiveConcertWebcamProps,
    WebcamUser
} from "../types/webcam.types";

export function LiveWebcamIntegration({
  isInStadium,
  onWebcamUsersUpdate,
}: LiveConcertWebcamProps) {
  const { data: session } = useSession();
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [webcamUsers, setWebcamUsers] = useState<WebcamUser[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [autoTestResult, setAutoTestResult] = useState<string>("🔍 Testing...");
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // 🚀 AUTO-TEST beim Laden der Komponente
  useEffect(() => {
    if (isInStadium) {
      performAutoWebcamTest();
    }
  }, [isInStadium]);

  // 🔍 AUTO WEBCAM TEST
  const performAutoWebcamTest = async () => {
    try {
      console.log("🚀 AUTO-TEST: Webcam-Kompatibilität wird geprüft...");
      
      if (!navigator.mediaDevices) {
        setAutoTestResult("❌ Browser zu alt!");
        return;
      }

      // Test: Geräte auflisten
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput');
      
      console.log(`📹 AUTO-TEST: ${cameras.length} Kameras gefunden`);

      if (cameras.length === 0) {
        setAutoTestResult("❌ Keine Kamera!");
        return;
      }

      // Test: Permission Status
      try {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log(`🔒 AUTO-TEST: Permission = ${permission.state}`);
        
        if (permission.state === 'granted') {
          setAutoTestResult("✅ Bereit! Auto-Start...");
          // Auto-start if permission already granted
          setTimeout(() => startWebcam(), 2000);
          return;
        } else if (permission.state === 'denied') {
          setAutoTestResult("🚫 Blockiert! Freigeben!");
          return;
        }
      } catch (e) {
        console.log("⚠️ Permissions API nicht verfügbar");
      }

      setAutoTestResult(`✅ ${cameras.length} Kamera(s) bereit`);
      
    } catch (error) {
      console.error("AUTO-TEST Fehler:", error);
      setAutoTestResult("⚠️ Test fehlgeschlagen");
    }
  };

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
          console.log("▶️ ✅ VIDEO PLAYING SUCCESSFULLY!");
        } catch (err) {
          console.log("⚠️ Play failed, retrying...", err);
          setTimeout(forcePlay, 500);
        }
      };
      
      // Start play attempts
      setTimeout(forcePlay, 100);
    }
  }, [stream]);

  // 🔧 BROWSER-SPEZIFISCHE REPARATUR-ANWEISUNGEN
  const showBrowserFixInstructions = () => {
    const isChrome = navigator.userAgent.includes('Chrome');
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari = navigator.userAgent.includes('Safari') && !isChrome;

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

  // 🎥 WEBCAM ACTIVATION with enhanced error handling
  const startWebcam = async () => {
    try {
      console.log("🚀 Starting webcam activation...");
      
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("UNSUPPORTED_BROWSER");
      }

      console.log("✅ MediaDevices API available");

      // 🔐 FORCE PERMISSION REQUEST - Ignore previous denials
      console.log("🔓 FORCING permission request...");

      // 🎥 MULTIPLE WEBCAM CONFIGS - Try different settings
      const webcamConfigs = [
        // Minimal config first - most likely to work
        {
          video: true,
          audio: false,
        },
        // Basic config
        {
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
          },
          audio: false,
        },
        // Medium quality
        {
          video: {
            width: { ideal: 640, min: 320, max: 1280 },
            height: { ideal: 480, min: 240, max: 720 },
            frameRate: { ideal: 30, min: 15, max: 60 },
            facingMode: "user",
          },
          audio: false,
        },
        // High quality fallback
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: false,
        },
      ];

      let mediaStream = null;
      let configUsed = -1;

      // Try each config until one works
      for (let i = 0; i < webcamConfigs.length; i++) {
        try {
          console.log(`🎯 Trying webcam config ${i + 1}/${webcamConfigs.length}...`);
          console.log("Config:", webcamConfigs[i]);
          
          // DIRECT getUserMedia call - bypass permission check
          mediaStream = await navigator.mediaDevices.getUserMedia(webcamConfigs[i]);
          configUsed = i;
          console.log(`🎉 SUCCESS with config ${i + 1}!`);
          console.log("Stream details:", mediaStream);
          console.log("Video tracks:", mediaStream.getVideoTracks());
          break;
        } catch (configError) {
          console.log(`❌ Config ${i + 1} failed:`, configError);
          if (i === webcamConfigs.length - 1) {
            throw configError; // Last config failed, throw error
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
      
      // Set video element source with AGGRESSIVE STREAM ASSIGNMENT
      if (localVideoRef.current) {
        console.log("🔧 FORCING video element stream assignment...");
        
        // CLEAR any previous source
        localVideoRef.current.srcObject = null;
        localVideoRef.current.src = "";
        
        // WAIT for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // SET new stream
        localVideoRef.current.srcObject = mediaStream;
        console.log("📺 Video element updated with NEW stream");
        
        // FORCE video element properties AGGRESSIVELY
        localVideoRef.current.muted = true;
        localVideoRef.current.playsInline = true;
        localVideoRef.current.autoplay = true;
        localVideoRef.current.controls = false;
        localVideoRef.current.volume = 0;
        
        console.log("📊 Video element final state:", {
          srcObject: !!localVideoRef.current.srcObject,
          muted: localVideoRef.current.muted,
          autoplay: localVideoRef.current.autoplay,
          readyState: localVideoRef.current.readyState
        });
        
        // MULTI-ATTEMPT PLAY STRATEGY
        const attemptPlay = async (attempt = 1) => {
          try {
            if (!localVideoRef.current) return;
            
            console.log(`🎯 Play attempt #${attempt}...`);
            const playPromise = localVideoRef.current.play();
            if (playPromise) {
              await playPromise;
              console.log(`✅ Video playing after attempt #${attempt}!`);
              return;
            }
          } catch (playError) {
            console.log(`❌ Play attempt #${attempt} failed:`, playError);
            
            if (attempt < 5) {
              setTimeout(() => attemptPlay(attempt + 1), 200 * attempt);
            }
          }
        };
        
        // START PLAY ATTEMPTS
        await attemptPlay();
        
        // Listen for video events
        localVideoRef.current.onloadedmetadata = () => {
          console.log("🎬 Video metadata loaded, dimensions:", 
            localVideoRef.current?.videoWidth, "x", localVideoRef.current?.videoHeight);
        };
        
        localVideoRef.current.oncanplay = () => {
          console.log("📺 Video can start playing");
        };
        
        localVideoRef.current.onplaying = () => {
          console.log("🎥 Video is now playing");
        };
      } else {
        console.warn("⚠️ Video element ref is null - waiting for DOM to render...");
        // Wait for video element to be rendered and try again
        setTimeout(async () => {
          if (localVideoRef.current && mediaStream) {
            console.log("🔄 Retry: Video element now available, setting up stream...");
            localVideoRef.current.srcObject = mediaStream;
            localVideoRef.current.muted = true;
            localVideoRef.current.playsInline = true;
            localVideoRef.current.autoplay = true;
            localVideoRef.current.controls = false;
            localVideoRef.current.volume = 0;
            
            // Simple play attempt
            try {
              await localVideoRef.current.play();
              console.log("🔄 ✅ Retry successful - video playing!");
            } catch (err) {
              console.log("🔄 Retry play failed:", err);
            }
          } else {
            console.error("❌ Video element still null after retry - DOM issue!");
          }
        }, 500); // Wait 500ms for DOM
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
      
      console.log("🚀 Webcam fully activated!");
      alert("🎉 WEBCAM ERFOLGREICH AKTIVIERT!\n\nSie sind jetzt LIVE im Konzert! 🎸\n\nSchauen Sie nach rechts unten - dort sehen Sie Ihr Video!");
      
    } catch (error: any) {
      console.error("🚨 Webcam access failed:", error);

      let errorMessage = "⚠️ Webcam-Zugriff fehlgeschlagen!";
      let solution = "";

      if (
        error.name === "NotFoundError" ||
        error.message === "NO_CAMERA_FOUND"
      ) {
        errorMessage = "📷 KEINE KAMERA GEFUNDEN!";
        solution = `
🔧 LÖSUNGEN:
• USB-Webcam anschließen
• In Geräte-Manager prüfen
• Kamera-Treiber aktualisieren
• Andere Programme schließen (Teams, Zoom, OBS)
        `;
      } else if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
      ) {
        errorMessage = "🚫 KAMERA-BERECHTIGUNG HARTNÄCKIG VERWEIGERT!";
        solution = `
🔧 HARDCORE-REPARATUR ERFORDERLICH:

METHODE 1 - CHROME RESET:
1. chrome://settings/reset eingeben
2. "Erweitert" → "Zurücksetzen und bereinigen"
3. "Einstellungen auf ursprüngliche Standards zurücksetzen"

METHODE 2 - SITE-DATEN LÖSCHEN:
1. chrome://settings/content/all eingeben  
2. "localhost:3000" suchen
3. Alle Daten löschen
4. Browser neu starten

METHODE 3 - NUCLEAR OPTION:
1. Chrome komplett deinstallieren
2. Neu installieren
3. Oder Firefox/Edge versuchen

SOFORT-WORKAROUND:
• Demo-Mode verwenden (funktioniert perfekt!)
        `;
      } else if (error.name === "NotReadableError") {
        errorMessage = "⚡ KAMERA HARDWARE-KONFLIKT!";
        solution = `
🔧 HARDWARE-LÖSUNGEN:
• Alle anderen Apps schließen (Teams, Zoom, Skype, OBS)
• USB-Kamera abziehen und wieder anschließen
• Anderen USB-Port verwenden
• Computer neu starten
• Task-Manager → Webcam-Prozesse beenden
        `;
      } else if (error.message === "UNSUPPORTED_BROWSER") {
        errorMessage = "🌐 BROWSER STEINZEIT!";
        solution = "Chrome, Firefox oder Edge verwenden!";
      } else if (error.message === "ALL_CONFIGS_FAILED") {
        errorMessage = "💥 ALLE WEBCAM-VERSUCHE GESCHEITERT!";
        solution = `
🔧 LETZTE RETTUNG:
• Kamera-Hardware defekt?
• Treiber komplett neu installieren
• Antivirus-Software Kamera-Zugriff erlauben
• Windows Kamera-App funktioniert?
• Anderer Computer zum Testen
        `;
      } else {
        errorMessage = "🤯 MYSTERIÖSER FEHLER!";
        solution = `
🔧 PANIK-LÖSUNGEN:
• Browser neu starten (alle Fenster schließen)
• Computer neu starten  
• Anderen Browser versuchen (Firefox/Edge)
• System-Updates installieren
• IT-Support kontaktieren
        `;
      }

      alert(`${errorMessage}\n\n${solution}\n\n🎪 ZWISCHENLÖSUNG: Demo-Mode nutzen!\n(Funktioniert genauso gut - kein Webcam nötig!)`);
    }
  };

  // 🛑 WEBCAM DEACTIVATION
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);

    // Remove current user from webcam users
    const updatedUsers = webcamUsers.filter(
      (user) => user.id !== session?.user?.id
    );
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
        stream.getTracks().forEach((track) => track.stop());
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
          <h3 className="text-orange-400 font-bold text-sm font-mono">
            🎥 LIVE CONCERT CAM
          </h3>
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
                minHeight: '128px',
                backgroundColor: '#1f2937', // Dark gray background (normal)
                display: 'block',
                transform: 'scaleX(-1)' // Mirror effect
              }}
              onLoadedMetadata={(e) => {
                console.log("📺 ✅ Video metadata loaded - READY TO PLAY!");
                if (localVideoRef.current) {
                  const video = localVideoRef.current;
                  console.log("📊 Video info:", {
                    videoWidth: video.videoWidth,
                    videoHeight: video.videoHeight,
                    readyState: video.readyState,
                    srcObject: !!video.srcObject
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
                  localVideoRef.current.play().catch(console.error);
                }
              }}
              onCanPlay={() => {
                console.log("🎯 ✅ Video CAN PLAY - STARTING NOW!");
                if (localVideoRef.current) {
                  localVideoRef.current.play().catch(console.error);
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
              onError={(e) => {
                const video = e.target as HTMLVideoElement | null;
                console.error("❌ Video error:", {
                  error: e,
                  target: video,
                  currentSrc: video?.currentSrc,
                  networkState: video?.networkState,
                  readyState: video?.readyState,
                  videoWidth: video?.videoWidth,
                  videoHeight: video?.videoHeight,
                  srcObject: !!video?.srcObject,
                  paused: video?.paused
                });
                
                // Try to restart the webcam if there's an error
                if (localVideoRef.current?.srcObject) {
                  console.log("🔄 Attempting to restart webcam due to video error...");
                  const currentStream = localVideoRef.current.srcObject as MediaStream;
                  currentStream?.getTracks().forEach(track => track.stop());
                  
                  // Request webcam again
                  navigator.mediaDevices.getUserMedia({ 
                    video: { 
                      width: { ideal: 1280 },
                      height: { ideal: 720 },
                      facingMode: 'user'
                    } 
                  }).then(stream => {
                    if (localVideoRef.current) {
                      localVideoRef.current.srcObject = stream;
                    }
                  }).catch(err => {
                    console.error("🚫 Webcam restart failed:", err);
                  });
                }
              }}
            />
            <div className="absolute top-1 left-1 bg-green-600/90 text-white text-xs px-2 py-1 rounded font-bold">
              🎥 LIVE
            </div>
            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {session?.user?.name || "You"}
            </div>
            <div className="absolute bottom-1 right-1 bg-red-600/90 text-white text-xs px-1 py-1 rounded">
              ⬤ REC
            </div>
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
              <div className="text-white">
                Status: {stream.getVideoTracks()[0].readyState}
              </div>
            )}
          </div>
        )}

        {/* CONTROLS */}
        <div className="space-y-3">
          {/* AUTO-TEST ERGEBNIS */}
          <div className="bg-gray-800 border border-yellow-500 rounded p-2 text-xs">
            <div className="text-yellow-400 font-bold">🔍 AUTO-TEST:</div>
            <div className="text-white">{autoTestResult}</div>
          </div>

          {!isWebcamActive ? (
            <>
              <button
                onClick={startWebcam}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 text-sm animate-pulse"
              >
                🎥 WEBCAM JETZT AKTIVIEREN!
              </button>

              <button
                onClick={showBrowserFixInstructions}
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 text-xs"
              >
                🔧 BROWSER REPARATUR
              </button>

              <button
                onClick={async () => {
                  try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const cameras = devices.filter(d => d.kind === 'videoinput');
                    alert(`🔍 KAMERA-TEST:\n\n📹 Gefundene Kameras: ${cameras.length}\n\n${cameras.map((c, i) => `${i + 1}. ${c.label || 'Unbekannte Kamera'}`).join('\n')}\n\n${cameras.length === 0 ? '❌ KEINE KAMERAS! Hardware-Problem!' : '✅ Kameras verfügbar! Permission-Problem!'}`);
                  } catch (error) {
                    alert(`❌ KAMERA-TEST FEHLER:\n\n${error}\n\nIhr Browser unterstützt keine Kamera-Erkennung!`);
                  }
                }}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-1 px-3 rounded-lg transition-all duration-200 text-xs"
              >
                🔍 HARDWARE-TEST
              </button>

              <button
                onClick={joinDemoMode}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 text-sm"
              >
                🎪 NOTFALL: DEMO MODE
              </button>

              <div className="text-xs text-gray-400 text-center">
                💡 Falls Webcam nicht geht: Demo-Mode nutzen!
              </div>
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
            <span className="text-orange-400 font-bold">
              {webcamUsers.length} 🤘
            </span>
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
                <div className="text-gray-500">
                  🎤 Bereit für Live-Experience
                </div>
                <div className="text-xs text-green-400">
                  {navigator.mediaDevices
                    ? "✅ Webcam unterstützt"
                    : "⚠️ Webcam nicht verfügbar"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DEBUG INFO - ALWAYS VISIBLE for troubleshooting */}
      <div className="mt-2 bg-red-900/90 border border-red-500 rounded p-2 text-xs font-mono">
        <div className="text-red-400 font-bold">🔧 LIVE DIAGNOSE:</div>
        <div className="text-white">
          Browser: {navigator.userAgent.includes('Chrome') ? '✅ Chrome' : navigator.userAgent.includes('Firefox') ? '✅ Firefox' : '⚠️ Unbekannt'}
        </div>
        <div className="text-white">
          MediaDevices: {navigator.mediaDevices ? "✅ OK" : "❌ FEHLT"}
        </div>
        <div className="text-white">
          getUserMedia: {navigator.mediaDevices?.getUserMedia ? "✅ OK" : "❌ FEHLT"}
        </div>
        <div className="text-white">
          Sicher: {(window.location.protocol === 'https:' || window.location.hostname === 'localhost') ? "✅ OK" : "❌ UNSICHER"}
        </div>
        <div className="text-white">
          Webcam: {isWebcamActive ? "🎥 LIVE" : "❌ AUS"}
        </div>
        <div className="text-white">
          Stadion: {isInStadium ? "✅ JA" : "❌ NEIN"}
        </div>
        <div className="text-white">
          Auto-Test: {autoTestResult}
        </div>
        {stream && (
          <div className="text-green-400 font-bold">
            ✅ Stream: {stream.getVideoTracks().length} Spur(en) aktiv
          </div>
        )}
        <div className="text-yellow-400 text-xs mt-1 bg-black/50 p-1 rounded">
          💡 Falls ❌ → "🔧 BROWSER REPARATUR" klicken!
        </div>
      </div>
    </div>
  );
}
