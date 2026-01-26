// 🔐 NextAuth.js Configuration für 3DMetal Platform
// Authentication System mit Prisma & PostgreSQL

import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/auth";

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    userId?: string;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
