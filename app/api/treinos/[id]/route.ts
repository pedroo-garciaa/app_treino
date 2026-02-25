import { NextResponse } from "next/server";
import { getTreinoById, saveTreino, deleteTreino } from "@/lib/db";
import type { Treino } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const treino = getTreinoById(id);
    if (!treino) {
      return NextResponse.json(
        { error: "Treino não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json(treino);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao buscar treino" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Treino;
    if (body.id !== id) {
      return NextResponse.json(
        { error: "ID do corpo não confere com a URL" },
        { status: 400 }
      );
    }
    const saved = saveTreino(body);
    return NextResponse.json(saved);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar treino" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteTreino(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao excluir treino" },
      { status: 500 }
    );
  }
}
