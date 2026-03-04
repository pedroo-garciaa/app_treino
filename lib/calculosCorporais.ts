import type { DadosCorporais, MetricasCorporais, NivelAtividade } from "./types";

/**
 * Fórmula de Mifflin-St Jeor (1990) – padrão ouro para taxa metabólica basal (BMR).
 * Mais precisa que Harris-Benedict em populações atuais (incl. obesos).
 * BMR = calorias gastas em repouso absoluto (sem digestão, termoneutralidade).
 */
function bmrMifflinStJeor(pesoKg: number, alturaCm: number, idade: number, sexo: "M" | "F"): number {
  if (sexo === "M") {
    return 10 * pesoKg + 6.25 * alturaCm - 5 * idade + 5;
  }
  return 10 * pesoKg + 6.25 * alturaCm - 5 * idade - 161;
}

const FATOR_ATIVIDADE: Record<NivelAtividade, number> = {
  sedentario: 1.2,       // pouco ou nenhum exercício
  leve: 1.375,          // 1–3 dias/semana
  moderado: 1.55,       // 3–5 dias/semana
  ativo: 1.725,        // 6–7 dias/semana
  muito_ativo: 1.9,     // atleta, 2x/dia
};

/**
 * TDEE = Total Daily Energy Expenditure (gasto energético total/dia).
 * TDEE = BMR × fator de atividade (equação amplamente utilizada em prática clínica e esportiva).
 */
function tdee(bmr: number, nivel: NivelAtividade): number {
  return Math.round(bmr * FATOR_ATIVIDADE[nivel]);
}

/**
 * IMC e classificação OMS (adultos).
 */
function imcEClassificacao(pesoKg: number, alturaCm: number): { imc: number; classificacao: string } {
  const alturaM = alturaCm / 100;
  const imc = pesoKg / (alturaM * alturaM);
  let classificacao: string;
  if (imc < 18.5) classificacao = "Abaixo do peso";
  else if (imc < 25) classificacao = "Peso normal";
  else if (imc < 30) classificacao = "Sobrepeso";
  else if (imc < 35) classificacao = "Obesidade grau I";
  else if (imc < 40) classificacao = "Obesidade grau II";
  else classificacao = "Obesidade grau III";
  return { imc: Math.round(imc * 10) / 10, classificacao };
}

/**
 * Proteína para hipertrofia: 1,6–2,2 g/kg (Morton et al., 2018; ISSN position stand).
 * 1,6 g/kg atende a maioria; até 2,2 g/kg como teto seguro e possível benefício em déficit.
 */
function proteinaHipertrofia(pesoKg: number): { min: number; max: number } {
  return {
    min: Math.round(pesoKg * 1.6),
    max: Math.round(pesoKg * 2.2),
  };
}

/**
 * Ingestão hídrica sugerida: ~35 ml/kg/dia (base para adultos ativos).
 * Ajustes por clima e suor ficam a critério do usuário.
 */
function aguaSugeridaMl(pesoKg: number): number {
  return Math.round(pesoKg * 35);
}

export function calcularMetricas(dados: DadosCorporais): MetricasCorporais {
  const bmr = Math.round(bmrMifflinStJeor(dados.pesoKg, dados.alturaCm, dados.idade, dados.sexo));
  const { imc, classificacao } = imcEClassificacao(dados.pesoKg, dados.alturaCm);
  const { min: proteinaMin, max: proteinaMax } = proteinaHipertrofia(dados.pesoKg);
  return {
    bmr,
    tdee: tdee(bmr, dados.nivelAtividade),
    imc,
    imcClassificacao: classificacao,
    proteinaMin,
    proteinaMax,
    aguaMl: aguaSugeridaMl(dados.pesoKg),
  };
}

export function labelNivelAtividade(n: NivelAtividade): string {
  const labels: Record<NivelAtividade, string> = {
    sedentario: "Sedentário (pouco ou nenhum exercício)",
    leve: "Leve (1–3 dias/semana)",
    moderado: "Moderado (3–5 dias/semana)",
    ativo: "Ativo (6–7 dias/semana)",
    muito_ativo: "Muito ativo (atleta, 2x/dia)",
  };
  return labels[n];
}
