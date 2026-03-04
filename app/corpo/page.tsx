"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { calcularMetricas, labelNivelAtividade } from "@/lib/calculosCorporais";
import type { DadosCorporais, MetricasCorporais, NivelAtividade, Sexo } from "@/lib/types";

const NIVEL_OPCOES: NivelAtividade[] = ["sedentario", "leve", "moderado", "ativo", "muito_ativo"];

const dadosIniciais: DadosCorporais = {
  pesoKg: 70,
  alturaCm: 170,
  idade: 30,
  sexo: "M",
  nivelAtividade: "moderado",
};

export default function CorpoPage() {
  const [dados, setDados] = useState<DadosCorporais>(dadosIniciais);
  const [metricas, setMetricas] = useState<MetricasCorporais | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await api.getDadosCorporais();
      const ok =
        d &&
        typeof d.pesoKg === "number" &&
        typeof d.alturaCm === "number" &&
        typeof d.idade === "number" &&
        d.pesoKg > 0 &&
        d.alturaCm > 0 &&
        d.idade > 0;
      if (ok) {
        setDados({
          pesoKg: d.pesoKg,
          alturaCm: d.alturaCm,
          idade: d.idade,
          sexo: d.sexo === "F" ? "F" : "M",
          nivelAtividade: (["sedentario", "leve", "moderado", "ativo", "muito_ativo"].includes(d.nivelAtividade) ? d.nivelAtividade : "moderado") as NivelAtividade,
        });
        setMetricas(calcularMetricas(d));
      } else {
        setMetricas(null);
      }
    } catch {
      setMetricas(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const atualizarMetricas = useCallback(() => {
    if (dados.pesoKg > 0 && dados.alturaCm > 0 && dados.idade > 0) {
      setMetricas(calcularMetricas(dados));
    } else {
      setMetricas(null);
    }
  }, [dados]);

  useEffect(() => {
    atualizarMetricas();
  }, [atualizarMetricas]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.saveDadosCorporais(dados);
      setMetricas(calcularMetricas(dados));
      setMsg({ type: "ok", text: "Dados salvos." });
      setTimeout(() => setMsg(null), 3000);
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="space-y-6">
        <Link href="/" className="btn-ghost inline-block">← Voltar</Link>
        <p className="text-[var(--muted)]">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="btn-ghost">← Voltar</Link>
        <h2 className="text-lg font-semibold text-[var(--text)]">Dados corporais</h2>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Preencha seus dados para ver a taxa metabólica basal, gasto calórico diário, proteína para hipertrofia e outras métricas baseadas em evidências.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Peso (kg)</label>
              <input
                type="number"
                step={0.1}
                min={20}
                max={300}
                className="input"
                value={dados.pesoKg || ""}
                onChange={(e) => setDados((d) => ({ ...d, pesoKg: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Altura (cm)</label>
              <input
                type="number"
                min={100}
                max={250}
                className="input"
                value={dados.alturaCm || ""}
                onChange={(e) => setDados((d) => ({ ...d, alturaCm: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Idade</label>
              <input
                type="number"
                min={10}
                max={120}
                className="input"
                value={dados.idade || ""}
                onChange={(e) => setDados((d) => ({ ...d, idade: parseInt(e.target.value, 10) || 0 }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Sexo</label>
              <select
                className="input"
                value={dados.sexo}
                onChange={(e) => setDados((d) => ({ ...d, sexo: e.target.value as Sexo }))}
              >
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted)]">Nível de atividade</label>
            <select
              className="input"
              value={dados.nivelAtividade}
              onChange={(e) => setDados((d) => ({ ...d, nivelAtividade: e.target.value as NivelAtividade }))}
            >
              {NIVEL_OPCOES.map((n) => (
                <option key={n} value={n}>{labelNivelAtividade(n)}</option>
              ))}
            </select>
          </div>
        </div>

        {msg && (
          <p
            className={
              msg.type === "ok"
                ? "rounded-lg bg-emerald-950/50 px-3 py-2 text-sm text-emerald-200"
                : "rounded-lg border border-red-500/50 bg-red-950/30 px-3 py-2 text-sm text-red-200"
            }
          >
            {msg.text}
          </p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={saving}>
          {saving ? "Salvando..." : "Salvar dados"}
        </button>
      </form>

      {metricas && (
        <div className="card space-y-4">
          <h3 className="font-medium text-[var(--text)]">Suas métricas</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-[var(--muted)]">Taxa metabólica basal (BMR)</span>
              <span className="font-medium text-[var(--text)]">{metricas.bmr} kcal/dia</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-[var(--muted)]">Gasto calórico total (TDEE)</span>
              <span className="font-medium text-[var(--text)]">{metricas.tdee} kcal/dia</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-[var(--muted)]">IMC</span>
              <span className="font-medium text-[var(--text)]">{metricas.imc} — {metricas.imcClassificacao}</span>
            </li>
            <li className="flex justify-between border-b border-[var(--border)] pb-2">
              <span className="text-[var(--muted)]">Proteína (hipertrofia)</span>
              <span className="font-medium text-[var(--text)]">{metricas.proteinaMin}–{metricas.proteinaMax} g/dia</span>
            </li>
            <li className="flex justify-between pb-0">
              <span className="text-[var(--muted)]">Água sugerida</span>
              <span className="font-medium text-[var(--text)]">~{Math.round(metricas.aguaMl / 1000)} L/dia</span>
            </li>
          </ul>
          <p className="text-xs text-[var(--muted)]">
            BMR: Mifflin-St Jeor. Proteína: 1,6–2,2 g/kg. Estes valores são orientativos; consulte um nutricionista para plano individualizado.
          </p>
        </div>
      )}
    </main>
  );
}
