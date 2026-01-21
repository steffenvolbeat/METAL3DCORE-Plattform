"use client";

import { ContactStage } from "@/features/3d-rooms/components";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleRoomChange = (room: string) => {
    if (room === "welcome") {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-theme-primary">
      {!isFullscreen && (
        <div className="app-shell py-8">
          <div className="section-card mb-8">
            <h1 className="panel-heading text-3xl sm:text-4xl mb-3">
              📧 Kontakt
            </h1>
            <p className="text-theme-secondary">
              Hast du Fragen oder Feedback? Kontaktiere uns!
            </p>
          </div>
        </div>
      )}

      <ContactStage
        isFullscreen={isFullscreen}
        onFullscreen={handleToggleFullscreen}
        onRoomChange={handleRoomChange}
      />
    </div>
  );
}
