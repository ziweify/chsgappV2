/**
 * 页面可见性管理器
 * 解决微信内置浏览器切换到后台后页面停止更新的问题
 * 
 * 功能：
 * 1. 监听页面可见性变化（visibilitychange）
 * 2. 监听微信环境下的应用前后台切换
 * 3. 提供统一的回调管理机制
 * 4. 页面恢复时自动触发数据刷新
 * 
 * 使用方法：
 * import VisibilityManager from '@/common/visibilityManager.js'
 * uni.$visibilityManager = new VisibilityManager()
 */

class VisibilityManager {
    constructor() {
        this.isPageVisible = true;              // 页面是否可见
        this.isWechatBrowser = false;           // 是否在微信浏览器中
        this.listeners = [];                     // 监听器列表
        this.hiddenTime = null;                  // 页面隐藏时间
        this.visibleTime = null;                 // 页面可见时间
        this.lastCheckTime = Date.now();        // 最后检查时间
        
        // 检测运行环境
        this.detectEnvironment();
        
        // 初始化监听
        this.init();
        
        console.log('📱 页面可见性管理器已初始化', {
            isWechatBrowser: this.isWechatBrowser,
            platform: this.getPlatform()
        });
    }
    
    /**
     * 检测运行环境
     */
    detectEnvironment() {
        // #ifdef H5
        if (typeof window !== 'undefined' && window.navigator) {
            const ua = window.navigator.userAgent.toLowerCase();
            this.isWechatBrowser = ua.indexOf('micromessenger') !== -1;
        }
        // #endif
    }
    
    /**
     * 获取平台信息
     */
    getPlatform() {
        // #ifdef H5
        return 'H5';
        // #endif
        // #ifdef MP-WEIXIN
        return '微信小程序';
        // #endif
        // #ifdef APP-PLUS
        return 'APP';
        // #endif
        return 'unknown';
    }
    
    /**
     * 初始化监听器
     */
    init() {
        // #ifdef H5
        this.initH5Listeners();
        // #endif
        
        // #ifdef MP-WEIXIN
        this.initMpListeners();
        // #endif
        
        // #ifdef APP-PLUS
        this.initAppListeners();
        // #endif
    }
    
    /**
     * H5 环境监听器
     */
    initH5Listeners() {
        // #ifdef H5
        if (typeof document === 'undefined') return;
        
        // 1. 标准的 visibilitychange 事件
        document.addEventListener('visibilitychange', () => {
            const isVisible = !document.hidden;
            this.handleVisibilityChange(isVisible, 'visibilitychange');
        });
        
        // 2. 页面获得/失去焦点
        window.addEventListener('focus', () => {
            this.handleVisibilityChange(true, 'focus');
        });
        
        window.addEventListener('blur', () => {
            this.handleVisibilityChange(false, 'blur');
        });
        
        // 3. 页面显示/隐藏（适用于从其他标签页切换回来）
        window.addEventListener('pageshow', (event) => {
            // persisted 为 true 表示页面从缓存中加载
            this.handleVisibilityChange(true, 'pageshow', { fromCache: event.persisted });
        });
        
        window.addEventListener('pagehide', () => {
            this.handleVisibilityChange(false, 'pagehide');
        });
        
        // 4. 微信 JS-SDK 支持
        if (this.isWechatBrowser) {
            this.initWechatJSBridge();
        }
        
        console.log('✅ H5 页面可见性监听器已注册');
        // #endif
    }
    
    /**
     * 微信 JS-SDK 初始化
     */
    initWechatJSBridge() {
        // #ifdef H5
        if (typeof window === 'undefined') return;
        
        // 监听微信 JS-SDK 就绪事件
        const initWXBridge = () => {
            if (window.WeixinJSBridge) {
                console.log('✅ 微信 JS-SDK 已就绪');
                
                // 监听微信内置浏览器的前后台切换
                // 注意：这些事件在新版本微信中可能不生效，保留作为兼容
                document.addEventListener('WeixinJSBridgeReady', () => {
                    console.log('📱 WeixinJSBridgeReady 事件触发');
                });
                
                // 监听应用进入前台
                window.addEventListener('pageshow', (e) => {
                    if (e.persisted || (window.performance && window.performance.navigation.type == 2)) {
                        console.log('📱 微信浏览器：页面从缓存恢复');
                        this.handleVisibilityChange(true, 'wechat_pageshow');
                    }
                });
            }
        };
        
        if (window.WeixinJSBridge) {
            initWXBridge();
        } else {
            document.addEventListener('WeixinJSBridgeReady', initWXBridge);
        }
        // #endif
    }
    
    /**
     * 微信小程序环境监听器
     */
    initMpListeners() {
        // #ifdef MP-WEIXIN
        // 小程序通过 App 的 onShow/onHide 和页面的 onShow/onHide 处理
        console.log('✅ 微信小程序环境：使用 onShow/onHide 处理可见性');
        // #endif
    }
    
    /**
     * APP 环境监听器
     */
    initAppListeners() {
        // #ifdef APP-PLUS
        // APP 通过 plus.globalEvent 监听
        if (typeof plus !== 'undefined') {
            plus.globalEvent.addEventListener('resume', () => {
                this.handleVisibilityChange(true, 'app_resume');
            });
            
            plus.globalEvent.addEventListener('pause', () => {
                this.handleVisibilityChange(false, 'app_pause');
            });
            
            console.log('✅ APP 页面可见性监听器已注册');
        }
        // #endif
    }
    
    /**
     * 处理可见性变化
     */
    handleVisibilityChange(isVisible, source, extra = {}) {
        const now = Date.now();
        const previousState = this.isPageVisible;
        this.isPageVisible = isVisible;
        
        if (isVisible) {
            // 页面变为可见
            this.visibleTime = now;
            const hiddenDuration = this.hiddenTime ? now - this.hiddenTime : 0;
            
            console.log(`🟢 页面恢复可见 [${source}]`, {
                隐藏时长: `${(hiddenDuration / 1000).toFixed(1)}秒`,
                extra
            });
            
            // 只在状态真正改变时触发回调
            if (!previousState) {
                this.triggerListeners('visible', {
                    hiddenDuration,
                    source,
                    ...extra
                });
            }
        } else {
            // 页面变为隐藏
            this.hiddenTime = now;
            
            console.log(`🔴 页面进入后台 [${source}]`, extra);
            
            // 只在状态真正改变时触发回调
            if (previousState) {
                this.triggerListeners('hidden', {
                    source,
                    ...extra
                });
            }
        }
    }
    
    /**
     * 添加监听器
     * @param {String} event - 事件类型：'visible' | 'hidden' | 'both'
     * @param {Function} callback - 回调函数
     * @param {Object} options - 选项
     * @returns {Function} 取消监听的函数
     */
    addListener(event, callback, options = {}) {
        const listener = {
            id: Date.now() + Math.random(),
            event,
            callback,
            options,
            priority: options.priority || 0  // 优先级，数字越大越先执行
        };
        
        this.listeners.push(listener);
        
        // 按优先级排序
        this.listeners.sort((a, b) => b.priority - a.priority);
        
        console.log(`📝 添加可见性监听器：${event}`, options);
        
        // 返回取消监听的函数
        return () => {
            this.removeListener(listener.id);
        };
    }
    
    /**
     * 移除监听器
     */
    removeListener(listenerId) {
        const index = this.listeners.findIndex(l => l.id === listenerId);
        if (index > -1) {
            this.listeners.splice(index, 1);
            console.log(`🗑️ 移除可见性监听器：${listenerId}`);
        }
    }
    
    /**
     * 触发监听器
     */
    triggerListeners(event, data) {
        const targetListeners = this.listeners.filter(
            l => l.event === event || l.event === 'both'
        );
        
        console.log(`🔔 触发 ${event} 事件，共 ${targetListeners.length} 个监听器`);
        
        targetListeners.forEach(listener => {
            try {
                listener.callback(data);
            } catch (error) {
                console.error(`❌ 监听器执行出错：`, error);
            }
        });
    }
    
    /**
     * 获取当前页面可见性状态
     */
    isVisible() {
        // #ifdef H5
        if (typeof document !== 'undefined') {
            return !document.hidden;
        }
        // #endif
        
        return this.isPageVisible;
    }
    
    /**
     * 获取页面隐藏时长（毫秒）
     */
    getHiddenDuration() {
        if (!this.isPageVisible && this.hiddenTime) {
            return Date.now() - this.hiddenTime;
        }
        return 0;
    }
    
    /**
     * 手动触发页面恢复逻辑
     * 用于某些特殊场景，如用户手动点击刷新按钮
     */
    manualRefresh() {
        console.log('🔄 手动触发页面刷新');
        this.triggerListeners('visible', {
            hiddenDuration: 0,
            source: 'manual',
            isManual: true
        });
    }
    
    /**
     * 清理所有监听器
     */
    destroy() {
        this.listeners = [];
        console.log('🧹 页面可见性管理器已清理');
    }
}

export default VisibilityManager;

