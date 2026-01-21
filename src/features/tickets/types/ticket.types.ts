// 🎸 Tickets Feature - TypeScript Types

import { TicketType, EventStatus } from "@prisma/client";

export interface Ticket {
  id: string;
  type: TicketType;
  price: number;
  qrCode: string | null;
  pdfUrl: string | null;
  validated: boolean;
  purchasedAt: Date;
  eventId: string;
  userId: string;
}

export interface TicketPurchaseRequest {
  eventId: string;
  ticketType: TicketType;
  quantity: number;
}

export interface TicketPurchaseResponse {
  success: boolean;
  ticket?: Ticket;
  message?: string;
  error?: string;
}

export { TicketType, EventStatus };
