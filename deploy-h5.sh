#!/bin/bash
# H5 服务器端部署脚本
# 功能：清理旧文件、解压新文件
# 用法：./deploy-h5.sh h5-deploy.zip

set -e

# 配置
DEPLOY_DIR="/var/www/html"
BACKUP_DIR="/var/www/backups"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
if [ $# -eq 0 ]; then
    print_error "请提供压缩包名称"
    echo "用法: $0 <zip-file>"
    exit 1
fi

ZIP_FILE="$1"
ZIP_PATH="$DEPLOY_DIR/$ZIP_FILE"

# 检查压缩包是否存在
if [ ! -f "$ZIP_PATH" ]; then
    print_error "压缩包不存在: $ZIP_PATH"
    exit 1
fi

echo -e "${CYAN}========================================"
echo -e "H5 部署脚本"
echo -e "========================================${NC}"

# Step 1: 创建备份目录
print_info "创建备份目录..."
mkdir -p "$BACKUP_DIR"
BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Step 2: 备份当前文件（可选）
if [ -f "$DEPLOY_DIR/index.html" ]; then
    print_info "备份当前版本..."
    tar -czf "$BACKUP_DIR/h5_backup_$BACKUP_TIMESTAMP.tar.gz" \
        --exclude="$ZIP_FILE" \
        --exclude="deploy-h5.sh" \
        --exclude="*.zip" \
        -C "$DEPLOY_DIR" . 2>/dev/null || true
    print_success "备份完成: $BACKUP_DIR/h5_backup_$BACKUP_TIMESTAMP.tar.gz"
fi

# Step 3: 清理旧文件（保留压缩包和部署脚本）
print_info "清理旧文件..."
cd "$DEPLOY_DIR"
find . -maxdepth 1 -type f \
    ! -name "$ZIP_FILE" \
    ! -name "deploy-h5.sh" \
    ! -name "*.sh" \
    -delete 2>/dev/null || true

find . -maxdepth 1 -type d \
    ! -name "." \
    -exec rm -rf {} + 2>/dev/null || true

print_success "旧文件清理完成"

# Step 4: 解压新文件
print_info "解压新文件..."
unzip -o "$ZIP_PATH" -d "$DEPLOY_DIR"
print_success "解压完成"

# Step 5: 清理压缩包
print_info "清理压缩包..."
rm -f "$ZIP_PATH"
print_success "压缩包已删除"

# Step 6: 设置权限
print_info "设置文件权限..."
chmod -R 755 "$DEPLOY_DIR"
print_success "权限设置完成"

echo -e "${CYAN}========================================"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${CYAN}========================================${NC}"

# 显示部署结果
print_info "当前文件列表:"
ls -la "$DEPLOY_DIR" | head -20
