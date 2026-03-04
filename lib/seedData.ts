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

/** Push / Pull / Legs */
export function getTreinosPPL(): Treino[] {
  const now = new Date().toISOString();
  return [
    {
      id: "seed-push",
      nome: "PUSH (Peito, Ombro, Tríceps)",
      criadoEm: now,
      atualizadoEm: now,
      exercicios: [
        exercicio("seed-push", "Supino reto com barra", 4, 0),
        exercicio("seed-push", "Supino inclinado com halteres", 3, 1),
        exercicio("seed-push", "Desenvolvimento com halteres ou barra", 3, 2),
        exercicio("seed-push", "Elevação lateral", 3, 3),
        exercicio("seed-push", "Tríceps na polia (corda)", 3, 4),
        exercicio("seed-push", "Tríceps francês ou mergulho em banco", 3, 5),
      ],
    },
    {
      id: "seed-pull",
      nome: "PULL (Costas, Bíceps, Posterior de Ombro)",
      criadoEm: now,
      atualizadoEm: now,
      exercicios: [
        exercicio("seed-pull", "Barra fixa (ou puxada na frente)", 4, 0),
        exercicio("seed-pull", "Puxada na frente na polia", 3, 1),
        exercicio("seed-pull", "Remada curvada com barra", 3, 2),
        exercicio("seed-pull", "Face pull", 3, 3),
        exercicio("seed-pull", "Rosca direta com barra", 3, 4),
        exercicio("seed-pull", "Rosca alternada com halteres", 3, 5),
      ],
    },
    {
      id: "seed-legs",
      nome: "LEGS (Pernas Completas)",
      criadoEm: now,
      atualizadoEm: now,
      exercicios: [
        exercicio("seed-legs", "Agachamento livre", 4, 0),
        exercicio("seed-legs", "Leg press", 3, 1),
        exercicio("seed-legs", "Cadeira extensora", 3, 2),
        exercicio("seed-legs", "Mesa flexora", 3, 3),
        exercicio("seed-legs", "Stiff (levantamento romeno)", 3, 4),
        exercicio("seed-legs", "Panturrilha em pé ou sentado", 4, 5),
      ],
    },
  ];
}
