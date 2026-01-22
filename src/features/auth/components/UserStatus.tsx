"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

interface Props {
  onOpenAuth: (mode: "login" | "signup") => void;
}

export default function UserStatus({ onOpenAuth }: Props) {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
        <span className="text-sm text-theme-secondary">Loading...</span>
      </div>
    );
  }
  if (session) {
    return (
      <div className="relative ">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="group flex items-center gap-10 backdrop-blur-md bg-theme-card/80 border-2 border-theme-primary/30 rounded-xl px-2 py-4 transition-all duration-300 hover:border-theme-accent hover:bg-theme-secondary/80 hover:scale-105 hover:shadow-xl"
        >
          {session.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-9 h-9 rounded-full border-2 border-theme-accent ring-2 ring-theme-accent/30 group-hover:ring-4 transition-all duration-300 mt-4 mb-4 ml-4 mr-4"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-center leading-none">{session.user?.name?.charAt(0) || "U"}</span>
            </div>
          )}
          <div className="hidden sm:block text-center px-8 py-4">
            <div className="text-sm font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
              {session.user?.name}
            </div>
            <div className="text-xs text-theme-secondary font-medium">
              {session.user?.role === "BAND_MEMBER" ? "🎤 Band" : "🎸 Fan"}
            </div>
          </div>
        </button>

        {/*Dropdown Menu*/}
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

            <div className="absolute right-0 left-0 mx-auto mt-3 w-64 backdrop-blur-xl bg-black/90 border-2 border-theme-primary/30 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4">
                <div className="px-4 py-4 mb-4 bg-linear-to-r from-orange-500/20 to-red-600/20 rounded-xl border border-theme-accent/30">
                  <div className="font-bold text-theme-primary items-center justify-center flex">
                    {session.user?.name}
                  </div>
                  <div className="text-xs text-theme-secondary truncate items-center justify-center flex">
                    {session.user?.email}
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="px-2 py-1 text-xs font-bold rounded-full bg-theme-accent/20 text-theme-accent border border-theme-accent/30">
                      {session.user?.role === "BAND_MEMBER" ? "🎤 Band Member" : "🎸 Fan"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    window.location.href = "/dashboard";
                  }}
                  className="w-full flex items-center justify-center gap-4 px-4 py-3 mb-2 text-center text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary/50 rounded-xl transition-all duration-200 hover:scale-102"
                >
                  <span className="text-xl">🎫</span>
                  <span className="font-medium text-sm">Zugänge & Tickets</span>
                </button>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // Navigate to profile
                  }}
                  className="w-full flex items-center justify-center gap-4 px-4 py-3 mb-2 text-center text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary/50 rounded-xl transition-all duration-200 hover:scale-102"
                >
                  <span className="text-xl">👤</span>
                  <span className="font-medium text-sm">Profil bearbeiten</span>
                </button>

                {session.user?.role === "BAND_MEMBER" && (
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      // Navigation to band dashboard
                    }}
                    className="w-full flex items-center justify-center gap-4 px-4 py-3 mb-2 text-center text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary/50 rounded-xl transition-all duration-200 hover:scale-102"
                  >
                    <span className="text-xl">🎤</span>
                    <span className="font-medium text-sm">Band Dashboard</span>
                  </button>
                )}

                <div className="my-4 border-t border-theme-secondary/30"></div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    signOut({
                      callbackUrl: "/",
                      redirect: true,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-4 px-4 py-3 text-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-102"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-bold text-sm">Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onOpenAuth("login")}
        className="px-4 py-2 text-sm font-bold text-theme-primary hover:text-theme-accent transition-all duration-200 hover:scale-105"
      >
        🔐 Login
      </button>
    </div>
  );
}
