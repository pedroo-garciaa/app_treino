"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { DiaAgenda, MesAgenda, Treino } from "@/lib/types";

const DIAS_CURTO = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const MESES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

export default function AgendaPage() {
  const hoje = new Date().toISOString().slice(0, 10);
  const [ano, setAno] = useState(() => new Date().getFullYear());
  const [mes, setMes] = useState(() => new Date().getMonth() + 1);
  const [mesAgenda, setMesAgenda] = useState<MesAgenda | null>(null);
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [anotacoes, setAnotacoes] = useState("");
  const [loading, setLoading] = useState(true);
  const [addTreinoDia, setAddTreinoDia] = useState<string | null>(null);
  const [savingAnotacoes, setSavingAnotacoes] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [agendaRes, treinosRes] = await Promise.all([
        api.getAgendaMes(ano, mes),
        api.getTreinos(),
      ]);
      setMesAgenda(agendaRes);
      setAnotacoes(agendaRes.anotacoes ?? "");
      setTreinos(Array.isArray(treinosRes) ? treinosRes : []);
    } catch {
      setMesAgenda(null);
      setTreinos([]);
    } finally {
      setLoading(false);
    }
  }, [ano, mes]);

  useEffect(() => {
    load();
  }, [load]);

  const anterior = () => {
    if (mes === 1) {
      setMes(12);
      setAno((a) => a - 1);
    } else {
      setMes((m) => m - 1);
    }
  };

  const proxima = () => {
    if (mes === 12) {
      setMes(1);
      setAno((a) => a + 1);
    } else {
      setMes((m) => m + 1);
    }
  };

  const salvarAnotacoes = useCallback(async () => {
    if (savingAnotacoes) return;
    setSavingAnotacoes(true);
    try {
      const res = await api.agendaAnotacoes(ano, mes, anotacoes);
      setMesAgenda(res);
    } finally {
      setSavingAnotacoes(false);
    }
  }, [ano, mes, anotacoes]);

  const toggleFoi = async (data: string, foi: boolean) => {
    try {
      const res = await api.agendaFoi(data, !foi, ano, mes);
      setMesAgenda(res as MesAgenda);
    } catch {
      load();
    }
  };

  const adicionarTreino = async (data: string, treinoId: string) => {
    try {
      const res = await api.agendaAddTreino(data, treinoId, ano, mes);
      setMesAgenda(res as MesAgenda);
      setAddTreinoDia(null);
    } catch {
      load();
    }
  };

  const removerTreino = async (data: string, treinoId: string) => {
    try {
      const res = await api.agendaRemoveTreino(data, treinoId, ano, mes);
      setMesAgenda(res as MesAgenda);
    } catch {
      load();
    }
  };

  const celulas: DiaAgenda[] = mesAgenda?.dias ?? [];

  if (loading) {
    return (
      <main className="space-y-6">
        <Link href="/" className="btn-ghost inline-block">← Voltar</Link>
        <p className="text-[var(--muted)]">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col gap-6">
      {/* Cabeçalho: voltar + mês/ano + navegação */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="btn-ghost order-2 sm:order-1">← Voltar</Link>
        <div className="order-1 flex w-full flex-1 items-center justify-center gap-4 sm:order-2 sm:w-auto">
          <button
            type="button"
            onClick={anterior}
            className="btn-ghost rounded-full p-2"
            aria-label="Mês anterior"
          >
            ←
          </button>
          <h1 className="text-center text-xl font-semibold uppercase tracking-wide text-[var(--text)] sm:text-2xl">
            {MESES[mes - 1]} {ano}
          </h1>
          <button
            type="button"
            onClick={proxima}
            className="btn-ghost rounded-full p-2"
            aria-label="Próximo mês"
          >
            →
          </button>
        </div>
        <div className="order-3 hidden w-20 sm:block" aria-hidden />
      </header>

      {!mesAgenda?.dias?.length ? (
        <div className="card flex-1 text-center">
          <p className="text-[var(--muted)]">Não foi possível carregar a agenda.</p>
          <button type="button" onClick={() => load()} className="btn-primary mt-3">
            Tentar de novo
          </button>
        </div>
      ) : (
        <>
          {/* Área principal: calendário ocupa o espaço; anotações ao lado em telas grandes */}
          <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-row lg:gap-8">
            {/* Calendario ocupa a largura disponivel */}
            <div className="min-w-0 flex-1">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-card)]/50 overflow-hidden">
                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 border-b-2 border-[var(--border)]">
                  {DIAS_CURTO.map((d) => (
                    <div
                      key={d}
                      className="bg-[var(--surface-card)] py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                {/* Grid do mês: apenas os dias do mês, 7 colunas */}
                <div className="grid grid-cols-7 border-l border-t border-[var(--border)]">
                  {celulas.map((dia) => (
                    <div
                      key={dia.data}
                      className="min-h-[5.5rem] border-b border-r border-[var(--border)] border-dashed bg-[var(--surface-card)]/20 sm:min-h-[6.5rem]"
                    >
                      <article
                        className={`flex h-full min-h-[5.25rem] flex-col p-2 sm:min-h-[6.25rem] sm:p-2.5 ${
                          dia.data === hoje ? "bg-[var(--accent-soft)]" : "bg-[var(--bg)]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-[var(--text)]">
                            {new Date(dia.data + "T12:00:00").getDate()}
                          </span>
                          {dia.data === hoje && (
                            <span className="rounded bg-[var(--accent)]/30 px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)]">
                              Hoje
                            </span>
                          )}
                        </div>
                        <label className="mt-1.5 flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={dia.foi}
                            onChange={() => toggleFoi(dia.data, dia.foi)}
                            className="h-4 w-4 rounded border-[var(--border)] bg-[var(--surface)] text-[var(--accent)]"
                          />
                          <span className="text-xs text-[var(--muted)]">Fui</span>
                        </label>
                        <div className="mt-1 flex-1 min-h-0 space-y-1 overflow-hidden">
                          {dia.treinos.slice(0, 3).map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center gap-1 rounded bg-[var(--surface)]/80 px-1.5 py-0.5 text-xs"
                            >
                              <Link
                                href={`/treino/${t.id}`}
                                className="min-w-0 flex-1 truncate text-[var(--accent)] hover:underline"
                                title={t.nome}
                              >
                                {t.nome}
                              </Link>
                              <button
                                type="button"
                                onClick={() => removerTreino(dia.data, t.id)}
                                className="shrink-0 rounded p-0.5 hover:bg-red-500/20 hover:text-red-400"
                                aria-label={`Remover ${t.nome}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {dia.treinos.length > 3 && (
                            <span className="text-xs text-[var(--muted)]">+{dia.treinos.length - 3}</span>
                          )}
                        </div>
                        <div className="mt-1.5">
                          {addTreinoDia === dia.data ? (
                            <select
                              className="input w-full py-1.5 text-xs"
                              value=""
                              onChange={(e) => {
                                const id = e.target.value;
                                if (id) adicionarTreino(dia.data, id);
                              }}
                              onBlur={() => setAddTreinoDia(null)}
                              autoFocus
                            >
                              <option value="">+ Treino</option>
                              {treinos
                                .filter((t) => !dia.treinos.some((dt) => dt.id === t.id))
                                .map((t) => (
                                  <option key={t.id} value={t.id}>{t.nome}</option>
                                ))}
                              {treinos.filter((t) => !dia.treinos.some((dt) => dt.id === t.id)).length === 0 && (
                                <option value="" disabled>Nenhum</option>
                              )}
                            </select>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAddTreinoDia(dia.data)}
                              className="w-full rounded-lg border border-dashed border-[var(--border)] py-1.5 text-xs text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                            >
                              + Treino
                            </button>
                          )}
                        </div>
                      </article>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Anotacoes ao lado em desktop */}
            <aside className="w-full shrink-0 lg:w-80">
              <div className="card sticky top-4 flex flex-col lg:min-h-[420px]">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Anotações
                </label>
                <textarea
                  value={anotacoes}
                  onChange={(e) => setAnotacoes(e.target.value)}
                  onBlur={salvarAnotacoes}
                  placeholder="Notas do mês, metas, observações..."
                  className="input min-h-[140px] flex-1 resize-y text-sm lg:min-h-[320px]"
                  rows={6}
                />
                {savingAnotacoes && (
                  <p className="mt-1 text-xs text-[var(--muted)]">Salvando...</p>
                )}
              </div>
            </aside>
          </div>

          {/* Treinos cadastrados em baixo */}
          {treinos.length > 0 && (
            <section className="card shrink-0">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Treinos cadastrados
              </h3>
              <ul className="flex flex-wrap gap-2">
                {treinos.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/treino/${t.id}`}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                    >
                      {t.nome}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Use &quot;+ Treino&quot; em cada dia do calendário para associar um treino.
              </p>
            </section>
          )}
        </>
      )}
    </main>
  );
}
