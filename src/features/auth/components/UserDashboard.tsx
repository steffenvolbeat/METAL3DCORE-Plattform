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
    const event = events.find(e => e.id === selectedEvent);
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
        <p className="text-gray-600 dark:text-gray-400">Bitte melden Sie sich an, um Ihre Zugänge zu sehen.</p>
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
    if ((userAccess.role as string) === "BAND") return "from-purple-500 to-pink-500";
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

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "BAND":
        return "🎸 Band Member";
      case "ADMIN":
        return "👑 Administrator";
      case "VIP_FAN":
        return "⭐ VIP Fan";
      case "BENEFIZ":
        return "💎 Benefiz Supporter";
      default:
        return "🤘 Metal Fan";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "BAND":
        return "from-orange-500 to-red-600";
      case "ADMIN":
        return "from-purple-500 to-indigo-600";
      case "VIP_FAN":
        return "from-yellow-400 to-orange-500";
      case "BENEFIZ":
        return "from-emerald-400 to-cyan-500";
      default:
        return "from-gray-600 to-gray-800";
    }
  };

  const getAccessIcon = (hasAccess: boolean, role: string) => {
    if (role === "BAND" || role === "ADMIN") return "🔓"; // Always access for band/admin
    return hasAccess ? "✅" : "❌";
  };

  const getAccessText = (hasAccess: boolean, role: string, requiredLevel: string) => {
    if (role === "BAND") return "Band Zugang";
    if (role === "ADMIN") return "Admin Zugang";
    return hasAccess ? "Verfügbar" : `Benötigt ${requiredLevel}`;
  };

  return (
    <div className="p-8 space-y-10">
      {/* User Header - Komplett überarbeitet */}
      <div
        className={`bg-gradient-to-r ${getRoleColor(userAccess.role)} rounded-2xl p-8 shadow-2xl border border-white/20`}
      >
        <div className="grid md:grid-cols-3 gap-6 items-center">
          {/* Role Icon */}
          <div className="text-center md:text-left">
            <div className="w-20 h-20 mx-auto md:mx-0 bg-white/20 rounded-full flex items-center justify-center text-4xl mb-4">
              {userAccess.role === "BAND" ? "🎸" : userAccess.role === "ADMIN" ? "👑" : "🤘"}
            </div>
            <p className="text-sm opacity-75 font-mono">Metal3DCore Platform</p>
          </div>

          {/* User Info */}
          <div className="md:col-span-2 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{getRoleDisplayName(userAccess.role)}</h1>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {userAccess.name} (@{userAccess.username})
              </p>
              <p className="opacity-80">{userAccess.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Access Grid - Modernisiert */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-10">
          🔐 Zugangsberechtigungen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Concert Access */}
          <div
            className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 text-center transform hover:scale-105 hover:shadow-xl ${
              userAccess.role === "BAND" || userAccess.role === "ADMIN" || userAccess.tickets.length > 0
                ? "border-green-500/50 hover:border-green-400 hover:shadow-green-500/20"
                : "border-red-500/50 hover:border-red-400 hover:shadow-red-500/20"
            }`}
          >
            <div className="text-4xl mb-3">🎤</div>
            <h3 className="font-bold text-white mb-3">Konzert-Zugang</h3>
            <div
              className={`text-2xl mb-2 ${
                userAccess.role === "BAND" || userAccess.role === "ADMIN" || userAccess.tickets.length > 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {getAccessIcon(userAccess.tickets.length > 0, userAccess.role)}
            </div>
            <p className="text-sm text-gray-300">
              {getAccessText(userAccess.tickets.length > 0, userAccess.role, "Ticket")}
            </p>
          </div>

          {/* Premium Access */}
          <div
            className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 text-center transform hover:scale-105 hover:shadow-xl ${
              userAccess.hasPremiumAccess
                ? "border-blue-500/50 hover:border-blue-400 hover:shadow-blue-500/20"
                : "border-red-500/50 hover:border-red-400 hover:shadow-red-500/20"
            }`}
          >
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-bold text-white mb-3">Premium Bereich</h3>
            <div className={`text-2xl mb-2 ${userAccess.hasPremiumAccess ? "text-blue-400" : "text-red-400"}`}>
              {getAccessIcon(userAccess.hasPremiumAccess, userAccess.role)}
            </div>
            <p className="text-sm text-gray-300">
              {getAccessText(userAccess.hasPremiumAccess, userAccess.role, "Standard+ Ticket")}
            </p>
          </div>

          {/* VIP Access */}
          <div
            className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 text-center transform hover:scale-105 hover:shadow-xl ${
              userAccess.hasVIPAccess
                ? "border-yellow-500/50 hover:border-yellow-400 hover:shadow-yellow-500/20"
                : "border-red-500/50 hover:border-red-400 hover:shadow-red-500/20"
            }`}
          >
            <div className="text-4xl mb-3">👑</div>
            <h3 className="font-bold text-white mb-3">VIP Lounge</h3>
            <div className={`text-2xl mb-2 ${userAccess.hasVIPAccess ? "text-yellow-400" : "text-red-400"}`}>
              {getAccessIcon(userAccess.hasVIPAccess, userAccess.role)}
            </div>
            <p className="text-sm text-gray-300">
              {getAccessText(userAccess.hasVIPAccess, userAccess.role, "VIP Ticket")}
            </p>
          </div>

          {/* Backstage Access */}
          <div
            className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 text-center transform hover:scale-105 hover:shadow-xl ${
              userAccess.hasBackstageAccess
                ? "border-purple-500/50 hover:border-purple-400 hover:shadow-purple-500/20"
                : "border-red-500/50 hover:border-red-400 hover:shadow-red-500/20"
            }`}
          >
            <div className="text-4xl mb-3">🎭</div>
            <h3 className="font-bold text-white mb-3">Backstage</h3>
            <div className={`text-2xl mb-2 ${userAccess.hasBackstageAccess ? "text-purple-400" : "text-red-400"}`}>
              {getAccessIcon(userAccess.hasBackstageAccess, userAccess.role)}
            </div>
            <p className="text-sm text-gray-300">
              {getAccessText(userAccess.hasBackstageAccess, userAccess.role, "VIP/Band")}
            </p>
          </div>
        </div>
      </div>

      {/* Purchased Tickets - Modernisiert */}
      {userAccess.tickets.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
            🎫 Gekaufte Tickets
          </h2>
          <div className="space-y-4">
            {userAccess.tickets.map(ticket => (
              <div
                key={ticket.id}
                className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-600/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 transform hover:scale-[1.02]"
              >
                <div className="flex-1">
                  <div className="font-bold text-white text-lg mb-1">{ticket.eventName}</div>
                  <div className="text-sm text-gray-300">
                    {getTicketName(ticket.type)} - gekauft am {new Date(ticket.purchasedAt).toLocaleDateString("de-DE")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-green-400 font-bold text-sm px-4 py-2 bg-green-900 rounded-lg border border-green-500">
                    ✓ Aktiv
                  </div>
                  <button
                    onClick={() => handleDeleteTicket(ticket.id)}
                    disabled={deletingTicket === ticket.id}
                    className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-400 hover:text-red-300 font-bold text-sm rounded-lg border border-red-500 hover:border-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
      {userAccess.canBuyTickets && userAccess.role === "FAN" && events.length > 0 && (
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
              onChange={e => setSelectedEvent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border-2 border-white/20 text-white focus:border-theme-primary focus:outline-none transition-all duration-300 hover:bg-white/10 hover:border-theme-primary/40"
            >
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.title} - {event.band.name} ({new Date(event.startDate).toLocaleDateString("de-DE")})
                </option>
              ))}
            </select>

            {selectedEvent && (
              <div className="mt-4 p-4 backdrop-blur-sm bg-white/5 rounded-xl border-2 border-white/20">
                {(() => {
                  const event = events.find(e => e.id === selectedEvent);
                  return event ? (
                    <div>
                      <div className="font-semibold text-white text-lg mb-2">{event.title}</div>
                      <div className="text-sm text-gray-300 mb-1">
                        🎸 {event.band.name} {event.band.genre && `(${event.band.genre})`}
                      </div>
                      <div className="text-sm text-gray-300 mb-1">
                        📍 {event.venue}, {event.city} • 📅{" "}
                        {new Date(event.startDate).toLocaleDateString("de-DE", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                <h3 className="text-xl font-bold text-white mb-2">🎫 Basic Ticket</h3>
                <p className="text-sm text-gray-300 mb-3">Grundzugang zum Event</p>
                <div className="text-3xl font-bold text-orange-400">CHF {getTicketPriceForEvent("STANDARD")}</div>
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

            {/* Standard Ticket - Konsistentes Dark Theme Design */}
            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                !canPurchaseTicket("STANDARD")
                  ? "border-white/20 bg-white/5 opacity-50"
                  : "border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105"
              }`}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">🎟️ Standard Ticket</h3>
                <p className="text-sm text-gray-300 mb-3">Erweiterte Bereiche</p>
                <div className="text-3xl font-bold text-blue-400">CHF {getTicketPriceForEvent("STANDARD")}</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-gray-300">Event Zugang</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-gray-300">Premium Bereich</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="text-green-400 mr-2">✓</span>
                  <span className="text-gray-300">Bessere Sicht</span>
                </div>
              </div>

              <button
                onClick={() => handlePurchaseTicket("STANDARD")}
                disabled={!canPurchaseTicket("STANDARD")}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                  canPurchaseTicket("STANDARD")
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transform hover:scale-105 shadow-lg shadow-blue-500/50"
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

            {/* VIP Ticket */}
            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                !canPurchaseTicket("VIP")
                  ? "border-white/20 bg-white/5 opacity-50"
                  : "border-yellow-400/50 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105"
              }`}
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">👑 VIP Fan Ticket</h3>
                <p className="text-sm text-gray-300 mb-3">Vollzugang für Fans</p>
                <div className="text-3xl font-bold text-yellow-400">CHF {getTicketPriceForEvent("VIP")}</div>
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
          <h3 className="text-2xl font-bold mb-3 drop-shadow-lg">Du hast bereits Vollzugang!</h3>
          <p className="text-lg opacity-90">
            Als Band Member hast du automatisch Zugang zu allen Bereichen, inklusive VIP Lounge, Backstage und allen
            Events.
          </p>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
