import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/shared/components/providers";
import { Navigation } from "@/shared/components/Navigation";
import { WebGLErrorBoundary } from "@/shared/components/WebGLErrorBoundary";
import { GlobalWebGLErrorHandler } from "@/shared/components/GlobalWebGLErrorHandler";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "METAL3DCORE Platform (M3DC) - Core Platform Ready",
  description:
    "🎸 METAL3DCORE Platform - The 3D Core of Metal Culture. Immersive 3D environments, real-time features, and authentic integrations.",
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
    <html lang="de, en" suppressHydrationWarning={true}>
      <head>
        <script src="/suppress-extension-errors.js" async></script>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`} data-cy="app-body">
        <GlobalWebGLErrorHandler />
        <SessionProvider>
          <Navigation />
          <WebGLErrorBoundary>
            <main className="pb-16" data-cy="main-content">
              {children}
            </main>
          </WebGLErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  );
}
