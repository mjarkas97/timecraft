import { test } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import { createDb } from '../db'
import { createEntriesRouter } from './entries'
import { createProjectsRouter } from './projects'
import type { Project, TimeEntry } from '../../src/types'

function json<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>
}

async function startServer() {
  const db = createDb(':memory:')
  const app = express()
  app.use(express.json())
  app.use('/entries', createEntriesRouter(db))
  app.use('/projects', createProjectsRouter(db))

  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  return {
    baseUrl: `http://localhost:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve(undefined))),
  }
}

test('GET /entries returns an empty array with no entries', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const res = await fetch(`${baseUrl}/entries`)
    assert.equal(res.status, 200)
    assert.deepEqual(await json<TimeEntry[]>(res), [])
  } finally {
    await close()
  }
})

test('clock-in creates an active entry, clock-out closes it', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const clockIn = await fetch(`${baseUrl}/entries/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: null }),
    })
    assert.equal(clockIn.status, 201)
    const entry = await json<TimeEntry>(clockIn)
    assert.equal(entry.end, null)

    const clockOut = await fetch(`${baseUrl}/entries/clock-out`, { method: 'POST' })
    assert.equal(clockOut.status, 200)
    const closed = await json<TimeEntry>(clockOut)
    assert.equal(closed.id, entry.id)
    assert.ok(closed.end !== null)
  } finally {
    await close()
  }
})

test('clock-in while already clocked in returns 409', async () => {
  const { baseUrl, close } = await startServer()
  try {
    await fetch(`${baseUrl}/entries/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: null }),
    })

    const res = await fetch(`${baseUrl}/entries/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: null }),
    })
    assert.equal(res.status, 409)
  } finally {
    await close()
  }
})

test('clock-out with nothing active returns 409', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const res = await fetch(`${baseUrl}/entries/clock-out`, { method: 'POST' })
    assert.equal(res.status, 409)
  } finally {
    await close()
  }
})

test('PATCH /:id updates an entry', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const entry = await fetch(`${baseUrl}/entries/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: null }),
    }).then((r) => json<TimeEntry>(r))

    const res = await fetch(`${baseUrl}/entries/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ end: entry.start + 1000 }),
    })
    assert.equal(res.status, 200)
    const updated = await json<TimeEntry>(res)
    assert.equal(updated.end, entry.start + 1000)
  } finally {
    await close()
  }
})

test('PATCH /:id 404s for a missing entry', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const res = await fetch(`${baseUrl}/entries/does-not-exist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ end: Date.now() }),
    })
    assert.equal(res.status, 404)
  } finally {
    await close()
  }
})

test('DELETE /:id removes an entry', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const entry = await fetch(`${baseUrl}/entries/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: null }),
    }).then((r) => json<TimeEntry>(r))

    const res = await fetch(`${baseUrl}/entries/${entry.id}`, { method: 'DELETE' })
    assert.equal(res.status, 204)

    const list = await fetch(`${baseUrl}/entries`).then((r) => json<TimeEntry[]>(r))
    assert.deepEqual(list, [])
  } finally {
    await close()
  }
})

test('deleting a project through the API un-categorizes its entries', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const project = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Client Work' }),
    }).then((r) => json<Project>(r))

    const entry = await fetch(`${baseUrl}/entries/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project: project.id }),
    }).then((r) => json<TimeEntry>(r))
    assert.equal(entry.project, project.id)

    await fetch(`${baseUrl}/projects/${project.id}`, { method: 'DELETE' })

    const list = await fetch(`${baseUrl}/entries`).then((r) => json<TimeEntry[]>(r))
    assert.equal(list[0].project, null)
  } finally {
    await close()
  }
})
