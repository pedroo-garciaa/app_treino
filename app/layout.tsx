import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "App Treino — Controle de Academia",
  description: "Controle de treinos, carga, séries e repetições",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <body className="min-h-screen font-sans">
        <div className="mx-auto max-w-2xl px-4 py-6 pb-20">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              App Treino
            </h1>
            <p className="mt-1 text-sm text-stone-400">
              Controle de carga, séries e repetições
            </p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
