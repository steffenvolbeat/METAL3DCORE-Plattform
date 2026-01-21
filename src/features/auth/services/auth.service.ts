// 🎸 Auth Service
// Authentication & User Management

import { get, post } from "@/shared/services/api.service";
import type { User } from "@/shared/types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

/**
 * Login
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  return post<AuthResponse>("/api/auth/signin", credentials);
}

/**
 * Registrierung
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  return post<AuthResponse>("/api/auth/signup", data);
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  return post("/api/auth/signout");
}

/**
 * Aktuelle Session abrufen
 */
export async function getSession(): Promise<{ user: User } | null> {
  try {
    return await get("/api/auth/session");
  } catch {
    return null;
  }
}

/**
 * User-Profil aktualisieren
 */
export async function updateProfile(
  userId: string,
  data: Partial<User>
): Promise<User> {
  return post<User>(`/api/user/${userId}`, data);
}

/**
 * Passwort ändern
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<void> {
  return post("/api/user/password", { oldPassword, newPassword });
}
