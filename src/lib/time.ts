import type { TimeEntry } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

export function entryDurationMs(entry: TimeEntry, now: number): number {
  return (entry.end ?? now) - entry.start
}

export function totalDurationMs(entries: TimeEntry[], now: number): number {
  return entries.reduce((sum, entry) => sum + entryDurationMs(entry, now), 0)
}

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

// Week starts on Monday.
export function startOfWeek(timestamp: number): number {
  const dayStart = startOfDay(timestamp)
  const weekday = new Date(dayStart).getDay() // 0 = Sunday
  const daysSinceMonday = (weekday + 6) % 7
  return dayStart - daysSinceMonday * DAY_MS
}

export function entriesInRange(entries: TimeEntry[], rangeStart: number, rangeEnd: number): TimeEntry[] {
  return entries
    .filter((entry) => entry.start >= rangeStart && entry.start < rangeEnd)
    .sort((a, b) => b.start - a.start)
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function formatHoursMinutes(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}

export function formatTimeOfDay(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDayLabel(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function toTimeInputValue(timestamp: number): string {
  const date = new Date(timestamp)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function withTimeOfDay(baseTimestamp: number, timeValue: string): number {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const date = new Date(baseTimestamp)
  date.setHours(hours, minutes, 0, 0)
  return date.getTime()
}
