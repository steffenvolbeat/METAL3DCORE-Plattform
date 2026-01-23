// 🎸 useEvents Hook
// Custom Hook für Event Management

import { useState, useEffect, useCallback } from "react";
import type { Event, EventFilters } from "../types/event.types";

interface UseEventsReturn {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
}

export function useEvents(initialFilters?: EventFilters): UseEventsReturn {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (filters?: EventFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.bandId) queryParams.append("bandId", filters.bandId);
      if (filters?.city) queryParams.append("city", filters.city);
      if (filters?.status) queryParams.append("status", filters.status);

      const response = await fetch(`/api/events?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch events");

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getEventById = useCallback(
    (id: string) => events.find((event) => event.id === id),
    [events]
  );

  useEffect(() => {
    fetchEvents(initialFilters);
  }, [fetchEvents, initialFilters]);

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    getEventById,
  };
}
