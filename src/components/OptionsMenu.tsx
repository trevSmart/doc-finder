import type { TagUpdatePayload } from '../types'

export interface OptionsMenuProps {
  availableTags: string[]
  tagColors: Record<string, string>
  onUpdateTags: (processId: string, payload: TagUpdatePayload) => void
  onUpdateGlobalTags: (payload: TagUpdatePayload) => void
  selectedProcessId: string | null
  databasePath: string
  onInitializeDatabaseSuccess: () => void
}

export function OptionsMenu(_props: OptionsMenuProps) {
  return (
    <div className="options-menu" />
  )
}


