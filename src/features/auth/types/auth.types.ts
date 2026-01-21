// 🎸 Auth Feature - TypeScript Types

import { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: UserRole;
  image: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  username: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  message?: string;
}

export interface SessionData {
  user: AuthUser;
  expires: string;
}
