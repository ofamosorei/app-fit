import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProtocolProvider } from "@/context/ProtocolContext";
import { AuthProvider } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Protocolo de Emagrecimento",
  description: "Siga o plano e alcance seu objetivo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500/30">
        <AuthProvider>
          <ProtocolProvider>
            {children}
            <BottomNav />
          </ProtocolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
