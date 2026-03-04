"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useTreinos } from "@/hooks/useTreinos";
import { gerarId } from "@/lib/utils";
import type { Exercicio, Serie, Treino } from "@/lib/types";

export default function NovoTreinoPage() {
  const router = useRouter();
  const { saveTreino } = useTreinos();
  const [nome, setNome] = useState("");
  const [exercicios, setExercicios] = useState<
    { nome: string; quantidadeSeries: number }[]
  >([{ nome: "", quantidadeSeries: 4 }]);

  function addExercicio() {
    setExercicios((e) => [...e, { nome: "", quantidadeSeries: 4 }]);
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
      e.map((ex, idx) =>
        idx === i ? { ...ex, [field]: value } : ex
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date().toISOString();
    const treino: Treino = {
      id: gerarId(),
      nome: nome.trim(),
      exercicios: exercicios
        .filter((ex) => ex.nome.trim())
        .map((ex): Exercicio => {
          const series: Serie[] = Array.from(
            { length: Math.max(1, ex.quantidadeSeries) },
            (_, idx) => ({
              id: gerarId() + idx,
              carga: 0,
              repeticoes: 0,
              concluida: false,
            })
          );
          return {
            id: gerarId(),
            nome: ex.nome.trim(),
            series,
          };
        }),
      criadoEm: now,
      atualizadoEm: now,
    };
    await saveTreino(treino);
    router.push("/");
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="btn-ghost">
          ← Voltar
        </Link>
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Cadastrar novo treino
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--muted)]">
            Nome do treino
          </label>
          <input
            type="text"
            className="input"
            placeholder="Ex: Peito e Tríceps, Treino A..."
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--muted)]">
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
              <li key={i} className="card flex flex-wrap items-end gap-3">
                <div className="min-w-[140px] flex-1">
                  <input
                    type="text"
                    className="input"
                    placeholder="Nome do exercício"
                    value={ex.nome}
                    onChange={(e) =>
                      updateExercicio(i, "nome", e.target.value)
                    }
                  />
                </div>
                <div className="w-24">
                  <label className="mb-0.5 block text-xs text-[var(--muted)]">
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
            Salvar treino
          </button>
          <Link href="/" className="btn-ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}
