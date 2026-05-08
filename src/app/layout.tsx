import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "WorshipApp",
  description: "Plataforma de gestión integral para equipos de alabanza",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${lexend.variable}`}>
      <body className="min-h-screen bg-background text-on-surface antialiased font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
