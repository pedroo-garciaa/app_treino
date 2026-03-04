import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { Treino, Exercicio, Serie, PerfilUsuario, DadosCorporais, NivelAtividade, DiaAgenda } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "treino.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new Database(DB_PATH);
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.pragma("foreign_keys = ON");
  database.exec(`
    CREATE TABLE IF NOT EXISTS treinos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS exercicios (
      id TEXT PRIMARY KEY,
      treino_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS series (
      id TEXT PRIMARY KEY,
      exercicio_id TEXT NOT NULL,
      carga REAL NOT NULL DEFAULT 0,
      repeticoes INTEGER NOT NULL DEFAULT 0,
      concluida INTEGER NOT NULL DEFAULT 0,
      ordem INTEGER NOT NULL,
      FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_exercicios_treino ON exercicios(treino_id);
    CREATE INDEX IF NOT EXISTS idx_series_exercicio ON series(exercicio_id);
    CREATE TABLE IF NOT EXISTS perfil (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      nome TEXT NOT NULL DEFAULT '',
      unidade_peso TEXT NOT NULL DEFAULT 'kg' CHECK (unidade_peso IN ('kg', 'lb'))
    );
    INSERT OR IGNORE INTO perfil (id, nome, unidade_peso) VALUES (1, '', 'kg');
    CREATE TABLE IF NOT EXISTS dados_corporais (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      peso_kg REAL,
      altura_cm REAL,
      idade INTEGER,
      sexo TEXT CHECK (sexo IN ('M', 'F')),
      nivel_atividade TEXT CHECK (nivel_atividade IN ('sedentario', 'leve', 'moderado', 'ativo', 'muito_ativo'))
    );
    INSERT OR IGNORE INTO dados_corporais (id) VALUES (1);
    CREATE TABLE IF NOT EXISTS dia_academia (
      data TEXT PRIMARY KEY,
      foi INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS dia_treino (
      data TEXT NOT NULL,
      treino_id TEXT NOT NULL,
      PRIMARY KEY (data, treino_id),
      FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_dia_treino_data ON dia_treino(data);
    CREATE TABLE IF NOT EXISTS agenda_anotacoes (
      ano INTEGER NOT NULL,
      mes INTEGER NOT NULL,
      texto TEXT NOT NULL DEFAULT '',
      PRIMARY KEY (ano, mes)
    );
  `);
}

function rowToSerie(row: { id: string; carga: number; repeticoes: number; concluida: number }): Serie {
  return {
    id: row.id,
    carga: row.carga,
    repeticoes: row.repeticoes,
    concluida: Boolean(row.concluida),
  };
}

function rowToExercicio(
  row: { id: string; nome: string },
  series: Serie[]
): Exercicio {
  return {
    id: row.id,
    nome: row.nome,
    series,
  };
}

function treinoFromDb(database: Database.Database, id: string): Treino | null {
  const t = database.prepare("SELECT id, nome, criado_em, atualizado_em FROM treinos WHERE id = ?").get(id) as { id: string; nome: string; criado_em: string; atualizado_em: string } | undefined;
  if (!t) return null;
  const exerciciosRows = database.prepare("SELECT id, nome, ordem FROM exercicios WHERE treino_id = ? ORDER BY ordem").all(id) as { id: string; nome: string; ordem: number }[];
  const exercicios: Exercicio[] = exerciciosRows.map((ex) => {
    const seriesRows = database.prepare("SELECT id, carga, repeticoes, concluida, ordem FROM series WHERE exercicio_id = ? ORDER BY ordem").all(ex.id) as { id: string; carga: number; repeticoes: number; concluida: number; ordem: number }[];
    const series = seriesRows.map((s) => rowToSerie(s));
    return rowToExercicio(ex, series);
  });
  return {
    id: t.id,
    nome: t.nome,
    criadoEm: t.criado_em,
    atualizadoEm: t.atualizado_em,
    exercicios,
  };
}

export function getAllTreinos(): Treino[] {
  const database = getDb();
  const rows = database.prepare("SELECT id FROM treinos ORDER BY atualizado_em DESC").all() as { id: string }[];
  return rows.map((r) => treinoFromDb(database, r.id)!);
}

export function getTreinoById(id: string): Treino | null {
  return treinoFromDb(getDb(), id);
}

export function saveTreino(treino: Treino): Treino {
  const database = getDb();
  const now = new Date().toISOString();
  const criadoEm = treino.criadoEm || now;
  const atualizadoEm = now;

  database.transaction(() => {
    database.prepare(
      "INSERT OR REPLACE INTO treinos (id, nome, criado_em, atualizado_em) VALUES (?, ?, ?, ?)"
    ).run(treino.id, treino.nome, criadoEm, atualizadoEm);

    database.prepare("DELETE FROM exercicios WHERE treino_id = ?").run(treino.id);

    treino.exercicios.forEach((ex, exIdx) => {
      database.prepare(
        "INSERT INTO exercicios (id, treino_id, nome, ordem) VALUES (?, ?, ?, ?)"
      ).run(ex.id, treino.id, ex.nome, exIdx);
      ex.series.forEach((s, sIdx) => {
        database.prepare(
          "INSERT INTO series (id, exercicio_id, carga, repeticoes, concluida, ordem) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(s.id, ex.id, s.carga, s.repeticoes, s.concluida ? 1 : 0, sIdx);
      });
    });
  })();

  return {
    ...treino,
    criadoEm: criadoEm,
    atualizadoEm: atualizadoEm,
  };
}

export function deleteTreino(id: string): void {
  const database = getDb();
  const exIds = database.prepare("SELECT id FROM exercicios WHERE treino_id = ?").all(id) as { id: string }[];
  database.transaction(() => {
    exIds.forEach(({ id: exId }) => database.prepare("DELETE FROM series WHERE exercicio_id = ?").run(exId));
    database.prepare("DELETE FROM exercicios WHERE treino_id = ?").run(id);
    database.prepare("DELETE FROM treinos WHERE id = ?").run(id);
  })();
}

export function seedTreinosAvancados(treinos: Treino[]): number {
  const database = getDb();
  let added = 0;
  for (const t of treinos) {
    const exists = database.prepare("SELECT 1 FROM treinos WHERE id = ?").get(t.id);
    if (!exists) {
      saveTreino(t);
      added++;
    }
  }
  return added;
}

const PERFIL_ID = 1;

export function getPerfil(): PerfilUsuario {
  const database = getDb();
  const row = database.prepare("SELECT nome, unidade_peso FROM perfil WHERE id = ?").get(PERFIL_ID) as { nome: string; unidade_peso: string } | undefined;
  if (!row) return { nome: "", unidadePeso: "kg" };
  return {
    nome: row.nome ?? "",
    unidadePeso: (row.unidade_peso === "lb" ? "lb" : "kg") as PerfilUsuario["unidadePeso"],
  };
}

export function savePerfil(perfil: PerfilUsuario): PerfilUsuario {
  const database = getDb();
  database.prepare("UPDATE perfil SET nome = ?, unidade_peso = ? WHERE id = ?").run(perfil.nome, perfil.unidadePeso, PERFIL_ID);
  return perfil;
}

const DADOS_CORPORAIS_ID = 1;

export function getDadosCorporais(): DadosCorporais | null {
  const database = getDb();
  const row = database.prepare(
    "SELECT peso_kg, altura_cm, idade, sexo, nivel_atividade FROM dados_corporais WHERE id = ?"
  ).get(DADOS_CORPORAIS_ID) as { peso_kg: number | null; altura_cm: number | null; idade: number | null; sexo: string | null; nivel_atividade: string | null } | undefined;
  if (!row || row.peso_kg == null || row.altura_cm == null || row.idade == null || !row.sexo || !row.nivel_atividade) return null;
  return {
    pesoKg: row.peso_kg,
    alturaCm: row.altura_cm,
    idade: row.idade,
    sexo: row.sexo === "F" ? "F" : "M",
    nivelAtividade: (row.nivel_atividade || "moderado") as NivelAtividade,
  };
}

export function saveDadosCorporais(dados: DadosCorporais): DadosCorporais {
  const database = getDb();
  database.prepare(
    "UPDATE dados_corporais SET peso_kg = ?, altura_cm = ?, idade = ?, sexo = ?, nivel_atividade = ? WHERE id = ?"
  ).run(dados.pesoKg, dados.alturaCm, dados.idade, dados.sexo, dados.nivelAtividade, DADOS_CORPORAIS_ID);
  return dados;
}

// --- Agenda semanal (segunda = 0, domingo = 6)
function getSegundaFeira(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getAgendaSemana(segundaFeira: string): DiaAgenda[] {
  const database = getDb();
  const dias: DiaAgenda[] = [];
  for (let i = 0; i < 7; i++) {
    const data = addDays(segundaFeira, i);
    const row = database.prepare("SELECT foi FROM dia_academia WHERE data = ?").get(data) as { foi: number } | undefined;
    const treinoRows = database.prepare("SELECT t.id, t.nome FROM dia_treino dt JOIN treinos t ON t.id = dt.treino_id WHERE dt.data = ? ORDER BY t.nome").all(data) as { id: string; nome: string }[];
    dias.push({
      data,
      foi: Boolean(row?.foi),
      treinos: treinoRows,
    });
  }
  return dias;
}

export function setDiaFoi(data: string, foi: boolean): void {
  const database = getDb();
  database.prepare("INSERT INTO dia_academia (data, foi) VALUES (?, ?) ON CONFLICT(data) DO UPDATE SET foi = ?").run(data, foi ? 1 : 0, foi ? 1 : 0);
}

/** Um único treino por dia: ao adicionar, substitui qualquer treino já associado a esse dia. */
export function addDiaTreino(data: string, treinoId: string): void {
  const database = getDb();
  database.prepare("DELETE FROM dia_treino WHERE data = ?").run(data);
  database.prepare("INSERT INTO dia_treino (data, treino_id) VALUES (?, ?)").run(data, treinoId);
}

export function removeDiaTreino(data: string, treinoId: string): void {
  const database = getDb();
  database.prepare("DELETE FROM dia_treino WHERE data = ? AND treino_id = ?").run(data, treinoId);
}

export function getAgendaMes(ano: number, mes: number): DiaAgenda[] {
  const database = getDb();
  const ultimoDia = new Date(ano, mes, 0);
  const totalDias = ultimoDia.getDate();
  const dias: DiaAgenda[] = [];
  for (let d = 1; d <= totalDias; d++) {
    const data = `${ano}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const row = database.prepare("SELECT foi FROM dia_academia WHERE data = ?").get(data) as { foi: number } | undefined;
    const treinoRows = database.prepare("SELECT t.id, t.nome FROM dia_treino dt JOIN treinos t ON t.id = dt.treino_id WHERE dt.data = ? ORDER BY t.nome").all(data) as { id: string; nome: string }[];
    dias.push({
      data,
      foi: Boolean(row?.foi),
      treinos: treinoRows,
    });
  }
  return dias;
}

/** Balanço do mês: quantidade de vezes que cada treino foi feito (dias com checkbox "foi" marcado e esse treino no dia). */
export function getBalancoMes(ano: number, mes: number): { id: string; nome: string; quantidade: number }[] {
  const database = getDb();
  const primeiro = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const ultimo = `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  const rows = database.prepare(`
    SELECT t.id, t.nome, COUNT(*) AS quantidade
    FROM treinos t
    JOIN dia_treino dt ON dt.treino_id = t.id
    JOIN dia_academia da ON da.data = dt.data AND da.foi = 1
    WHERE dt.data >= ? AND dt.data <= ?
    GROUP BY t.id, t.nome
    ORDER BY t.nome
  `).all(primeiro, ultimo) as { id: string; nome: string; quantidade: number }[];
  return rows;
}

export function getAgendaAnotacoes(ano: number, mes: number): string {
  const database = getDb();
  const row = database.prepare("SELECT texto FROM agenda_anotacoes WHERE ano = ? AND mes = ?").get(ano, mes) as { texto: string } | undefined;
  return row?.texto ?? "";
}

export function saveAgendaAnotacoes(ano: number, mes: number, texto: string): void {
  const database = getDb();
  database.prepare("INSERT INTO agenda_anotacoes (ano, mes, texto) VALUES (?, ?, ?) ON CONFLICT(ano, mes) DO UPDATE SET texto = ?").run(ano, mes, texto, texto);
}
