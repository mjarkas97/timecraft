import type { TimeEntry } from '../types'
import { entriesInRange, startOfDay, startOfWeek } from '../lib/time'
import { api } from '../lib/api'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

class EntriesStore {
  entries = $state<TimeEntry[]>([])

  active = $derived(this.entries.find((entry) => entry.end === null) ?? null)

  todayEntries = $derived.by(() => {
    const start = startOfDay(Date.now())
    return entriesInRange(this.entries, start, start + DAY_MS)
  })

  weekEntries = $derived.by(() => {
    const start = startOfWeek(Date.now())
    return entriesInRange(this.entries, start, start + WEEK_MS)
  })

  async load() {
    this.entries = await api.get<TimeEntry[]>('/entries')
  }

  async clockIn(project: string | null = null) {
    if (this.active) return
    const entry = await api.post<TimeEntry>('/entries/clock-in', { project })
    this.entries.push(entry)
  }

  async clockOut() {
    if (!this.active) return
    const entry = await api.post<TimeEntry>('/entries/clock-out')
    const index = this.entries.findIndex((e) => e.id === entry.id)
    if (index !== -1) this.entries[index] = entry
  }

  async updateEntry(id: string, patch: Partial<Pick<TimeEntry, 'start' | 'end' | 'project'>>) {
    const entry = await api.patch<TimeEntry>(`/entries/${id}`, patch)
    const index = this.entries.findIndex((e) => e.id === id)
    if (index !== -1) this.entries[index] = entry
  }

  async deleteEntry(id: string) {
    await api.delete(`/entries/${id}`)
    const index = this.entries.findIndex((e) => e.id === id)
    if (index !== -1) this.entries.splice(index, 1)
  }

  clearProject(projectId: string) {
    for (const entry of this.entries) {
      if (entry.project === projectId) {
        entry.project = null
      }
    }
  }
}

export const entriesStore = new EntriesStore()
