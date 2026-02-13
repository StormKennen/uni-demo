#!/bin/bash

# 遇到错误立即停止
set -e

# --- 配置区域 ---
PROJECT_PATH=$(pwd)
BUILD_PATH="$PROJECT_PATH/dist/build/h5"
ZIP_NAME="h5-deploy.zip"
ZIP_PATH="$PROJECT_PATH/$ZIP_NAME"
SERVER_USER="root"
SERVER_IP="120.24.96.11"
SERVER_PATH="/var/www/html"
# Mac 默认 SSH 路径通常在 ~/.ssh/
SSH_KEY="$HOME/.ssh/id_ed25519"

echo "========================================"
echo "   H5 Mac 自动化部署脚本 (Shell版)"
echo "========================================"

# 步骤 1: 编译 H5
echo "[1/4] 正在编译 H5..."
# 确保已安装 pnpm
if ! command -v pnpm &> /dev/null; then
    echo "错误: 未找到 pnpm，请先安装: npm install -g pnpm"
    exit 1
fi

pnpm build:h5
echo "编译完成"

# 步骤 2: 压缩编译输出
echo "[2/4] 正在压缩文件..."
if [ -f "$ZIP_PATH" ]; then
    rm "$ZIP_PATH"
fi

# 进入编译目录进行压缩，这样解压后不会包含多余的文件夹层级
cd "$BUILD_PATH"
zip -r "$ZIP_PATH" ./*
cd "$PROJECT_PATH"
echo "压缩完成: $ZIP_PATH"

# 步骤 3: 上传到服务器
echo "[3/4] 正在上传到服务器..."
scp -i "$SSH_KEY" "$ZIP_PATH" "${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/"
echo "上传完成"

# 步骤 4: 在服务器上执行解压部署
echo "[4/4] 正在执行远程部署命令..."
# 注意：这里假设服务器上已有 deploy-h5.sh 脚本
ssh -i "$SSH_KEY" "${SERVER_USER}@${SERVER_IP}" "cd $SERVER_PATH && sed -i 's/\r$//' deploy-h5.sh && chmod +x deploy-h5.sh && ./deploy-h5.sh $ZIP_NAME"

echo "========================================"
echo "   🎉 部署成功！"
echo "========================================"