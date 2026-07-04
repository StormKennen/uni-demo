# 魔灵召唤(swc) 人物卡片 & 阵容组件化设计方案

> 目标：把「人物卡片」「阵容」封装成可复用、可配置显隐的组件，统一图鉴列表 / 阵容编辑 / 阵容映射 / 人物选择等模块的展示，并为图鉴人物新增可编辑的独立「原始星级」字段。

对应需求 4 点：

1. 图鉴人物新增独立字段「原始星级」，可在编辑页编辑。
2. 封装单个人物组件（圆/方头像、名称、种族、五行、星级、原始星级，均可配置显隐），整合现有图鉴列表卡片样式。
3. 封装阵容组件（0~多人物、名称/描述可配置显隐，人物复用第 2 点组件），阵容创建/编辑、阵容映射等复用。
4. 人物选择确认后展示「可编辑阵容」（头像右上角删除小图标）——是否并入第 3 点。

---

## 0. 现状盘点（关键结论）

- 人物展示已分散在多处，样式/字段不统一：
  - 图鉴列表卡片：`list.vue`（`.character-card`，展示头像/星角标/元素徽标/家族名/代表魔灵/构型）。
  - 选人项：`character-picker.vue`（头像 + 选中序号角标）。
  - 阵容成员：`components/character-avatar-grid.vue`（头像 + 元素角标 + 序号 + 「移除」按钮，**无名称、无右上角删除叉**）。
  - 阵容预览：`components/lineup-avatar-card.vue`（头像 + 元素 + 星级 + 名称 + 阵容名/类型/描述）。
- 人物字段主干已统一到 `LineupCharacterPreview`（`services/compendium-lineups.ts`）：
  `id / characterId / name / label / avatar / element* / archetype / family* / awaken* / stars`。
- **没有**独立的「原始星级 / 胎星级 / baseStars / originalStars」模型字段。
  - list.vue 里的 `birthStars` 是用 `parseBirthStars(stars, awaken)` **客户端推算**出来的，不是存储字段。
- 人物编辑页 `edit.vue` 目前只编辑：人物名称、技能；提交体只含 `compendiumId/characterId/locale/name/skills`，**不含星级**。
- 星级数据实际存在动态 `attributes[key='stars']` 里；`categories` 存元素/觉醒/家族/构型等。
- Admin PATCH 接口 `patchAdminCompendiumsCharacters` 生成类型很松（body 为 `string`，edit.vue 用 `body as never`），可接受 `attributes/categories/...`。

---

## 1. 原始星级（独立可编辑字段）——【已确认：复用现有 stars 属性】

### 1.1 语义（Q1 已确认）

- **原始星级 = 现有动态属性 `attributes[key='stars']`**（即代码里 `stars` 字段），无需新增存储字段、无需后端改接口。
- 「当前/展示星级」= 现有 `birthStars`（由 `parseBirthStars(stars, awaken)` 客户端推算，觉醒态 -1）。
- 卡片可同时/分别显示：`星级`(=birthStars 推算) 与 `原始星级`(=raw stars)。

### 1.2 前端改动

- 视图模型 `SwcCharacterView` 提供：`stars`(raw=原始星级) 与 `displayStars`(=birthStars 推算)。
- `edit.vue` 人物文案区增加「原始星级」数字输入，绑定 `attributes[stars]` 的值，提交时并入 PATCH 的 `attributes` 数组（沿用现有 `attributes` 提交通道，无需后端新字段）。
- 卡片组件通过 `showStars` / `showOriginalStars` 分别控制两者展示。

---

## 2. 单个人物组件 `SwcCharacterCard`

新增 `components/swc-character-card.vue`，整合 list.vue 卡片视觉，成为唯一的人物展示单元。

### 2.1 Props

| prop                | 类型                   | 默认       | 说明                           |
| ------------------- | ---------------------- | ---------- | ------------------------------ |
| `character`         | `SwcCharacterView`     | —          | 归一化人物数据（见下）         |
| `avatarShape`       | `'square' \| 'circle'` | `'square'` | 头像形状                       |
| `showName`          | `boolean`              | `true`     | 人物名称                       |
| `showFamily`        | `boolean`              | `false`    | 种族/家族名                    |
| `showElement`       | `boolean`              | `true`     | 五行/元素徽标                  |
| `showStars`         | `boolean`              | `true`     | 星级                           |
| `showOriginalStars` | `boolean`              | `false`    | 原始星级                       |
| `showRemove`        | `boolean`              | `false`    | 头像右上角删除小图标（编辑态） |
| `showOrder`         | `boolean`              | `false`    | 左上角序号角标                 |
| `order`             | `number`               | —          | 序号值                         |
| `selectable`        | `boolean`              | `false`    | 选择态（选中角标）             |
| `selected`          | `boolean`              | `false`    | 是否已选                       |
| `selectedIndex`     | `number`               | —          | 已选序号（选人页）             |
| `avatarSize`        | `number`               | —          | 头像尺寸(rpx)                  |

`SwcCharacterView`（展示用最小视图，从 `LineupCharacterPreview` 派生）：
`characterId / name / avatar / elementKey / elementName / familyName / archetype / stars / originalStars`。

### 2.2 Emits

- `click(character)`：点击卡片（跳详情 / 选择）。
- `remove(characterId)`：点右上角删除叉。

### 2.3 说明

- 内部复用 `SwcElementBadge`；头像缺省用名称首字占位。
- list.vue 现有 `.character-card` 系列样式下沉到本组件（含 `card-element-*` 配色、星角标、编辑角标）。
- 选人项、阵容成员、图鉴列表统一用它，仅靠 props 切换显隐与形态。

---

## 3. 阵容组件 `SwcLineup`（含第 4 点）

新增 `components/swc-lineup.vue`，替代/收敛 `lineup-avatar-card.vue` + `character-avatar-grid.vue` 的展示职责。

### 3.1 Props

| prop              | 类型                                                                                                | 默认           | 说明                                       |
| ----------------- | --------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------ |
| `characters`      | `SwcCharacterView[]`                                                                                | `[]`           | 0~多人物                                   |
| `name`            | `string`                                                                                            | —              | 阵容名称                                   |
| `description`     | `string`                                                                                            | —              | 阵容描述                                   |
| `type`            | `string`                                                                                            | —              | 阵容类型                                   |
| `showName`        | `boolean`                                                                                           | `false`        | 显示名称                                   |
| `showDescription` | `boolean`                                                                                           | `false`        | 显示描述                                   |
| `showType`        | `boolean`                                                                                           | `false`        | 显示类型                                   |
| `editable`        | `boolean`                                                                                           | `false`        | **可编辑态：成员头像右上角显示删除小图标** |
| `columns`         | `number`                                                                                            | `5`            | 每行列数                                   |
| `emptyText`       | `string`                                                                                            | `'还没有成员'` | 空态文案                                   |
| 透传卡片显隐      | `showMemberName` / `showStars` / `showOriginalStars` / `showElement` / `avatarShape` / `avatarSize` |                | 下发给每个 `SwcCharacterCard`              |

### 3.2 Emits

- `remove(characterId)`：编辑态删除成员（透传自卡片）。
- `card-click(character)`：点击成员卡。

### 3.3 第 4 点结论：**并入 `SwcLineup`，不新建组件**

- 「选择确认后的可编辑阵容」= `<SwcLineup :characters="selected" editable @remove="..." />`。
- 只读展示（映射详情、阵容预览）= 同组件不传 `editable`。
- 删除小图标由 `SwcCharacterCard` 的 `showRemove` 实现，`SwcLineup` 在 `editable` 时对每张卡置 `showRemove`。
- 理由：删除态只是「阵容组件的一种模式」，用一个 `editable` 开关比维护两套组件更简单、样式一致。

---

## 4. 迁移与复用点

| 使用处                             | 现状                                 | 迁移后                                                     |
| ---------------------------------- | ------------------------------------ | ---------------------------------------------------------- |
| 图鉴列表 `list.vue`                | 内联 `.character-card`               | 用 `SwcCharacterCard`（showFamily/showStars…）             |
| 选人页 `character-picker.vue`      | 内联头像项 + 选中角标                | 用 `SwcCharacterCard`（selectable/selected/selectedIndex） |
| 阵容编辑 `lineup-edit.vue` 成员区  | `CharacterAvatarGrid` + 「移除」按钮 | `SwcLineup :editable`（右上角删除叉，替代按钮）            |
| 选人确认后可编辑阵容               | 无独立组件                           | `SwcLineup :editable`（第 4 点）                           |
| 映射详情/预览 `lineup-avatar-card` | 独立组件                             | `SwcLineup`（只读，showName/showType/showStars）           |

> `character-avatar-grid.vue` / `lineup-avatar-card.vue` 迁移完成后可逐步弃用或改为薄封装，保证过程中不破坏映射模块。

---

## 5. 落地顺序（增量、每步可编译）

1. 数据层：`LineupCharacterPreview`/归一化 + `SwcCharacterView` 增加 `originalStars`。
2. `SwcCharacterCard`（下沉 list.vue 卡片样式）→ 接入 `list.vue` 验证视觉一致。
3. `SwcLineup`（含 `editable`）→ 接入 `lineup-edit.vue` 成员区（删除叉替代按钮）。
4. 选人页 `character-picker.vue` 卡片改用 `SwcCharacterCard`；确认后可编辑阵容用 `SwcLineup :editable`。
5. 映射预览迁移 `SwcLineup`（低风险，最后做）。
6. 原始星级：`edit.vue` 增加编辑输入 + 提交（方案 A/B 视后端）。

每步遵守 Harness：仅 `devin/*` 分支、`src/**` 改动同提交更新 `docs/changelog.md`、不加依赖、不动 vite/manifest/.env、不用 `--no-verify`。

---

## 6. 已确认决策

- **Q1（原始星级）**：= 现有 `attributes[stars]`，不新增字段、不改后端；edit.vue 编辑该属性值。
- **Q2（删除交互）**：头像/卡牌右上角的移除，作为卡片的一个**可配置样式方案**（`showRemove` 角标叉），与现「移除按钮」并存为不同风格。
- **Q3（迁移范围）**：本轮**全迁移**——list.vue、character-picker.vue、lineup-edit.vue、lineup-mappings 相关组件（character-avatar-grid / lineup-avatar-card）全部改用新组件。
- **Q4（组件落位）**：放 `swc/components/`，`swc-character-card.vue` / `swc-lineup.vue`，kebab-case 文件 + PascalCase 引入。
