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
        <TsCustom :backUrl="backUrl" :isBack="true" title="用户报表">
          <block slot='right'>
            <view @click="showDate()">选择日期</view>
          </block>
        </TsCustom>
        
        <!-- 游戏选择和排序选择 -->
        <view class="filter-section">
          <view class="filter-row">
            <!-- 游戏选择 -->
            <select v-model="query.gid" class="custom-select" @change="handleGameChange">
              <option v-for="(item, index) in gameList" :key="index" :value="item.gid">{{item.gname}}</option>
            </select>

            <!-- 排序选择 -->
            <select v-model="query.sort" class="custom-select" @change="handleSortChange">
              <option v-for="(item, index) in sortList" :key="index" :value="item.key">{{item.title}}</option>
            </select>
          </view>
        </view>
        
        <!-- 搜索区域 -->
        <view class="search-section">
          <view class="search-item">
            <u-search 
              @clear="handleSearch" 
              searchIcon="" 
              :showAction="false" 
              v-model="query.username" 
              :clearabled="true" 
              bgColor="#f5f9ff" 
              placeholder="请输入玩家用户名/昵称" 
              shape="square"
            ></u-search>
          </view>
          <view class="search-item">
            <u-search 
              @clear="handleSearch" 
              searchIcon="" 
              @custom="handleSearch" 
              :showAction="true" 
              v-model="query.qishu" 
              :clearabled="true" 
              bgColor="#f5f9ff" 
              placeholder="请输入期数" 
              shape="square" 
              @search="handleSearch"
            ></u-search>
          </view>
        </view>
        
        <!-- 时间选择Tab和统计数据 -->
        <view class="section">
          <view class="van-tabs">
            <view 
              v-for="item in tabsList" 
              :key="item.key" 
              class="van-tab" 
              :class="item.key == curtabkey ? 'van-tab--active' : ''" 
              @click="selectTab(item)"
            >
              {{ item.title }}
            </view>
          </view>
          <view class="p1">{{ query.startDate }} - {{ query.endDate }}</view>
          
          <!-- 统计数据显示 -->
          <view class="ykdata">
            <view class="ykdata-item">
              <view class="ykdata-title">余额</view>
              <view class="ykdata-title">总笔数</view>
              <view class="ykdata-title">总盈亏</view>
              <view class="ykdata-title">总流水</view>
            </view>
            <view class="ykdata-item" style="margin-top:8rpx;">
              <view class="ykdata-value">{{ totalData.balance || '0' }}</view>
              <view class="ykdata-value">{{ totalData.totalCount || '0' }}</view>
              <view class="ykdata-value" :class="getProfitClass(totalData.totalSy)">
                {{ totalData.totalSy || '0' }}
              </view>
              <view class="ykdata-value">{{ totalData.totalMoney || '0' }}</view>
            </view>
          </view>
        </view>
        
        <!-- 列表表头 -->
        <view class="list-h">
          <view class="span" style="flex:1;">用户</view>
          <view class="span" style="flex:1;">余额</view>
          <view class="span" style="flex:1;">流水</view>
          <view class="span" style="flex:1;">盈亏</view>
        </view>
      </template>
      
      <!-- 列表内容 -->
      <view class="list">
        <view 
          v-for="item in list" 
          :key="item.userid || item.username" 
          class="list-p" 
          @click="goToDetail(item)"
        >
          <view class="list-p-item" style="flex:1;">
            <view class="apply-type-color-2">{{ item.username }}</view>
            <view class="color-type" style="margin-top: 5rpx;">{{ item.name }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.kmoney }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.betMoney }}</view>
            <view class="color-type" style="margin-top: 5rpx;">{{ item.count }}笔</view>
          </view>
          <view class="list-p-item" style="flex:1;">
            <view :class="getProfitClass(item.yk)">{{ item.yk }}</view>
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
      totalData: {},
      backUrl: "agent/manage/report/repManage",
      query: {
        username: '',
        gid: '-1',
        startDate: '',
        endDate: '',
        qishu: '',
        sort: '-1',
      },
      gameList: [],
      sortList: [
        { title: '默认排序', key: '-1' },
        { title: '输赢降序', key: '1' },
        { title: '输赢升序', key: '2' },
        { title: '流水降序', key: '3' },
        { title: '流水升序', key: '4' }
      ],
      minDate: '',
      maxDate: '',
      showcalendar: false,
      curtabkey: 'today',
      tabsList: [
        { title: '今日', key: 'today' },
        { title: '昨日', key: 'yesterday' },
        { title: '本周', key: 'week' },
        { title: '上周', key: 'lastWeek' }
      ],
      sdate: [],
      typeMap: {
        1: '下注',
        2: '结算',
        3: '上分',
        4: '下分',
        5: '红包',
        6: '回水',
        7: '撤单',
        8: '返佣'
      },
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
     * 跳转到详情页面
     */
    goToDetail(item) {
      const params = new URLSearchParams({
        username: item.username,
        userid: item.userid,
        gid: this.query.gid,
        startDate: this.query.startDate,
        endDate: this.query.endDate,
        name: item.name
      });
      
      uni.$utils.jump(`agent/manage/report/betrecord?${params.toString()}`);
    },
    
    /**
     * 处理游戏选择变化
     */
    handleGameChange() {
      this.reloadData();
    },

    /**
     * 处理排序选择变化
     */
    handleSortChange() {
      this.reloadData();
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
        isdates: 1
      });
      
      this.gameList = res.data.list;
      this.minDate = res.data.minDate;
      this.maxDate = res.data.maxDate;
      this.sdate = res.data.sdate;
      
      // 设置默认日期为今日
      this.setDefaultDate();
    },
    
    /**
     * 设置默认日期
     */
    setDefaultDate() {
      if (this.sdate && this.sdate.length > 10) {
        this.query.startDate = this.sdate[10]; // 今日
        this.query.endDate = this.sdate[10];   // 今日
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
     * 选择时间Tab
     */
    selectTab(item) {
      this.curtabkey = item.key;
      
      const dateMap = {
        'today': [10, 10],     // 今日
        'yesterday': [0, 0],   // 昨日  
        'week': [5, 6],        // 本周
        'lastWeek': [7, 8]     // 上周
      };
      
      const [startIndex, endIndex] = dateMap[item.key];
      if (this.sdate[startIndex] && this.sdate[endIndex]) {
        this.query.startDate = this.sdate[startIndex];
        this.query.endDate = this.sdate[endIndex];
        this.reloadData();
      }
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
     * 获取盈亏样式类
     */
    getProfitClass(value) {
      const numValue = parseFloat(value);
      return numValue > 0 ? 'm-green' : (numValue < 0 ? 'm-red' : '');
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
      
      this.$u.api.agent.getReportUser(queryParams).then(res => {
        this.totalData = res.data.totalData || {};
        this.$refs.paging.complete(res.data.records);
      }).catch(error => {
        console.error('查询失败:', error);
        this.$refs.paging.complete([]);
        this.totalData = {};
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

/* 筛选区域样式 */
.filter-section {
  background: #fff;
  padding: 15rpx 30rpx;
  
  .filter-row {
    display: flex;
    gap: 15rpx;
    align-items: center;
  }
}

/* 自定义下拉选择样式 */
.custom-select {
  flex: 1;
  padding: 12rpx 16rpx;
  background-color: #f5f9ff;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  color: #333;
  font-size: 26rpx;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04ODQuMTI4IDM0NC4wNjRsLTMzNC4wOCAzMzQuMDk2YTMyIDMyIDAgMCAxLTQ1LjI0OCAwbC0zMzQuMDk2LTMzNC4wOTZhMzIgMzIgMCAwIDEgNDUuMjQ4LTQ1LjI0OEw1MTIgNjAyLjI0bDMwNi4xNzYtMzAzLjQyNGEzMiAzMiAwIDEgMSA0NS4yNTYgNDUuMjQ4eiIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==");
  background-repeat: no-repeat;
  background-position: right 16rpx center;
  background-size: 18rpx;
  padding-right: 48rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56rpx;
  box-sizing: border-box;
}

.custom-select:focus {
  border-color: #0087B4;
  background-color: #fff;
  box-shadow: 0 0 0 4rpx rgba(0, 135, 180, 0.1);
}

.custom-select:hover {
  border-color: #0087B4;
  background-color: #fff;
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
  }
  
  .ykdata {
    margin: 15rpx 15rpx 0 15rpx;
    
    .ykdata-item {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      
      .ykdata-title {
        flex: 1;
        text-align: center;
        font-size: 28rpx;
        color: #79828d;
        font-weight: 500;
      }
      
      .ykdata-value {
        flex: 1;
        text-align: center;
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
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

.color-type {
  color: rgb(0, 135, 180);
  font-size: 24rpx;
  margin-top: 4rpx;
}

.apply-type-color-2 {
  font-weight: 500;
  color: #333;
}

.m-green {
  color: #67C23A;
  font-weight: 500;
}

.m-red {
  color: #F56C6C;
  font-weight: 500;
}
</style>

