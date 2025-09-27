# WebSocket重连功能测试指南

## 🧪 测试环境

### 推荐测试环境
- **手机浏览器**：Chrome Mobile、Safari Mobile、微信浏览器
- **开发者工具**：Chrome DevTools 的设备模拟
- **网络环境**：4G/5G/WiFi 切换测试

## 📱 手机浏览器测试步骤

### 1. 基础连接测试

```javascript
// 打开浏览器控制台（如果支持），执行：
console.log('WebSocket状态:', uni.$socketUtils.getConnectionStatus());
console.log('诊断信息:', uni.$socketUtils.getDiagnosticInfo());
```

### 2. 网络断开重连测试

**步骤：**
1. 确认WebSocket已连接
2. 关闭手机网络（WiFi + 移动数据）
3. 等待30秒
4. 重新开启网络
5. 观察控制台日志

**预期结果：**
```
网络状态变化: {isConnected: false}
H5: 网络连接断开
定期网络检测：WebSocket未连接，检查网络状态
网络连接检测：不可用
H5: 网络连接恢复
H5: 网络恢复，立即尝试重连WebSocket
准备重连WebSocket，原因: h5_network_recovery，当前尝试次数: 1
WebSocket连接成功
```

### 3. 页面切换测试

**步骤：**
1. 断开网络
2. 切换到其他APP（让页面进入后台）
3. 开启网络
4. 切换回浏览器

**预期结果：**
```
H5: 页面变为隐藏
H5: 页面变为可见，检查连接状态
H5: 页面可见，WebSocket未连接，尝试重连
```

### 4. 浏览器标签页切换测试

**步骤：**
1. 断开网络
2. 切换到其他标签页
3. 开启网络
4. 切换回原标签页

**预期结果：**
```
H5: 窗口获得焦点
H5: 窗口焦点恢复，检查连接
```

## 🔧 调试工具使用

### 1. 查看实时状态

在浏览器控制台执行：
```javascript
// 实时监控
setInterval(() => {
    const status = uni.$socketUtils.getConnectionStatus();
    console.log('实时状态:', {
        连接: status.isConnected,
        重连中: status.isReconnecting,
        网络: status.isNetworkAvailable,
        重连次数: status.reconnectAttempts
    });
}, 3000);
```

### 2. 手动触发重连

```javascript
// 手动重连
uni.$socketUtils.manualReconnect();

// 停止自动重连
uni.$socketUtils.stopAutoReconnect();

// 重新启用自动重连
uni.$socketUtils.enableAutoReconnect();
```

### 3. 获取详细诊断

```javascript
// 获取完整诊断信息
const diagnostic = uni.$socketUtils.getDiagnosticInfo();
console.table(diagnostic.基本状态);
console.table(diagnostic.重连信息);
console.table(diagnostic.H5网络状态);
```

## 🚨 常见问题排查

### 问题1：网络恢复后不重连

**可能原因：**
- 页面在后台，JavaScript被暂停
- 网络状态检测失败
- 重连机制被意外停止

**排查步骤：**
1. 检查页面可见性：`document.visibilityState`
2. 检查网络状态：`navigator.onLine`
3. 查看诊断信息：`uni.$socketUtils.getDiagnosticInfo()`

**解决方案：**
```javascript
// 手动检查并重连
if (!uni.$socketUtils.isOpenSocket) {
    uni.$socketUtils.manualReconnect();
}
```

### 问题2：重连过于频繁

**可能原因：**
- 服务器拒绝连接
- 网络不稳定

**排查步骤：**
1. 查看重连次数：`status.reconnectAttempts`
2. 检查服务器状态
3. 测试网络稳定性

**解决方案：**
```javascript
// 临时停止重连
uni.$socketUtils.stopAutoReconnect();
// 等待网络稳定后重新启用
setTimeout(() => {
    uni.$socketUtils.enableAutoReconnect();
}, 30000);
```

### 问题3：页面切换后连接丢失

**可能原因：**
- 浏览器资源回收
- 页面被挂起

**解决方案：**
- 使用页面可见性API (已集成)
- 使用Service Worker (可选)

## 📊 测试检查清单

### 基础功能
- [ ] 初始连接成功
- [ ] 心跳机制正常
- [ ] 消息收发正常

### 重连功能
- [ ] 网络断开时停止重连
- [ ] 网络恢复时立即重连
- [ ] 连接失败时持续重连
- [ ] 页面切换时保持重连

### H5特性
- [ ] navigator.onLine 监听工作
- [ ] visibilitychange 监听工作
- [ ] 真实网络检测工作
- [ ] 窗口焦点监听工作

### 性能测试
- [ ] 长时间运行稳定
- [ ] 内存使用合理
- [ ] CPU占用正常
- [ ] 网络消耗可控

## 🎯 测试脚本

将以下脚本保存为书签，方便测试：

```javascript
javascript:(function(){
    const ws = uni.$socketUtils;
    const info = ws.getDiagnosticInfo();
    const status = ws.getConnectionStatus();
    
    const result = {
        '连接状态': status.isConnected ? '✅ 已连接' : '❌ 未连接',
        '自动重连': info.基本状态.自动重连 ? '✅ 启用' : '❌ 禁用',
        '网络状态': info.基本状态.网络可用 ? '✅ 可用' : '❌ 不可用',
        '重连次数': status.reconnectAttempts,
        '页面可见': document.visibilityState === 'visible' ? '✅ 可见' : '❌ 隐藏',
        '网络在线': navigator.onLine ? '✅ 在线' : '❌ 离线'
    };
    
    alert(JSON.stringify(result, null, 2));
})();
```

使用方法：复制上述代码，在浏览器中创建书签，粘贴代码作为书签URL，点击即可查看状态。

## 📝 测试记录模板

```
测试时间: ____
测试环境: ____
测试步骤: ____
预期结果: ____
实际结果: ____
问题描述: ____
解决方案: ____
```

## 🔄 持续测试建议

1. **定期测试**：每次发布前进行完整测试
2. **多环境测试**：不同手机、浏览器、网络环境
3. **长期监控**：生产环境下监控重连成功率
4. **用户反馈**：收集真实用户的连接问题反馈

通过以上测试指南，可以全面验证WebSocket重连功能在手机浏览器环境下的可靠性。 