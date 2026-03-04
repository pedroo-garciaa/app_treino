"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PerfilUsuario } from "@/lib/types";

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilUsuario>({ nome: "", unidadePeso: "kg" });
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const p = await api.getPerfil();
      setPerfil(p);
    } catch {
      setPerfil({ nome: "", unidadePeso: "kg" });
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const savePerfil = useCallback(async (novo: PerfilUsuario) => {
    const p = await api.savePerfil(novo);
    setPerfil(p);
    return p;
  }, []);

  return { perfil, loaded, savePerfil, refresh: load };
}
