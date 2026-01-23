"use client";

import { useState } from "react";

// Hier können die verfügbaren Räume definiert werden
const rooms = [
  {
    key: "welcome",
    label: "Welcome Stage",
    icon: "🎸",
    color: "from-orange-500 to-red-600",
  },
  {
    key: "gallery",
    label: "Band Gallery",
    icon: "🖼️",
    color: "from-purple-500 to-pink-600",
  },
  {
    key: "stadium",
    label: "Metal Arena Stadion",
    icon: "🏟️",
    color: "from-blue-500 to-cyan-600",
  },
  {
    key: "community",
    label: "Community Room",
    icon: "💬",
    color: "from-green-500 to-emerald-600",
  },
  {
    key: "backstage",
    label: "Backstage VIP",
    icon: "🎭",
    color: "from-yellow-500 to-orange-600",
  },
  {
    key: "ticket",
    label: "Ticket Arena",
    icon: "🎫",
    color: "from-red-500 to-rose-600",
  },
  {
    key: "contact",
    label: "Contact",
    icon: "📧",
    color: "from-indigo-500 to-purple-600",
  },
];

// RoomNavigation-Komponente für die Navigation zwischen verschiedenen 3D-Räumen
export default function RoomNavigation({
  activeRoom,
  setActiveRoom,
}: {
  activeRoom: string;
  setActiveRoom: (room: string) => void;
}) {
  return (
    <nav className="relative" data-testid="room-navigation">
      {/* Navigation Container */}
      <div className="backdrop-blur-lg bg-black/30 border border-theme-primary/20 rounded-2xl p-4 shadow-2xl">
        <div className="flex flex-wrap justify-center gap-3">
          {rooms.map((room) => (
            <button
              key={room.key}
              data-testid={`room-button-${room.key}`}
              onClick={() => setActiveRoom(room.key)}
              className={`group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeRoom === room.key
                  ? "scale-105 shadow-2xl"
                  : "hover:shadow-xl"
              }`}
            >
              {/* Button Background with Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  room.color
                } transition-opacity duration-300 ${
                  activeRoom === room.key
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-80"
                }`}
              ></div>

              {/* Button Background - Inactive State */}
              {activeRoom !== room.key && (
                <div className="absolute inset-0 bg-theme-card backdrop-blur-sm"></div>
              )}

              {/* Border Animation */}
              <div
                className={`absolute inset-0 border-2 rounded-xl transition-colors duration-300 ${
                  activeRoom === room.key
                    ? "border-white/50"
                    : "border-theme-secondary/30 group-hover:border-theme-primary/50"
                }`}
              ></div>

              {/* Content */}
              <div className="relative flex items-center gap-2 px-4 py-3">
                <span
                  className={`text-2xl transition-transform duration-300 ${
                    activeRoom === room.key
                      ? "scale-110"
                      : "group-hover:scale-110"
                  }`}
                >
                  {room.icon}
                </span>
                <span
                  className={`font-bold text-sm whitespace-nowrap transition-colors duration-300 ${
                    activeRoom === room.key
                      ? "text-white"
                      : "text-theme-primary group-hover:text-theme-accent"
                  }`}
                >
                  {room.label}
                </span>
              </div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-xl"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Room Indicator */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 backdrop-blur-sm bg-theme-accent/20 rounded-full border border-theme-accent/30">
          <span className="w-2 h-2 bg-theme-accent rounded-full animate-pulse"></span>
          <span className="text-xs font-medium text-theme-accent">
            Aktiver Raum:{" "}
            {rooms.find((r) => r.key === activeRoom)?.label || "Unbekannt"}
          </span>
        </div>
      </div>
    </nav>
  );
}
