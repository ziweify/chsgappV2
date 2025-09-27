# WebSocket 自动重连功能使用说明

## 功能特点

改造后的 WebSocket 工具具有以下特点：

1. **持续重连**：连接异常时会一直重连，不受重连次数限制
2. **固定间隔**：每2秒重连一次，不使用指数退避策略
3. **智能判断**：只有在用户主动关闭或特定情况下才停止重连
4. **网络感知**：网络恢复时立即尝试重连
5. **应用状态感知**：应用进入前台时会检查并重连

## 重连触发条件

以下情况会触发自动重连：

- WebSocket 连接失败
- 连接意外断开
- 心跳超时
- 发送消息失败
- 网络恢复
- 应用进入前台（如果连接断开）

## 停止重连的条件

只有以下情况会停止自动重连：

- 用户主动调用 `closeSocket('user')`
- 服务器要求登出 (`server_logout`)
- 销毁实例 (`destroy()`)
- 手动停止 (`stopAutoReconnect()`)

## 使用方法

### 1. 初始化连接
```javascript
// 基本用法（启用自动重连）
uni.$socketUtils.initConnection();

// 自定义参数
uni.$socketUtils.initConnection(url, heartbeatInterval);
```

### 2. 控制自动重连
```javascript
// 停止自动重连
uni.$socketUtils.stopAutoReconnect();

// 重新启用自动重连
uni.$socketUtils.enableAutoReconnect();

// 手动重连（重置状态）
uni.$socketUtils.manualReconnect();
```

### 3. 获取连接状态
```javascript
const status = uni.$socketUtils.getConnectionStatus();
console.log('连接状态:', status);
// 输出示例：
// {
//   isConnected: true,
//   isReconnecting: false,
//   reconnectAttempts: 3,
//   isNetworkAvailable: true,
//   lastHeartbeatTime: 1703123456789,
//   connectionUptime: 30000
// }

// 获取详细诊断信息（新增）
const diagnostic = uni.$socketUtils.getDiagnosticInfo();
console.log('诊断信息:', diagnostic);
```

### 4. 正确关闭连接
```javascript
// 用户主动关闭（停止重连）
uni.$socketUtils.closeSocket('user');

// 临时关闭（保持重连机制）
uni.$socketUtils.closeSocket('temporary');

// 完全销毁
uni.$socketUtils.destroy();
```

## 重连逻辑说明

### 重连间隔
- 固定 2 秒间隔重连
- 不使用指数退避，确保快速恢复连接

### 网络检测
- 监听网络状态变化
- 网络恢复时立即重连
- 网络不可用时暂停重连，等待网络恢复

### 应用状态检测
- 应用进入前台时检查连接状态
- 如需要会立即重连

## H5环境特殊处理

在手机浏览器等H5环境下，工具增加了特殊的处理机制：

### 1. 增强网络监听
- 使用 `navigator.onLine` 监听网络状态
- 使用 `visibilitychange` 监听页面可见性
- 使用 `focus` 事件监听窗口焦点

### 2. 真实网络检测
- 定期发送HTTP请求检测真实网络连接性
- 每10秒检查一次网络状态
- 检测成功后立即尝试重连

### 3. 页面状态感知
- 页面从隐藏变为可见时检查连接
- 窗口获得焦点时检查连接
- 延迟处理确保页面完全激活

## 注意事项

1. **持续重连**：除非明确停止，否则会一直重连
2. **资源消耗**：持续重连会消耗一定的网络和电量资源
3. **及时停止**：在不需要连接时应及时调用 `stopAutoReconnect()` 或 `destroy()`
4. **错误处理**：重连过程中的错误会被记录，但不会阻止重连
5. **H5环境**：手机浏览器下网络检测可能有延迟，但工具会持续尝试

## 调试信息

改造后的工具会输出详细的调试信息：

```
准备重连WebSocket，原因: connection_close，当前尝试次数: 5
2秒后重连
网络状态检查: navigator.onLine = true
尝试连接 (第5次)，网络状态: true
重连失败 (尝试5次): Error: ...
连接失败，继续重连
```

### 诊断工具

使用新增的诊断功能来获取详细状态：

```javascript
// 获取诊断信息
const info = uni.$socketUtils.getDiagnosticInfo();

// 示例输出：
{
  基本状态: {
    连接状态: false,
    正在重连: true,
    用户关闭: false,
    自动重连: true,
    网络可用: true
  },
  重连信息: {
    重连次数: 5,
    重连间隔: 2000,
    有重连定时器: true
  },
  心跳信息: {
    有心跳定时器: false,
    最后心跳时间: "2023-12-01 10:30:45",
    心跳超时时间: 15000
  },
  网络监控: {
    有网络检测定时器: true,
    检测间隔: 10000
  },
  H5网络状态: {
    "navigator.onLine": true,
    页面可见性: "visible"
  }
}
```

这些信息可以帮助开发者了解重连状态和问题所在。

### 聊天页面调试工具

在聊天页面的浏览器控制台中，可以使用以下调试工具：

```javascript
// 查看WebSocket状态和诊断信息
chatDebug.showWebSocketStatus();

// 手动测试重连
chatDebug.testReconnect();

// 启用调试模式
chatDebug.enableDebugMode();

// 查看聊天相关状态
chatDebug.showPaginationStatus();
chatDebug.showChatList();
```

这些工具可以帮助开发者在实际使用环境中快速诊断WebSocket连接问题。

## 性能监控

如果项目中有 `uni.$performanceMonitor`，工具会自动记录：
- 连接成功时间
- 错误信息
- 自定义性能指标

这有助于监控和优化 WebSocket 连接性能。 