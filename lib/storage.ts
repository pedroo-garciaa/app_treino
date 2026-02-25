import type { Treino } from "./types";

const STORAGE_KEY = "app-treino-data";

function getStored(): Treino[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Treino[];
  } catch {
    return [];
  }
}

function setStored(treinos: Treino[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(treinos));
}

export const storage = {
  getAll(): Treino[] {
    return getStored();
  },
  getById(id: string): Treino | undefined {
    return getStored().find((t) => t.id === id);
  },
  save(treino: Treino) {
    const list = getStored();
    const now = new Date().toISOString();
    const existing = list.findIndex((t) => t.id === treino.id);
    const toSave = {
      ...treino,
      atualizadoEm: now,
      criadoEm: existing >= 0 ? list[existing].criadoEm : now,
    };
    if (existing >= 0) {
      list[existing] = toSave;
    } else {
      list.push(toSave);
    }
    setStored(list);
    return toSave;
  },
  delete(id: string) {
    const list = getStored().filter((t) => t.id !== id);
    setStored(list);
  },
};
