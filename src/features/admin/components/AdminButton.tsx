// 🎸 Admin Button Component - Coming Soon Page Access
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function AdminButton() {
  const { data: session } = useSession();
  const router = useRouter();

  // Only show for Admin users
  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <button
      onClick={() => router.push("/admin/coming-soon")}
      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all font-semibold text-white shadow-lg hover:shadow-purple-500/50"
      title="Admin: Coming Soon Page"
    >
      🚀 Coming Soon
    </button>
  );
}
