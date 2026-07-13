import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { listSwcUploadAssets } from '../src/subPackages/tools/compendium/swc/icon-assets.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const outputPath = path.join(repoRoot, 'docs', 'swc-icon-upload-manifest.json')
const sourceBaseDir = 'src/subPackages/tools/static/swc'

const assets = listSwcUploadAssets()
const grouped = assets.reduce((acc, item) => {
  if (!acc[item.folder]) acc[item.folder] = []
  acc[item.folder].push(item)
  return acc
}, {})

const payload = {
  generatedAt: new Date().toISOString(),
  sourceBaseDir,
  objectKeyPrefix: 'swc',
  total: assets.length,
  folders: Object.fromEntries(
    Object.entries(grouped).map(([folder, items]) => [
      folder,
      {
        count: items.length,
        files: items,
      },
    ]),
  ),
  files: assets,
}

await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

console.log(`[swc-manifest] wrote ${outputPath}`)
console.log(`[swc-manifest] total files: ${assets.length}`)
