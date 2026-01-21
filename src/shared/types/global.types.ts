// 🎸 Metal3DCore Platform - Global TypeScript Types
// Zentrale Type Definitionen für die gesamte App

import { UserRole, TicketType, EventStatus } from "@prisma/client";

// ==========================================
// USER TYPES
// ==========================================

export interface User {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: UserRole;
  image: string | null;
  verified: boolean;
  hasVIPAccess: boolean;
  hasPremiumAccess: boolean;
  hasBackstageAccess: boolean;
  hasFullAccess: boolean;
  canBuyTickets: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAccess {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  hasVIPAccess: boolean;
  hasPremiumAccess: boolean;
  hasBackstageAccess: boolean;
  hasFullAccess: boolean;
  canBuyTickets: boolean;
  tickets: UserTicket[];
}

export interface UserTicket {
  id: string;
  type: TicketType;
  eventName: string;
  purchasedAt: Date;
}

// ==========================================
// EVENT TYPES
// ==========================================

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  venue: string;
  city: string;
  country: string;
  basicTicketPrice: number;
  standardTicketPrice: number;
  vipTicketPrice: number;
  availableTickets: number | null;
  status: EventStatus;
  band: {
    id: string;
    name: string;
    genre: string | null;
    image: string | null;
  };
}

// ==========================================
// TICKET TYPES
// ==========================================

export interface Ticket {
  id: string;
  type: TicketType;
  price: number;
  qrCode: string | null;
  pdfUrl: string | null;
  validated: boolean;
  purchasedAt: Date;
  event: Event;
}

export interface TicketPurchaseRequest {
  eventId: string;
  ticketType: TicketType;
  quantity: number;
}

// ==========================================
// 3D ROOM TYPES
// ==========================================

export interface Room {
  id: string;
  name: string;
  path: string;
  requiresAuth: boolean;
  requiresVIP?: boolean;
  requiresRole?: UserRole;
}

export interface RoomNavigationProps {
  activeRoom: string;
  onRoomChange: (room: string) => void;
  isFullscreen: boolean;
}

// ==========================================
// CHAT TYPES
// ==========================================

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  receiverId: string | null;
  roomId: string | null;
  createdAt: Date;
}

export interface ChatUser {
  id: string;
  username: string;
  online: boolean;
}

// ==========================================
// PAGINATION TYPES
// ==========================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// FORM TYPES
// ==========================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  email: string;
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
