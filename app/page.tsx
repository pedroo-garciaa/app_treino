"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTreinos } from "@/hooks/useTreinos";
import { api } from "@/lib/api";
import { formatarData } from "@/lib/utils";

export default function HomePage() {
  const { treinos, loaded, error, refresh } = useTreinos();
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (loaded && treinos.length === 0) {
      api.seed().then(({ added }) => { if (added > 0) refresh(); });
    }
  }, [loaded, treinos.length, refresh]);

  async function handleAdicionarTreinosExemplo() {
    const { added, total } = await api.seed();
    await refresh();
    setSeedMsg(
      added === 0
        ? "Treinos Upper/Lower já estão na lista."
        : `${added} de ${total} treinos adicionados (Upper A, Lower A, Upper B, Lower B).`
    );
    setTimeout(() => setSeedMsg(null), 4000);
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-200">Meus treinos</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAdicionarTreinosExemplo}
            className="btn-ghost inline-flex items-center gap-1.5 text-sm text-accent"
          >
            + Upper/Lower
          </button>
          <Link
            href="/treino/novo"
            className="btn-primary inline-flex items-center gap-2"
          >
            <span className="text-lg">+</span> Novo treino
          </Link>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
          {error}
          <button type="button" onClick={() => refresh()} className="ml-2 underline">
            Tentar de novo
          </button>
        </div>
      )}
      {seedMsg && (
        <p className="rounded-lg bg-stone-800/80 px-3 py-2 text-sm text-stone-300">
          {seedMsg}
        </p>
      )}

      {!loaded ? (
        <p className="text-stone-500">Carregando...</p>
      ) : treinos.length === 0 ? (
        <div className="card text-center">
          <p className="text-stone-400">Nenhum treino cadastrado.</p>
          <Link href="/treino/novo" className="btn-primary mt-4 inline-block">
            Cadastrar primeiro treino
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {treinos.map((t) => (
            <li key={t.id}>
              <Link
                href={`/treino/${t.id}`}
                className="card flex items-center justify-between transition hover:border-accent/50 hover:bg-stone-800/50"
              >
                <div>
                  <p className="font-medium text-white">{t.nome}</p>
                  <p className="text-sm text-stone-500">
                    {t.exercicios.length} exercício
                    {t.exercicios.length !== 1 ? "s" : ""} · Atualizado{" "}
                    {formatarData(t.atualizadoEm)}
                  </p>
                </div>
                <span className="text-stone-500">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
