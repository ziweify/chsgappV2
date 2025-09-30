<template>
	<view class="debug-container">
		<u-navbar title="WebSocket连接调试" :is-back="true"></u-navbar>
		
		<!-- 基本信息 -->
		<view class="section">
			<view class="section-title">基本信息</view>
			<view class="info-item">
				<text class="label">Token:</text>
				<text class="value">{{tokenDisplay}}</text>
			</view>
			<view class="info-item">
				<text class="label">WebSocket地址:</text>
				<text class="value">{{socketUrl}}</text>
			</view>
			<view class="info-item">
				<text class="label">连接状态:</text>
				<text :class="['status', connectionStatus]">{{connectionStatusText}}</text>
			</view>
		</view>

		<!-- 调试操作 -->
		<view class="section">
			<view class="section-title">调试操作</view>
			<view class="button-row">
				<u-button type="primary" @click="debugConnection" :loading="debugLoading">检查连接状态</u-button>
				<u-button type="warning" @click="clearCache" :loading="clearLoading">清理缓存</u-button>
			</view>
			<view class="button-row">
				<u-button type="success" @click="testConnection">测试连接</u-button>
				<u-button type="error" @click="forceReconnect">强制重连</u-button>
			</view>
		</view>

		<!-- 调试结果 -->
		<view class="section" v-if="debugResult">
			<view class="section-title">调试结果</view>
			<view class="debug-result">
				<text class="result-text">{{JSON.stringify(debugResult, null, 2)}}</text>
			</view>
		</view>

		<!-- 连接日志 -->
		<view class="section" v-if="connectionLogs.length > 0">
			<view class="section-title">连接日志</view>
			<scroll-view class="log-container" scroll-y>
				<view v-for="(log, index) in connectionLogs" :key="index" :class="['log-item', log.type]">
					<text class="log-time">{{log.time}}</text>
					<text class="log-message">{{log.message}}</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			debugLoading: false,
			clearLoading: false,
			debugResult: null,
			connectionLogs: [],
			socketUrl: '',
			token: '',
			connectionStatus: 'unknown',
			connectionStatusText: '未知'
		}
	},
	computed: {
		tokenDisplay() {
			if (!this.token) return '无';
			return this.token.length > 20 ? this.token.substring(0, 20) + '...' : this.token;
		}
	},
	onLoad() {
		this.initDebugPage();
	},
	onShow() {
		this.checkConnectionStatus();
	},
	methods: {
		initDebugPage() {
			// 获取基本信息
			this.token = uni.getStorageSync('token') || '';
			this.socketUrl = uni.$socketUtils ? uni.$socketUtils.url : '';
			
			// 添加WebSocket事件监听
			this.setupWebSocketListeners();
			
			this.addLog('info', '调试页面初始化完成');
		},

		setupWebSocketListeners() {
			// 监听连接成功
			uni.$on('websocketopen', (res) => {
				this.addLog('success', 'WebSocket连接成功');
				this.checkConnectionStatus();
			});

			// 监听连接关闭
			uni.$on('websocketclose', (res) => {
				this.addLog('error', `WebSocket连接关闭: ${JSON.stringify(res)}`);
				this.checkConnectionStatus();
			});

			// 监听连接错误
			uni.$on('websocketerror', (res) => {
				this.addLog('error', `WebSocket连接错误: ${JSON.stringify(res)}`);
				this.checkConnectionStatus();
			});
		},

		checkConnectionStatus() {
			if (uni.$socketUtils) {
				this.connectionStatus = uni.$socketUtils.isOpenSocket ? 'connected' : 'disconnected';
				this.connectionStatusText = uni.$socketUtils.isOpenSocket ? '已连接' : '未连接';
			}
		},

		async debugConnection() {
			if (!this.token) {
				uni.showToast({title: '请先登录获取token', icon: 'none'});
				return;
			}

			this.debugLoading = true;
			this.addLog('info', '开始检查连接状态...');

			try {
				const result = await this.$u.api.common.request({
					url: '/api/websocket/debug',
					method: 'POST',
					data: { token: this.token }
				});

				this.debugResult = result;
				
				if (result.status === 1) {
					this.addLog('success', '调试信息获取成功');
					
					// 分析结果
					const debugInfo = result.debug_info;
					if (debugInfo.potential_issues && debugInfo.potential_issues.length > 0) {
						debugInfo.potential_issues.forEach(issue => {
							this.addLog('warning', `潜在问题: ${issue}`);
						});
					}
					
					if (debugInfo.suggestions && debugInfo.suggestions.length > 0) {
						debugInfo.suggestions.forEach(suggestion => {
							this.addLog('info', `建议: ${suggestion}`);
						});
					}
				} else {
					this.addLog('error', `调试失败: ${result.message}`);
				}

			} catch (error) {
				this.addLog('error', `调试请求失败: ${error.message}`);
				console.error('调试连接失败:', error);
			} finally {
				this.debugLoading = false;
			}
		},

		async clearCache() {
			if (!this.token) {
				uni.showToast({title: '请先登录获取token', icon: 'none'});
				return;
			}

			this.clearLoading = true;
			this.addLog('info', '开始清理缓存...');

			try {
				const result = await this.$u.api.common.request({
					url: '/api/websocket/clear-cache',
					method: 'POST',
					data: { token: this.token }
				});

				if (result.status === 1) {
					this.addLog('success', '缓存清理成功');
					uni.showToast({title: '缓存清理成功', icon: 'success'});
				} else {
					this.addLog('error', `缓存清理失败: ${result.message}`);
					uni.showToast({title: '缓存清理失败', icon: 'none'});
				}

			} catch (error) {
				this.addLog('error', `清理缓存请求失败: ${error.message}`);
				console.error('清理缓存失败:', error);
			} finally {
				this.clearLoading = false;
			}
		},

		testConnection() {
			this.addLog('info', '开始测试连接...');
			
			if (!uni.$socketUtils) {
				this.addLog('error', 'WebSocket工具类未初始化');
				return;
			}

			// 强制断开现有连接
			if (uni.$socketUtils.isOpenSocket) {
				uni.$socketUtils.closeSocket('manual_test');
				this.addLog('info', '断开现有连接');
			}

			// 延迟重新连接
			setTimeout(() => {
				uni.$socketUtils.initConnection();
				this.addLog('info', '发起新连接');
			}, 1000);
		},

		forceReconnect() {
			this.addLog('info', '强制重连...');
			
			if (uni.$socketUtils) {
				// 重置连接状态
				uni.$socketUtils.isUserClose = false;
				uni.$socketUtils.disableAutoReconnect = false;
				uni.$socketUtils.shouldAutoReconnect = true;
				
				// 强制重连
				uni.$socketUtils.reconnect('manual_force');
				this.addLog('info', '已发起强制重连');
			} else {
				this.addLog('error', 'WebSocket工具类未找到');
			}
		},

		addLog(type, message) {
			const log = {
				type,
				message,
				time: new Date().toLocaleTimeString()
			};
			this.connectionLogs.unshift(log);
			
			// 限制日志数量
			if (this.connectionLogs.length > 50) {
				this.connectionLogs.splice(50);
			}
		}
	},

	onUnload() {
		// 清理事件监听
		uni.$off('websocketopen');
		uni.$off('websocketclose');
		uni.$off('websocketerror');
	}
}
</script>

<style lang="scss" scoped>
.debug-container {
	padding: 0;
	background-color: #f8f9fa;
	min-height: 100vh;
}

.section {
	margin: 20rpx;
	background: white;
	border-radius: 12rpx;
	padding: 30rpx;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	border-bottom: 2rpx solid #eee;
	padding-bottom: 10rpx;
}

.info-item {
	display: flex;
	margin-bottom: 15rpx;
	align-items: flex-start;
}

.label {
	width: 200rpx;
	color: #666;
	font-size: 28rpx;
	flex-shrink: 0;
}

.value {
	flex: 1;
	color: #333;
	font-size: 28rpx;
	word-break: break-all;
}

.status {
	font-weight: bold;
	
	&.connected {
		color: #07c160;
	}
	
	&.disconnected {
		color: #fa5151;
	}
	
	&.unknown {
		color: #999;
	}
}

.button-row {
	display: flex;
	justify-content: space-between;
	margin-bottom: 20rpx;
	
	.u-button {
		flex: 1;
		margin: 0 10rpx;
		
		&:first-child {
			margin-left: 0;
		}
		
		&:last-child {
			margin-right: 0;
		}
	}
}

.debug-result {
	background: #f5f5f5;
	padding: 20rpx;
	border-radius: 8rpx;
	max-height: 600rpx;
	overflow-y: auto;
}

.result-text {
	font-family: monospace;
	font-size: 24rpx;
	color: #333;
	white-space: pre-wrap;
	word-break: break-all;
}

.log-container {
	max-height: 400rpx;
	background: #f5f5f5;
	border-radius: 8rpx;
	padding: 20rpx;
}

.log-item {
	display: flex;
	margin-bottom: 10rpx;
	padding: 10rpx;
	border-radius: 6rpx;
	
	&.info {
		background: #e3f2fd;
		border-left: 4rpx solid #2196f3;
	}
	
	&.success {
		background: #e8f5e8;
		border-left: 4rpx solid #4caf50;
	}
	
	&.warning {
		background: #fff3e0;
		border-left: 4rpx solid #ff9800;
	}
	
	&.error {
		background: #ffebee;
		border-left: 4rpx solid #f44336;
	}
}

.log-time {
	width: 120rpx;
	font-size: 24rpx;
	color: #666;
	flex-shrink: 0;
}

.log-message {
	flex: 1;
	font-size: 26rpx;
	color: #333;
	word-break: break-all;
}
</style>


