# A0 路由审计

机器清单：`architecture-reports/route-map.json`。

## 注册路由全量清单

| 包 | 数量 | 路由 |
| --- | ---: | --- |
| 主包 | 4 | `/pages/index/index`、`/pages/tools/index`、`/pages/mine/mine`、`/pages/mine/login/login` |
| `subPackages/user` | 1 | `/subPackages/user/setting/setting` |
| `subPackages/tools` | 43 | `/subPackages/tools/memo/list`、`memo/editor`、`memo/detail`；`family-tree/index`、`family-tree/demo`；`oss-upload/index`、`oss-upload/fileList`；`image-compress/index`、`image-privacy/index`、`image-watermark/index`、`image-format/index`、`image-cipher/index`、`image-stitch/index`；`markdown/index`、`pdf-toolkit/index`、`code-wallet/index`、`qr-generator/index`、`qr-parser/index`；`calendar/index`、`calendar/detail`、`calendar/festivals`、`calendar/auspicious`；`video-compress/index`、`watermark/index`、`video-gif/index`；`document-scan/index`；`chat/index`、`chat/list`；`schema-demo/list`；`pool-aim/index`；`magnet-link/index`；`game-coupons/index`；`compendium/swc/index`、`list`、`detail`、`edit`、`admin-list`、`lineups`、`lineup-edit`、`lineup-relations`、`character-picker`、`lineup-mappings`、`lineup-mapping-detail` |
| `editor-core` | 1 | `/editor-core/demo/SchemaEditorDemo` |
| `subPackages/common` | 2 | `/subPackages/common/webview/webview`、`/subPackages/common/webview/h5` |

51 个注册路由均找到对应 `.vue` 文件；3 个 tabBar 路径均已注册。`src/config/tools.ts` 的 27 个工具路径全部能映射到注册路由（查询参数已剥离后核对）。

## 跳转与分享统计

| 来源 | 数量 | 结果 |
| --- | ---: | --- |
| `uni/wx.navigateTo` | 69 | 3 个字面路径无效，若干变量路径需追踪来源 |
| `uni/wx.redirectTo` | 8 | 1 个字面路径无效 |
| `uni/wx.switchTab` | 9 | 字面 tab 路径有效；变量路径来自 tab 白名单 |
| `uni/wx.reLaunch` | 0 | 无 |
| 分享路径命中 | 38 | 3 个活动位置指向旧备忘录路径 |
| 工具注册路径 | 27 | 全部有效 |

## 未注册与旧路径

唯一确认的无效目标为 `/subPackages/services/memo/detail`，该目录不在 `pages.json`。

| 位置 | 类型 | 影响 | 严重度 | 阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- |
| `src/subPackages/tools/memo/detail.vue:2270` | 当前注册详情页的微信分享 path | 分享卡片无法落到已注册页 | Blocking | P0C | 是 |
| `src/subPackages/tools/memo/list.vue:515` | 当前注册列表页中的 `viewMemo` | 函数当前无模板调用，但一旦复用即跳转失败 | High | P0C | 是 |
| `src/subPackages/services/memo/editor.vue:1655` | 旧编辑器 redirectTo | 旧实现保存后跳转失败 | High | P0C / P6 | 否（旧实现未注册） |
| `src/subPackages/services/memo/list.vue:456` | 旧列表 navigateTo | 旧实现预览跳转失败 | High | P0C / P6 | 否 |
| `src/subPackages/services/memo/detail.vue:2182` | 旧详情分享 | 旧分享无效 | High | P0C / P6 | 否 |
| `src/subPackages/services/memo/editor.vue:3980` | 旧编辑器分享 | 旧分享无效 | High | P0C / P6 | 否 |

此外，旧路径还出现在 URL 拼接和内部 linkInfo 中：`src/subPackages/services/memo/detail.vue:1180,1692,1784,2148`、`src/subPackages/services/memo/editor.vue:2413,2721`、`src/subPackages/tools/memo/detail.vue:1268,1780,1872,2236`。这些不是全部由四种导航 API 直接调用，但会污染 H5 链接、块内链接和分享。

## 已存在但未注册的 Vue 候选

| 文件 | 判断 | 影响 | 严重度 | 阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- |
| `src/subPackages/services/memo/list.vue` | 旧备忘录页面副本 | 与活动实现并存 | High | P6A | 是 |
| `src/subPackages/services/memo/editor.vue` | 旧备忘录编辑器，7,245 行 | 双实现与数据兼容风险 | High | P6A | 是 |
| `src/subPackages/services/memo/detail.vue` | 旧详情页副本 | 仍被旧路径字符串引用 | High | P0C / P6A | 是 |
| `src/subPackages/tools/family-tree/family-tree-chart.vue` | 被 `family-tree/index.vue:50` 作为内部组件 import | 不是缺失路由 | Low | P7 | 否 |
| `src/subPackages/tools/family-tree/family-tree-list.vue` | 被 `family-tree/index.vue:48` 作为内部组件 import | 不是缺失路由 | Low | P7 | 否 |
| `src/subPackages/tools/family-tree/member-detail.vue` | 族谱内部组件 | 不是缺失路由 | Low | P7 | 否 |

## 动态路由

22 个调用使用变量或拼接。可静态追溯的来源包括：

- `tool.path` / `primary.tool.path`：来自 27 个已验证的工具注册路径，见 `src/hooks/use-tool-directory.ts:304,320`。
- `PrivacyPageUrl` / `ProtocolPageUrl`：均指向已注册 `/subPackages/common/webview/webview`，见 `src/utils/const.ts:1-2`。
- 魔灵门户 `path`：来自 `src/subPackages/tools/compendium/swc/index.vue:52-88` 的四个已注册常量路径。
- OSS 文件列表 `url`：由已注册 `/subPackages/tools/oss-upload/fileList` 拼接，见 `oss-upload/index.vue:354-357`。
- 登录回跳 `url/targetUrl`：运行时输入，部分通过 tab 白名单分流，无法仅靠字面扫描完全证明。
- `App.vue:115` 的第三方 callback path、`utilsH5/appDsBridge.ts:225,229` 的通用 path、`mine-list-item.vue:47` 的数据驱动目标无法静态穷举，需在 P0C 路由检查中建立 allowlist/来源验证。

## 族谱状态

`/subPackages/tools/family-tree/index` 与 demo 路由均注册且文件存在；`src/utils/share.ts:93-97` 仍注册族谱分享。工具项 `src/config/tools.ts:260-267` 没有 `hiddenInDirectory: true`，而 `use-tool-directory.ts:100-105` 只过滤该字段，因此族谱当前在工具目录可见，不是隐藏状态。

## 问题登记

| ID | 问题 | 证据 | 影响范围 | 严重度 | 建议阶段 | 阻塞 |
| --- | --- | --- | --- | --- | --- | --- |
| A0-B01 | 活动分享指向未注册旧备忘录路由 | `tools/memo/detail.vue:2270`、`pages.json:45-74` | 微信分享、外部收藏 | Blocking | P0C | 是 |
| A0-H06 | 新旧备忘录路径和页面并存 | `subPackages/services/memo/**`、`subPackages/tools/memo/**` | 备忘录全链路 | High | P0C 后 P6A | 是 |
| A0-H03 | 族谱当前公开而计划要求隐藏 | `config/tools.ts:260-267`、`use-tool-directory.ts:100-105` | 工具目录与分享 | High | P0B | 否 |
| A0-M03 | 运行时动态路径未受自动门禁约束 | `App.vue:115`、`appDsBridge.ts:225,229` | 第三方回跳/H5 bridge | Medium | P0C / P9 | 否 |
