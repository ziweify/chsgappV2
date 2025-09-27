# 聊天记录自动清理功能

## 功能概述
为了防止长时间使用时聊天记录过多导致的性能问题，新增了聊天记录自动清理功能。当用户超过10分钟没有滑动聊天记录，且聊天记录超过300条时，会自动清空聊天记录并重新加载第一页。

## 功能特点

### 📊 清理条件
- **消息数量阈值**: 超过300条聊天记录
- **无操作时间**: 用户10分钟内没有任何滑动操作
- **同时满足**: 两个条件必须同时满足才会触发清理

### ⏰ 监控机制
- **定时检查**: 每60秒检查一次是否满足清理条件
- **用户活动跟踪**: 自动记录用户的滚动、发送消息、键盘操作等活动
- **智能判断**: 只有在用户真正不活跃时才执行清理

### 🧹 清理过程
1. 清空当前聊天记录数组
2. 重置分页状态和未读计数
3. 重新加载第一页聊天记录
4. 显示友好的用户提示
5. 记录性能监控数据

## 技术实现

### 核心属性
```javascript
data() {
  return {
    // 聊天记录自动清理相关
    lastScrollTime: Date.now(), // 最后滚动时间
    chatCleanupTimer: null, // 聊天记录清理定时器
    maxChatRecords: 300, // 最大聊天记录条数
    scrollInactiveTime: 10 * 60 * 1000, // 10分钟无滑动时间（毫秒）
  }
}
```

### 核心方法

#### 1. 启动清理定时器
```javascript
startChatCleanupTimer() {
  // 清除现有定时器
  if (this.chatCleanupTimer) {
    clearInterval(this.chatCleanupTimer);
  }
  
  // 每分钟检查一次是否需要清理聊天记录
  this.chatCleanupTimer = setInterval(() => {
    if (!this.isDestroyed) {
      this.checkChatCleanup();
    }
  }, 60000); // 60秒检查一次
}
```

#### 2. 检查清理条件
```javascript
checkChatCleanup() {
  const now = Date.now();
  const timeSinceLastScroll = now - this.lastScrollTime;
  const shouldCleanup = this.chatList.length > this.maxChatRecords && 
                       timeSinceLastScroll > this.scrollInactiveTime;
  
  if (shouldCleanup) {
    this.performChatCleanup();
  }
}
```

#### 3. 执行清理操作
```javascript
performChatCleanup() {
  // 记录清理前的状态
  const beforeCount = this.chatList.length;
  
  // 清空聊天记录
  this.chatList = [];
  
  // 重置分页状态
  this.hasMoreMessages = true;
  this.isLoadingMore = false;
  this.nextLastId = null;
  this.lastScrollPosition = null;
  this.unreadCount = 0;
  
  // 重新加载第一页聊天记录
  this.loadChatRecords();
  
  // 更新最后滚动时间，防止立即再次清理
  this.lastScrollTime = Date.now();
  
  // 显示用户提示
  uni.showToast({
    title: '聊天记录已优化',
    icon: 'none',
    duration: 2000
  });
}
```

### 活动跟踪集成

在以下用户操作中会更新最后活动时间：
- **滚动操作**: `scroll()` 方法中
- **发送消息**: `sendevent()` 方法中  
- **键盘操作**: `emojiChange()` 方法中
- **滚动到底部**: `toBottom()` 方法中
- **加载更多**: `loadMoreMessages()` 方法中

## 调试工具

### 新增调试方法
```javascript
// 查看清理状态
chatDebug.showCleanupStatus()

// 手动触发清理
chatDebug.triggerCleanup()

// 重置滚动时间
chatDebug.resetScrollTime()
```

### 状态信息显示
```javascript
{
  聊天记录条数: 350,
  最大条数阈值: 300,
  最后滚动时间: "2024-01-15 14:30:00",
  距离最后滚动: "12分钟",
  清理阈值: "10分钟",
  是否满足清理条件: true,
  清理定时器状态: true
}
```

## 性能优化

### 📈 性能监控
- 记录清理前后的消息数量
- 监控清理操作的执行时间
- 统计清理频率和原因

### 🚀 优化效果
- **内存使用**: 防止聊天记录无限增长导致的内存泄漏
- **渲染性能**: 减少大量DOM元素对滚动性能的影响  
- **用户体验**: 自动优化，无需用户手动操作

### ⚡ 性能策略
- **批量清理**: 一次性清空所有记录，避免逐条删除
- **状态重置**: 完全重置分页状态，确保数据一致性
- **延迟执行**: 定时器检查避免频繁判断

## 配置说明

### 可调整参数
```javascript
// 修改最大消息数阈值
this.maxChatRecords = 500; // 默认300

// 修改无操作时间阈值  
this.scrollInactiveTime = 15 * 60 * 1000; // 默认10分钟

// 修改检查频率（不建议修改）
// setInterval(() => {...}, 30000); // 默认60秒
```

### 用户体验设置
```javascript
// 自定义提示消息
uni.showToast({
  title: '为了更好的体验，聊天记录已优化',
  icon: 'none',
  duration: 3000
});

// 关闭提示（静默清理）
// 注释掉 uni.showToast() 调用即可
```

## 兼容性说明

### ✅ 兼容特性
- 与现有分页加载机制完全兼容
- 不影响WebSocket消息接收
- 保持用户当前的聊天状态
- 支持所有平台（APP、H5、小程序）

### ⚠️ 注意事项
- 清理时会丢失当前页面的聊天历史记录
- 用户需要手动上拉才能查看更早的消息
- 清理操作不可撤销
- 建议在网络状况良好时使用

## 测试建议

### 功能测试
1. **基础功能**: 达到条件时是否正确触发清理
2. **用户活动**: 用户操作是否正确重置计时器
3. **边界条件**: 恰好300条消息和10分钟的边界测试
4. **性能测试**: 大量消息时的清理性能

### 调试测试
```javascript
// 快速测试清理功能
chatDebug.resetScrollTime(); // 重置时间
// 等待检查周期或手动触发
chatDebug.triggerCleanup();
```

### 压力测试
- 模拟长时间使用场景
- 测试大量消息下的清理效果
- 验证内存使用情况

## 后续优化方向

### 🎯 功能增强
- 支持清理阈值的动态配置
- 增加清理前的用户确认选项
- 实现渐进式清理（保留最新N条消息）
- 添加清理统计和分析功能

### 📊 监控改进
- 增加更详细的性能指标收集
- 实现清理效果的量化分析
- 添加用户行为模式分析

### 🔧 配置优化
- 支持根据设备性能动态调整阈值
- 增加用户个性化设置选项
- 实现清理策略的A/B测试

这个自动清理功能将显著改善长时间使用时的用户体验和应用性能！ 