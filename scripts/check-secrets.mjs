#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const privateGeneratorConfig = '.vscode/autoApiGen.json'
const ignoredPrefixes = ['src/services/']
const sharedEnvironmentFiles = new Set(['.env.development', '.env.test', '.env.production'])
const findings = []

function git(args) {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 20 * 1024 * 1024,
  })

  if (result.status !== 0) {
    const details = result.stderr.trim() || result.stdout.trim() || `git 退出码 ${result.status}`
    console.error(`凭证检查无法执行：${details}`)
    process.exit(2)
  }

  return result.stdout
}

function addFinding(file, line, rule, description) {
  findings.push({ file, line, rule, description })
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length
}

function isTrackedEnvironmentFile(file) {
  const name = path.basename(file)
  return name !== '.env.example' && !sharedEnvironmentFiles.has(file) && (name === '.env' || name.startsWith('.env.'))
}

function isPlaceholder(value) {
  return /^(?:example|placeholder|change[-_ ]?me|your[-_ ]?|test[-_ ]?|dummy|sample|<.+>|\$\{.+\})/i.test(value.trim())
}

const trackedFiles = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
  .split('\0')
  .filter(Boolean)

if (trackedFiles.includes(privateGeneratorConfig)) {
  addFinding(privateGeneratorConfig, 1, 'tracked-apifox-local-config', 'Apifox 本地凭证配置被 Git 跟踪')
}

for (const file of trackedFiles) {
  if (isTrackedEnvironmentFile(file)) {
    addFinding(file, 1, 'tracked-private-environment-file', '本地私有环境覆盖文件被 Git 跟踪')
  }

  if (sharedEnvironmentFiles.has(file)) {
    const environmentText = fs.readFileSync(path.join(root, file), 'utf8')
    for (const [index, line] of environmentText.split(/\r?\n/).entries()) {
      if (!line.trim() || line.trim().startsWith('#')) continue
      const assignment = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/)
      if (!assignment || !assignment[1].startsWith('VITE_')) {
        addFinding(file, index + 1, 'shared-env-non-public-key', '共享 mode 配置只能包含可公开的 VITE_* 变量')
      } else if (/(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY|AUTHORIZATION|API_KEY)/i.test(assignment[1])) {
        addFinding(file, index + 1, 'shared-env-sensitive-key', '共享 mode 配置包含疑似敏感变量名')
      }
    }
  }

  if (ignoredPrefixes.some(prefix => file.startsWith(prefix))) continue

  const absolute = path.join(root, file)
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) continue

  const buffer = fs.readFileSync(absolute)
  if (buffer.includes(0)) continue
  const text = buffer.toString('utf8')

  const rules = [
    {
      name: 'hardcoded-bearer',
      description: '发现疑似硬编码 Bearer 凭证（内容已隐藏）',
      pattern: /\bBearer\s+[A-Za-z0-9._~+/-]{20,}={0,2}/gi,
      accept: () => true,
    },
    {
      name: 'private-key-header',
      description: '发现私钥头部（内容已隐藏）',
      pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
      accept: () => true,
    },
    {
      name: 'hardcoded-sensitive-assignment',
      description: '发现疑似硬编码敏感字段（内容已隐藏）',
      pattern:
        /\b(?:api[_-]?key|client[_-]?secret|app[_-]?secret|access[_-]?key|private[_-]?key|password|token|authorization)\b\s*[:=]\s*(['"`])([^'"`\r\n]{12,})\1/gi,
      accept: match => !match[2].includes('${') && !isPlaceholder(match[2]),
    },
    {
      name: 'vite-sensitive-variable',
      description: '敏感变量使用 VITE_ 前缀，可能被打入前端产物',
      pattern: /\bVITE_[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PRIVATE_KEY|ACCESS_KEY|AUTHORIZATION|API_KEY)[A-Z0-9_]*\b/g,
      accept: () => true,
    },
  ]

  for (const rule of rules) {
    for (const match of text.matchAll(rule.pattern)) {
      if (!rule.accept(match)) continue
      addFinding(file, lineNumber(text, match.index), rule.name, rule.description)
    }
  }
}

if (findings.length > 0) {
  console.error(`凭证检查失败（${findings.length} 项）：`)
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} [${finding.rule}] ${finding.description}`)
  }
  process.exit(1)
}

console.log(
  `凭证检查通过：扫描 ${trackedFiles.length} 个 Git 跟踪及待提交文件；共享 mode 配置仅含公开 VITE_* 变量，未发现本地 Apifox 配置、私有 .env、硬编码 Bearer、私钥或明显密钥。`,
)
console.log('说明：本检查只检查当前 Git 索引及未忽略的待提交文件，不扫描进程环境变量，也不判断 Git 历史中的凭证是否已撤销。')
