"use client";

import { LoginForm } from "@/features/auth/components";
import { Suspense } from "react";
import { useRouter } from "next/navigation";

function LoginPageContent() {
  const router = useRouter();

  const handleClose = () => {
    router.push("/");
  };

  const handleToggleMode = () => {
    router.push("/register");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      data-cy="login-page"
    >
      <div className="w-full max-w-lg">
        <div className="backdrop-blur-xl bg-black/90 rounded-2xl border-2 border-theme-primary/30 shadow-2xl shadow-theme-primary/20 relative overflow-hidden">
          <LoginForm onClose={handleClose} onToggleMode={handleToggleMode} />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">🎸 Lädt...</div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
