<template>
  <view class="records-panel">
    <view class="panel-header">
      <text class="panel-title">聊天记录</text>
      <u-icon name="close" size="24" color="#666" @click="closePanel"></u-icon>
    </view>
    
    <view class="panel-content">
      <view class="records-list">
        <view class="record-item" v-for="(record, index) in records" :key="index">
          <view class="record-info">
            <text class="record-title">{{ record.title }}</text>
            <text class="record-time">{{ record.time }}</text>
          </view>
          <view class="record-action">
            <u-button size="mini" type="primary" @click="viewRecord(record)">查看</u-button>
          </view>
        </view>
      </view>
      
      <view class="panel-footer">
        <u-button type="info" @click="exportRecords">导出记录</u-button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'RecordsPanel',
  
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      records: [
        { title: '今日聊天记录', time: '2024-01-01', id: 1 },
        { title: '昨日聊天记录', time: '2023-12-31', id: 2 },
        { title: '本周聊天记录', time: '2023-12-25', id: 3 }
      ]
    };
  },
  
  methods: {
    closePanel() {
      this.$emit('close');
    },
    
    viewRecord(record) {
      console.log('查看记录:', record);
      this.$u.toast('查看记录功能开发中');
    },
    
    exportRecords() {
      console.log('导出记录');
      this.$u.toast('导出功能开发中');
    }
  }
};
</script>

<style lang="scss" scoped>
.records-panel {
  background: #fff;
  border-radius: 16rpx 16rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #E5E5EA;
  
  .panel-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.panel-content {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
}

.records-list {
  .record-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #F2F2F7;
    
    &:last-child {
      border-bottom: none;
    }
    
    .record-info {
      flex: 1;
      
      .record-title {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 8rpx;
      }
      
      .record-time {
        font-size: 24rpx;
        color: #666;
      }
    }
    
    .record-action {
      margin-left: 24rpx;
    }
  }
}

.panel-footer {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #E5E5EA;
}
</style> 