# 图鉴模块国际化方案（list.vue + detail.vue）

## 1. 技术选型

项目已有 `vue-i18n` 依赖（`package.json` 中为 `v9.x`），建议直接使用 `vue-i18n` 的 Composition API：

```ts
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
```

在模板中使用 `{{ t('key') }}`，在脚本中使用 `t('key')` 或 `t('key', { param })`。

---

## 2. 语言文件结构

```
src/
└── locales/
    ├── index.ts          // 创建 i18n 实例
    ├── zh-CN/
    │   ├── common.ts     // 公共文案
    │   └── compendium.ts // 图鉴模块
    └── en/
        ├── common.ts
        └── compendium.ts
```

---

## 3. 文案清单

以下列出 `list.vue` 和 `detail.vue` 中所有需国际化的硬编码中文文案，按模块分组。

### 3.1 公共 / 通用（common）

| Key | 中文（zh-CN） | 英文（en） | 来源文件 |
|-----|--------------|-----------|---------|
| `common.yes` | 是 | Yes | list.vue, detail.vue |
| `common.no` | 否 | No | list.vue, detail.vue |
| `common.retry` | 重试 | Retry | list.vue, detail.vue |
| `common.none` | 暂无 | None | detail.vue |
| `common.unknown` | 未知 | Unknown | — |

### 3.2 属性 / 元素（element）

| Key | 中文 | 英文 | 备注 |
|-----|------|------|------|
| `element.fire` | 火 | Fire | filter / badge |
| `element.water` | 水 | Water | |
| `element.wind` | 风 | Wind | |
| `element.light` | 光 | Light | |
| `element.dark` | 暗 | Dark | |
| `element.all` | 全部 | All | list.vue filter |

### 3.3 列表页（list）

| Key | 中文 | 英文 | 位置 |
|-----|------|------|------|
| `list.filterTitle` | 快速筛选 | Quick Filter | filter header |
| `list.filterTitleFamily` | 物种图鉴 | Species | filter header (family mode) |
| `list.filterReset` | 重置 | Reset | filter header |
| `list.filterElement` | 属性 | Element | filter label |
| `list.filterType` | 类型 | Type | filter label |
| `list.filterStar` | 星级 | Stars | filter label |
| `list.filterSort` | 排序 | Sort | filter label |
| `list.familyModeTip` | 筛选和排序基于代表魔灵，每个物种展示一张卡片 | Filters and sorting are based on representative monsters; one card per species | family mode tip |
| `list.loadingFamily` | 加载物种中... | Loading species... | loading state |
| `list.loadingCharacter` | 加载魔灵中... | Loading monsters... | loading state |
| `list.emptyFamily` | 暂无物种数据 | No species data | empty state |
| `list.emptyCharacter` | 暂无符合条件的魔灵 | No matching monsters | empty state |
| `list.unknownSpecies` | 未知物种 | Unknown Species | card name fallback |
| `list.unknownMonster` | 未知魔灵 | Unknown Monster | card name fallback |
| `list.representative` | 代表魔灵 | Representative | family mode label |
| `list.loadMore` | 继续加载... | Loading more... | pagination |
| `list.noMore` | 没有更多了 | No more results | pagination |
| `list.errorLoad` | 图鉴加载失败，请稍后重试 | Failed to load, please try again later | error |
| `list.navTitle` | 魔灵 wiki-图鉴 | Monster Wiki | nav bar |

### 3.4 筛选器选项 — 类型（type）

| Key | 中文 | 英文 |
|-----|------|------|
| `type.all` | 全部 | All |
| `type.attack` | 攻击 | Attack |
| `type.defense` | 防御 | Defense |
| `type.hp` | 体力 | HP |
| `type.support` | 辅助 | Support |

### 3.5 排序选项（sort）

| Key | 中文 | 英文 |
|-----|------|------|
| `sort.stars` | 星级 | Stars |
| `sort.hp` | 体力 | HP |
| `sort.attack` | 攻击力 | Attack |
| `sort.defense` | 防御力 | Defense |
| `sort.speed` | 速度 | Speed |
| `sort.critRate` | 暴击率 | Crit Rate |
| `sort.critDamage` | 暴击伤害 | Crit Damage |
| `sort.accuracy` | 效果命中 | Accuracy |
| `sort.resistance` | 效果抵抗 | Resistance |

### 3.6 详情页（detail）

| Key | 中文 | 英文 | 位置 |
|-----|------|------|------|
| `detail.loading` | 加载详情中... | Loading details... | loading state |
| `detail.unknownMonster` | 未知魔灵 | Unknown Monster | name fallback |
| `detail.unknownSkill` | 未命名技能 | Unnamed Skill | skill name fallback |
| `detail.coefficient` | 系数 | Coefficient | coefficient fallback |
| `detail.emptySkills` | 暂无技能信息 | No skill data | empty section |
| `detail.emptyTags` | 暂无标签 | No tags | empty section |
| `detail.sectionBuilding` | 该模块内容建设中 | Section under construction | fallback tab |
| `detail.langEn` | 英文 | English | language toggle |
| `detail.langZh` | 中文 | Chinese | language toggle |
| `detail.aliases` | 别名 | Aliases | more section |
| `detail.skins` | 皮肤 | Skins | more section |
| `detail.skinFallback` | 皮肤 | Skin | skin name fallback |
| `detail.missingId` | 缺少魔灵 ID | Missing monster ID | error |
| `detail.errorLoad` | 详情加载失败，请稍后重试 | Failed to load details, please try again later | error |
| `detail.navTitle` | 魔灵 wiki-{name} | Monster Wiki - {name} | nav bar (带插值 `{name}`) |
| `detail.navTitleFallback` | 详情 | Details | nav bar fallback |
| `detail.shareTitle` | 魔灵 wiki-{name} | Monster Wiki - {name} | share (带插值) |
| `detail.shareFallback` | 图鉴 | Wiki | share fallback |

### 3.7 觉醒 / 形态（awaken）

| Key | 中文 | 英文 |
|-----|------|------|
| `awaken.awakened` | 觉醒 | Awakened |
| `awaken.unawakened` | 未觉醒 | Unawakened |

### 3.8 属性面板（stats）

| Key | 中文 | 英文 |
|-----|------|------|
| `stat.hp` | 体力 | HP |
| `stat.attack` | 攻击 | Attack |
| `stat.defense` | 防御 | Defense |
| `stat.speed` | 速度 | Speed |
| `stat.critRate` | 暴击率 | Crit Rate |
| `stat.critDamage` | 暴击伤害 | Crit Damage |
| `stat.resistance` | 效果抵抗 | Resistance |
| `stat.accuracy` | 效果命中 | Accuracy |

### 3.9 技能类型（skillType）

| Key | 中文 | 英文 |
|-----|------|------|
| `skillType.active` | 主动技能 | Active Skill |
| `skillType.passive` | 被动技能 | Passive Skill |
| `skillType.leader` | 队长技能 | Leader Skill |

### 3.10 其它关键词（用于数据解析逻辑）

以下中文出现在数据匹配/解析逻辑中（如 `normalizeElementKey`、`formatAwakenLabel`），**不用于 UI 展示**，但切换语言时需确认 API 返回值的语言。如果 API 始终返回中文，则这些映射保持不变；如果 API 也支持多语言，则需同步适配。

| 用途 | 中文值 | 所在函数 |
|------|--------|---------|
| 元素 key 映射 | 火/水/风/光/暗 | `normalizeElementKey` |
| 觉醒判断 | 否/是/未/觉醒 | `formatAwakenLabel` |
| 星级后缀去除 | 星 | `normalizeDetail`, `normalizeCharacter` |
| 触发概率 | 触发 | `normalizeCoefficient` |

---

## 4. 实施步骤

1. **创建语言文件**：在 `src/locales/` 下按上述结构创建 `zh-CN/compendium.ts` 和 `en/compendium.ts`
2. **注册 i18n 实例**：在 `src/main.ts` 中创建并挂载 `vue-i18n` 实例
3. **逐文件替换**：
   - `list.vue`：将所有硬编码中文替换为 `t('list.xxx')` 调用
   - `detail.vue`：同上
4. **处理数据解析层**：`normalizeElementKey`、`formatAwakenLabel` 等映射函数保持中文 key 不变（因为 API 返回中文），但 UI 展示使用 `t()` 翻译
5. **语言切换入口**：在应用设置或页面顶部添加语言切换组件
6. **测试验证**：确保中英文切换后，筛选、排序、详情等页面文案均正确显示

---

## 5. 注意事项

- **插值处理**：nav bar title 和 share title 使用模板字符串，需改为 `t('detail.navTitle', { name })`
- **API 数据**：`elementName`、`archetype`、`family` 等来自后端，i18n 只处理前端 UI 文案；如需后端数据也支持多语言，需后端配合
- **星号符号**：`★` 为 Unicode 符号，不需要翻译
- **图标 emoji**：`🔥🌊🌪️🛡️🟣` 等不需要翻译
- **vue-i18n 版本**：项目已有 `vue-i18n@9.x`，与 Vue 3 兼容
