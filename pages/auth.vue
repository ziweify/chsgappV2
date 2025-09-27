<template>
  <view class="layout">
    <!-- 加载中状态 -->
    <view v-if="loading" class="loading-container">
      <u-loading-icon color="#0087B4" size="60"></u-loading-icon>
      <view class="loading-text">加载中...</view>
    </view>

    <!-- 链接无效状态 -->
    <view v-else-if="!token" class="error-container">
      <u-icon name="close-circle" color="#ff4d4d" size="120"></u-icon>
      <view class="error-title">链接无效</view>
      <view class="error-desc">访问链接已失效或不存在</view>
    </view>

    <!-- 错误信息状态 -->
    <view v-else-if="errorMsg" class="error-container">
      <u-icon name="info-circle" color="#ff9f4d" size="120"></u-icon>
      <!-- <view class="error-title">授权失败</view> -->
      <view class="error-desc">{{errorMsg}}</view>
      <u-button @click="retryAuth" color="#0087B4" style="margin-top: 40rpx;">重试</u-button>
    </view>

    <!-- 授权成功状态 -->
    <view v-else-if="authSuccess" class="success-container">
      <u-icon name="checkmark-circle" color="#0087B4" size="120"></u-icon>
      <view class="success-title">授权成功</view>
      <view class="success-desc">正在跳转...</view>
      
      <!-- 显示登录信息 -->
      <!-- <view v-if="loginInfo" class="login-info">
        <view class="info-item">
          <text class="label">用户名：</text>
          <text class="value">{{loginInfo.username}}</text>
        </view>
        <view class="info-item" v-if="loginInfo.name">
          <text class="label">昵称：</text>
          <text class="value">{{loginInfo.name}}</text>
        </view>
        <view class="info-item" v-if="loginInfo.game_name">
          <text class="label">游戏：</text>
          <text class="value">{{loginInfo.game_name}}</text>
        </view>
      </view> -->
    </view>
  </view>
</template>

<script>
export default {
  // 注意：auth页面不使用mixin，避免触发登录拦截
  // mixins: [uni.$mymixin],
  data() {
    return {
      loading: true,
      token: '',
      errorMsg: '',
      authSuccess: false,
      loginInfo: null
    };
  },
  onLoad(options) {
    // 获取token的多种方式
    this.token = this.getTokenFromPath(options);
    
    // 开始授权验证
    this.handleAuth();
  },
  computed:{
    
  },
  methods: {
    getTokenFromPath(options) {
      // 方式1: 从UniApp查询参数中获取
      if (options.token) {
        return options.token;
      }
      
      // 方式2: 从H5 URL路径中解析 (例如: /462b23c4d4552aec24ff9ec5f5663410)
      // #ifdef H5
      try {
        const path = window.location.pathname;
        // 匹配形如 /token_value 的格式（直接在根路径）
        const tokenMatch = path.match(/^\/([A-Za-z0-9]{20,})$/);
        if (tokenMatch && tokenMatch[1]) {
          return tokenMatch[1];
        }
        
        // 兼容查询参数方式
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
          return token;
        }
      } catch (error) {
        console.warn('H5路径解析失败:', error);
      }
      // #endif
      
      return '';
    },
    
    async handleAuth() {
      // 如果没有token，直接返回
      if (!this.token) {
        this.loading = false;
        return;
      }

      try {
        // 调用后端接口进行token验证
        const res = await this.$u.api.common.tokenauth({ token: this.token });
        
        // 验证成功
        this.authSuccess = true;
        this.loginInfo = res.data;
        this.loading = false;

        // 延迟跳转到游戏页面或其他页面
        setTimeout(() => {
          this.redirectToGame();
        }, 800);
        
      } catch (error) {
        // 验证失败，显示错误信息
        this.errorMsg = error.msg || '授权验证失败，请重试';
        this.loading = false;
        //回到登录页面
        // #ifdef H5
        // 清理浏览器URL中的token
        if (window.history && window.history.replaceState) {
          const currentPath = window.location.pathname;
          // 如果是token格式的路径（直接在根路径），清理URL
          if (currentPath.match(/^\/([A-Za-z0-9]{20,})$/)) {
            // 清理URL，跳转到基础路径
            const baseUrl = window.location.origin + '/';
            window.history.replaceState(null, '', baseUrl);
          }
          // 清理查询参数中的token
          const url = new URL(window.location);
          if (url.searchParams.has('token')) {
            url.searchParams.delete('token');
            window.history.replaceState(null, '', url.toString());
          }
        }
        // #endif
        setTimeout(()=>{
          uni.reLaunch({
            url:'/pages/common/login'
          })
			},1200)
      }
    },
    
    retryAuth() {
      this.loading = true;
      this.errorMsg = '';
      this.authSuccess = false;
      this.loginInfo = null;
      
      // 重新执行授权
      setTimeout(() => {
        this.handleAuth();
      }, 500);
    },
    
    redirectToGame() {
      console.log(this.loginInfo);
      uni.setStorageSync('isShowNotice', false);
      uni.setStorageSync('token', this.loginInfo.token);
      uni.setStorageSync('userInfo', this.loginInfo.userInfo);
      uni.setStorageSync('avatar', this.loginInfo.userInfo.avatar);
      uni.setStorageSync('expiresTime', this.loginInfo.expires_time);
      // 重置WebSocket退出状态，允许重新连接
      /* if (uni.$socketUtils && uni.$socketUtils.resetExitStatus) {
        uni.$socketUtils.resetExitStatus();
      } */
      // 根据登录信息跳转到对应的游戏页面
      uni.setStorageSync('cgid', this.loginInfo.gid);
      uni.setStorageSync('ctemplate', this.loginInfo.template);
      
      // #ifdef H5
      // 清理浏览器URL中的token
      if (window.history && window.history.replaceState) {
        const currentPath = window.location.pathname;
        // 如果是token格式的路径（直接在根路径），清理URL
        if (currentPath.match(/^\/[A-Za-z0-9]{20,}$/)) {
          // 清理URL，跳转到基础路径
          const baseUrl = window.location.origin + '/';
          window.history.replaceState(null, '', baseUrl);
        }
        // 清理查询参数中的token
        const url = new URL(window.location);
        if (url.searchParams.has('token')) {
          url.searchParams.delete('token');
          window.history.replaceState(null, '', url.toString());
        }
      }
      // #endif

      // 检查是否需要设置初始密码
      if (this.loginInfo.modifypwd == 1) {
        uni.redirectTo({
          url: '/pages/common/setFirstPassword',
          fail: (err) => {
            console.error('跳转密码设置失败:', err);
            // fallback到原方法
            uni.$utils.jump('pages/common/setFirstPassword');
          }
        });
        return;
      }
      
      uni.redirectTo({
        url: '/copage/chat',
        fail: (err) => {
          console.error('跳转游戏失败:', err);
          // fallback到原方法
          uni.$utils.jump('copage/chat');
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  background: linear-gradient(135deg, #f5f9ff 0%, #e8f4f8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-text {
  margin-top: 30rpx;
  font-size: 32rpx;
  color: #0087B4;
  font-weight: 500;
}

.error-container, .success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.error-title, .success-title {
  margin-top: 30rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
}

.error-desc, .success-desc {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
}

.login-info {
  margin-top: 40rpx;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  width: 100%;
  max-width: 500rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #eee;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.value {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}
</style>
