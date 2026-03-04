"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PerfilUsuario, UnidadePeso } from "@/lib/types";

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilUsuario>({ nome: "", unidadePeso: "kg" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await api.getPerfil();
      setPerfil(p);
    } catch {
      setPerfil({ nome: "", unidadePeso: "kg" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api.savePerfil(perfil);
      setMsg({ type: "ok", text: "Perfil salvo." });
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
        <Link href="/" className="btn-ghost inline-block">
          ← Voltar
        </Link>
        <p className="text-[var(--muted)]">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="btn-ghost">
          ← Voltar
        </Link>
        <h2 className="text-lg font-semibold text-[var(--text)]">Meu perfil</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted)]">
              Nome
            </label>
            <input
              type="text"
              className="input"
              placeholder="Seu nome ou apelido"
              value={perfil.nome}
              onChange={(e) => setPerfil((p) => ({ ...p, nome: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--muted)]">
              Unidade de peso (carga)
            </label>
            <select
              className="input"
              value={perfil.unidadePeso}
              onChange={(e) =>
                setPerfil((p) => ({ ...p, unidadePeso: e.target.value as UnidadePeso }))
              }
            >
              <option value="kg">Quilogramas (kg)</option>
              <option value="lb">Libras (lb)</option>
            </select>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Usada ao registrar a carga nos exercícios.
            </p>
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

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar perfil"}
        </button>
      </form>
    </main>
  );
}
