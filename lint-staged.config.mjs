import path from 'node:path'

const generatedRoot = path.resolve('src/services')

function isGeneratedSource(filePath) {
  const absolutePath = path.resolve(filePath)
  return absolutePath === generatedRoot || absolutePath.startsWith(`${generatedRoot}${path.sep}`)
}

function shellQuote(value) {
  return `'${value.replaceAll("'", `'"'"'`)}'`
}

function formatHandwrittenFiles(filePaths) {
  const handwrittenFiles = filePaths.filter(filePath => !isGeneratedSource(filePath))

  if (handwrittenFiles.length === 0) {
    return []
  }

  return `prettier --write ${handwrittenFiles.map(shellQuote).join(' ')}`
}

export default {
  'src/**/*.{ts,vue}': formatHandwrittenFiles,
  '*.{json,md}': formatHandwrittenFiles,
}
