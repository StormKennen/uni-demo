/**
 * Harness pre-commit gate: 当提交涉及 src/ 核心代码变更时，
 * 必须同时在 Git Stage 中包含 docs/changelog.md 的更新，否则拒绝提交。
 * 跳过方式（仅限紧急情况，需人工授权）：HARNESS_SKIP_CHANGELOG=1 git commit ...
 */
const { execSync } = require('child_process')

if (process.env.HARNESS_SKIP_CHANGELOG === '1') {
  console.warn('[harness] HARNESS_SKIP_CHANGELOG=1，跳过 changelog 校验')
  process.exit(0)
}

const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)

const coreChanged = staged.filter(f => f.startsWith('src/'))
const changelogStaged = staged.includes('docs/changelog.md')

if (coreChanged.length > 0 && !changelogStaged) {
  console.error('\n[harness] ❌ 提交被拒绝：检测到核心代码变更但未更新 docs/changelog.md')
  console.error('[harness] 涉及的核心文件：')
  coreChanged.forEach(f => console.error(`  - ${f}`))
  console.error('\n[harness] 请在 docs/changelog.md 追加本次变更记录并 git add docs/changelog.md 后重试。\n')
  process.exit(1)
}

process.exit(0)
