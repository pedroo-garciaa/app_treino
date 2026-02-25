"use client";

import { useCallback, useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import type { Treino } from "@/lib/types";

export function useTreinos() {
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    setTreinos(storage.getAll());
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveTreino = useCallback(
    (treino: Treino) => {
      const saved = storage.save(treino);
      load();
      return saved;
    },
    [load]
  );

  const deleteTreino = useCallback(
    (id: string) => {
      storage.delete(id);
      load();
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
    saveTreino,
    deleteTreino,
    getById,
    refresh: load,
  };
}
