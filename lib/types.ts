// Uma série executada: carga (kg) e número de repetições
export interface Serie {
  id: string;
  carga: number; // kg
  repeticoes: number;
  concluida: boolean;
}

// Exercício dentro de um treino (ex: Supino, Agachamento)
export interface Exercicio {
  id: string;
  nome: string;
  series: Serie[];
  observacao?: string;
}

// Treino cadastrado (ex: "Peito e Tríceps", "A", "B")
export interface Treino {
  id: string;
  nome: string;
  exercicios: Exercicio[];
  criadoEm: string; // ISO date
  atualizadoEm: string;
}

export type TreinoCreate = Omit<Treino, "id" | "criadoEm" | "atualizadoEm">;
export type ExercicioCreate = Omit<Exercicio, "id"> & { id?: string };
export type SerieCreate = Omit<Serie, "id"> & { id?: string };
