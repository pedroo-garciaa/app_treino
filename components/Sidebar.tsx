"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "Início", icon: "⌂" },
  { href: "/agenda", label: "Agenda", icon: "📅" },
  { href: "/corpo", label: "Dados corporais", icon: "📋" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const linkClass = (href: string) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive(href)
        ? "bg-[var(--accent-soft)] text-accent"
        : "text-[var(--muted)] hover:bg-[var(--surface-card)] hover:text-[var(--text)]"
    }`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[var(--surface-card)] p-2.5 text-[var(--muted)] shadow-lg lg:hidden"
        aria-label="Abrir menu"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
            <Link href="/" className="flex items-center gap-2 [&>span]:block">
              <span className="block mix-blend-overlay">
                <Image
                  src="/logo-kodhex.png"
                  alt="KODHEX"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  priority
                />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-card)] hover:text-[var(--text)] lg:hidden"
              aria-label="Fechar menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
                onClick={() => setOpen(false)}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
