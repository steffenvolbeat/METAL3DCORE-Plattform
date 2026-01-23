// 🎸 Metal3DCore Platform - Tickets Page
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  maxQuantity: number;
  benefits: string[];
  color: string;
}

const TICKET_TYPES: TicketType[] = [
  {
    id: "fan",
    name: "FAN Ticket",
    description: "Basis-Zugang zur Metal3DCore Platform Experience",
    price: 50,
    maxQuantity: 10,
    color: "bg-blue-600",
    benefits: ["Zugang zu allen 7 3D-Räumen", "Standard Audio-Qualität", "Community Chat", "Basis Merch-Zugang"],
  },
  {
    id: "vip",
    name: "VIP FAN Ticket",
    description: "Premium-Erlebnis mit exklusiven Features",
    price: 100,
    maxQuantity: 5,
    color: "bg-purple-600",
    benefits: [
      "Alle FAN Ticket Benefits",
      "High-Fidelity Audio",
      "VIP-Only Backstage Area",
      "Exklusive Merch Items",
      "Meet & Greet Sessions",
      "Priority Support",
    ],
  },
  {
    id: "benefiz",
    name: "BENEFIZ Ticket",
    description: "Unterstütze soziale Projekte mit deinem Kauf",
    price: 150,
    maxQuantity: 3,
    color: "bg-green-600",
    benefits: [
      "Alle VIP Ticket Benefits",
      "50% gehen an Wohltätigkeitsorganisationen",
      "Spenden-Zertifikat",
      "Exklusive Benefiz-Community",
      "Impact Reports",
      "Special Recognition",
    ],
  },
];

export default function TicketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login?callbackUrl=/tickets");
    }
  }, [session, status, router]);

  const handlePurchase = async (ticketType: TicketType) => {
    if (!session) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketType: ticketType.id,
          quantity: quantity,
        }),
      });

      if (response.ok) {
        const { redirectUrl } = await response.json();
        router.push(redirectUrl);
      } else {
        console.error("Purchase failed");
      }
    } catch (error) {
      console.error("Purchase error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-orange-400 text-xl font-mono">Loading tickets...</div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-20 w-full flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-bold text-orange-400 font-mono mb-8 text-center">
            🎸 METAL3DCORE TICKETS
          </h1>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed px-4 text-center">
            Erlebe die revolutionäre 3D-Metal-Platform. Wähle dein Ticket und tauche ein in die immersive Welt von
            Metal3DCore!
          </p>
        </div>

        {/* Tickets Grid */}
        <div className="flex justify-center items-center mb-20 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full mx-auto justify-items-center">
            {TICKET_TYPES.map(ticket => (
              <div
                key={ticket.id}
                className="bg-gray-900 rounded-xl p-8 border border-gray-700 hover:border-orange-500 hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                <div className={`w-full h-3 rounded-t-lg ${ticket.color} mb-8`} />

                <div className="grow text-center">
                  <h3 className="text-3xl font-bold text-orange-400 mb-4">{ticket.name}</h3>
                  <p className="text-lg text-gray-300 mb-6 leading-relaxed">{ticket.description}</p>
                  <div className="text-4xl font-bold text-white mb-8">CHF {ticket.price}</div>

                  {/* Benefits */}
                  <div className="mb-8">
                    <h4 className="text-xl font-semibold text-orange-400 mb-4">Benefits:</h4>
                    <ul className="space-y-3 text-left max-w-xs mx-auto">
                      {ticket.benefits.map((benefit, index) => (
                        <li key={index} className="text-base text-gray-300 flex items-start">
                          <span className="text-orange-400 mr-3 font-bold">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-auto text-center">
                  {/* Quantity Selector */}
                  <div className="mb-6">
                    <label className="block text-base font-semibold text-orange-400 mb-3">
                      Anzahl (max. {ticket.maxQuantity}):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={ticket.maxQuantity}
                      value={selectedTicket === ticket.id ? quantity : 1}
                      onChange={e => {
                        setQuantity(parseInt(e.target.value));
                        setSelectedTicket(ticket.id);
                      }}
                      className="w-full max-w-xs px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-orange-500 focus:outline-none text-lg text-center"
                    />
                  </div>

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchase(ticket)}
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading
                      ? "Processing..."
                      : "Jetzt kaufen - CHF " + ticket.price * (selectedTicket === ticket.id ? quantity : 1)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="h-32"></div>

        {/* Info Section */}
        <div className="flex justify-center items-center mb-20 w-full">
          <div className="bg-gray-900 rounded-xl p-10 border border-gray-700 w-full max-w-6xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl font-bold text-orange-400 mb-10 text-center">🎯 Ticket Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-2xl font-semibold text-orange-400 mb-6">Was ist enthalten:</h3>
                <ul className="space-y-4 text-gray-300 text-left max-w-sm">
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    Vollzugang zur 3D-Platform
                  </li>
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    Alle 7 immersive 3D-Räume
                  </li>
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    Live-Concert Streaming
                  </li>
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    Community Features
                  </li>
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    Mobile & Desktop Support
                  </li>
                </ul>
              </div>

              <div className="flex flex-col items-center text-center">
                <h3 className="text-2xl font-semibold text-orange-400 mb-6">Support & Hilfe:</h3>
                <ul className="space-y-4 text-gray-300 text-left max-w-sm">
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    24/7 Technical Support
                  </li>
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    Setup & Installation Hilfe
                  </li>
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    VR-Headset Kompatibilität
                  </li>
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    Multi-Device Synchronisation
                  </li>
                  <li className="flex items-start text-lg">
                    <span className="text-orange-400 mr-3 font-bold">•</span>
                    Community Discord Zugang
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
