import { NextResponse } from "next/server";
import { seedTreinosAvancados } from "@/lib/db";
import { getTreinosAvancados, getTreinosPPL } from "@/lib/seedData";

export async function POST() {
  try {
    const treinos = [...getTreinosAvancados(), ...getTreinosPPL()];
    const added = seedTreinosAvancados(treinos);
    return NextResponse.json({
      added,
      total: treinos.length,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao carregar treinos de exemplo" },
      { status: 500 }
    );
  }
}
