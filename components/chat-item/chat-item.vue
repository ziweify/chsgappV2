<template>
	<view class="chat-item">
<!--		<text class="chat-time" v-if="item.time&&item.time.length">
			{{item.time}}
		</text>-->
		<!-- 系统消息特殊显示 -->
		<view v-if="isSystemMessage" class="system-message-container">
			<view class="system-message-wrapper" :class="`theme-${systemMessageTheme.theme}`">
				<view class="system-message-content">
					<view class="system-message-header">
						<view class="system-message-left">
							<text class="system-icon">{{ systemMessageTheme.icon }}</text>
							<text class="system-message-title">系统消息</text>
						</view>
						<text class="system-message-time">{{ timeFormat(item.time) }}</text>
					</view>
					<view class="system-message-text">
						<rich-text :nodes="item.content"></rich-text>
					</view>
				</view>
			</view>
		</view>
		<!-- 普通消息显示 -->
		<view v-else :class="{'chat-container':true,'chat-location-me':item.sender == uid}">
			<view class="chat-icon-container">
<!--				<image class="chat-icon" :src="toImageUrl(item.avatar)" mode="aspectFill" />-->
        <u-image :shape="shape" class="chat-icon" :showLoading="true" :src="toImageUrl(item.avatar)" mode="aspectFill" width="40" height="40">
          <template v-slot:loading>
            <u-loading-icon color="#0087b4"></u-loading-icon>
          </template>
        </u-image>
			</view>
			<view class="chat-content-container">
				<text :class="{'chat-user-name':true,'chat-location-me':item.sender == uid}">
					{{ nicknameHandel(item.nickname) }} {{ timeFormat(item.time) }}
				</text>
				<view class="chat-text-container-super" :style="[{justifyContent:item.sender == uid?'flex-end':'flex-start'}]">
					<view v-if="item.chatType == 'text'" :class="{'chat-text-container':true,'chat-text-container-me':item.sender == uid}" @longpress="onLongPress">
            <text v-if="item.isA" :class="utype == 0 ? 'name' : 'name1'">@{{ item.isA }}</text>
            <rich-text v-if="!item.mtype || item.mtype == 0" :nodes="item.content"></rich-text>
            <template v-if="item.mtype && item.mtype == 1">
              <view v-for="(cc, index) in item.content" :key="`content-1-${index}`" style="display: flex;" :style="{'flexDirection': cc.otype == 'order' ? 'column' : 'row'}">
                <text v-if="cc.ctype === 'text'">{{cc.con}}</text>
                <rich-text v-if="cc.ctype === 'html'" :nodes="cc.con"></rich-text>
                <view v-if="cc.otype === 'order'">
                  <text @click="msgOrderDetail(item.other[cc.uid],cc.otype)" :class="utype == 0 ? 'name' : 'name1'">注单详情</text>
                </view>
                <view v-if="cc.otype === 'orderlist'">
                  <text style="margin-left: 10rpx;" @click="msgOrderDetail(item.other[cc.uid],cc.otype)" :class="utype == 0 ? 'name' : 'name1'">注单详情</text>
                </view>
                <view v-if="cc.otype === 'settle'">
                    <text style="margin-left: 10rpx;" @click="msgOrderDetail(item.other[cc.uid],cc.otype)" :class="utype == 0 ? 'name' : 'name1'">注单详情</text>
                </view>
              </view>
            </template>
            <template v-if="item.mtype && item.mtype == 2">
              <view v-for="(cc, index) in item.content" :key="`content-2-${index}`" style="display: inline;">
                <rich-text :nodes="cc.con"></rich-text>
              </view>
            </template>
					</view>
          <view v-if="item.chatType == 'image'" class="chat-imgae">
            <u-image 
              class="chat-content-image" 
              :showLoading="true" 
              :showError="true"
              :src="toConImageUrl(item.content)" 
              mode="aspectFill" 
              width="200rpx" 
              height="253rpx"
              :lazy="true"
              :fade="true"
              @click="clickImg(toConImageUrl(item.content))"
              @tap="clickImg(toConImageUrl(item.content))">
              <template v-slot:loading>
                <view class="image-loading-placeholder">
                  <u-loading-icon color="#ccc" size="40"></u-loading-icon>
                  <text class="loading-text">图片加载中...</text>
                </view>
              </template>
              <template v-slot:error>
                <view class="image-error-placeholder">
                  <u-icon name="photo" color="#ccc" size="40"></u-icon>
                  <text class="error-text">图片加载失败</text>
                </view>
              </template>
            </u-image>
          </view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { previewImageWithSwipe } from '@/common/imagePreviewUtils.js';
	
	export default {
		name:"chat-item",
		props: {
      item:{
        type:Object,
        default:[]
      },
      mindex:{
        type: Number,
        default: 0
      },
      uid: {
        type: Number,
        default: 0
      },
      headImageDomain:{
        type: String,
        default: ''
      },
      conImageDomain:{
        type: String,
        default: ''
      },
      // 新增：接收聊天记录数据，用于图片预览
      chatList: {
        type: Array,
        default: () => []
      },
      utype: {
        type: Number,
        default: 0
      },
      shape: {
        type: String,
        default: 'circle'
      },
      chatroomNicknameLength:{
        type:Number,
        default:6
      }
		},
		data() {
			return {
        previewImageFlag:false,
			};
		},
		computed: {
			// 判断是否为系统消息
			isSystemMessage() {
				return this.item && (
					this.item.sender === 0 || 
					this.item.sender === '0' || 
					this.item.nickname === '系统消息' ||
					this.item.nickname === '系统' ||
					this.item.nickname === '系统管理员'
				);
			},
			// 系统消息图标和主题
			systemMessageTheme() {
				if (!this.isSystemMessage) return null;
				
				// 优先使用后端配置的主题
				if (this.item.systemTheme && this.item.systemIcon) {
					return { 
						icon: this.item.systemIcon, 
						theme: this.item.systemTheme 
					};
				} else if (this.item.systemTheme) {
					// 有主题配置但没有自定义图标，使用主题默认图标
					const defaultIcons = {
						'default': '📢',
						'info': '📢',
						'success': '🎉',
						'warning': '⚠️',
						'error': '❌'
					};
					return { 
						icon: defaultIcons[this.item.systemTheme] || '📢', 
						theme: this.item.systemTheme 
					};
				}
				
				// 后备方案：根据消息内容自动判断类型
				const content = this.item.content || '';
				if (content.includes('维护') || content.includes('升级') || content.includes('暂停')) {
					return { icon: '⚠️', theme: 'warning' };
				} else if (content.includes('恭喜') || content.includes('中奖') || content.includes('获得')) {
					return { icon: '🎉', theme: 'success' };
				} else if (content.includes('通知') || content.includes('公告') || content.includes('提醒')) {
					return { icon: '📢', theme: 'info' };
				} else if (content.includes('错误') || content.includes('失败') || content.includes('异常')) {
					return { icon: '❌', theme: 'error' };
				} else {
					return { icon: '📢', theme: 'default' };
				}
			}
		},
    methods:{
      timeFormat(time){
        return uni.$u.timeFormat(time, 'hh:MM');
      },
      nicknameHandel(nickname){
        //如果昵称长度超过chatroomNicknameLength，则截取,显示...
        if(!nickname) {
          return '';
        }
        if(nickname.length > this.chatroomNicknameLength){
          return nickname.substring(0,this.chatroomNicknameLength);
        }
        return nickname;
      },
      onLongPress(event){
        this.$emit('mlongpress', this.mindex, event);
      },
      toImageUrl(url){
        if(!url){
          return '/static/img/room_bg.2c58cefc.png';
        }
        return this.headImageDomain+url;
      },
      toConImageUrl(url){
        return this.conImageDomain+url;
      },
      msgOrderDetail(item,orderShowTtype){
        this.$emit('msgOrderDetail',item,orderShowTtype);
      },
      clickImg(imageUrl) {
        this.previewImageFlag = true;
        
        // 如果是事件对象，尝试从不同方式获取URL
        if (typeof imageUrl === 'object' && imageUrl.target) {
          // 兼容原来的事件处理方式
          imageUrl = imageUrl.target.dataset.src || imageUrl.target.src;
        }
        
        // 调试信息
        console.log('点击图片预览，URL:', imageUrl);
        
        if (!imageUrl) {
          console.error('图片URL获取失败');
          uni.showToast({
            title: '图片地址获取失败',
            icon: 'none'
          });
          return;
        }
        
        // 确保URL是字符串类型
        imageUrl = String(imageUrl);
        
        // 检查URL是否有效
        if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
          console.error('图片URL格式无效:', imageUrl);
          uni.showToast({
            title: '图片地址格式无效',
            icon: 'none'
          });
          return;
        }
        
        // 获取当前聊天记录中的所有图片，支持左右滑动预览
        previewImageWithSwipe(imageUrl, this.chatList, this.toConImageUrl);
      },
    }
	}
</script>

<style lang="scss" scoped>
	.chat-item {
		display: flex;
		flex-direction: column;
		padding: 20rpx;
		/* 优化整个聊天项的渲染性能 */
		contain: layout style paint;
		will-change: auto;
		/* 减少重绘影响范围 */
		isolation: isolate;
		/* 防止布局跳跃 */
		min-height: 80rpx;
	}
	.chat-time {
		padding: 4rpx 0rpx;
		text-align: center;
		font-size: 22rpx;
		color: #aaaaaa;
	}
	.chat-container {
		display: flex;
		flex-direction: row;
	}
	.chat-location-me {
		flex-direction: row-reverse;
		text-align: right;
	}
	.chat-icon-container {
		margin-top: 12rpx;
	}
	.chat-icon{
		border-radius: 50%;
		background-color: #fff;
		/* 优化头像图片渲染性能 */
		contain: layout style paint;
		will-change: auto;
		transform: translateZ(0); /* 启用硬件加速 */
		/* 防止图片重新加载时的闪烁 */
		transition: opacity 0.2s ease-in-out;
	}
	.chat-content-container {
		margin: 0rpx 15rpx;
	}
	.chat-user-name{
		font-size: 26rpx;
		color: #888888;
	}
	.chat-text-container {
		text-align: left;
		background-color: #fff;
		border-radius: 8rpx;
		padding: 19rpx;
		margin-top: 10rpx;
    font-weight: 500;
    word-break: break-all;
    .name{
      color: #0087b4;
    }
    .name1{
      color: #00d123;;
    }
    .blue{
      color: #0087b4;
    }
	}
	.chat-text-container-me {
    background-color: #0087b4;
    color: #fff;
	}
	.chat-text-container-super {
		display: flex;
		flex-direction: row;
    font-size: 30rpx;
    max-width: 540rpx;
	}
  .chat-imgae{
    border-radius: 8rpx;
    padding: 10rpx 0px;
    margin-top: 10rpx;
    max-width: 500rpx;
    word-break: break-all;
    background-color: transparent; /* 确保容器背景透明 */
    margin-left: 0; /* 确保图片靠左显示 */
    align-self: flex-start; /* 让图片容器靠左对齐 */
    
    /* 为聊天图片容器添加固定尺寸，防止布局跳跃 */
    .chat-content-image {
      border-radius: 8rpx;
      overflow: hidden;
      background-color: transparent; /* 改为透明背景，不显示白色/灰色背景 */
      /* 防止图片闪烁的关键优化 */
      will-change: auto;
      contain: layout style paint;
      transform: translateZ(0); /* 启用硬件加速 */
    }
    
    /* 加载状态样式 */
    .image-loading-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background-color: transparent; /* 透明背景 */
      
      .loading-text {
        margin-top: 10rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    /* 错误状态样式 */
    .image-error-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background-color: transparent; /* 透明背景 */
      border: 1rpx dashed rgba(221, 221, 221, 0.3); /* 半透明边框 */
      
      .error-text {
        margin-top: 10rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    /* 兼容旧版本image标签 */
    image{
      object-fit: cover;
      width: 200rpx;
      height: 253rpx;
    }
  }

  /* 系统消息现代化样式 */
  .system-message-container {
    width: 100%;
    padding: 10rpx 20rpx;
    display: flex;
    justify-content: center;
    animation: systemMessageSlideIn 0.3s ease-out;
  }

  .system-message-wrapper {
    border-radius: 12rpx;
    padding: 16rpx 20rpx;
    min-width: 500rpx;
    max-width: 90%;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10rpx);
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  /* 默认主题 - 蓝紫渐变 */
  .system-message-wrapper.theme-default {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
  }

  /* 信息主题 - 蓝色渐变 */
  .system-message-wrapper.theme-info {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    box-shadow: 0 8rpx 32rpx rgba(79, 172, 254, 0.3);
  }

  /* 成功主题 - 绿色渐变 */
  .system-message-wrapper.theme-success {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    box-shadow: 0 8rpx 32rpx rgba(67, 233, 123, 0.3);
  }

  /* 警告主题 - 橙色渐变 */
  .system-message-wrapper.theme-warning {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    box-shadow: 0 8rpx 32rpx rgba(250, 112, 154, 0.3);
  }

  /* 错误主题 - 红色渐变 */
  .system-message-wrapper.theme-error {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.3);
  }

  .system-message-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2rpx;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
    animation: shimmer 2s infinite;
  }

  .system-message-content {
    color: #ffffff;
  }

  .system-message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
    padding-bottom: 6rpx;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.2);
  }

  .system-message-left {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .system-icon {
    font-size: 24rpx;
    animation: bounce 2s infinite;
    flex-shrink: 0;
  }

  .system-message-title {
    font-size: 24rpx;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
  }

  .system-message-time {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 400;
    flex-shrink: 0;
  }

  .system-message-text {
    font-size: 26rpx;
    line-height: 1.4;
    color: #ffffff;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
    font-weight: 500;
  }

  /* 动画效果 */
  @keyframes systemMessageSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-20rpx) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-6rpx);
    }
    60% {
      transform: translateY(-3rpx);
    }
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .system-message-wrapper.theme-default {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      box-shadow: 0 8rpx 32rpx rgba(15, 52, 96, 0.4);
    }
    
    .system-message-wrapper.theme-info {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      box-shadow: 0 8rpx 32rpx rgba(30, 58, 138, 0.4);
    }
    
    .system-message-wrapper.theme-success {
      background: linear-gradient(135deg, #065f46 0%, #047857 100%);
      box-shadow: 0 8rpx 32rpx rgba(6, 95, 70, 0.4);
    }
    
    .system-message-wrapper.theme-warning {
      background: linear-gradient(135deg, #92400e 0%, #b45309 100%);
      box-shadow: 0 8rpx 32rpx rgba(146, 64, 14, 0.4);
    }
    
    .system-message-wrapper.theme-error {
      background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%);
      box-shadow: 0 8rpx 32rpx rgba(153, 27, 27, 0.4);
    }
  }
</style>