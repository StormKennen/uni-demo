# SWC 人物保存接口契约排查说明

## 背景

当前前端在 `src/subPackages/tools/compendium/swc/edit.vue` 保存人物时，已经改为提交完整记录：

- `compendiumId`
- `characterId`
- `name`
- `skills`
- `attributes`：完整数组，仅覆盖 `key = stars`
- `categories`：对象形态
- `skins`：原样数组
- `aliases`：原样数组

前端收到 `code === 200` 后，仍可能出现“提示保存成功，但返回列表/详情里星级没有变化”的现象，因此前端已增加保存后自检：

1. 先读取 `PATCH /admin/compendiums/characters` 的返回值里的 `attributes.stars`
2. 若返回体没有 `stars`，再发起一次 `GET /compendiums/character` 复核
3. 若最终读回的星级与提交值不一致，前端不会再误报“保存成功”

## 接口

- `PATCH /admin/compendiums/characters`

## 关键契约

### 1. 这是全量替换语义

该接口不是“只更新几个字段”的补丁接口，而是按人物记录整体回写。

**风险点：**

- `attributes`
- `categories`
- `skins`
- `aliases`

如果请求里不带上述字段，或者字段结构不符合后端预期，后端可能会把原值清空。

### 2. 前端使用的识别字段

前端当前发送：

- `compendiumId`
- `characterId`

请后端确认最终更新时，确实是按照这两个字段定位到目标人物，并且返回的记录是同一条人物数据。

### 3. `attributes[stars]` 必须落库并回显

前端会把“原始星级”写入：

- `attributes` 数组中的 `key = stars`

后端要求：

- `stars` 这个属性 key 必须已经存在于该图鉴的属性定义中
- 保存后应当落库
- 响应体里也应当回显更新后的 `attributes.stars`

### 4. 当前排查症状

目前正在排查的症状是：

- 请求返回 `200`
- 前端保存成功
- 但 `attributes[stars]` 没有实际更新，或者列表/详情页仍然读到旧值

## 供后端排查的请求示例

```json
{
  "compendiumId": "swc",
  "characterId": "monster-001",
  "name": "示例魔灵",
  "skills": [
    {
      "id": "skill-1",
      "name": "技能一",
      "description": "技能描述",
      "hitCount": 2,
      "sortOrder": 0,
      "coefficients": []
    }
  ],
  "attributes": [
    { "key": "stars", "value": 6 },
    { "key": "hp", "value": 12345 }
  ],
  "categories": {
    "element": "fire",
    "awaken": "awakened"
  },
  "skins": [],
  "aliases": []
}
```

## 后端建议检查点

1. PATCH 后是否真的写入了人物表
2. `attributes.stars` 是否被当成可持久化字段处理
3. `categories / skins / aliases` 是否被整体替换时正确保留
4. 响应体是否与数据库最终状态一致

## 前端当前行为

当提交了“原始星级”时，前端会：

- 先读取 PATCH 返回体
- 如必要再发一次 GET 复核
- 若最终读回星级不一致，则提示：
  - `已提交，但服务端未更新星级，请联系后端`
- 并在控制台输出提交值、回读值和请求体，方便后端定位
