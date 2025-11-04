#!/bin/bash

# 本地域名调试配置脚本
# 用于快速配置本地域名调试环境

echo "=== 本地域名调试配置脚本 ==="
echo ""

# 检查操作系统
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    HOSTS_FILE="/etc/hosts"
    echo "检测到 macOS 系统"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    HOSTS_FILE="/etc/hosts"
    echo "检测到 Linux 系统"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    # Windows (Git Bash)
    HOSTS_FILE="/c/Windows/System32/drivers/etc/hosts"
    echo "检测到 Windows 系统 (Git Bash)"
else
    echo "不支持的操作系统: $OSTYPE"
    exit 1
fi

echo ""

# 配置域名
DOMAIN="dev.sg.com"
BACKUP_DOMAIN="local.sg.com"

echo "配置域名: $DOMAIN"
echo "备用域名: $BACKUP_DOMAIN"
echo ""

# 检查 hosts 文件是否存在
if [ ! -f "$HOSTS_FILE" ]; then
    echo "错误: hosts 文件不存在: $HOSTS_FILE"
    exit 1
fi

# 检查是否已经配置过
if grep -q "$DOMAIN" "$HOSTS_FILE"; then
    echo "域名 $DOMAIN 已经配置过了"
else
    echo "正在配置 hosts 文件..."
    
    # 备份 hosts 文件
    cp "$HOSTS_FILE" "${HOSTS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "已备份 hosts 文件"
    
    # 添加域名配置
    echo "" >> "$HOSTS_FILE"
    echo "# 本地开发域名配置 - $(date)" >> "$HOSTS_FILE"
    echo "127.0.0.1 $DOMAIN" >> "$HOSTS_FILE"
    echo "127.0.0.1 $BACKUP_DOMAIN" >> "$HOSTS_FILE"
    
    echo "域名配置已添加"
fi

echo ""

# 检查配置结果
echo "当前 hosts 文件中的相关配置:"
grep -E "(127\.0\.0\.1.*sg\.com|localhost)" "$HOSTS_FILE" | tail -5

echo ""

# 提供访问地址
echo "配置完成！现在您可以通过以下地址访问："
echo "主域名: http://$DOMAIN:8080/#/copage/chat"
echo "备用域名: http://$BACKUP_DOMAIN:8080/#/copage/chat"
echo ""

# 提供启动命令
echo "启动开发服务器："
echo "1. 在 HBuilderX 中运行到浏览器"
echo "2. 或者使用命令行: npm run dev:h5"
echo ""

echo "=== 配置完成 ==="
