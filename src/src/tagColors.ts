export const TAG_COLOR_PRESETS = [
  '#ffb3ba', // soft coral
  '#ffdfba', // soft peach
  '#ffffba', // soft yellow
  '#baffc9', // soft mint
  '#bae1ff', // soft sky blue
  '#d4baff', // soft lavender
  '#ffb3e6', // soft pink
  '#b3ffb3', // soft green
  '#ffb3ff', // soft magenta
  '#b3e6ff', // soft cyan
  '#e6b3ff', // soft violet
  '#b3ffd4', // soft aqua
] as const

export const DEFAULT_TAG_COLOR = TAG_COLOR_PRESETS[0]

export const ensureTagColors = (
  knownTags: string[],
  processTags: string[][],
  provided: Record<string, string> = {},
): Record<string, string> => {
  const map: Record<string, string> = { ...provided }
  const allTags = new Set<string>([...knownTags, ...processTags.flat()])
  let index = 0

  for (const tag of allTags) {
    if (!map[tag]) {
      map[tag] = TAG_COLOR_PRESETS[index % TAG_COLOR_PRESETS.length]
      index += 1
    }
  }

  return map
}
