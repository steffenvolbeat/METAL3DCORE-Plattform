"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";

// Validation Schema
const signUpSchema = z
  .object({
    name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein"),
    username: z.string().min(3, "Username muss mindestens 3 Zeichen lang sein"),
    email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
    password: z.string().min(6, "Passwort muss mindestens 6 Zeichen lang sein"),
    confirmPassword: z.string(),
    role: z.enum(["FAN", "BAND"], {
      message: "Bitte wählen Sie eine Rolle aus",
    }),
    terms: z.boolean().refine((val) => val === true, {
      message: "Sie müssen die Nutzungsbedingungen akzeptieren",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

interface Props {
  onToggleMode: () => void;
  onClose: () => void;
}

export default function SignUpForm({ onToggleMode, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "FAN",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Register user via API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.role === "BAND" ? `${data.name} Mitglied` : data.name,
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
          // Band-spezifische Felder für BAND Accounts
          ...(data.role === "BAND" && {
            bandName: data.name, // Band Name kommt aus dem Name-Feld
            bandDescription: `Offizielle Seite von ${data.name}`,
            bandGenre: "Metal",
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registrierung fehlgeschlagen");
      }

      setSuccess(true);

      // Auto-login after successful registration
      setTimeout(async () => {
        await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        onClose();
        router.refresh();
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Ein Fehler ist aufgetreten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      setError("Google Registrierung fehlgeschlagen");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🎉 Registrierung erfolgreich!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Willkommen bei 3DMetal Platform! Du wirst automatisch angemeldet...
          </p>
          <div className="animate-spin mx-auto w-6 h-6 text-orange-500">
            <svg fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-black/90 border-2 border-theme-primary/30 rounded-2xl shadow-2xl shadow-theme-primary/20 p-6 w-full mx-2 relative overflow-visible">
      {/* Decorative gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent rounded-t-2xl"></div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-300 hover:rotate-90 z-10"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="text-center mb-6 pt-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent bg-clip-text text-transparent mb-3">
          🎸 Join 3DMetal!
        </h2>
        <p className="text-gray-300">
          Erstelle deinen Account für die Ultimate Metal Experience
        </p>
      </div>

      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border-2 border-red-400/30 rounded-xl shadow-lg shadow-red-500/20 px-4 py-3 mb-4 animate-float">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
              <span className="text-red-400 text-sm font-bold">!</span>
            </div>
            <p className="text-sm text-red-200 leading-relaxed flex-1">
              {error}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-3">
            Ich bin ein/eine:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`relative flex cursor-pointer rounded-xl border-2 transition-all duration-300 p-5 ${
                selectedRole === "FAN"
                  ? "border-theme-primary bg-gradient-to-br from-theme-primary/20 to-theme-secondary/20 shadow-lg shadow-theme-primary/30 scale-105"
                  : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-theme-primary/50 hover:scale-102"
              }`}
            >
              <input
                {...register("role")}
                type="radio"
                value="FAN"
                className="sr-only"
              />
              <div className="flex flex-col items-center w-full">
                <div className="text-3xl mb-2 transform transition-transform group-hover:scale-110">
                  🎸
                </div>
                <div className="text-base font-bold text-white mb-1">
                  Metal Fan
                </div>
                <div className="text-xs text-gray-300 text-center">
                  Events besuchen & Community
                </div>
              </div>
              {selectedRole === "FAN" && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-full flex items-center justify-center shadow-lg shadow-theme-primary/50">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </label>

            <label
              className={`relative flex cursor-pointer rounded-xl border-2 transition-all duration-300 p-5 ${
                selectedRole === "BAND"
                  ? "border-theme-primary bg-gradient-to-br from-theme-primary/20 to-theme-secondary/20 shadow-lg shadow-theme-primary/30 scale-105"
                  : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-theme-primary/50 hover:scale-102"
              }`}
            >
              <input
                {...register("role")}
                type="radio"
                value="BAND"
                className="sr-only"
              />
              <div className="flex flex-col items-center w-full">
                <div className="text-3xl mb-2 transform transition-transform group-hover:scale-110">
                  🎤
                </div>
                <div className="text-base font-bold text-white mb-1">Band</div>
                <div className="text-xs text-gray-300 text-center">
                  Events organisieren
                </div>
              </div>
              {selectedRole === "BAND" && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-theme-primary to-theme-secondary rounded-full flex items-center justify-center shadow-lg shadow-theme-primary/50">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </label>
          </div>
          {errors.role && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
              <span className="text-red-400">⚠</span>
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-2"
          >
            {selectedRole === "BAND" ? "Band Name" : "Vollständiger Name"}
          </label>
          <input
            {...register("name")}
            type="text"
            id="name"
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-primary text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
            placeholder={
              selectedRole === "BAND" ? "Deine Band" : "Max Mustermann"
            }
          />
          {errors.name && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
              <span className="text-red-400">⚠</span>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-2"
          >
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            id="username"
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-primary text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
            placeholder="dein_username"
          />
          {errors.username && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
              <span className="text-red-400">⚠</span>
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-2"
          >
            E-Mail-Adresse
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-primary text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
            placeholder="deine@email.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
              <span className="text-red-400">⚠</span>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-2"
            >
              Passwort
            </label>
            <input
              {...register("password")}
              type="password"
              id="password"
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-primary text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
              placeholder="Min. 6 Zeichen"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="text-red-400">⚠</span>
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-2"
            >
              Bestätigen
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-primary text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
              placeholder="Wiederholen"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="text-red-400">⚠</span>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start">
          <div className="flex items-center h-5 mt-1">
            <input
              {...register("terms")}
              id="terms"
              type="checkbox"
              className="focus:ring-theme-primary h-4 w-4 text-theme-primary border-white/30 rounded bg-white/5 backdrop-blur-sm transition-all duration-300"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-300">
              Ich akzeptiere die{" "}
              <button
                type="button"
                className="text-theme-primary hover:text-theme-secondary font-medium transition-colors"
              >
                Nutzungsbedingungen
              </button>{" "}
              und{" "}
              <button
                type="button"
                className="text-theme-primary hover:text-theme-secondary font-medium transition-colors"
              >
                Datenschutzrichtlinien
              </button>
            </label>
            {errors.terms && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <span className="text-red-400">⚠</span>
                {errors.terms.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent hover:from-theme-primary/90 hover:via-theme-secondary/90 hover:to-theme-accent/90 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg shadow-theme-primary/50 hover:shadow-theme-primary/70 relative overflow-hidden group"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Account wird erstellt...
            </div>
          ) : (
            <>
              <span className="relative z-10">
                🚀{" "}
                {selectedRole === "BAND"
                  ? "Band Account erstellen"
                  : "Account erstellen"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 backdrop-blur-xl bg-black/90 text-gray-400">
              Oder
            </span>
          </div>
        </div>
      </div>

      {/* Google Sign Up */}
      <button
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="w-full backdrop-blur-xl bg-white/10 border-2 border-white/20 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mb-4 transform hover:scale-105 shadow-lg shadow-black/20"
      >
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Mit Google registrieren
        </div>
      </button>

      {/* Toggle to Login */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Bereits ein Account?{" "}
          <button
            onClick={onToggleMode}
            className="text-theme-primary hover:text-theme-secondary font-medium transition-colors"
          >
            Hier anmelden
          </button>
        </p>
      </div>
    </div>
  );
}
