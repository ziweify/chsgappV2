import {WSS_SERVER_URL} from '@/common/config.js';

class websocketUtils {
    constructor() {
        this.url = WSS_SERVER_URL; //ws地址
        this.isOpenSocket = false; //避免重复连接
        this.timeout = 5; //心跳检测间隔 单位秒（s）
        this.heartbeatInterval = null; //检测服务器端是否还存活
        this.reconnectTimeOut = null; //重连定时器
        this.socketTask = null;
        
        // 新增属性 - 连接管理
        this.reconnectAttempts = 0; // 当前重连次数（仅用于统计）
        this.reconnectInterval = 2000; // 固定重连间隔2秒
        this.isUserClose = false; // 是否用户主动关闭
        this.isUserExitApp = false; // 是否用户明确退出应用（更强的禁用标志）
        this.disableAutoReconnect = false; // 禁用自动重连但允许手动连接
        this.isReconnecting = false; // 是否正在重连中
        this.connectionStartTime = null; // 连接开始时间
        this.lastHeartbeatTime = null; // 最后心跳时间
        this.heartbeatTimeoutId = null; // 心跳超时定时器
        this.heartbeatTimeoutDuration = 15000; // 心跳超时时间15秒
        this.isNetworkAvailable = true; // 网络是否可用
        this.shouldAutoReconnect = true; // 是否应该自动重连
        this.networkCheckTimer = null; // 网络检测定时器
        this.networkCheckInterval = 10000; // 网络检测间隔10秒
        
        // 重连防抖机制
        this.lastReconnectTime = 0; // 最后一次重连时间
        this.reconnectDebounceDelay = 3000; // 重连防抖间隔3秒
        
        // 防闪烁机制
        this.isBettingCenterClosing = false; // 打单中心弹窗关闭标志
        this.reconnectDebounceTimer = null; // 重连防抖定时器
        this.reconnectLock = false; // 重连锁，防止并发重连
        
        // 新增：连接建立锁机制
        this.isConnecting = false; // 是否正在连接建立中
        this.connectingPromise = null; // 当前连接Promise，避免重复连接
        this.shouldCloseAfterConnect = false; // 连接建立后是否应该立即关闭
        
        // 性能监控 - 已禁用
        // if (uni.$performanceMonitor) {
        //     this.performanceMonitor = uni.$performanceMonitor;
        // }
        
        // 监听网络状态
        this.initNetworkListener();
        
        // 监听应用状态
        this.initAppStateListener();
    }

    // 统一重连方法 - 确保同时只有一个重连过程
    debouncedReconnect(reason = 'unknown', forceImmediate = false) {
        const now = Date.now();
        
        // 防闪烁检查：如果打单中心正在关闭，跳过重连
        if (this.isBettingCenterClosing) {
            // console.log(`跳过重连: 打单中心正在关闭，原因=${reason}`);
            return;
        }
        
        // 如果连接已存在、用户关闭、或者正在重连中、或者有重连锁，直接返回
        if (this.isOpenSocket || this.isUserClose || !this.shouldAutoReconnect || this.isUserExitApp || this.disableAutoReconnect || this.isReconnecting || this.reconnectLock) {
            // console.log(`跳过重连: 连接存在=${this.isOpenSocket}, 用户关闭=${this.isUserClose}, 正在重连=${this.isReconnecting}, 重连锁=${this.reconnectLock}, 原因=${reason}`);
            return;
        }
        
        // 如果正在连接建立中，但连接时间过长，清理状态并允许重连
        if (this.isConnecting) {
            const connectionDuration = Date.now() - (this.connectionStartTime || 0);
            if (connectionDuration > 15000) { // 连接超过15秒认为异常
                // console.log('连接建立时间过长，清理状态并重连');
                this.cleanupConnectionAttempt();
            } else {
                // console.log(`正在连接建立中，等待完成 (已等待${connectionDuration}ms)`);
                return;
            }
        }
        
        // 清除现有的防抖定时器
        clearTimeout(this.reconnectDebounceTimer);
        
        // 如果强制立即执行或距离上次重连已经超过防抖间隔
        if (forceImmediate || (now - this.lastReconnectTime) >= this.reconnectDebounceDelay) {
            // console.log(`立即执行重连，原因: ${reason}`);
            this.lastReconnectTime = now;
            this.startReconnectProcess(reason);
        } else {
            // 使用防抖延迟执行
            const remainingTime = this.reconnectDebounceDelay - (now - this.lastReconnectTime);
            // console.log(`防抖重连，${remainingTime}ms后执行，原因: ${reason}`);
            
            this.reconnectDebounceTimer = setTimeout(() => {
                // 再次检查条件，确保不会产生多重连接
                if (!this.isOpenSocket && !this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect && !this.isReconnecting && !this.reconnectLock) {
                    // 如果正在连接中且时间过长，清理状态
                    if (this.isConnecting) {
                        const connectionDuration = Date.now() - (this.connectionStartTime || 0);
                        if (connectionDuration > 15000) {
                            this.cleanupConnectionAttempt();
                        } else {
                            return; // 正在正常连接中，跳过
                        }
                    }
                    
                    this.lastReconnectTime = Date.now();
                    this.startReconnectProcess(reason);
                }
            }, remainingTime);
        }
    }

    // 初始化网络状态监听
    initNetworkListener() {
        // 监听网络状态变化
        uni.onNetworkStatusChange((res) => {
            // console.log('网络状态变化:', res);
            this.isNetworkAvailable = res.isConnected;
            
            if (res.isConnected && !this.isOpenSocket && !this.isUserClose && this.shouldAutoReconnect) {
                // console.log('网络恢复，尝试重连WebSocket');
                this.reconnectAttempts = 0; // 重置重连次数统计
                this.isReconnecting = false; // 重置重连状态
                clearTimeout(this.reconnectTimeOut); // 清除之前的重连定时器
                this.debouncedReconnect('network_recovery', true); // 网络恢复时立即重连
            } else if (!res.isConnected) {
                // console.log('网络断开，暂停重连');
                this.isNetworkAvailable = false;
                clearTimeout(this.reconnectTimeOut);
                clearTimeout(this.reconnectDebounceTimer);
                this.isReconnecting = false;
            }
        });
        
        // 获取当前网络状态
        uni.getNetworkType({
            success: (res) => {
                this.isNetworkAvailable = res.networkType !== 'none';
                // console.log('初始网络状态:', res.networkType, '可用性:', this.isNetworkAvailable);
            }
        });
        
        // H5环境下额外的网络监听机制
        // #ifdef H5
        this.initH5NetworkListener();
        this.initPageVisibilityListener();
        // #endif
    }
    
    // H5环境下的网络监听
    initH5NetworkListener() {
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            // 监听在线状态变化
            window.addEventListener('online', () => {
                // console.log('H5: 网络连接恢复');
                this.isNetworkAvailable = true;
                if (!this.isOpenSocket && !this.isUserClose && this.shouldAutoReconnect) {
                    // console.log('H5: 网络恢复，尝试重连WebSocket');
                    this.isReconnecting = false;
                    clearTimeout(this.reconnectTimeOut);
                    this.debouncedReconnect('h5_network_recovery', true); // 网络恢复时立即重连
                }
            });
            
            window.addEventListener('offline', () => {
                // console.log('H5: 网络连接断开');
                this.isNetworkAvailable = false;
                clearTimeout(this.reconnectTimeOut);
                clearTimeout(this.reconnectDebounceTimer);
                this.isReconnecting = false;
            });
            
            // 初始化网络状态
            this.isNetworkAvailable = navigator.onLine;
            // console.log('H5: 初始网络状态 navigator.onLine:', navigator.onLine);
        }
    }
    
    // 页面可见性监听
    initPageVisibilityListener() {
        if (typeof document !== 'undefined') {
            const visibilityChangeHandler = () => {
                if (document.visibilityState === 'visible') {
                    console.log('🌞 H5: 页面变为可见，智能检测连接状态');
                    
                    // ✅ 改进：页面恢复时不立即重连，先检测连接是否真的断开
                    // 给服务器一些时间处理，避免fd冲突
                    setTimeout(() => {
                        // 再次检查条件，确保在延迟期间状态没有变化
                        if (!this.isOpenSocket && !this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp) {
                            console.log('🔍 检测到连接已断开，准备重连');
                            this.debouncedReconnect('page_visible_delayed');
                        } else {
                            console.log('✅ 连接状态正常，无需重连');
                        }
                    }, 800); // ✅ 延迟800ms，给服务器足够时间清理旧fd
                } else {
                    console.log('🌙 H5: 页面变为隐藏，保持连接');
                    // ✅ 页面隐藏时不做任何操作，让连接自然保持
                }
            };
            
            // 监听页面可见性变化
            document.addEventListener('visibilitychange', visibilityChangeHandler);
            
            // ❌ 移除window.focus监听，避免与visibilitychange重复触发
            // window.addEventListener('focus', () => {
            //     if (!this.isOpenSocket && !this.isUserClose && this.shouldAutoReconnect) {
            //         this.debouncedReconnect('window_focus');
            //     }
            // });
            
            console.log('H5: 页面可见性监听已初始化（优化版），当前状态:', document.visibilityState);
        }
    }

    // 初始化应用状态监听
    initAppStateListener() {
        // #ifdef APP-PLUS
        // 监听应用进入前台
        uni.onAppShow(() => {
            // console.log('应用进入前台');
            if (!this.isOpenSocket && !this.isUserClose && this.isNetworkAvailable && this.shouldAutoReconnect) {
                // console.log('应用进入前台，尝试重连');
                this.isReconnecting = false; // 重置重连状态
                clearTimeout(this.reconnectTimeOut); // 清除之前的重连定时器
                // APP进入前台时立即重连，因为这是明确的用户操作
                this.debouncedReconnect('app_show', true);
            }
        });
        
        // 监听应用进入后台
        uni.onAppHide(() => {
            // console.log('应用进入后台');
            // 保持连接，继续重连机制
        });
        // #endif
    }

    // 初始化连接
    initConnection(url, time, isManualCall = true) {
        if (url) { this.url = url; }
        if (time) { this.timeout = time; }
        
        // 检查用户是否明确退出过应用（仅对自动调用生效）
        if (this.isUserExitApp && !isManualCall) {
            // console.log('用户之前明确退出过应用，禁止自动重连');
            return Promise.reject(new Error('用户已退出应用，禁止自动重连'));
        }
        
        // 如果是手动调用（用户主动进入页面），重置连接状态
        if (isManualCall) {
            // console.log('用户主动进入页面，重置连接状态');
            this.isUserClose = false;
            this.isReconnecting = false;
            this.reconnectLock = false; // 释放重连锁
            this.reconnectAttempts = 0;
            // 清除之前的重连定时器
            clearTimeout(this.reconnectTimeOut);
            
            // 如果没有禁用自动重连，则启用自动重连
            if (!this.disableAutoReconnect) {
                this.shouldAutoReconnect = true;
            } else {
                // console.log('检测到禁用自动重连标志，仅允许手动连接');
                this.shouldAutoReconnect = false;
            }
        }
        
        // 启动网络检测定时器
        this.startNetworkMonitoring();
        
        if (!this.isNetworkAvailable) {
            // console.log('网络不可用，将在网络恢复后自动重连');
            // 不返回错误，保持重连机制（仅在未禁用自动重连时）
            if (!this.disableAutoReconnect) {
                setTimeout(() => {
                    if (!this.isOpenSocket && !this.isUserClose && !this.isUserExitApp) {
                        this.debouncedReconnect('network_check');
                    }
                }, this.reconnectInterval);
            }
            return Promise.reject(new Error('网络不可用'));
        }
        
        try {
            return this.connectSocketInit();
        } catch (e) {
            // console.error('连接错误:', e);
            // this.recordError('init_connection', e);
            this.isOpenSocket = false;
            // 只有在非手动调用且未禁用自动重连时才自动重连
            if (!isManualCall && !this.disableAutoReconnect) {
                this.debouncedReconnect('init_error');
            }
            return Promise.reject(e);
        }
    }

    // 创建websocket连接
    connectSocketInit() {
        // 如果正在连接中，返回现有的连接Promise
        if (this.isConnecting && this.connectingPromise) {
            // console.log('连接正在建立中，返回现有Promise');
            return this.connectingPromise;
        }
        
        // 如果已有连接且正常运行，直接返回成功
        if (this.socketTask && this.isOpenSocket) {
            // console.log('连接已存在且正常，返回现有连接');
            return Promise.resolve();
        }
        
        // 标记正在连接
        this.isConnecting = true;
        this.connectionStartTime = Date.now();
        
        // console.log(`开始连接WebSocket，尝试次数: ${this.reconnectAttempts + 1}`);
        
        // 创建连接Promise
        this.connectingPromise = new Promise((resolve, reject) => {
            // 先清理旧连接（但不影响正在建立的连接）
            if (this.socketTask) {
                // console.log('清理旧连接');
                try {
                    this.socketTask.close({reason: 'new_connection'});
                } catch (e) {
                    // console.warn('清理旧连接失败:', e);
                }
            }
            
            this.isOpenSocket = false;
            this.socketTask = null;
            
            this.socketTask = uni.connectSocket({
                url: this.url + "?token=" + uni.getStorageSync('token'),
                success: () => {
                    // console.log('WebSocket连接请求发送成功');
                },
                fail: (error) => {
                    // console.error('WebSocket连接请求失败:', error);
                    // this.recordError('connect_fail', error);
                    this.cleanupConnectionAttempt();
                    this.handleConnectionFailure('connect_fail');
                    reject(error);
                }
            });

            let _this = this;
            let openTimer = null;
            let isResolved = false;

            // 连接超时处理 - 改进版
            openTimer = setTimeout(() => {
                if (!isResolved) {
                    // console.error('WebSocket连接超时');
                    isResolved = true;
                    
                    // 主动关闭超时的socket连接
                    if (_this.socketTask) {
                        try {
                            _this.socketTask.close({
                                reason: 'timeout',
                                success: () => {
                                    // console.log('超时连接已关闭');
                                },
                                fail: (error) => {
                                    // console.warn('关闭超时连接失败:', error);
                                }
                            });
                        } catch (e) {
                            // console.warn('强制关闭超时连接时发生异常:', e);
                        }
                    }
                    
                    // _this.recordError('connect_timeout', new Error('连接超时'));
                    _this.cleanupConnectionAttempt();
                    _this.handleConnectionFailure('connect_timeout');
                    reject(new Error('连接超时'));
                }
            }, 10000); // 10秒超时

            this.socketTask.onOpen((res) => {
                if (!isResolved) {
                    // console.log('WebSocket连接成功');
                    isResolved = true;
                    clearTimeout(openTimer);
                    
                    _this.isOpenSocket = true;
                    _this.isReconnecting = false;
                    _this.reconnectAttempts = 0; // 重置重连次数
                    _this.lastHeartbeatTime = Date.now();
                    
                    // 清理连接状态
                    _this.cleanupConnectionAttempt();
                    
                    // 检查是否需要在连接成功后立即关闭
                    if (_this.shouldCloseAfterConnect) {
                        // console.log('连接成功但需要立即关闭');
                        _this.shouldCloseAfterConnect = false;
                        _this.closeSocket('force_cleanup_after_connect');
                        reject(new Error('连接建立后被立即关闭'));
                        return;
                    }
                    
                    // 记录连接成功性能指标
                    const connectionTime = Date.now() - _this.connectionStartTime;
                    // _this.recordPerformance('connection_success', connectionTime);
                    
                    uni.$emit("websocketopen", res);
                    _this.startHeartbeat();
                    resolve(res);
                }
            });

            // 消息处理
            this.socketTask.onMessage((res) => {
                _this.handleMessage(res);
            });

            // 错误处理
            this.socketTask.onError((res) => {
                if (!isResolved) {
                    console.error('🔥 WebSocket连接错误(建立过程中):', res);
                    isResolved = true;
                    clearTimeout(openTimer);
                    
                    // _this.recordError('socket_error', res);
                    _this.cleanupConnectionAttempt();
                    _this.handleConnectionFailure('socket_error');
                    reject(res);
                }
            });

            // 关闭处理
            this.socketTask.onClose((e) => {
                if (!isResolved) {
                    // console.log('WebSocket连接建立过程中关闭:', e);
                    isResolved = true;
                    clearTimeout(openTimer);
                    
                    _this.cleanupConnectionAttempt();
                    
                    // 如果是在连接建立过程中关闭，这是一个错误
                    const error = new Error('WebSocket连接在建立过程中被关闭');
                    // _this.recordError('connection_closed_during_establishment', error);
                    reject(error);
                } else {
                    // 连接已建立后的正常关闭处理
                    // console.log('WebSocket连接关闭:', e);
                    _this.handleConnectionClose(e);
                }
            });
        });
        
        return this.connectingPromise;
    }
    
    // 清理连接尝试状态
    cleanupConnectionAttempt() {
        this.isConnecting = false;
        this.connectingPromise = null;
        this.shouldCloseAfterConnect = false;
    }

    // 处理消息
    handleMessage(res) {
        this.lastHeartbeatTime = Date.now();
        this.resetHeartbeatTimeout();
        
        try {
            let json = JSON.parse(res.data);
            
            // 处理特殊消息类型
            if (json.eventType === 'pong') {
                console.log('💚 收到心跳 pong 响应');
                this.lastHeartbeatTime = Date.now();
                this.resetHeartbeatTimeout();
                return;
            }
            
            if (json.eventType === 'timeout') {
                console.log('⏰ 服务器发送timeout消息，关闭连接并继续重连');
                console.log('🔍 可能原因：多个标签页导致fd冲突，或网络状态检查失败');
                
                // 服务器超时时，强制重置所有状态确保重连
                this.isOpenSocket = false;
                this.isReconnecting = false;
                this.reconnectLock = false;
                this.clearAllTimers();
                
                if (this.socketTask) {
                    this.socketTask.close({reason: 'server_timeout'});
                }
                this.socketTask = null;
                
                // 强制确保重连状态正确
                this.isUserClose = false;
                this.shouldAutoReconnect = true;
                this.disableAutoReconnect = false;
                this.isUserExitApp = false;
                
                console.log('🔄 timeout后强制立即重连');
                // 立即触发重连，跳过所有防抖和检查
                this.debouncedReconnect('server_timeout', true);
                return;
            }
            
            if (json.eventType === 'logout') {
                // console.log('服务器要求登出，清理所有资源并返回登录页面');
                // 服务器要求登出，彻底清理资源并停止重连
                this.isUserClose = true;
                this.isUserExitApp = true;
                this.shouldAutoReconnect = false;
                
                this.clearAllTimers();
                
                if (this.socketTask) {
                    this.socketTask.close({reason: 'server_logout'});
                }
                this.isOpenSocket = false;
                this.isReconnecting = false;
                this.socketTask = null;
                
                // 清理token并跳转登录页
                uni.removeStorageSync('token');
                uni.showToast({title: json.data || '您已被服务器登出', icon: 'none'});
                setTimeout(() => {
                    uni.reLaunch({url: '/pages/common/login'});
                }, 1000);
                return;
            }

            // 分发消息事件
            this.dispatchMessage(json);
            
        } catch (e) {
            // console.error('解析消息失败:', e, res.data);
            // this.recordError('parse_message', e);
        }
    }

    // 分发消息事件
    dispatchMessage(json) {
        if (json.gid && json.eventType !== "periodListOrSingle") {
            uni.$emit(json['eventType'] + json.gid, json);
            
            if (json.other && json.other.openResult && json.other.openResult == 1) {
                uni.$emit("openKjNotice", json.gid);
            }
            
            if (json.other && json.other.isApplayMsg && json.other.isApplayMsg == 1) {
                uni.$emit("applyMsgEvent", json);
            }
        } else {
            uni.$emit(json['eventType'], json);
        }
    }

    // 处理连接失败
    handleConnectionFailure(reason) {
        this.isOpenSocket = false;
        
        // 清理连接尝试状态 - 重要：确保isConnecting被清理
        this.cleanupConnectionAttempt();
        
        // console.log(`连接失败: ${reason}`);
        
        // 只要不是用户主动关闭且启用自动重连，就继续重连（不管网络状态）
        if (!this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect) {
            // console.log('连接失败，通过统一入口启动重连机制');
            // 重置重连状态，允许重新开始
            this.isReconnecting = false;
            this.debouncedReconnect(reason, false);
        } else {
            this.isReconnecting = false;
        }
    }

    // 处理连接关闭
    handleConnectionClose(e) {
        this.isOpenSocket = false;
        this.clearAllTimers();
        
        console.log('🔴 WebSocket连接关闭:', e);
        console.log('📊 关闭详情 - 代码:', e?.code, '原因:', e?.reason, '是否意外:', !e?.wasClean);
        
        // 检查是否是特殊关闭原因
        if (e && (e.reason === 'user' || e.reason === 'destroy' || e.reason === 'force_cleanup')) {
            // console.log('用户主动关闭连接或强制清理，停止重连');
            this.isUserClose = true;
            this.shouldAutoReconnect = false;
            this.isReconnecting = false;
            return;
        }
        
        if (e && e.reason === 'server_logout') {
            // console.log('服务器要求登出，停止重连');
            this.isUserClose = true;
            this.shouldAutoReconnect = false;
            this.isReconnecting = false;
            return;
        }
        
        // 其他所有情况都应该重连
        if (!this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect) {
            // console.log('连接意外关闭，通过统一入口启动重连机制');
            // 重置重连状态，允许重新开始
            this.isReconnecting = false;
            this.debouncedReconnect('connection_close', false);
        } else {
            this.isReconnecting = false;
        }
    }

    // 发送消息
    send(value) {
        try {
            // 记录发送的消息（排除心跳）
            if (value.eventType !== 'ping') {
                console.log('📤 发送WebSocket消息:', value.eventType, value);
                
                // 统计消息发送频率
                if (!this.messageStats) {
                    this.messageStats = {};
                }
                const eventType = value.eventType;
                if (!this.messageStats[eventType]) {
                    this.messageStats[eventType] = { count: 0, lastTime: 0 };
                }
                const now = Date.now();
                this.messageStats[eventType].count++;
                this.messageStats[eventType].lastTime = now;
                
                // 每10个消息输出一次统计
                const totalMessages = Object.values(this.messageStats).reduce((sum, stat) => sum + stat.count, 0);
                if (totalMessages % 10 === 0) {
                    console.log('📊 消息发送统计:', this.messageStats);
                }
            }
            
            // 自动为所有发送的数据添加token（如果token为空会抛出异常）
            const dataToSend = this.addTokenToData(value);
            
            if (this.socketTask && this.isOpenSocket) {
                try {
                    this.socketTask.send({
                        data: JSON.stringify(dataToSend),
                        success: () => {
                            // 发送成功
                        },
                        fail: (error) => {
                            // console.error('发送消息失败:', error);
                            // this.recordError('send_message', error);
                            
                            // 发送失败可能意味着连接有问题，触发重连
                            if (!this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect) {
                                this.isOpenSocket = false;
                                this.debouncedReconnect('send_failed');
                            }
                        }
                    });
                } catch (e) {
                    // console.error('发送消息异常:', e);
                    // this.recordError('send_exception', e);
                    
                    // 发送异常，可能连接有问题
                    if (!this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect) {
                        this.isOpenSocket = false;
                        this.debouncedReconnect('send_exception');
                    }
                }
            } else {
                // console.warn('WebSocket未连接，消息发送失败:', value);
                
                // 如果连接断开，立即尝试重连
                if (!this.isOpenSocket && !this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect) {
                    this.debouncedReconnect('send_failed');
                }
            }
        } catch (tokenError) {
            // token为空时的异常处理，不需要重连，因为已经跳转到登录页面
            // console.error('token验证失败，消息发送被阻止:', tokenError.message);
            // 不抛出异常，避免影响其他逻辑，因为已经在handleTokenEmpty中处理了
            return;
        }
    }

    // 为发送的数据自动添加token
    addTokenToData(data) {
        // 获取当前token
        const token = uni.getStorageSync('token');
        
        if (!token || token === '' || token === null || token === undefined) {
            // console.error('发送数据时发现token为空，清空所有资源并返回登录界面');
            
            // 立即清空所有资源并返回登录界面
            this.handleTokenEmpty();
            
            // 抛出错误，阻止发送数据
            throw new Error('Token为空，已清理资源并跳转到登录页面');
        }
        
        // 如果数据是对象，直接添加token字段
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            // 创建一个新对象，避免修改原始数据
            const dataWithToken = { ...data };
            
            // 如果数据中没有token字段，则添加token
            if (!dataWithToken.hasOwnProperty('token')) {
                dataWithToken.token = token;
            } else {
                // console.log('数据中已包含token字段，保持原有值');
            }
            
            return dataWithToken;
        }
        
        // 如果数据不是对象，包装成对象并添加token
        return {
            data: data,
            token: token
        };
    }

    // 处理token为空的情况
    handleTokenEmpty() {
        // console.log('开始处理token为空的情况，清理所有资源');
        
        // 1. 彻底关闭WebSocket连接并停止所有重连
        this.isUserClose = true;
        this.isUserExitApp = true;
        this.shouldAutoReconnect = false;
        this.disableAutoReconnect = true;
        
        // 2. 清理所有定时器和连接资源
        this.clearAllTimers();
        
        // 3. 强制关闭WebSocket连接
        if (this.socketTask) {
            try {
                this.socketTask.close({
                    reason: 'token_empty',
                    success: () => {
                        // console.log('因token为空，WebSocket连接已关闭');
                    },
                    fail: (error) => {
                        // console.warn('关闭WebSocket连接失败:', error);
                    }
                });
            } catch (e) {
                // console.warn('强制关闭WebSocket时发生异常:', e);
            }
        }
        
        this.isOpenSocket = false;
        this.isReconnecting = false;
        this.socketTask = null;
        
        // 4. 清理存储的数据
        try {
            uni.removeStorageSync('token');
            // 可以根据需要清理其他相关数据
            // uni.removeStorageSync('userInfo');
            // uni.removeStorageSync('gameData');
            // console.log('已清理本地存储的token');
        } catch (e) {
            // console.warn('清理本地存储时发生错误:', e);
        }
        
        // 5. 显示提示并跳转到登录页面
        uni.showToast({
            title: '登录状态已失效，请重新登录',
            icon: 'none',
            duration: 2000
        });
        
        // 延迟跳转，确保提示能够显示
        setTimeout(() => {
            uni.reLaunch({
                url: '/pages/common/login',
                success: () => {
                    // console.log('因token为空，已跳转到登录页面');
                },
                fail: (error) => {
                    // console.error('跳转到登录页面失败:', error);
                    // 备用跳转方式
                    try {
                        uni.navigateTo({
                            url: '/pages/common/login'
                        });
                    } catch (e) {
                        // console.error('备用跳转方式也失败:', e);
                    }
                }
            });
        }, 1500);
    }

    // 开启心跳检测
    startHeartbeat() {
        this.clearHeartbeat();
        
        this.heartbeatInterval = setInterval(() => {
            if (this.isOpenSocket) {
                console.log('💓 发送心跳 ping');
                this.send({eventType: "ping"});
                this.setHeartbeatTimeout();
            }
        }, this.timeout * 1000);
        
        // 立即发送一次心跳
        this.send({eventType: "ping"});
        this.setHeartbeatTimeout();
    }

    // 设置心跳超时
    setHeartbeatTimeout() {
        clearTimeout(this.heartbeatTimeoutId);
        this.heartbeatTimeoutId = setTimeout(() => {
            console.warn('💔 心跳超时，连接已断开，触发重连');
            // this.recordError('heartbeat_timeout', new Error('心跳超时'));
            this.isOpenSocket = false;
            this.clearAllTimers();
            
            // 心跳超时直接触发重连，不需要关闭socket
            if (!this.isUserClose && this.shouldAutoReconnect) {
                this.debouncedReconnect('heartbeat_timeout');
            }
        }, this.heartbeatTimeoutDuration);
    }

    // 重置心跳超时
    resetHeartbeatTimeout() {
        clearTimeout(this.heartbeatTimeoutId);
        this.setHeartbeatTimeout();
    }

    // 清除心跳
    clearHeartbeat() {
        clearInterval(this.heartbeatInterval);
        clearTimeout(this.heartbeatTimeoutId);
        this.heartbeatInterval = null;
        this.heartbeatTimeoutId = null;
    }

    // 启动重连过程 - 统一重连入口，确保同时只有一个重连过程
    startReconnectProcess(reason = 'unknown') {
        // 严格检查是否可以开始重连
        if (this.isOpenSocket || this.isUserClose || !this.shouldAutoReconnect || this.isUserExitApp || this.disableAutoReconnect) {
            // console.log(`无法启动重连: 连接存在=${this.isOpenSocket}, 用户关闭=${this.isUserClose}, 原因=${reason}`);
            return;
        }
        
        // 如果已经在重连中或有重连锁，直接返回
        if (this.isReconnecting || this.reconnectLock) {
            // console.log(`已经在重连中或有重连锁，跳过重复重连，重连状态=${this.isReconnecting}, 重连锁=${this.reconnectLock}, 原因: ${reason}`);
            return;
        }
        
        // 如果正在连接建立中，但连接时间过长，清理状态并允许重连
        if (this.isConnecting) {
            const connectionDuration = Date.now() - (this.connectionStartTime || 0);
            if (connectionDuration > 15000) { // 连接超过15秒认为异常
                // console.log('连接建立时间过长，清理状态并重连');
                this.cleanupConnectionAttempt();
            } else {
                // console.log(`正在连接建立中，跳过重复重连 (已等待${connectionDuration}ms)`);
                return;
            }
        }
        
        // 设置重连锁和重连状态，阻止其他重连
        this.reconnectLock = true;
        this.isReconnecting = true;
        
        // 彻底清理旧连接和所有定时器
        this.forceCleanupConnection();
        
        console.log(`🔄 启动重连进程，原因: ${reason}，当前尝试次数: ${this.reconnectAttempts + 1}`);
        
        // 立即尝试重连
        this.executeReconnect(reason);
    }
    
    // 执行重连逻辑
    executeReconnect(reason = 'unknown') {
        // 再次检查是否应该继续重连
        if (this.isUserClose || !this.shouldAutoReconnect || this.isUserExitApp || this.disableAutoReconnect) {
            this.isReconnecting = false;
            // console.log('重连过程中被取消');
            return;
        }
        
        // 清理可能残留的连接状态，确保重连能够正常进行
        if (this.isConnecting) {
            // console.log('清理残留的连接状态');
            this.cleanupConnectionAttempt();
        }
        
        this.reconnectAttempts++;
        
        // H5环境下额外检查网络状态
        this.checkNetworkStatus();
        
        console.log(`⚡ 执行重连 (第${this.reconnectAttempts}次)，网络状态: ${this.isNetworkAvailable}，原因: ${reason}`);
        
        // 房主账号重连优化：增加指数退避和最大重连次数限制
        const maxReconnectAttempts = 100; // 最大重连次数
        if (this.reconnectAttempts > maxReconnectAttempts) {
            console.error(`❌ 重连次数超过限制(${maxReconnectAttempts})，停止重连`);
            this.isReconnecting = false;
            this.reconnectLock = false;
            this.shouldAutoReconnect = false;
            
            // 显示错误提示
            uni.showToast({
                title: '连接异常，请重新进入房间',
                icon: 'none',
                duration: 3000
            });
            return;
        }
        
        // 尝试连接（使用自动调用方式）
        this.connectSocketInit().then(() => {
            // console.log('重连成功');
            this.isReconnecting = false;
            this.reconnectLock = false; // 释放重连锁
        }).catch((error) => {
            // console.error(`重连失败 (尝试${this.reconnectAttempts}次):`, error);
            
            // 重连失败，使用指数退避算法计算延迟时间
            if (!this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect) {
                // 指数退避：基础间隔 * 2^(重连次数/10)，最大30秒
                const baseInterval = this.reconnectInterval;
                const backoffMultiplier = Math.min(Math.pow(2, Math.floor(this.reconnectAttempts / 10)), 15);
                const delayTime = Math.min(baseInterval * backoffMultiplier, 30000);
                
                console.log(`🔄 ${delayTime / 1000}秒后继续重连 (指数退避: ${backoffMultiplier}x)`);
                
                this.reconnectTimeOut = setTimeout(() => {
                    if (this.isReconnecting && !this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect) {
                        this.executeReconnect('retry_after_failure');
                    } else {
                        this.isReconnecting = false;
                        this.reconnectLock = false; // 释放重连锁
                        // console.log('重连过程中被取消或条件不满足');
                    }
                }, delayTime);
            } else {
                this.isReconnecting = false;
                this.reconnectLock = false; // 释放重连锁
                // console.log('停止重连：条件不满足');
            }
        });
    }

    // 重新连接 - 保留原有方法，内部调用新的统一方法
    reconnect(reason = 'unknown') {
        // console.log(`[已废弃]调用旧的reconnect方法，转发到新的重连机制，原因: ${reason}`);
        this.debouncedReconnect(reason, false);
    }
    
    // 检查网络状态
    checkNetworkStatus() {
        // #ifdef H5
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            const navigatorOnline = navigator.onLine;
            // console.log('网络状态检查: navigator.onLine =', navigatorOnline);
            this.isNetworkAvailable = navigatorOnline;
        }
        // #endif
        
        // 使用uni-app API检查网络状态
        uni.getNetworkType({
            success: (res) => {
                const isConnected = res.networkType !== 'none';
                // console.log('网络状态检查: uni.getNetworkType =', res.networkType, '可用:', isConnected);
                this.isNetworkAvailable = isConnected;
            },
            fail: (error) => {
                // console.warn('获取网络状态失败:', error);
                // 获取失败时假设网络可用，继续尝试连接
                this.isNetworkAvailable = true;
            }
        });
    }

    // 启动网络监控
    startNetworkMonitoring() {
        // 清除现有定时器
        if (this.networkCheckTimer) {
            clearInterval(this.networkCheckTimer);
        }
        
        // 启动定期网络检测
        this.networkCheckTimer = setInterval(() => {
            if (!this.isOpenSocket && this.shouldAutoReconnect && !this.isUserClose && !this.disableAutoReconnect) {
                // console.log('定期网络检测：WebSocket未连接，检查网络状态');
                this.checkRealNetworkConnectivity();
            }
        }, this.networkCheckInterval);
        
        // console.log('网络监控已启动，检测间隔:', this.networkCheckInterval / 1000, '秒');
    }
    
    // 检查真实网络连接性
    checkRealNetworkConnectivity() {
        // #ifdef H5
        // 尝试发送一个简单的网络请求来检测真实连接性
        const testUrl = location.protocol + '//' + location.host + '/favicon.ico?' + Date.now();
        const timeout = 5000;
        
        const xhr = new XMLHttpRequest();
        xhr.timeout = timeout;
        xhr.onload = () => {
            // console.log('网络连接检测：可用');
            this.isNetworkAvailable = true;
            // 如果连接不存在且应该重连，尝试重连
            if (!this.isOpenSocket && this.shouldAutoReconnect && !this.isUserClose && !this.isReconnecting && !this.disableAutoReconnect) {
                // console.log('网络检测成功，尝试重连');
                this.debouncedReconnect('network_check_success');
            }
        };
        xhr.onerror = xhr.ontimeout = () => {
            // console.log('网络连接检测：不可用');
            this.isNetworkAvailable = false;
        };
        xhr.open('HEAD', testUrl);
        xhr.send();
        // #endif
        
        // #ifndef H5
        // 非H5环境使用uni-app API
        uni.getNetworkType({
            success: (res) => {
                const isConnected = res.networkType !== 'none';
                this.isNetworkAvailable = isConnected;
                // console.log('网络连接检测:', res.networkType, '可用:', isConnected);
                
                if (isConnected && !this.isOpenSocket && this.shouldAutoReconnect && !this.isUserClose && !this.isReconnecting && !this.disableAutoReconnect) {
                    // console.log('网络检测成功，尝试重连');
                    this.debouncedReconnect('network_check_success');
                }
            },
            fail: () => {
                // console.log('网络连接检测失败，假设网络可用');
                this.isNetworkAvailable = true;
                if (!this.isOpenSocket && this.shouldAutoReconnect && !this.isUserClose && !this.isReconnecting && !this.disableAutoReconnect) {
                    this.debouncedReconnect('network_check_fallback');
                }
            }
        });
        // #endif
    }
    
    // 清除所有定时器
    clearAllTimers() {
        clearTimeout(this.reconnectTimeOut);
        clearInterval(this.heartbeatInterval);
        clearTimeout(this.heartbeatTimeoutId);
        clearInterval(this.networkCheckTimer);
        clearTimeout(this.reconnectDebounceTimer);
        this.reconnectTimeOut = null;
        this.heartbeatInterval = null;
        this.heartbeatTimeoutId = null;
        this.networkCheckTimer = null;
        this.reconnectDebounceTimer = null;
        // 释放重连锁
        this.reconnectLock = false;
        // 清理连接建立状态
        this.cleanupConnectionAttempt();
    }
    
    // 强制清理连接 - 彻底清理旧连接和状态
    forceCleanupConnection() {
        // console.log('强制清理WebSocket连接和相关状态');
        
        // 如果正在连接建立中，等待当前连接完成或失败，而不是强制中断
        if (this.isConnecting) {
            // console.log('检测到正在建立连接，等待连接完成后再清理');
            // 设置标志，让连接建立完成后立即关闭
            this.shouldCloseAfterConnect = true;
            return;
        }
        
        // 清除所有定时器
        this.clearAllTimers();
        
        // 如果存在旧的socket连接，强制关闭
        if (this.socketTask) {
            try {
                this.socketTask.close({
                    reason: 'force_cleanup',
                    success: () => {
                        // console.log('旧WebSocket连接已强制关闭');
                    },
                    fail: (error) => {
                        // console.warn('强制关闭旧WebSocket连接失败:', error);
                    }
                });
            } catch (e) {
                // console.warn('强制关闭WebSocket连接时发生异常:', e);
            }
        }
        
        // 重置连接状态
        this.isOpenSocket = false;
        this.socketTask = null;
        
        // console.log('连接清理完成');
    }

    // 关闭 WebSocket 连接
    closeSocket(reason = '用户关闭') {
        // console.log(`关闭WebSocket连接，原因: ${reason}`);
        
        // 区分不同的关闭原因
        if (reason === 'user_exit_app' || reason === 'user_logout') {
            // 用户明确退出应用或登出
            this.isUserClose = true;
            this.isUserExitApp = true;
            this.shouldAutoReconnect = false;
            // console.log('用户明确退出应用，完全停止自动重连机制');
        } else if (reason === 'user_exit_gamehall') {
            // 用户退出游戏大厅 - 禁用自动重连但允许手动连接
            this.isUserClose = true;
            this.disableAutoReconnect = true;
            this.shouldAutoReconnect = false;
            // console.log('用户退出游戏大厅，禁用自动重连但允许手动连接');
        } else if (reason === 'user' || reason === 'destroy' || reason === 'server_logout') {
            // 普通的用户关闭
            this.isUserClose = true;
            this.shouldAutoReconnect = false;
            // console.log('停止自动重连机制');
        }
        
        this.clearAllTimers();
        
        if (this.socketTask) {
            this.socketTask.close({
                reason,
                success: () => {
                    // console.log('WebSocket关闭成功');
                },
                fail: (error) => {
                    // console.error('WebSocket关闭失败:', error);
                }
            });
        }
        
        this.isOpenSocket = false;
        this.isReconnecting = false;
        this.socketTask = null;
        
        // 如果不是用户主动关闭且应该自动重连，则启动重连
        if (!this.isUserClose && this.shouldAutoReconnect && !this.isUserExitApp && !this.disableAutoReconnect) {
            // console.log('连接关闭但需要重连，启动重连机制');
            this.debouncedReconnect(reason);
        }
    }

    // 手动重连（重置重连计数）
    manualReconnect() {
        // console.log('手动重连WebSocket');
        this.isUserClose = false;
        this.shouldAutoReconnect = true;
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        
        // 清除现有连接和定时器
        this.clearAllTimers();
        if (this.socketTask) {
            this.socketTask.close({reason: 'manual_reconnect'});
        }
        this.isOpenSocket = false;
        this.socketTask = null;
        
        // 立即尝试重连
        setTimeout(() => {
            this.debouncedReconnect('manual_reconnect', true);
        }, 100);
    }

    // 获取连接状态
    getConnectionStatus() {
        return {
            isConnected: this.isOpenSocket,
            isReconnecting: this.isReconnecting,
            reconnectAttempts: this.reconnectAttempts,
            isNetworkAvailable: this.isNetworkAvailable,
            lastHeartbeatTime: this.lastHeartbeatTime,
            connectionUptime: this.connectionStartTime ? Date.now() - this.connectionStartTime : 0
        };
    }

    // 记录错误
    recordError(type, error) {
        const errorInfo = {
            type,
            message: error.message || error.toString(),
            timestamp: Date.now(),
            reconnectAttempts: this.reconnectAttempts,
            networkStatus: this.isNetworkAvailable
        };
        
        // console.error('WebSocket错误记录:', errorInfo);
        
        // if (this.performanceMonitor) {
        //     this.performanceMonitor.recordError('websocket_' + type, errorInfo);
        // }
    }

    // 记录性能指标
    recordPerformance(event, value) {
        // if (this.performanceMonitor) {
        //     this.performanceMonitor.recordCustomMetric('websocket_' + event, value);
        // }
    }

    // 停止自动重连（但不销毁实例）
    stopAutoReconnect() {
        // console.log('停止自动重连');
        this.shouldAutoReconnect = false;
        this.isReconnecting = false;
        clearTimeout(this.reconnectTimeOut);
    }

    // 启用自动重连
    enableAutoReconnect() {
        // console.log('启用自动重连');
        this.isUserClose = false;
        this.shouldAutoReconnect = true;
        
        // 如果当前未连接，立即尝试重连
        if (!this.isOpenSocket && this.isNetworkAvailable && !this.isUserExitApp) {
            this.debouncedReconnect('enable_auto_reconnect', true);
        }
    }

    // 重置退出状态（用于用户重新登录或需要重新连接时）
    resetExitStatus() {
        // console.log('重置用户退出状态，允许重新连接');
        this.isUserClose = false;
        this.isUserExitApp = false;
        this.disableAutoReconnect = false;
        this.shouldAutoReconnect = true;
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        
        // 清除所有定时器
        this.clearAllTimers();
        
        // 启动网络监控
        this.startNetworkMonitoring();
        
        // console.log('退出状态已重置，可以正常使用initConnection()进行连接');
    }

    // 销毁实例
    destroy() {
        // console.log('销毁WebSocket实例，停止所有重连');
        this.isUserClose = true;
        this.shouldAutoReconnect = false;
        this.isReconnecting = false;
        
        this.clearAllTimers();
        
        if (this.socketTask) {
            this.socketTask.close({reason: 'destroy'});
        }
        
        this.isOpenSocket = false;
        this.socketTask = null;
        
        // 移除H5环境的网络监听
        // #ifdef H5
        if (typeof window !== 'undefined') {
            // 移除事件监听器（注意：这里无法直接移除，因为我们没有保存引用）
            // 在实际使用中，如果需要完全清理，应该保存监听器引用
            // console.log('H5: 网络监听器需要手动清理');
        }
        // #endif
        
        // 移除网络监听
        // uni.offNetworkStatusChange(); // 如果有这个方法的话
    }
    
    // 获取详细的连接诊断信息
    getDiagnosticInfo() {
        const info = {
            基本状态: {
                连接状态: this.isOpenSocket,
                正在重连: this.isReconnecting,
                重连锁: this.reconnectLock,
                正在连接建立: this.isConnecting,
                用户关闭: this.isUserClose,
                自动重连: this.shouldAutoReconnect,
                网络可用: this.isNetworkAvailable,
                连接后关闭标志: this.shouldCloseAfterConnect
            },
            重连信息: {
                重连次数: this.reconnectAttempts,
                重连间隔: this.reconnectInterval,
                有重连定时器: !!this.reconnectTimeOut,
                防抖间隔: this.reconnectDebounceDelay,
                最后重连时间: this.lastReconnectTime ? new Date(this.lastReconnectTime).toLocaleString() : '无',
                有防抖定时器: !!this.reconnectDebounceTimer
            },
            心跳信息: {
                有心跳定时器: !!this.heartbeatInterval,
                最后心跳时间: this.lastHeartbeatTime ? new Date(this.lastHeartbeatTime).toLocaleString() : '无',
                心跳超时时间: this.heartbeatTimeoutDuration
            },
            网络监控: {
                有网络检测定时器: !!this.networkCheckTimer,
                检测间隔: this.networkCheckInterval
            }
        };
        
        // #ifdef H5
        if (typeof navigator !== 'undefined') {
            info.H5网络状态 = {
                'navigator.onLine': navigator.onLine,
                '页面可见性': typeof document !== 'undefined' ? document.visibilityState : '未知'
            };
        }
        // #endif
        
        // console.log('WebSocket诊断信息:', info);
        return info;
    }
    
    // 测试重连机制 - 用于调试和验证
    testReconnectMechanism() {
        console.log('=== 测试WebSocket重连机制 ===');
        
        const initialState = this.getDiagnosticInfo();
        console.log('初始状态:', initialState.基本状态);
        
        // 如果当前有连接，先关闭它来模拟网络断开
        if (this.isOpenSocket && this.socketTask) {
            console.log('关闭当前连接以测试重连...');
            this.socketTask.close({reason: 'test_reconnect'});
        } else {
            console.log('当前无连接，直接测试重连...');
            this.debouncedReconnect('manual_test', true);
        }
        
        // 5秒后显示测试结果
        setTimeout(() => {
            const finalState = this.getDiagnosticInfo();
            console.log('=== 重连测试结果 ===');
            console.log('最终状态:', finalState.基本状态);
            console.log('重连信息:', finalState.重连信息);
            
            if (finalState.基本状态.连接状态) {
                console.log('✅ 重连测试成功：连接已恢复');
            } else if (finalState.基本状态.正在重连) {
                console.log('⏳ 重连测试进行中：正在尝试重连');
            } else {
                console.log('❌ 重连测试失败：连接未恢复且未在重连');
                console.log('诊断信息:', finalState);
            }
        }, 5000);
    }
    
    // 强制触发重连 - 用于调试
    forceReconnect() {
        console.log('🔧 强制触发重连');
        
        // 清理所有状态
        this.isUserClose = false;
        this.shouldAutoReconnect = true;
        this.isReconnecting = false;
        this.reconnectLock = false;
        this.cleanupConnectionAttempt();
        
        // 关闭现有连接
        if (this.socketTask) {
            this.socketTask.close({reason: 'force_reconnect'});
        }
        
        this.isOpenSocket = false;
        
        // 立即触发重连
        this.debouncedReconnect('force_reconnect', true);
    }
}

module.exports = websocketUtils