"use client";

import { useEffect, useRef, useState } from "react";

interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
  onEnd?: () => void;
  onBeatDetection?: (beat: boolean, intensity: number) => void;
  onDuration?: (duration: number) => void; // Neue Prop für Video-Dauer
  beatData?: { beat: boolean; intensity: number }; // Für planetenähnliche Beat-Reaktionen
}

export default function YouTubePlayer({
  videoId,
  onReady,
  onBeatDetection,
  onDuration,
  beatData = { beat: false, intensity: 0.3 },
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [orbitRotation, setOrbitRotation] = useState(0);
  const [videoDurationSeconds, setVideoDurationSeconds] = useState<number>(0);
  const [saturnSyncTime, setSaturnSyncTime] = useState<number>(0); // Für Saturn-Synchronisation
  const beatCounterRef = useRef(0);
  const orbitAnimationRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startTimeRef = useRef<number>(Date.now()); // Start-Zeit für Synchronisation

  // Video-Dauer über YouTube API ermitteln
  useEffect(() => {
    const fetchVideoDuration = async () => {
      try {
        // YouTube oEmbed API für Video-Informationen
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📺 Video-Info erhalten:`, data);
          
          // Da oEmbed keine Dauer liefert, verwenden wir eine Schätzung
          // basierend auf typischen Metallica-Song-Längen (ca. 4-6 Minuten)
          const estimatedDuration = 300; // 5 Minuten als sichere Schätzung
          setVideoDurationSeconds(estimatedDuration);
          onDuration?.(estimatedDuration);
          
          console.log(`⏱️ Video-Dauer geschätzt: ${estimatedDuration} Sekunden`);
        }
      } catch (error) {
        console.warn('Video-Dauer konnte nicht ermittelt werden:', error);
        // Fallback: Standard-Dauer für Metallica-Songs
        const fallbackDuration = 300; // 5 Minuten
        setVideoDurationSeconds(fallbackDuration);
        onDuration?.(fallbackDuration);
      }
    };

    if (videoId) {
      fetchVideoDuration();
    }
  }, [videoId, onDuration]);

  // SATURN-PARAMETER - vor useEffect definieren!
  const saturnOrbitDistance = 20 * 16; // Saturn-Distanz * Skalierungsfaktor für 2D-Screen
  const saturnOrbitSpeed = 0.004 * 50; // Saturn-Geschwindigkeit * Anpassung für Screen-Animation
  const orbitEccentricity = 0.05; // Saturn hat eine nahezu kreisförmige Bahn
  const orbitInclination = 2.5; // Saturn-Bahnneigung: 2.48°

  // SATURN-UMLAUFBAHN Animation - SICHTBARE KREISBEWEGUNG!
  useEffect(() => {
    const animateOrbit = () => {
      const currentTime = (Date.now() - startTimeRef.current) / 1000; // Zeit in Sekunden seit Start
      setSaturnSyncTime(currentTime);
      
      // LANGSAMERE Saturn-Rotation für SICHTBARE Umlaufbahn!
      const saturnSpeed = 0.002; // Langsamer als Original für bessere Sichtbarkeit
      const isBeat = beatData.beat;
      const beatIntensity = beatData.intensity || 0;
      
      // WENIGER extreme Beat-Reaktionen für sichtbare Umlaufbahn
      const orbitSpeedMultiplier = isBeat ? 1 + beatIntensity * 3 : 1; // Viel weniger extrem
      const actualOrbitSpeed = saturnSpeed * orbitSpeedMultiplier;
      
      // EINFACHE Y-Rotation für klare Kreisbewegung
      const rotationY = currentTime * actualOrbitSpeed * 30; // Reduzierte Geschwindigkeit
      setOrbitRotation(rotationY);
      
      orbitAnimationRef.current = requestAnimationFrame(animateOrbit);
    };

    if (isPlaying) {
      orbitAnimationRef.current = requestAnimationFrame(animateOrbit);
    } else {
      // Wenn nicht abgespielt wird, pausiere die Animation
      if (orbitAnimationRef.current) {
        cancelAnimationFrame(orbitAnimationRef.current);
        orbitAnimationRef.current = null;
      }
    }

    return () => {
      if (orbitAnimationRef.current) {
        cancelAnimationFrame(orbitAnimationRef.current);
      }
    };
  }, [isPlaying, beatData]);

  // Beat Detection
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      beatCounterRef.current += 1;
      const beat = beatCounterRef.current % 4 === 0;
      const intensity = Math.random() * 0.5 + 0.5;
      onBeatDetection?.(beat, intensity);
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, onBeatDetection]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // GROSSE SICHTBARE SATURN-UMLAUFBAHN!
  const saturnDistance = 20; // Original Saturn-Distanz
  const screenScale = 25; // GRÖßERE Skalierung für sichtbare Umlaufbahn!
  const actualDistance = saturnDistance * screenScale; // 500px Radius!
  
  // EINFACHE KREISBEWEGUNG für maximale Sichtbarkeit!
  const angleRad = (orbitRotation * Math.PI) / 180;
  const orbitX = Math.cos(angleRad) * actualDistance;
  const orbitY = Math.sin(angleRad) * actualDistance;
  
  // REDUZIERTE Beat-Wobbling für sichtbare Umlaufbahn
  const isBeat = beatData.beat;
  const beatIntensity = beatData.intensity || 0;
  const wobbleAmount = isBeat ? beatIntensity * 0.5 : 0.01; // VIEL weniger Wobbling!
  
  // SANFTES Wobbling das die Umlaufbahn nicht zerstört
  const wobbleX = Math.sin(saturnSyncTime * 10) * wobbleAmount * 20; // Langsamer und kleiner
  const wobbleY = Math.cos(saturnSyncTime * 8) * wobbleAmount * 20;
  
  // SANFTE Beat-Reaktionen ohne Orbit-Zerstörung
  const beatScale = isBeat ? 1 + beatIntensity * 0.3 : 1; // Viel sanfter!
  
  const finalX = orbitX + wobbleX;
  const finalY = orbitY + wobbleY;

  return (
    <div
      className="fixed z-40 transition-all duration-500 ease-out"
      style={{
        left: `calc(50% + ${finalX}px)`,
        top: `calc(50% + ${finalY}px)`,
        transform: `translate(-50%, -50%) scale(${beatScale}) rotate(${orbitRotation * 0.05}deg)`,
      }}
    >
      <div className="relative">
        {/* SATURN-RING GLOW-EFFEKT */}
        <div className={`absolute inset-0 bg-gradient-to-r from-yellow-500/40 to-orange-400/30 rounded-lg blur-xl transition-all duration-300 ${
          beatData.beat ? 'animate-pulse scale-110' : ''
        }`} />
        {/* Saturn-Ringe Simulation */}
        <div className={`absolute inset-0 border-4 border-yellow-400/20 rounded-full blur-sm transition-all duration-300 ${
          beatData.beat ? 'border-yellow-300/40 scale-105' : ''
        }`} style={{ borderRadius: '50%' }} />
        <div className="relative bg-black/90 border-2 border-yellow-500/70 rounded-lg shadow-2xl backdrop-blur-sm p-3">
          {/* SATURN-STATUS OBEN - NICHT ÜBERLAPPEND */}
          <div className="flex justify-between items-center mb-2">
            <div className="bg-black/80 text-yellow-300 px-2 py-1 rounded text-xs font-bold">
              🪐 Saturn YouTube - 3D-ORBIT
            </div>
            <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
              isPlaying ? 'bg-yellow-400 animate-pulse shadow-yellow-400/50 shadow-lg' : 'bg-gray-500'
            } ${beatData.beat ? 'scale-125' : ''}`} />
          </div>

          {/* IFRAME - KEINE ÜBERLAPPENDEN ELEMENTE */}
          <iframe
            ref={iframeRef}
            width="280"
            height="180"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}&enablejsapi=1&fs=1&showinfo=0`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rounded-md w-full"
          />

          {/* SATURN-INFO UNTEN - GROSSE UMLAUFBAHN */}
          <div className="mt-2 bg-black/80 text-yellow-300 px-2 py-1 rounded text-xs text-center">
            🪐 {Math.round(orbitRotation)}° | 📏 {Math.round(actualDistance)}px GROSS-ORBIT | 🌟 SICHTBARE KREISBAHN
          </div>

          {/* SATURN-Controls - SICHTBAR */}
          <div className="mt-3 flex justify-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-sm font-bold rounded-lg hover:from-yellow-700 hover:to-orange-700 shadow-lg transition-all duration-200 ${
                beatData.beat ? 'scale-105 shadow-xl' : ''
              }`}
            >
              {isPlaying ? "⏸️ PAUSE" : "▶️ PLAY"}
            </button>
          </div>

          {/* SICHTBARER HINWEIS - NICHT VERDECKT */}
          <div className={`mt-2 text-center text-yellow-400 text-sm font-bold transition-all duration-200 ${
            beatData.beat ? 'animate-pulse text-yellow-300 scale-105' : ''
          }`}>
            💡 Saturn-Orbit - Direkter Play-Button!
          </div>

          <div className="mt-1 text-center text-yellow-300/80 text-xs">
            🌟 Große sichtbare Kreisbahn um das Zentrum - wie Saturn!
          </div>
        </div>
      </div>
    </div>
  );
}