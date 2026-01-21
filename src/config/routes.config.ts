// 🎸 Metal3DCore Platform - Routes Configuration
// Zentrale Definition aller App-Routen

// src/config/routes.config.ts


export const routes = {
  // Public Routes
  public: {
    home: "/",
    intro: "/intro",
  },

  // Auth Routes
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    signout: "/auth/signout",
  },

  // User Routes
  user: {
    dashboard: "/dashboard",
    profile: "/profile",
    tickets: "/tickets",
  },

  // Admin Routes
  admin: {
    dashboard: "/admin",
    comingSoon: "/admin/coming-soon",
    users: "/admin/users",
    events: "/admin/events",
    tickets: "/admin/tickets",
  },

  // 3D Rooms Routes
  rooms: {
    welcome: "/",
    stadion: "/rooms/stadion",
    gallery: "/rooms/gallery",
    community: "/rooms/community",
    backstage: "/rooms/backstage",
    contact: "/rooms/contact",
    tickets: "/rooms/tickets",
  },

  // API Routes
  api: {
    auth: {
      signIn: "/api/auth/signin",
      signUp: "/api/auth/signup",
      signOut: "/api/auth/signout",
    },
    user: {
      profile: "/api/user/profile",
      tickets: "/api/user/tickets",
    },
    events: {
      list: "/api/events",
      details: "/api/events/:id",
    },
    tickets: {
      purchase: "/api/tickets/purchase",
      list: "/api/tickets",
    },
    contact: {
      send: "/api/contact",
    },
  },
} as const;

export type Routes = typeof routes;

// Helper function to check if route requires authentication
export const requiresAuth = (path: string): boolean => {
  const protectedPaths = [
    routes.user.dashboard,
    routes.user.profile,
    routes.user.tickets,
    routes.admin.dashboard,
    routes.rooms.community,
    routes.rooms.backstage,
  ];

  return protectedPaths.some((protectedPath) => path.startsWith(protectedPath));
};

// Helper function to check if route requires admin access
export const requiresAdmin = (path: string): boolean => {
  const adminPaths = Object.values(routes.admin);
  return adminPaths.some((adminPath) => path.startsWith(adminPath));
};
