import type { TimeEntry } from '../types'
import { entriesInRange, startOfDay, startOfWeek } from '../lib/time'

const STORAGE_KEY = 'timecraft:entries'
const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

function load(): TimeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TimeEntry[]) : []
  } catch {
    return []
  }
}

class EntriesStore {
  entries = $state<TimeEntry[]>(load())

  active = $derived(this.entries.find((entry) => entry.end === null) ?? null)

  todayEntries = $derived.by(() => {
    const start = startOfDay(Date.now())
    return entriesInRange(this.entries, start, start + DAY_MS)
  })

  weekEntries = $derived.by(() => {
    const start = startOfWeek(Date.now())
    return entriesInRange(this.entries, start, start + WEEK_MS)
  })

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries))
  }

  clockIn() {
    if (this.active) return
    this.entries.push({ id: crypto.randomUUID(), start: Date.now(), end: null })
    this.save()
  }

  clockOut() {
    if (!this.active) return
    this.active.end = Date.now()
    this.save()
  }

  updateEntry(id: string, patch: Partial<Pick<TimeEntry, 'start' | 'end'>>) {
    const entry = this.entries.find((e) => e.id === id)
    if (!entry) return
    Object.assign(entry, patch)
    this.save()
  }

  deleteEntry(id: string) {
    const index = this.entries.findIndex((e) => e.id === id)
    if (index === -1) return
    this.entries.splice(index, 1)
    this.save()
  }
}

export const entriesStore = new EntriesStore()
