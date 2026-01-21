// 🎸 3DMetal Platform - Real Events API
// API für echte Metal Events und Bands

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Lade alle kommenden Events mit Band-Informationen
    const events = await prisma.event.findMany({
      where: {
        status: 'UPCOMING'
      },
      include: {
        band: {
          select: {
            id: true,
            name: true,
            genre: true,
            description: true,
            verified: true,
            foundedYear: true,
            website: true,
            youtubeChannel: true,
            spotifyUrl: true,
            instagramUrl: true,
            facebookUrl: true
          }
        },
        tickets: {
          where: {
            status: 'ACTIVE'
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    // Berechne verfügbare Tickets für jedes Event
    const eventsWithAvailability = events.map(event => {
      const soldTickets = event.tickets.length;
      const availableTickets = event.maxCapacity ? event.maxCapacity - soldTickets : null;
      
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate?.toISOString(),
        venue: event.venue,
        city: event.city,
        country: event.country,
        maxCapacity: event.maxCapacity,
        basicTicketPrice: event.basicTicketPrice,
        standardTicketPrice: event.standardTicketPrice,
        vipTicketPrice: event.vipTicketPrice,
        youtubeUrl: event.youtubeUrl,
        status: event.status,
        band: event.band,
        soldTickets,
        availableTickets
      };
    });

    return NextResponse.json({
      success: true,
      events: eventsWithAvailability,
      total: events.length
    });

  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Events' },
      { status: 500 }
    );
  }
}

// POST - Erstelle neues Event (nur für Bands)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      venue,
      city,
      country,
      maxCapacity,
      basicTicketPrice,
      standardTicketPrice,
      vipTicketPrice,
      youtubeUrl,
      bandId
    } = body;

    // Validiere Pflichtfelder
    if (!title || !startDate || !venue || !city || !country || !bandId) {
      return NextResponse.json(
        { error: 'Pflichtfelder fehlen' },
        { status: 400 }
      );
    }

    // Erstelle Event
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        venue,
        city,
        country,
        maxCapacity: maxCapacity || null,
        basicTicketPrice: basicTicketPrice || 0,
        standardTicketPrice: standardTicketPrice || 0,
        vipTicketPrice: vipTicketPrice || 0,
        youtubeUrl,
        status: 'UPCOMING',
        bandId
      },
      include: {
        band: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Event erfolgreich erstellt',
      event: newEvent
    });

  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Events' },
      { status: 500 }
    );
  }
}