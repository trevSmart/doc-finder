export interface Process {
  id: string
  name: string
  description: string
  tags: string[]
  objects: string[]
  integrations: string[]
  mechanism: string
  category: string
  diagram?: string
  documentation?: string
  priority: 'critical' | 'high' | 'medium' | 'low' | string
  complexity: 'high' | 'medium' | 'low' | string
}

export interface ProcessesDatabase {
  categories: string[]
  integrations: string[]
  mechanisms: string[]
  objects: string[]
  tags: string[]
  tagColors: Record<string, string>
  processes: Process[]
}

export type ViewMode = 'grid' | 'list'

export interface FiltersState {
  search: string
  category: string
  mechanism: string
  object: string
  integration: string
  tag: string
  view: ViewMode
}

export interface TagUpdatePayload {
  tags: string[]
  tagColors: Record<string, string>
}

export interface UploadResponse {
  saved: Array<{
    originalName: string
    storedName: string
    size: number
    directory: string
  }>
  errors: Array<{
    name: string
    reason: string
  }>
}
