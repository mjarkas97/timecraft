import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const DATA_DIR = path.join(import.meta.dirname, 'data')
const DB_PATH = path.join(DATA_DIR, 'timecraft.sqlite3')

export function createDb(filename: string) {
  const database = new Database(filename)

  database.pragma('foreign_keys = ON')
  database.pragma('journal_mode = WAL')

  database.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      timecreated INTEGER NOT NULL,
      timemodified INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      start INTEGER NOT NULL,
      "end" INTEGER,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      timecreated INTEGER NOT NULL,
      timemodified INTEGER NOT NULL
    );
  `)

  return database
}

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

export const db = createDb(DB_PATH)
