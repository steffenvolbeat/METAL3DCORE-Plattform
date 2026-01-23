"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import SignUpForm from "./SignUpForm";
import { div } from "three/tsl";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: Props) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  const toggleMode = () => {
    setMode(prevMode => (prevMode === "login" ? "signup" : "login"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 overflow-y-auto auth-modal" style={{ zIndex: 99999 }}>
      {/*Backdrop with Blur*/}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/*Modal Content*/}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div
          className="relative w-full max-w-lg transform transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          role="dialog"
          aria-modal="true"
        >
          {mode === "login" ? (
            <LoginForm onClose={onClose} onToggleMode={toggleMode} />
          ) : (
            <SignUpForm onClose={onClose} onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
}
