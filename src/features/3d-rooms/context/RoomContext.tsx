// 🎸 3D Room Context
// 3D Navigation & Room State Management

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type RoomType =
  | "welcome"
  | "stadion"
  | "gallery"
  | "community"
  | "backstage"
  | "contact"
  | "tickets";

export interface RoomContextValue {
  currentRoom: RoomType;
  previousRoom: RoomType | null;
  isTransitioning: boolean;
  navigateToRoom: (room: RoomType) => void;
  goBack: () => void;
}

const RoomContext = createContext<RoomContextValue | undefined>(undefined);

export interface RoomProviderProps {
  children: ReactNode;
  initialRoom?: RoomType;
}

/**
 * Room Provider Component
 */
export function RoomProvider({
  children,
  initialRoom = "welcome",
}: RoomProviderProps) {
  const [currentRoom, setCurrentRoom] = useState<RoomType>(initialRoom);
  const [previousRoom, setPreviousRoom] = useState<RoomType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  function navigateToRoom(room: RoomType) {
    if (room === currentRoom || isTransitioning) return;

    setIsTransitioning(true);
    setPreviousRoom(currentRoom);

    // Simuliere Übergangsanimation
    setTimeout(() => {
      setCurrentRoom(room);
      setIsTransitioning(false);
    }, 500);
  }

  function goBack() {
    if (previousRoom && !isTransitioning) {
      navigateToRoom(previousRoom);
    }
  }

  const value: RoomContextValue = {
    currentRoom,
    previousRoom,
    isTransitioning,
    navigateToRoom,
    goBack,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

/**
 * Hook für Room Context
 */
export function useRoomContext() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoomContext must be used within RoomProvider");
  }
  return context;
}
