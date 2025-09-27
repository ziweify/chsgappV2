<template>
  <view class="user-card-container" @click="handleClick">
    <view 
      class="user-card"
      :class="{ 'user-card-animate': showAnimation }"
    >
      <!-- 在线状态指示器 -->
      <view class="online-indicator">
        <view 
          :class="user.online === 1 ? 'status-online' : 'status-offline'" 
          class="status-dot"
        >
          <view class="status-pulse" v-if="user.online === 1"></view>
        </view>
      </view>

      <!-- 用户头像区域 -->
      <view class="avatar-container">
        <view class="avatar-wrapper">
          <u-image 
            v-if="user.avatar" 
            :showLoading="true" 
            :src="getImageUrl(user.avatar)" 
            :mode="'aspectFill'" 
            :width="100" 
            :height="100"
            :radius="50"
            :fade="true"
            :webp="true"
          >
            <template slot="loading">
              <view class="avatar-loading">
                <u-loading-icon :color="'#007aff'" :size="24"></u-loading-icon>
              </view>
            </template>
            <template slot="error">
              <view class="avatar-error">
                <u-icon :name="'account-circle-fill'" :color="'#c8c9cc'" :size="60"></u-icon>
              </view>
            </template>
          </u-image>
          <view v-else class="avatar-placeholder">
            <u-icon :name="'account-circle-fill'" :color="'#c8c9cc'" :size="60"></u-icon>
          </view>
          
          <!-- 未读消息徽章 -->
          <u-badge 
            v-if="user.unreadCount > 0"
            :value="user.unreadCount > 99 ? '99+' : user.unreadCount"
            :type="'error'"
            :absolute="true"
            :offset="[5, 5]"
          ></u-badge>
        </view>
      </view>

      <!-- 用户信息区域 -->
      <view class="user-info">
        <view class="user-basic-info">
          <view class="user-name">
            {{ user.name || user.username }}
            <u-icon 
              v-if="user.isVip" 
              :name="'crown-fill'" 
              :color="'#ff9500'" 
              :size="16"
              style="margin-left: 8rpx;"
            ></u-icon>
          </view>
          <view class="user-account">账号：{{ user.username }}</view>
        </view>
        
        <view class="user-detail-info">
          <view class="balance-info">
            <view class="balance-label">余额</view>
            <view class="balance-amount">¥{{ formatAmount(user.kmoney) }}</view>
          </view>
          <view class="last-active" v-if="user.lastActiveTime">
            {{ formatLastActive(user.lastActiveTime) }}
          </view>
        </view>
      </view>

      <!-- 操作区域 -->
      <view class="action-area" v-if="showActions">
        <view class="delete-btn" @click.stop="handleDelete">
          <u-icon :name="'close'" :size="11" :color="'#fff'"></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UserCard',
  props: {
    user: {
      type: Object,
      required: true,
      default: function() { return {}; }
    },
    showActions: {
      type: Boolean,
      default: true
    },
    showAnimation: {
      type: Boolean,
      default: false
    },
    headImageDomain: {
      type: String,
      default: ''
    }
  },
  methods: {
    // 获取图片URL
    getImageUrl(url) {
      if (!url) return '';
      return this.headImageDomain + url;
    },
    
    // 格式化金额
    formatAmount(amount) {
      if (!amount) return '0.00';
      
      // 处理大数值显示
      if (amount >= 10000) {
        return (amount / 10000).toFixed(1) + '万';
      } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'k';
      }
      
      return amount.toFixed(2);
    },
    
    // 格式化最后活跃时间
    formatLastActive(timestamp) {
      if (!timestamp) return '';
      
      var date = new Date(timestamp);
      var now = new Date();
      var diffMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffMinutes < 1) {
        return '刚刚';
      } else if (diffMinutes < 60) {
        return diffMinutes + '分钟前';
      } else if (diffMinutes < 1440) { // 24 hours
        var hours = Math.floor(diffMinutes / 60);
        return hours + '小时前';
      } else if (diffMinutes < 7200) { // 5 days
        var days = Math.floor(diffMinutes / 1440);
        return days + '天前';
      } else {
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours().toString().padStart ? date.getHours().toString().padStart(2, '0') : ('0' + date.getHours()).slice(-2);
        var minutes = date.getMinutes().toString().padStart ? date.getMinutes().toString().padStart(2, '0') : ('0' + date.getMinutes()).slice(-2);
        return month + '月' + day + '日 ' + hours + ':' + minutes;
      }
    },
    
    // 处理卡片点击
    handleClick() {
      this.$emit('click', this.user);
    },
    
    // 处理删除按钮点击
    handleDelete() {
      uni.vibrateShort();
      this.$emit('delete', this.user);
    }
  }
}
</script>

<style lang="scss" scoped>
.user-card-container {
  padding: 20rpx;
  
  .user-card {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    position: relative;
    border-bottom: 1px solid #eee;
    
    .online-indicator {
      margin-right: 15px;
      
      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #9a90a1;
        
        .status-pulse {
          display: none;
        }
      }
      
      .status-online {
        background-color: #00d123;
      }
      
      .status-offline {
        background-color: #9a90a1;
      }
    }
    
    .avatar-container {
      margin-right: 20rpx;
      
      .avatar-wrapper {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        overflow: hidden;
        position: relative;
        
        .avatar-loading {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.8);
        }
        
        .avatar-error {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.8);
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f8f9fa;
        }
      }
    }
    
    .user-info {
      flex: 1;
      
      .user-basic-info {
        .user-name {
          font-size: 32rpx;
          color: #181818;
          margin-bottom: 20rpx;
          display: flex;
          align-items: center;
          
          .u-icon {
            margin-left: 8rpx;
          }
        }
        
        .user-account {
          font-size: 24rpx;
          color: grey;
        }
      }
      
      .user-detail-info {
        display: flex;
        align-items: center;
        margin-top: 10rpx;
        
        .balance-info {
          display: flex;
          align-items: baseline;
          
          .balance-label {
            font-size: 24rpx;
            color: grey;
            margin-right: 10rpx;
          }
          
          .balance-amount {
            font-size: 24rpx;
            color: grey;
          }
        }
        
        .last-active {
          font-size: 24rpx;
          color: grey;
          margin-left: 20rpx;
        }
      }
    }
    
    .action-area {
      padding: 10px;
      
      .delete-btn {
        background: #dadbde;
        border-radius: 50%;
        padding: 3px;
      }
    }
  }
}


</style> 