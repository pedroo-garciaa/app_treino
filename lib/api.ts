import type { Treino } from "./types";

const BASE = "";

async function handleRes<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Erro na requisição");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  async getTreinos(): Promise<Treino[]> {
    const res = await fetch(`${BASE}/api/treinos`);
    return handleRes<Treino[]>(res);
  },

  async getTreino(id: string): Promise<Treino | null> {
    const res = await fetch(`${BASE}/api/treinos/${id}`);
    if (res.status === 404) return null;
    return handleRes<Treino>(res);
  },

  async saveTreino(treino: Treino): Promise<Treino> {
    const exists = treino.criadoEm;
    const url = exists ? `${BASE}/api/treinos/${treino.id}` : `${BASE}/api/treinos`;
    const method = exists ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(treino),
    });
    return handleRes<Treino>(res);
  },

  async deleteTreino(id: string): Promise<void> {
    const res = await fetch(`${BASE}/api/treinos/${id}`, { method: "DELETE" });
    await handleRes<void>(res);
  },

  async seed(): Promise<{ added: number; total: number }> {
    const res = await fetch(`${BASE}/api/seed`, { method: "POST" });
    return handleRes<{ added: number; total: number }>(res);
  },
};
