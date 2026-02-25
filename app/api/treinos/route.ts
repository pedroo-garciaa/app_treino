import { NextResponse } from "next/server";
import { getAllTreinos, saveTreino } from "@/lib/db";
import type { Treino } from "@/lib/types";

export async function GET() {
  try {
    const treinos = getAllTreinos();
    return NextResponse.json(treinos);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao listar treinos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Treino;
    const saved = saveTreino(body);
    return NextResponse.json(saved);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao salvar treino" },
      { status: 500 }
    );
  }
}
