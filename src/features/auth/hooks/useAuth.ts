// 🎸 useAuth Hook
// Custom Hook für Authentication

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import type {
  LoginCredentials,
  SignUpData,
  AuthResponse,
} from "../types/auth.types";

interface UseAuthReturn {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (data: SignUpData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        message: "Login erfolgreich",
      };
    } catch (error) {
      return {
        success: false,
        error: "Login fehlgeschlagen",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignUpData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || "Registrierung fehlgeschlagen",
        };
      }

      return {
        success: true,
        message: "Registrierung erfolgreich",
      };
    } catch (error) {
      return {
        success: false,
        error: "Netzwerkfehler bei der Registrierung",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  return {
    user: session?.user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || isLoading,
    login,
    signup,
    logout,
  };
}
