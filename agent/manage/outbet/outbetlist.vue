<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="打单配置列表">
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
              <view v-if="configInfo.outbet_sy_count > 0" class="config-item dual-layout">
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

        <!-- <view style="padding: 30rpx;background: #fff;">
          <u-search @custom="search" :showAction="true" v-model="query.keyword" :clearabled="true" bgColor="#f5f9ff" placeholder="请输入配置名称/盘口账号" shape="square" @search="search"></u-search>
        </view> -->
      </template>
      
      <!-- 配置列表 -->
      <view class="config-list">
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
            <view class="detail-row">
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
            <view class="detail-row" v-if="item.gidsname">
              <text class="label">游戏：</text>
              <text class="value game-names">{{ item.gidsname }}</text>
            </view>
            <view class="detail-row" v-if="item.urls">
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
    </z-paging>

    <!-- 配置详情弹窗 -->
    <u-popup :show="showDetailPopup" mode="bottom" height="600rpx" :border-radius="20" @close="showDetailPopup = false" :safe-area-inset-bottom="true">
      <view class="detail-popup">
        <view class="popup-header">
          <view class="header-left">
            <text @click="showDetailPopup = false" class="close-btn">关闭</text>
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
          <view class="detail-section">
            <view class="section-title">基本信息</view>
            <view class="detail-item">
              <text class="item-label">配置名称</text>
              <text class="item-value">{{ currentConfig.name }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">盘口类型</text>
              <text class="item-value">{{ getTypeLabel(currentConfig.type) }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">盘口账号</text>
              <text class="item-value">{{ currentConfig.username }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">在线状态</text>
              <view class="online-status" :class="currentConfig.online == 1 ? 'online' : 'offline'">
                {{ currentConfig.online == 1 ? '在线' : '离线' }}
              </view>
            </view>
            <view class="detail-item">
              <text class="item-label">启用状态</text>
              <view class="status-badge" :class="currentConfig.enabled == 1 ? 'status-enabled' : 'status-disabled'">
                {{ currentConfig.enabled == 1 ? '启用' : '禁用' }}
              </view>
            </view>
          </view>
          
          <view class="detail-section">
            <view class="section-title">账户信息</view>
            <view class="detail-item">
              <text class="item-label">余额/未结/盈亏</text>
              <text class="item-value account-info">
                {{ currentConfig.balance || '0' }}/{{ currentConfig.unsettle || '0' }}/<text :class="getProfitClass(currentConfig.sy)">{{ currentConfig.sy || '0' }}</text>
              </text>
            </view>
          </view>
          
          <view class="detail-section">
            <view class="section-title">投注设置</view>
            <view class="detail-item">
              <text class="item-label">投注模式</text>
              <text class="item-value">{{ getBetModeLabel(currentConfig.bet_mode) }}</text>
            </view>
            <view class="detail-item">
              <text class="item-label">合并去重</text>
              <text class="item-value">{{ currentConfig.is_hebing == 1 ? '是' : '否' }}</text>
            </view>
            <view class="detail-item" v-if="currentConfig.start_money > 0">
              <text class="item-label">起飞金额</text>
              <text class="item-value">{{ currentConfig.start_money }}元</text>
            </view>
            <view class="detail-item" v-if="currentConfig.chai_money > 0">
              <text class="item-label">大额分投</text>
              <text class="item-value">{{ currentConfig.chai_money }}元</text>
            </view>
          </view>
          
          <view class="detail-section" v-if="currentConfig.gidsname">
            <view class="section-title">游戏设置</view>
            <view class="detail-item">
              <text class="item-label">打单游戏</text>
              <text class="item-value">{{ currentConfig.gidsname }}</text>
            </view>
          </view>
          
          <view class="detail-section" v-if="currentConfig.zhidingusernames">
            <view class="section-title">会员设置</view>
            <view class="detail-item">
              <text class="item-label">指定会员</text>
              <text class="item-value">{{ currentConfig.zhidingusernames }}</text>
            </view>
          </view>
          
          <view class="detail-section" v-if="currentConfig.urls">
            <view class="section-title">网址配置</view>
            <view class="detail-item">
              <text class="item-label">相关网址</text>
              <text class="item-value url-text">{{ currentConfig.urls }}</text>
            </view>
          </view>
          
          <view class="detail-section">
            <view class="section-title">时间信息</view>
            <view class="detail-item" v-if="currentConfig.create_time">
              <text class="item-label">创建时间</text>
              <text class="item-value">{{ currentConfig.create_time }}</text>
            </view>
            <view class="detail-item" v-if="currentConfig.update_time">
              <text class="item-label">更新时间</text>
              <text class="item-value">{{ currentConfig.update_time }}</text>
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
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      list:[],
      backUrl:"agent/manage/outbetmanage",
      query:{
        keyword:''
      },
      betModeMap: {
        1: '服务器投注',
        2: 'API投注', 
        3: '软件投注'
      },
      typeMap: {
        'daji': '大吉',
        'sgwin': 'SGWIN'
      },
      showDetailPopup: false,
      showDeleteDialog: false,
      currentConfig: {},
      toDeleteConfig: {},
      // 配置信息
      configInfo: {
        outbet_overtime: 0, // 过期时间（秒）
        outbet_switch: 0,   // 打单总开关
        outbet_sy_count: 0, // 每天试用次数
        outbet_sy_time: 0,  // 每次试用时间（分钟）
        outbet_money: 0,    // 开通价格（旧字段，保持兼容）
        outbet_money1: 0,   // 一天的价格
        outbet_money2: 0    // 一个月的价格
      }
    };
  },
  onShow() {
    // 页面显示时刷新数据，确保从添加/编辑页面返回时数据是最新的
    this.getConfigInfo(); // 刷新配置信息
    if (this.$refs.paging) {
      this.$refs.paging.reload();
    }
  },
  
  mounted() {
    // 获取配置信息
    this.getConfigInfo();
  },
  
  computed: {
    // 是否已过期
    isExpired() {
      // 如果过期时间为0或者空，直接返回已过期
      if (!this.configInfo.outbet_overtime || this.configInfo.outbet_overtime == 0) return true;
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime >= this.configInfo.outbet_overtime;
    },
    
    // 剩余时间秒数
    remainingSeconds() {
      if (!this.configInfo.outbet_overtime || this.configInfo.outbet_overtime == 0 || this.isExpired) return 0;
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, this.configInfo.outbet_overtime - currentTime);
    },
    
    // 剩余天数（保持兼容性）
    remainingDays() {
      return Math.ceil(this.remainingSeconds / (24 * 60 * 60));
    },
    
    // 格式化剩余时间显示
    remainingTimeText() {
      if (this.remainingSeconds <= 0) return '';
      
      const days = Math.floor(this.remainingSeconds / (24 * 60 * 60));
      const hours = Math.floor((this.remainingSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((this.remainingSeconds % (60 * 60)) / 60);
      
      if (days > 0) {
        return `还剩${days}天`;
      } else if (hours > 0) {
        if (minutes > 0) {
          return `还剩${hours}小时${minutes}分钟`;
        } else {
          return `还剩${hours}小时`;
        }
      } else if (minutes > 0) {
        return `还剩${minutes}分钟`;
      } else {
        return '即将过期';
      }
    }
  },
  methods: {
    // 获取配置信息
    getConfigInfo() {
      this.$u.api.agent.getOutbetConfig().then(res => {
        this.configInfo = {
          outbet_overtime: res.data.outbet_overtime || 0,
          outbet_switch: res.data.outbet_switch || 0,
          outbet_sy_count: res.data.outbet_sy_count || 0,
          outbet_sy_time: res.data.outbet_sy_time || 0,
          outbet_money: res.data.outbet_money || 0,
          outbet_money1: res.data.outbet_money1 || 0,
          outbet_money2: res.data.outbet_money2 || 0
        };
      }).catch(err => {
        console.error('获取配置信息失败:', err);
      });
    },
    
    // 格式化过期时间
    formatExpiryTime() {
      // 如果过期时间为0，直接返回已过期
      if (!this.configInfo.outbet_overtime || this.configInfo.outbet_overtime == 0) {
        return '已过期';
      }
      
      if (this.isExpired) {
        return '已过期';
      }
      
      const date = new Date(this.configInfo.outbet_overtime * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },
    
    // 切换总开关
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
        this.$u.toast(newStatus == 1 ? '开启成功' : '关闭成功');
        // 更新本地状态
        this.configInfo.outbet_switch = newStatus;
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '操作失败');
      });
    },
    
    // 申请试用
    applyTrial() {
      uni.showModal({
        title: '确认申请',
        content: `确定要申请试用打单功能吗？\n每次可试用${this.configInfo.outbet_sy_time}分钟`,
        success: (res) => {
          if (res.confirm) {
            this.submitTrialApplication();
          }
        }
      });
    },
    
    // 提交试用申请
    submitTrialApplication() {
      uni.showLoading({title: '申请中...'});
      
      this.$u.api.agent.applyOutbet({type: 1}).then(res => {
        uni.hideLoading();
        this.$u.toast('申请成功');
        // 申请成功后刷新配置信息
        this.getConfigInfo();
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '申请失败');
      });
    },
    
    // 申请立即开通
    applyOpen(days) {
      const duration = days === 1 ? '一天' : '一个月';
      const price = days === 1 ? this.configInfo.outbet_money1 : this.configInfo.outbet_money2;
      
      uni.showModal({
        title: '确认开通',
        content: `确定要开通${duration}的打单功能吗？\n费用：${price}百胜币`,
        success: (res) => {
          if (res.confirm) {
            this.submitOpenApplication(days);
          }
        }
      });
    },
    
    // 提交开通申请
    submitOpenApplication(days) {
      uni.showLoading({title: '开通中...'});
      
      this.$u.api.agent.applyOutbet({
        type: 2,
        days: days
      }).then(res => {
        uni.hideLoading();
        const duration = days === 1 ? '一天' : '一个月';
        this.$u.toast(`开通${duration}成功`);
        // 开通成功后刷新配置信息
        this.getConfigInfo();
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '开通失败');
      });
    },
    
    // 跳转到添加配置页面
    goToAddConfig(){
      uni.$utils.jump("agent/manage/outbet/addconfig");
    },
    
    // 获取类型标签
    getTypeLabel(type) {
      return this.typeMap[type] || type;
    },
    
    // 获取投注模式标签
    getBetModeLabel(mode) {
      return this.betModeMap[mode] || mode;
    },
    
    // 获取盈亏样式类
    getProfitClass(value) {
      const num = parseFloat(value || 0);
      if (num > 0) return 'profit';
      if (num < 0) return 'loss';
      return 'zero';
    },
    
    // 切换启用/停用状态
    toggleStatus(item) {
      const action = item.enabled == 1 ? '停用' : '启用';
      uni.showModal({
        title: '确认操作',
        content: `确定要${action}配置「${item.name}」吗？`,
        success: (res) => {
          if (res.confirm) {
            this.updateConfigStatus(item);
          }
        }
      });
    },
    
    // 更新配置状态
    updateConfigStatus(item) {
      uni.showLoading({title: '操作中...'});
      const params = {
        id: item.id,
        enabled: item.enabled == 1 ? 0 : 1
      };
      
      this.$u.api.agent.updateOutbetStatus(params).then(res => {
        uni.hideLoading();
        this.$u.toast(item.enabled == 1 ? '停用成功' : '启用成功');
        // 更新本地数据状态
        item.enabled = params.enabled;
        // 如果当前正在查看该配置的详情，也要更新
        if (this.currentConfig.id === item.id) {
          this.currentConfig.enabled = params.enabled;
        }
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '操作失败');
      });
    },
    
    // 查看配置详情
    viewConfig(item) {
      this.currentConfig = item;
      this.showDetailPopup = true;
    },
    
    // 编辑配置
    editConfig(item) {
      // 优先使用URL参数传递，兼容存储方式
      uni.$utils.jump("agent/manage/outbet/addconfig?id=" + item.id);
    },
    
    // 编辑当前查看的配置（弹窗中）
    editCurrentConfig() {
      this.showDetailPopup = false;
      this.editConfig(this.currentConfig);
    },
    
    // 删除配置
    deleteConfig(item) {
      this.toDeleteConfig = item;
      this.showDeleteDialog = true;
    },
    
    // 确认删除
    confirmDelete() {
      uni.showLoading({title:'删除中...'});
      this.$u.api.agent.delOutbet({id: this.toDeleteConfig.id}).then(res => {
        uni.hideLoading();
        this.$u.toast('删除成功');
        this.showDeleteDialog = false;
        this.$refs.paging.reload();
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '删除失败');
      });
    },
    

    
    // 搜索
    search(){
      this.$refs.paging.reload();
    },
    
    // 查询列表数据
    queryList(page, pageSize) {
      const params = {
        page: page,
        pageSize: pageSize,
        keyword: this.query.keyword
      };
      
      this.$u.api.agent.getOutbetList(params).then(res => {
        this.$refs.paging.complete(res.data.records || res.data.list || []);
      }).catch(res => {
        this.$refs.paging.complete(false);
      })
    },
  }
}
</script>

<style lang="scss" scoped>
.layout{
  height: 100%;
  width: 100%;
  background-color: #f1f1f1;
  display: flex;
  flex-direction: column;
}

.config-list {
  padding: 20rpx;
  
  .config-item {
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.1);
    
    .config-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 2rpx solid #e9ecef;
      
      .config-name {
        display: flex;
        align-items: center;
        flex: 1;
        
        .name-text {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
          margin-right: 20rpx;
        }
        
        .status-badge {
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          font-size: 22rpx;
          font-weight: 500;
          
          &.status-enabled {
            background: #e8f5e8;
            color: #28a745;
            border: 2rpx solid #28a745;
          }
          
          &.status-disabled {
            background: #ffe1e1;
            color: #dc3545;
            border: 2rpx solid #dc3545;
          }
        }
        
        .online-status {
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          font-size: 22rpx;
          font-weight: 500;
          
          &.online {
            background: #e8f5e8;
            color: #28a745;
            border: 2rpx solid #28a745;
          }
          
          &.offline {
            background: #ffe1e1;
            color: #dc3545;
            border: 2rpx solid #dc3545;
          }
        }
      }
      
      .config-type {
        background: #e3f2fd;
        color: #0087B4;
        padding: 8rpx 16rpx;
        border-radius: 16rpx;
        font-size: 28rpx;
        font-weight: 500;
      }
    }
    
    .config-details {
      padding: 30rpx;
      
      .detail-row {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          color: #666;
          font-size: 26rpx;
          min-width: 180rpx;
          flex-shrink: 0;
          text-align: right;
          padding-right: 20rpx;
        }
        
        .value {
          color: #333;
          font-size: 26rpx;
          flex: 1;
          word-break: break-all;
          
          &.game-names, &.url-names {
            background: #f8f9fa;
            padding: 8rpx 12rpx;
            border-radius: 8rpx;
            color: #0087B4;
            word-break: break-all;
          }
          
          &.money-value {
            font-weight: 500;
            
            &.profit {
              color: #28a745;
            }
            
            &.loss {
              color: #dc3545;
            }
          }
          
          &.account-info {
            font-weight: 500;
            font-family: 'Arial', monospace;
            
            .profit {
              color: #28a745;
            }
            
            .loss {
              color: #dc3545;
            }
            
            .zero {
              color: #333;
            }
          }
          
          &.account-info {
            font-weight: 500;
            font-family: 'Arial', monospace;
            
            .profit {
              color: #28a745;
            }
            
            .loss {
              color: #dc3545;
            }
            
            .zero {
              color: #333;
            }
          }
        }
        
        .online-status {
          padding: 6rpx 12rpx;
          border-radius: 16rpx;
          font-size: 22rpx;
          font-weight: 500;
          display: inline-block;
          
          &.online {
            background: #e8f5e8;
            color: #28a745;
            border: 2rpx solid #28a745;
          }
          
          &.offline {
            background: #ffe1e1;
            color: #dc3545;
            border: 2rpx solid #dc3545;
          }
        }
      }
    }
    
    .config-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 20rpx 30rpx;
      background: #f8f9fa;
      gap: 12rpx;
    }
  }
}

.detail-popup {
  height: 600rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 20rpx 20rpx 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background: #fff;
    border-bottom: 2rpx solid #f0f0f0;
    flex-shrink: 0;

    .header-left, .header-right {
      flex: 1;
    }

    .header-right {
      text-align: right;
    }

    .header-center {
      flex: 2;
      text-align: center;
      
      .popup-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 5rpx;
      }
      
      .scroll-tip {
        font-size: 28rpx;
        color: #999;
        display: block;
      }
    }

    .close-btn {
      color: #666;
      font-size: 30rpx;
      padding: 10rpx;
    }

    .edit-btn {
      color: #0087B4;
      font-size: 30rpx;
      font-weight: bold;
      padding: 10rpx;
    }
  }
  
  .detail-content {
    flex: 1;
    padding: 20rpx;
    overflow-y: auto;
    height: 0;
    
    // 优化滚动条样式
    &::-webkit-scrollbar {
      width: 8rpx;
    }
    
    &::-webkit-scrollbar-track {
      background: #f8f9fa;
      border-radius: 10rpx;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #0087B4;
      border-radius: 10rpx;
      
      &:hover {
        background: #006a8e;
      }
    }
    
    .detail-section {
      margin-bottom: 40rpx;
      
      .section-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 20rpx;
        padding-bottom: 10rpx;
        border-bottom: 2rpx solid #e9ecef;
      }
      
      .detail-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 20rpx 0;
        border-bottom: 1rpx solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .item-label {
          color: #666;
          font-size: 28rpx;
          min-width: 200rpx;
          flex-shrink: 0;
          text-align: right;
          padding-right: 30rpx;
        }
        
        .item-value {
          color: #333;
          font-size: 28rpx;
          flex: 1;
          text-align: right;
          word-break: break-all;
          
          &.url-text {
            text-align: left;
            background: #f8f9fa;
            padding: 15rpx 20rpx;
            margin-right: 20rpx;
            border-radius: 8rpx;
            white-space: pre-wrap;
            word-break: break-all;
          }
          
          &.money-value {
            font-weight: 500;
            
            &.profit {
              color: #28a745;
            }
            
            &.loss {
              color: #dc3545;
            }
          }
        }
        
        .status-badge {
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          font-size: 28rpx;
          font-weight: 500;
          
          &.status-enabled {
            background: #e8f5e8;
            color: #28a745;
            border: 2rpx solid #28a745;
          }
          
          &.status-disabled {
            background: #ffe1e1;
            color: #dc3545;
            border: 2rpx solid #dc3545;
          }
        }
      }
    }
  }
}

/* 配置信息展示区域样式 */
.config-info-section {
  padding: 15rpx;
  background: #f1f1f1;
  
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
          position: relative;
          overflow: hidden;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            transform: translateX(-100%);
            transition: transform 0.6s;
          }
          
          &:hover {
            transform: scale(1.05);
            box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.6);
            
            &::before {
              transform: translateX(100%);
            }
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
          
          .left-section, .right-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            
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
          }
          
          .left-section {
            border-right: 1rpx solid rgba(255, 255, 255, 0.15);
            padding-right: 20rpx;
            
            .time-content {
              display: flex;
              flex-direction: column;
              gap: 8rpx;
              
              .time-text {
                font-size: 28rpx;
                font-weight: 500;
                
                &.valid {
                  color: #90EE90;
                }
                
                &.expired {
                  color: #FFB6C1;
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
          }
          
          .right-section {
            .price-content {
              display: flex;
              flex-direction: column;
              gap: 8rpx;
            }
            
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
            
            .trial-buttons {
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
          }
        }
      }
    }
  }
}



</style>
