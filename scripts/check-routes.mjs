#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const srcRoot = path.join(root, 'src')
const pagesFile = path.join(srcRoot, 'pages.json')
const toolsFile = path.join(srcRoot, 'config/tools.ts')
const sourceExtensions = new Set(['.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.uts', '.uvue', '.nvue'])
const ignoredSourcePrefixes = [
  'src/services/',
  'src/static/',
  'src/uni_modules/',
  'src/unpackage/',
  'src/uniCloud-aliyun/',
  // 未在 pages.json 注册的旧备忘录副本；P0C-1 只约束当前活动实现。
  'src/subPackages/services/memo/',
]
const oldActiveMemoPrefix = '/subPackages/services/memo'

const slash = value => value.split(path.sep).join('/')
const relative = value => slash(path.relative(root, value))
const read = file => fs.readFileSync(file, 'utf8')

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length
}

function isCommented(text, index) {
  const lineStart = text.lastIndexOf('\n', index - 1) + 1
  const linePrefix = text.slice(lineStart, index)
  if (linePrefix.includes('//')) return true

  const blockOpen = text.lastIndexOf('/*', index)
  const blockClose = text.lastIndexOf('*/', index)
  if (blockOpen > blockClose) return true

  const htmlOpen = text.lastIndexOf('<!--', index)
  const htmlClose = text.lastIndexOf('-->', index)
  return htmlOpen > htmlClose
}

function walk(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) return walk(target)
    return [target]
  })
}

function isActiveSource(file) {
  const rel = relative(file)
  return sourceExtensions.has(path.extname(file)) && !ignoredSourcePrefixes.some(prefix => rel.startsWith(prefix))
}

function normalizeRoute(raw) {
  if (!raw || !raw.startsWith('/')) return null
  const route = raw.split(/[?#]/)[0]
  if (!/^\/(?:pages|subPackages|editor-core)\//.test(route)) return null
  if (/\$\{|[+`'"\s]/.test(route)) return null
  return route
}

function parseRegisteredRoutes() {
  const text = read(pagesFile)
  const config = JSON.parse(text)
  const routes = []
  let pageCursor = 0

  const addRoute = (route, pagePath) => {
    const marker = `"path": "${pagePath}"`
    const index = text.indexOf(marker, pageCursor)
    if (index >= 0) pageCursor = index + marker.length
    routes.push({ route, source: 'src/pages.json', line: index >= 0 ? lineNumber(text, index) : 1 })
  }

  for (const page of config.pages || []) {
    addRoute(`/${page.path}`, page.path)
  }
  for (const subPackage of config.subPackages || []) {
    for (const page of subPackage.pages || []) {
      addRoute(`/${subPackage.root}/${page.path}`, page.path)
    }
  }

  for (const item of routes) {
    const base = path.join(srcRoot, item.route.slice(1))
    item.file = ['.vue', '.nvue', '.uvue'].map(extension => `${base}${extension}`).find(fs.existsSync) || null
  }

  const duplicates = routes.filter((item, index) => routes.findIndex(candidate => candidate.route === item.route) !== index)
  return { config, routes, duplicates, routeSet: new Set(routes.map(item => item.route)) }
}

function parseNavigationCalls(record) {
  const results = []
  const callPattern = /\b(?:uni|wx)\.(navigateTo|redirectTo|reLaunch|switchTab)\s*\(/g
  let match

  while ((match = callPattern.exec(record.text))) {
    if (isCommented(record.text, match.index)) continue

    const method = match[1]
    const fragment = record.text.slice(callPattern.lastIndex, callPattern.lastIndex + 1200)
    const trimmed = fragment.trimStart()
    let argument = trimmed

    if (trimmed.startsWith('{')) {
      const immediateShorthand = trimmed.match(/^\{\s*url\s*[,}]/)
      const property = trimmed.match(/^\{[\s\S]{0,900}?\burl\s*:\s*/)
      const shorthand = trimmed.match(/^\{[\s\S]{0,900}?\burl\s*[,}]/)
      if (immediateShorthand) argument = 'url'
      else if (property) argument = trimmed.slice(property[0].length)
      else if (shorthand) argument = 'url'
      else argument = ''
    }

    const literal = argument.match(/^([`'"])([\s\S]*?)\1/)
    const expression = argument.match(/^([^,})\n]+)/)?.[1]?.trim() || ''
    const raw = literal?.[2] || expression
    results.push({
      file: record.file,
      line: lineNumber(record.text, match.index),
      method,
      raw,
      route: normalizeRoute(raw),
      dynamic: !literal || /\$\{|\+/.test(raw),
    })
  }

  return results
}

function parseToolRoutes() {
  const text = read(toolsFile)
  const routes = []
  const pattern = /\bpath\s*:\s*(['"`])([^'"`]+)\1/g
  let match

  while ((match = pattern.exec(text))) {
    routes.push({
      file: relative(toolsFile),
      line: lineNumber(text, match.index),
      raw: match[2],
      route: normalizeRoute(match[2]),
    })
  }

  return routes
}

function parseShareRoutes(records) {
  const routes = []
  const patterns = [
    /\bpath\s*:\s*([`'"])(\/(?:pages|subPackages|editor-core)\/[^`'"]+)\1/g,
    /\b[A-Z0-9_]*PATH\s*=\s*([`'"])(\/(?:pages|subPackages|editor-core)\/[^`'"]+)\1/g,
  ]

  for (const record of records) {
    if (!/(onShareAppMessage|onShareTimeline|createShare|useShare|ShareConfig)/i.test(record.text)) continue
    for (const pattern of patterns) {
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(record.text))) {
        if (isCommented(record.text, match.index)) continue
        routes.push({
          file: record.file,
          line: lineNumber(record.text, match.index),
          raw: match[2],
          route: normalizeRoute(match[2]),
        })
      }
    }
  }

  return routes
}

function verifyParserCanDetectInvalidStaticRoute() {
  const probe = {
    file: '<route-check-self-test>',
    text: "uni.navigateTo({ url: '/subPackages/__missing__/probe' })",
  }
  const [result] = parseNavigationCalls(probe)
  if (!result || result.route !== '/subPackages/__missing__/probe') {
    throw new Error('路由检查器自检失败：无法识别静态 navigateTo 路径')
  }
  return result
}

const selfTestResult = verifyParserCanDetectInvalidStaticRoute()
if (process.argv.includes('--self-test')) {
  const selfTestRoutes = new Set(['/pages/index/index'])
  if (selfTestRoutes.has(selfTestResult.route)) {
    throw new Error('路由检查器自检失败：未注册路径被错误判定为已注册')
  }
  console.log(`路由检查器自检通过：可识别未注册静态路径 ${selfTestResult.route}`)
  process.exit(0)
}

const { config, routes: registeredRoutes, duplicates, routeSet } = parseRegisteredRoutes()
const records = walk(srcRoot)
  .filter(isActiveSource)
  .map(file => ({ file: relative(file), text: read(file) }))
const navigationCalls = records.flatMap(parseNavigationCalls)
const toolRoutes = parseToolRoutes()
const shareRoutes = parseShareRoutes(records)
const tabRoutes = new Set((config.tabBar?.list || []).map(item => `/${item.pagePath}`))
const errors = []
const warnings = []

for (const duplicate of duplicates) {
  errors.push(`${duplicate.source}:${duplicate.line} 重复注册路由 ${duplicate.route}`)
}

for (const registered of registeredRoutes) {
  if (!registered.file) {
    errors.push(`${registered.source}:${registered.line} 注册页面文件不存在：${registered.route}`)
  }
}

for (const tool of toolRoutes) {
  if (!tool.route) {
    errors.push(`${tool.file}:${tool.line} 工具路径不是可识别的应用内静态路径：${tool.raw}`)
  } else if (!routeSet.has(tool.route)) {
    errors.push(`${tool.file}:${tool.line} 工具路径未在 pages.json 注册：${tool.route}`)
  }
}

for (const share of shareRoutes) {
  if (!share.route || !routeSet.has(share.route)) {
    errors.push(`${share.file}:${share.line} 分享路径未在 pages.json 注册：${share.raw}`)
  }
}

for (const call of navigationCalls) {
  if (call.route && !routeSet.has(call.route)) {
    errors.push(`${call.file}:${call.line} ${call.method} 使用未注册路径：${call.raw}`)
  } else if (call.method === 'switchTab' && call.route && !tabRoutes.has(call.route)) {
    errors.push(`${call.file}:${call.line} switchTab 目标不是 tabBar 页面：${call.route}`)
  } else if (!call.route) {
    warnings.push(`${call.file}:${call.line} ${call.method} 动态路径无法静态确认：${call.raw || '<无法解析>'}`)
  }
}

for (const record of records) {
  let index = record.text.indexOf(oldActiveMemoPrefix)
  while (index >= 0) {
    if (!isCommented(record.text, index)) {
      errors.push(`${record.file}:${lineNumber(record.text, index)} 活动代码仍包含旧备忘录路径：${oldActiveMemoPrefix}`)
    }
    index = record.text.indexOf(oldActiveMemoPrefix, index + oldActiveMemoPrefix.length)
  }
}

console.log(
  `路由检查：${registeredRoutes.length} 个注册页面，${toolRoutes.length} 个工具路径，${shareRoutes.length} 个分享路径，${navigationCalls.length} 个导航调用。`,
)

if (warnings.length) {
  console.log(`动态路由风险（仅记录，${warnings.length} 项）：`)
  for (const warning of warnings) console.log(`- ${warning}`)
}

if (errors.length) {
  console.error(`路由检查失败（${errors.length} 项）：`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('路由检查通过：注册文件、工具路径、分享路径和可静态识别的导航路径一致。')
