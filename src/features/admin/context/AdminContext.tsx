// 🎸 Admin Context
// Admin Dashboard State Management

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  revenue: number;
}

export interface AdminContextValue {
  stats: AdminStats | null;
  isLoading: boolean;
  selectedView: "dashboard" | "users" | "events" | "tickets" | "settings";
  setSelectedView: (view: AdminContextValue["selectedView"]) => void;
  refreshStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export interface AdminProviderProps {
  children: ReactNode;
}

/**
 * Admin Provider Component
 */
export function AdminProvider({ children }: AdminProviderProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedView, setSelectedView] =
    useState<AdminContextValue["selectedView"]>("dashboard");

  async function refreshStats() {
    setIsLoading(true);
    try {
      // Hier würde der API-Call kommen
      // const data = await fetch('/api/admin/stats').then(r => r.json());
      // setStats(data);

      // Mock-Daten für jetzt
      setTimeout(() => {
        setStats({
          totalUsers: 1234,
          totalEvents: 56,
          totalTickets: 4567,
          revenue: 123456.78,
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to load admin stats:", error);
      setIsLoading(false);
    }
  }

  const value: AdminContextValue = {
    stats,
    isLoading,
    selectedView,
    setSelectedView,
    refreshStats,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

/**
 * Hook für Admin Context
 */
export function useAdminContext() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdminContext must be used within AdminProvider");
  }
  return context;
}
