# 魔灵召唤人物推荐装备需求规格书

## 0. 元信息

| 项       | 内容                                                                                      |
| -------- | ----------------------------------------------------------------------------------------- |
| 功能名称 | 魔灵召唤人物推荐符文与神器                                                                |
| 所属域   | `subPackages/tools/compendium/swc`                                                        |
| 发布端   | H5 + mp-weixin                                                                            |
| 状态     | 开发中                                                                                    |
| 关联文档 | `docs/architecture.md`、Apifox `NODEJSDEMO/EQUIPMENT`、`docs/swc-icon-upload-manifest.md` |

## 1. 业务上下文与页面流

人物详情页增加「符文」页签，在同一详情路由内展示推荐符文和推荐神器，不新增页面或路由。用户切换觉醒形态或属性人物后，推荐装备必须随当前 `characterId` 重新加载，不能保留上一人物的数据。

| 页面         | 路由路径                                  | 来源入口     |
| ------------ | ----------------------------------------- | ------------ |
| 魔灵人物详情 | `subPackages/tools/compendium/swc/detail` | 图鉴、RTA 等 |

## 2. API 契约

| 功能         | 方法与路径                             | Apifox 方法                        |
| ------------ | -------------------------------------- | ---------------------------------- |
| 获取推荐装备 | `GET /compendiums/character-equipment` | `getCompendiumsCharacterEquipment` |

请求固定携带 `compendiumId=swc`，使用当前本地人物 `characterId`。业务页面直接导入 Apifox 方法；宽类型字段在 `equipment-normalizers.ts` 收敛为页面 ViewModel，不修改生成目录。

## 3. 展示与状态

- 符文页签首次打开时懒加载；重复切换页签复用当前人物结果。
- 人物详情分享必须携带当前人物 ID 和所选页签；从会话或朋友圈冷启动打开时必须恢复人物详情，不能出现“缺少魔灵 ID”。
- 推荐符文按场景展示套装组合、2/4/6 号位主属性和副属性优先级。
- 推荐神器按场景展示属性神器、类型神器和通用神器的主属性、推荐副属性。
- Loading、Error、Empty 均在装备容器内展示；错误态提供手动重试。
- 下拉刷新当前详情和已打开的装备数据；人物切换使旧装备请求失效。
- 使用接口返回的 `usage.rate` 和 `usage.count`，仅格式化，不重新推导统计口径。

## 4. 图片资源与 OSS

前端不保留装备图标静态源文件，避免 uni-app 将整目录复制进微信小程序包。运行时统一通过 `SwcSquareIcon` 解析 OSS URL，并沿用微信小程序下载、持久化缓存与失败回退能力。资源对象映射由 `icon-assets.ts` 的 `listSwcEquipmentUploadAssets` 维护；需要重新上传时使用后端采集资产与 OSS 上传脚本，不从前端包取源文件。

OSS 根地址：`https://lzk-web.oss-cn-beijing.aliyuncs.com/swc`

```text
swc/
  runes/
  rune-slots/
  artifact-slots/
  artifacts/attribute/
  artifacts/type/
```

资源共 40 个 PNG。上传使用后端现有 `uploadSwcIconManifest.js`，对象设置 `Content-Type: image/png` 与 `Cache-Control: public, max-age=31536000, immutable`。

## 5. 跨端兼容

- 仅使用 uni-app `view`、`text`、`button` 与既有图片容器。
- 不使用浏览器 API、Web 标签、裸 `uni.request` 或跨分包导入。
- 所有布局使用 `rpx` 和主题 token，H5 与 mp-weixin 共用同一实现。

## 6. 验收清单

- [ ] 40 个装备图标已上传 OSS，公开 URL、PNG Content-Type 和长缓存均有效
- [ ] 微信小程序构建产物不包含 `static/image/equipment-icons`
- [ ] 人物详情以单行可点击样式展示四个稳定页签：属性、技能、符文、RTA
- [ ] 推荐符文按场景展示套装、2/4/6 号位和副属性优先级
- [ ] 推荐神器按场景展示属性/类型/通用分组与推荐效果
- [ ] 符文页签具备 Loading、Error、Empty、Retry 状态
- [ ] 觉醒形态、属性人物切换和下拉刷新不会混用旧人物装备数据
- [ ] H5 与 mp-weixin 图片均通过统一容器展示
- [ ] normalizer 单元测试、`pnpm lint`、`pnpm type-check` 通过
- [ ] `pnpm build:h5`、`pnpm build:mp-weixin` 通过
- [ ] `docs/changelog.md` 已同步更新
