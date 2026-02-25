"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTreinos } from "@/hooks/useTreinos";
import { api } from "@/lib/api";
import type { Exercicio, Serie, Treino } from "@/lib/types";

export default function TreinoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getById, saveTreino, deleteTreino, loaded } = useTreinos();
  const [treino, setTreino] = useState<Treino | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const fromList = getById(id);
    if (fromList) {
      setTreino(fromList);
      return;
    }
    if (loaded) {
      api.getTreino(id).then((t) => setTreino(t ?? null));
    }
  }, [id, loaded, getById]);

  const updateTreino = useCallback(
    (updater: (t: Treino) => Treino) => {
      if (!treino) return;
      const next = updater(treino);
      setTreino(next);
      saveTreino(next).catch(() => {});
    },
    [treino, saveTreino]
  );

  const updateSerie = useCallback(
    (
      exercicioId: string,
      serieId: string,
      patch: Partial<Serie>
    ) => {
      updateTreino((t) => ({
        ...t,
        exercicios: t.exercicios.map((ex) =>
          ex.id !== exercicioId
            ? ex
            : {
                ...ex,
                series: ex.series.map((s) =>
                  s.id !== serieId ? s : { ...s, ...patch }
                ),
              }
        ),
      }));
    },
    [updateTreino]
  );

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteTreino(id);
      router.push("/");
    } else {
      setConfirmDelete(true);
    }
  };

  if (!loaded) {
    return <p className="text-stone-500">Carregando...</p>;
  }

  if (!treino) {
    return (
      <main className="space-y-4">
        <p className="text-stone-400">Treino não encontrado.</p>
        <Link href="/" className="btn-primary inline-block">
          Voltar ao início
        </Link>
      </main>
    );
  }

  const totalConcluidas = treino.exercicios.reduce(
    (acc, ex) => acc + ex.series.filter((s) => s.concluida).length,
    0
  );
  const totalSeries = treino.exercicios.reduce(
    (acc, ex) => acc + ex.series.length,
    0
  );

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="btn-ghost">
            ← Voltar
          </Link>
          <h2 className="text-lg font-semibold text-white">{treino.nome}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/treino/${id}/editar`}
            className="btn-ghost text-sm"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className={
              confirmDelete
                ? "rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white"
                : "btn-ghost text-sm text-red-400"
            }
          >
            {confirmDelete ? "Clique de novo para excluir" : "Excluir"}
          </button>
        </div>
      </div>

      <div className="card flex justify-between text-sm">
        <span className="text-stone-400">Progresso</span>
        <span className="font-medium text-white">
          {totalConcluidas} / {totalSeries} séries
        </span>
      </div>

      <ul className="space-y-4">
        {treino.exercicios.map((ex) => {
          const repsPorSerie = ex.series.map((s) => s.repeticoes);
          const temReps = repsPorSerie.some((r) => r > 0);
          return (
            <li key={ex.id} className="card">
              <h3 className="mb-3 font-medium text-white">{ex.nome}</h3>
              {temReps && (
                <div className="mb-3 rounded-lg bg-stone-800/80 px-3 py-2 text-sm">
                  <span className="text-stone-400">Repetições por série: </span>
                  <span className="font-medium text-white">
                    {ex.series
                      .map((s, i) =>
                        s.repeticoes > 0
                          ? `S${i + 1}: ${s.repeticoes}`
                          : `S${i + 1}: —`
                      )
                      .join(" · ")}
                  </span>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-600 text-left text-stone-400">
                      <th className="pb-2 pr-2">#</th>
                      <th className="pb-2 pr-2">Carga (kg)</th>
                      <th className="pb-2 pr-2">Repetições</th>
                      <th className="pb-2">Feito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ex.series.map((s, idx) => (
                      <tr
                        key={s.id}
                        className={
                          s.concluida
                            ? "border-b border-stone-700/50 text-stone-400"
                            : "border-b border-stone-700"
                        }
                      >
                        <td className="py-2 pr-2 font-medium">{idx + 1}</td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            className="input w-20 py-1.5 text-center"
                            value={s.carga || ""}
                            onChange={(e) =>
                              updateSerie(ex.id, s.id, {
                                carga: parseFloat(e.target.value) || 0,
                              })
                            }
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min={0}
                            className="input w-16 py-1.5 text-center"
                            value={s.repeticoes || ""}
                            onChange={(e) =>
                              updateSerie(ex.id, s.id, {
                                repeticoes: parseInt(e.target.value, 10) || 0,
                              })
                            }
                          />
                          {s.repeticoes > 0 && (
                            <span className="ml-1.5 text-xs text-stone-500">
                              reps
                            </span>
                          )}
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateSerie(ex.id, s.id, {
                                concluida: !s.concluida,
                              })
                            }
                            className={
                              s.concluida
                                ? "rounded bg-emerald-600/80 px-2 py-1 text-xs text-white"
                                : "rounded border border-stone-600 px-2 py-1 text-xs text-stone-400"
                            }
                          >
                            {s.concluida ? "✓" : "Marcar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
