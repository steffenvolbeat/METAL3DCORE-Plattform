"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function AdminComingSoonButton() {
  const { data: session, status } = useSession();

  // Nur für Admin-User anzeigen
  if (status === "loading") {
    return (
      <div className="w-6 h-6 animate-spin border-2 border-orange-500 border-t-transparent rounded-full"></div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <Link
      href="/admin/coming-soon"
      target="_blank"
      rel="noopener noreferrer"
      className="relative group px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg font-bold transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
    >
      <span className="flex items-center space-x-2">
        <span>🔥</span>
        <span>Admin Preview</span>
        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          NEW
        </span>
      </span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        Metal3DCore - Coming Soon Preview
      </div>
    </Link>
  );
}
