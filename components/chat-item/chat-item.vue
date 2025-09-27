<template>
	<view class="chat-item">
<!--		<text class="chat-time" v-if="item.time&&item.time.length">
			{{item.time}}
		</text>-->
		<view :class="{'chat-container':true,'chat-location-me':item.sender == uid}">
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
              mode="aspectFit" 
              width="350rpx" 
              height="250rpx"
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
      object-fit: contain;
      width: 440rpx;
      height: 302rpx;
    }
  }
</style>