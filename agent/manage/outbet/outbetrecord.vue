<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="打单记录">
        </TsCustom>

        <!-- 搜索条件 -->
        <view class="search-container">
          <view class="search-form">
            <!-- 第一行：日期和游戏 -->
            <view class="form-row">
              <view class="form-item">
                <view class="form-label">
                  <text>选择日期</text>
                </view>
                <picker mode="date" :value="query.date" @change="onDateChange">
                  <view class="form-input">
                    <text class="input-text">{{ dateDisplay || '请选择日期' }}</text>
                    <u-icon name="calendar" size="24" color="#999"></u-icon>
                  </view>
                </picker>
              </view>
              
              <view class="form-item">
                <view class="form-label">
                  <text>选择游戏</text>
                </view>
                <picker mode="selector" :range="gameOptions" range-key="name" @change="onGameChange">
                  <view class="form-input">
                    <text class="input-text">{{ gameDisplay }}</text>
                    <u-icon name="arrow-down" size="24" color="#999"></u-icon>
                  </view>
                </picker>
              </view>
            </view>
            
            <!-- 第二行：期数和站点 -->
            <view class="form-row">
              <view class="form-item">
                <view class="form-label">
                  <text>期数</text>
                </view>
                <input 
                  class="form-input input-field" 
                  v-model="query.qishu" 
                  placeholder="请输入期数"
                  type="text"
                />
              </view>
              
              <view class="form-item">
                <view class="form-label">
                  <text>所属站点</text>
                </view>
                <picker mode="selector" :range="siteOptions" range-key="name" @change="onSiteChange">
                  <view class="form-input">
                    <text class="input-text">{{ siteDisplay }}</text>
                    <u-icon name="arrow-down" size="24" color="#999"></u-icon>
                  </view>
                </picker>
              </view>
            </view>
            
            <!-- 第三行：状态和按钮 -->
            <view class="form-row">
              <view class="form-item">
                <view class="form-label">
                  <text>订单状态</text>
                </view>
                <picker mode="selector" :range="statusOptions" range-key="name" @change="onStatusChange">
                  <view class="form-input">
                    <text class="input-text">{{ statusDisplay }}</text>
                    <u-icon name="arrow-down" size="24" color="#999"></u-icon>
                  </view>
                </picker>
              </view>
              
              <view class="form-item button-item">
                <view class="form-label">
                  <text style="opacity:0;">占位</text>
                </view>
                <view class="button-group">
                  <u-button @click="search" type="primary" size="default" :custom-style="searchButtonStyle">查询</u-button>
                  <u-button @click="resetSearch" type="info" plain size="default" :custom-style="resetButtonStyle">重置</u-button>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
      
      <!-- 记录列表 -->
      <view class="record-list">
        <view v-for="(item,index) in list" :key="index" class="record-card" @click="viewRecord(item)">
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="header-main">
              <text class="order-no">{{ item.orderno }}</text>
              <view class="badges">
                <view class="type-badge" :class="getTypeClass(item.type)">
                  {{ getTypeLabel(item.type) }}
                </view>
                <view class="status-badge" :class="getStatusClass(item.status)">
                  {{ getStatusLabel(item.status) }}
                </view>
              </view>
            </view>
            <view class="money-info">
              <text class="money-amount">¥{{ item.je }}</text>
            </view>
          </view>
          
          <!-- 卡片内容 -->
          <view class="card-content">
            <view class="content-row">
              <view class="info-item">
                <text class="info-label">游戏/期数</text>
                <text class="info-value">{{ item.gname }}/{{ item.qishu }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">站点</text>
                <text class="info-value">{{ item.sitename }}</text>
              </view>
            </view>
            
            <view class="content-row">
              <view class="info-item">
                <text class="info-label">会员下注</text>
                <text class="info-value">{{ item.old_count }}笔/¥{{ item.old_je }}</text>
              </view>
              <view class="info-item">
                <text class="info-label">出货时间</text>
                <text class="info-value time-text">{{ item.time }}</text>
              </view>
            </view>
            
            <!-- 玩法内容 -->
            <view class="play-content" v-if="item.pcon">
              <text class="play-text">{{ item.pcon }}</text>
            </view>
            
            <!-- 失败备注 -->
            <view class="error-note" v-if="item.status == 0 && item.bz">
              <text class="error-text">失败备注：{{ item.bz }}</text>
            </view>
          </view>
          
          <!-- 展开指示器 -->
          <view class="expand-indicator">
            <u-icon name="arrow-right" size="20" color="#ccc"></u-icon>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 记录详情弹窗 -->
    <u-popup :show="showDetailPopup" mode="bottom" height="1000rpx" :border-radius="20" @close="showDetailPopup = false" :safe-area-inset-bottom="true">
      <view class="detail-popup">
        <view class="popup-header">
          <view class="header-left">
            <text @click="showDetailPopup = false" class="close-btn">✕</text>
          </view>
          <view class="header-center">
            <text class="popup-title">打单记录详情</text>
            <text class="scroll-tip">上下滑动查看更多</text>
          </view>
          <view class="header-right"></view>
        </view>
        
        <scroll-view class="detail-content" scroll-y="true" :show-scrollbar="false">
          <view class="detail-section">
            <view class="section-title">📋 订单信息</view>
            <view class="detail-grid">
              <view class="detail-item">
                <text class="item-label">订单号</text>
                <text class="item-value">{{ currentRecord.orderno }}</text>
              </view>
              <view class="detail-item">
                <text class="item-label">状态</text>
                <view class="status-badge" :class="getStatusClass(currentRecord.status)">
                  {{ getStatusLabel(currentRecord.status) }}
                </view>
              </view>
              <view class="detail-item">
                <text class="item-label">类型</text>
                <view class="type-badge" :class="getTypeClass(currentRecord.type)">
                  {{ getTypeLabel(currentRecord.type) }}
                </view>
              </view>
              <view class="detail-item">
                <text class="item-label">所属站点</text>
                <text class="item-value">{{ currentRecord.sitename }}</text>
              </view>
            </view>
          </view>
          
          <view class="detail-section">
            <view class="section-title">🎮 游戏信息</view>
            <view class="detail-grid">
              <view class="detail-item">
                <text class="item-label">游戏名称</text>
                <text class="item-value">{{ currentRecord.gname }}</text>
              </view>
              <view class="detail-item">
                <text class="item-label">期数</text>
                <text class="item-value">{{ currentRecord.qishu }}</text>
              </view>
              <view class="detail-item full-width">
                <text class="item-label">玩法内容</text>
                <text class="item-value game-content">{{ currentRecord.pcon }}</text>
              </view>
            </view>
          </view>
          
          <view class="detail-section">
            <view class="section-title">💰 金额信息</view>
            <view class="detail-grid">
              <view class="detail-item">
                <text class="item-label">会员下注笔数</text>
                <text class="item-value">{{ currentRecord.old_count }}笔</text>
              </view>
              <view class="detail-item">
                <text class="item-label">会员下注金额</text>
                <text class="item-value">¥{{ currentRecord.old_je }}</text>
              </view>
              <view class="detail-item">
                <text class="item-label">打单金额</text>
                <text class="item-value money-highlight">¥{{ currentRecord.je }}</text>
              </view>
              <view class="detail-item">
                <text class="item-label">出货时间</text>
                <text class="item-value">{{ currentRecord.time }}</text>
              </view>
            </view>
          </view>
          
          <view class="detail-section" v-if="currentRecord.status == 0 && currentRecord.bz">
            <view class="section-title">⚠️ 失败信息</view>
            <view class="detail-grid">
              <view class="detail-item full-width">
                <text class="item-label">失败备注</text>
                <text class="item-value error-note">{{ currentRecord.bz }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </u-popup>
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
        date: '',
        siteid: '',
        status: '',
        qishu: '',
        gid: ''
      },
      // 日期相关
      dateDisplay: '',
      
      // 游戏选择相关
      gameOptions: [],
      gameDisplay: '全部游戏',
      selectedGameIndex: 0,
      
      // 站点选择相关
      siteOptions: [],
      siteDisplay: '全部站点',
      selectedSiteIndex: 0,
      
      // 状态选择相关
      statusOptions: [
        {id: '', name: '全部状态'},
        {id: '1', name: '成功'},
        {id: '0', name: '失败'},
        {id: '2', name: '打单中'}
      ],
      statusDisplay: '全部状态',
      selectedStatusIndex: 0,
      
      // 弹窗相关
      showDetailPopup: false,
      currentRecord: {},
      
      // 按钮样式
      searchButtonStyle: {
        height: '60rpx',
        fontSize: '26rpx',
        borderRadius: '30rpx'
      },
      resetButtonStyle: {
        height: '60rpx',
        fontSize: '26rpx',
        borderRadius: '30rpx',
        marginLeft: '20rpx'
      }
    };
  },
  onShow() {
    this.initPage();
  },
  onLoad() {
    this.initPage();
  },
  methods: {
    // 初始化页面
    initPage() {
      this.loadSiteOptions();
      this.loadGameOptions();
      // 设置默认日期为今天
      const today = new Date();
      this.query.date = this.formatDate(today);
      this.dateDisplay = this.query.date;
    },
    
    // 格式化日期
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    // 格式化时间显示
    formatTime(timeStr) {
      if (!timeStr) return '';
      // 如果是完整时间格式，只显示时分
      if (timeStr.includes(' ')) {
        return timeStr.split(' ')[1].substring(0, 5);
      }
      return timeStr;
    },
    
    // 加载站点选项
    loadSiteOptions() {
      this.$u.api.agent.getOutbetList({page: 1, pageSize: 1000}).then(res => {
        const sites = res.data.records || res.data.list || [];
        this.siteOptions = [
          {id: '', name: '全部站点'},
          ...sites.map(item => ({id: item.id, name: item.name}))
        ];
      }).catch(err => {
        console.error('加载站点选项失败:', err);
      });
    },
    
    // 加载游戏选项
    loadGameOptions() {
      this.$u.api.common.getGameListByIfok().then(res => {
        const games = res.data.list || [];
        this.gameOptions = [
          {id: '', name: '全部游戏'},
          ...games.map(item => ({id: item.gid, name: item.gname}))
        ];
      }).catch(err => {
        console.error('加载游戏选项失败:', err);
        // 如果接口失败，使用默认选项
        this.gameOptions = [
          {id: '', name: '全部游戏'},
          {id: '1', name: 'PK10'},
          {id: '2', name: '时时彩'},
          {id: '3', name: '11选5'},
          {id: '4', name: '快3'}
        ];
      });
    },
    
    // 日期改变
    onDateChange(e) {
      this.query.date = e.target.value;
      this.dateDisplay = e.target.value;
    },
    
    // 游戏改变
    onGameChange(e) {
      const index = e.target.value;
      this.selectedGameIndex = index;
      const selected = this.gameOptions[index];
      this.query.gid = selected.id;
      this.gameDisplay = selected.name;
    },
    
    // 站点改变
    onSiteChange(e) {
      const index = e.target.value;
      this.selectedSiteIndex = index;
      const selected = this.siteOptions[index];
      this.query.siteid = selected.id;
      this.siteDisplay = selected.name;
    },
    
    // 状态改变
    onStatusChange(e) {
      const index = e.target.value;
      this.selectedStatusIndex = index;
      const selected = this.statusOptions[index];
      this.query.status = selected.id;
      this.statusDisplay = selected.name;
    },
    
    // 获取状态标签
    getStatusLabel(status) {
      const statusMap = {
        '1': '成功',
        '0': '失败', 
        '2': '打单中'
      };
      return statusMap[status] || status;
    },
    
    // 获取状态样式类
    getStatusClass(status) {
      if (status == 1) return 'status-success';
      if (status == 0) return 'status-failed';
      if (status == 2) return 'status-processing';
      return '';
    },
    
    // 获取类型标签
    getTypeLabel(type) {
      const typeMap = {
        '1': '封盘合并',
        '2': '分段合并'
      };
      return typeMap[type] || type;
    },
    
    // 获取类型样式类
    getTypeClass(type) {
      if (type == 1) return 'type-single';
      if (type == 2) return 'type-merge';
      return '';
    },
    
    // 查看记录详情
    viewRecord(item) {
      this.currentRecord = item;
      this.showDetailPopup = true;
    },
    
    // 搜索
    search(){
      this.$refs.paging.reload();
    },
    
    // 重置搜索
    resetSearch() {
      this.query = {
        date: this.formatDate(new Date()),
        siteid: '',
        status: '',
        qishu: '',
        gid: ''
      };
      this.dateDisplay = this.query.date;
      this.gameDisplay = '全部游戏';
      this.siteDisplay = '全部站点';
      this.statusDisplay = '全部状态';
      this.selectedGameIndex = 0;
      this.selectedSiteIndex = 0;
      this.selectedStatusIndex = 0;
      this.search();
    },
    
    // 查询列表数据
    queryList(page, pageSize) {
      const params = {
        page: page,
        pageSize: pageSize,
        date: this.query.date,
        siteid: this.query.siteid,
        status: this.query.status,
        qishu: this.query.qishu,
        gid: this.query.gid
      };
      
      this.$u.api.agent.getOutbetRecord(params).then(res => {
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

// 搜索条件样式
.search-container {
  background: #fff;
  padding: 20rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.08);
}

.search-form {
  .form-row {
    display: flex;
    margin-bottom: 20rpx;
    gap: 15rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .form-item {
    flex: 1;
    
    &.button-item {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
  }
  
  .form-label {
    margin-bottom: 8rpx;
    height: 32rpx;
    display: flex;
    align-items: center;
    
    text {
      font-size: 24rpx;
      color: #666;
      font-weight: 500;
    }
  }
  
  .form-input {
    height: 60rpx;
    background: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 30rpx;
    padding: 0 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.3s ease;
    
    &:active {
      background: #fff;
      border-color: #0087B4;
      box-shadow: 0 0 0 4rpx rgba(0, 135, 180, 0.1);
    }
    
    .input-text {
      flex: 1;
      font-size: 26rpx;
      color: #333;
    }
  }
  
  .input-field {
    font-size: 26rpx;
    color: #333;
    
    &::placeholder {
      color: #999;
    }
  }
  
  .button-group {
    display: flex;
    align-items: center;
    height: 60rpx;
  }
}

// 记录列表样式
.record-list {
  padding: 0 20rpx 20rpx;
  
  .record-card {
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
    transition: all 0.3s ease;
    position: relative;
    
    &:active {
      transform: translateY(-2rpx);
      box-shadow: 0 6rpx 20rpx rgba(0,0,0,0.15);
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 20rpx 15rpx;
      border-bottom: 1rpx solid #f0f2f5;
      
      .header-main {
        flex: 1;
        
        .order-no {
          font-size: 28rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .badges {
          display: flex;
          gap: 8rpx;
          
          .type-badge, .status-badge {
            padding: 4rpx 12rpx;
            border-radius: 12rpx;
            font-size: 20rpx;
            font-weight: 500;
          }
          
          .type-badge {
            &.type-single {
              background: #e3f2fd;
              color: #0087B4;
            }
            
            &.type-merge {
              background: #f3e5f5;
              color: #7b1fa2;
            }
          }
          
          .status-badge {
            &.status-success {
              background: #e8f5e8;
              color: #28a745;
            }
            
            &.status-failed {
              background: #ffe1e1;
              color: #dc3545;
            }
            
            &.status-processing {
              background: #fff3cd;
              color: #856404;
            }
          }
        }
      }
      
      .money-info {
        .money-amount {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff6b35;
        }
      }
    }
    
    .card-content {
      padding: 15rpx 20rpx 20rpx;
      
      .content-row {
        display: flex;
        margin-bottom: 12rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-item {
          flex: 1;
          
          .info-label {
            font-size: 22rpx;
            color: #999;
            display: block;
            margin-bottom: 4rpx;
          }
          
          .info-value {
            font-size: 24rpx;
            color: #333;
            display: block;
            
            &.time-text {
              color: #666;
            }
          }
        }
      }
      
      .play-content {
        margin-top: 12rpx;
        padding: 8rpx 12rpx;
        background: #f8f9fa;
        border-radius: 8rpx;
        border-left: 4rpx solid #0087B4;
        
        .play-text {
          font-size: 22rpx;
          color: #0087B4;
          line-height: 1.4;
        }
      }
      
      .error-note {
        margin-top: 12rpx;
        padding: 8rpx 12rpx;
        background: #ffe1e1;
        border-radius: 8rpx;
        border-left: 4rpx solid #dc3545;
        
        .error-text {
          font-size: 22rpx;
          color: #dc3545;
          line-height: 1.4;
        }
      }
    }
    
    .expand-indicator {
      position: absolute;
      right: 15rpx;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}

// 详情弹窗样式
.detail-popup {
  height: 1000rpx;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 20rpx 20rpx 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    padding: 25rpx 30rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
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
        font-size: 30rpx;
        font-weight: bold;
        display: block;
        margin-bottom: 4rpx;
      }
      
      .scroll-tip {
        font-size: 20rpx;
        opacity: 0.8;
        display: block;
      }
    }

    .close-btn {
      font-size: 28rpx;
      padding: 8rpx;
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 28rpx;
      background: rgba(255,255,255,0.2);
    }
  }
  
  .detail-content {
    flex: 1;
    height: 0;
    padding: 20rpx;
    
    .detail-section {
      margin-bottom: 30rpx;
      
      &:last-child {
        margin-bottom: 20rpx;
      }
      
      .section-title {
        font-size: 26rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 15rpx;
        padding: 12rpx 16rpx;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 10rpx;
        border-left: 4rpx solid #0087B4;
      }
      
             .detail-grid {
         display: flex;
         flex-wrap: wrap;
         gap: 15rpx;
         
         .detail-item {
           flex: 1;
           min-width: calc(50% - 8rpx);
           padding: 15rpx;
           background: #fff;
           border: 1rpx solid #f0f2f5;
           border-radius: 10rpx;
          
          &.full-width {
            flex: 100%;
            min-width: 100%;
          }
          
                     .item-label {
             font-size: 22rpx;
             color: #999;
             display: block;
             margin-bottom: 6rpx;
           }
           
           .item-value {
             font-size: 24rpx;
             color: #333;
             display: block;
             word-break: break-all;
            
            &.game-content {
              background: #f8f9fa;
              padding: 12rpx;
              border-radius: 8rpx;
              line-height: 1.4;
            }
            
                         &.money-highlight {
               font-weight: bold;
               color: #ff6b35;
               font-size: 26rpx;
             }
            
            &.error-note {
              color: #dc3545;
              background: #ffe1e1;
              padding: 12rpx;
              border-radius: 8rpx;
              line-height: 1.4;
            }
          }
          
                     .status-badge, .type-badge {
             padding: 4rpx 10rpx;
             border-radius: 10rpx;
             font-size: 20rpx;
             font-weight: 500;
           }
          
          .status-badge {
            &.status-success {
              background: #e8f5e8;
              color: #28a745;
            }
            
            &.status-failed {
              background: #ffe1e1;
              color: #dc3545;
            }
            
            &.status-processing {
              background: #fff3cd;
              color: #856404;
            }
          }
          
          .type-badge {
            &.type-single {
              background: #e3f2fd;
              color: #0087B4;
            }
            
            &.type-merge {
              background: #f3e5f5;
              color: #7b1fa2;
            }
          }
        }
      }
    }
  }
}
</style>
