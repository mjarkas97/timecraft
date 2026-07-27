import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createDb } from './db'

function seedProject(db: ReturnType<typeof createDb>, id: string) {
  const now = Date.now()
  db.prepare(
    'INSERT INTO projects (id, name, color, timecreated, timemodified) VALUES (?, ?, ?, ?, ?)',
  ).run(id, 'Test Project', '#5b8cff', now, now)
}

function seedEntry(db: ReturnType<typeof createDb>, id: string, projectId: string | null) {
  const now = Date.now()
  db.prepare(
    'INSERT INTO time_entries (id, start, "end", project_id, timecreated, timemodified) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, now, null, projectId, now, now)
}

test('creates projects and time_entries tables', () => {
  const db = createDb(':memory:')
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all() as { name: string }[]
  assert.deepEqual(
    tables.map((t) => t.name),
    ['projects', 'time_entries'],
  )
})

test('enables the foreign_keys pragma', () => {
  const db = createDb(':memory:')
  const result = db.pragma('foreign_keys', { simple: true })
  assert.equal(result, 1)
})

test('inserts and reads back a project', () => {
  const db = createDb(':memory:')
  seedProject(db, 'p1')
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get('p1') as { name: string }
  assert.equal(project.name, 'Test Project')
})

test('inserts a time entry referencing a project', () => {
  const db = createDb(':memory:')
  seedProject(db, 'p1')
  seedEntry(db, 'e1', 'p1')
  const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get('e1') as { project_id: string }
  assert.equal(entry.project_id, 'p1')
})

test('rejects a time entry referencing a nonexistent project', () => {
  const db = createDb(':memory:')
  assert.throws(() => seedEntry(db, 'e1', 'does-not-exist'), /FOREIGN KEY constraint failed/)
})

test('deleting a project sets referencing entries project_id to null (ON DELETE SET NULL)', () => {
  const db = createDb(':memory:')
  seedProject(db, 'p1')
  seedEntry(db, 'e1', 'p1')

  db.prepare('DELETE FROM projects WHERE id = ?').run('p1')

  const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get('e1') as { project_id: string | null }
  assert.equal(entry.project_id, null)
})

test('updates a time entry', () => {
  const db = createDb(':memory:')
  seedEntry(db, 'e1', null)
  const end = Date.now()

  db.prepare('UPDATE time_entries SET "end" = ?, timemodified = ? WHERE id = ?').run(end, end, 'e1')

  const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get('e1') as { end: number }
  assert.equal(entry.end, end)
})

test('deletes a time entry', () => {
  const db = createDb(':memory:')
  seedEntry(db, 'e1', null)

  const result = db.prepare('DELETE FROM time_entries WHERE id = ?').run('e1')

  assert.equal(result.changes, 1)
  const entry = db.prepare('SELECT * FROM time_entries WHERE id = ?').get('e1')
  assert.equal(entry, undefined)
})
