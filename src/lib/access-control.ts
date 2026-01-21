// 🎸 3DMetal Platform - Access Control System
// Basierend auf User Role und Ticket Type

import { User, UserRole, Ticket, TicketType } from "@prisma/client";

export interface AccessRights {
  canAccessConcert: boolean;
  canAccessPremium: boolean;
  canAccessVIP: boolean;
  canAccessBackstage: boolean;
  canAccessStadiumArena: boolean;
  canAccessComingSoon: boolean;
  canBuyTickets: boolean;
  hasFullAccess: boolean;
}

/**
 * 🎫 Bestimme Zugangsrechte basierend auf User Role und Tickets
 */
export function calculateAccessRights(
  user: User & { tickets?: Ticket[] }
): AccessRights {
  // 🎗️ BENEFIZ USERS: Freier Zugang zu allen Räumen/Arenen, KEIN ComingSoon
  if (user.role === UserRole.BENEFIZ) {
    return {
      canAccessConcert: true,
      canAccessPremium: true,
      canAccessVIP: true,
      canAccessBackstage: true,
      canAccessStadiumArena: true,
      canAccessComingSoon: false, // KEIN Zugang zur ComingSoonPage
      canBuyTickets: false,
      hasFullAccess: true,
    };
  }

  // 🎸 BAND MEMBERS: Überall freier Zugang, KEIN ComingSoon
  if (user.role === UserRole.BAND) {
    return {
      canAccessConcert: true,
      canAccessPremium: true,
      canAccessVIP: true,
      canAccessBackstage: true,
      canAccessStadiumArena: true,
      canAccessComingSoon: false, // KEIN Zugang zur ComingSoonPage
      canBuyTickets: false, // Bands brauchen keine Tickets
      hasFullAccess: true,
    };
  }

  // 👑 ADMIN: Vollzugang inkl. ComingSoon
  if (user.role === UserRole.ADMIN) {
    return {
      canAccessConcert: true,
      canAccessPremium: true,
      canAccessVIP: true,
      canAccessBackstage: true,
      canAccessStadiumArena: true,
      canAccessComingSoon: true,
      canBuyTickets: false,
      hasFullAccess: true,
    };
  }

  // 🎫 FAN ACCESS: Müssen Tickets kaufen für Backstage & Stadion Arena
  if (user.role === UserRole.FAN || user.role === UserRole.VIP_FAN) {
    // Prüfe aktive Tickets für Berechtigung
    const activeTickets =
      user.tickets?.filter((t) => t.status === "ACTIVE") || [];

    // Standardzugang für Fans: Nur öffentliche Bereiche
    let accessRights: AccessRights = {
      canAccessConcert: true, // Konzerte sind öffentlich für Fans
      canAccessPremium: true, // Premium-Bereiche öffentlich
      canAccessVIP: false,
      canAccessBackstage: false, // Braucht Ticket
      canAccessStadiumArena: false, // Braucht Ticket
      canAccessComingSoon: true, // Fans haben ComingSoon Zugang
      canBuyTickets: true,
      hasFullAccess: false,
    };

    // Berechne höchste verfügbare Berechtigung durch Tickets
    for (const ticket of activeTickets) {
      switch (ticket.type) {
        case TicketType.BACKSTAGE:
          // 🔐 BACKSTAGE: Vollzugang zu allen Bereichen
          accessRights.canAccessVIP = true;
          accessRights.canAccessBackstage = true;
          accessRights.canAccessStadiumArena = true;
          accessRights.hasFullAccess = true;
          break;

        case TicketType.VIP:
          // 👑 VIP: Zugang zu VIP + Stadion Arena (aber nicht Backstage)
          accessRights.canAccessVIP = true;
          accessRights.canAccessStadiumArena = true;
          break;

        case TicketType.STANDARD:
          // 🎵 STANDARD: Zugang zu Stadion Arena (Concert + Premium Access)
          accessRights.canAccessStadiumArena = true;
          break;
      }
    }

    return accessRights;
  }

  // 🚫 FALLBACK: Gastzugang ohne Login
  return {
    canAccessConcert: true, // Öffentlich für alle
    canAccessPremium: true, // Öffentlich für alle
    canAccessVIP: false,
    canAccessBackstage: false,
    canAccessStadiumArena: false,
    canAccessComingSoon: true,
    canBuyTickets: true,
    hasFullAccess: false,
  };
}

/**
 * 🔒 Prüfe ob User Zugang zu bestimmtem Bereich hat
 */
export function checkAccess(
  user: User & { tickets?: Ticket[] },
  requiredArea:
    | "concert"
    | "premium"
    | "vip"
    | "backstage"
    | "stadiumArena"
    | "comingSoon"
): boolean {
  const rights = calculateAccessRights(user);

  switch (requiredArea) {
    case "concert":
      return rights.canAccessConcert;
    case "premium":
      return rights.canAccessPremium;
    case "vip":
      return rights.canAccessVIP;
    case "backstage":
      return rights.canAccessBackstage;
    case "stadiumArena":
      return rights.canAccessStadiumArena;
    case "comingSoon":
      return rights.canAccessComingSoon;
    default:
      return false;
  }
}

/**
 * 🎫 Ticket Pricing basierend auf Type (Echte Preise)
 */
export const TICKET_PRICES = {
  [TicketType.STANDARD]: 45.0, // Standard Zugang (CHF)
  [TicketType.VIP]: 89.0, // VIP + Stadion Arena (CHF)
  [TicketType.BACKSTAGE]: 150.0, // Vollzugang inkl. Backstage (CHF)
  [TicketType.BAND_PASS]: 0.0, // Kostenlos für Band Members
  [TicketType.ADMIN_PASS]: 0.0, // Kostenlos für Admins
} as const;

/**
 * 🎫 Formatierte Preisanzeige mit CHF
 */
export function formatTicketPrice(ticketType: TicketType): string {
  const price = TICKET_PRICES[ticketType];
  return price === 0 ? "Kostenlos" : `CHF ${price.toFixed(2)}`;
}

/**
 * 📋 Ticket Beschreibungen für Frontend
 */
export const TICKET_DESCRIPTIONS = {
  [TicketType.STANDARD]: {
    name: "Standard Ticket",
    description: "Zugang zum Hallenstadion und Concert-Bereichen",
    features: ["🎤 Konzert-Zugang", "⭐ Premium Bereich", "🏟️ Hallenstadion"],
    price: TICKET_PRICES[TicketType.STANDARD],
  },
  [TicketType.VIP]: {
    name: "VIP Ticket",
    description: "VIP Bereich + Stadion Arena Zugang",
    features: [
      "🎤 Konzert-Zugang",
      "⭐ Premium Bereich",
      "👑 VIP Bereich",
      "🏟️ Stadion Arena",
    ],
    price: TICKET_PRICES[TicketType.VIP],
  },
  [TicketType.BACKSTAGE]: {
    name: "Backstage Pass",
    description: "VOLLZUGANG zu allen Bereichen inkl. Backstage",
    features: [
      "🎤 Konzert-Zugang",
      "⭐ Premium Bereich",
      "👑 VIP Bereich",
      "🏟️ Stadion Arena",
      "🎸 Backstage-Zugang",
    ],
    price: TICKET_PRICES[TicketType.BACKSTAGE],
  },
} as const;

/**
 * 🏷️ User Role Descriptions
 */
export const USER_ROLE_DESCRIPTIONS = {
  [UserRole.FAN]: {
    name: "Fan",
    description: "Normale User - können Tickets kaufen",
    defaultAccess: "Öffentliche Bereiche + ComingSoon",
  },
  [UserRole.BENEFIZ]: {
    name: "Benefiz",
    description: "Wohltätigkeitsorganisation",
    defaultAccess: "Alle Bereiche außer ComingSoon",
  },
  [UserRole.BAND]: {
    name: "Band Member",
    description: "Künstler/Band - Vollzugang außer ComingSoon",
    defaultAccess: "Alle Bereiche außer ComingSoon",
  },
  [UserRole.VIP_FAN]: {
    name: "VIP Fan",
    description: "Premium Fan Status",
    defaultAccess: "Wie normale Fans + erweiterte Features",
  },
  [UserRole.ADMIN]: {
    name: "Administrator",
    description: "System Administrator - Vollzugang",
    defaultAccess: "Vollzugang zu allen Bereichen",
  },
} as const;
