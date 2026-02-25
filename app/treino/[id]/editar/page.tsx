"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTreinos } from "@/hooks/useTreinos";
import { api } from "@/lib/api";
import { gerarId } from "@/lib/utils";
import type { Exercicio, Serie, Treino } from "@/lib/types";

export default function EditarTreinoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { getById, saveTreino, loaded } = useTreinos();
  const [treino, setTreino] = useState<Treino | null>(null);
  const [nome, setNome] = useState("");
  const [exercicios, setExercicios] = useState<
    { id: string; nome: string; quantidadeSeries: number }[]
  >([]);

  useEffect(() => {
    const fromList = getById(id);
    if (fromList) {
      setTreino(fromList);
      setNome(fromList.nome);
      setExercicios(
        fromList.exercicios.map((ex) => ({
          id: ex.id,
          nome: ex.nome,
          quantidadeSeries: ex.series.length,
        }))
      );
      return;
    }
    if (loaded) {
      api.getTreino(id).then((t) => {
        if (t) {
          setTreino(t);
          setNome(t.nome);
          setExercicios(
            t.exercicios.map((ex) => ({
              id: ex.id,
              nome: ex.nome,
              quantidadeSeries: ex.series.length,
            }))
          );
        } else setTreino(null);
      });
    }
  }, [id, loaded, getById]);

  function addExercicio() {
    setExercicios((e) => [...e, { id: gerarId(), nome: "", quantidadeSeries: 4 }]);
  }

  function removeExercicio(i: number) {
    setExercicios((e) => e.filter((_, idx) => idx !== i));
  }

  function updateExercicio(
    i: number,
    field: "nome" | "quantidadeSeries",
    value: string | number
  ) {
    setExercicios((e) =>
      e.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!treino) return;
    const exerciciosAtualizados: Exercicio[] = exercicios
      .filter((ex) => ex.nome.trim())
      .map((ex) => {
        const existing = treino.exercicios.find((e) => e.id === ex.id);
        const currentSeries = existing?.series ?? [];
        const targetLen = Math.max(1, ex.quantidadeSeries);
        let series: Serie[];
        if (targetLen > currentSeries.length) {
          series = [
            ...currentSeries,
            ...Array.from(
              { length: targetLen - currentSeries.length },
              (_, i) => ({
                id: gerarId() + i,
                carga: 0,
                repeticoes: 0,
                concluida: false,
              })
            ),
          ];
        } else if (targetLen < currentSeries.length) {
          series = currentSeries.slice(0, targetLen);
        } else {
          series = currentSeries;
        }
        return {
          id: ex.id,
          nome: ex.nome.trim(),
          series,
        };
      });
    const updated: Treino = {
      ...treino,
      nome: nome.trim(),
      exercicios: exerciciosAtualizados,
      atualizadoEm: new Date().toISOString(),
    };
    await saveTreino(updated);
    router.push(`/treino/${id}`);
  }

  if (!loaded) return <p className="text-stone-500">Carregando...</p>;
  if (!treino)
    return (
      <main>
        <p className="text-stone-400">Treino não encontrado.</p>
        <Link href="/" className="btn-primary mt-4 inline-block">Voltar</Link>
      </main>
    );

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/treino/${id}`} className="btn-ghost">
          ← Voltar
        </Link>
        <h2 className="text-lg font-semibold text-stone-200">Editar treino</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-400">
            Nome do treino
          </label>
          <input
            type="text"
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-stone-400">
              Exercícios
            </label>
            <button
              type="button"
              onClick={addExercicio}
              className="text-sm text-accent hover:underline"
            >
              + Adicionar exercício
            </button>
          </div>
          <ul className="space-y-3">
            {exercicios.map((ex, i) => (
              <li key={ex.id} className="card flex flex-wrap items-end gap-3">
                <div className="min-w-[140px] flex-1">
                  <input
                    type="text"
                    className="input"
                    placeholder="Nome do exercício"
                    value={ex.nome}
                    onChange={(e) => updateExercicio(i, "nome", e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="mb-0.5 block text-xs text-stone-500">
                    Séries
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className="input"
                    value={ex.quantidadeSeries}
                    onChange={(e) =>
                      updateExercicio(
                        i,
                        "quantidadeSeries",
                        parseInt(e.target.value, 10) || 1
                      )
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeExercicio(i)}
                  className="btn-ghost text-red-400 hover:bg-red-500/10"
                  disabled={exercicios.length <= 1}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1">
            Salvar alterações
          </button>
          <Link href={`/treino/${id}`} className="btn-ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}
