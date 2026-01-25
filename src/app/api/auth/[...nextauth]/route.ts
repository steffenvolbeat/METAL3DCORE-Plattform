// 🔐 NextAuth.js Configuration für 3DMetal Platform
// Authentication System mit Prisma & PostgreSQL

import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    // Email/Password Login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email und Passwort sind erforderlich");
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user || !user.password) {
            throw new Error("Ungültige Email oder Passwort");
          }

          // Passwort-Verifikation mit bcrypt
          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error("Ungültige Email oder Passwort");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          throw new Error("Anmeldung fehlgeschlagen. Bitte versuchen Sie es später erneut.");
        }
      },
    }),

    // Google OAuth (conditional - only add if credentials are provided)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user) {
          token.role = user.role;
          token.userId = user.id;
        }
        return token;
      } catch (error) {
        console.error("NextAuth JWT callback error:", error);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (token && session.user) {
          session.user.id = token.userId as string;
          session.user.role = token.role as string;
        }
        return session;
      } catch (error) {
        console.error("NextAuth session callback error:", error);
        return session;
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Next.js route handler export signature
export { handler as GET, handler as POST };
