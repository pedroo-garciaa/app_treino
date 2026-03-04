import type { Treino, PerfilUsuario, DadosCorporais, SemanaAgenda, MesAgenda } from "./types";

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${BASE}/api/treinos`, {
        cache: "no-store",
        signal: controller.signal,
      });
      return await handleRes<Treino[]>(res);
    } finally {
      clearTimeout(timeout);
    }
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

  async getPerfil(): Promise<PerfilUsuario> {
    const res = await fetch(`${BASE}/api/perfil`);
    return handleRes<PerfilUsuario>(res);
  },

  async savePerfil(perfil: PerfilUsuario): Promise<PerfilUsuario> {
    const res = await fetch(`${BASE}/api/perfil`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(perfil),
    });
    return handleRes<PerfilUsuario>(res);
  },

  async getDadosCorporais(): Promise<DadosCorporais | null> {
    const res = await fetch(`${BASE}/api/dados-corporais`);
    const data = await res.json();
    if (res.status !== 200) throw new Error(data?.error || "Erro");
    return data as DadosCorporais | null;
  },

  async saveDadosCorporais(dados: DadosCorporais): Promise<DadosCorporais> {
    const res = await fetch(`${BASE}/api/dados-corporais`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    return handleRes<DadosCorporais>(res);
  },

  async getAgenda(segunda?: string): Promise<SemanaAgenda> {
    const q = segunda ? `?segunda=${encodeURIComponent(segunda)}` : "";
    const res = await fetch(`${BASE}/api/agenda${q}`, { cache: "no-store" });
    return handleRes<SemanaAgenda>(res);
  },

  async getAgendaMes(ano: number, mes: number): Promise<MesAgenda> {
    const res = await fetch(`${BASE}/api/agenda?ano=${ano}&mes=${mes}`, { cache: "no-store" });
    return handleRes<MesAgenda>(res);
  },

  async agendaFoi(data: string, foi: boolean, ano?: number, mes?: number): Promise<SemanaAgenda | MesAgenda> {
    const res = await fetch(`${BASE}/api/agenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "foi", data, foi, ano, mes }),
    });
    return handleRes<SemanaAgenda | MesAgenda>(res);
  },

  async agendaAddTreino(data: string, treinoId: string, ano?: number, mes?: number): Promise<SemanaAgenda | MesAgenda> {
    const res = await fetch(`${BASE}/api/agenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addTreino", data, treinoId, ano, mes }),
    });
    return handleRes<SemanaAgenda | MesAgenda>(res);
  },

  async agendaRemoveTreino(data: string, treinoId: string, ano?: number, mes?: number): Promise<SemanaAgenda | MesAgenda> {
    const res = await fetch(`${BASE}/api/agenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "removeTreino", data, treinoId, ano, mes }),
    });
    return handleRes<SemanaAgenda | MesAgenda>(res);
  },

  async agendaAnotacoes(ano: number, mes: number, texto: string): Promise<MesAgenda> {
    const res = await fetch(`${BASE}/api/agenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "anotacoes", ano, mes, texto }),
    });
    return handleRes<MesAgenda>(res);
  },
};
