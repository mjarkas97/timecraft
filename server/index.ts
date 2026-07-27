import express from 'express'
import type { ErrorRequestHandler } from 'express'
import { projectsRouter } from './routes/projects'
import { entriesRouter } from './routes/entries'
import './db'

const PORT = 3001

const app = express()
app.use(express.json())

app.use('/api/projects', projectsRouter)
app.use('/api/entries', entriesRouter)

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: err instanceof Error ? err.message : 'internal server error' })
}
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`timecraft server listening on http://localhost:${PORT}`)
})
