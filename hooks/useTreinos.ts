"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Treino } from "@/lib/types";

export function useTreinos() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getTreinos();
      setTreinos(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar treinos");
      setTreinos([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveTreino = useCallback(
    async (treino: Treino): Promise<Treino> => {
      const saved = await api.saveTreino(treino);
      await load();
      return saved;
    },
    [load]
  );

  const deleteTreino = useCallback(
    async (id: string) => {
      await api.deleteTreino(id);
      await load();
    },
    [load]
  );

  const getById = useCallback(
    (id: string) => treinos.find((t) => t.id === id),
    [treinos]
  );

  return {
    treinos,
    loaded,
    error,
    saveTreino,
    deleteTreino,
    getById,
    refresh: load,
  };
}
