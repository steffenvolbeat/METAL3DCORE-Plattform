// 🎸 Navigation Sidebar Component - Professional UI
"use client";

import { useState } from "react";

interface NavigationSidebarProps {
  activeRoom: string;
  onRoomChange: (room: string) => void;
}

const rooms = [
  {
    id: "welcome",
    name: "Welcome Stage",
    icon: "🎸",
    description: "Start your journey",
  },
  {
    id: "stadium",
    name: "Metal Arena",
    icon: "🏟️",
    description: "Live concerts",
  },
  {
    id: "backstage",
    name: "Backstage VIP",
    icon: "🎭",
    description: "Coming Soon",
    isComingSoon: true,
  },
  {
    id: "gallery",
    name: "Band Gallery",
    icon: "🖼️",
    description: "Discover bands",
  },
  {
    id: "community",
    name: "Community Hub",
    icon: "💬",
    description: "Coming Soon",
    isComingSoon: true,
  },
  {
    id: "ticket",
    name: "Ticket Arena",
    icon: "🎫",
    description: "Get tickets",
  },
];

export function NavigationSidebar({
  activeRoom,
  onRoomChange,
}: NavigationSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button - Fixed Left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-6 top-24 z-50 bg-gradient-to-br from-orange-500 to-red-600 p-4 rounded-xl shadow-2xl hover:scale-110 transition-all duration-300 group"
        aria-label="Navigation Menu"
      >
        <div className="flex flex-col gap-1.5">
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </div>

        {/* Tooltip */}
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Navigation
        </div>
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-black via-gray-900 to-black border-r border-gray-800/50 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎸</span>
              </div>
              <h2 className="text-xl font-black text-white">Navigation</h2>
            </div>
            <p className="text-sm text-gray-400">Explore 3D Rooms</p>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-6 py-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  onRoomChange(room.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                  activeRoom === room.id
                    ? "bg-gradient-to-r from-orange-500/20 to-red-600/20 border-2 border-orange-500 shadow-lg shadow-orange-500/20"
                    : "bg-gray-800/40 border-2 border-gray-800 hover:border-gray-700 hover:bg-gray-800/60"
                }`}
              >
                <div className="flex items-center justify-start gap-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                    {room.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white group-hover:text-orange-500 transition-colors flex items-center">
                      {room.name}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      {room.description}
                      {room.isComingSoon && (
                        <span className="ml-2 px-2 py-1 bg-purple-600/80 text-purple-200 rounded-full text-xs font-semibold">
                          ✨ Soon
                        </span>
                      )}
                    </div>
                  </div>
                  {activeRoom === room.id && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse flex-shrink-0"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">
              Use WASD to move • Mouse to look around
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
