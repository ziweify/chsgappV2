<template>
  <view class="prediction-panel">
    <view class="panel-header">
      <text class="panel-title">预测信息</text>
      <u-icon name="close" size="24" color="#666" @click="closePanel"></u-icon>
    </view>
    
    <view class="panel-content">
      <view class="prediction-table">
        <view class="table-header">
          <view class="col">名次</view>
          <view class="col">本群预测</view>
          <view class="col">大小</view>
          <view class="col">单双</view>
        </view>
        
        <view class="table-body">
          <view class="table-row" v-for="(item, index) in predictions" :key="index">
            <view class="col">{{ item.rank }}</view>
            <view class="col">{{ item.prediction }}</view>
            <view class="col">
              <view class="tag" :class="item.size === '大' ? 'tag-big' : 'tag-small'">
                {{ item.size }}
              </view>
            </view>
            <view class="col">
              <view class="tag" :class="item.parity === '单' ? 'tag-odd' : 'tag-even'">
                {{ item.parity }}
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="prediction-tips">
        <text class="tips-title">预测说明</text>
        <text class="tips-content">预测仅供参考，不构成投资建议</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PredictionPanel',
  
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  
  data() {
    return {
      predictions: [
        { rank: '冠军', prediction: '01', size: '小', parity: '单' },
        { rank: '亚军', prediction: '08', size: '大', parity: '双' },
        { rank: '第三', prediction: '05', size: '小', parity: '单' },
        { rank: '第四', prediction: '09', size: '大', parity: '单' },
        { rank: '第五', prediction: '03', size: '小', parity: '单' }
      ]
    };
  },
  
  created() {
    this.loadPredictions();
  },
  
  methods: {
    closePanel() {
      this.$emit('close');
    },
    
    loadPredictions() {
      // 这里可以从API加载真实的预测数据
      console.log('加载预测数据');
    }
  }
};
</script>

<style lang="scss" scoped>
.prediction-panel {
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

.prediction-table {
  .table-header {
    display: flex;
    background: #F2F2F7;
    border-radius: 8rpx 8rpx 0 0;
    
    .col {
      flex: 1;
      padding: 20rpx 16rpx;
      text-align: center;
      font-size: 26rpx;
      font-weight: 600;
      color: #333;
      border-right: 1rpx solid #E5E5EA;
      
      &:last-child {
        border-right: none;
      }
    }
  }
  
  .table-body {
    .table-row {
      display: flex;
      border-bottom: 1rpx solid #E5E5EA;
      
      &:last-child {
        border-bottom: none;
      }
      
      .col {
        flex: 1;
        padding: 24rpx 16rpx;
        text-align: center;
        font-size: 26rpx;
        color: #333;
        border-right: 1rpx solid #E5E5EA;
        
        &:last-child {
          border-right: none;
        }
      }
    }
  }
}

.tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #fff;
  font-weight: 500;
  
  &.tag-big {
    background: #FF6B6B;
  }
  
  &.tag-small {
    background: #4ECDC4;
  }
  
  &.tag-odd {
    background: #45B7D1;
  }
  
  &.tag-even {
    background: #96CEB4;
  }
}

.prediction-tips {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #F8F9FA;
  border-radius: 12rpx;
  
  .tips-title {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 8rpx;
  }
  
  .tips-content {
    font-size: 24rpx;
    color: #666;
    line-height: 1.4;
  }
}
</style> 