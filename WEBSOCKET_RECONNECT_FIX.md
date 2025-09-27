# WebSocket重连机制优化修复

## 问题描述
原有的WebSocket重连机制存在以下问题：
1. 多个地方会同时触发重连，导致创建多个并发连接
2. 重连状态管理不够严格，存在竞态条件
3. 网络状态检测可能触发重复重连
4. 缺乏有效的防抖和锁机制

## 修复方案

### 1. 统一重连入口
- 将所有`reconnect()`调用替换为`debouncedReconnect()`
- 创建统一的重连管理器`startReconnectProcess()`
- 集中管理重连逻辑，避免分散调用

### 2. 增强状态管理
- 添加`reconnectLock`重连锁机制
- 加强`isReconnecting`状态检查
- 在所有关键检查点添加状态验证

### 3. 改进防抖机制
- 优化`debouncedReconnect()`方法的条件检查
- 在防抖定时器回调中添加重连锁检查
- 确保防抖机制真正生效

### 4. 完善清理机制
- 新增`forceCleanupConnection()`方法
- 在连接前彻底清理旧连接和状态
- 在所有状态重置点释放重连锁

## 关键修改

### 核心方法重构
```javascript
// 新的统一重连入口
debouncedReconnect(reason, forceImmediate) 

// 重连过程管理
startReconnectProcess(reason)
executeReconnect(reason)

// 连接清理
forceCleanupConnection()
```

### 状态检查增强
所有重连相关的条件检查都增加了重连锁验证：
```javascript
if (this.isOpenSocket || this.isUserClose || !this.shouldAutoReconnect || 
    this.isUserExitApp || this.disableAutoReconnect || this.isReconnecting || this.reconnectLock)
```

### 锁机制管理
- 在开始重连时设置锁：`this.reconnectLock = true`
- 在重连完成时释放锁：`this.reconnectLock = false`
- 在清理定时器时释放锁

## 测试方法

### 调试工具
```javascript
// 获取连接诊断信息
uni.$socketUtils.getDiagnosticInfo()

// 测试重连机制
uni.$socketUtils.testReconnectMechanism()
```

### 验证要点
1. 服务器断开时只应该有一个重连过程
2. 网络状态变化不应该触发多重连接  
3. 手动重连应该能正确中断自动重连
4. 用户退出时应该完全停止重连

## 使用建议

### 正常使用
```javascript
// 初始化连接（用户进入页面）
uni.$socketUtils.initConnection()

// 手动重连
uni.$socketUtils.manualReconnect()

// 关闭连接（用户退出）
uni.$socketUtils.closeSocket('user_exit_app')
```

### 调试场景
```javascript
// 查看当前状态
console.log(uni.$socketUtils.getDiagnosticInfo())

// 测试重连机制
uni.$socketUtils.testReconnectMechanism()

// 强制重置状态（如果出现异常）
uni.$socketUtils.resetExitStatus()
uni.$socketUtils.initConnection()
```

## 修复效果
1. ✅ 确保同时只有一个WebSocket连接和重连过程
2. ✅ 消除并发重连问题
3. ✅ 提升重连机制的可靠性和稳定性
4. ✅ 增加调试和诊断工具
5. ✅ 保持原有API兼容性

## 注意事项
- 原有的`reconnect()`方法仍然可用，但会内部转发到新机制
- 重连锁会在连接成功、失败或清理时自动释放
- 手动调用`initConnection()`会重置所有状态
- 测试方法仅用于调试，生产环境建议谨慎使用 