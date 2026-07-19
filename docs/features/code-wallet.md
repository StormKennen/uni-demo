# 码包云同步 需求规格书（AI-Native Spec）

> 契约以 `src/services/apifox/NODEJSDEMO/CODEWALLET/**` 生成层为准，禁止臆测接口/字段。所有请求经 Apifox 生成方法（内部走 `src/services/http.ts`）。

## 0. 元信息

| 项       | 内容                                     |
| -------- | ---------------------------------------- |
| 功能名称 | 码包（二维码 / 条形码保存与云同步）      |
| 所属域   | subPackages/tools                        |
| 发布端   | H5 + mp-weixin（双端必须）               |
| 状态     | 开发中                                   |
| 关联文档 | Apifox 项目 7048425 / CODEWALLET 生成层  |

## 1. 业务上下文与页面流

### 1.1 业务背景

用户常需保存常用的二维码/条形码内容（会员码、付款码、Wi-Fi、网址等）。未登录时保存在本地；登录后以云端列表为主，并可将本地码一键同步到云端。同时与二维码工具打通：解析/生成结果可「保存到码包」。

### 1.2 页面流与路由（MUST 填写，防路由冲突）

| 页面     | 路由路径（pages.json 注册位置）                | 跳转方式         | 来源入口                              |
| -------- | ---------------------------------------------- | ---------------- | ------------------------------------- |
| 码包主页 | `subPackages/tools/code-wallet/index`（tools 分包节点） | `uni.navigateTo` | 首页工具卡；二维码解析/生成结果按钮 |

- 需要在 `src/pages.json` 中新增的路由路径：
  - `code-wallet/index`，`style.navigationBarTitleText = "码包"`，`style.navigationStyle = "custom"`
- 需要在 `src/config/tools.ts` 中注册的工具入口：
  - key `code-wallet`，name「码包」，desc「常用码保存/同步」，icon `scan`，category `qr`，path `/subPackages/tools/code-wallet/index`，`isNew: true`
- onLoad 带 `content`/`codeType` 参数时自动打开新增表单并回填。

## 2. 前后端 API 契约（TypeScript）

### 2.1 接口清单（Apifox 生成方法，禁止手写 request）

| 功能       | 方法与路径                          | 鉴权     | 调用封装（apifox 生成层）        |
| ---------- | ----------------------------------- | -------- | -------------------------------- |
| 列表       | `GET /code-wallet/items`            | 登录用户 | `getCodeWalletItems`             |
| 创建       | `POST /code-wallet/items`           | 登录用户 | `postCodeWalletItems`            |
| 本地同步   | `POST /code-wallet/items/sync`      | 登录用户 | `postCodeWalletItemsSync`        |
| 详情       | `GET /code-wallet/items/{itemId}`   | 登录用户 | `getCodeWalletItemsItemId`       |
| 更新       | `PATCH /code-wallet/items/{itemId}` | 登录用户 | `patchCodeWalletItemsItemId`     |
| 删除(软)   | `DELETE /code-wallet/items/{itemId}`| 登录用户 | `deleteCodeWalletItemsItemId`    |

```ts
import {
  deleteCodeWalletItemsItemId,
  patchCodeWalletItemsItemId,
  getCodeWalletItemsItemId,
  postCodeWalletItemsSync,
  postCodeWalletItems,
  getCodeWalletItems,
} from '@/services/apifox/NODEJSDEMO/CODEWALLET/apifox'
```

### 2.2 TypeScript 契约（真实类型名，来自 CODEWALLET/interface.ts）

- 列表 query：`getCodeWalletItemsQuery = { keyword?; codeType?; tag?; page?; pageSize? }`
- 列表返回：`getCodeWalletItemsRes = object`（生成层未定义结构；前端按 `{ results?, list?, items? }` 宽松读取，item 结构对齐 `postCodeWalletItemsRes`，不臆造新字段）
- 创建 body：`postCodeWalletItemsBody = { name; content; codeType: 'qr' | 'barcode'; barcodeFormat?: 'code128' | 'ean13' | 'ean8' | 'upc'; color?; backgroundColor?; tag? }`
- 创建/详情/更新返回项：`postCodeWalletItemsRes` / `getCodeWalletItemsItemIdRes` / `patchCodeWalletItemsItemIdRes = { id?; name?; content?; codeType?; barcodeFormat?; color?; backgroundColor?; tag?; pinned?; sortOrder?; status? }`
- 更新 body：`patchCodeWalletItemsItemIdBody`（同创建字段 + `pinned?`、`sortOrder?`、`status?`，均可选）
- 同步 body：`postCodeWalletItemsSyncBody = { items: postCodeWalletItemsSyncBodyItemsItem[] }`
  - `postCodeWalletItemsSyncBodyItemsItem = { name; content; codeType: 'qr' | 'barcode'; barcodeFormat?; localId?; pinned?; tag?; updatedAt?（毫秒时间戳）}`
- 同步返回：`postCodeWalletItemsSyncRes = { created?; updated?; skipped? }`

### 2.3 本地数据策略

- 未登录：本地保存；已登录：云端列表为主，提供「同步本地码到云端」。
- Storage key：`TOOL_CODE_WALLET_LOCAL_ITEMS`（经 `src/utils/storage.ts`）。
- 本地 item 仅前端缓存结构（含 `localId`、`updatedAt`），同步时转换为 `postCodeWalletItemsSyncBodyItemsItem` 支持字段。

### 2.4 错误与权限处理

- 401：http.ts 统一处理。删除前二次确认。

## 3. 交互约束

### 3.1 防重与防抖（MUST）

- 新增/更新/删除/同步按钮请求期间 `loading` / `disabled`。
- 列表触底加载 `loading` + `hasMore` 双闸。
- 搜索输入防抖 ≥ 300ms（`lodash-es debounce`）。

### 3.2 状态与空态

- Loading / 空态（引导新增）/ 错误态 / 未登录态（本地模式提示）。

### 3.3 主题

- 全部走 `--theme-*` token；条目自定义 `color/backgroundColor` 用于码预览区。

## 4. 埋点

`reportToolVisit('code-wallet')`。

## 5. 条件编译与跨端兼容说明

- 复制内容：`uni.setClipboardData`（双端通用，禁用 `navigator.clipboard`）。
- 二维码预览：复用 `QrGeneratorPanel`（sheet 模式）或现有二维码生成能力；条形码第一版仅展示内容 + 复制（不新增依赖，条形码渲染后续补）。
- 禁用项自查：无 `div/span/img`、无裸 `uni.request`、无 `vue-router`、无写死颜色。

## 6. 与二维码工具打通

- 二维码解析结果（`qr-parser-panel`）：新增「保存到码包」，`uni.navigateTo('/subPackages/tools/code-wallet/index?content=xxx&codeType=qr')`。
- 二维码生成（`qr-generator-panel`）：生成后新增「保存到码包」，带 `content` 跳转。
- code-wallet `onLoad`：有 `content` 参数则自动打开新增表单并回填。

## 7. 验收清单

- [ ] 未登录本地新增/编辑/删除可用
- [ ] 已登录云端列表/新增/编辑/删除可用
- [ ] 本地同步云端可用
- [ ] 二维码解析/生成能跳转保存到码包
- [ ] 不新增依赖
- [ ] `pnpm build:h5` / `pnpm build:mp-weixin` 通过
- [ ] `docs/changelog.md` 已同步更新
