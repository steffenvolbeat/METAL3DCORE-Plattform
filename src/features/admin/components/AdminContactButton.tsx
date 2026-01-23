"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function AdminContactButton() {
  const { data: session, status } = useSession();

  // Nur für Admin & Moderator anzeigen
  if (status === "loading") {
    return null;
  }

  if (!session || !["ADMIN", "MODERATOR"].includes(session.user.role || "")) {
    return null;
  }

  return (
    <Link
      href="/admin/contact-messages"
      className="relative group px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm"
    >
      <span className="flex items-center space-x-2">
        <span className="text-base">📧</span>
        <span className="hidden sm:inline">Support</span>
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        Contact Message Management
      </div>
    </Link>
  );
}
