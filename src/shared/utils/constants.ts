// 🎸 App Constants
// Zentrale Konstanten für die Anwendung

export const APP_NAME = "Metal3DCore Platform";
export const APP_SHORT_NAME = "M3DC";
export const APP_VERSION = "2.3.1-testing";

export const USER_ROLES = {
  FAN: "FAN",
  VIP_FAN: "VIP_FAN",
  BAND: "BAND",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
} as const;

export const TICKET_TYPES = {
  BASIC: "STANDARD",
  STANDARD: "STANDARD",
  VIP_FANS: "VIP",
} as const;

export const EVENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export const ROOMS = {
  WELCOME: "welcome",
  STADION: "stadion",
  GALLERY: "gallery",
  COMMUNITY: "community",
  BACKSTAGE: "backstage",
  CONTACT: "contact",
  TICKETS: "tickets",
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: "/api/auth/signin",
    SIGNUP: "/api/auth/signup",
    SIGNOUT: "/api/auth/signout",
    SESSION: "/api/auth/session",
  },
  USER: {
    PROFILE: "/api/user/profile",
    ACCESS: "/api/user/access",
    TICKETS: "/api/user/tickets",
  },
  EVENTS: {
    LIST: "/api/events",
    DETAILS: (id: string) => `/api/events/${id}`,
  },
  TICKETS: {
    PURCHASE: "/api/tickets/purchase",
    LIST: "/api/tickets",
  },
  CONTACT: "/api/contact",
} as const;

export const STORAGE_KEYS = {
  FPS_CONTROLS: "fps-controls-config",
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;
