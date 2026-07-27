import type { Project } from '../types'
import { entriesStore } from './entries.svelte'

const STORAGE_KEY = 'timecraft:projects'

const DEFAULT_COLORS = ['#5b8cff', '#ff6b5b', '#5bd6a3', '#f0b94d', '#c07bff', '#4dd0e1']

function load(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Project[]) : []
  } catch {
    return []
  }
}

class ProjectsStore {
  projects = $state<Project[]>(load())

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.projects))
  }

  create(name: string, color?: string): Project {
    const now = Date.now()
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      color: color ?? DEFAULT_COLORS[this.projects.length % DEFAULT_COLORS.length],
      timecreated: now,
      timemodified: now,
    }
    this.projects.push(project)
    this.save()
    return project
  }

  update(id: string, patch: Partial<Pick<Project, 'name' | 'color'>>) {
    const project = this.projects.find((p) => p.id === id)
    if (!project) return
    Object.assign(project, patch, { timemodified: Date.now() })
    this.save()
  }

  delete(id: string) {
    const index = this.projects.findIndex((p) => p.id === id)
    if (index === -1) return
    this.projects.splice(index, 1)
    this.save()
    entriesStore.clearProject(id)
  }

  get(id: string | null): Project | null {
    if (!id) return null
    return this.projects.find((p) => p.id === id) ?? null
  }
}

export const projectsStore = new ProjectsStore()
