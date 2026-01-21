// 🎸 3D Room Service
// Room Navigation & State

export type RoomType =
  | "welcome"
  | "stadion"
  | "gallery"
  | "community"
  | "backstage"
  | "contact"
  | "tickets";

export interface RoomConfig {
  id: RoomType;
  name: string;
  description: string;
  requiredRole?: string;
  cameraPosition?: [number, number, number];
  lightingPreset?: "dark" | "bright" | "ambient";
}

/**
 * Verfügbare Räume
 */
export const ROOMS: Record<RoomType, RoomConfig> = {
  welcome: {
    id: "welcome",
    name: "Welcome Stage",
    description: "Der Eingangsbereich der Metal3DCore Platform",
    cameraPosition: [0, 2, 5],
    lightingPreset: "bright",
  },
  stadion: {
    id: "stadion",
    name: "Hallenstadion",
    description: "Hauptbühne für Events und Konzerte",
    cameraPosition: [0, 10, 20],
    lightingPreset: "dark",
  },
  gallery: {
    id: "gallery",
    name: "Band Gallery",
    description: "Galerie mit Band-Informationen",
    cameraPosition: [0, 2, 8],
    lightingPreset: "ambient",
  },
  community: {
    id: "community",
    name: "Community Room",
    description: "Treffpunkt für Fans",
    cameraPosition: [0, 2, 5],
    lightingPreset: "ambient",
  },
  backstage: {
    id: "backstage",
    name: "Backstage Area",
    description: "Exklusiver VIP-Bereich",
    requiredRole: "VIP_FAN",
    cameraPosition: [0, 2, 5],
    lightingPreset: "dark",
  },
  contact: {
    id: "contact",
    name: "Contact Stage",
    description: "Kontakt und Support",
    cameraPosition: [0, 2, 5],
    lightingPreset: "bright",
  },
  tickets: {
    id: "tickets",
    name: "Ticket Stage",
    description: "Ticket-Shop",
    cameraPosition: [0, 2, 5],
    lightingPreset: "bright",
  },
};

/**
 * Prüft ob User Zugriff auf Raum hat
 */
export function hasRoomAccess(room: RoomType, userRole?: string): boolean {
  const config = ROOMS[room];
  if (!config.requiredRole) return true;
  return userRole === config.requiredRole || userRole === "ADMIN";
}

/**
 * Gibt alle verfügbaren Räume für User zurück
 */
export function getAvailableRooms(userRole?: string): RoomConfig[] {
  return Object.values(ROOMS).filter((room) =>
    hasRoomAccess(room.id, userRole)
  );
}

/**
 * Raum-Konfiguration laden
 */
export function getRoomConfig(roomId: RoomType): RoomConfig {
  return ROOMS[roomId];
}
