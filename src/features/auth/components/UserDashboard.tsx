"use client";

// 🎸 3DMetal Platform - User Dashboard für Zugänge und Tickets
// Zeigt aktuelle Zugänge und verfügbare Tickets

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserRole, TicketType } from "@prisma/client";

interface UserAccess {
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
  tickets: {
    id: string;
    type: TicketType;
    eventName: string;
    purchasedAt: Date;
  }[];
}

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  venue: string;
  city: string;
  band: {
    name: string;
    genre?: string;
  };
  basicTicketPrice: number;
  standardTicketPrice: number;
  vipTicketPrice: number;
  availableTickets: number | null;
}

interface TicketOption {
  type: TicketType;
  name: string;
  description: string;
  price: number;
  features: string[];
  grantedAccess: {
    vip: boolean;
    premium: boolean;
    backstage: boolean;
  };
}

export function UserDashboard() {
  const { data: session, status } = useSession();
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingTicket, setDeletingTicket] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchUserAccess();
      fetchEvents();
    }
  }, [session, status]);

  const fetchUserAccess = async () => {
    try {
      const response = await fetch("/api/user/access");
      if (response.ok) {
        const data = await response.json();
        setUserAccess(data.user);
      } else {
        setError("Fehler beim Laden der Benutzerdaten");
      }
    } catch (error) {
      setError("Netzwerk Fehler");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        if (data.events?.length > 0) {
          setSelectedEvent(data.events[0].id);
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden der Events:", error);
    }
  };

  const handlePurchaseTicket = async (ticketType: TicketType) => {
    if (!selectedEvent) {
      alert("❌ Bitte wählen Sie ein Event aus!");
      return;
    }

    try {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.toString(),
          ticketType,
          quantity: 1,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        fetchUserAccess(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`❌ Fehler: ${errorData.error}`);
      }
    } catch (error) {
      alert("❌ Netzwerk Fehler beim Ticket-Kauf");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("🗑️ Möchten Sie dieses Ticket wirklich löschen?")) {
      return;
    }

    setDeletingTicket(ticketId);
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("✅ Ticket erfolgreich gelöscht");
        fetchUserAccess(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`❌ Fehler: ${errorData.error}`);
      }
    } catch (error) {
      alert("❌ Netzwerk Fehler beim Löschen");
    } finally {
      setDeletingTicket(null);
    }
  };

  const getTicketPriceForEvent = (ticketType: TicketType) => {
    const event = events.find((e) => e.id === selectedEvent);
    if (!event) return 0;

    switch (ticketType) {
      case "STANDARD":
        return Number(event.basicTicketPrice);
      case "STANDARD":
        return Number(event.standardTicketPrice);
      case "VIP":
        return Number(event.vipTicketPrice);
      default:
        return 0;
    }
  };

  const getTicketName = (ticketType: TicketType) => {
    switch (ticketType) {
      case "STANDARD":
        return "🎫 Basic Ticket";
      case "STANDARD":
        return "🎟️ Standard Ticket";
      case "VIP":
        return "👑 VIP Fan Ticket";
      default:
        return "Ticket";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">
          Bitte melden Sie sich an, um Ihre Zugänge zu sehen.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!userAccess) {
    return null;
  }

  const getAccessLevel = () => {
    if ((userAccess.role as string) === "BAND") return "🎸 Band - Vollzugang";
    if (userAccess.hasVIPAccess) return "👑 VIP Zugang";
    if (userAccess.hasPremiumAccess) return "⭐ Premium Zugang";
    return "🎫 Basic Zugang";
  };

  const getAccessColor = () => {
    if ((userAccess.role as string) === "BAND")
      return "from-purple-500 to-pink-500";
    if (userAccess.hasVIPAccess) return "from-yellow-500 to-orange-500";
    if (userAccess.hasPremiumAccess) return "from-blue-500 to-purple-500";
    return "from-gray-500 to-gray-600";
  };

  const canPurchaseTicket = (ticketType: TicketType) => {
    // Band members don't need to buy tickets
    if (userAccess?.role === "BAND") return false;

    // Check if user already has this level of access
    switch (ticketType) {
      case "STANDARD":
        return true; // Can always buy basic
      case "STANDARD":
        return !userAccess?.hasPremiumAccess && !userAccess?.hasVIPAccess;
      case "VIP":
        return !userAccess?.hasVIPAccess;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* User Header */}
      <div
        className={`backdrop-blur-xl bg-gradient-to-r ${getAccessColor()} p-8 rounded-2xl text-white shadow-2xl border-2 border-white/20 relative overflow-hidden`}
      >
        {/* Decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/50 via-white/80 to-white/50"></div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">
              {getAccessLevel()}
            </h1>
            <div className="space-y-2">
              <p className="text-xl opacity-90 font-medium">
                {userAccess.name} (@{userAccess.username})
              </p>
              <p className="opacity-75 text-base">{userAccess.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl mb-3 animate-float">
              {(userAccess.role as string) === "BAND" ? "🎸" : "🤘"}
            </div>
            <div className="text-sm opacity-75 font-medium">
              {userAccess.role === "FAN" ? "Metal Fan" : "Band Member"}
            </div>
          </div>
        </div>
      </div>

      {/* Current Access Rights */}
      <div className="backdrop-blur-xl bg-black/90 rounded-2xl p-8 shadow-2xl border-2 border-theme-primary/30 relative overflow-hidden">
        {/* Decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent"></div>

        <h2 className="text-2xl font-bold bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-6 flex items-center pt-2">
          🔑 Ihre aktuellen Zugänge
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Concert Access */}
          <div
            className={`p-5 rounded-xl border-2 transition-all duration-300 ${
              (userAccess.role as string) === "BAND" ||
              userAccess.tickets.length > 0
                ? "border-green-400/50 bg-gradient-to-br from-green-500/20 to-emerald-500/20 shadow-lg shadow-green-500/20"
                : "border-white/20 bg-white/5"
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🎤</div>
              <div className="font-medium text-sm text-white">
                Konzert-Zugang
              </div>
              <div
                className={`text-xs mt-2 font-semibold ${
                  (userAccess.role as string) === "BAND" ||
                  userAccess.tickets.length > 0
                    ? "text-green-400"
                    : "text-gray-500"
                }`}
              >
                {(userAccess.role as string) === "BAND" ||
                userAccess.tickets.length > 0
                  ? "✅ Verfügbar"
                  : "❌ Benötigt Ticket"}
              </div>
            </div>
          </div>

          {/* Premium Access */}
          <div
            className={`p-5 rounded-xl border-2 transition-all duration-300 ${
              userAccess.hasPremiumAccess
                ? "border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/20"
                : "border-white/20 bg-white/5"
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-medium text-sm text-white">
                Premium Bereich
              </div>
              <div
                className={`text-xs mt-2 font-semibold ${
                  userAccess.hasPremiumAccess
                    ? "text-blue-400"
                    : "text-gray-500"
                }`}
              >
                {userAccess.hasPremiumAccess
                  ? "✅ Verfügbar"
                  : "❌ Standard+ Ticket"}
              </div>
            </div>
          </div>

          {/* VIP Access */}
          <div
            className={`p-5 rounded-xl border-2 transition-all duration-300 ${
              userAccess.hasVIPAccess
                ? "border-yellow-400/50 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 shadow-lg shadow-yellow-500/20"
                : "border-white/20 bg-white/5"
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">👑</div>
              <div className="font-medium text-sm text-white">VIP Lounge</div>
              <div
                className={`text-xs mt-2 font-semibold ${
                  userAccess.hasVIPAccess ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                {userAccess.hasVIPAccess ? "✅ Verfügbar" : "❌ VIP Ticket"}
              </div>
            </div>
          </div>

          {/* Backstage Access */}
          <div
            className={`p-5 rounded-xl border-2 transition-all duration-300 ${
              userAccess.hasBackstageAccess
                ? "border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20"
                : "border-white/20 bg-white/5"
            }`}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🎭</div>
              <div className="font-medium text-sm text-white">Backstage</div>
              <div
                className={`text-xs mt-2 font-semibold ${
                  userAccess.hasBackstageAccess
                    ? "text-purple-400"
                    : "text-gray-500"
                }`}
              >
                {userAccess.hasBackstageAccess ? "✅ Verfügbar" : "❌ VIP/Band"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Tickets */}
      {userAccess.tickets.length > 0 && (
        <div className="backdrop-blur-xl bg-black/90 rounded-2xl p-8 shadow-2xl border-2 border-theme-primary/30 relative overflow-hidden">
          {/* Decorative gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent"></div>

          <h2 className="text-2xl font-bold bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-6 flex items-center pt-2">
            🎫 Ihre gekauften Tickets
          </h2>
          <div className="space-y-4">
            {userAccess.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex justify-between items-center p-5 backdrop-blur-sm bg-white/5 rounded-xl border-2 border-white/20 hover:bg-white/10 hover:border-theme-primary/40 transition-all duration-300"
              >
                <div className="flex-1">
                  <div className="font-semibold text-white text-lg">
                    {ticket.eventName}
                  </div>
                  <div className="text-sm text-gray-300">
                    {getTicketName(ticket.type)} - gekauft am{" "}
                    {new Date(ticket.purchasedAt).toLocaleDateString("de-DE")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-green-400 font-bold text-sm px-4 py-2 bg-green-500/20 rounded-lg border border-green-400/30">
                    ✓ Aktiv
                  </div>
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    disabled={deletingTicket === ticket.id}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 font-bold text-sm rounded-lg border border-red-400/30 hover:border-red-400/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingTicket === ticket.id ? "⏳" : "🗑️ Löschen"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Tickets to Purchase */}
      {userAccess.canBuyTickets &&
        userAccess.role === "FAN" &&
        events.length > 0 && (
          <div className="backdrop-blur-xl bg-black/90 rounded-2xl p-8 shadow-2xl border-2 border-theme-primary/30 relative overflow-hidden">
            {/* Decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-primary via-theme-secondary to-theme-accent"></div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-6 flex items-center pt-2">
              🛒 Tickets kaufen
            </h2>

            {/* Event Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent mb-2">
                Event auswählen:
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-primary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
              >
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {event.band.name} (
                    {new Date(event.startDate).toLocaleDateString("de-DE")})
                  </option>
                ))}
              </select>

              {selectedEvent && (
                <div className="mt-4 p-4 backdrop-blur-sm bg-white/5 rounded-xl border-2 border-white/20">
                  {(() => {
                    const event = events.find((e) => e.id === selectedEvent);
                    return event ? (
                      <div>
                        <div className="font-semibold text-white text-lg mb-2">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-300 mb-1">
                          🎸 {event.band.name}{" "}
                          {event.band.genre && `(${event.band.genre})`}
                        </div>
                        <div className="text-sm text-gray-300 mb-1">
                          📍 {event.venue}, {event.city} • 📅{" "}
                          {new Date(event.startDate).toLocaleDateString(
                            "de-DE",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                        {event.availableTickets !== null && (
                          <div className="text-sm text-theme-primary font-semibold">
                            🎫 Noch {event.availableTickets} Tickets verfügbar
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Basic Ticket */}
              <div
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  !canPurchaseTicket("STANDARD")
                    ? "border-white/20 bg-white/5 opacity-50"
                    : "border-orange-400/50 bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-105"
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    🎫 Basic Ticket
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Grundzugang zum Event
                  </p>
                  <div className="text-3xl font-bold text-orange-400">
                    CHF {getTicketPriceForEvent("STANDARD")}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Event Zugang</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Standard Bereich</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseTicket("STANDARD")}
                  disabled={!canPurchaseTicket("STANDARD")}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                    canPurchaseTicket("STANDARD")
                      ? "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white transform hover:scale-105 shadow-lg shadow-orange-500/50"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canPurchaseTicket("STANDARD")
                    ? "Jetzt kaufen"
                    : (userAccess.role as string) === "BAND"
                    ? "Band Vollzugang"
                    : "Bereits verfügbar"}
                </button>
              </div>

              {/* Standard Ticket */}
              <div
                className={`p-6 rounded-lg border-2 ${
                  !canPurchaseTicket("STANDARD")
                    ? "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 opacity-50"
                    : "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-500"
                } transition-all`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    🎟️ Standard Ticket
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Erweiterte Bereiche
                  </p>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    CHF {getTicketPriceForEvent("STANDARD")}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Event Zugang
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Premium Bereich
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      Bessere Sicht
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseTicket("STANDARD")}
                  disabled={!canPurchaseTicket("STANDARD")}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                    canPurchaseTicket("STANDARD")
                      ? "bg-blue-500 hover:bg-blue-600 text-white transform hover:scale-105"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {canPurchaseTicket("STANDARD")
                    ? "Jetzt kaufen"
                    : (userAccess.role as string) === "BAND"
                    ? "Band Vollzugang"
                    : "Bereits verfügbar"}
                </button>
              </div>

              {/* VIP Ticket */}
              <div
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  !canPurchaseTicket("VIP")
                    ? "border-white/20 bg-white/5 opacity-50"
                    : "border-yellow-400/50 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105"
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    👑 VIP Fan Ticket
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Vollzugang für Fans
                  </p>
                  <div className="text-3xl font-bold text-yellow-400">
                    CHF {getTicketPriceForEvent("VIP")}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">VIP Lounge</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Backstage Tour</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Meet & Greet</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-green-400 mr-2">✓</span>
                    <span className="text-gray-300">Premium Bereich</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseTicket("VIP")}
                  disabled={!canPurchaseTicket("VIP")}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                    canPurchaseTicket("VIP")
                      ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white transform hover:scale-105 shadow-lg shadow-yellow-500/50"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {canPurchaseTicket("VIP")
                    ? "Jetzt kaufen"
                    : (userAccess.role as string) === "BAND"
                    ? "Band Vollzugang"
                    : "Bereits verfügbar"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Band Member Message */}
      {(userAccess.role as string) === "BAND" && (
        <div className="backdrop-blur-xl bg-gradient-to-r from-theme-secondary via-theme-accent to-theme-primary p-8 rounded-2xl text-white text-center shadow-2xl border-2 border-white/30 relative overflow-hidden">
          {/* Decorative gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-white/50 via-white/80 to-white/50"></div>

          <div className="text-5xl mb-4 animate-float">🎸</div>
          <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">
            Du hast bereits Vollzugang!
          </h3>
          <p className="text-lg opacity-90">
            Als Band Member hast du automatisch Zugang zu allen Bereichen,
            inklusive VIP Lounge, Backstage und allen Events.
          </p>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
