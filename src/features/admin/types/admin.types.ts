// 🎸 Admin Feature - TypeScript Types

import { UserRole } from "@prisma/client";

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: UserRole;
  verified: boolean;
  createdAt: Date;
}

export interface ComingSoonItem {
  id: string;
  title: string;
  description: string;
  category: "feature" | "milestone" | "vision" | "extension";
  priority: "low" | "medium" | "high" | "critical";
  status: "planned" | "in-progress" | "completed";
  targetDate?: Date;
}
