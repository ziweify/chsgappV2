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
        <TsCustom :backUrl="backUrl" :isBack="true" title="链接生成记录">
          <block slot='right'>
            <view @click="showDate()">选择日期</view>
          </block>
        </TsCustom>
        
        <!-- 搜索区域 -->
        <view class="search-section">
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
              placeholder="请输入用户名" 
              shape="square" 
              @search="handleSearch"
            ></u-search>
          </view>
        </view>
        
        <!-- 日期显示和提示 -->
        <view class="section">
          <view class="p1">{{ query.startDate }} - {{ query.endDate }}</view>
          <view class="p1 notice">注意：链接记录数据最多保留两周。</view>
        </view>
        
        <!-- 表头 -->
        <view class="list-h">
          <view class="span" style="flex:4;">用户信息</view>
          <view class="span" style="flex:3;">类型</view>
          <view class="span" style="flex:4;">剩余</view>
          <view class="span" style="flex:4;">时间</view>
          <view class="span" style="flex:3;">操作</view>
        </view>
      </template>
      
      <!-- 列表内容 -->
      <view class="list">
        <view 
          v-for="(item, index) in list" 
          :key="item.id || `${item.username}-${item.create_time}-${index}`" 
          class="list-p"
        >
          <view class="list-p-item" style="flex:4;">
            <view class="apply-type-color-2">{{ item.username }}</view>
            <view class="color-type">{{ item.name }}</view>
          </view>
          <view class="list-p-item" style="flex:3;">
            <view class="type-badge" :class="item.type === 'time' ? 'type-time' : 'type-count'">
              {{ item.type === 'time' ? '时间' : '次数' }}
            </view>
            <view v-if="item.type === 'count'" class="color-type">{{ item.count+item.use_count }}次</view>
          </view>
          <view class="list-p-item" style="flex:4;">
            <view class="usage-info" v-if="item.type === 'count'">
              <text class="used">{{ item.count }}</text>
            </view>
            <template v-if="item.type === 'time'">
                <view class="color-type">{{ item.time3 }}</view>
                <view class="color-type">{{ item.time4 }}</view>
            </template>
          </view>
          <view class="list-p-item" style="flex:4;color: rgb(156, 156, 156);font-size: 26rpx;">
            <view>{{ item.time1 }}</view>
            <view>{{ item.time2 }}</view>
          </view>
          <view class="list-p-item" style="flex:3;">
            <u-button 
              style="width: 80rpx;"
              @click="copyLink(item.link)" 
              type="primary" 
              size="mini" 
              :custom-style="buttonStyle"
            >
              复制
            </u-button>
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
      backUrl: "agent/manage/umanage",
      query: {
        username: '',
        startDate: '',
        endDate: '',
      },
      gameList: [],
      minDate: '',
      maxDate: '',
      showcalendar: false,
      sdate: [],
      isDataReady: false, // 数据是否准备好
      buttonStyle: {
        fontSize: '24rpx',
        padding: '8rpx 16rpx'
      }
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
      
      this.$u.api.agent.getLinkRecord(queryParams).then(res => {
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
    
    /**
     * 复制链接
     */
    copyLink(link) {
      if (!link) {
        uni.showToast({
          title: '链接为空',
          icon: 'none'
        });
        return;
      }
      
      // #ifdef H5
      if (navigator.clipboard) {
        navigator.clipboard.writeText(link).then(() => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        }).catch(() => {
          this.fallbackCopyText(link);
        });
      } else {
        this.fallbackCopyText(link);
      }
      // #endif
      
      // #ifdef APP-PLUS
      uni.setClipboardData({
        data: link,
        success: () => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
      // #endif
      
      // #ifdef MP
      uni.setClipboardData({
        data: link,
        success: () => {
          uni.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
      // #endif
    },
    
    /**
     * H5降级复制方法
     */
    fallbackCopyText(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        uni.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      } catch (err) {
        uni.showToast({
          title: '复制失败，请手动复制',
          icon: 'none'
        });
      }
      document.body.removeChild(textArea);
    },
    
    /**
     * 格式化日期时间
     */
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      try {
        const date = new Date(dateTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      } catch (error) {
        return dateTime;
      }
    }
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
      padding-top: 26rpx;
    }
    
    &:last-child {
      padding-bottom: 8rpx;
    }
  }
}

.section {
  padding: 20rpx 0;
  background: #fff;
  
  .p1 {
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

.type-badge {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
  
  &.type-time {
    background-color: #67c23a;
  }
  
  &.type-count {
    background-color: #e6a23c;
  }
}

.usage-info {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  
  .used {
    color: #f56c6c;
    font-weight: 500;
  }
  
  .separator {
    margin: 0 8rpx;
    color: #909399;
  }
  
  .total {
    color: #67c23a;
    font-weight: 500;
  }
}
</style>