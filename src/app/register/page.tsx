"use client";

import { EnhancedRegistrationForm } from "@/features/auth/components";
import { Suspense } from "react";

function RegisterPageContent() {
  return (
    <div className="min-h-screen bg-linear-to-b from-black via-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <EnhancedRegistrationForm />
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-b from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">🎸 Lädt...</div>
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
