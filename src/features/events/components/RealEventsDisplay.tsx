"use client";

// 🎸 3DMetal Platform - Real Events Display
// Zeigt echte Metal Events und Bands an

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Band {
  id: string;
  name: string;
  genre: string;
  description: string;
  verified: boolean;
  foundedYear: number;
  website?: string;
  youtubeChannel?: string;
  spotifyUrl?: string;
  instagramUrl?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  venue: string;
  city: string;
  country: string;
  maxCapacity: number;
  basicTicketPrice: number;
  standardTicketPrice: number;
  vipTicketPrice: number;
  status: string;
  band: Band;
}

export function RealEventsDisplay() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRealEvents();
  }, []);

  const fetchRealEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      } else {
        setError("Fehler beim Laden der Events");
      }
    } catch (err) {
      setError("Netzwerk-Fehler");
    } finally {
      setLoading(false);
    }
  };

  const handleTicketPurchase = async (
    eventId: string,
    ticketType: string,
    price: number
  ) => {
    if (!session) {
      alert("Bitte melde dich an, um Tickets zu kaufen!");
      return;
    }

    if (session.user.role === "BAND") {
      alert("Als Band Member hast du bereits Vollzugang zu allen Events!");
      return;
    }

    try {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId.toString(),
          ticketType,
          quantity: 1,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`🎫 Ticket erfolgreich gekauft! ${result.message}`);
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (err) {
      alert("Fehler beim Ticket-Kauf");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-white">Lade echte Metal Events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-red-300 mb-2">⚠️ Fehler</h3>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4">
          🎸 Echte Metal Events
        </h2>
        <p className="text-gray-300 text-lg">
          Kommende Konzerte echter Metal Bands in der Schweiz
        </p>
      </div>

      <div className="grid gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6"
          >
            {/* Event Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center space-x-4 text-gray-300">
                  <span className="flex items-center">
                    <span className="text-purple-400 mr-2">🎸</span>
                    {event.band.name}
                    {event.band.verified && (
                      <span className="text-green-400 ml-1">✓</span>
                    )}
                  </span>
                  <span className="flex items-center">
                    <span className="text-blue-400 mr-2">🎵</span>
                    {event.band.genre}
                  </span>
                  <span className="flex items-center">
                    <span className="text-orange-400 mr-2">📅</span>
                    {new Date(event.startDate).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="text-right mt-4 lg:mt-0">
                <div className="text-gray-300">
                  <div className="flex items-center">
                    <span className="text-red-400 mr-2">📍</span>
                    {event.venue}
                  </div>
                  <div className="text-sm text-gray-400">
                    {event.city}, {event.country}
                  </div>
                  <div className="text-sm text-gray-400">
                    Kapazität: {event.maxCapacity} Plätze
                  </div>
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Band Info */}
            <div className="bg-purple-900/30 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-purple-300 mb-2">
                Über {event.band.name}
              </h4>
              <p className="text-gray-300 text-sm mb-3">
                {event.band.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-700/50 px-3 py-1 rounded-full text-xs text-purple-200">
                  Gegründet {event.band.foundedYear}
                </span>
                {event.band.website && (
                  <a
                    href={event.band.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-700/50 px-3 py-1 rounded-full text-xs text-blue-200 hover:bg-blue-600/50 transition-colors"
                  >
                    🌐 Website
                  </a>
                )}
                {event.band.youtubeChannel && (
                  <a
                    href={event.band.youtubeChannel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-700/50 px-3 py-1 rounded-full text-xs text-red-200 hover:bg-red-600/50 transition-colors"
                  >
                    📺 YouTube
                  </a>
                )}
                {event.band.spotifyUrl && (
                  <a
                    href={event.band.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-700/50 px-3 py-1 rounded-full text-xs text-green-200 hover:bg-green-600/50 transition-colors"
                  >
                    🎵 Spotify
                  </a>
                )}
              </div>
            </div>

            {/* Ticket Options */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Basic Ticket */}
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                <h5 className="font-bold text-blue-300 mb-2">
                  🎤 Basic Ticket
                </h5>
                <p className="text-gray-300 text-sm mb-3">Nur Konzert-Zugang</p>
                <div className="text-2xl font-bold text-blue-400 mb-3">
                  {event.basicTicketPrice.toFixed(2)} CHF
                </div>
                <button
                  onClick={() =>
                    handleTicketPurchase(
                      event.id,
                      "STANDARD",
                      event.basicTicketPrice
                    )
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Basic kaufen
                </button>
              </div>

              {/* Standard Ticket */}
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                <h5 className="font-bold text-green-300 mb-2">
                  ⭐ Standard Ticket
                </h5>
                <p className="text-gray-300 text-sm mb-3">
                  Konzert + Premium Bereich
                </p>
                <div className="text-2xl font-bold text-green-400 mb-3">
                  {event.standardTicketPrice.toFixed(2)} CHF
                </div>
                <button
                  onClick={() =>
                    handleTicketPurchase(
                      event.id,
                      "STANDARD",
                      event.standardTicketPrice
                    )
                  }
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Standard kaufen
                </button>
              </div>

              {/* VIP Ticket */}
              <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
                <h5 className="font-bold text-purple-300 mb-2">
                  👑 VIP Fans Ticket
                </h5>
                <p className="text-gray-300 text-sm mb-3">
                  VOLLZUGANG zu allen Bereichen
                </p>
                <div className="text-2xl font-bold text-purple-400 mb-3">
                  {event.vipTicketPrice.toFixed(2)} CHF
                </div>
                <button
                  onClick={() =>
                    handleTicketPurchase(
                      event.id,
                      "VIP",
                      event.vipTicketPrice
                    )
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  VIP kaufen
                </button>
              </div>
            </div>

            {/* Band Member Message */}
            {session?.user.role === "BAND" && (
              <div className="mt-4 bg-purple-600/20 border border-purple-400/50 rounded-lg p-4">
                <div className="flex items-center text-purple-300">
                  <span className="text-2xl mr-3">🎸</span>
                  <div>
                    <p className="font-semibold">Band Member Vollzugang</p>
                    <p className="text-sm text-purple-200">
                      Du hast als Band Member automatisch Zugang zu allen
                      Bereichen dieses Events!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Aktuell keine Events verfügbar.
          </p>
        </div>
      )}
    </div>
  );
}

export default RealEventsDisplay;
