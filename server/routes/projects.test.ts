import { test } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'
import { createDb } from '../db'
import { createProjectsRouter } from './projects'
import type { Project } from '../../src/types'

function json<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>
}

async function startServer() {
  const db = createDb(':memory:')
  const app = express()
  app.use(express.json())
  app.use('/', createProjectsRouter(db))

  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0

  return {
    baseUrl: `http://localhost:${port}`,
    close: () => new Promise((resolve) => server.close(() => resolve(undefined))),
  }
}

test('GET / returns an empty array when no projects exist', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const res = await fetch(`${baseUrl}/`)
    assert.equal(res.status, 200)
    assert.deepEqual(await json<Project[]>(res), [])
  } finally {
    await close()
  }
})

test('POST / creates a project with a default color', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const res = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Deep Work' }),
    })
    assert.equal(res.status, 201)
    const project = await json<Project>(res)
    assert.equal(project.name, 'Deep Work')
    assert.match(project.color, /^#[0-9a-f]{6}$/)
    assert.ok(project.id)
  } finally {
    await close()
  }
})

test('POST / rejects a blank name', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const res = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '   ' }),
    })
    assert.equal(res.status, 400)
  } finally {
    await close()
  }
})

test('PATCH /:id updates name and color', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const created = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Deep Work' }),
    }).then((r) => json<Project>(r))

    const res = await fetch(`${baseUrl}/${created.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Renamed', color: '#ff0000' }),
    })
    assert.equal(res.status, 200)
    const updated = await json<Project>(res)
    assert.equal(updated.name, 'Renamed')
    assert.equal(updated.color, '#ff0000')
  } finally {
    await close()
  }
})

test('PATCH /:id 404s for a missing project', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const res = await fetch(`${baseUrl}/does-not-exist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'x' }),
    })
    assert.equal(res.status, 404)
  } finally {
    await close()
  }
})

test('DELETE /:id removes a project', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const created = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Deep Work' }),
    }).then((r) => json<Project>(r))

    const res = await fetch(`${baseUrl}/${created.id}`, { method: 'DELETE' })
    assert.equal(res.status, 204)

    const list = await fetch(`${baseUrl}/`).then((r) => json<Project[]>(r))
    assert.deepEqual(list, [])
  } finally {
    await close()
  }
})

test('DELETE /:id 404s for a missing project', async () => {
  const { baseUrl, close } = await startServer()
  try {
    const res = await fetch(`${baseUrl}/does-not-exist`, { method: 'DELETE' })
    assert.equal(res.status, 404)
  } finally {
    await close()
  }
})
