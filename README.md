# uni-demo

基于 uni-app 的 H5/小程序项目。

## 开发

```bash
# 安装依赖
pnpm install

# H5 开发模式
pnpm dev:h5

# 微信小程序开发模式
pnpm dev:mp-weixin
```

## 构建

```bash
# 构建 H5
pnpm build:h5

# 构建微信小程序
pnpm build:mp-weixin
```

## 部署到云服务器

服务器信息：
- IP: `120.24.96.11`
- 域名: `liangzhikai.top`
- 系统: CentOS 7.9
- Web目录: `/var/www/html/`

### 上传命令（本地 PowerShell / Git Bash 执行）

```bash
# 构建 H5
pnpm build:h5

# 上传到服务器
scp -r d:\coding\uni-demo\dist\build\h5\* root@120.24.96.11:/var/www/html/
```

### 服务器 Nginx 配置

配置文件位置: `/etc/nginx/conf.d/h5.conf`

```nginx
# HTTP - 域名跳转 HTTPS，IP 直接访问
server {
    listen 80 default_server;
    server_name liangzhikai.top;
    return 301 https://liangzhikai.top$request_uri;
}

server {
    listen 80;
    server_name 120.24.96.11;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTPS - 仅域名
server {
    listen 443 ssl;
    server_name liangzhikai.top;

    ssl_certificate /etc/nginx/liangzhikai.top.pem;
    ssl_certificate_key /etc/nginx/liangzhikai.top.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 重载 Nginx（服务器执行）

```bash
nginx -t
systemctl reload nginx
```

## 访问地址

| 地址 | 说明 |
|------|------|
| https://liangzhikai.top | HTTPS 访问 |
| http://liangzhikai.top | 自动跳转 HTTPS |
| http://120.24.96.11 | IP 直接访问 |

## H5 与小程序差异

| 功能 | 微信小程序 | H5 |
|------|-----------|-----|
| 底部导航 | 原生 TabBar | 自定义 H5TabBar 组件 |
| 登录方式 | 微信授权 + 手机号密码 | 手机号 + 密码 |
| 我的页面 | ✅ | ✅ |
| 页面跳转 | switchTab | redirectTo |

### H5 专属组件

- `src/components/h5-tab-bar.vue` - H5 底部导航栏组件

### 微信小程序专属组件

- `src/components/privacy-popup.vue` - 用户隐私保护授权弹窗

### 微信小程序隐私保护配置

根据微信官方要求，已在 `manifest.json` 中配置：
```json
"mp-weixin": {
  "__usePrivacyCheck__": true
}
```

需要在微信公众平台完成《用户隐私保护指引》填写：
1. 登录 [微信公众平台](https://mp.weixin.qq.com)
2. 进入 设置 → 服务内容声明 → 用户隐私保护指引
3. 填写并提交审核

### 条件编译说明

项目使用 uni-app 条件编译区分平台：
- `#ifdef MP-WEIXIN` - 仅微信小程序
- `#ifdef H5` - 仅 H5
- `#endif` - 结束条件编译

## 备案信息

粤ICP备2025489016号-2
