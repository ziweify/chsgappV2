@echo off
chcp 65001 >nul
echo === 本地域名调试配置脚本 ===
echo.

set HOSTS_FILE=C:\Windows\System32\drivers\etc\hosts
set DOMAIN=dev.sg.com
set BACKUP_DOMAIN=local.sg.com

echo 配置域名: %DOMAIN%
echo 备用域名: %BACKUP_DOMAIN%
echo.

:: 检查是否以管理员身份运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 错误: 请以管理员身份运行此脚本
    echo 右键点击脚本，选择"以管理员身份运行"
    pause
    exit /b 1
)

:: 检查 hosts 文件是否存在
if not exist "%HOSTS_FILE%" (
    echo 错误: hosts 文件不存在: %HOSTS_FILE%
    pause
    exit /b 1
)

:: 检查是否已经配置过
findstr /C:"%DOMAIN%" "%HOSTS_FILE%" >nul
if %errorLevel% equ 0 (
    echo 域名 %DOMAIN% 已经配置过了
) else (
    echo 正在配置 hosts 文件...
    
    :: 备份 hosts 文件
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
    set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
    set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"
    
    copy "%HOSTS_FILE%" "%HOSTS_FILE%.backup.%timestamp%" >nul
    echo 已备份 hosts 文件
    
    :: 添加域名配置
    echo. >> "%HOSTS_FILE%"
    echo # 本地开发域名配置 - %date% %time% >> "%HOSTS_FILE%"
    echo 127.0.0.1 %DOMAIN% >> "%HOSTS_FILE%"
    echo 127.0.0.1 %BACKUP_DOMAIN% >> "%HOSTS_FILE%"
    
    echo 域名配置已添加
)

echo.

:: 显示当前配置
echo 当前 hosts 文件中的相关配置:
findstr /C:"127.0.0.1" "%HOSTS_FILE%" | findstr /C:"sg.com"

echo.

:: 提供访问地址
echo 配置完成！现在您可以通过以下地址访问：
echo 主域名: http://%DOMAIN%:8080/#/copage/chat
echo 备用域名: http://%BACKUP_DOMAIN%:8080/#/copage/chat
echo.

:: 提供启动命令
echo 启动开发服务器：
echo 1. 在 HBuilderX 中运行到浏览器
echo 2. 或者使用命令行: npm run dev:h5
echo.

echo === 配置完成 ===
pause
