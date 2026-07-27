export interface TimeEntry {
  id: string
  start: number
  end: number | null
  project: string | null
  timecreated: number
  timemodified: number
}

export interface Project {
  id: string
  name: string
  color: string
  timecreated: number
  timemodified: number
}
