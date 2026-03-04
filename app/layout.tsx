import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "KODHEX — App Treino",
  description: "Controle de treinos, carga, séries e repetições",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
        <Sidebar />
        <main className="min-h-screen lg:pl-64">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-20 pt-14 lg:pt-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
