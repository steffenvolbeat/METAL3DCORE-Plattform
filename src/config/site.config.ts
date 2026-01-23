// 🎸 Metal3DCore Platform - Site Configuration
// Zentrale Konfiguration für Site-Metadata und Settings

 // src/config/site.config.ts
 
export const siteConfig = {
  name: "Metal3DCore Platform",
  shortName: "M3DC",
  description:
    "The 3D Core of Metal Culture. Immersive virtual metal experience with 3D rooms, live events, ticket system, and community features.",
  url: "http://localhost:3001",
  version: "2.3.1-testing",

  // Project Info
  project: {
    startDate: "2025-01-01",
    presentationDate: "2025-02-14",
    presentationTime: "15-20 min",
    presentationPlatform: "Google Meet",
  },

  // Social Links
  social: {
    github: "https://github.com/steffenvolbeat/Test_3DFinal_Projekt-Fullstack",
  },

  // Features
  features: {
    auth: true,
    tickets: true,
    events: true,
    chat: true,
    admin: true,
    darkMode: false,
    i18n: false,
    threeD: true,
  },

  // User Roles
  userRoles: {
    FAN: "FAN",
    VIP_FAN: "VIP_FAN",
    BAND: "BAND",
    ADMIN: "ADMIN",
    MODERATOR: "MODERATOR",
  },

  // 3D Rooms
  rooms: [
    { id: "welcome", name: "Welcome Stage", path: "/", requiresAuth: false },
    {
      id: "stadion",
      name: "Stadion",
      path: "/rooms/stadion",
      requiresAuth: false,
    },
    {
      id: "gallery",
      name: "Band Gallery",
      path: "/rooms/gallery",
      requiresAuth: false,
    },
    {
      id: "community",
      name: "Community",
      path: "/rooms/community",
      requiresAuth: true,
    },
    {
      id: "backstage",
      name: "Backstage",
      path: "/rooms/backstage",
      requiresAuth: true,
      requiresVIP: true,
    },
    {
      id: "contact",
      name: "Contact",
      path: "/rooms/contact",
      requiresAuth: false,
    },
    {
      id: "tickets",
      name: "Tickets",
      path: "/rooms/tickets",
      requiresAuth: false,
    },
  ],

  // Admin
  admin: {
    email: "admin@metal3dcore.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
