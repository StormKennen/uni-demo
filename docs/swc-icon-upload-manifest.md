# SWC 通用图标上传清单

> 面向后端 / 运维。该清单用于把魔灵召唤通用图标批量上传到 OSS/CDN，并保持与前端组件映射完全一致。

## 单一事实源

前端映射事实源：

- [src/subPackages/tools/compendium/swc/icon-assets.ts](/Users/apple/Developer/uni-demo/src/subPackages/tools/compendium/swc/icon-assets.ts:1)

该文件显式维护了：

- `kind`
- `iconKey`
- `fileName`
- `folder`
- `relativePath`
- `objectKey`

后端上传时不要自行拼接文件名，直接复用导出的 manifest。

## 导出命令

在本仓库根目录执行：

```bash
node --experimental-strip-types scripts/export-swc-icon-upload-manifest.mjs
```

执行后会生成：

- [docs/swc-icon-upload-manifest.json](/Users/apple/Developer/uni-demo/docs/swc-icon-upload-manifest.json:1)

## 本地资源根目录

```text
src/subPackages/tools/static/swc
```

## OSS 目标目录约定

```text
swc/
  arche-types/
  elements/
  buffs/
  debuffs/
  leader-skills/
```

## 后端上传建议

1. 读取 `docs/swc-icon-upload-manifest.json`
2. 遍历 `files`
3. 使用 `sourceBaseDir + relativePath` 定位本地文件
4. 上传到 `objectKey`
5. 上传完成后前端再把资源基地址切到 CDN

## 说明

- 当前 manifest 总数由导出脚本自动生成
- 当新增/删除 SWC 图标时，只需更新 `icon-assets.ts`
- 再重新执行一次导出命令即可得到新的后端上传清单
