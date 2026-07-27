import type { Project } from '../types'
import { api } from '../lib/api'
import { entriesStore } from './entries.svelte'

class ProjectsStore {
  projects = $state<Project[]>([])

  async load() {
    this.projects = await api.get<Project[]>('/projects')
  }

  async create(name: string, color?: string): Promise<Project> {
    const project = await api.post<Project>('/projects', { name, color })
    this.projects.push(project)
    return project
  }

  async update(id: string, patch: Partial<Pick<Project, 'name' | 'color'>>) {
    const project = await api.patch<Project>(`/projects/${id}`, patch)
    const index = this.projects.findIndex((p) => p.id === id)
    if (index !== -1) this.projects[index] = project
  }

  async delete(id: string) {
    await api.delete(`/projects/${id}`)
    const index = this.projects.findIndex((p) => p.id === id)
    if (index !== -1) this.projects.splice(index, 1)
    entriesStore.clearProject(id)
  }

  get(id: string | null): Project | null {
    if (!id) return null
    return this.projects.find((p) => p.id === id) ?? null
  }
}

export const projectsStore = new ProjectsStore()
