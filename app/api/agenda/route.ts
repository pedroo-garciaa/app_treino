import { NextResponse } from "next/server";
import { getAgendaSemana, getAgendaMes, getAgendaAnotacoes, saveAgendaAnotacoes, setDiaFoi, addDiaTreino, removeDiaTreino } from "@/lib/db";
import type { DiaAgenda, MesAgenda } from "@/lib/types";

export const dynamic = "force-dynamic";

function getSegundaFeira(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const anoParam = searchParams.get("ano");
    const mesParam = searchParams.get("mes");
    if (anoParam != null && mesParam != null) {
      const ano = parseInt(anoParam, 10);
      const mes = parseInt(mesParam, 10);
      if (!Number.isFinite(ano) || !Number.isFinite(mes) || mes < 1 || mes > 12) {
        return NextResponse.json({ error: "Ano/mês inválido" }, { status: 400 });
      }
      const dias = getAgendaMes(ano, mes);
      const anotacoes = getAgendaAnotacoes(ano, mes);
      const payload: MesAgenda = { ano, mes, dias, anotacoes };
      return NextResponse.json(payload);
    }
    const segParam = searchParams.get("segunda");
    const segunda = segParam && /^\d{4}-\d{2}-\d{2}$/.test(segParam)
      ? segParam
      : getSegundaFeira(new Date());
    const dias = getAgendaSemana(segunda);
    return NextResponse.json({ segunda, dias });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao carregar agenda" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action: "foi" | "addTreino" | "removeTreino" | "anotacoes";
      data?: string;
      foi?: boolean;
      treinoId?: string;
      ano?: number;
      mes?: number;
      texto?: string;
    };
    const { action, data } = body;
    if (action === "anotacoes") {
      if (typeof body.ano !== "number" || typeof body.mes !== "number") {
        return NextResponse.json({ error: "ano e mes obrigatórios" }, { status: 400 });
      }
      saveAgendaAnotacoes(body.ano, body.mes, body.texto ?? "");
      const dias = getAgendaMes(body.ano, body.mes);
      const anotacoes = getAgendaAnotacoes(body.ano, body.mes);
      return NextResponse.json({ ano: body.ano, mes: body.mes, dias, anotacoes });
    }
    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return NextResponse.json({ error: "Data inválida" }, { status: 400 });
    }
    switch (action) {
      case "foi":
        setDiaFoi(data, Boolean(body.foi));
        break;
      case "addTreino":
        if (!body.treinoId) return NextResponse.json({ error: "treinoId obrigatório" }, { status: 400 });
        addDiaTreino(data, body.treinoId);
        break;
      case "removeTreino":
        if (!body.treinoId) return NextResponse.json({ error: "treinoId obrigatório" }, { status: 400 });
        removeDiaTreino(data, body.treinoId);
        break;
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }
    if (typeof body.ano === "number" && typeof body.mes === "number") {
      const dias = getAgendaMes(body.ano, body.mes);
      const anotacoes = getAgendaAnotacoes(body.ano, body.mes);
      return NextResponse.json({ ano: body.ano, mes: body.mes, dias, anotacoes });
    }
    const segunda = getSegundaFeira(new Date(data));
    const dias: DiaAgenda[] = getAgendaSemana(segunda);
    return NextResponse.json({ segunda, dias });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao atualizar agenda" },
      { status: 500 }
    );
  }
}
