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
const docsStaged = staged.some(f => f.startsWith('docs/'))

if (coreChanged.length > 0 && !changelogStaged) {
  console.error('\n❌ [Harness 拒绝提交]: 发现你修改了 uni-app 运行代码，但没有更新对应的 docs/features/ 文档或变更日志！')
  console.error('👉 必须坚持“先改文档对齐功能，再生成/提交代码”的最高铁律。')
  console.error('\n[harness] 涉及的运行代码文件：')
  coreChanged.forEach(f => console.error(`  - ${f}`))
  if (docsStaged) {
    console.error('\n[harness] 检测到 docs/ 有变更，但缺少 docs/changelog.md：请追加变更记录并 git add docs/changelog.md 后重试。')
  } else {
    console.error('\n[harness] 请同步维护 docs/features/ 对应功能文档，并在 docs/changelog.md 追加记录后 git add 重试。')
  }
  console.error('')
  process.exit(1)
}

process.exit(0)
