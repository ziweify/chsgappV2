/**
 * 全局性能监控工具
 * 用于监控和优化chsgappV2的性能问题
 */

class PerformanceMonitor {
  constructor() {
    this.isEnabled = true;
    this.stats = {
      pageLoadTime: 0,
      memoryUsage: 0,
      domNodeCount: 0,
      eventListenerCount: 0,
      timerCount: 0,
      lastUpdate: Date.now()
    };
    
    // 性能阈值配置
    this.thresholds = {
      maxMemoryUsage: 150 * 1024 * 1024, // 150MB
      maxDomNodes: 1000,
      maxEventListeners: 50,
      maxTimers: 10,
      warningInterval: 60000 // 1分钟警告间隔
    };
    
    this.lastWarningTime = 0;
    this.init();
  }
  
  init() {
    if (!this.isEnabled) return;
    
    // 监控页面加载性能
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        this.stats.pageLoadTime = performance.now();
        console.log('📊 页面加载时间:', this.stats.pageLoadTime.toFixed(2) + 'ms');
      });
    }
    
    // 定期监控性能指标
    this.monitorInterval = setInterval(() => {
      this.updateStats();
      this.checkThresholds();
    }, 30000); // 每30秒检查一次
  }
  
  updateStats() {
    try {
      // 内存使用情况
      if (performance.memory) {
        this.stats.memoryUsage = performance.memory.usedJSHeapSize;
      }
      
      // DOM节点数量
      if (typeof document !== 'undefined') {
        this.stats.domNodeCount = document.querySelectorAll('*').length;
      }
      
      this.stats.lastUpdate = Date.now();
      
    } catch (error) {
      console.error('❌ 性能统计更新失败:', error);
    }
  }
  
  checkThresholds() {
    const now = Date.now();
    
    // 避免频繁警告
    if (now - this.lastWarningTime < this.thresholds.warningInterval) {
      return;
    }
    
    const warnings = [];
    
    // 检查内存使用
    if (this.stats.memoryUsage > this.thresholds.maxMemoryUsage) {
      warnings.push(`内存使用过高: ${Math.round(this.stats.memoryUsage / 1024 / 1024)}MB`);
    }
    
    // 检查DOM节点数量
    if (this.stats.domNodeCount > this.thresholds.maxDomNodes) {
      warnings.push(`DOM节点过多: ${this.stats.domNodeCount}个`);
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️ 性能警告:', warnings.join(', '));
      this.lastWarningTime = now;
      
      // 触发自动清理
      this.triggerCleanup();
    }
  }
  
  triggerCleanup() {
    console.log('🧹 触发自动性能清理...');
    
    // 通知所有注册的清理回调
    if (this.cleanupCallbacks) {
      this.cleanupCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('❌ 清理回调执行失败:', error);
        }
      });
    }
    
    // 强制垃圾回收（如果浏览器支持）
    if (window.gc) {
      window.gc();
      console.log('🧹 执行强制垃圾回收');
    }
  }
  
  // 注册清理回调
  registerCleanupCallback(callback) {
    if (!this.cleanupCallbacks) {
      this.cleanupCallbacks = [];
    }
    this.cleanupCallbacks.push(callback);
  }
  
  // 获取性能报告
  getPerformanceReport() {
    return {
      ...this.stats,
      memoryUsageMB: Math.round(this.stats.memoryUsage / 1024 / 1024),
      uptime: Date.now() - (this.stats.lastUpdate - 30000), // 粗略计算运行时间
      thresholds: this.thresholds
    };
  }
  
  // 记录自定义性能指标
  recordMetric(name, value, unit = '') {
    const timestamp = Date.now();
    console.log(`📊 性能指标 [${name}]: ${value}${unit} (${new Date(timestamp).toLocaleTimeString()})`);
  }
  
  // 测量函数执行时间
  measureFunction(name, func) {
    const startTime = performance.now();
    const result = func();
    const endTime = performance.now();
    
    this.recordMetric(`函数执行时间 [${name}]`, (endTime - startTime).toFixed(2), 'ms');
    return result;
  }
  
  // 测量异步函数执行时间
  async measureAsyncFunction(name, asyncFunc) {
    const startTime = performance.now();
    const result = await asyncFunc();
    const endTime = performance.now();
    
    this.recordMetric(`异步函数执行时间 [${name}]`, (endTime - startTime).toFixed(2), 'ms');
    return result;
  }
  
  // 启用/禁用监控
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    } else if (enabled && !this.monitorInterval) {
      this.init();
    }
  }
  
  // 销毁监控器
  destroy() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.cleanupCallbacks = null;
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor();

// 导出工具函数
export default {
  // 获取性能监控器实例
  getInstance() {
    return performanceMonitor;
  },
  
  // 快速记录性能指标
  record(name, value, unit) {
    performanceMonitor.recordMetric(name, value, unit);
  },
  
  // 快速测量函数性能
  measure(name, func) {
    return performanceMonitor.measureFunction(name, func);
  },
  
  // 快速测量异步函数性能
  async measureAsync(name, asyncFunc) {
    return await performanceMonitor.measureAsyncFunction(name, asyncFunc);
  },
  
  // 获取性能报告
  getReport() {
    return performanceMonitor.getPerformanceReport();
  },
  
  // 注册清理回调
  onCleanup(callback) {
    performanceMonitor.registerCleanupCallback(callback);
  },
  
  // 手动触发清理
  cleanup() {
    performanceMonitor.triggerCleanup();
  }
};
