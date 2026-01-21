// 🎸 useTickets Hook
// Custom Hook für Ticket Management

import { useState, useEffect, useCallback } from "react";
import type {
  Ticket,
  TicketPurchaseRequest,
  TicketPurchaseResponse,
} from "../types/ticket.types";

interface UseTicketsReturn {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
  purchaseTicket: (
    request: TicketPurchaseRequest
  ) => Promise<TicketPurchaseResponse>;
  refreshTickets: () => Promise<void>;
}

export function useTickets(): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/user/tickets");
      if (!response.ok) throw new Error("Failed to fetch tickets");

      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const purchaseTicket = useCallback(
    async (request: TicketPurchaseRequest): Promise<TicketPurchaseResponse> => {
      try {
        const response = await fetch("/api/tickets/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            success: false,
            error: data.error || "Ticket purchase failed",
          };
        }

        // Refresh tickets after purchase
        await fetchTickets();

        return {
          success: true,
          ticket: data.ticket,
          message: data.message || "Ticket erfolgreich gekauft",
        };
      } catch (error) {
        return {
          success: false,
          error: "Network error during ticket purchase",
        };
      }
    },
    [fetchTickets]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    isLoading,
    error,
    purchaseTicket,
    refreshTickets: fetchTickets,
  };
}
