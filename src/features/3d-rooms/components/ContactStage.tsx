"use client";

import React, { Suspense, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Center, Float, Box, Plane, Html } from "@react-three/drei";
import * as THREE from "three";
import { FPSControls } from "@/shared/components/3d";

// Typen für Props
interface ContactStageProps {
  isFullscreen?: boolean;
  onRoomChange?: (room: string) => void;
  onFullscreen?: () => void;
}

// Loading Fallback mit Metal Pulse Design
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-primary">
      <div className="section-card max-w-md text-center">
        <div className="animate-spin h-14 w-14 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="panel-heading text-xl mb-2">🎸 Metal Contact Arena</p>
        <p className="text-theme-secondary">Lädt 3D-Erlebnis...</p>
      </div>
    </div>
  );
}

// Contact Info Wall Komponente (Rechte Wand)
function ContactInfoWall() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(state => {
    if (meshRef.current && meshRef.current.material && "color" in meshRef.current.material) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.color.setHSL(0.1, 0.8, 0.5 + Math.sin(state.clock.elapsedTime) * 0.1);
    }
  });
  return (
    <group position={[20, 5, 0]}>
      {/* Rechte Wand für Kontakt-Info */}
      <Plane ref={meshRef} args={[8, 12]} rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#ff6b35"
          transparent
          opacity={0.8}
          metalness={0.6}
          roughness={0.2}
          emissive="#ff6b35"
          emissiveIntensity={0.1}
        />
      </Plane>

      {/* 3D Contact Info */}
      <Html position={[0.1, 2, 0]} rotation={[0, -Math.PI / 2, 0]} transform occlude distanceFactor={15}>
        <div className="glass-panel p-6 md:p-8 rounded-2xl border-2 border-orange-500 shadow-2xl w-80 sm:w-96 mx-auto text-center">
          <div className="text-center mb-6">
            <h3 className="panel-heading text-2xl md:text-3xl text-orange-500 mb-3">🎸 METAL SUPPORT</h3>
            <div className="w-full h-1 bg-linear-to-r from-orange-500 via-red-600 to-orange-500 rounded"></div>
          </div>

          <div className="space-y-5 text-theme-primary">
            <div className="flex items-start justify-center gap-3 hover:bg-orange-500/10 p-3 rounded-lg transition-colors text-left">
              <div className="text-2xl shrink-0">📧</div>
              <div className="min-w-0">
                <p className="font-bold text-orange-400 text-sm md:text-base">E-Mail Support</p>
                <p className="text-xs md:text-sm text-theme-secondary truncate">support@3dmetal.com</p>
              </div>
            </div>

            <div className="flex items-start justify-center gap-3 hover:bg-orange-500/10 p-3 rounded-lg transition-colors text-left">
              <div className="text-2xl shrink-0">📞</div>
              <div className="min-w-0">
                <p className="font-bold text-orange-400 text-sm md:text-base">Hotline</p>
                <p className="text-xs md:text-sm text-theme-secondary">+49 (0) 123 456 789</p>
                <p className="text-xs text-theme-secondary opacity-75">Mo-Fr 9:00-18:00</p>
              </div>
            </div>

            <div className="flex items-start justify-center gap-3 hover:bg-orange-500/10 p-3 rounded-lg transition-colors text-left">
              <div className="text-2xl shrink-0">💬</div>
              <div className="min-w-0">
                <p className="font-bold text-orange-400 text-sm md:text-base">Live Chat</p>
                <p className="text-xs md:text-sm text-theme-secondary">Sofort verfügbar</p>
              </div>
            </div>

            <div className="flex items-start justify-center gap-3 hover:bg-orange-500/10 p-3 rounded-lg transition-colors text-left">
              <div className="text-2xl shrink-0">🎵</div>
              <div className="min-w-0">
                <p className="font-bold text-orange-400 text-sm md:text-base">Social Media</p>
                <div className="flex flex-wrap gap-2 text-xs md:text-sm mt-1 justify-center">
                  <span className="text-blue-400 hover:text-blue-300 cursor-pointer">Facebook</span>
                  <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Instagram</span>
                  <span className="text-red-400 hover:text-red-300 cursor-pointer">YouTube</span>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-r from-orange-500/10 to-red-600/10 p-4 rounded-lg mt-6 border border-orange-500/30">
              <p className="text-orange-400 font-bold text-center text-sm md:text-base">
                🚀 Schnelle Antwort garantiert!
              </p>
              <p className="text-xs text-theme-secondary text-center mt-2">
                Durchschnittliche Antwortzeit: 2-4 Stunden
              </p>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

// Message Wall Komponente (Linke Wand)
function MessageWall() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    gdprConsent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(state => {
    if (meshRef.current && meshRef.current.material && "color" in meshRef.current.material) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.color.setHSL(0.65, 0.8, 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage({ type: null, text: "" });

    // GDPR Consent Check
    if (!formData.gdprConsent) {
      setSubmitMessage({
        type: "error",
        text: "Bitte akzeptiere die Datenschutzbestimmungen!",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage({
          type: "success",
          text: "🎸 Metal Message gesendet! Rock on! 🤘",
        });
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          gdprConsent: false,
        });
      } else {
        setSubmitMessage({
          type: "error",
          text: data.error || "Fehler beim Senden der Metal-Nachricht",
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: "Netzwerkfehler. Metal-Verbindung unterbrochen!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  return (
    <group position={[-20, 5, 0]}>
      {/* Linke Wand für Message Form */}
      <Plane ref={meshRef} args={[10, 12]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.8}
          metalness={0.6}
          roughness={0.2}
          emissive="#3b82f6"
          emissiveIntensity={0.1}
        />
      </Plane>

      {/* 3D Message Form */}
      <Html position={[-0.1, 0, 0]} rotation={[0, Math.PI / 2, 0]} transform occlude distanceFactor={12}>
        <div className="glass-panel p-5 md:p-6 rounded-2xl border-2 border-blue-500 shadow-2xl w-80 sm:w-96 lg:w-105 mx-auto text-center">
          <div className="text-center mb-5">
            <h3 className="panel-heading text-xl md:text-2xl text-blue-400 mb-3">🎤 METAL MESSAGE</h3>
            <div className="w-full h-1 bg-linear-to-r from-blue-500 via-purple-600 to-blue-500 rounded"></div>
          </div>

          {/* Success/Error Message */}
          {submitMessage.type && (
            <div
              className={`mb-4 p-4 rounded-lg text-center font-bold text-base transition-all duration-300 animate-pulse ${
                submitMessage.type === "success"
                  ? "bg-linear-to-r from-green-900/80 to-emerald-900/80 text-green-200 border-2 border-green-400 shadow-lg shadow-green-500/50"
                  : "bg-linear-to-r from-red-900/80 to-orange-900/80 text-red-200 border-2 border-red-400 shadow-lg shadow-red-500/50"
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-center">
            <div>
              <label className="block text-theme-primary font-semibold mb-2 text-xs md:text-sm text-center">
                🤘 Dein Metal-Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-center placeholder:text-center"
                required
                disabled={isSubmitting}
                placeholder="z.B. Metal Master"
              />
            </div>

            <div>
              <label className="block text-theme-primary font-semibold mb-2 text-xs md:text-sm text-center">
                ✉️ E-Mail Adresse
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-center placeholder:text-center"
                required
                disabled={isSubmitting}
                placeholder="metal@rock.com"
              />
            </div>

            <div>
              <label className="block text-theme-primary font-semibold mb-2 text-xs md:text-sm text-center">
                🎯 Metal-Thema
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm text-center placeholder:text-center"
                required
                disabled={isSubmitting}
                placeholder="Heavy Metal Anfrage"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-1 text-sm text-center">�️ Deine Metal-Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-6 py-2.5 bg-black/40 border border-theme-secondary rounded-lg text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all text-sm text-center placeholder:text-center"
                required
                disabled={isSubmitting}
                placeholder="Lass deine Metal-Gedanken frei..."
              />
              <div className="flex justify-between items-center text-xs text-theme-secondary mt-1.5">
                <span>Max. 2000 Zeichen</span>
                <span className={formData.message.length > 1900 ? "text-orange-400" : ""}>
                  {formData.message.length}/2000
                </span>
              </div>
            </div>

            {/* 🔒 GDPR Consent Checkbox */}
            <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <input
                type="checkbox"
                id="gdprConsent"
                name="gdprConsent"
                checked={formData.gdprConsent}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="mt-1 w-4 h-4 accent-blue-500 cursor-pointer"
              />
              <label htmlFor="gdprConsent" className="text-xs text-theme-secondary leading-relaxed cursor-pointer">
                Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
                <a href="/datenschutz" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                  Datenschutzerklärung
                </a>{" "}
                zu. Meine Daten werden verschlüsselt gespeichert und nach 90 Tagen automatisch gelöscht.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.gdprConsent}
              className="button-primary w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                  <span className="text-sm md:text-base">Metal wird gesendet...</span>
                </>
              ) : (
                <span className="text-sm md:text-base">🤘 Metal Message abfeuern!</span>
              )}
            </button>
          </form>
        </div>
      </Html>
    </group>
  );
}

//3D Scene Komponente
function ContactScene() {
  return (
    <>
      {/* Verbesserte Beleuchtung für hellere Szene */}
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-10, 10, -5]} intensity={1.5} color="#ffffff" />
      <pointLight position={[10, 5, 10]} intensity={2} color="#ff6b35" />
      <pointLight position={[-10, 5, 10]} intensity={2} color="#3b82f6" />
      <pointLight position={[0, 10, 0]} intensity={1.5} color="#ffffff" />

      {/* Boden mit Metal-Design */}
      <Plane args={[60, 60]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <meshStandardMaterial color="#222222" metalness={0.5} roughness={0.5} />
      </Plane>

      {/* Rückwand */}
      <Plane args={[60, 25]} position={[0, 10, -30]} receiveShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </Plane>

      {/* Decke */}
      <Plane args={[60, 60]} rotation={[Math.PI / 2, 0, 0]} position={[0, 22, 0]} receiveShadow>
        <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.5} />
      </Plane>

      {/* Vereinfachter schwebender Titel */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <Center position={[0, 15, 0]}>
          <mesh>
            <boxGeometry args={[12, 1.5, 0.5]} />
            <meshBasicMaterial color="#ff6b35" />
          </mesh>
        </Center>
      </Float>

      {/* Message Wall (Links) */}
      <MessageWall />

      {/* Contact Info Wall (Rechts) */}
      <ContactInfoWall />

      {/* Reduzierte Partikel-Effekte für bessere Performance */}
      {Array.from({ length: 10 }).map((_, i) => (
        <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.3} floatIntensity={0.3}>
          <Box
            position={[(Math.random() - 0.5) * 40, 3 + Math.random() * 10, (Math.random() - 0.5) * 30]}
            args={[0.2, 0.2, 0.2]}
          >
            <meshBasicMaterial color={i % 2 === 0 ? "#ff6b35" : "#3b82f6"} />
          </Box>
        </Float>
      ))}

      {/* FPS-Steuerung für herumlaufen */}
      <FPSControls
        movementSpeed={15}
        lookSpeed={0.002}
        enabled={true}
        boundaries={{ minX: -28, maxX: 28, minZ: -28, maxZ: 28 }}
      />
    </>
  );
}

// Haupt-Komponente mit responsive Metal Pulse Design
export default function ContactStage({ isFullscreen = false, onRoomChange, onFullscreen }: ContactStageProps) {
  return (
    <div
      className={
        isFullscreen ? "fixed inset-0 z-50 h-screen bg-theme-primary overflow-hidden" : "min-h-screen bg-theme-primary"
      }
    >
      {/* Header - nur wenn nicht fullscreen */}
      {!isFullscreen && (
        <div className="app-shell py-8">
          <div className="section-card mb-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                    🎤
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-theme-secondary">Support & Kontakt</p>
                    <h2 className="panel-heading text-2xl">Metal Contact Arena</h2>
                  </div>
                </div>
                <p className="text-theme-secondary text-sm leading-relaxed">
                  Bewege dich in First-Person durch die Arena und finde die Message Wall & Support Info. WASD zum
                  Bewegen, Maus zum Umschauen.
                </p>
              </div>
              {onFullscreen && (
                <button
                  onClick={onFullscreen}
                  className="button-primary px-6 py-3 text-sm sm:text-base font-bold shadow-lg"
                >
                  🎮 Vollbild Modus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3D View Container */}
      <div className={isFullscreen ? "" : "app-shell"}>
        <div
          className={
            isFullscreen
              ? "h-screen relative overflow-hidden"
              : "section-card h-96 sm:h-[600px] lg:h-[700px] relative overflow-hidden mb-8"
          }
        >
          {/* 3D Scene */}
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              camera={{
                position: [0, 2, 10],
                fov: 75,
              }}
              className="w-full h-full rounded-2xl"
              gl={{
                antialias: true,
                alpha: false,
              }}
              shadows={false}
              dpr={[1, 2]}
            >
              <ContactScene />
            </Canvas>
          </Suspense>

          {/* 3D Overlay Controls - Responsive */}
          <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-none">
            <div className="glass-panel p-3 sm:p-4 pointer-events-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                {/* Zurück Button */}
                {!isFullscreen && onRoomChange && (
                  <button
                    onClick={() => onRoomChange("welcome")}
                    className="button-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all hover:scale-105"
                  >
                    ← Welcome
                  </button>
                )}

                {/* Info Badges */}
                <div className="flex flex-wrap gap-2 flex-1 justify-center">
                  <span className="chip text-xs">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Message Wall
                  </span>
                  <span className="chip text-xs">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    Support Info
                  </span>
                </div>

                {/* Vollbild Button */}
                <button
                  onClick={() => {
                    if (onFullscreen) {
                      onFullscreen();
                    }
                  }}
                  disabled={!onFullscreen}
                  className="button-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFullscreen ? "🪟 Fenster" : "🔲 Vollbild"}
                </button>
              </div>

              {/* FPS Controls Info - Hidden on small screens */}
              <div className="hidden md:flex items-center justify-center gap-4 mt-3 pt-3 border-t border-theme-secondary text-xs text-theme-secondary">
                <span>🖱️ Klick: Maus sperren</span>
                <span>⌨️ WASD: Bewegen</span>
                <span>␣ Space: Hoch</span>
                <span>⇧ Shift: Runter</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
