import NextAuth from "next-auth";

const handler = NextAuth({
  providers: [],
  callbacks: {},
  pages: {
    signIn: "/auth/login",
  },
  // Placeholder, bis der echte Provider und die DB konfiguriert sind
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
