import type { TagUpdatePayload } from '../types'
import { useTranslation } from '../useTranslation'

export interface OptionsMenuProps {
  availableTags: string[]
  tagColors: Record<string, string>
  onUpdateTags: (processId: string, payload: TagUpdatePayload) => void
  onUpdateGlobalTags: (payload: TagUpdatePayload) => void
  selectedProcessId: string | null
  databasePath: string
  onInitializeDatabaseSuccess: () => void
}

export function OptionsMenu({ selectedProcessId }: OptionsMenuProps) {
  const { t } = useTranslation()
  const disabled = !selectedProcessId

  return (
    <button
      type="button"
      disabled={disabled}
      className="ring-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 4v12M4 10h12" />
      </svg>
      {t('manageTags')}
    </button>
  )
}


