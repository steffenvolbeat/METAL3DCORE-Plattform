// 🎸 Events Service
// Event Management

import { get, post, put, del } from "@/shared/services/api.service";
import type { Event } from "@/shared/types";

export interface EventFilters {
  status?: string;
  venueId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EventsResponse {
  events: Event[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Alle Events abrufen
 */
export async function getEvents(
  filters?: EventFilters
): Promise<EventsResponse> {
  return get<EventsResponse>("/api/events", { params: filters as any });
}

/**
 * Event-Details abrufen
 */
export async function getEventById(id: string): Promise<Event> {
  return get<Event>(`/api/events/${id}`);
}

/**
 * Event erstellen (Admin)
 */
export async function createEvent(data: Partial<Event>): Promise<Event> {
  return post<Event>("/api/events", data);
}

/**
 * Event aktualisieren (Admin)
 */
export async function updateEvent(
  id: string,
  data: Partial<Event>
): Promise<Event> {
  return put<Event>(`/api/events/${id}`, data);
}

/**
 * Event löschen (Admin)
 */
export async function deleteEvent(id: string): Promise<void> {
  return del(`/api/events/${id}`);
}

/**
 * Kommende Events
 */
export async function getUpcomingEvents(limit: number = 10): Promise<Event[]> {
  const response = await getEvents({
    status: "PUBLISHED",
    limit,
    page: 1,
  });
  return response.events;
}
