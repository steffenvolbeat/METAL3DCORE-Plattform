"use client";

// 🎸 3DMetal Platform - Access Control Demo Component
// Shows user access rights in real-time in the 3D environment

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserRole, TicketType } from "@prisma/client";
import { calculateAccessRights } from "@/lib/access-control";

interface AccessDemoProps {
  position?: [number, number, number];
  onRoomChange?: (room: string) => void;
}

export function AccessControlDemo({ position = [0, 0, 0] }: AccessDemoProps) {
  const { data: session } = useSession();
  const [userRights, setUserRights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserRights();
    }
  }, [session]);

  const fetchUserRights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/tickets/purchase");
      if (response.ok) {
        const data = await response.json();
        setUserRights(data.userAccessRights);
      }
    } catch (error) {
      console.error("Error fetching user rights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <group position={position}>
        {/* Not logged in display */}
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[4, 2, 0.1]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        <mesh position={[0, 2, 0.1]}>
          <planeGeometry args={[3.8, 1.8]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {/* Text would be added via Html component in real implementation */}
      </group>
    );
  }

  return (
    <group position={position}>
      {/* User Status Display */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[5, 3, 0.1]} />
        <meshStandardMaterial
          color={session.user.role === "BAND" ? "#9333ea" : "#3b82f6"}
        />
      </mesh>

      {/* Access Rights Display */}
      <mesh position={[0, 3, 0.1]}>
        <planeGeometry args={[4.8, 2.8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Individual Access Indicators */}
      {/* Concert Access */}
      <mesh position={[-1.5, 3.5, 0.2]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial
          color={userRights?.canAccessConcert ? "#10b981" : "#ef4444"}
        />
      </mesh>

      {/* Premium Access */}
      <mesh position={[-0.5, 3.5, 0.2]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial
          color={userRights?.canAccessPremium ? "#10b981" : "#ef4444"}
        />
      </mesh>

      {/* VIP Access */}
      <mesh position={[0.5, 3.5, 0.2]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial
          color={userRights?.canAccessVIP ? "#10b981" : "#ef4444"}
        />
      </mesh>

      {/* Backstage Access */}
      <mesh position={[1.5, 3.5, 0.2]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial
          color={userRights?.canAccessBackstage ? "#10b981" : "#ef4444"}
        />
      </mesh>

      {/* Band Member Special Display */}
      {session.user.role === "BAND" && (
        <group position={[0, 1, 0]}>
          <mesh>
            <torusGeometry args={[1, 0.1, 8, 16]} />
            <meshStandardMaterial color="#9333ea" />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.8, 0.8, 0.1]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
      )}

      {/* Interactive Purchase Portal for Fans */}
      {session.user.role !== "BAND" && (
        <group position={[0, 0.5, 0]}>
          <mesh>
            <boxGeometry args={[3, 2, 0.5]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          {/* Ticket Purchase Buttons would be added here */}
        </group>
      )}
    </group>
  );
}

// HTML Overlay Component for detailed information
export function AccessControlUI({
  userRights,
  onPurchaseTicket,
}: {
  userRights: any;
  onPurchaseTicket: (type: TicketType) => void;
}) {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="bg-red-900/80 text-white p-4 rounded-lg border border-red-500/50 backdrop-blur-sm">
        <h3 className="text-xl font-bold mb-2">🔐 Nicht angemeldet</h3>
        <p>Bitte melde dich an, um deine Zugriffsrechte zu sehen!</p>
      </div>
    );
  }

  return (
    <div
      className={`p-6 rounded-xl border backdrop-blur-sm ${
        session.user.role === "BAND"
          ? "bg-purple-900/80 border-purple-500/50"
          : "bg-blue-900/80 border-blue-500/50"
      }`}
    >
      {/* User Info */}
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white mb-1">
          {session.user.role === "BAND" ? "🎸" : "🎫"} {session.user.name}
        </h3>
        <p className="text-gray-300">
          {session.user.role === "BAND" ? "Band Member" : "Fan"} •{" "}
          {session.user.email}
        </p>
      </div>

      {/* Access Rights Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className={`p-3 rounded-lg ${
            userRights?.canAccessConcert ? "bg-green-600/50" : "bg-red-600/50"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                userRights?.canAccessConcert ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-white font-medium">🎤 Konzert</span>
          </div>
        </div>

        <div
          className={`p-3 rounded-lg ${
            userRights?.canAccessPremium ? "bg-green-600/50" : "bg-red-600/50"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                userRights?.canAccessPremium ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-white font-medium">⭐ Premium</span>
          </div>
        </div>

        <div
          className={`p-3 rounded-lg ${
            userRights?.canAccessVIP ? "bg-green-600/50" : "bg-red-600/50"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                userRights?.canAccessVIP ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-white font-medium">👑 VIP</span>
          </div>
        </div>

        <div
          className={`p-3 rounded-lg ${
            userRights?.canAccessBackstage ? "bg-green-600/50" : "bg-red-600/50"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                userRights?.canAccessBackstage ? "bg-green-400" : "bg-red-400"
              }`}
            />
            <span className="text-white font-medium">🎸 Backstage</span>
          </div>
        </div>
      </div>

      {/* Band Special Message */}
      {session.user.role === "BAND" && (
        <div className="bg-purple-600/30 p-4 rounded-lg border border-purple-400/50 mb-4">
          <h4 className="text-lg font-bold text-purple-300 mb-2">
            🎸 Band Vollzugang
          </h4>
          <p className="text-gray-300 text-sm">
            Als Band Member hast du automatisch VOLLZUGANG zu allen Bereichen!
          </p>
        </div>
      )}

      {/* Fan Ticket Purchase Options */}
      {session.user.role !== "BAND" && (
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-white mb-2">
            🎫 Erweitere deine Zugriffsrechte
          </h4>

          <button
            onClick={() => onPurchaseTicket(TicketType.STANDARD)}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            🎤 Standard Ticket (45 CHF) - Konzert + Premium
          </button>

          <button
            onClick={() => onPurchaseTicket(TicketType.STANDARD)}
            className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            ⭐ Standard Ticket (45€) - Konzert + Premium
          </button>

          <button
            onClick={() => onPurchaseTicket(TicketType.VIP)}
            className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            👑 VIP Fans Ticket (120€) - VOLLZUGANG
          </button>
        </div>
      )}
    </div>
  );
}
