/**
 * 性能监控模块
 * 用于监控WebSocket连接、聊天消息处理等性能指标
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map(); // 存储性能指标
        this.errors = []; // 存储错误信息
        this.maxErrorsCount = 100; // 最大错误记录数
        this.maxMetricsCount = 1000; // 最大指标记录数
        this.startTime = Date.now(); // 监控开始时间
        
        // 定期清理数据
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 300000); // 5分钟清理一次
    }

    /**
     * 记录自定义性能指标
     * @param {string} name 指标名称
     * @param {number} value 指标值
     * @param {object} metadata 元数据
     */
    recordCustomMetric(name, value, metadata = {}) {
        const metric = {
            name,
            value,
            timestamp: Date.now(),
            metadata
        };

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }

        const metricList = this.metrics.get(name);
        metricList.push(metric);

        // 限制每个指标的记录数量
        if (metricList.length > this.maxMetricsCount) {
            metricList.splice(0, metricList.length - this.maxMetricsCount);
        }

        // 开发环境下打印详细信息
        if (process.env.NODE_ENV === 'development') {
            console.log(`性能指标 [${name}]: ${value}`, metadata);
        }
    }

    /**
     * 记录WebSocket连接时间
     * @param {number} connectionTime 连接耗时(毫秒)
     */
    recordConnectionTime(connectionTime) {
        this.recordCustomMetric('websocket_connection_time', connectionTime, {
            type: 'connection'
        });
    }

    /**
     * 记录消息发送性能
     * @param {string} messageType 消息类型
     * @param {number} startTime 开始时间
     * @param {number} endTime 结束时间
     */
    recordMessageSend(messageType, startTime, endTime) {
        const duration = endTime - startTime;
        this.recordCustomMetric('message_send_time', duration, {
            messageType,
            type: 'message_send'
        });
    }

    /**
     * 记录消息接收性能
     * @param {string} messageType 消息类型
     */
    recordMessageReceive(messageType) {
        this.recordCustomMetric('message_receive_count', 1, {
            messageType,
            type: 'message_receive'
        });
    }

    /**
     * 记录重连事件
     * @param {string} reason 重连原因
     * @param {number} attemptCount 重连次数
     */
    recordReconnect(reason, attemptCount = 1) {
        this.recordCustomMetric('websocket_reconnect', attemptCount, {
            reason,
            type: 'reconnect'
        });
    }

    /**
     * 记录错误信息
     * @param {string} type 错误类型
     * @param {object} errorInfo 错误详情
     */
    recordError(type, errorInfo) {
        const error = {
            type,
            errorInfo,
            timestamp: Date.now(),
            url: getCurrentPagePath(), // 获取当前页面路径
            userAgent: getUserAgent() // 获取用户代理信息
        };

        this.errors.push(error);

        // 限制错误记录数量
        if (this.errors.length > this.maxErrorsCount) {
            this.errors.splice(0, this.errors.length - this.maxErrorsCount);
        }

        // 开发环境下立即打印错误
        if (process.env.NODE_ENV === 'development') {
            console.error(`性能监控错误 [${type}]:`, errorInfo);
        }

        // 严重错误立即上报
        if (this.isCriticalError(type)) {
            this.reportCriticalError(error);
        }
    }

    /**
     * 记录页面渲染性能
     * @param {number} startTime 开始时间
     * @param {number} endTime 结束时间
     * @param {string} component 组件名称
     */
    recordRenderTime(startTime, endTime, component) {
        const renderTime = endTime - startTime;
        this.recordCustomMetric('page_render_time', renderTime, {
            component,
            type: 'render'
        });

        // 渲染时间过长时记录警告
        if (renderTime > 1000) { // 超过1秒
            this.recordError('slow_render', {
                component,
                renderTime,
                message: '页面渲染时间过长'
            });
        }
    }

    /**
     * 记录API响应时间
     * @param {string} api API名称
     * @param {number} startTime 开始时间
     * @param {number} endTime 结束时间
     * @param {boolean} success 是否成功
     */
    recordApiResponse(api, startTime, endTime, success) {
        const responseTime = endTime - startTime;
        this.recordCustomMetric('api_response_time', responseTime, {
            api,
            success,
            type: 'api'
        });

        if (!success) {
            this.recordError('api_error', {
                api,
                responseTime,
                message: 'API请求失败'
            });
        }
    }

    /**
     * 获取性能统计信息
     * @param {string} metricName 指标名称（可选）
     * @returns {object} 统计信息
     */
    getPerformanceStats(metricName = null) {
        if (metricName) {
            return this.getMetricStats(metricName);
        }

        const stats = {
            overview: {
                totalMetrics: this.metrics.size,
                totalErrors: this.errors.length,
                monitoringDuration: Date.now() - this.startTime
            },
            metrics: {},
            recentErrors: this.errors.slice(-10) // 最近10个错误
        };

        // 计算各项指标统计
        this.metrics.forEach((metricList, name) => {
            stats.metrics[name] = this.calculateStats(metricList);
        });

        return stats;
    }

    /**
     * 获取特定指标的统计信息
     * @param {string} metricName 指标名称
     * @returns {object} 指标统计
     */
    getMetricStats(metricName) {
        const metricList = this.metrics.get(metricName);
        if (!metricList || metricList.length === 0) {
            return null;
        }

        return this.calculateStats(metricList);
    }

    /**
     * 计算指标统计信息
     * @param {Array} metricList 指标列表
     * @returns {object} 统计结果
     */
    calculateStats(metricList) {
        const values = metricList.map(m => m.value);
        const count = values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / count;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        // 计算中位数
        const sorted = values.sort((a, b) => a - b);
        const median = count % 2 === 0 
            ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2 
            : sorted[Math.floor(count / 2)];

        return {
            count,
            sum,
            average: Math.round(avg * 100) / 100,
            max,
            min,
            median,
            latest: metricList[metricList.length - 1]
        };
    }

    /**
     * 判断是否为严重错误
     * @param {string} errorType 错误类型
     * @returns {boolean} 是否为严重错误
     */
    isCriticalError(errorType) {
        const criticalErrors = [
            'websocket_connect_fail',
            'websocket_max_reconnect_exceeded',
            'app_crash',
            'memory_leak'
        ];
        return criticalErrors.includes(errorType);
    }

    /**
     * 上报严重错误
     * @param {object} error 错误信息
     */
    reportCriticalError(error) {
        // 这里可以实现错误上报逻辑
        console.error('严重错误上报:', error);
        
        // 可以发送到错误监控服务
        // 例如：发送到服务器、本地存储等
    }

    /**
     * 显示性能报告
     */
    showPerformanceReport() {
        const stats = this.getPerformanceStats();
        console.group('🚀 性能监控报告');
        console.log('📊 总览:', stats.overview);
        console.log('📈 指标统计:', stats.metrics);
        console.log('❌ 最近错误:', stats.recentErrors);
        console.groupEnd();

        // 在开发环境下显示详细信息
        if (process.env.NODE_ENV === 'development') {
            this.showDetailedReport();
        }
    }

    /**
     * 显示详细性能报告
     */
    showDetailedReport() {
        console.group('📋 详细性能报告');
        
        // WebSocket连接性能
        const wsStats = this.getMetricStats('websocket_connection_time');
        if (wsStats) {
            console.log('🔗 WebSocket连接性能:', wsStats);
        }

        // 消息处理性能
        const msgStats = this.getMetricStats('message_send_time');
        if (msgStats) {
            console.log('💬 消息发送性能:', msgStats);
        }

        // 重连统计
        const reconnectStats = this.getMetricStats('websocket_reconnect');
        if (reconnectStats) {
            console.log('🔄 重连统计:', reconnectStats);
        }

        console.groupEnd();
    }

    /**
     * 清理过期数据
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24小时

        // 清理过期指标
        this.metrics.forEach((metricList, name) => {
            const filtered = metricList.filter(metric => 
                now - metric.timestamp < maxAge
            );
            this.metrics.set(name, filtered);
        });

        // 清理过期错误
        this.errors = this.errors.filter(error => 
            now - error.timestamp < maxAge
        );
    }

    /**
     * 导出性能数据
     * @returns {object} 导出的数据
     */
    exportData() {
        return {
            metrics: Object.fromEntries(this.metrics),
            errors: this.errors,
            exportTime: Date.now(),
            monitoringDuration: Date.now() - this.startTime
        };
    }

    /**
     * 销毁监控器
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.metrics.clear();
        this.errors = [];
    }
}

// 工具函数
function getCurrentPagePath() {
    try {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        return currentPage ? currentPage.route : 'unknown';
    } catch (e) {
        return 'unknown';
    }
}

function getUserAgent() {
    try {
        // #ifdef H5
        return navigator.userAgent;
        // #endif
        
        // #ifdef APP-PLUS
        return plus.os.name + ' ' + plus.os.version;
        // #endif
        
        // #ifdef MP
        return 'MiniProgram';
        // #endif
        
        return 'Unknown';
    } catch (e) {
        return 'Unknown';
    }
}

// 创建全局单例
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor; 