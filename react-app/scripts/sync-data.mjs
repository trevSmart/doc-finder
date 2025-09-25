import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

// Utilitzar la variable d'entorn DOCUMENTS_DIRECTORY si està definida
const documentsDir = process.env.DOCUMENTS_DIRECTORY || resolve(projectRoot, '..')
const source = resolve(documentsDir, 'processes-database.json')
const destination = resolve(projectRoot, 'public/processes-database.json')

if (!existsSync(source)) {
  console.log('📝 Base de dades no trobada, creant-la...')
  console.log('📁 Directori de documents:', documentsDir)

  // Crear directori si no existeix
  mkdirSync(documentsDir, { recursive: true })

  // Crear base de dades inicial buida
  const initialDb = {
    categories: [],
    integrations: [],
    mechanisms: [],
    objects: [],
    tags: [],
    tagColors: {},
    processes: []
  }

  // Escriure el fitxer inicial
  writeFileSync(source, JSON.stringify(initialDb, null, 2), 'utf-8')
  console.log('✅ Base de dades inicial creada a:', source)
}

mkdirSync(dirname(destination), { recursive: true })
cpSync(source, destination)
console.log('✅ processes-database.json sincronitzat correctament')
console.log('📁 Des de:', source)
console.log('📁 Cap a:', destination)
