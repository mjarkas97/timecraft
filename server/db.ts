import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const DATA_DIR = path.join(import.meta.dirname, 'data')
const DB_PATH = path.join(DATA_DIR, 'timecraft.sqlite3')

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

export const db = new Database(DB_PATH)

db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

db.exec(`
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
