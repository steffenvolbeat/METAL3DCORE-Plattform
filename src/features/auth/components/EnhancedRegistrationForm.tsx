"use client";

// 🎸 3DMetal Platform - Enhanced Registration Component
// Registrierung für Bands und Fans mit Access Control

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { TICKET_DESCRIPTIONS, USER_ROLE_DESCRIPTIONS } from "@/lib/access-control";

interface RegistrationFormData {
  email: string;
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  bandName?: string;
  bandDescription?: string;
  bandGenre?: string;
}

export function EnhancedRegistrationForm() {
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    username: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: UserRole.FAN,
    bandName: "",
    bandDescription: "",
    bandGenre: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showBandFields, setShowBandFields] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    // Frontend Validierung
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwörter stimmen nicht überein" });
      setIsLoading(false);
      return;
    }

    if (formData.role === UserRole.BAND && !formData.bandName) {
      setMessage({ type: "error", text: "Band Name ist erforderlich" });
      setIsLoading(false);
      return;
    }

    try {
      console.log("🎸 Sending registration request...", formData);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          name: formData.name,
          password: formData.password,
          role: formData.role,
          ...(formData.role === UserRole.BAND && {
            bandName: formData.bandName,
            bandDescription: formData.bandDescription,
            bandGenre: formData.bandGenre,
          }),
        }),
      });

      console.log("📨 Response status:", response.status);
      const result = await response.json();
      console.log("📨 Response data:", result);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        // Reset Form
        setFormData({
          email: "",
          username: "",
          name: "",
          password: "",
          confirmPassword: "",
          role: UserRole.FAN,
          bandName: "",
          bandDescription: "",
          bandGenre: "",
        });
        setShowBandFields(false);
      } else {
        console.error("❌ Registration failed:", result);
        setMessage({
          type: "error",
          text: result.error || result.message || "Registrierung fehlgeschlagen",
        });
      }
    } catch (error) {
      console.error("❌ Network/Registration error:", error);
      setMessage({
        type: "error",
        text: `Netzwerk Fehler: ${(error as Error).message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
    setShowBandFields(role === UserRole.BAND);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 backdrop-blur-xl bg-black/90 rounded-2xl border-2 border-theme-primary/30 shadow-2xl shadow-theme-primary/20 relative overflow-hidden">
      {/* Decorative gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-theme-primary via-theme-secondary to-theme-accent"></div>

      {/* Header */}
      <div className="text-center mb-8 pt-2">
        <h1 className="text-4xl font-bold bg-linear-to-r from-theme-primary via-theme-secondary to-theme-accent bg-clip-text text-transparent mb-4 animate-shimmer">
          🎸 3DMetal Platform
        </h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Account Erstellen</h2>
        <p className="text-gray-300">Wähle deinen Account-Typ und erhalte entsprechende Zugriffsrechte</p>
      </div>

      {/* Role Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-4">
          Account-Typ wählen:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fan Account */}
          <div
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${
              formData.role === UserRole.FAN
                ? "border-theme-primary bg-linear-to-br from-theme-primary/20 to-theme-secondary/20 shadow-lg shadow-theme-primary/30 scale-105"
                : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-theme-primary/50 hover:scale-102"
            }`}
            onClick={() => handleRoleChange(UserRole.FAN)}
          >
            <div className="flex items-center mb-3">
              <input
                type="radio"
                checked={formData.role === UserRole.FAN}
                onChange={() => handleRoleChange(UserRole.FAN)}
                className="mr-3 accent-theme-primary"
              />
              <h4 className="text-xl font-bold text-white">🎫 Fan Account</h4>
            </div>
            {formData.role === UserRole.FAN && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-linear-to-br from-theme-primary to-theme-secondary rounded-full flex items-center justify-center shadow-lg shadow-theme-primary/50">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <p className="text-gray-300 mb-4 leading-relaxed">{USER_ROLE_DESCRIPTIONS[UserRole.FAN].description}</p>

            <div className="space-y-2 backdrop-blur-sm bg-white/5 p-3 rounded-lg">
              <p className="text-sm font-semibold text-white mb-2">Verfügbare Tickets:</p>
              {Object.entries(TICKET_DESCRIPTIONS).map(([type, desc]) => (
                <div key={type} className="text-sm text-gray-300 border-l-2 border-theme-primary/30 pl-3 py-1">
                  <span className="font-medium text-white">{desc.name}</span> -{" "}
                  <span className="text-theme-primary font-semibold">{desc.price}€</span>
                  <div className="text-xs text-gray-400 mt-0.5">{desc.features.join(", ")}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Band Account */}
          <div
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 relative ${
              formData.role === UserRole.BAND
                ? "border-theme-secondary bg-linear-to-br from-theme-secondary/20 to-theme-accent/20 shadow-lg shadow-theme-secondary/30 scale-105"
                : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-theme-secondary/50 hover:scale-102"
            }`}
            onClick={() => handleRoleChange(UserRole.BAND)}
          >
            <div className="flex items-center mb-3">
              <input
                type="radio"
                checked={formData.role === UserRole.BAND}
                onChange={() => handleRoleChange(UserRole.BAND)}
                className="mr-3 accent-theme-secondary"
              />
              <h4 className="text-xl font-bold text-white">🎸 Band Account</h4>
            </div>
            {formData.role === UserRole.BAND && (
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-linear-to-br from-theme-secondary to-theme-accent rounded-full flex items-center justify-center shadow-lg shadow-theme-secondary/50">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <p className="text-gray-300 mb-4 leading-relaxed">{USER_ROLE_DESCRIPTIONS[UserRole.BAND].description}</p>

            <div className="bg-linear-to-r from-theme-secondary/20 to-theme-accent/20 p-4 rounded-lg backdrop-blur-sm border border-theme-secondary/30">
              <p className="text-sm font-semibold text-white mb-2">✨ VOLLZUGANG nach Registrierung:</p>
              <div className="text-sm text-gray-300 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">👑</span> VIP Bereich
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span> Premium Bereich
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">🎤</span> Konzert-Zugang
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">🎸</span> Backstage-Zugang
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic User Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent font-medium mb-2">
              E-Mail *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-primary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
              placeholder="deine@email.com"
            />
          </div>

          <div>
            <label className="block bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent font-medium mb-2">
              Username *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-primary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
              placeholder="deinusername"
            />
          </div>
        </div>

        <div>
          <label className="block bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent font-medium mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-primary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
            placeholder="Dein vollständiger Name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent font-medium mb-2">
              Passwort *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-primary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
              placeholder="Mindestens 6 Zeichen"
              minLength={6}
            />
          </div>

          <div>
            <label className="block bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent font-medium mb-2">
              Passwort bestätigen *
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-primary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
              placeholder="Passwort wiederholen"
            />
          </div>
        </div>

        {/* Band-spezifische Felder */}
        {showBandFields && (
          <div className="space-y-4 p-6 backdrop-blur-xl bg-linear-to-br from-theme-secondary/20 to-theme-accent/20 rounded-xl border-2 border-theme-secondary/30 shadow-lg shadow-theme-secondary/20 animate-float">
            <h3 className="text-lg font-semibold bg-linear-to-r from-theme-secondary to-theme-accent bg-clip-text text-transparent">
              🎸 Band Informationen
            </h3>

            <div>
              <label className="block bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent font-medium mb-2">
                Band Name *
              </label>
              <input
                type="text"
                required
                value={formData.bandName}
                onChange={e => setFormData(prev => ({ ...prev, bandName: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-secondary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-secondary/40"
                placeholder="Name deiner Band"
              />
            </div>

            <div>
              <label className="block bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent font-medium mb-2">
                Genre
              </label>
              <input
                type="text"
                value={formData.bandGenre}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    bandGenre: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-secondary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-secondary/40"
                placeholder="z.B. Metal, Rock, Progressive..."
              />
            </div>

            <div>
              <label className="block bg-linear-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent font-medium mb-2">
                Band Beschreibung
              </label>
              <textarea
                value={formData.bandDescription}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    bandDescription: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-secondary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-secondary/40 h-24 resize-none"
                placeholder="Erzähle etwas über deine Band..."
              />
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div
            className={`p-4 rounded-xl border-2 backdrop-blur-xl animate-float ${
              message.type === "success"
                ? "bg-green-500/10 border-green-400/30 shadow-lg shadow-green-500/20"
                : "bg-red-500/10 border-red-400/30 shadow-lg shadow-red-500/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  message.type === "success" ? "bg-green-500/20" : "bg-red-500/20"
                }`}
              >
                <span className={message.type === "success" ? "text-green-400" : "text-red-400"}>
                  {message.type === "success" ? "✓" : "!"}
                </span>
              </div>
              <p
                className={`text-sm leading-relaxed flex-1 ${
                  message.type === "success" ? "text-green-200" : "text-red-200"
                }`}
              >
                {message.text}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg relative overflow-hidden group ${
            isLoading
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : formData.role === UserRole.BAND
                ? "bg-linear-to-r from-theme-secondary via-theme-accent to-theme-primary hover:shadow-theme-secondary/70 shadow-theme-secondary/50"
                : "bg-linear-to-r from-theme-primary via-theme-secondary to-theme-accent hover:shadow-theme-primary/70 shadow-theme-primary/50"
          } text-white`}
        >
          <span className="relative z-10">
            {isLoading
              ? "Erstelle Account..."
              : formData.role === UserRole.BAND
                ? "🎸 Band Account erstellen"
                : "🎫 Fan Account erstellen"}
          </span>
          {!isLoading && (
            <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
          )}
        </button>

        <div className="text-center text-gray-400">
          <p>
            Bereits ein Account?
            <a
              href="/login"
              className="text-theme-primary hover:text-theme-secondary font-medium transition-colors ml-2"
            >
              Hier anmelden
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
