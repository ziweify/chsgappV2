# WebSocket连接问题修复说明

## 问题描述

在使用WebSocket时可能遇到错误："WebSocket is closed before the connection is established"（WebSocket在连接建立之前就被关闭了）。

## 问题原因

1. **连接超时处理不完整**：超时时只是reject Promise，但没有主动关闭socket连接
2. **重连竞争条件**：在连接建立过程中可能触发重连，导致`forceCleanupConnection()`关闭正在建立的连接
3. **状态管理不一致**：连接状态和实际socket状态可能不同步
4. **并发连接保护不足**：缺少足够的锁机制防止并发连接

## 修复内容

### 1. 新增连接建立锁机制

```javascript
// 新增属性
this.isConnecting = false; // 是否正在连接建立中
this.connectingPromise = null; // 当前连接Promise，避免重复连接
this.shouldCloseAfterConnect = false; // 连接建立后是否应该立即关闭
```

### 2. 改进连接建立逻辑

- **防止重复连接**：如果正在连接中，返回现有的连接Promise
- **完善超时处理**：超时时主动关闭socket连接
- **状态保护**：使用`isResolved`标志避免重复处理回调

### 3. 优化清理机制

- **智能清理**：在连接建立过程中避免强制清理
- **延迟清理**：设置`shouldCloseAfterConnect`标志，在连接成功后再关闭

### 4. 增强重连机制

- **状态检查**：在重连前检查`isConnecting`状态
- **避免冲突**：防止重连与连接建立过程冲突

## 使用方法

### 1. 基本连接

```javascript
// 初始化连接
uni.$socketUtils.initConnection()
    .then(() => {
        console.log('WebSocket连接成功');
    })
    .catch((error) => {
        console.error('WebSocket连接失败:', error);
    });
```

### 2. 诊断连接问题

```javascript
// 获取详细诊断信息
const diagnosticInfo = uni.$socketUtils.getDiagnosticInfo();
console.log('WebSocket诊断信息:', diagnosticInfo);
```

### 3. 测试重连机制

```javascript
// 测试重连机制
uni.$socketUtils.testReconnectMechanism();
```

### 4. 手动重连

```javascript
// 手动重连（重置重连计数）
uni.$socketUtils.manualReconnect();
```

## 调试技巧

### 1. 检查连接状态

```javascript
const status = uni.$socketUtils.getConnectionStatus();
console.log('连接状态:', status);
```

### 2. 监听连接事件

```javascript
// 监听连接成功
uni.$on('websocketopen', function(res) {
    console.log('WebSocket连接已建立');
});
```

### 3. 查看日志

关键日志信息包括：
- `连接正在建立中，返回现有Promise`
- `WebSocket连接建立过程中关闭`
- `连接成功但需要立即关闭`
- `跳过重连: 正在连接=true`

## 常见问题解决

### 问题1：连接频繁失败

**解决方案**：
1. 检查网络状态
2. 验证token有效性
3. 查看服务器URL配置

```javascript
// 检查网络状态
const diagnosticInfo = uni.$socketUtils.getDiagnosticInfo();
if (!diagnosticInfo.基本状态.网络可用) {
    console.log('网络不可用，请检查网络连接');
}
```

### 问题2：重连机制不工作

**解决方案**：
1. 确认自动重连已启用
2. 检查用户是否主动关闭连接

```javascript
// 启用自动重连
uni.$socketUtils.enableAutoReconnect();

// 重置退出状态
uni.$socketUtils.resetExitStatus();
```

### 问题3：连接建立超时

**解决方案**：
1. 检查服务器地址
2. 增加网络检测
3. 使用手动重连

```javascript
// 检查服务器连接
console.log('WebSocket服务器地址:', uni.$socketUtils.url);

// 手动重连
uni.$socketUtils.manualReconnect();
```

## 性能优化

### 1. 避免频繁重连

修复后的连接机制包含防抖机制，避免频繁重连：

```javascript
// 防抖间隔3秒
this.reconnectDebounceDelay = 3000;
```

### 2. 连接状态监控

定期检查连接状态，及时发现问题：

```javascript
// 每10秒检查一次网络状态
this.networkCheckInterval = 10000;
```

### 3. 内存管理

在页面销毁时正确清理资源：

```javascript
// 页面销毁时
beforeDestroy() {
    // 停止自动重连
    uni.$socketUtils.stopAutoReconnect();
    
    // 关闭连接
    uni.$socketUtils.closeSocket('页面销毁');
}
```

## 调试输出控制

### 1. 生产环境优化

为了提高生产环境性能，已禁用所有调试输出：

```javascript
// 所有console.log已被注释
// console.log('WebSocket连接成功');

// 性能监控已禁用
// this.recordError('connect_fail', error);
// this.recordPerformance('connection_success', connectionTime);
```

### 2. 开启调试（如需要）

如果需要调试，可以取消相关注释：

```javascript
// 取消注释来启用日志
console.log('WebSocket连接成功');

// 取消注释来启用性能监控
this.recordError('connect_fail', error);
```

### 3. 调试方法

即使禁用了控制台输出，仍可使用以下方法调试：

```javascript
// 获取连接状态
const status = uni.$socketUtils.getConnectionStatus();

// 获取诊断信息
const info = uni.$socketUtils.getDiagnosticInfo();

// 在聊天页面中
uni.$chatDebug.checkWebSocketStatus();
```

## 注意事项

1. **不要同时调用多个连接方法**：使用连接锁机制避免冲突
2. **正确处理token失效**：token为空时会自动跳转到登录页
3. **合理使用重连机制**：避免在不需要时启用自动重连
4. **及时清理资源**：在适当时机调用清理方法
5. **生产环境无日志输出**：所有console.log和性能监控已被禁用

## 更新日志

- **2024-01-XX**：修复连接建立过程中被关闭的问题
- **2024-01-XX**：增加连接建立锁机制
- **2024-01-XX**：改进超时处理和状态管理
- **2024-01-XX**：优化重连机制，避免竞争条件
- **2024-01-XX**：注释掉所有console.log输出，禁用性能监控功能 