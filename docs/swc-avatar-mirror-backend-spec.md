# 魔灵头像镜像 + CDN + 缩略图 后端方案（交付后端处理）

> 面向后端团队的需求/实现规格。目标是解决**魔灵召唤图鉴/选人组件**中头像加载慢的问题。头像图片来自**第三方数据源**（非自有 OSS），前端无法自行生成缩略图、也无法保证首屏与重复访问的速度，需要后端将头像**镜像到自有 OSS/CDN 并生成缩略图**，接口返回自有地址。

---

## 1. 背景与目标

- 场景：C 端「魔灵召唤」图鉴人物列表与阵容选人组件（含编辑阵容、编辑阵容映射、筛选），人物 **1000+ 条**，每条一张头像。
- 现状痛点：`avatar` 字段是**第三方 URL**，首屏慢、每次进入都要从第三方现拉、第三方带宽/缓存头不可控；小程序本地缓存总量有限（约 10MB），前端无法缓存全部原图；第三方 URL 无法追加裁剪参数生成缩略图。
- 目标：
  1. **首屏与重复访问都快**：头像从自有 CDN 出图。
  2. **体积小**：提供**缩略图**（列表/选人用），大幅降低单张体积与下载耗时，便于客户端缓存更多。
  3. **与第三方解耦**：第三方图源不可用时不影响自有展示。
  4. **稳定 URL**：同一魔灵头像 URL 稳定不变，利于浏览器/小程序/CDN 缓存。

---

## 2. 方案概述

后端将第三方头像**回源镜像**到自有对象存储（OSS/COS/S3 等），并生成**多规格缩略图**；`compendiums characters` 相关接口的 `avatar` 字段返回**自有 CDN 的缩略图 URL**，同时保留原图/第三方地址供详情页或回退使用。

支持两种落地形态（可组合，见 §6）：

- **A. 离线批量镜像**（推荐先做）：数据相对固定，跑一次批处理把存量头像全部镜像 + 生成缩略图并落库。
- **B. 懒代理回源**：请求到某头像时若尚未镜像，则代理回源、异步落库，之后走 CDN。用于兜底新增/漏网数据。

---

## 3. 数据模型

为每个魔灵（或其头像资源）建立镜像记录，建议独立表 `character_avatar_assets`（或在 character 文档上内嵌一个 `avatarAsset` 子对象）：

| 字段             | 类型   | 说明                                      |
| ---------------- | ------ | ----------------------------------------- |
| `id`             | string | 主键                                      |
| `characterId`    | string | 关联魔灵 ID（唯一索引）                   |
| `sourceUrl`      | string | 第三方原始 URL（唯一索引，用于去重/幂等） |
| `sourceHash`     | string | `sourceUrl` 或内容哈希（幂等键，见 §5.3） |
| `originalKey`    | string | 自有 OSS 中原图对象 key                   |
| `originalUrl`    | string | 自有 CDN 原图 URL                         |
| `thumbKey`       | string | 缩略图对象 key                            |
| `thumbUrl`       | string | 缩略图 CDN URL（列表/选人用）             |
| `width`/`height` | number | 原图尺寸（可选）                          |
| `bytes`          | number | 缩略图体积（可选，监控用）                |
| `contentType`    | string | 如 `image/webp`                           |
| `status`         | enum   | `pending` / `mirrored` / `failed`         |
| `error`          | string | 失败原因（失败时）                        |
| `mirroredAt`     | date   | 镜像完成时间                              |
| `updatedAt`      | date   | 更新时间                                  |

索引：`characterId`(unique)、`sourceUrl`(unique)、`status`。

---

## 4. 接口改动

### 4.1 列表/选人接口 `GET /compendiums/characters`

> 说明：前端拟将**选人组件（管理员 + C 端统一）**也走此接口，并使用现有的服务端过滤/排序/分页参数（`categories[awaken]`、`categories[element]`、`categories[archetype]`、`sortBy`、`sortOrder`、`page`、`pageSize`）。本方案只涉及**头像字段**的变化。

每个 item 的头像字段调整为：

```jsonc
{
  "id": "xxx",
  "name": "...",
  // 列表/选人默认使用：自有 CDN 缩略图（小体积）
  "avatar": "https://cdn.self.com/swc/avatars/thumb/<key>.webp",
  // 可选：自有 CDN 原图，供详情页/高清场景
  "avatarOriginal": "https://cdn.self.com/swc/avatars/orig/<key>.webp",
  // 可选：镜像状态；未就绪时前端可回退第三方或占位
  "avatarStatus": "mirrored", // mirrored | pending | failed
  "avatarSource": "https://3rd-party/....png", // 第三方原始地址（回退用，可不返回）
}
```

要求：

- **`avatar` 字段兼容不变**：仍是字符串 URL，前端零成本切换（值从第三方变为自有 CDN 缩略图）。
- 未镜像完成（`pending`/`failed`）时，`avatar` 可暂时回退为第三方 URL 或占位图，`avatarStatus` 告知前端。
- 缩略图与原图 URL **稳定可缓存**（见 §7 缓存头）。

### 4.2 （可选）缩略图规格参数

若使用支持实时裁剪的 CDN（如 OSS 图片处理 `?x-oss-process=image/resize,w_96/format,webp`），可不预生成、由 CDN 按需生成并缓存。此时后端返回**带处理参数的自有 URL** 即可。二选一：

- **预生成缩略图**（落 `thumbKey`），URL 干净；
- **CDN 实时处理**，URL 带处理参数，省存储。

### 4.3 （可选）懒代理端点

`GET /compendiums/avatar-proxy?characterId=...`（或 `?src=<encoded sourceUrl>`）：

- 命中镜像 → 302 到 CDN 缩略图；
- 未命中 → 回源第三方、流式返回并**异步触发镜像落库**，之后转 CDN。
- 注意 SSRF 防护（见 §8）。

---

## 5. 镜像流水线

### 5.1 缩略图规格（建议）

- 列表/选人缩略图：**宽 96px（2x 可 192px）**，`webp`（不支持则 `jpeg` q80），正方形裁剪或按原比例缩放（与前端头像展示一致，建议正方形）。
- 原图：可原样保存或限制最大边（如 512px）。
- 目标：单张缩略图 **≤ ~10KB**，让客户端能缓存数百张。

### 5.2 批量镜像（形态 A）

1. 拉取全部 character 的 `sourceUrl`；
2. 对每条：下载 → 校验(类型/大小) → 生成缩略图 → 上传 OSS(原图+缩略图) → 落库 `mirrored`；
3. 失败记录 `failed` + `error`，支持**重试**；
4. 并发受控（如 10~20），带超时与重试退避；
5. 幂等：以 `sourceUrl`/`sourceHash` 去重，已 `mirrored` 跳过。

### 5.3 增量与更新

- 新增魔灵或第三方 URL 变化：以 `sourceHash` 判断是否需重新镜像；
- 提供**手动/定时重跑**入口（如管理端触发 + 定时任务补漏）。

---

## 6. 落地顺序建议

1. **阶段一**：建表 + 批量镜像存量 + `avatar` 返回自有缩略图 URL（+ `avatarStatus`）。→ 立即解决「每次都慢」。
2. **阶段二**：懒代理兜底新增/漏网 + 定时补漏任务。
3. **阶段三**（可选）：接入 CDN 实时图片处理，按需多规格，省预生成存储。

---

## 7. 缓存与性能

- CDN/OSS 对头像对象设置**长缓存**：`Cache-Control: public, max-age=31536000, immutable`（URL 稳定/带内容哈希时可安全长缓存）。
- URL 建议带**内容哈希或版本**（如 `.../<sha1>.webp`），更新时换 URL，避免脏缓存。
- 开启 CDN gzip/br 及 `webp` 自适应（如支持）。
- 缩略图体积目标见 §5.1，直接决定客户端可缓存数量与首屏速度。

---

## 8. 安全与健壮性

- **SSRF 防护**（懒代理尤其重要）：只允许**白名单第三方域名**回源；禁止内网地址/非 http(s)/重定向到内网。
- 下载**大小上限**（如 ≤ 5MB）与**超时**；校验 `Content-Type` 为图片。
- 第三方 4xx/5xx/超时：记 `failed`，`avatarStatus=failed`，前端回退占位图。
- 版权/合规：镜像第三方图片请确认使用授权（由业务方评估）。

---

## 9. 验收标准

- [ ] `GET /compendiums/characters` 的 `avatar` 返回自有 CDN 缩略图 URL，字段类型不变（string）。
- [ ] 存量 1000+ 头像全部镜像完成（`mirrored` 占比 ≥ 目标阈值，失败可重试）。
- [ ] 缩略图单张体积达标（≤ ~10KB，webp）。
- [ ] 头像对象具备长缓存头，二次加载走缓存。
- [ ] 未镜像/失败时有 `avatarStatus` 且 `avatar` 有可用回退。
- [ ] （若做懒代理）具备 SSRF 白名单与大小/超时限制。

---

## 10. 前端配合点（本仓库侧，供对齐）

- `avatar` 字段语义不变，前端直接使用（选人/列表用缩略图）；详情页可用 `avatarOriginal`。
- 前端仍会做客户端持久缓存（小程序 saveFile / H5 缓存）作为二级加速；缩略图变小后缓存命中率显著提升。
- 选人组件将统一走 `/compendiums/characters`（管理员 + C 端），服务端过滤/排序、每页 50、后台持续自动加载并逐页预热头像。
