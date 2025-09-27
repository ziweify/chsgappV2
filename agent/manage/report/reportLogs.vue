<template>
  <view class="layout">
    <z-paging 
      ref="paging" 
      v-model="list" 
      :show-empty-view-reload="true" 
      :auto="false"
      safe-area-inset-bottom 
      @query="queryList" 
      :default-page-size="20"
    >
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="日志报表">
          <block slot='right'>
            <view @click="showDate()">选择日期</view>
          </block>
        </TsCustom>
        
        <!-- 日志类型选择Tab -->
        <view class="section">
          <view class="van-tabs">
            <view 
              v-for="item in tabsList" 
              :key="item.key" 
              class="van-tab" 
              :class="item.key == query.type ? 'van-tab--active' : ''" 
              @click="selectTab(item)"
            >
              {{ item.title }}
            </view>
          </view>
        </view>
        
        <!-- 搜索区域 -->
        <view class="search-section">
          <!-- IP地址搜索 (仅登录日志显示) -->
          <view v-show="query.type == 1" class="search-item">
            <u-search 
              @clear="handleSearch" 
              searchIcon="" 
              :showAction="false" 
              v-model="query.ip" 
              :clearabled="true" 
              bgColor="#f5f9ff" 
              placeholder="请输入IP地址" 
              shape="square"
            ></u-search>
          </view>
          <!-- 用户名搜索 -->
          <view class="search-item">
            <u-search 
              @clear="handleSearch" 
              searchIcon="" 
              @custom="handleSearch" 
              :showAction="true" 
              v-model="query.username" 
              :clearabled="true" 
              bgColor="#f5f9ff" 
              placeholder="请输入玩家用户名" 
              shape="square" 
              @search="handleSearch"
            ></u-search>
          </view>
        </view>
        
        <!-- 日期显示和提示 -->
        <view class="section">
          <view class="p1">{{ query.startDate }} - {{ query.endDate }}</view>
          <view class="p1 notice">注意：日志最多保留两周数据。</view>
        </view>
        
        <!-- 登录日志表头 -->
        <view v-show="query.type == 1" class="list-h">
          <view class="span" style="flex:5;">用户</view>
          <view class="span" style="flex:5;">登录时间</view>
          <view class="span" style="flex:6;">IP地址</view>
          <view class="span" style="flex:6;">IP归属</view>
        </view>
        
        <!-- 操作日志表头 -->
        <view v-show="query.type == 2" class="list-h">
          <view class="span" style="flex:5;">操作人</view>
          <view class="span" style="flex:5;">操作时间</view>
          <view class="span" style="flex:6;">类型</view>
          <view class="span" style="flex:6;">关联对象</view>
        </view>
      </template>
      
      <!-- 列表内容 -->
      <view class="list">
        <view 
          v-for="(item, index) in list" 
          :key="item.id || `${item.username}-${item.time1}-${item.time2}-${index}`" 
          class="list-p"
        >
          <view class="list-p-item" style="flex:5;">
            <view class="apply-type-color-2">
              {{ query.type == 1 ? item.username : item.modiusername }}
            </view>
          </view>
          <view class="list-p-item" style="flex:5;color: rgb(156, 156, 156);font-size: 26rpx;">
            <view>{{ item.time1 }}</view> 
            <view>{{ item.time2 }}</view>
          </view>
          <view class="list-p-item" style="flex:6;color: rgb(156, 156, 156);font-size: 26rpx;">
            <view>{{ query.type == 1 ? item.ip : item.action }}</view>
            <view v-show="query.type == 2" style="margin-top: 8rpx;">{{ item.value }}</view>
          </view>
          <view class="list-p-item" style="flex:6;">
            <view>{{ query.type == 1 ? item.addr : item.username }}</view>
          </view>
        </view>
      </view>
    </z-paging>
    
    <!-- 日历组件 -->
    <u-calendar 
      :allowSameDay="true" 
      :closeOnClickOverlay="true" 
      @close="showcalendar = false" 
      :minDate="minDate" 
      :maxDate="maxDate" 
      :show="showcalendar" 
      @confirm="dateConfrim" 
      mode="range"
    ></u-calendar>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      list: [],
      backUrl: "agent/manage/report/repManage",
      query: {
        username: '',
        ip: '',
        startDate: '',
        endDate: '',
        type: 1,
      },
      gameList: [],
      minDate: '',
      maxDate: '',
      showcalendar: false,
      tabsList: [
        { title: '登录日志', key: 1 },
        { title: '操作日志', key: 2 }
      ],
      sdate: [],
      isDataReady: false, // 数据是否准备好
    };
  },
  
  async onLoad() {
    await this.initData();
  },
  
  methods: {
    /**
     * 初始化数据
     */
    async initData() {
      try {
        await this.getGameListByIfok();
        // 数据准备好后，开始第一次查询
        this.isDataReady = true;
        this.$refs.paging.reload();
      } catch (error) {
        console.error('初始化数据失败:', error);
        uni.showToast({
          title: '数据加载失败，请重试',
          icon: 'none'
        });
      }
    },
    
    /**
     * 日期确认
     */
    dateConfrim(item) {
      this.query.startDate = item[0];
      this.query.endDate = item[item.length - 1];
      this.showcalendar = false;
      this.reloadData();
    },
    
    /**
     * 获取游戏列表和日期数据
     */
    async getGameListByIfok() {
      const res = await this.$u.api.common.getGameListByIfok({
        type: 1,
        isdates: 1,
        mode: 2
      });
      
      this.gameList = res.data.list;
      this.minDate = res.data.minDate;
      this.maxDate = res.data.maxDate;
      this.sdate = res.data.sdate;
      
      // 设置默认日期
      this.setDefaultDate();
    },
    
    /**
     * 设置默认日期
     */
    setDefaultDate() {
      if (this.sdate && this.sdate.length > 11) {
        this.query.startDate = this.sdate[11]; // 今日
        this.query.endDate = this.sdate[11];   // 今日
      } else if (this.minDate && this.maxDate) {
        // 如果没有sdate数据，使用当前日期
        this.query.startDate = new Date().toISOString().split('T')[0];
        this.query.endDate = new Date().toISOString().split('T')[0];
      }
    },
    
    /**
     * 显示/隐藏日期选择器
     */
    showDate() {
      this.showcalendar = !this.showcalendar;
    },
    
    /**
     * 选择日志类型Tab
     */
    selectTab(item) {
      this.query.type = item.key;
      // 切换类型时清空IP搜索条件
      if (item.key === 2) {
        this.query.ip = '';
      }
      this.reloadData();
    },
    
    /**
     * 搜索处理
     */
    handleSearch() {
      this.reloadData();
    },
    
    /**
     * 重新加载数据
     */
    reloadData() {
      if (this.isDataReady) {
        this.$refs.paging.reload();
      }
    },
    
    /**
     * 查询列表数据
     */
    queryList(page, pageSize) {
      // 如果数据还没准备好，不执行查询
      if (!this.isDataReady) {
        return;
      }
      
      // 检查必要参数
      if (!this.query.startDate || !this.query.endDate) {
        console.warn('日期参数缺失，等待数据初始化完成');
        return;
      }
      
      const queryParams = {
        ...this.query,
        page,
        pageSize
      };
      
      this.$u.api.agent.getReportLogs(queryParams).then(res => {
        this.$refs.paging.complete(res.data.records);
      }).catch(error => {
        console.error('查询失败:', error);
        this.$refs.paging.complete([]);
        uni.showToast({
          title: '查询失败，请重试',
          icon: 'none'
        });
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100%;
  width: 100%;
  background-color: #f1f1f1;
  display: flex;
  flex-direction: column;
}

.search-section {
  background: #fff;
  
  .search-item {
    padding: 15rpx 30rpx;
    
    &:first-child {
      padding-top: 30rpx;
    }
    
    &:last-child {
      padding-bottom: 30rpx;
    }
  }
}

.section {
  padding: 20rpx 0;
  background: #fff;
  
  .van-tabs {
    display: flex;
    padding: 0 20rpx;
    
    .van-tab {
      border-right: 2rpx solid rgb(0, 135, 180);
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 15rpx 20rpx;
      font-size: 28rpx;
      color: rgb(0, 135, 180);
      border-top: 2rpx solid rgb(0, 135, 180);
      border-bottom: 2rpx solid rgb(0, 135, 180);
      transition: all 0.3s ease;
      
      &:first-child {
        border-radius: 20rpx 0 0 20rpx;
        border-left: 2rpx solid rgb(0, 135, 180);
      }
      
      &:last-child {
        border-radius: 0 20rpx 20rpx 0;
      }
      
      &--active {
        color: #fff;
        font-weight: 500;
        background-color: rgb(0, 135, 180);
      }
    }
  }
  
  .p1 {
    margin-top: 20rpx;
    width: 100%;
    height: 60rpx;
    background: #f5f9ff;
    font-size: 28rpx;
    text-align: center;
    font-weight: 400;
    color: #79828d;
    line-height: 60rpx;
    
    &.notice {
      background: #fff3cd;
      color: #856404;
      border: 1rpx solid #ffeaa7;
      margin-top: 10rpx;
    }
  }
}

.list-h {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 2rpx solid #eee;
  background-color: #fff;
  height: 100rpx;
  font-weight: 500;
  color: #000000;
  font-size: 30rpx;
  margin-top: 15rpx;
  
  .span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.list {
  background: #fff;
  
  .list-p {
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 2rpx solid #eee;
    background-color: #fff;
    color: #5e5e5e;
    font-size: 28rpx;
    padding: 15rpx 0;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    .list-p-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}

.apply-type-color-2 {
  font-weight: 500;
  color: #333;
}

.color-type {
  color: rgb(0, 135, 180);
  font-size: 24rpx;
  margin-top: 4rpx;
}
</style>
