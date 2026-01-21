// 🎸 3D Room Service
// Room Navigation & State

export type RoomType = "welcome" | "stadion" | "gallery" | "contact";
{
  /*| "welcome"
  | "stadion"
  | "gallery"
  | "community" // coming soon
  | "backstage" // coming soon
  | "contact"
  | "tickets";  // coming soon
*/
}
export interface RoomConfig {
  id: RoomType;
  name: string;
  description: string;
  requiredRole: string;
  cameraPosition?: { x: number; y: number; z: number };
  lightingPreset?: "dark" | "bright" | "ambient";
}

/**
 * Verfügbare Räume
 */
/*export const ROOMS: Record<RoomType, RoomConfig> = {
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
};*/

/**
 * Prüft den Zugriff auf einen Raum basierend auf der Benutzerrolle
 */

/**
export function canAccessRoom(room: RoomConfig, userRoles: string[]): boolean {
  const config = ROOMS[room.id];
  if (config.requiredRole) {
    return userRoles === config.requiredRole || userRoles === "Admin";
  }
}
  return true;
*/

//            ===============================================

/**
 * Gibt alle verfügbaren Räume für den Benutzer zurück
 */

/** 
 * export function getAvailableRooms(userRole?: string): RoomConfig[] {
  return Object.values(ROOMS).filter((room) =>
    hasRoomAccess(room.id, userRole)
  );
}
 */

//            ===============================================

/**
 * Raum-Konfiguration basierend auf der Raum-ID abrufen
 */

/** 
 * export function getRoomConfig(roomId: RoomType): RoomConfig {
  return ROOMS[roomId];
}
  */
