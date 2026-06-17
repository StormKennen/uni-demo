# 图鉴国际化维护方案（基于编辑模式）

## 1. 概述

在图鉴编辑页面（`compendium/edit.vue`）中直接维护国际化翻译，
admin 用户修改角色数据的同时可以一并编辑英文翻译，数据随接口存入后端。

## 2. 数据结构

每个角色在后端新增 `i18n` 字段，按 locale 组织：

```jsonc
{
  "id": "char_xxx",
  "name": "火凤凰",
  "description": "xxx",
  "skills": [...],
  "i18n": {
    "en": {
      "name": "Fire Phoenix",
      "description": "xxx",
      "skills": {
        "skill_001": { "name": "Flame Strike", "description": "..." },
        "skill_002": { "name": "Rebirth", "description": "..." }
      }
    }
    // 后续可扩展更多 locale: "ja", "ko", ...
  }
}
```

### 2.1 接口字段（`patchAdminCompendiumsCharacters`）

| 字段 | 类型 | 说明 |
|------|------|------|
| `i18n` | `Record<locale, LocaleFields>` | 顶层国际化对象 |
| `i18n.en.name` | `string?` | 英文名称 |
| `i18n.en.description` | `string?` | 英文描述 |
| `i18n.en.skills` | `Record<skillId, SkillI18n>?` | 技能翻译 |
| `i18n.en.skills[id].name` | `string?` | 技能英文名 |
| `i18n.en.skills[id].description` | `string?` | 技能英文描述 |

> 只传有修改的字段，未传的字段不会覆盖已有值（PATCH 语义）。

## 3. 编辑页面集成

`edit.vue` 已内置 **国际化 (English)** 编辑区域：

1. **基本字段**：Name (EN)、Description (EN)
2. **技能翻译**：每个技能对应一组英文 Name / Description 输入框
3. **数据回填**：加载角色详情时，如果后端返回 `i18n.en`，自动填入对应输入框
4. **提交**：保存时只有非空的 i18n 字段才会包含在请求体中

### 3.1 编辑页面操作流程

```
列表页 → 点击卡片右上角 ✎ 编辑图标 → 编辑页
→ 修改基本信息 / 属性 / 技能
→ 填写英文翻译
→ 点击「保存修改」
→ 接口 PATCH /admin/compendiums/characters
→ 返回列表页
```

## 4. 前端展示层消费 i18n 数据

### 4.1 详情页显示英文

在 `detail.vue` 中，已有语言切换 toggle（英文/中文），
切换到英文时，优先使用 `i18n.en.name`、`i18n.en.description` 等字段，
fallback 到中文原始值。

```ts
// 伪代码
const displayName = computed(() =>
  currentLocale === 'en' && detail.i18n?.en?.name
    ? detail.i18n.en.name
    : detail.name
)
```

### 4.2 后端接口需要返回 i18n 字段

`GET /compendiums/character` 返回值需包含 `i18n` 字段。
前端在 `normalizeDetail` 中解析并存入 detail 对象。

## 5. 扩展更多语言

### 5.1 新增 locale

1. 在 `patchAdminCompendiumsCharactersBody.i18n` 增加新 locale key（如 `ja`）
2. 在 `edit.vue` 中复制 English 区块，改为新语言
3. 后端 `i18n` 字段自动支持任意 locale key

### 5.2 批量翻译工具化

后续可开发批量翻译功能：
- 列表页增加"批量翻译"按钮（admin only）
- 遍历所有角色，调用翻译 API（如 Google Translate）
- 通过 `patchAdminCompendiumsCharacters` 批量写入

## 6. UI 文案国际化

除了角色动态数据外，页面 UI 文案（按钮、标签、提示语等）
参考 `docs/compendium-i18n-plan.md` 中的方案，使用 `vue-i18n` + 静态语言文件。

两者互补：
- **静态文案** → `vue-i18n` + `src/locales/` 语言文件
- **动态数据** → 后端 `i18n` 字段 + 编辑模式维护

## 7. 后端需求清单

| 需求 | 说明 |
|------|------|
| `PATCH /admin/compendiums/characters` 支持 `i18n` 字段 | 接收并持久化角色级翻译 |
| `GET /compendiums/character` 返回 `i18n` 字段 | 前端展示层消费 |
| `GET /compendiums/characters` 返回 `i18n` 字段（可选） | 列表预览翻译状态 |
