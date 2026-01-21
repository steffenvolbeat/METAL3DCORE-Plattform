import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/app/shared/components/providers";
import { Navigation } from "@/app/shared/components/Navigation";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Metal3DCore Platform (M3DC) - Core Platform Ready",
  description:
    "🎸 Metal3DCore Platform - The 3D Core of Metal Culture. Immersive 3D environments, real-time features, and authentic integrations.",
};

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de, en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {/* SessionProvider und Navigation als Coming Soon Platzhalter */}
        <SessionProvider>
          <Navigation />
          <div className="min-h-4 bg-slate-900 text-center text-xs text-slate-400 py-2">
            Navigation & Session: Coming Soon
          </div>
          <main className="pb-16">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
