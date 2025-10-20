<template>
  <view class="component-wrapper">
    <view class="outbet-config-container" :class="{ 'popup-mode': isPopupMode }">
    <!-- 只在非弹窗模式显示标题栏 -->
    <TsCustom v-if="!isPopupMode" :backUrl="backUrl" :isBack="showBackButton" title="打单配置列表">
      <block slot='right'>
        <view @click="goToAddConfig()">添加配置</view>
      </block>
    </TsCustom>
    
    <!-- 配置信息展示区域 -->
    <view class="config-info-section">
      <view class="config-info-card">
        <view class="config-header-info">
          <view class="config-title">
            <text class="title-text">打单系统配置</text>
            <view class="switch-status" :class="configInfo.outbet_switch == 1 ? 'switch-on' : 'switch-off'" @click="toggleSwitch">
              <text class="switch-icon">🔘</text>
              <text class="switch-text">{{ configInfo.outbet_switch == 1 ? '已开启' : '已关闭' }}</text>
              <text class="click-hint">点击切换</text>
            </view>
          </view>
        </view>
        
        <view class="config-content">
          <!-- 过期时间和价格信息 -->
          <view class="config-item dual-layout">
            <!-- 左侧：过期时间区域 -->
            <view class="left-section">
              <view class="section-header">
                <view class="item-icon">📅</view>
                <text class="section-title">有效期</text>
              </view>
              <view class="time-content">
                <text class="time-text" :class="isExpired ? 'expired' : 'valid'">
                  {{ formatExpiryTime() }}
                </text>
                <text v-if="!isExpired && remainingTimeText" class="remaining-days">
                  {{ remainingTimeText }}
                </text>
              </view>
            </view>
            
            <!-- 右侧：开通价格区域 -->
            <view v-if="configInfo.outbet_money1 > 0 || configInfo.outbet_money2 > 0" class="right-section">
              <view class="section-header">
                <view class="item-icon">💰</view>
                <text class="section-title">开通价格</text>
              </view>
              <view class="price-content">
                <view v-if="configInfo.outbet_money1 > 0" class="price-item">
                  <text class="price-label">一天</text>
                  <text class="price-value">{{ configInfo.outbet_money1 }}百胜币</text>
                </view>
                <view v-if="configInfo.outbet_money2 > 0" class="price-item">
                  <text class="price-label">一个月</text>
                  <text class="price-value">{{ configInfo.outbet_money2 }}百胜币</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 试用信息 -->
          <view v-if="Number(configInfo.outbet_sy_count) > 0" class="config-item dual-layout">
            <!-- 左侧：试用说明区域 -->
            <view class="left-section">
              <view class="section-header">
                <view class="item-icon">⏰</view>
                <text class="section-title">试用说明</text>
              </view>
              <view class="trial-content">
                <text class="trial-info">
                  每天可以试用{{ configInfo.outbet_sy_count }}次，每次可以试用{{ configInfo.outbet_sy_time }}分钟
                </text>
              </view>
            </view>
            
            <!-- 右侧：操作按钮区域 -->
            <view class="right-section">
              <view class="section-header">
                <view class="item-icon">🚀</view>
                <text class="section-title">快速操作</text>
              </view>
              <view class="trial-buttons">
                <view class="apply-btn trial-btn" @click="applyTrial">
                  <text class="apply-text">🎯 申请试用</text>
                </view>
                <view class="apply-btn open-btn" @click="applyOpen(1)">
                  <text class="apply-text">⚡ 开通一天</text>
                </view>
                <view class="apply-btn open-btn-month" @click="applyOpen(30)">
                  <text class="apply-text">🔥 开通一个月</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 配置列表 -->
    <view class="config-list">
      <!-- 空状态提示 -->
      <view v-if="list.length === 0" class="empty-state">
        <text class="empty-text">暂无配置数据</text>
      </view>
      
      <!-- 配置项列表 -->
      <view v-for="(item,index) in list" :key="index" class="config-item">
        <!-- 配置头部 -->
        <view class="config-header">
          <view class="config-name">
            <text class="name-text">{{ item.name }}</text>
            <view class="status-badge" :class="item.enabled == 1 ? 'status-enabled' : 'status-disabled'">
              {{ item.enabled == 1 ? '启用' : '禁用' }}
            </view>
          </view>
          <view class="config-type">{{ getTypeLabel(item.type) }}</view>
        </view>
        
        <!-- 配置详情 -->
        <view class="config-details">
          <view class="detail-row">
            <text class="label">盘口账号：</text>
            <text class="value">{{ item.username }}</text>
          </view>
          <view class="detail-row">
            <text class="label">在线状态：</text>
            <view class="online-status" :class="item.online == 1 ? 'online' : 'offline'">
              {{ item.online == 1 ? '在线' : '离线' }}
            </view>
          </view>
          <view class="detail-row full-width">
            <text class="label">余额/未结/盈亏：</text>
            <text class="value account-info">
              {{ item.balance || '0' }}/{{ item.unsettle || '0' }}/<text :class="getProfitClass(item.sy)">{{ item.sy || '0' }}</text>
            </text>
          </view>
          <view class="detail-row" v-if="item.start_money > 0">
            <text class="label">起飞金额：</text>
            <text class="value">{{ item.start_money }}元</text>
          </view>
          <view class="detail-row" v-if="item.chai_money > 0">
            <text class="label">大额分投：</text>
            <text class="value">{{ item.chai_money }}元</text>
          </view>
          <view class="detail-row full-width" v-if="item.gidsname">
            <text class="label">游戏：</text>
            <text class="value game-names">{{ item.gidsname }}</text>
          </view>
          <view class="detail-row full-width" v-if="item.urls">
            <text class="label">网址：</text>
            <text class="value url-names">{{ item.urls }}</text>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="config-actions">
          <u-button @click="viewConfig(item)" size="mini" type="info" plain>查看</u-button>
          <u-button @click="editConfig(item)" size="mini" type="primary" plain>修改</u-button>
          <u-button @click="toggleStatus(item)" size="mini" :type="item.enabled == 1 ? 'warning' : 'success'" plain>
            {{ item.enabled == 1 ? '停用' : '启用' }}
          </u-button>
          <u-button @click="deleteConfig(item)" size="mini" type="error" plain>删除</u-button>
        </view>
      </view>
    </view>
  </view>

  <!-- 配置详情弹窗 -->
  <u-popup :show="showDetailPopup" mode="center" :closeOnClickOverlay="true" @close="closeDetailPopup" :safeAreaInsetTop="true" :customStyle="{'width':'100%','height':'100%','max-width':'100vw','border-radius':'0','overflow':'visible'}">
      <view class="detail-popup">
        <view class="popup-header">
          <view class="header-left">
            <text @click="closeDetailPopup" class="close-btn">关闭</text>
          </view>
          <view class="header-center">
            <text class="popup-title">配置详情</text>
            <text class="scroll-tip">上下滑动查看更多</text>
          </view>
          <view class="header-right">
            <text @click="editCurrentConfig" class="edit-btn">编辑</text>
          </view>
        </view>
        
        <view class="detail-content">
          <!-- 简化的配置信息 -->
          <view class="config-summary">
            <text class="config-name">{{ currentConfig.name }} {{ randomNumber }}</text>
            <text class="config-details">盘口账号: {{ currentConfig.username }} | 盘口类型: {{ getTypeLabel(currentConfig.type) }}</text>
          </view>
          
          <!-- 日志信息区域 -->
          <view class="detail-section">
            <view class="section-title">
              <text>操作日志</text>
              <view class="log-controls">
                <view class="time-filter">
                  <text class="filter-label">时间范围：</text>
                  <select v-model="logTimeRange" @change="loadLogs" class="time-select">
                    <option value="10">最近10分钟</option>
                    <option value="30">最近30分钟</option>
                    <option value="60">最近1小时</option>
                    <option value="240">最近4小时</option>
                    <option value="1440">最近24小时</option>
                    <option value="10080">最近7天</option>
                    <option value="0">全部</option>
                  </select>
                </view>
                <view class="refresh-btn" @click="loadLogs">
                  <text class="refresh-icon">🔄</text>
                  <text class="refresh-text">刷新</text>
                </view>
              </view>
            </view>
            
            <!-- 日志类型筛选 -->
            <view class="log-type-filter">
              <text class="filter-title">日志类型：</text>
              <view class="checkbox-group">
                <label class="checkbox-item">
                  <checkbox :checked="logTypeFilters.config" @change="onLogTypeChange('config', $event)" />
                  <text class="checkbox-label">配置管理</text>
                </label>
                <label class="checkbox-item">
                  <checkbox :checked="logTypeFilters.login" @change="onLogTypeChange('login', $event)" />
                  <text class="checkbox-label">登录操作</text>
                </label>
                <label class="checkbox-item">
                  <checkbox :checked="logTypeFilters.balance" @change="onLogTypeChange('balance', $event)" />
                  <text class="checkbox-label">余额查询</text>
                </label>
                <label class="checkbox-item">
                  <checkbox :checked="logTypeFilters.bet" @change="onLogTypeChange('bet', $event)" />
                  <text class="checkbox-label">投注操作</text>
                </label>
                <label class="checkbox-item">
                  <checkbox :checked="logTypeFilters.error" @change="onLogTypeChange('error', $event)" />
                  <text class="checkbox-label">错误日志</text>
                </label>
              </view>
            </view>
            
            <!-- 日志加载状态 -->
            <view v-if="logsLoading" class="log-loading">
              <text class="loading-text">正在加载日志...</text>
            </view>
            
            <!-- 日志列表 -->
            <view v-else-if="logsList.length > 0" class="logs-container">
              <view v-for="(log, index) in logsList" :key="index" class="log-item" :class="getLogTypeClass(log.type)">
                <view class="log-header">
                  <text class="log-type">{{ getLogTypeLabel(log.type) }}</text>
                  <text class="log-time">{{ formatLogTime(log.create_time) }}</text>
                </view>
                <view class="log-content">
                  <text class="log-message">{{ log.message }}</text>
                </view>
                <view v-if="log.data" class="log-data">
                  <text class="data-label">数据：</text>
                  <text class="data-content">{{ formatLogData(log.data) }}</text>
                </view>
                <view v-if="log.error" class="log-error">
                  <text class="error-label">错误：</text>
                  <text class="error-content">{{ log.error }}</text>
                </view>
              </view>
            </view>
            
            <!-- 无日志提示 -->
            <view v-else class="no-logs">
              <text class="no-logs-text">暂无日志记录</text>
            </view>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 删除确认弹窗 -->
    <u-modal confirm-text="确定删除" :show="showDeleteDialog" @confirm="confirmDelete" @cancel="showDeleteDialog = false" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">
        <text>确定要删除配置「{{ toDeleteConfig.name }}」吗？</text>
        <text style="color:#ee0a24;font-size:28rpx;margin-top:10rpx;display:block;">删除后无法恢复，请谨慎操作！</text>
      </view>
    </u-modal>

    <!-- 试用申请确认弹窗 -->
    <u-modal confirm-text="确定申请" :show="showTrialDialog" @confirm="confirmTrialApplication" @cancel="showTrialDialog = false" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">
        <text>确定要申请试用打单功能吗？</text>
        <text style="color:#007aff;font-size:28rpx;margin-top:10rpx;display:block;">每次可试用{{ configInfo.outbet_sy_time || 30 }}分钟</text>
      </view>
    </u-modal>

    <!-- 开通申请确认弹窗 -->
    <u-modal confirm-text="确定开通" :show="showOpenDialog" @confirm="confirmOpenApplication" @cancel="showOpenDialog = false" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">
        <text>确定要开通{{ openDuration }}的打单功能吗？</text>
        <text style="color:#ff6b35;font-size:28rpx;margin-top:10rpx;display:block;">费用：{{ openPrice || 0 }}百胜币</text>
      </view>
    </u-modal>
  </view>
</template>

<script>
export default {
  name: 'OutbetConfigComponent',
  mixins: [uni.$mymixin],
  props: {
    // 是否为弹窗模式
    isPopupMode: {
      type: Boolean,
      default: false
    },
    // 返回URL
    backUrl: {
      type: String,
      default: "agent/manage/outbetmanage"
    }
  },
  data() {
    return {
      list: [],
      showBackButton: true,
      configInfo: {
        outbet_switch: 0,
        outbet_overtime: 0,
        outbet_money1: 0,
        outbet_money2: 0,
        outbet_desc: '',
        outbet_sy_count: 0,
        outbet_sy_time: 0
      },
      isExpired: false,
      remainingTimeText: '',
      showDetailPopup: false,
      currentConfig: {},
      randomNumber: '',
      showDeleteDialog: false,
      toDeleteConfig: {},
      isProcessing: false,
      showTrialDialog: false,
      showOpenDialog: false,
      openDuration: '',
      openPrice: 0,
      openDays: 1,
      // 日志相关数据
      logsList: [],
      logsLoading: false,
      logTimeRange: '0', // 默认全部
      logTypeFilters: {
        config: true,    // 配置管理
        login: true,     // 登录操作
        balance: true,   // 余额查询
        bet: true,       // 投注操作
        error: true      // 错误日志
      }
    }
  },
  mounted() {
    console.log('🚀 OutbetConfigComponent 组件已挂载，弹窗模式:', this.isPopupMode);
    this.getConfigInfo();
    this.updateRemainingTime();
    // 每分钟更新一次剩余时间
    this.timeUpdateTimer = setInterval(() => {
      this.updateRemainingTime();
    }, 60000);
  },
  beforeDestroy() {
    if (this.timeUpdateTimer) {
      clearInterval(this.timeUpdateTimer);
    }
  },
  methods: {
    // 获取配置信息
    getConfigInfo() {
      console.log('📡 开始获取配置信息...');
      this.$u.api.agent.getOutbetConfig().then(res => {
        console.log('📡 配置信息响应:', res);
        if (res.status === 200 || res.code === 1) {
          this.configInfo = res.data || {};
          console.log('✅ 配置信息已更新:', JSON.stringify(this.configInfo, null, 2));
          console.log('🔍 试用信息检查:', {
            outbet_sy_count: this.configInfo.outbet_sy_count,
            outbet_sy_time: this.configInfo.outbet_sy_time,
            showTrialSection: this.configInfo.outbet_sy_count > 0
          });
          this.updateRemainingTime();
          // 获取配置列表
          this.getOutbetList();
        } else {
          console.warn('⚠️ 获取配置信息失败:', res.msg);
        }
      }).catch(err => {
        console.error('❌ 获取配置信息出错:', err);
        // 添加模拟数据用于测试
        console.log('🧪 使用模拟数据进行测试');
        this.configInfo = {
          outbet_switch: 1,
          outbet_endtime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          outbet_money1: 100,
          outbet_money2: 2000,
          outbet_desc: '这是一个功能强大的打单系统，支持多种投注模式和自动化操作。',
          outbet_sy_count: 3,
          outbet_sy_time: 30
        };
        this.updateRemainingTime();
        // 获取配置列表
        this.getOutbetList();
      });
    },

    // 查询列表
    getOutbetList() {
      console.log('📡 开始查询配置列表...');
      this.$u.api.agent.getOutbetList({
        page: 1,
        limit: 50 // 弹窗模式下不需要分页，一次加载所有数据
      }).then(res => {
        console.log('📡 配置列表响应:', res);
        if (res.status === 200 || res.code === 1) {
          // 处理不同的数据结构
          let listData = [];
          if (res.data?.records) {
            // 如果有records字段，使用records数组
            listData = res.data.records;
          } else if (res.data?.data) {
            // 如果有data字段，使用data
            listData = res.data.data;
          } else if (Array.isArray(res.data)) {
            // 如果data本身就是数组
            listData = res.data;
          }
          console.log('✅ 配置列表数据:', listData);
          console.log('📋 配置列表详细信息:');
          listData.forEach((config, index) => {
            console.log(`  配置${index + 1}: ID=${config.id}, 名称=${config.name}, 用户名=${config.username}`);
          });
          this.list = listData;
        } else {
          console.warn('⚠️ 获取配置列表失败:', res.msg);
          this.list = [];
        }
      }).catch(err => {
        console.error('❌ 获取配置列表出错:', err);
        this.list = [];
      });
    },

    // 切换开关
    toggleSwitch() {
      const action = this.configInfo.outbet_switch == 1 ? '关闭' : '开启';
      uni.showModal({
        title: '确认操作',
        content: `确定要${action}打单总开关吗？`,
        success: (res) => {
          if (res.confirm) {
            this.updateSwitch();
          }
        }
      });
    },

    // 更新总开关状态
    updateSwitch() {
      uni.showLoading({title: '操作中...'});
      const newStatus = this.configInfo.outbet_switch == 1 ? 0 : 1;
      
      this.$u.api.agent.updateOutbetSwitch({
        outbet_switch: newStatus
      }).then(res => {
        uni.hideLoading();
        if (res.status === 200 || res.code === 1) {
          this.configInfo.outbet_switch = newStatus;
          uni.showToast({
            title: newStatus == 1 ? '已开启' : '已关闭',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        uni.hideLoading();
        uni.showToast({
          title: err.msg || '操作失败',
          icon: 'none'
        });
      });
    },

    // 添加配置
    goToAddConfig() {
      if (this.isPopupMode) {
        // 弹窗模式下触发事件
        this.$emit('addConfig');
      } else {
        // 页面模式下直接跳转
        uni.$utils.jump('agent/manage/outbet/addconfig');
      }
    },

    // 查看配置
    viewConfig(item) {
      this.currentConfig = item;
      // 生成3位随机数字
      this.randomNumber = Math.floor(Math.random() * 900) + 100;
      console.log('🔍 查看配置详情:', {
        configId: item.id,
        configName: item.name,
        currentConfig: this.currentConfig
      });
      this.showDetailPopup = true;
      // 加载日志数据
      this.loadLogs();
    },

    // 编辑配置
    editConfig(item) {
      console.log('🔧 OutbetConfigComponent editConfig 被调用:', item, 'isPopupMode:', this.isPopupMode);
      
      // 添加延迟，让用户看到点击效果
      uni.showLoading({ title: '正在跳转...' });
      
      setTimeout(() => {
        if (this.isPopupMode) {
          // 弹窗模式下触发事件
          console.log('🔧 弹窗模式下触发 editConfig 事件');
          this.$emit('editConfig', item);
        } else {
          // 页面模式下直接跳转
          console.log('🔧 页面模式下直接跳转');
          uni.$utils.jump('agent/manage/outbet/addconfig?id=' + item.id);
        }
        uni.hideLoading();
      }, 300);
    },

    // 编辑当前配置
    editCurrentConfig() {
      this.showDetailPopup = false;
      this.editConfig(this.currentConfig);
    },

    // 关闭详情弹窗
    closeDetailPopup() {
      this.showDetailPopup = false;
      // 清空日志数据，释放内存
      this.logsList = [];
      this.logsLoading = false;
    },

    // 切换状态
    toggleStatus(item) {
      const newStatus = item.enabled == 1 ? 0 : 1;
      this.$u.api.agent.updateOutbetStatus({
        id: item.id,
        enabled: newStatus
      }).then(res => {
        if (res.status === 200 || res.code === 1) {
          item.enabled = newStatus;
          uni.showToast({
            title: newStatus == 1 ? '已启用' : '已停用',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: res.msg || '操作失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        uni.showToast({
          title: err.msg || '操作失败',
          icon: 'none'
        });
      });
    },

    // 删除配置
    deleteConfig(item) {
      this.toDeleteConfig = item;
      this.showDeleteDialog = true;
    },

    // 确认删除
    confirmDelete() {
      this.$u.api.agent.delOutbet({
        id: this.toDeleteConfig.id
      }).then(res => {
        if (res.status === 200 || res.code === 1) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });
          this.getOutbetList();
        } else {
          uni.showToast({
            title: res.msg || '删除失败',
            icon: 'none'
          });
        }
        this.showDeleteDialog = false;
      }).catch(err => {
        uni.showToast({
          title: err.msg || '删除失败',
          icon: 'none'
        });
        this.showDeleteDialog = false;
      });
    },

    // 申请试用
    applyTrial() {
      console.log('🎯 点击申请试用按钮');
      console.log('📊 当前配置信息:', this.configInfo);
      console.log('🔍 试用时间:', this.configInfo.outbet_sy_time);
      
      // 防止重复点击
      if (this.isProcessing) {
        console.log('⚠️ 正在处理中，忽略重复点击');
        return;
      }
      
      console.log('📱 显示试用确认弹窗...');
      this.showTrialDialog = true;
    },

    // 确认试用申请
    confirmTrialApplication() {
      console.log('✅ 用户确认试用申请');
      this.showTrialDialog = false;
      this.submitTrialApplication();
    },

    // 提交试用申请
    submitTrialApplication() {
      console.log('🚀 开始提交试用申请');
      this.isProcessing = true;
      uni.showLoading({title: '申请中...'});
      
      this.$u.api.agent.applyOutbet({type: 1}).then(res => {
        console.log('📡 申请响应:', res);
        uni.hideLoading();
        this.isProcessing = false;
        
        if (res.status === 200 || res.code === 1) {
          console.log('✅ 申请成功');
          // 使用原始代码的toast方法
          if (this.$u && this.$u.toast) {
            this.$u.toast('申请成功');
          } else {
            uni.showToast({
              title: '申请成功',
              icon: 'success'
            });
          }
          this.getConfigInfo();
        } else {
          console.log('❌ 申请失败:', res.msg);
          if (this.$u && this.$u.toast) {
            this.$u.toast(res.msg || '申请失败');
          } else {
            uni.showToast({
              title: res.msg || '申请失败',
              icon: 'none'
            });
          }
        }
      }).catch(err => {
        console.error('❌ 申请出错:', err);
        uni.hideLoading();
        this.isProcessing = false;
        
        if (this.$u && this.$u.toast) {
          this.$u.toast(err.msg || '申请失败');
        } else {
          uni.showToast({
            title: err.msg || '申请失败',
            icon: 'none'
          });
        }
      });
    },

    // 申请开通
    applyOpen(days) {
      console.log('🎯 点击申请开通按钮，天数:', days);
      console.log('📊 当前配置信息:', this.configInfo);
      
      // 防止重复点击
      if (this.isProcessing) {
        console.log('⚠️ 正在处理中，忽略重复点击');
        return;
      }
      
      this.openDays = days;
      this.openDuration = days === 1 ? '一天' : '一个月';
      this.openPrice = days === 1 ? this.configInfo.outbet_money1 : this.configInfo.outbet_money2;
      
      console.log('📱 显示开通确认弹窗...');
      this.showOpenDialog = true;
    },

    // 确认开通申请
    confirmOpenApplication() {
      console.log('✅ 用户确认开通申请');
      this.showOpenDialog = false;
      this.submitOpenApplication(this.openDays);
    },

    // 提交开通申请
    submitOpenApplication(days) {
      uni.showLoading({title: '开通中...'});
      
      this.$u.api.agent.applyOutbet({
        type: 2,
        days: days
      }).then(res => {
        uni.hideLoading();
        if (res.status === 200 || res.code === 1) {
          uni.showToast({
            title: '开通成功',
            icon: 'success'
          });
          this.getConfigInfo();
        } else {
          uni.showToast({
            title: res.msg || '开通失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        uni.hideLoading();
        uni.showToast({
          title: err.msg || '开通失败',
          icon: 'none'
        });
      });
    },

    // 获取类型标签
    getTypeLabel(type) {
      const typeMap = {
        1: 'A类盘口',
        2: 'B类盘口',
        3: 'C类盘口'
      };
      return typeMap[type] || '未知类型';
    },

    // 获取投注模式标签
    getBetModeLabel(mode) {
      const modeMap = {
        1: '普通模式',
        2: '高级模式',
        3: '专业模式'
      };
      return modeMap[mode] || '未知模式';
    },

    // 获取盈亏样式类
    getProfitClass(profit) {
      if (profit > 0) return 'profit-positive';
      if (profit < 0) return 'profit-negative';
      return 'profit-zero';
    },

    // 格式化过期时间
    formatExpiryTime() {
      // 如果过期时间为0，直接返回已过期
      if (!this.configInfo.outbet_overtime || this.configInfo.outbet_overtime == 0) {
        this.isExpired = true;
        return '已过期';
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= this.configInfo.outbet_overtime) {
        this.isExpired = true;
        return '已过期';
      }
      
      this.isExpired = false;
      const date = new Date(this.configInfo.outbet_overtime * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    // 更新剩余时间
    updateRemainingTime() {
      if (!this.configInfo.outbet_overtime || this.configInfo.outbet_overtime == 0) {
        this.remainingTimeText = '';
        return;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingSeconds = Math.max(0, this.configInfo.outbet_overtime - currentTime);
      
      if (remainingSeconds <= 0) {
        this.isExpired = true;
        this.remainingTimeText = '';
        return;
      }
      
      const days = Math.floor(remainingSeconds / (24 * 60 * 60));
      const hours = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
      
      if (days > 0) {
        this.remainingTimeText = `还剩${days}天`;
      } else if (hours > 0) {
        if (minutes > 0) {
          this.remainingTimeText = `还剩${hours}小时${minutes}分钟`;
        } else {
          this.remainingTimeText = `还剩${hours}小时`;
        }
      } else if (minutes > 0) {
        this.remainingTimeText = `还剩${minutes}分钟`;
      } else {
        this.remainingTimeText = '即将过期';
      }
    },

    // 加载日志数据
    loadLogs() {
      if (!this.currentConfig.id) {
        console.warn('⚠️ 无法加载日志：配置ID不存在');
        this.logsLoading = false;
        this.logsList = [];
        return;
      }

      this.logsLoading = true;
      console.log('📡 开始加载配置日志，配置ID:', this.currentConfig.id, '时间范围:', this.logTimeRange);
      console.log('📋 当前配置完整信息:', this.currentConfig);

      // 计算时间范围
      const now = new Date();
      const minutesAgo = parseInt(this.logTimeRange);
      
      let apiParams = {
        config_id: this.currentConfig.id,
        limit: 500  // 增加到500条，确保能显示更多历史日志
      };
      
      // 如果不是"全部"选项，则添加时间范围
      if (minutesAgo > 0) {
        const startTime = new Date(now.getTime() - minutesAgo * 60 * 1000);
        apiParams.start_time = startTime.toISOString();
        apiParams.end_time = now.toISOString();
      }
      
      // 添加日志类型筛选
      const selectedTypes = [];
      Object.keys(this.logTypeFilters).forEach(type => {
        if (this.logTypeFilters[type]) {
          selectedTypes.push(type);
        }
      });
      // 只有在不是全选的情况下才添加筛选参数
      if (selectedTypes.length > 0 && selectedTypes.length < Object.keys(this.logTypeFilters).length) {
        apiParams.log_types = selectedTypes;
      }
      // 如果全选或没选择，不传递log_types参数，让后端返回所有日志

      // 调用真实的日志API
      console.log('📤 发送API请求参数:', apiParams);
      console.log('🔐 当前用户认证信息:', {
        token: uni.getStorageSync('token'),
        user: uni.getStorageSync('user')
      });
      this.$u.api.agent.getOutbetLogs(apiParams).then(res => {
        console.log('📡 日志响应:', res);
        console.log('🔍 响应详细分析:', {
          status: res.status,
          dataLength: res.data ? res.data.length : 0,
          dataType: typeof res.data,
          firstItem: res.data && res.data.length > 0 ? res.data[0] : null
        });
        this.logsLoading = false;
        
        if (res.status === 200 || res.code === 1) {
          this.logsList = res.data || [];
          console.log('✅ 日志加载成功，共', this.logsList.length, '条记录');
          console.log('📋 前5条日志详情:');
          this.logsList.slice(0, 5).forEach((log, index) => {
            console.log(`  ${index + 1}. ID:${log.id} [${log.module || 'N/A'}] ${log.type}: ${log.message} (${log.create_time})`);
          });
          if (this.logsList.length > 5) {
            console.log(`  ... 还有 ${this.logsList.length - 5} 条日志`);
          }
        } else {
          console.warn('⚠️ 获取日志失败:', res.msg);
          this.logsList = [];
          uni.showToast({
            title: res.msg || '获取日志失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('❌ 获取日志出错:', err);
        this.logsLoading = false;
        this.logsList = [];
        uni.showToast({
          title: '获取日志失败',
          icon: 'none'
        });
      });
    },

    // 处理日志类型筛选变化
    onLogTypeChange(type, event) {
      this.logTypeFilters[type] = event.detail.value.length > 0;
      console.log('📋 日志类型筛选变化:', type, this.logTypeFilters[type]);
      // 自动重新加载日志
      this.loadLogs();
    },

    // 获取日志类型标签
    getLogTypeLabel(type) {
      const typeMap = {
        'login': '登录',
        'logout': '登出',
        'bet': '投注',
        'error': '错误',
        'info': '信息',
        'warning': '警告',
        'success': '成功'
      };
      return typeMap[type] || '未知';
    },

    // 获取日志类型样式类
    getLogTypeClass(type) {
      return `log-${type}`;
    },

    // 格式化日志时间
    formatLogTime(timeStr) {
      if (!timeStr) return '';
      
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) {
        return '刚刚';
      } else if (diffMins < 60) {
        return `${diffMins}分钟前`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return `${hours}小时前`;
      } else {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}-${day} ${hours}:${minutes}`;
      }
    },

    // 格式化日志数据
    formatLogData(dataStr) {
      if (!dataStr) return '';
      
      try {
        const data = JSON.parse(dataStr);
        return JSON.stringify(data, null, 2);
      } catch (e) {
        return dataStr;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.component-wrapper {
  height: 100%;
  width: 100%;
}

.outbet-config-container {
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  // 弹窗模式下的样式调整
  &.popup-mode {
    height: 100%;
    background: #f5f5f5;
  }
}

// 配置信息区域样式
.config-info-section {
  padding: 20rpx;
  background: #f5f5f5;
  flex-shrink: 0; // 在弹窗模式下不缩小
  
  // 弹窗模式下保持精致设计，适当缩小
  .popup-mode & {
    padding: 15rpx; // 从20rpx缩小
    flex: 0 0 auto;
  }
  
  .config-info-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 6rpx 28rpx rgba(102, 126, 234, 0.25);
    color: #fff;
    
    .config-header-info {
      padding: 20rpx 25rpx;
      
      .config-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .title-text {
          font-size: 30rpx;
          font-weight: bold;
          color: #fff;
        }
        
        .switch-status {
          padding: 8rpx 20rpx;
          border-radius: 30rpx;
          font-size: 28rpx;
          font-weight: 500;
          border: 2rpx solid rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
          user-select: none;
          display: flex;
          align-items: center;
          gap: 8rpx;
          
          &:hover {
            transform: scale(1.05);
            box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.6);
          }
          
          &:active {
            transform: scale(0.95);
          }
          
          .switch-icon {
            font-size: 24rpx;
            filter: grayscale(1) brightness(10);
          }
          
          .switch-text {
            font-weight: 600;
          }
          
          .click-hint {
            font-size: 24rpx;
            opacity: 0.7;
            margin-left: 4rpx;
          }
          
          &.switch-on {
            background: rgba(40, 167, 69, 0.25);
            color: #90EE90;
            border-color: #90EE90;
            
            &:hover {
              background: rgba(40, 167, 69, 0.35);
              box-shadow: 0 6rpx 20rpx rgba(40, 167, 69, 0.4);
            }
            
            .switch-icon {
              color: #90EE90;
            }
          }
          
          &.switch-off {
            background: rgba(220, 53, 69, 0.25);
            color: #FFB6C1;
            border-color: #FFB6C1;
            
            &:hover {
              background: rgba(220, 53, 69, 0.35);
              box-shadow: 0 6rpx 20rpx rgba(220, 53, 69, 0.4);
            }
            
            .switch-icon {
              color: #FFB6C1;
            }
          }
        }
      }
    }
    
    .config-content {
      padding: 0 25rpx 20rpx;
      
      .config-item {
        margin-bottom: 15rpx;
        padding: 15rpx;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12rpx;
        backdrop-filter: blur(10rpx);
        
        &:last-child {
          margin-bottom: 0;
        }
        
        &.dual-layout {
          display: flex;
          gap: 20rpx;
        }
        
        .left-section, .right-section {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        .left-section {
          border-right: 1rpx solid rgba(255, 255, 255, 0.15);
          padding-right: 20rpx;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 8rpx;
          
          .item-icon {
            font-size: 20rpx;
            margin-right: 8rpx;
            filter: grayscale(1) brightness(10);
          }
          
          .section-title {
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.9);
            font-weight: 600;
          }
        }
        
        .time-content, .price-content {
          padding-left: 44rpx;
          
          .time-text {
            font-size: 26rpx;
            font-weight: bold;
            display: block;
            margin-bottom: 8rpx;
            
            &.valid {
              color: #4CAF50;
            }
            
            &.expired {
              color: #f44336;
            }
          }
          
          .remaining-days {
            font-size: 28rpx;
            color: rgba(255, 255, 255, 0.7);
            padding: 8rpx 8rpx;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10rpx;
          }
        }
        
        .trial-content {
          display: flex;
          flex-direction: column;
          
          .trial-info {
            font-size: 22rpx;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1.6;
            background: rgba(255, 255, 255, 0.1);
            padding: 12rpx 16rpx;
            border-radius: 10rpx;
            border: 1rpx solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5rpx);
          }
        }
        
        .price-content {
          display: flex;
          flex-direction: column;
          gap: 8rpx;
          
          .price-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6rpx 12rpx;
            background: linear-gradient(45deg, rgba(255, 215, 0, 0.15), rgba(255, 193, 7, 0.15));
            border: 1rpx solid rgba(255, 215, 0, 0.3);
            border-radius: 8rpx;
            
            .price-label {
              font-size: 20rpx;
              color: rgba(255, 255, 255, 0.8);
            }
            
            .price-value {
              font-size: 20rpx;
              color: #FFD700;
              font-weight: 600;
            }
          }
        }
        
        .trial-buttons, .open-buttons {
          display: flex;
          flex-direction: column;
          gap: 8rpx;
          
          .apply-btn {
            padding: 8rpx 12rpx;
            border-radius: 16rpx;
            border: 2rpx solid rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            
            &::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left 0.5s;
            }
            
            &:hover {
              transform: translateY(-1rpx);
              box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.3);
              
              &::before {
                left: 100%;
              }
            }
            
            &:active {
              transform: translateY(0);
            }
            
            &.trial-btn {
              background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
              box-shadow: 0 3rpx 12rpx rgba(255, 107, 107, 0.4);
              
              &:hover {
                background: linear-gradient(135deg, #FF5252, #FF7A7A);
                box-shadow: 0 5rpx 20rpx rgba(255, 107, 107, 0.5);
              }
            }
            
            &.open-btn {
              background: linear-gradient(135deg, #4CAF50, #66BB6A);
              box-shadow: 0 3rpx 12rpx rgba(76, 175, 80, 0.4);
              
              &:hover {
                background: linear-gradient(135deg, #388E3C, #4CAF50);
                box-shadow: 0 5rpx 20rpx rgba(76, 175, 80, 0.5);
              }
            }
            
            &.open-btn-month {
              background: linear-gradient(135deg, #2196F3, #42A5F5);
              box-shadow: 0 3rpx 12rpx rgba(33, 150, 243, 0.4);
              
              &:hover {
                background: linear-gradient(135deg, #1976D2, #2196F3);
                box-shadow: 0 5rpx 20rpx rgba(33, 150, 243, 0.5);
              }
            }
            
            .apply-text {
              font-size: 20rpx;
              font-weight: 600;
              color: #fff;
              text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
              text-align: center;
              white-space: nowrap;
            }
          }
        }
        
        .description-content {
          padding-left: 44rpx;
          
          .description-text {
            font-size: 26rpx;
            color: #666;
            line-height: 1.6;
          }
        }
      }
    }
  }
}

// 配置列表样式
.config-list {
  padding: 15rpx;
  flex: 1; // 占据剩余所有空间
  overflow-y: auto; // 允许垂直滚动
  background: #f5f5f5;
  
  // 弹窗模式下的样式调整
  .popup-mode & {
    padding: 10rpx;
  }
  
  .empty-state {
    padding: 100rpx 20rpx;
    text-align: center;
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
    }
  }
  
  .config-item {
    background: white;
    border-radius: 12rpx;
    margin-bottom: 15rpx;
    padding: 15rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    
    // 确保item能完整显示所有内容
    height: auto;
    overflow: visible;
    
    .config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8rpx;
      padding-bottom: 8rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      .config-name {
        display: flex;
        align-items: center;
        
        .name-text {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
          margin-right: 12rpx;
        }
        
        .status-badge {
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          font-size: 20rpx;
          font-weight: bold;
          
          &.status-enabled {
            background: #e8f5e8;
            color: #4CAF50;
          }
          
          &.status-disabled {
            background: #ffeaea;
            color: #f44336;
          }
        }
      }
      
      .config-type {
        font-size: 20rpx;
        color: #666;
        background: #f5f5f5;
        padding: 6rpx 10rpx;
        border-radius: 6rpx;
      }
    }
    
    .config-details {
      margin-bottom: 12rpx;
      padding: 12rpx;
      background: #f8f9fa;
      border-radius: 12rpx;
      border: 1rpx solid #e9ecef;
      
      // 使用网格布局让数据更紧凑
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6rpx 12rpx;
      
      // 确保内容完整显示，不被截断
      height: auto;
      overflow: visible;
      
      .detail-row {
        display: flex;
        align-items: center;
        min-height: 24rpx;
        padding: 2rpx 0;
        
        // 让某些行占据整行宽度（如游戏、网址等长文本）
        &.full-width {
          grid-column: 1 / -1;
        }
        
        .label {
          font-size: 20rpx;
          color: #666;
          width: 100rpx;
          flex-shrink: 0;
          font-weight: 500;
        }
        
        .value {
          font-size: 20rpx;
          color: #333;
          flex: 1;
          word-wrap: break-word;
          overflow-wrap: break-word;
          
          &.account-info {
            font-weight: bold;
          }
          
          &.game-names, &.url-names {
            font-size: 20rpx;
            line-height: 1.4;
            word-break: break-all;
            white-space: normal;
          }
        }
        
        .online-status {
          padding: 2rpx 8rpx;
          border-radius: 8rpx;
          font-size: 20rpx;
          font-weight: bold;
          
          &.online {
            background: #e8f5e8;
            color: #4CAF50;
          }
          
          &.offline {
            background: #ffeaea;
            color: #f44336;
          }
        }
        
        .profit-positive {
          color: #4CAF50;
          font-weight: bold;
        }
        
        .profit-negative {
          color: #f44336;
          font-weight: bold;
        }
        
        .profit-zero {
          color: #666;
        }
      }
    }
    
    .config-actions {
      display: flex;
      gap: 8rpx;
      flex-wrap: nowrap; // 不换行，4个按钮在一行显示
      padding: 0;
      margin-top: 8rpx;
      
      // 让按钮更紧凑，4个按钮平均分布在一行
      ::v-deep .u-button {
        flex: 1;
        min-width: 0 !important;
        height: 54rpx !important;
        font-size: 22rpx !important;
        padding: 0 6rpx !important;
        border-radius: 6rpx !important;
      }
    }
  }
}

// 详情弹窗样式
.detail-popup {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40rpx 30rpx;
    background: #fff;
    border-bottom: 1rpx solid #e9ecef;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
    
    .header-left, .header-right {
      width: 120rpx;
    }
    
    .close-btn, .edit-btn {
      font-size: 28rpx;
      color: #007aff;
      cursor: pointer;
    }
    
    .header-center {
      flex: 1;
      text-align: center;
      
      .popup-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
      }
      
      .scroll-tip {
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
        display: block;
      }
    }
  }
  
  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx;
    
    .config-summary {
      background: white;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
      text-align: center;
      
      .config-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .config-details {
        font-size: 24rpx;
        color: #666;
        display: block;
      }
    }
    
    .detail-section {
      background: white;
      border-radius: 12rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .section-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
        padding-bottom: 12rpx;
        border-bottom: 1rpx solid #f0f0f0;
      }
      
      .detail-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .item-label {
          font-size: 26rpx;
          color: #666;
          width: 160rpx;
          flex-shrink: 0;
        }
        
        .item-value {
          font-size: 26rpx;
          color: #333;
          flex: 1;
          text-align: right;
          
          &.account-info {
            font-weight: bold;
          }
          
          &.url-text {
            font-size: 24rpx;
            line-height: 1.4;
            word-break: break-all;
          }
        }
        
        .online-status, .status-badge {
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          font-size: 22rpx;
          font-weight: bold;
        }
        
        .online-status {
          &.online {
            background: #e8f5e8;
            color: #4CAF50;
          }
          
          &.offline {
            background: #ffeaea;
            color: #f44336;
          }
        }
        
        .status-badge {
          &.status-enabled {
            background: #e8f5e8;
            color: #4CAF50;
          }
          
          &.status-disabled {
            background: #ffeaea;
            color: #f44336;
          }
        }
        
        .profit-positive {
          color: #4CAF50;
        }
        
        .profit-negative {
          color: #f44336;
        }
        
        .profit-zero {
          color: #666;
        }
      }
    }
  }
}

// 日志相关样式
.log-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
  
  .time-filter {
    display: flex;
    align-items: center;
    
    .filter-label {
      font-size: 24rpx;
      color: #666;
      margin-right: 10rpx;
    }
    
    .time-select {
      padding: 6rpx 12rpx;
      border: 1rpx solid #ddd;
      border-radius: 6rpx;
      font-size: 24rpx;
      background: white;
      color: #333;
    }
  }
  
  .refresh-btn {
    display: flex;
    align-items: center;
    padding: 6rpx 12rpx;
    background: #007aff;
    border-radius: 6rpx;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #0056cc;
    }
    
    .refresh-icon {
      font-size: 20rpx;
      margin-right: 4rpx;
    }
    
    .refresh-text {
      font-size: 24rpx;
      color: white;
    }
  }
}

.log-loading {
  text-align: center;
  padding: 40rpx 20rpx;
  
  .loading-text {
    font-size: 26rpx;
    color: #999;
  }
}

// 日志类型筛选样式
.log-type-filter {
  margin: 16rpx 0;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  
  .filter-title {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 12rpx;
    display: block;
  }
  
  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    
    .checkbox-item {
      display: flex;
      align-items: center;
      padding: 6rpx 12rpx;
      background: white;
      border-radius: 16rpx;
      border: 1rpx solid #e0e0e0;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #007aff;
        background: #f0f8ff;
      }
      
      checkbox {
        margin-right: 6rpx;
        transform: scale(0.8);
      }
      
      .checkbox-label {
        font-size: 22rpx;
        color: #333;
        white-space: nowrap;
      }
    }
  }
}

.logs-container {
  max-height: 60vh;
  overflow-y: auto;
  
  .log-item {
    background: #f8f9fa;
    border-radius: 8rpx;
    padding: 16rpx;
    margin-bottom: 12rpx;
    border-left: 4rpx solid #ddd;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8rpx;
      
      .log-type {
        font-size: 24rpx;
        font-weight: bold;
        padding: 4rpx 8rpx;
        border-radius: 4rpx;
        color: white;
      }
      
      .log-time {
        font-size: 22rpx;
        color: #999;
      }
    }
    
    .log-content {
      margin-bottom: 8rpx;
      
      .log-message {
        font-size: 26rpx;
        color: #333;
        line-height: 1.4;
      }
    }
    
    .log-data {
      margin-bottom: 8rpx;
      
      .data-label {
        font-size: 22rpx;
        color: #666;
        font-weight: bold;
      }
      
      .data-content {
        font-size: 22rpx;
        color: #333;
        background: #e9ecef;
        padding: 8rpx;
        border-radius: 4rpx;
        display: block;
        margin-top: 4rpx;
        font-family: monospace;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
    
    .log-error {
      .error-label {
        font-size: 22rpx;
        color: #dc3545;
        font-weight: bold;
      }
      
      .error-content {
        font-size: 22rpx;
        color: #dc3545;
        background: #f8d7da;
        padding: 8rpx;
        border-radius: 4rpx;
        display: block;
        margin-top: 4rpx;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
    
    // 不同日志类型的样式
    &.log-login {
      border-left-color: #28a745;
      
      .log-type {
        background: #28a745;
      }
    }
    
    &.log-logout {
      border-left-color: #6c757d;
      
      .log-type {
        background: #6c757d;
      }
    }
    
    &.log-bet {
      border-left-color: #007bff;
      
      .log-type {
        background: #007bff;
      }
    }
    
    &.log-error {
      border-left-color: #dc3545;
      
      .log-type {
        background: #dc3545;
      }
    }
    
    &.log-info {
      border-left-color: #17a2b8;
      
      .log-type {
        background: #17a2b8;
      }
    }
    
    &.log-warning {
      border-left-color: #ffc107;
      
      .log-type {
        background: #ffc107;
        color: #333;
      }
    }
    
    &.log-success {
      border-left-color: #28a745;
      
      .log-type {
        background: #28a745;
      }
    }
  }
}

.no-logs {
  text-align: center;
  padding: 40rpx 20rpx;
  
  .no-logs-text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>