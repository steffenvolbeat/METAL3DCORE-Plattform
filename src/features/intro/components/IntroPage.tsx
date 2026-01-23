"use client";

import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useState } from "react";

// Import aller Features
import AdvancedShaders from "./AdvancedShaders";
import CinematicCamera, {
  CinematicStarter,
  CinematicUI,
} from "./CinematicCamera";
import CosmicEvents from "./CosmicEvents";
import InteractiveControls, { ClickablePlanets } from "./InteractiveControls";
import LiveDocumentation from "./LiveDocumentation";
import MobileOptimization, {
  CanvasPerformanceOptimizer,
  useAdaptiveParticleCount,
  useDeviceDetection,
} from "./MobileOptimization";
import RealisticSolarSystem from "./RealisticSolarSystem";
import SettingsAndPerformance, {
  CanvasPerformanceMonitor,
} from "./SettingsAndPerformance";
import SpaceScene from "./SpaceScene";

// Enhanced Space Scene mit FOTOREALISTISCHEM SONNENSYSTEM
function EnhancedSpaceScene({ 
  beatData, 
  videoId, 
  onBeatDetection,
  isVideoStarted
}: { 
  beatData: any;
  videoId?: string;
  onBeatDetection?: (beat: boolean, intensity: number) => void;
  isVideoStarted?: boolean;
}) {
  const adaptiveParticleCount = useAdaptiveParticleCount();

  return (
    <group>
      {/* FOTOREALISTISCHES SONNENSYSTEM mit echten Planeten und Umlaufbahnen */}
      <RealisticSolarSystem 
        beatData={beatData} 
        videoId={videoId}
        onBeatDetection={onBeatDetection}
        isVideoStarted={isVideoStarted}
      />

      {/* Hintergrund-Sternenfeld für Deep Space Effekt */}
      <SpaceScene beatData={beatData} isVideoStarted={isVideoStarted} />

      {/* Advanced Shaders + Materials */}
      <AdvancedShaders beatData={beatData} isVideoStarted={isVideoStarted} />

      {/* Cosmic Events: Black Holes + Supernovas */}
      <CosmicEvents beatData={beatData} isVideoStarted={isVideoStarted} />

      {/* Clickable Planets - jetzt realistisch! */}
      <ClickablePlanets
        onPlanetClick={(planetId) =>
          console.log(`Realistic Planet clicked: ${planetId}`)
        }
        beatData={beatData}
      />
    </group>
  );
}

export default function IntroPage({ onComplete }: { onComplete: () => void }) {
  const [isVideoStarted, setIsVideoStarted] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(300); // Default: 5 Minuten
  const [beatData, setBeatData] = useState<{
    beat: boolean;
    intensity: number;
    frequencies?: number[];
  }>({ beat: false, intensity: 0.3 });
  const [showWelcome, setShowWelcome] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [performanceLevel, setPerformanceLevel] = useState<
    "high" | "medium" | "low"
  >("high");

  const adaptiveParticleCount = useAdaptiveParticleCount();
  const deviceInfo = useDeviceDetection();

  const handleVideoReady = useCallback(() => {
    console.log("🎵 Video bereit!");
    setIsVideoStarted(true);
    // Welcome Screen wird erst nach Video-Ende gezeigt!
  }, []);

  const handleVideoDuration = useCallback((duration: number) => {
    console.log(`📹 Video-Dauer erkannt: ${duration} Sekunden`);
    setVideoDuration(duration);
  }, []);

  const handleBeatDetection = useCallback(
    (beat: boolean, intensity: number, frequencies?: number[]) => {
      setBeatData({ beat, intensity, frequencies });
    },
    []
  );

  const handleVideoEnd = useCallback(() => {
    console.log("🎬 Video beendet - Welcome Screen wird gezeigt!");
    // Welcome Screen erst NACH Video-Ende anzeigen
    setShowWelcome(true);
  }, []);

  const handleCinematicStart = useCallback(() => {
    setCinematicMode(true);
    setInteractiveMode(false);
  }, []);

  const handleCinematicComplete = useCallback(() => {
    setCinematicMode(false);
    setInteractiveMode(true);
  }, []);

  const toggleInteractiveMode = () => {
    setInteractiveMode((prev) => !prev);
    if (cinematicMode) setCinematicMode(false);
  };

  useEffect(() => {
    // Auto-start video after 2 seconds
    const timer = setTimeout(() => {
      handleVideoReady();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Space Background */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 5, 35], fov: 60 }}
          style={{
            background: "#000000",
          }} // ECHTER SCHWARZER WELTRAUM - NUR SCHWARZ!
        >
          <Suspense fallback={null}>
            {/* Canvas Performance Optimizer */}
            <CanvasPerformanceOptimizer performanceLevel={performanceLevel} />
            {/* Canvas Performance Monitor */}
            <CanvasPerformanceMonitor />
            {/* REALISTISCHES WELTALL - NUR SONNE ALS LICHTQUELLE! */}
            <ambientLight intensity={0.05} />{" "}
            {/* Fast keine Umgebungsbeleuchtung */}
            {/* Kein zusätzliches pointLight - nur Sonne beleuchtet! */}
            <Stars
              radius={500} // Riesiger Sternenhimmel!
              depth={300} // Sehr tief
              count={20000} // VIELE STERNE wie im echten Weltall!
              factor={2} // Größer und sichtbar
              saturation={0.1} // Leicht farbig
              fade={true}
              speed={0.2} // Etwas schneller
            />
            <EnhancedSpaceScene 
              beatData={beatData} 
              videoId="2Y3cPb9VGOg"
              onBeatDetection={handleBeatDetection}
            />
            {/* Cinematic Camera System */}
            <CinematicCamera isActive={cinematicMode} beatData={beatData} />
            {/* Orbit Controls */}
            {!cinematicMode && !interactiveMode && (
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
              />
            )}
          </Suspense>
        </Canvas>
      </div>
      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top Bar - 3DMetal Platform in der Mitte! */}
        <div className="flex-none p-6 flex justify-center items-center">
          <h1
            className={`text-6xl font-bold transition-all duration-300 ${
              beatData.beat ? "text-orange-400 scale-105" : "text-orange-300"
            }`}
          >
            🌌 Metal3DCore Plattform (M3DC)
          </h1>
        </div>

        {/* Cinematic Starter - Unter dem Titel */}
        {isVideoStarted && !cinematicMode && (
          <div className="flex-none flex justify-center pb-4">
            <CinematicStarter onStart={handleCinematicStart} />
          </div>
        )}

        {/* Main Content Area - Vollständig für 3D Sonnensystem! */}
        <div className="flex-1">
          {/* YouTube Player ist jetzt 3D und im Sonnensystem integriert! */}
        </div>

        {/* Welcome Transition */}
        {showWelcome && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center space-y-6">
              <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-purple-600 animate-pulse">
                Welcome to Metal3DCore Plattform!
              </h2>
              <div className="mt-8">
                <button
                  onClick={onComplete}
                  className="px-12 py-4 bg-linear-to-r from-orange-500 to-purple-600 text-white text-xl font-bold rounded-lg hover:from-orange-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  🚀 Enter Metal3DCore Plattform (M3DC)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Live Documentation Sidebar - LINKS Overlay */}
      <div className="fixed top-0 left-0 w-80 h-full z-40">
        <LiveDocumentation
          isVideoStarted={isVideoStarted}
          beatData={beatData}
          videoDuration={videoDuration} // DYNAMISCHE Video-Länge!
          onVideoEnd={() => {
            console.log("Documentation beendet - M3DC Button verfügbar!");
            // Optional: Weitere Aktionen nach Documentation-Ende
          }}
        />
      </div>{" "}
      {/* Interactive Controls - AUßERHALB der Canvas! */}
      {interactiveMode && !cinematicMode && (
        <InteractiveControls
          onPlanetClick={(planetId) =>
            console.log(`Planet clicked: ${planetId}`)
          }
          beatData={beatData}
        />
      )}
      {/* Mobile Optimization Components */}
      <MobileOptimization onPerformanceChange={setPerformanceLevel} />
      {/* Cinematic UI (external to Canvas) */}
      <CinematicUI />
      {/* Settings and Performance Panel */}
      <SettingsAndPerformance
        onSettingsChange={(settings) => {
          setPerformanceLevel(settings.shaderQuality);
          console.log("Settings updated:", settings);
        }}
      />
    </div>
  );
}
