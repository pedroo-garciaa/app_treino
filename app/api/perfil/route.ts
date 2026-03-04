import { NextResponse } from "next/server";
import { getPerfil, savePerfil } from "@/lib/db";
import type { PerfilUsuario } from "@/lib/types";

export async function GET() {
  try {
    const perfil = getPerfil();
    return NextResponse.json(perfil);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao carregar perfil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as PerfilUsuario;
    if (body.unidadePeso !== "kg" && body.unidadePeso !== "lb") {
      return NextResponse.json(
        { error: "unidadePeso deve ser 'kg' ou 'lb'" },
        { status: 400 }
      );
    }
    const perfil = savePerfil({
      nome: String(body.nome ?? "").trim(),
      unidadePeso: body.unidadePeso,
    });
    return NextResponse.json(perfil);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao salvar perfil" },
      { status: 500 }
    );
  }
}
