// 🎸 Events Feature - TypeScript Types

import { EventStatus } from "@prisma/client";

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
  bandId: string;
  band: {
    id: string;
    name: string;
    genre: string | null;
    image: string | null;
  };
}

export interface EventFilters {
  bandId?: string;
  city?: string;
  status?: EventStatus;
  startDate?: Date;
  endDate?: Date;
}

export { EventStatus };
