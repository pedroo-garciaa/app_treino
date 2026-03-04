"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTreinos } from "@/hooks/useTreinos";
import { api } from "@/lib/api";
import { formatarData } from "@/lib/utils";

export default function HomePage() {
  const { treinos, loaded, error, refresh } = useTreinos();

  useEffect(() => {
    if (!loaded) return;
    api
      .seed()
      .then((r) => {
        if (typeof r?.added === "number" && r.added > 0) refresh();
      })
      .catch(() => {});
  }, [loaded, refresh]);

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[var(--text)]">Meus treinos</h2>
        <Link
          href="/treino/novo"
          className="btn-primary inline-flex items-center gap-2"
        >
          <span className="text-lg">+</span> Novo treino
        </Link>
      </div>
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
          <button type="button" onClick={() => refresh()} className="ml-2 underline">
            Tentar de novo
          </button>
        </div>
      )}

      {!loaded ? (
        <p className="text-[var(--muted)]">Carregando...</p>
      ) : treinos.length === 0 ? (
        <div className="card text-center">
          <p className="text-[var(--muted)]">Nenhum treino cadastrado.</p>
          <Link href="/treino/novo" className="btn-primary mt-4 inline-block">
            Cadastrar primeiro treino
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {treinos.map((t) => {
            const exercicios = Array.isArray(t.exercicios) ? t.exercicios : [];
            return (
              <li key={t.id}>
                <Link
                  href={`/treino/${t.id}`}
                  className="card flex items-center justify-between transition hover:border-[var(--accent)]/50 hover:bg-[var(--surface-card)]/80"
                >
                  <div>
                    <p className="font-medium text-[var(--text)]">{t.nome}</p>
                    <p className="text-sm text-[var(--muted)]">
                      {exercicios.length} exercício
                      {exercicios.length !== 1 ? "s" : ""} · Atualizado{" "}
                      {formatarData(t.atualizadoEm)}
                    </p>
                  </div>
                  <span className="text-[var(--muted)]">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
