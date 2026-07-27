import { Router } from 'express'
import type Database from 'better-sqlite3'
import type { Project } from '../../src/types'

const DEFAULT_COLORS = ['#5b8cff', '#ff6b5b', '#5bd6a3', '#f0b94d', '#c07bff', '#4dd0e1']

export function createProjectsRouter(db: Database.Database) {
  const projectsRouter = Router()

  projectsRouter.get('/', (_req, res) => {
    const projects = db.prepare('SELECT * FROM projects ORDER BY timecreated ASC').all() as Project[]
    res.json(projects)
  })

  projectsRouter.post('/', (req, res) => {
    const { name, color } = req.body as { name?: string; color?: string }
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'name is required' })
      return
    }

    const now = Date.now()
    const count = (db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number }).count
    const project: Project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color: color ?? DEFAULT_COLORS[count % DEFAULT_COLORS.length],
      timecreated: now,
      timemodified: now,
    }

    db.prepare(
      'INSERT INTO projects (id, name, color, timecreated, timemodified) VALUES (@id, @name, @color, @timecreated, @timemodified)',
    ).run(project)

    res.status(201).json(project)
  })

  projectsRouter.patch('/:id', (req, res) => {
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as Project | undefined
    if (!existing) {
      res.status(404).json({ error: 'project not found' })
      return
    }

    const { name, color } = req.body as { name?: string; color?: string }
    const updated: Project = {
      ...existing,
      name: name ?? existing.name,
      color: color ?? existing.color,
      timemodified: Date.now(),
    }

    db.prepare('UPDATE projects SET name = @name, color = @color, timemodified = @timemodified WHERE id = @id').run(
      updated,
    )

    res.json(updated)
  })

  projectsRouter.delete('/:id', (req, res) => {
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
    if (result.changes === 0) {
      res.status(404).json({ error: 'project not found' })
      return
    }
    res.status(204).end()
  })

  return projectsRouter
}
