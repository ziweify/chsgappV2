# HBuilderX 本地域名调试完整配置

## 问题

配置了 hosts 域名 `h5.chsg.com` 后，HBuilderX 运行仍然打开 `http://localhost:8080/`

## 原因

HBuilderX 的"运行到浏览器"默认使用 `localhost`，需要额外配置才能使用自定义域名。

---

## ✅ 完整解决方案

### 第1步：配置 hosts 文件（已完成）

**Windows**: `C:\Windows\System32\drivers\etc\hosts`
**Mac/Linux**: `/etc/hosts`

添加：
```
127.0.0.1 h5.chsg.com
```

### 第2步：配置 vue.config.js（已完成）

**文件**: `/www/wwwroot/chsgappV2/vue.config.js`

```javascript
module.exports = {
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true,
    public: 'h5.chsg.com:8080',  // ✅ 关键配置
    proxy: {
      '/api': {
        target: 'http://adm.jys.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
};
```

### 第3步：配置 manifest.json（已完成）

**文件**: `/www/wwwroot/chsgappV2/manifest.json`

```json
{
  "h5": {
    "devServer": {
      "https": false,
      "host": "0.0.0.0",
      "port": 8080,
      "disableHostCheck": true,
      "public": "h5.chsg.com:8080"  // ✅ 关键配置
    }
  }
}
```

### 第4步：重启 HBuilderX 服务

1. **停止当前运行**：在 HBuilderX 中点击停止按钮
2. **完全关闭项目**：关闭 HBuilderX 或重启项目
3. **重新运行到浏览器**

---

## 验证方法

### 方法 1：检查浏览器地址栏

HBuilderX 运行后，浏览器应该自动打开：
```
✅ 预期：http://h5.chsg.com:8080/
❌ 错误：http://localhost:8080/
```

### 方法 2：手动访问测试

在浏览器中分别访问：
- `http://localhost:8080/` ✅ 应该能访问
- `http://h5.chsg.com:8080/` ✅ 应该能访问（与 localhost 相同内容）
- `http://127.0.0.1:8080/` ✅ 应该能访问

**所有3个地址应该显示相同的页面。**

---

## 如果还是打开 localhost

### 临时解决方案（立即可用）

HBuilderX 打开 `localhost:8080` 后，**手动修改地址栏**为 `h5.chsg.com:8080`

### 强制配置方案

如果上面的配置不生效，尝试以下方案：

#### 方案 A：修改 HBuilderX 运行配置

在 HBuilderX 项目根目录创建 `.hbuilderx/launch.json`：

```json
{
  "version": "0.0",
  "configurations": [
    {
      "type": "uniApp",
      "default": {
        "launchtype": "local",
        "port": 8080,
        "host": "h5.chsg.com"
      }
    }
  ]
}
```

#### 方案 B：使用命令行运行（绕过 HBuilderX）

```bash
cd /www/wwwroot/chsgappV2

# 使用 npm 运行开发服务器
npm run dev:h5

# 或者
npm run serve
```

然后手动在浏览器打开 `http://h5.chsg.com:8080/`

**优点**：
- ✅ 完全控制启动方式
- ✅ 可以使用任何域名

**缺点**：
- ❌ 不能使用 HBuilderX 的"运行"按钮

---

## WebSocket 连接说明

### 开发环境（使用自定义域名）

访问 `http://h5.chsg.com:8080/` 时，WebSocket 连接：

```
✅ 2个连接（正常）：
  1. ws://h5.chsg.com:8080/sockjs-node/...   ← HMR 热重载
  2. ws://172.128.128.100:5205/ws?token=...  ← 业务连接
```

**注意**：HMR 连接会自动使用当前页面的域名。

### 为什么需要自定义域名？

1. **Cookie 共享**：与后端 API 在同一域名下，共享 Cookie
2. **跨域问题**：避免 CORS 跨域限制
3. **真实模拟**：模拟生产环境的域名结构
4. **调试方便**：与生产环境配置一致

---

## 常见问题

### Q1: 配置后还是打开 localhost 怎么办？

**A**: 
1. **确认配置已保存**：检查 `vue.config.js` 和 `manifest.json`
2. **完全重启 HBuilderX**：关闭所有项目，重新打开
3. **清除缓存**：删除 `node_modules/.cache` 目录
4. **手动修改地址栏**：临时解决方案

### Q2: HMR 热重载还能用吗？

**A**: 能！使用 `h5.chsg.com:8080` 访问时，HMR 会自动使用该域名，热重载正常工作。

### Q3: 如何切换回 localhost？

**A**: 删除或注释掉 `public` 配置：
```javascript
// public: 'h5.chsg.com:8080',  // 注释掉这行
```

### Q4: 多个域名可以吗？

**A**: 可以！在 hosts 中添加多个：
```
127.0.0.1 h5.chsg.com
127.0.0.1 dev.chsg.com
127.0.0.1 test.chsg.com
```

然后访问任意一个，都可以访问到 `localhost:8080` 的内容。

---

## 最佳实践

### 开发流程

1. **启动 HBuilderX**：运行到浏览器
2. **自动打开**：`http://h5.chsg.com:8080/`（如果配置生效）
3. **或手动修改**：将 `localhost` 改为 `h5.chsg.com`
4. **开发调试**：代码修改自动热更新

### 团队协作

**团队约定域名**：
```
# 开发环境
127.0.0.1 dev.chsg.com

# 测试环境
127.0.0.1 test.chsg.com

# 本地模拟生产
127.0.0.1 h5.chsg.com
```

**每个开发人员配置相同的 hosts**，保持一致性。

---

## 总结

### 已配置项 ✅

1. ✅ hosts 文件：`127.0.0.1 h5.chsg.com`
2. ✅ vue.config.js：`public: 'h5.chsg.com:8080'`
3. ✅ manifest.json：`"public": "h5.chsg.com:8080"`

### 下一步

1. **重启 HBuilderX**
2. **运行到浏览器**
3. **验证地址栏**是否自动打开 `h5.chsg.com:8080`
4. **如果还是 localhost**：手动修改地址栏即可使用

### 备选方案

如果 HBuilderX 始终打开 localhost，可以：
- ✅ 每次手动修改地址栏（最简单）
- ✅ 使用 `npm run dev:h5` 命令行启动
- ✅ 在浏览器中直接访问 `h5.chsg.com:8080`

---

## 参考资料

- Vue CLI DevServer 配置：https://cli.vuejs.org/config/#devserver
- Webpack DevServer Public：https://webpack.js.org/configuration/dev-server/#devserverpublic
- HBuilderX 官方文档：https://hx.dcloud.net.cn/
