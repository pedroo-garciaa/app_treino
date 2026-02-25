import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { Treino, Exercicio, Serie } from "./types";

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
