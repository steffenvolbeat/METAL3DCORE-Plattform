// 🎸 Auth Context
// Global Authentication State Management

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { User } from "@/shared/types";
import { getSession } from "../services/auth.service";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Session beim Mount laden
  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const session = await getSession();
      if (session?.user) {
        setUser(session.user);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function login(userData: User) {
    setUser(userData);
  }

  function logout() {
    setUser(null);
  }

  function updateUser(userData: Partial<User>) {
    setUser((current) => (current ? { ...current, ...userData } : null));
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook für Auth Context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
