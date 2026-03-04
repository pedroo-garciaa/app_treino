import { NextResponse } from "next/server";
import { getDadosCorporais, saveDadosCorporais } from "@/lib/db";
import type { DadosCorporais, NivelAtividade, Sexo } from "@/lib/types";

export const dynamic = "force-dynamic";

const NIVEL_VALIDOS: NivelAtividade[] = ["sedentario", "leve", "moderado", "ativo", "muito_ativo"];

function validar(dados: unknown): DadosCorporais {
  const b = dados as Record<string, unknown>;
  const pesoKg = Number(b?.pesoKg);
  const alturaCm = Number(b?.alturaCm);
  const idade = Number(b?.idade);
  if (!Number.isFinite(pesoKg) || pesoKg <= 0 || pesoKg > 300) throw new Error("Peso inválido");
  if (!Number.isFinite(alturaCm) || alturaCm <= 0 || alturaCm > 250) throw new Error("Altura inválida");
  if (!Number.isFinite(idade) || idade < 10 || idade > 120) throw new Error("Idade inválida");
  const sexo = b?.sexo === "F" ? "F" : "M";
  const nivel = NIVEL_VALIDOS.includes((b?.nivelAtividade as NivelAtividade) ?? "moderado")
    ? (b.nivelAtividade as NivelAtividade)
    : "moderado";
  return { pesoKg, alturaCm, idade, sexo, nivelAtividade: nivel };
}

export async function GET() {
  try {
    const dados = getDadosCorporais();
    return NextResponse.json(dados);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao carregar dados corporais" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const dados = validar(body);
    saveDadosCorporais(dados);
    return NextResponse.json(dados);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
