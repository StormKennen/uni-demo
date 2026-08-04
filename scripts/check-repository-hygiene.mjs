#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
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
    console.error(`仓库卫生检查无法执行：${details}`)
    process.exit(2)
  }

  return result.stdout
}

function addFinding(file, rule, description) {
  findings.push({ file, rule, description })
}

function isEnvironmentFile(file) {
  const name = path.basename(file)
  return name !== '.env.example' && !sharedEnvironmentFiles.has(file) && (name === '.env' || name.startsWith('.env.'))
}

const trackedFiles = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z'])
  .split('\0')
  .filter(Boolean)

for (const file of trackedFiles) {
  const normalized = file.replaceAll('\\', '/')
  const name = path.basename(normalized)

  if (normalized === '.vscode/autoApiGen.json') {
    addFinding(file, 'tracked-apifox-local-config', 'Apifox 本地凭证配置不应被跟踪')
  }
  if (isEnvironmentFile(normalized)) {
    addFinding(file, 'tracked-private-environment-file', '本地私有环境覆盖配置不应被跟踪')
  }
  if (/\.(?:zip|rar|7z|tar|tgz|tar\.gz)$/i.test(normalized)) {
    addFinding(file, 'tracked-archive', '压缩包不应被跟踪')
  }
  if (/(^|\/)(?:dist|unpackage)(\/|$)/.test(normalized)) {
    addFinding(file, 'tracked-build-output', '构建产物目录不应被跟踪')
  }
  if (/(^|\/)__MACOSX(\/|$)/.test(normalized) || name === '.DS_Store') {
    addFinding(file, 'tracked-system-file', '系统生成文件不应被跟踪')
  }
  if (/\.(?:bak|tmp|swp|swo|orig)$/i.test(name) || /^(?:tmp|temp)-/i.test(name)) {
    addFinding(file, 'tracked-temporary-file', '明显临时或备份文件不应被跟踪')
  }

  if (!normalized.includes('/') && fs.existsSync(path.join(root, file))) {
    const size = fs.statSync(path.join(root, file)).size
    if (size > 5 * 1024 * 1024 && !['pnpm-lock.yaml'].includes(file)) {
      addFinding(file, 'large-root-file', `根目录文件异常大（${size} 字节）`)
    }
  }
}

if (findings.length > 0) {
  console.error(`仓库卫生检查失败（${findings.length} 项）：`)
  for (const finding of findings) {
    console.error(`- ${finding.file} [${finding.rule}] ${finding.description}`)
  }
  process.exit(1)
}

console.log(
  `仓库卫生检查通过：检查 ${trackedFiles.length} 个 Git 跟踪及待提交文件；未发现私有 Apifox 配置、本地私有 .env、压缩包、构建产物或系统垃圾。`,
)
