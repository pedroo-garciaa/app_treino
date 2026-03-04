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

// Perfil do usuário (personalização)
export type UnidadePeso = "kg" | "lb";

export interface PerfilUsuario {
  nome: string;
  unidadePeso: UnidadePeso;
}

// Dados corporais para cálculos metabólicos e nutricionais
export type Sexo = "M" | "F";

export type NivelAtividade =
  | "sedentario"
  | "leve"
  | "moderado"
  | "ativo"
  | "muito_ativo";

export interface DadosCorporais {
  pesoKg: number;
  alturaCm: number;
  idade: number;
  sexo: Sexo;
  nivelAtividade: NivelAtividade;
}

// Agenda semanal: por dia, se foi à academia e quais treinos estão planejados
export interface DiaAgenda {
  data: string; // YYYY-MM-DD
  foi: boolean;
  treinos: { id: string; nome: string }[];
}

export interface SemanaAgenda {
  segunda: string;
  dias: DiaAgenda[];
}

export interface MesAgenda {
  ano: number;
  mes: number;
  dias: DiaAgenda[];
  anotacoes?: string;
}

// Resultados calculados (apenas leitura no front)
export interface MetricasCorporais {
  bmr: number; // taxa metabólica basal (kcal/dia)
  tdee: number; // gasto energético total (kcal/dia)
  imc: number;
  imcClassificacao: string;
  proteinaMin: number; // g/dia para hipertrofia (1.6 g/kg)
  proteinaMax: number; // g/dia (2.2 g/kg)
  aguaMl: number; // ml/dia sugerido (~35 ml/kg)
}
