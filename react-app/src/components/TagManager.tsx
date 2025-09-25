import { useId, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from '../useTranslation'
import type { TagUpdatePayload } from '../types'
import { DEFAULT_TAG_COLOR, TAG_COLOR_PRESETS } from '../tagColors'

interface TagManagerProps {
  id?: string
  tags: string[]
  availableTags: string[]
  tagColors: Record<string, string>
  onChange: (payload: TagUpdatePayload) => void
  isGlobal?: boolean
}

export function TagManager({ id, tags, availableTags, tagColors, onChange, isGlobal = false }: TagManagerProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const [selectedColor, setSelectedColor] = useState<string>(TAG_COLOR_PRESETS[0])
  const inputId = useId()
  const datalistId = `${inputId}-suggestions`
  const colorGroupId = `${inputId}-colors`

  const suggestions = useMemo(
    () => availableTags.filter((tag) => !tags.includes(tag)),
    [availableTags, tags],
  )

  // In global mode, we work with all available tags instead of process-specific tags
  const workingTags = isGlobal ? availableTags : tags

  const emitChange = (nextTags: string[], nextTagColors: Record<string, string>) => {
    onChange({ tags: nextTags, tagColors: nextTagColors })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalized = value.trim()
    if (!normalized || workingTags.includes(normalized)) {
      setValue('')
      setSelectedColor(TAG_COLOR_PRESETS[0])
      return
    }

    const color = selectedColor || DEFAULT_TAG_COLOR
    const nextTags = isGlobal ? [...workingTags, normalized] : [...tags, normalized]
    const nextTagColors = { ...tagColors, [normalized]: color }

    emitChange(nextTags, nextTagColors)
    setValue('')
    setSelectedColor(TAG_COLOR_PRESETS[0])
  }

  const handleRemove = (tagToRemove: string) => {
    const nextTags = isGlobal
      ? workingTags.filter((tag) => tag !== tagToRemove)
      : tags.filter((tag) => tag !== tagToRemove)
    const nextTagColors = { ...tagColors }
    delete nextTagColors[tagToRemove]
    emitChange(nextTags, nextTagColors)
  }

  const handleExistingColorChange = (tagName: string, color: string) => {
    if (!color) {
      return
    }
    emitChange(workingTags, { ...tagColors, [tagName]: color })
  }

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setValue(nextValue)
    const normalized = nextValue.trim()

    if (normalized && tagColors[normalized]) {
      setSelectedColor(tagColors[normalized])
    } else if (!normalized) {
      setSelectedColor(TAG_COLOR_PRESETS[0])
    }
  }

  const handlePresetSelect = (color: string) => {
    setSelectedColor(color)
  }

  const handleCustomColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      return
    }
    setSelectedColor(event.target.value)
  }

  return (
    <section className="tag-manager" aria-labelledby={`${inputId}-label`} id={id}>
      <div className="tag-manager-header">
        <strong id={`${inputId}-label`}>{t('tagManagement')}</strong>
        <span className="tag-manager-subtitle">{t('tagManagerHint')}</span>
      </div>

      {workingTags.length === 0 ? (
        <p className="tag-manager-empty">{t('noTags')}</p>
      ) : (
        <ul className="tag-manager-list">
          {workingTags.map((tag) => {
            const color = tagColors[tag] ?? DEFAULT_TAG_COLOR
            return (
              <li key={tag} className="tag-manager-item">
                <span
                  className="tag-manager-chip"
                  style={{ backgroundColor: color, borderColor: color, color: '#000000' }}
                >
                  {tag}
                </span>
                <label className="tag-manager-color-input">
                  <span className="visually-hidden">{`${t('tagColorLabel')} ${tag}`}</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(event) => handleExistingColorChange(tag, event.target.value)}
                    aria-label={`${t('tagColorLabel')} ${tag}`}
                  />
                </label>
                <button
                  type="button"
                  className="tag-remove-btn"
                  onClick={() => handleRemove(tag)}
                  aria-label={`${t('removeTag')} ${tag}`}
                >
                  &times;
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <form className="tag-manager-form" onSubmit={handleSubmit}>
        <div className="tag-input-wrapper">
          <input
            id={inputId}
            className="tag-input"
            type="text"
            value={value}
            onChange={handleValueChange}
            placeholder={t('tagPlaceholder')}
            list={datalistId}
            aria-describedby={colorGroupId}
          />
          <datalist id={datalistId}>
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>

        <fieldset className="tag-color-picker" aria-labelledby={colorGroupId}>
          <legend id={colorGroupId}>{t('tagColorLabel')}</legend>
          <div className="tag-color-options">
            {TAG_COLOR_PRESETS.map((color) => (
              <button
                type="button"
                key={color}
                className="tag-color-option"
                style={{ backgroundColor: color }}
                onClick={() => handlePresetSelect(color)}
                aria-pressed={selectedColor === color}
                aria-label={`${t('presetColor')} ${color}`}
                data-selected={selectedColor === color}
              />
            ))}
            <label className="tag-color-custom">
              <span>{t('customColor')}</span>
              <input type="color" value={selectedColor} onChange={handleCustomColorChange} />
            </label>
          </div>
        </fieldset>

        <button type="submit" className="tag-submit">
          {t('addTag')}
        </button>
      </form>
    </section>
  )
}
