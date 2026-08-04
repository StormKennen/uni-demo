#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const srcRoot = path.join(root, 'src')
const mode = process.argv[2] || 'summary'
const sourceExtensions = new Set(['.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.uts', '.uvue', '.nvue'])
const textExtensions = new Set([...sourceExtensions, '.json', '.scss', '.css', '.html', '.md'])

const slash = value => value.split(path.sep).join('/')
const relative = value => slash(path.relative(root, value))
const read = file => fs.readFileSync(file, 'utf8')
const lines = text => (text.length ? (text.match(/\n/g)?.length || 0) + (text.endsWith('\n') ? 0 : 1) : 0)

function walk(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(target)
    return [target]
  })
}

const allSrcFiles = walk(srcRoot)
const sourceFiles = allSrcFiles.filter(file => sourceExtensions.has(path.extname(file)))
const textFiles = allSrcFiles.filter(file => textExtensions.has(path.extname(file)))
const sourceRecords = sourceFiles.map(file => ({ file: relative(file), text: read(file) }))
const textRecords = textFiles.map(file => ({ file: relative(file), text: read(file) }))

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length
}

function isLineComment(text, index) {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1
  return text.slice(lineStart, index).trimStart().startsWith('//')
}

function domainOf(file) {
  const segments = file.split('/')
  if (segments[1] === 'subPackages') return segments[3] || segments[2]
  if (segments[1] === 'pages') return `main:${segments[2] || 'root'}`
  if (segments[1] === 'components') return 'root-components'
  if (segments[1] === 'services') return 'services'
  if (segments[1] === 'editor-core') return 'editor-core'
  return segments[1] || 'root'
}

function parsePages() {
  const pagesFile = path.join(srcRoot, 'pages.json')
  const config = JSON.parse(read(pagesFile))
  const registered = []
  let pagesCursor = 0
  const locatePageLine = pagePath => {
    const index = read(pagesFile).indexOf(`\"path\": \"${pagePath}\"`, pagesCursor)
    if (index >= 0) pagesCursor = index + 1
    return index >= 0 ? lineNumber(read(pagesFile), index) : null
  }
  for (const page of config.pages || []) registered.push({ route: `/${page.path}`, package: 'main', source: 'src/pages.json', line: locatePageLine(page.path) })
  for (const pkg of config.subPackages || []) {
    for (const page of pkg.pages || []) {
      registered.push({ route: `/${pkg.root}/${page.path}`, package: pkg.name || pkg.root, packageRoot: pkg.root, source: 'src/pages.json', line: locatePageLine(page.path) })
    }
  }
  const routeSet = new Set(registered.map(item => item.route))
  for (const item of registered) {
    const base = path.join(srcRoot, item.route.slice(1))
    item.file = ['.vue', '.nvue', '.uvue'].map(ext => `${base}${ext}`).find(fs.existsSync)
    item.file = item.file ? relative(item.file) : null
    item.exists = Boolean(item.file)
  }

  const routeUses = []
  const callPattern = /\b(?:uni|wx)\.(navigateTo|redirectTo|reLaunch|switchTab)\s*\(/g
  for (const record of sourceRecords) {
    callPattern.lastIndex = 0
    let match
    while ((match = callPattern.exec(record.text))) {
      const method = match[1]
      const fragment = record.text.slice(callPattern.lastIndex, callPattern.lastIndex + 900)
      const trimmed = fragment.trimStart()
      let argument = trimmed
      if (trimmed.startsWith('{')) {
        const shorthand = trimmed.match(/^\{\s*url\s*[,}]/)
        const property = shorthand ? null : trimmed.match(/^\{[\s\S]{0,600}?\burl\s*:\s*/)
        if (shorthand) argument = 'url'
        else if (property) argument = trimmed.slice(property[0].length)
        else if (/^\{[\s\S]{0,600}?\burl\s*[,}]/.test(trimmed)) argument = 'url'
        else argument = ''
      }
      const literal = argument.match(/^([`'"])([\s\S]*?)\1/)
      const expression = argument.match(/^([^,})\n]+)/)?.[1]?.trim() || ''
      const raw = literal?.[2] || expression
      const route = raw.startsWith('/') ? raw.split(/[?#]/)[0] : null
      routeUses.push({
        file: record.file,
        line: lineNumber(record.text, match.index),
        method,
        raw,
        route,
        dynamic: !literal || /\$\{|\+/.test(raw),
        registered: route ? routeSet.has(route) : null,
      })
    }
  }

  const toolsFile = path.join(srcRoot, 'config/tools.ts')
  const toolRoutes = []
  if (fs.existsSync(toolsFile)) {
    const text = read(toolsFile)
    const pattern = /\bpath\s*:\s*(['"`])([^'"`]+)\1/g
    let match
    while ((match = pattern.exec(text))) {
      const route = match[2].startsWith('/') ? match[2].split(/[?#]/)[0] : match[2]
      toolRoutes.push({ file: relative(toolsFile), line: lineNumber(text, match.index), route, registered: routeSet.has(route) })
    }
  }

  const shareRoutes = []
  for (const record of sourceRecords) {
    if (!/(onShareAppMessage|onShareTimeline|createShare|useShare|ShareConfig)/i.test(record.text)) continue
    const patterns = [
      /\bpath\s*:\s*([`'"])(\/(?:pages|subPackages|editor-core)\/[^`'"]+)\1/g,
      /\b[A-Z0-9_]*PATH\s*=\s*([`'"])(\/(?:pages|subPackages|editor-core)\/[^`'"]+)\1/g,
    ]
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(record.text))) {
        if (isLineComment(record.text, match.index)) continue
        const route = match[2].split(/[?#]/)[0]
        shareRoutes.push({ file: record.file, line: lineNumber(record.text, match.index), raw: match[2], route, dynamic: /\$\{/.test(match[2]), registered: routeSet.has(route) })
      }
    }
  }

  const pageCandidates = sourceFiles.filter(file => ['.vue', '.nvue', '.uvue'].includes(path.extname(file))).map(relative).filter(file => {
    if (file.startsWith('src/pages/')) return !file.includes('/components/')
    if (file.startsWith('src/subPackages/')) return !file.includes('/components/')
    if (file.startsWith('src/editor-core/demo/')) return true
    return false
  })
  const registeredFiles = new Set(registered.filter(item => item.file).map(item => item.file))
  const unregisteredCandidates = pageCandidates.filter(file => !registeredFiles.has(file))

  return {
    counts: {
      mainPages: registered.filter(item => item.package === 'main').length,
      subpackages: (config.subPackages || []).length,
      subpackagePages: registered.filter(item => item.package !== 'main').length,
      registeredRoutes: registered.length,
      navigationCalls: routeUses.length,
      navigationByMethod: Object.fromEntries(['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'].map(method => [method, routeUses.filter(item => item.method === method).length])),
      toolRoutes: toolRoutes.length,
      shareRoutes: shareRoutes.length
    },
    registered,
    toolRoutes,
    shareRoutes,
    routeUses,
    registeredMissingFiles: registered.filter(item => !item.exists),
    unregisteredCandidates,
    tabBar: (config.tabBar?.list || []).map(item => ({ route: `/${item.pagePath}`, registered: routeSet.has(`/${item.pagePath}`) })),
    familyTree: {
      routeRegistered: routeSet.has('/subPackages/tools/family-tree/index'),
      toolEntryLine: toolRoutes.find(item => item.route === '/subPackages/tools/family-tree/index')?.line || null,
      hiddenInDirectory: /['\"]family-tree['\"]\s*:\s*\{[\s\S]*?hiddenInDirectory\s*:\s*true/.test(read(toolsFile)),
      shareRegistered: shareRoutes.some(item => item.route === '/subPackages/tools/family-tree/index'),
    },
  }
}

function fileInventory() {
  const records = sourceRecords.map(record => {
    const stat = fs.statSync(path.join(root, record.file))
    return { file: record.file, extension: path.extname(record.file), lines: lines(record.text), bytes: stat.size, domain: domainOf(record.file) }
  }).sort((a, b) => b.lines - a.lines || b.bytes - a.bytes)
  const vue = records.filter(item => ['.vue', '.nvue', '.uvue'].includes(item.extension))
  const ts = records.filter(item => ['.ts', '.tsx'].includes(item.extension))
  const longTs = ts.filter(item => item.lines > 400 && !item.file.startsWith('src/services/'))
  const hashes = new Map()
  for (const record of sourceRecords) {
    const normalized = record.text.replace(/\s+/g, ' ').trim()
    const hash = crypto.createHash('sha256').update(normalized).digest('hex')
    const list = hashes.get(hash) || []
    list.push(record.file)
    hashes.set(hash, list)
  }
  const exactDuplicates = [...hashes.values()].filter(group => group.length > 1)
  return {
    counts: { vue: vue.length, typescript: ts.length, source: records.length },
    vueOver500: vue.filter(item => item.lines > 500),
    vueOver800: vue.filter(item => item.lines > 800),
    typescriptOver400: longTs,
    largest30: records.filter(item => !item.file.startsWith('src/services/')).slice(0, 30),
    largest30IncludingGenerated: records.slice(0, 30),
    exactDuplicates
  }
}

function componentName(file) {
  const stem = path.basename(file, path.extname(file))
  return stem === 'index' ? path.basename(path.dirname(file)) : stem
}

function variants(name) {
  const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase()
  const pascal = kebab.split('-').filter(Boolean).map(part => part[0]?.toUpperCase() + part.slice(1)).join('')
  return [...new Set([name, kebab, pascal])].filter(Boolean)
}

function resolveImport(importer, specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null
  const base = specifier.startsWith('@/') ? path.join(srcRoot, specifier.slice(2)) : path.resolve(root, path.dirname(importer), specifier)
  const candidates = [base, ...['.vue', '.nvue', '.uvue', '.ts', '.tsx', '.js'].map(ext => `${base}${ext}`), ...['.vue', '.nvue', '.uvue', '.ts', '.tsx', '.js'].map(ext => path.join(base, `index${ext}`))]
  const found = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
  return found ? relative(found) : null
}

function classifyComponent(file, domains, referenceFiles) {
  const businessDomains = domains.filter(domain => domain !== 'root-components')
  const basename = path.basename(file, path.extname(file))
  const globalUi = /(?:PageLayout|ThemeRoot|nav-bar|confirm|popup|empty-data|no-more|h5-tab-bar|privacy-popup|platform-restriction|footer\/OneBtn)/i.test(file)
  let classification = '单一业务组件'
  let target = businessDomains[0] ? `对应业务域 components（${businessDomains[0]}）` : '保留根组件，P2A 复核归属'
  if (referenceFiles === 0) {
    classification = '未引用组件'
    target = 'P2A 复核动态引用后删除或归档'
  } else if (globalUi) {
    classification = '全局基础 UI'
    target = `src/shared/ui/${basename}.vue`
  } else if (file.includes('/toolkit/base/') || (file.includes('/toolkit/business/') && businessDomains.length > 1)) {
    classification = '工具平台通用组件'
    target = `src/shared/toolkit/${basename}.vue`
  } else if (businessDomains.length > 1) {
    classification = '分包内共享组件'
    target = `目标工具分包 _shared/${basename}.vue`
  }
  const risk = /PageLayout|echart|family-tree/i.test(file) || referenceFiles >= 10 ? 'High' : referenceFiles === 0 || referenceFiles >= 3 ? 'Medium' : 'Low'
  return { classification, suggestedTarget: target, migrationRisk: risk }
}

function componentInventory() {
  const componentFiles = sourceFiles.filter(file => file.startsWith(path.join(srcRoot, 'components') + path.sep) && ['.vue', '.nvue', '.uvue'].includes(path.extname(file)))
  const usageRecords = sourceRecords.filter(record => !record.file.startsWith('src/services/apifox/') && !record.file.startsWith('src/static/'))
  const components = componentFiles.map(file => {
    const rel = relative(file)
    const name = componentName(file)
    const names = variants(name)
    const referenceMap = new Map()
    for (const record of usageRecords) {
      if (record.file === rel) continue
      let count = 0
      for (const imported of importsFrom(record.text)) {
        if (resolveImport(record.file, imported.specifier) === rel) count += 1
      }
      if (record.file.endsWith('.vue')) {
        for (const candidate of names) {
          const escaped = candidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          count += record.text.match(new RegExp(`<${escaped}(?=[\\s/>])`, 'gi'))?.length || 0
        }
      }
      if (count) referenceMap.set(record.file, count)
    }
    if (rel === 'src/components/PageLayout.vue') referenceMap.set('src/pages.json', 1)
    const references = [...referenceMap.entries()].map(([file, count]) => ({ file, count })).sort((a, b) => a.file.localeCompare(b.file))
    const occurrences = references.reduce((sum, item) => sum + item.count, 0)
    const domains = [...new Set(references.map(item => domainOf(item.file)))]
    return { file: rel, name, referenceFiles: references.length, references, occurrences, domains, ...classifyComponent(rel, domains, references.length) }
  })
  return {
    counts: { components: components.length, unreferenced: components.filter(item => item.referenceFiles === 0).length },
    components
  }
}

function importsFrom(text) {
  const imports = []
  const pattern = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?(['"])([^'"\n]+)\1|require\(\s*(['"])([^'"\n]+)\3\s*\)/g
  let match
  while ((match = pattern.exec(text))) imports.push({ specifier: match[2] || match[4], index: match.index, statement: match[0] })
  return imports
}

function serviceInventory() {
  const directImports = []
  for (const record of sourceRecords) {
    if (record.file.startsWith('src/services/')) continue
    for (const item of importsFrom(record.text)) {
      const absolute = item.specifier.startsWith('@/') ? `src/${item.specifier.slice(2)}` : slash(path.normalize(path.join(path.dirname(record.file), item.specifier)))
      if (absolute === 'src/services' || absolute.startsWith('src/services/')) {
        const typeOnly = /^import\s+type\b/.test(item.statement)
        const apifoxGenerated = /\/apifox\//.test(absolute)
        const apifoxDto = apifoxGenerated && (typeOnly || /\/interface$/.test(absolute))
        directImports.push({ file: record.file, line: lineNumber(record.text, item.index), specifier: item.specifier, domain: domainOf(record.file), apifoxGenerated, apifoxDto, typeOnly })
      }
    }
  }
  const byDomain = Object.entries(directImports.reduce((acc, item) => {
    acc[item.domain] = (acc[item.domain] || 0) + 1
    return acc
  }, {})).map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count)
  return {
    counts: {
      imports: directImports.length,
      files: new Set(directImports.map(item => item.file)).size,
      apifoxGeneratedImports: directImports.filter(item => item.apifoxGenerated).length,
      apifoxGeneratedFiles: new Set(directImports.filter(item => item.apifoxGenerated).map(item => item.file)).size,
      apifoxDtoImports: directImports.filter(item => item.apifoxDto).length,
      apifoxDtoFiles: new Set(directImports.filter(item => item.apifoxDto).map(item => item.file)).size,
    },
    byDomain,
    directImports,
  }
}

const capabilityPatterns = {
  'wx.*': /\bwx\.[A-Za-z_$][\w$]*/g,
  'window.*': /\bwindow\.[A-Za-z_$][\w$]*/g,
  'document.*': /\bdocument\.[A-Za-z_$][\w$]*/g,
  'navigator.*': /\bnavigator\.[A-Za-z_$][\w$]*/g,
  'location.*': /(?<![\w$.])location\.[A-Za-z_$][\w$]*/g,
  getCurrentPages: /\bgetCurrentPages\s*\(/g,
  'condition:MP-WEIXIN': /#ifdef\s+MP-WEIXIN/g,
  'condition:H5': /#ifdef\s+(?:H5|WEB)/g,
  'file:choose': /\b(?:uni|wx)\.(?:chooseImage|chooseMedia|chooseVideo|chooseFile|chooseMessageFile)\b/g,
  'file:save': /\b(?:(?:uni|wx)\.(?:saveFile|downloadFile|openDocument)|showSaveFilePicker|URL\.createObjectURL)\b/g,
  'image:save': /\b(?:uni|wx)\.saveImageToPhotosAlbum\b/g,
  share: /\b(?:onShareAppMessage|onShareTimeline|shareAppMessage|showShareMenu|hideShareMenu|updateShareMenu)\b/g,
  canvas: /\b(?:canvas|Canvas|createCanvasContext|canvasToTempFilePath|OffscreenCanvas)\b/g,
  clipboard: /\b(?:setClipboardData|getClipboardData|clipboard|Clipboard)\b/g,
  auth: /\b(?:uni|wx)\.(?:login|getUserProfile|getUserInfo|authorize|openSetting|getSetting)\b/g,
  privacy: /\b(?:onNeedPrivacyAuthorization|requirePrivacyAuthorize|getPrivacySetting|openPrivacyContract)\b/g,
}

function platformInventory() {
  const usage = []
  const businessRecords = sourceRecords.filter(record => !record.file.startsWith('src/services/apifox/') && !record.file.startsWith('src/static/'))
  for (const record of businessRecords) {
    for (const [capability, pattern] of Object.entries(capabilityPatterns)) {
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(record.text))) {
        const before = record.text.slice(0, match.index).split(/\r?\n/)
        const guards = []
        for (const line of before) {
          const open = line.match(/#ifn?def\s+([A-Z0-9_-]+)/)
          if (open) guards.push(open[1])
          if (/#endif/.test(line)) guards.pop()
        }
        const browserApi = ['window.*', 'document.*', 'navigator.*', 'location.*'].includes(capability)
        const compliantContext = browserApi
          ? guards.some(guard => guard === 'H5' || guard === 'WEB') || record.file.startsWith('src/utilsH5/') || record.file.includes('/adapters/h5/')
          : capability === 'wx.*'
            ? guards.includes('MP-WEIXIN')
            : null
        usage.push({ capability, symbol: match[0], file: record.file, line: lineNumber(record.text, match.index), domain: domainOf(record.file), guards, compliantContext })
      }
    }
  }
  const byCapability = Object.entries(usage.reduce((acc, item) => {
    acc[item.capability] = (acc[item.capability] || 0) + 1
    return acc
  }, {})).map(([capability, count]) => ({ capability, count })).sort((a, b) => b.count - a.count)
  const byDomain = Object.entries(usage.reduce((acc, item) => {
    acc[item.domain] = (acc[item.domain] || 0) + 1
    return acc
  }, {})).map(([domain, count]) => ({ domain, count })).sort((a, b) => b.count - a.count)
  const bySymbol = Object.entries(usage.reduce((acc, item) => {
    acc[item.symbol] = (acc[item.symbol] || 0) + 1
    return acc
  }, {})).map(([symbol, count]) => ({ symbol, count })).sort((a, b) => b.count - a.count || a.symbol.localeCompare(b.symbol))
  const unguardedDirectApis = usage.filter(item => item.compliantContext === false)
  return {
    counts: { occurrences: usage.length, files: new Set(usage.map(item => item.file)).size, unguardedDirectApis: unguardedDirectApis.length, unguardedDirectApiFiles: new Set(unguardedDirectApis.map(item => item.file)).size },
    byCapability,
    byDomain,
    bySymbol,
    unguardedDirectApis,
    usage,
  }
}

function compactPlatformInventory() {
  const inventory = platformInventory()
  const groups = new Map()
  for (const item of inventory.usage) {
    const key = `${item.file}\u0000${item.capability}`
    const group = groups.get(key) || { file: item.file, domain: item.domain, capability: item.capability, count: 0, lines: [], symbols: [], unguardedLines: [] }
    group.count += 1
    if (!group.lines.includes(item.line)) group.lines.push(item.line)
    if (!group.symbols.includes(item.symbol)) group.symbols.push(item.symbol)
    if (item.compliantContext === false && !group.unguardedLines.includes(item.line)) group.unguardedLines.push(item.line)
    groups.set(key, group)
  }
  return {
    counts: inventory.counts,
    byCapability: inventory.byCapability,
    byDomain: inventory.byDomain,
    bySymbol: inventory.bySymbol,
    unguardedDirectApis: inventory.unguardedDirectApis,
    usageGroups: [...groups.values()].sort((a, b) => a.file.localeCompare(b.file) || a.capability.localeCompare(b.capability)),
  }
}

function subpackageInventory() {
  const imports = []
  const rootComponentImports = []
  for (const record of sourceRecords) {
    if (!record.file.startsWith('src/subPackages/')) continue
    const importerParts = record.file.split('/')
    const importerPackage = importerParts[2]
    for (const item of importsFrom(record.text)) {
      const absolute = item.specifier.startsWith('@/') ? `src/${item.specifier.slice(2)}` : slash(path.normalize(path.join(path.dirname(record.file), item.specifier)))
      if (absolute.startsWith('src/components/')) rootComponentImports.push({ file: record.file, line: lineNumber(record.text, item.index), specifier: item.specifier, target: absolute, package: importerPackage })
      if (!absolute.startsWith('src/subPackages/')) continue
      const targetPackage = absolute.split('/')[2]
      if (targetPackage !== importerPackage) imports.push({ file: record.file, line: lineNumber(record.text, item.index), specifier: item.specifier, target: absolute, importerPackage, targetPackage })
    }
  }
  const rootComponentUsages = componentInventory().components.flatMap(component =>
    component.references.filter(reference => reference.file.startsWith('src/subPackages/')).map(reference => ({ component: component.file, importer: reference.file, count: reference.count, importerPackage: reference.file.split('/')[2], classification: component.classification })),
  )
  return { counts: { crossSubpackageImports: imports.length, rootComponentImports: rootComponentImports.length, rootComponentUsageFiles: rootComponentUsages.length }, crossSubpackageImports: imports, rootComponentImports, rootComponentUsages }
}

function sizeRecord(file, base) {
  return { file: slash(path.relative(base, file)), bytes: fs.statSync(file).size }
}

function packageSizes() {
  const builds = {}
  for (const [name, directory] of Object.entries({ h5: path.join(root, 'dist/build/h5'), mpWeixin: path.join(root, 'dist/build/mp-weixin') })) {
    const files = walk(directory).filter(file => fs.statSync(file).isFile()).map(file => sizeRecord(file, directory)).sort((a, b) => b.bytes - a.bytes)
    const totalBytes = files.reduce((sum, item) => sum + item.bytes, 0)
    const duplicateHashes = new Map()
    for (const item of files.filter(item => item.bytes >= 1024)) {
      const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(directory, item.file))).digest('hex')
      const group = duplicateHashes.get(hash) || []
      group.push(item)
      duplicateHashes.set(hash, group)
    }
    const duplicateFiles = [...duplicateHashes.entries()].filter(([, group]) => group.length > 1).map(([sha256, group]) => ({ sha256, files: group, duplicateBytes: group[0].bytes * (group.length - 1) }))
    builds[name] = {
      exists: fs.existsSync(directory),
      generatedAt: files.length ? new Date(Math.max(...walk(directory).map(file => fs.statSync(file).mtimeMs))).toISOString() : null,
      totalBytes,
      fileCount: files.length,
      largest30: files.slice(0, 30),
      echarts: files.filter(item => /echarts|ecstat|l-echart|lime-echart/i.test(item.file)),
      familyTree: files.filter(item => /family-tree/i.test(item.file)),
      duplicateFiles,
    }
    if (name === 'mpWeixin' && files.length) {
      const packageTotals = {}
      const packageRoots = (JSON.parse(read(path.join(srcRoot, 'pages.json'))).subPackages || []).map(pkg => pkg.root)
      for (const item of files) {
        const packageName = packageRoots.find(packageRoot => item.file === packageRoot || item.file.startsWith(`${packageRoot}/`)) || 'main'
        packageTotals[packageName] = (packageTotals[packageName] || 0) + item.bytes
      }
      builds[name].packages = Object.entries(packageTotals).map(([packageName, bytes]) => ({ package: packageName, bytes })).sort((a, b) => b.bytes - a.bytes)
      builds[name].rootStaticBytes = files.filter(item => item.file.startsWith('static/')).reduce((sum, item) => sum + item.bytes, 0)
      const toolDomainTotals = {}
      for (const item of files.filter(item => item.file.startsWith('subPackages/tools/'))) {
        const domain = item.file.split('/').slice(0, 3).join('/')
        toolDomainTotals[domain] = (toolDomainTotals[domain] || 0) + item.bytes
      }
      builds[name].toolDomainBreakdown = Object.entries(toolDomainTotals).map(([domain, bytes]) => ({ domain, bytes })).sort((a, b) => b.bytes - a.bytes)
    }
  }
  const staticFiles = walk(path.join(srcRoot, 'static')).map(file => sizeRecord(file, srcRoot)).sort((a, b) => b.bytes - a.bytes)
  const staticTexts = textRecords.filter(record => !record.file.startsWith('src/static/')).map(record => record.text).join('\n')
  const unreferencedLargeStatic = staticFiles.filter(item => item.bytes >= 50 * 1024).filter(item => {
    const rel = item.file.replace(/^static\//, '')
    return !staticTexts.includes(rel) && !staticTexts.includes(`/${item.file}`)
  })
  return { sourceStatic: { totalBytes: staticFiles.reduce((sum, item) => sum + item.bytes, 0), fileCount: staticFiles.length, largest30: staticFiles.slice(0, 30), unreferencedLarge: unreferencedLargeStatic }, builds }
}

const scanners = {
  routes: parsePages,
  files: fileInventory,
  components: componentInventory,
  services: serviceInventory,
  platform: platformInventory,
  platformReport: compactPlatformInventory,
  subpackages: subpackageInventory,
  packages: packageSizes,
  summary: () => ({ routes: parsePages().counts, files: fileInventory().counts, components: componentInventory().counts, services: serviceInventory().counts, platform: platformInventory().counts, subpackages: subpackageInventory().counts, packages: packageSizes() })
}

if (!scanners[mode]) {
  process.stderr.write(`Unknown mode: ${mode}\n`)
  process.exit(1)
}

process.stdout.write(`${JSON.stringify(scanners[mode](), null, 2)}\n`)
