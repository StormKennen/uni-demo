import { spawnSync } from 'node:child_process'

const GENERATED_PATH = 'src/services'
const args = process.argv.slice(2)

function readBaseRef() {
  const baseIndex = args.indexOf('--base')

  if (baseIndex === -1) {
    return process.env.GENERATED_BOUNDARY_BASE || null
  }

  const baseRef = args[baseIndex + 1]
  if (!baseRef) {
    console.error('用法：node scripts/check-generated-boundary.mjs [--base <git-ref>]')
    process.exit(2)
  }

  return baseRef
}

function git(args) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  if (result.status !== 0) {
    const details = result.stderr.trim() || result.stdout.trim() || `git 退出码 ${result.status}`
    console.error(`生成区检查无法执行：${details}`)
    process.exit(2)
  }

  return result.stdout
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
}

const baseRef = readBaseRef()
const changedFiles = new Set([
  ...git(['diff', '--name-only', '--', GENERATED_PATH]),
  ...git(['diff', '--cached', '--name-only', '--', GENERATED_PATH]),
  ...git(['ls-files', '--others', '--exclude-standard', '--', GENERATED_PATH]),
])

if (baseRef) {
  for (const filePath of git(['diff', '--name-only', `${baseRef}...HEAD`, '--', GENERATED_PATH])) {
    changedFiles.add(filePath)
  }
}

console.log(`${GENERATED_PATH}/** 是由 Apifox 管理的生成区，架构任务不得修改。`)
console.log('本检查只识别 Git 差异，无法判断修改来自 Apifox 重新生成还是手工编辑。')

if (changedFiles.size > 0) {
  console.error('检测到生成区变化：')
  for (const filePath of [...changedFiles].sort()) {
    console.error(`- ${filePath}`)
  }
  process.exit(1)
}

console.log(baseRef ? `未发现 ${baseRef}...HEAD 或当前工作区中的生成区变化。` : '未发现工作区或索引中的生成区变化。')
