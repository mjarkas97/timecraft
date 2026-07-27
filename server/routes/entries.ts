import { Router } from 'express'
import type { TimeEntry } from '../../src/types'
import { db } from '../db'

interface EntryRow {
  id: string
  start: number
  end: number | null
  project_id: string | null
  timecreated: number
  timemodified: number
}

function toEntry(row: EntryRow): TimeEntry {
  return {
    id: row.id,
    start: row.start,
    end: row.end,
    project: row.project_id,
    timecreated: row.timecreated,
    timemodified: row.timemodified,
  }
}

export const entriesRouter = Router()

entriesRouter.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM time_entries ORDER BY start ASC').all() as EntryRow[]
  res.json(rows.map(toEntry))
})

entriesRouter.post('/clock-in', (req, res) => {
  const active = db.prepare('SELECT * FROM time_entries WHERE "end" IS NULL').get()
  if (active) {
    res.status(409).json({ error: 'already clocked in' })
    return
  }

  const { project } = req.body as { project: string | null }
  const now = Date.now()
  const row: EntryRow = {
    id: crypto.randomUUID(),
    start: now,
    end: null,
    project_id: project ?? null,
    timecreated: now,
    timemodified: now,
  }

  db.prepare(
    'INSERT INTO time_entries (id, start, "end", project_id, timecreated, timemodified) VALUES (@id, @start, @end, @project_id, @timecreated, @timemodified)',
  ).run(row)

  res.status(201).json(toEntry(row))
})

entriesRouter.post('/clock-out', (_req, res) => {
  const active = db.prepare('SELECT * FROM time_entries WHERE "end" IS NULL').get() as EntryRow | undefined
  if (!active) {
    res.status(409).json({ error: 'not clocked in' })
    return
  }

  const now = Date.now()
  db.prepare('UPDATE time_entries SET "end" = ?, timemodified = ? WHERE id = ?').run(now, now, active.id)

  res.json(toEntry({ ...active, end: now, timemodified: now }))
})

entriesRouter.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM time_entries WHERE id = ?').get(req.params.id) as EntryRow | undefined
  if (!existing) {
    res.status(404).json({ error: 'entry not found' })
    return
  }

  const patch = req.body as Partial<{ start: number; end: number | null; project: string | null }>
  const updated: EntryRow = {
    ...existing,
    start: patch.start ?? existing.start,
    end: 'end' in patch ? (patch.end ?? null) : existing.end,
    project_id: 'project' in patch ? (patch.project ?? null) : existing.project_id,
    timemodified: Date.now(),
  }

  db.prepare(
    'UPDATE time_entries SET start = @start, "end" = @end, project_id = @project_id, timemodified = @timemodified WHERE id = @id',
  ).run(updated)

  res.json(toEntry(updated))
})

entriesRouter.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM time_entries WHERE id = ?').run(req.params.id)
  if (result.changes === 0) {
    res.status(404).json({ error: 'entry not found' })
    return
  }
  res.status(204).end()
})
