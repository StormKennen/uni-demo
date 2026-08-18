# 备忘录游客访问与分享

## 目标

完成备忘录分享链接、微信小程序 Guest Session、游客收到列表和 Guest → User 登录迁移的前端闭环。当前正式页面继续使用：

- `/subPackages/tools/memo/list`
- `/subPackages/tools/memo/detail`
- `/subPackages/tools/memo/editor`

本期不新增页面、不改动旧的 `src/subPackages/services/memo/*` 页面，也不手工修改 Apifox 生成目录。

## 接口契约

业务页面直接调用 `src/services/apifox/NODEJSDEMO/MEMOS` 中的生成方法：

- `getMemosPublicList`
- `postMemosGuestMigrate`
- `postMemosMemoIdShare`
- `deleteMemosMemoIdShare`
- `getMemosPublicDetail` 的可选 `shareToken`

Guest 列表只使用 `search`、`sortBy`、`page`、`limit`。详情首次打开使用 `id + shareToken`，HTTP 层自动附带 `X-Guest-Token`。

## 权限与生命周期

- Owner 仅在后端明确 `accessRole=owner` 或 `canEdit=true` 时进入编辑。
- Guest、Shared User、Admin 均只读；游客列表隐藏用户侧分类、标签、置顶、收藏、删除和新建操作。
- H5 未登录不调用 Guest List，只展示登录入口；H5 公开详情仍可用 `id + shareToken` 打开。
- 登录页在账号登录、注册和微信快捷登录前尝试预热 Guest Session；微信快捷登录在预热完成后重新调用 `uni.login()` 获取正式 code。
- 登录或自动登录成功后执行一次幂等 `postMemosGuestMigrate`。迁移失败不影响登录且保留 Guest Token，成功后清理本次迁移使用的 Guest Token。
- Memo 列表通过 `onShow` 检测 Guest → User 身份变化并切换到用户列表，避免重复挂载造成多次首屏请求。

## 已知接口演进点

当前 `getMemosPublicList` 返回结果不包含新的 `shareToken`。游客从列表二次打开详情仍依赖后端暂时保留的 `GET /memos/public/detail?id=...` legacy 兼容能力；前端不把 `memoId → shareToken` 写入 Storage 作为权限机制。后续关闭 legacy 能力前，后端需提供基于 Guest relation 的详情访问或由列表返回正式访问凭证。
