// Crop tmp/image.png into a 7x4 grid of icons
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const INPUT_PATH = path.join(ROOT, 'tmp', 'image.png')
const OUTPUT_DIR = path.join(ROOT, 'tmp', 'icons')

const COLUMNS = 7
const ROWS = 4

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function main() {
  try {
    const input = sharp(INPUT_PATH)
    const metadata = await input.metadata()

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to determine image dimensions')
    }

    const tileWidth = Math.floor(metadata.width / COLUMNS)
    const tileHeight = Math.floor(metadata.height / ROWS)

    await ensureDir(OUTPUT_DIR)

    const jobs = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const left = col * tileWidth
        const top = row * tileHeight

        const index = row * COLUMNS + col + 1
        const outPath = path.join(OUTPUT_DIR, `icon_${String(index).padStart(2, '0')}.png`)

        // Use extract to crop and write to file
        const job = sharp(INPUT_PATH)
          .extract({ left, top, width: tileWidth, height: tileHeight })
          .toFile(outPath)
        jobs.push(job)
      }
    }

    await Promise.all(jobs)
    console.log(`Cropped ${ROWS * COLUMNS} tiles to: ${OUTPUT_DIR}`)
    console.log(`Tile size: ${tileWidth}x${tileHeight}`)
  } catch (err) {
    console.error('Failed to crop icons:', err)
    process.exitCode = 1
  }
}

await main()


