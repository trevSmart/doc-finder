export interface ClipMetadata {
  filePath: string
  title: string
  createdAt: string
  updatedAt: string
}

export type ClipRegistry = Record<string, ClipMetadata>

export interface CompoundClip {
  id: string
  title: string
  filePaths: string[]
  createdAt: string
  updatedAt: string
}

export interface ClipStorage {
  overrides: ClipRegistry
  compoundClips: CompoundClip[]
}
