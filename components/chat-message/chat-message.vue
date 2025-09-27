<template>
  <view class="chat-message" :class="messageClass">
    <!-- 头像 -->
    <view class="avatar-container" v-if="showAvatar">
      <u-avatar 
        :src="avatarUrl" 
        :size="avatarSize" 
        :shape="avatarShape"
        :bg-color="avatarBgColor">
        {{ message.sender.nickname.charAt(0) }}
      </u-avatar>
    </view>
    
    <!-- 消息内容区域 -->
    <view class="message-content" @longpress="handleLongPress" @click="handleClick">
      <!-- 昵称 -->
      <view class="nickname" v-if="showNickname">{{ message.sender.nickname }}</view>
      
      <!-- 消息气泡 -->
      <view class="message-bubble" :class="bubbleClass">
        <!-- 文本消息 -->
        <view class="text-content" v-if="message.type === 'text'">
          <rich-text :nodes="parsedContent"></rich-text>
        </view>
        
        <!-- 图片消息 -->
        <view class="image-content" v-if="message.type === 'image'">
          <image 
            :src="message.content" 
            mode="aspectFit" 
            @click="previewImage"
            class="message-image" />
        </view>
        
        <!-- 系统消息 -->
        <view class="system-content" v-if="message.type === 'system'">
          <text class="system-text">{{ message.content }}</text>
        </view>
        
        <!-- 发送状态 -->
        <view class="send-status" v-if="showSendStatus">
          <u-icon 
            v-if="message.status === 'sending'" 
            name="loading" 
            size="16" 
            color="#999" 
            class="status-icon rotating" />
          <u-icon 
            v-else-if="message.status === 'failed'" 
            name="close-circle" 
            size="16" 
            color="#FF4444" 
            class="status-icon"
            @click="handleRetry" />
          <u-icon 
            v-else-if="message.status === 'sent'" 
            name="checkmark" 
            size="14" 
            color="#999" 
            class="status-icon" />
        </view>
      </view>
      
      <!-- 时间戳 -->
      <view class="timestamp" v-if="showTimestamp">{{ formattedTime }}</view>
    </view>
  </view>
</template>

<script>
import { previewImageWithSwipe } from '@/common/imagePreviewUtils.js';

export default {
  name: 'ChatMessage',
  
  props: {
    // 消息数据
    message: {
      type: Object,
      required: true,
      default: () => ({
        id: '',
        content: '',
        sender: {
          id: 0,
          nickname: '',
          avatar: ''
        },
        timestamp: 0,
        type: 'text',
        status: 'sent'
      })
    },
    
    // 当前用户信息
    currentUser: {
      type: Object,
      required: true,
      default: () => ({
        id: 0,
        avatar: '',
        nickname: '',
        type: 0
      })
    },
    
    // 是否显示头像
    showAvatar: {
      type: Boolean,
      default: true
    },
    
    // 是否显示昵称
    showNickname: {
      type: Boolean,
      default: true
    },
    
    // 是否显示时间戳
    showTimestamp: {
      type: Boolean,
      default: false
    },
    
    // 头像大小
    avatarSize: {
      type: [String, Number],
      default: 40
    },
    
    // 头像形状
    avatarShape: {
      type: String,
      default: 'circle'
    },
    
    // 头像域名
    avatarDomain: {
      type: String,
      default: ''
    }
  },
  
  computed: {
    // 是否是自己发送的消息
    isOwnMessage() {
      return this.message.sender.id === this.currentUser.id;
    },
    
    // 是否是系统消息
    isSystemMessage() {
      return this.message.type === 'system';
    },
    
    // 消息容器样式类
    messageClass() {
      return {
        'message-own': this.isOwnMessage,
        'message-other': !this.isOwnMessage && !this.isSystemMessage,
        'message-system': this.isSystemMessage
      };
    },
    
    // 消息气泡样式类
    bubbleClass() {
      return {
        'bubble-own': this.isOwnMessage,
        'bubble-other': !this.isOwnMessage && !this.isSystemMessage,
        'bubble-system': this.isSystemMessage,
        'bubble-sending': this.message.status === 'sending',
        'bubble-failed': this.message.status === 'failed'
      };
    },
    
    // 头像URL
    avatarUrl() {
      if (!this.message.sender.avatar) return '';
      
      const avatar = this.message.sender.avatar;
      if (avatar.startsWith('http')) {
        return avatar;
      }
      
      return this.avatarDomain ? `${this.avatarDomain}${avatar}` : avatar;
    },
    
    // 头像背景色
    avatarBgColor() {
      if (this.avatarUrl) return 'transparent';
      
      // 根据用户ID生成颜色
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
      const index = this.message.sender.id % colors.length;
      return colors[index];
    },
    
    // 是否显示发送状态
    showSendStatus() {
      return this.isOwnMessage && this.message.status !== 'sent';
    },
    
    // 格式化时间
    formattedTime() {
      if (!this.message.timestamp) return '';
      
      const date = new Date(this.message.timestamp);
      const now = new Date();
      
      if (date.toDateString() === now.toDateString()) {
        // 今天，只显示时间
        return date.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else {
        // 其他天，显示日期和时间
        return date.toLocaleString('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    },
    
    // 解析后的内容（支持富文本）
    parsedContent() {
      if (!this.message.content) return '';
      
      let content = this.message.content;
      
      // 处理换行
      content = content.replace(/\n/g, '<br/>');
      
      // 处理表情（如果有表情映射）
      content = this.parseEmojis(content);
      
      // 处理链接
      content = this.parseLinks(content);
      
      return content;
    }
  },
  
  methods: {
    // 处理长按事件
    handleLongPress() {
      if (this.isSystemMessage) return;
      
      this.$emit('longpress', this.message);
    },
    
    // 处理点击事件
    handleClick() {
      if (this.isSystemMessage) return;
      
      this.$emit('click', this.message);
    },
    
    // 处理重试发送
    handleRetry() {
      this.$emit('retry', this.message);
    },
    
    // 预览图片
    previewImage() {
      // 获取当前聊天记录中的所有图片，支持左右滑动预览
      previewImageWithSwipe(this.message.content);
    },
    
    // 解析表情
    parseEmojis(content) {
      // 简单的表情映射
      const emojiMap = {
        ':)': '😊',
        ':D': '😄',
        ':(': '😢',
        ':P': '😛',
        ':o': '😮',
        ';)': '😉'
      };
      
      Object.keys(emojiMap).forEach(key => {
        const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, emojiMap[key]);
      });
      
      return content;
    },
    
    // 解析链接
    parseLinks(content) {
      // 简单的链接解析
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return content.replace(urlRegex, '<a href="$1" style="color: #007AFF;">$1</a>');
    }
  }
};
</script>

<style lang="scss" scoped>
.chat-message {
  display: flex;
  padding: 8rpx 24rpx;
  margin-bottom: 4rpx;
  
  // 自己发送的消息
  &.message-own {
    justify-content: flex-end;
    
    .avatar-container {
      order: 2;
      margin-left: 16rpx;
      margin-right: 0;
    }
    
    .message-content {
      order: 1;
      align-items: flex-end;
      
      .nickname {
        text-align: right;
      }
    }
  }
  
  // 他人发送的消息
  &.message-other {
    justify-content: flex-start;
    
    .avatar-container {
      order: 1;
      margin-right: 16rpx;
      margin-left: 0;
    }
    
    .message-content {
      order: 2;
      align-items: flex-start;
      
      .nickname {
        text-align: left;
      }
    }
  }
  
  // 系统消息
  &.message-system {
    justify-content: center;
    
    .message-content {
      align-items: center;
    }
  }
}

.avatar-container {
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 8rpx;
}

.message-content {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  min-width: 0;
  
  .nickname {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 4rpx;
    padding: 0 16rpx;
    word-break: break-all;
  }
  
  .timestamp {
    font-size: 22rpx;
    color: #999;
    margin-top: 4rpx;
    padding: 0 16rpx;
  }
}

.message-bubble {
  position: relative;
  padding: 16rpx 20rpx;
  border-radius: 18rpx;
  max-width: 100%;
  word-break: break-all;
  display: flex;
  align-items: center;
  
  // 自己发送的消息气泡
  &.bubble-own {
    background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
    color: #fff;
    
    // 右侧小三角
    &::after {
      content: '';
      position: absolute;
      right: -8rpx;
      top: 16rpx;
      width: 0;
      height: 0;
      border-left: 16rpx solid #007AFF;
      border-top: 8rpx solid transparent;
      border-bottom: 8rpx solid transparent;
    }
  }
  
  // 他人发送的消息气泡
  &.bubble-other {
    background: #F5F5F5;
    color: #333;
    
    // 左侧小三角
    &::before {
      content: '';
      position: absolute;
      left: -8rpx;
      top: 16rpx;
      width: 0;
      height: 0;
      border-right: 16rpx solid #F5F5F5;
      border-top: 8rpx solid transparent;
      border-bottom: 8rpx solid transparent;
    }
  }
  
  // 系统消息气泡
  &.bubble-system {
    background: rgba(0, 0, 0, 0.05);
    color: #666;
    border-radius: 30rpx;
    padding: 12rpx 24rpx;
    font-size: 24rpx;
    
    &::before,
    &::after {
      display: none;
    }
  }
  
  // 发送中状态
  &.bubble-sending {
    opacity: 0.6;
  }
  
  // 发送失败状态
  &.bubble-failed {
    background: #FFE5E5;
    color: #FF4444;
    border: 1rpx solid #FFB5B5;
  }
}

.text-content {
  line-height: 1.4;
  font-size: 30rpx;
  word-wrap: break-word;
  
  // 富文本样式
  :deep(a) {
    color: inherit;
    text-decoration: underline;
  }
  
  :deep(br) {
    display: block;
    margin: 4rpx 0;
  }
}

.image-content {
  .message-image {
    max-width: 400rpx;
    max-height: 400rpx;
    border-radius: 12rpx;
    background: #f5f5f5;
  }
}

.system-content {
  .system-text {
    font-size: 24rpx;
    color: #666;
  }
}

.send-status {
  margin-left: 12rpx;
  flex-shrink: 0;
  
  .status-icon {
    display: block;
    
    &.rotating {
      animation: rotate 1s linear infinite;
    }
  }
}

// 旋转动画
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式适配
@media (max-width: 768rpx) {
  .message-content {
    max-width: 80%;
  }
  
  .text-content {
    font-size: 28rpx;
  }
}
</style> 