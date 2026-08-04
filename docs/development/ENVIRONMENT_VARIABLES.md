# 环境变量

## 本地配置

仓库提交 `.env.development`、`.env.test`、`.env.production` 三份团队共享 mode 配置，用于现有 `--mode=test`、`--mode=production` 和默认构建。它们只能包含可公开的 `VITE_*` 值。

个人或机器覆盖配置使用 Vite 的 local 文件，例如：

```bash
cp .env.example .env.local
```

`.env.local`、`.env.*.local` 与其他 `*.local` 文件不得提交。敏感 CI 值应通过受保护的 CI 配置提供，不得写入共享 mode 文件。

## 前端公开变量

项目源码当前读取以下 Vite 变量：

- `VITE_APP_ENV`
- `VITE_APP_BASE_URL`
- `VITE_APP_H5_URL`
- `VITE_APP_OSS_HOST`
- `VITE_APP_CDN_OSS_BUSINESS`
- `VITE_PUBLIC_THIS_H5_URL`
- `VITE_RECOMMEND_BUSINESS_GOODS_ID`
- `VITE_APP_CDP_HOST`
- `VITE_E_SIGN_URL`

所有 `VITE_` 变量都会进入 H5 或小程序前端产物，只能包含可公开配置。Authorization、Token、Secret、密码、私钥和服务端密钥禁止使用 `VITE_` 前缀。

## Apifox 插件配置

Apifox 自动生成插件当前使用本地 `.vscode/autoApiGen.json`，不使用 Vite 环境变量。配置方法见 `docs/development/APIFOX_CODE_GENERATION.md`。该文件包含本地凭证，已被 Git 精确忽略；不要把凭证转写到 `.env.example`。

普通微信小程序和 H5 构建不读取 Apifox 本地配置，也不应依赖 Apifox 令牌。
