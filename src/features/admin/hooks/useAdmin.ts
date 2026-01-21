// 🎸 useAdmin Hook
// Custom Hook für Admin Functions

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { AdminStats } from "../types/admin.types";

interface UseAdminReturn {
  isAdmin: boolean;
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export function useAdmin(): UseAdminReturn {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) throw new Error("Failed to fetch admin stats");

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  return {
    isAdmin,
    stats,
    isLoading,
    error,
    fetchStats,
  };
}
