// Make icon backgrounds transparent by keying out the dominant corner color
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const INPUT_DIR = path.join(ROOT, 'tmp', 'icons')
const OUTPUT_DIR = path.join(ROOT, 'tmp', 'icons_transparent')

// Tunable parameters via env vars
const HARD_THRESHOLD = Number(process.env.THRESH || 18) // distance below which pixel becomes fully transparent
const SOFT_FEATHER = Number(process.env.SOFT || 12) // additional range for smooth interpolation to fully opaque
const SAMPLE_SIZE = Number(process.env.SAMPLE || 5) // NxN corner sample size for robust bg estimation

function colorDistance(a, b) {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

async function getCornerBackgroundColor(imagePath) {
  const img = sharp(imagePath)
  const meta = await img.metadata()
  const { width = 0, height = 0 } = meta
  const s = Math.max(1, Math.min(SAMPLE_SIZE, Math.floor(Math.min(width, height) / 4)))
  const sampleRects = [
    { left: 0, top: 0, width: s, height: s },
    { left: width - s, top: 0, width: s, height: s },
    { left: 0, top: height - s, width: s, height: s },
    { left: width - s, top: height - s, width: s, height: s },
  ]

  const colors = []
  for (const rect of sampleRects) {
    const { data, info } = await sharp(imagePath)
      .extract(rect)
      .raw()
      .toBuffer({ resolveWithObject: true })
    const { channels } = info
    let r = 0, g = 0, b = 0, count = 0
    for (let i = 0; i < data.length; i += channels) {
      r += data[i]; g += data[i + 1]; b += data[i + 2]
      count++
    }
    colors.push([Math.round(r / count), Math.round(g / count), Math.round(b / count)])
  }

  // Average the corner colors to be robust
  const avg = colors.reduce(
    (acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]],
    [0, 0, 0]
  )
  return [Math.round(avg[0] / colors.length), Math.round(avg[1] / colors.length), Math.round(avg[2] / colors.length)]
}

async function processIcon(filename) {
  const inPath = path.join(INPUT_DIR, filename)
  const outPath = path.join(OUTPUT_DIR, filename)

  const bg = await getCornerBackgroundColor(inPath)

  const { data, info } = await sharp(inPath).raw().ensureAlpha().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info

  // Iterate pixels and apply soft mask based on color distance
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const dist = colorDistance([r, g, b], bg)
    const a0 = data[i + 3]
    if (dist <= HARD_THRESHOLD) {
      data[i + 3] = 0 // fully transparent
    } else if (dist >= HARD_THRESHOLD + SOFT_FEATHER) {
      data[i + 3] = a0 // unchanged
    } else {
      const t = (dist - HARD_THRESHOLD) / Math.max(1, SOFT_FEATHER)
      data[i + 3] = Math.max(0, Math.min(255, Math.round(a0 * t)))
    }
  }

  await sharp(data, { raw: { width, height, channels } }).png().toFile(outPath)
  return { filename, width, height }
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
  const all = await fs.readdir(INPUT_DIR)
  const files = all.filter((f) => f.toLowerCase().endsWith('.png'))
  const results = await Promise.all(files.map(processIcon))
  console.log(`Made transparent backgrounds for ${results.length} icons → ${OUTPUT_DIR}`)
  console.log(`Params: THRESH=${HARD_THRESHOLD} SOFT=${SOFT_FEATHER} SAMPLE=${SAMPLE_SIZE}`)
}

await main()


