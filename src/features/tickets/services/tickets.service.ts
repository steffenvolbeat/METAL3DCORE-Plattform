// 🎸 Tickets Service
// Ticket Purchase & Management

import { get, post } from "@/shared/services/api.service";
import type { Ticket, Event } from "@/shared/types";

export interface PurchaseTicketData {
  eventId: string;
  ticketType: "STANDARD" | "STANDARD" | "VIP";
  quantity: number;
}

export interface TicketPurchaseResponse {
  ticket: Ticket;
  paymentUrl?: string;
}

/**
 * Ticket kaufen
 */
export async function purchaseTicket(
  data: PurchaseTicketData
): Promise<TicketPurchaseResponse> {
  return post<TicketPurchaseResponse>("/api/tickets/purchase", data);
}

/**
 * Meine Tickets abrufen
 */
export async function getUserTickets(): Promise<Ticket[]> {
  return get<Ticket[]>("/api/user/tickets");
}

/**
 * Ticket-Details abrufen
 */
export async function getTicketById(id: string): Promise<Ticket> {
  return get<Ticket>(`/api/tickets/${id}`);
}

/**
 * Ticket validieren (QR-Code Scan)
 */
export async function validateTicket(
  ticketId: string,
  code: string
): Promise<{
  valid: boolean;
  ticket?: Ticket;
  message?: string;
}> {
  return post(`/api/tickets/${ticketId}/validate`, { code });
}

/**
 * Verfügbare Tickets für Event prüfen
 */
export async function checkTicketAvailability(eventId: string): Promise<{
  basic: number;
  standard: number;
  vip: number;
}> {
  return get(`/api/events/${eventId}/availability`);
}
