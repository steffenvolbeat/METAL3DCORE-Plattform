// 🎸 Admin Service
// Admin Dashboard & Management

import { get, post, put, del } from "@/shared/services/api.service";
import type { User, Event } from "@/shared/types";

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  activeUsers: number;
  upcomingEvents: number;
}

export interface UserManagement {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Admin-Dashboard Statistiken abrufen
 */
export async function getAdminStats(): Promise<AdminStats> {
  return get<AdminStats>("/api/admin/stats");
}

/**
 * Alle User abrufen (mit Pagination)
 */
export async function getAllUsers(
  page: number = 1,
  limit: number = 20
): Promise<UserManagement> {
  return get<UserManagement>("/api/admin/users", {
    params: { page, limit },
  });
}

/**
 * User Role ändern
 */
export async function updateUserRole(
  userId: string,
  role: string
): Promise<User> {
  return put<User>(`/api/admin/users/${userId}/role`, { role });
}

/**
 * User blockieren/entsperren
 */
export async function toggleUserStatus(
  userId: string,
  blocked: boolean
): Promise<User> {
  return put<User>(`/api/admin/users/${userId}/status`, { blocked });
}

/**
 * User löschen
 */
export async function deleteUser(userId: string): Promise<void> {
  return del(`/api/admin/users/${userId}`);
}

/**
 * Event-Moderation
 */
export async function moderateEvent(
  eventId: string,
  action: "approve" | "reject",
  reason?: string
): Promise<Event> {
  return post<Event>(`/api/admin/events/${eventId}/moderate`, {
    action,
    reason,
  });
}

/**
 * System-Logs abrufen
 */
export async function getSystemLogs(limit: number = 100): Promise<any[]> {
  return get("/api/admin/logs", { params: { limit } });
}
