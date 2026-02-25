import type { Exercicio, Serie, Treino } from "./types";

function serie(id: string, n: number): Serie[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${id}-s${i}`,
    carga: 0,
    repeticoes: 0,
    concluida: false,
  }));
}

function exercicio(
  baseId: string,
  nome: string,
  numSeries: number,
  idx: number
): Exercicio {
  const id = `${baseId}-ex${idx}`;
  return {
    id,
    nome,
    series: serie(id, numSeries),
  };
}

export function getTreinosAvancados(): Treino[] {
  const now = new Date().toISOString();
  return [
    {
      id: "seed-upper-a",
      nome: "Upper A (Peito e Costas)",
      criadoEm: now,
      atualizadoEm: now,
      exercicios: [
        exercicio("seed-upper-a", "Supino reto com barra", 4, 0),
        exercicio("seed-upper-a", "Supino inclinado halter", 3, 1),
        exercicio("seed-upper-a", "Barra fixa pronada", 4, 2),
        exercicio("seed-upper-a", "Remada curvada barra", 3, 3),
        exercicio("seed-upper-a", "Elevação lateral halter", 3, 4),
        exercicio("seed-upper-a", "Rosca direta barra", 3, 5),
        exercicio("seed-upper-a", "Tríceps testa", 3, 6),
      ],
    },
    {
      id: "seed-lower-a",
      nome: "Lower A (Quadríceps)",
      criadoEm: now,
      atualizadoEm: now,
      exercicios: [
        exercicio("seed-lower-a", "Agachamento livre", 4, 0),
        exercicio("seed-lower-a", "Leg press", 3, 1),
        exercicio("seed-lower-a", "Cadeira extensora", 3, 2),
        exercicio("seed-lower-a", "Stiff", 3, 3),
        exercicio("seed-lower-a", "Panturrilha em pé", 4, 4),
      ],
    },
    {
      id: "seed-upper-b",
      nome: "Upper B (Ombro e Costas)",
      criadoEm: now,
      atualizadoEm: now,
      exercicios: [
        exercicio("seed-upper-b", "Desenvolvimento halter", 4, 0),
        exercicio("seed-upper-b", "Crucifixo máquina", 3, 1),
        exercicio("seed-upper-b", "Puxada na frente", 4, 2),
        exercicio("seed-upper-b", "Remada unilateral halter", 3, 3),
        exercicio("seed-upper-b", "Elevação lateral + parcial", 3, 4),
        exercicio("seed-upper-b", "Rosca alternada", 3, 5),
        exercicio("seed-upper-b", "Tríceps corda", 3, 6),
      ],
    },
    {
      id: "seed-lower-b",
      nome: "Lower B (Posterior)",
      criadoEm: now,
      atualizadoEm: now,
      exercicios: [
        exercicio("seed-lower-b", "Levantamento terra", 4, 0),
        exercicio("seed-lower-b", "Mesa flexora", 3, 1),
        exercicio("seed-lower-b", "Passada andando", 3, 2),
        exercicio("seed-lower-b", "Hip thrust", 3, 3),
        exercicio("seed-lower-b", "Panturrilha sentado", 4, 4),
      ],
    },
  ];
}
