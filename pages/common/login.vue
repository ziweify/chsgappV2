<template>
  <view class="login-container" :class="{'keyboard-open': isKeyboardOpen}">
    <view class="logo-box toll" :style="{'paddingTop':50+winobj.statusBarHeight+'px'}">
      <image src="/static/img/mlogo.png"></image>
    </view>
    <view class="content">
      <view class="form">
        <view class="input-box-wrap">
          <view class="input-bg username">
            <input v-model="login.account" 
                   type="text" 
                   placeholder="请输入账号" 
                   class="input-box"
                   maxlength="20"
                   autocomplete="username"
                   @input="onAccountInput"
                   @confirm="focusPassword">
          </view>
          <view class="input-bg password" style="display: flex;">
            <input v-model="login.password" 
                   type="text" 
                   class="input-box"
                   placeholder="请输入密码" 
                   :password="eyename == 'eye'" 
                   autocomplete="current-password"
                   maxlength="20"
                   @input="onPasswordInput"
                   @confirm="focusCode">
            <u-icon style="margin-right: 14rpx;height: 42px;" 
                    color="#31C9E8" 
                    size="22" 
                    v-show="eyename == 'eye'"
                    :name="eyename" 
                    @click="togglePasswordVisibility"></u-icon>
            <u-icon style="margin-right: 14rpx;height: 42px;" 
                    color="#31C9E8" 
                    size="22" 
                    v-show="eyename == 'eye-fill'"
                    :name="eyename" 
                    @click="togglePasswordVisibility"></u-icon>
          </view>

          <view class="input-yzm">
            <input v-model="login.code" 
                   type="number" 
                   placeholder="请输入验证码" 
                   class="input-box"
                   maxlength="6"
                   autocomplete="off"
                   @input="onCodeInput"
                   @confirm="bindLogin">
            <view class="image-wrap" @tap="refreshCaptcha">
              <image v-if="base64" :src="base64" mode="aspectFit"></image>
              <view v-else class="captcha-placeholder">
                <text>{{ captchaLoading ? '加载中...' : '点击刷新' }}</text>
              </view>
            </view>
          </view>

        </view>
        <view class="check-box-wrap">
          <view :class="checkbox" @click="jizhumima">记住密码</view>
        </view>
        <view class="submit-btn" @tap="bindLogin()">
          <button class="submit-btn"></button>
        </view>
      </view>
      <view class="content-bottom">
        <image src="/static/img/wx.png" lazy="loaded" @click="wxTo"></image>
        <image src="/static/img/dy.png" lazy="loaded" @click="dyTo"></image>
        <image src="/static/img/fz.png" lazy="loaded" @click="fzTo"></image>
        <image v-if="open_register == 1" src="/static/img/resTo.png" lazy="loaded" @click="resTo"></image>
      </view>

    </view>
    <u-modal @close="hideModel" @confirm="hideModel" :show="show" confirmColor="#ee0a24" confirmText="确认"
             :closeOnClickOverlay="true">
      <view class="slot-content" style="padding:20rpx;font-size: 30rpx;line-height: 42rpx;">
        <rich-text :nodes="content"></rich-text>
      </view>
    </u-modal>
  </view>
</template>
<script>
export default {
  data() {
    return {
      open_register:0,
      hidepassword: true,
      eyename: 'eye',
      show: false,
      check1: false,
      title: '',
      content: '',
      checkbox: 'check-box',
      isSubmitting: false, // 防止重复提交
      captchaLoading: false, // 验证码加载状态
      isKeyboardOpen: false, // 键盘是否弹出
      initialHeight: 0, // 初始窗口高度
      currentHeight: 0, // 当前窗口高度
      button: [{
        text: '确定',
        backgroundColor: 'tn-bg-indigo',
        fontColor: '#ffffff',
      }],
      login: {
        account: '',
        password: '',
        code: '',
        key: '',
        logintype: 0
      },
      base64: ''
    };
  },
  computed: {
    winobj() {
      return this.$u.sys();
    }
  },
  onLoad(options) {
    this.open_register = uni.getStorageSync('open_register');
    try {
      // 检查是否是授权链接访问
      const token = this.detectAuthToken(options);
      if (token) {
        //console.log('检测到授权访问，跳转到auth页面，token:', token);
        this.redirectToAuth(token);
        return;
      }

      // 初始化页面
      this.initPage();
      
    } catch (error) {
      console.error('页面初始化失败:', error);
      this.$u.toast('页面初始化失败');
    }
  },
  
  onReady() {
    // 页面准备完毕后初始化键盘监听
    this.initKeyboardListener();
  },
  
  onShow() {
    // 页面显示时重新获取验证码（如果没有的话）
    if (!this.base64) {
      this.captcha();
    }
    
    // 重新初始化键盘监听（防止从其他页面返回时失效）
    this.initKeyboardListener();
  },
  
  onHide() {
    // 页面隐藏时清理状态
    this.isSubmitting = false;
    this.captchaLoading = false;
    this.removeKeyboardListener();
  },
  
  onUnload() {
    // 页面卸载时移除监听器
    this.removeKeyboardListener();
  },
  methods: {
    // 检测授权token
    detectAuthToken(options) {
      // 方式1: 从UniApp参数中获取
      if (options && options.token) {
        return options.token;
      }
      
      // 方式2: 从H5 URL路径中解析 (例如: /SG677907174692749312)
      // #ifdef H5
      try {
        const path = window.location.pathname;
        
        // 匹配形如 /token_value 的格式（直接在根路径）
        const tokenMatch = path.match(/^\/([A-Za-z0-9]{20,})$/);
        if (tokenMatch && tokenMatch[1]) {
          return tokenMatch[1];
        }
        
        // 匹配 /pages/auth/token_value 格式
        const authMatch = path.match(/\/pages\/auth\/(.+)$/);
        if (authMatch && authMatch[1]) {
          return authMatch[1];
        }
        
        // 兼容旧的查询参数方式
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
          return token;
        }
        
      } catch (e) {
        console.error('H5检查token失败:', e);
      }
      // #endif
      
      return null;
    },
    
    // 跳转到授权页面
    redirectToAuth(token) {
      try {
        // UniApp不支持动态路径参数，使用查询参数方式
        uni.redirectTo({
          url: `/pages/auth?token=${token}`
        });
      } catch (error) {
        console.error('跳转授权页面失败:', error);
        this.$u.toast('页面跳转失败');
      }
    },
    
    // 页面初始化
    initPage() {
      try {
        // 获取验证码
        this.captcha();
        
        // 恢复保存的账号密码
        this.restoreSavedCredentials();
        
        // 设置登录类型
        this.setLoginType();
        
        // 设置记住密码状态
        this.initRememberPassword();
        
      } catch (error) {
        console.error('页面初始化失败:', error);
      }
    },
    
    // 初始化键盘监听器
    initKeyboardListener() {
      try {
        // 获取初始窗口高度
        uni.getSystemInfo({
          success: (res) => {
            this.initialHeight = res.windowHeight;
            this.currentHeight = res.windowHeight;
            
            // 只在H5平台启用键盘监听
            // #ifdef H5
            if (typeof uni.onWindowResize === 'function') {
              uni.onWindowResize(this.handleWindowResize);
            } else {
              // 备用方案：使用原生window事件
              window.addEventListener('resize', this.handleNativeResize);
            }
            // #endif
          },
          fail: (error) => {
            console.error('获取系统信息失败:', error);
          }
        });
        
      } catch (error) {
        console.error('初始化键盘监听失败:', error);
      }
    },
    
    // 移除键盘监听器
    removeKeyboardListener() {
      try {
        // #ifdef H5
        if (typeof uni.offWindowResize === 'function') {
          uni.offWindowResize(this.handleWindowResize);
        } else {
          window.removeEventListener('resize', this.handleNativeResize);
        }
        // #endif
      } catch (error) {
        console.error('移除键盘监听失败:', error);
      }
    },
    
    // 处理原生window resize事件
    handleNativeResize() {
      const currentHeight = window.innerHeight;
      const res = {
        size: {
          windowHeight: currentHeight
        }
      };
      this.handleWindowResize(res);
    },
    
    // 处理窗口大小变化
    handleWindowResize(res) {
      try {
        this.currentHeight = res.size.windowHeight;
        const heightDiff = this.initialHeight - this.currentHeight;
        
        // 当高度减少超过150px时，认为键盘弹出
        const keyboardThreshold = 150;
        const newKeyboardState = heightDiff > keyboardThreshold;
        
        if (newKeyboardState !== this.isKeyboardOpen) {
          this.isKeyboardOpen = newKeyboardState;
          this.updateKeyboardStatus();
        }
        
      } catch (error) {
        console.error('处理窗口变化失败:', error);
      }
    },
    
    // 更新键盘状态对应的样式
    updateKeyboardStatus() {
      // 由于使用了Vue的响应式class绑定，这里只需要触发视图更新
      this.$forceUpdate();
    },
    
    // 恢复保存的凭据
    restoreSavedCredentials() {
      try {
        const u_username = uni.getStorageSync('u_username');
        const u_password = uni.getStorageSync('u_password');
        
        if (u_username && u_password) {
          this.login.account = u_username;
          this.login.password = u_password;
          this.check1 = true;
          this.checkbox = 'check-box1';
        }
      } catch (error) {
        console.error('恢复保存的凭据失败:', error);
      }
    },
    
    // 设置登录类型
    setLoginType() {
      try {
        const os = this.$u.os();
        if (os === 'android' || os === 'ios') {
          this.login.logintype = 1; // APP
        } else if (os === 'h5') {
          this.login.logintype = 2; // H5
        } else {
          this.login.logintype = 0; // 其他
        }
      } catch (error) {
        console.error('设置登录类型失败:', error);
        this.login.logintype = 0;
      }
    },
    
    // 初始化记住密码状态
    initRememberPassword() {
      try {
        const savedAccount = uni.getStorageSync('u_username');
        if (savedAccount) {
          this.check1 = true;
          this.checkbox = 'check-box1';
        }
      } catch (error) {
        console.error('初始化记住密码状态失败:', error);
      }
    },
    hideModel() {
      this.show = !this.show;
    },
    jizhumima() {
      this.check1 = !this.check1
      if (this.check1) {
        this.checkbox = 'check-box1';
      } else {
        this.checkbox = 'check-box';
      }
    },
    // 输入事件处理
    onAccountInput(e) {
      // 移除空格和特殊字符
      this.login.account = e.detail.value.replace(/\s+/g, '');
    },
    
    onPasswordInput(e) {
      this.login.password = e.detail.value;
    },
    
    onCodeInput(e) {
      // 只允许数字
      this.login.code = e.detail.value.replace(/\D/g, '');
    },
    
    // 焦点切换
    focusPassword() {
      // 在小程序中可能需要使用uni.createSelectorQuery来实现
      //console.log('切换到密码输入框');
    },
    
    focusCode() {
      //console.log('切换到验证码输入框');
    },
    
    // 密码显示切换
    togglePasswordVisibility() {
      this.eyename = this.eyename === 'eye' ? 'eye-fill' : 'eye';
    },
    
    // 刷新验证码
    refreshCaptcha() {
      this.captcha();
    },
    
    clearInput(en) {
      this.eyename = en;
    },
    homeTo() {
      uni.navigateTo({
        url: '/pages/home/home'
      })
    },
    wxTo() {
      this.content = '由于近期风控监管力度较大，H5暂时停止抖音授权登录服务，如需抖音授权登录，请下载App进行授权登录，谢谢！'
      this.show = true;
    },
    fzTo() {
      uni.$utils.jump('agent/login/login');
    },
    dyTo() {
      this.content = '由于近期风控监管力度较大，H5暂时停止抖音授权登录服务，如需抖音授权登录，请下载App进行授权登录，谢谢！'
      this.show = true;
    },
    resTo() {
      uni.$utils.jump("pages/common/register");
    },
    bindLogin() {
      if (uni.$socketUtils && uni.$socketUtils.isOpenSocket) {
        uni.$socketUtils.closeSocket('user');
      }
      
      // 防止重复提交
      if (this.isSubmitting) {
        return;
      }
      
      this.$u.throttle(async () => {
        try {
          // 参数验证
          if (!this.validateLoginForm()) {
            return;
          }
          
          this.isSubmitting = true;
          uni.showLoading({title: '登录中', mask: true});
          
          const loginData = {
            ...this.login,
            account: this.$u.trim(this.login.account),
            password: this.$u.trim(this.login.password),
            code: this.$u.trim(this.login.code)
          };
          
          const res = await this.$u.api.member.login(loginData);
          
          // 存储用户信息
          this.saveUserInfo(res.data);
          
          // 保存密码设置
          this.savePasswordSettings();
          
          // 重置WebSocket退出状态
          //this.resetSocketStatus();
          
          uni.hideLoading();
          this.$u.toast('登录成功');
          
          // 延迟跳转，确保存储完成
          setTimeout(() => {
            uni.$utils.jump("pages/home/home", "reLaunch");
          }, 500);
          
        } catch (error) {
          uni.hideLoading();
          this.handleLoginError(error);
        } finally {
          this.isSubmitting = false;
        }
      }, 1000);
    },
    
    // 表单验证
    validateLoginForm() {
      if (!this.$u.trim(this.login.account)) {
        this.$u.toast('请输入账号');
        return false;
      }
      
      if (this.login.account.length < 3) {
        this.$u.toast('账号长度不能少于3位');
        return false;
      }
      
      if (!this.$u.trim(this.login.password)) {
        this.$u.toast('请输入密码');
        return false;
      }
      
      if (this.login.password.length < 6) {
        this.$u.toast('密码长度不能少于6位');
        return false;
      }
      
      if (!this.$u.trim(this.login.code)) {
        this.$u.toast('请输入验证码');
        return false;
      }
      
      return true;
    },
    
    // 保存用户信息
    saveUserInfo(data) {
      try {
        uni.setStorageSync('isShowNotice', false);
        uni.setStorageSync('token', data.token);
        uni.setStorageSync('userInfo', data.userInfo);
        uni.setStorageSync('avatar', data.userInfo?.avatar || '');
        uni.setStorageSync('expiresTime', data.expires_time);
      } catch (error) {
        console.error('保存用户信息失败:', error);
      }
    },
    
    // 保存密码设置
    savePasswordSettings() {
      try {
        if (this.check1) {
          uni.setStorageSync('u_username', this.login.account);
          uni.setStorageSync('u_password', this.login.password);
        } else {
          uni.removeStorageSync('u_username');
          uni.removeStorageSync('u_password');
        }
      } catch (error) {
        console.error('保存密码设置失败:', error);
      }
    },
    
    // 重置Socket状态
    resetSocketStatus() {
      try {
        if (uni.$socketUtils && uni.$socketUtils.resetExitStatus) {
          uni.$socketUtils.resetExitStatus();
          //console.log('登录成功，已重置WebSocket退出状态');
        }
      } catch (error) {
        //console.error('重置Socket状态失败:', error);
      }
    },
    
    // 处理登录错误
    handleLoginError(error) {
      const errorMsg = error?.msg || error?.message || '登录失败，请重试';
      this.$u.toast(errorMsg);
      
      // 登录失败时刷新验证码
      this.captcha();
      
      // 清空验证码输入
      this.login.code = '';
      
      console.error('登录失败:', error);
    },
    captcha() {
      // 防止重复请求
      if (this.captchaLoading) {
        return;
      }
      
      this.captchaLoading = true;
      
      this.$u.api.common.getcaptcha().then(res => {
        if (res && res.data) {
          this.login.key = res.data.key;
          this.base64 = 'data:image/png;base64,' + res.data.base64;
        } else {
          throw new Error('验证码数据格式错误');
        }
      }).catch(err => {
        console.error('验证码获取失败:', err);
        this.$u.toast("验证码获取失败，请重试");
        
        // 设置默认占位图
        this.base64 = '';
        this.login.key = '';
        
        // 3秒后自动重试
        setTimeout(() => {
          if (!this.base64) {
            this.captcha();
          }
        }, 3000);
      }).finally(() => {
        this.captchaLoading = false;
      });
    }
  }
}
</script>
<style lang="scss" scoped>
.login-container {
  width: 100%;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh; /* 动态视口高度，支持现代浏览器 */
  position: relative;
  overflow-x: hidden;
  background: url(/static/img/bg.jpg) no-repeat center center;
  background-size: cover;
  background-attachment: fixed;
}

/* 移动端键盘适配 */
@media screen and (max-width: 768px) {
  .login-container {
    background: none; /* 移动端不直接设置背景 */
    height: 100vh;
    height: 100dvh;
    transition: height 0.3s ease; /* 平滑过渡 */
    /* 防止内容被键盘遮挡的通用处理 */
    padding-bottom: env(keyboard-inset-height, 0px);
    box-sizing: border-box;
  }
  
  /* 移动端使用固定背景层，防止键盘顶起 */
  .login-container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background: url(/static/img/bg.jpg) no-repeat center center;
    background-size: cover;
    z-index: -1;
    will-change: transform; /* 优化性能 */
    backface-visibility: hidden; /* 防止闪烁 */
  }
  
  /* 键盘弹出时调整容器 */
  .login-container.keyboard-open {
    height: auto;
    min-height: 50vh; /* 键盘弹出时减少最小高度 */
    overflow-y: visible;
  }
  
  /* 键盘弹出时内容区域调整 */
  .login-container.keyboard-open .content {
    padding-bottom: 20px; /* 增加底部间距 */
  }
  
  /* 键盘弹出时隐藏底部按钮区域 */
  .login-container.keyboard-open .content-bottom {
    display: none; /* 键盘弹出时隐藏底部图标 */
  }
}

/* 键盘收起时的动画 */
.login-container:not(.keyboard-open) {
  transition: all 0.3s ease;
}

/* 确保在所有设备上背景都固定 */
@supports (height: 100dvh) {
  .login-container::before {
    height: 100dvh !important;
  }
}

/* 兼容iOS Safari的处理 */
@supports (-webkit-touch-callout: none) {
  @media screen and (max-width: 768px) {
    .login-container::before {
      position: absolute;
      position: fixed;
    }
  }
}

.content {
  flex: 1;
  margin: 0 15px;
}

.logo-box {
  min-height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-box.toll image {
  width: 132px;
  height: 60px;
  display: block;
}


.content .content-bottom {
  display: flex;
  align-content: center;
  justify-content: space-between;
  padding: 5px;
  margin-top: 30px;
}

.content .content-bottom image {
  width: 68px;
  height: 66px;
}

.form {
  margin-top: 30px;
  padding-bottom: 20px;
  background: url(../../static/img/login_bg.png);
  background-size: 100% 100%;
  background-repeat: no-repeat
}


.input-box-wrap {
  padding-top: 40px;
}

.input-bg {
  height: 42px;
  box-sizing: border-box;
  background: url(../../static/img/input1.png) no-repeat;
  background-size: 100% 100%;
  overflow: hidden;
  position: relative;
  margin: 15px 20px;
}

.input-bg.username:before {
  content: "";
  position: absolute;
  display: inline-block;
  top: 10px;
  left: 17px;
  width: 17px;
}

.input-bg.username:before {
  height: 19px;
  background: url(../../static/img/p1.png) no-repeat;
    background-size: 100% 100%;
}

.input-bg.password:before {
  content: "";
  position: absolute;
  top: 10px;
  left: 17px;
  width: 17px;
  height: 19px;
  display: inline-block;
  background: url(../../static/img/p2.png) no-repeat;
  background-size: 100% 100%;
}

.input-bg input {
  width: 100%;
  height: 42px;
  padding-left: 50px;
  padding-right: 10px;
  font-size: 14px;
  background: none !important;
  background-color: transparent !important;
  background-image: none !important;
  border: none;
  box-sizing: border-box;
  line-height: 42px;
}

/* 彻底解决所有浏览器自动填充背景色问题 */
.input-bg input:-webkit-autofill,
.input-bg input:-webkit-autofill:hover,
.input-bg input:-webkit-autofill:focus,
.input-bg input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  box-shadow: 0 0 0 1000px transparent inset !important;
  background-color: transparent !important;
  background-image: none !important;
  -webkit-text-fill-color: inherit !important;
  color: inherit !important;
  transition: background-color 5000s ease-in-out 0s !important;
  -webkit-transition: background-color 5000s ease-in-out 0s !important;
}

/* 强制覆盖所有可能的自动填充样式 */
.input-bg input:-webkit-autofill::first-line {
  color: inherit !important;
  font-family: inherit !important;
  font-size: inherit !important;
}

/* Firefox 自动填充处理 */
.input-bg input:-moz-autofill {
  background-color: transparent !important;
  background-image: none !important;
  color: inherit !important;
  filter: none !important;
}

/* 标准 autofill 处理 */
.input-bg input:autofill {
  background-color: transparent !important;
  background-image: none !important;
  color: inherit !important;
}

/* Edge 和 IE 兼容性处理 */
.input-bg input:-ms-input-placeholder {
  background-color: transparent !important;
}

/* 额外的强制透明处理 - 只针对账号和密码框 */
.input-bg.username input,
.input-bg.password input {
  background: none !important;
  background-color: transparent !important;
  background-image: none !important;
}

/* 针对密码框的特殊处理 */
.input-bg.password input:-webkit-autofill,
.input-bg.password input:-webkit-autofill:hover,
.input-bg.password input:-webkit-autofill:focus,
.input-bg.password input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  box-shadow: 0 0 0 1000px transparent inset !important;
  background: transparent !important;
  -webkit-text-fill-color: inherit !important;
}

/* 针对用户名框的特殊处理 */
.input-bg.username input:-webkit-autofill,
.input-bg.username input:-webkit-autofill:hover,
.input-bg.username input:-webkit-autofill:focus,
.input-bg.username input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  box-shadow: 0 0 0 1000px transparent inset !important;
  background: transparent !important;
  -webkit-text-fill-color: inherit !important;
}

.check-box-wrap {
  text-align: right;
  padding-right: 20px;
}

.check-box {
  position: relative;
  display: inline-block;
  padding-left: 24px;
  font-size: 14px;
  line-height: 1.1;
}

.check-box:before {
  content: "";
  position: absolute;
  left: 0;
  display: inline-block;
  width: 17px;
  height: 17px;
  background: url(../../static/img/p3.png) no-repeat;
  background-size: 100% 100%
}

.check-box.checked:before {
  background: url(../../static/img/p4.png) no-repeat;
  background-size: 100% auto
}

.submit-btn {
  padding: 0 20px;
  margin-top: 20px;
}

.submit-btn button {
  width: 100%;
  height: 44px;
  border: none;
  background: url(../../static/img/login_btn2.png) no-repeat;
  background-size: 100% 100%
}


.input-yzm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  box-sizing: border-box;
  position: relative;
  margin: 15px 20px;
}

.input-yzm:before {
  content: "";
  position: absolute;
  display: inline-block;
  top: 10px;
  left: 17px;
  width: 17px;
  height: 19px;
  background: url(../../static/img/p5.png) no-repeat;
  background-size: 100% 100%
}

.input-yzm input {
  border: none;
  flex: 1;
  height: 42px;
  border-radius: 24px;
  padding-left: 50px;
  font-size: 14px;
  line-height: 42px;
  background-color: #dae6f1;
  margin-right: 10px;
}

/* 验证码输入框自动填充样式处理 - 保持原有背景色 */
.input-yzm input:-webkit-autofill,
.input-yzm input:-webkit-autofill:hover,
.input-yzm input:-webkit-autofill:focus,
.input-yzm input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px #dae6f1 inset !important;
  box-shadow: 0 0 0 1000px #dae6f1 inset !important;
  background-color: #dae6f1 !important;
  background-image: none !important;
  -webkit-text-fill-color: inherit !important;
  color: inherit !important;
  transition: background-color 5000s ease-in-out 0s !important;
  -webkit-transition: background-color 5000s ease-in-out 0s !important;
}

.input-yzm input:-webkit-autofill::first-line {
  color: inherit !important;
  font-family: inherit !important;
  font-size: inherit !important;
}

.input-yzm input:-moz-autofill {
  background-color: #dae6f1 !important;
  background-image: none !important;
  color: inherit !important;
  filter: none !important;
}

.input-yzm input:autofill {
  background-color: #dae6f1 !important;
  background-image: none !important;
  color: inherit !important;
}

/* 最强力的自动填充背景色移除方案 */
.input-bg input[autocomplete],
.input-bg input[autocomplete="username"],
.input-bg input[autocomplete="current-password"],
.input-bg input[autocomplete="new-password"] {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}

/* 使用 CSS 变量和动画的方法 */
@keyframes autofill {
  to {
    color: inherit;
    background: transparent;
  }
}

.input-bg input:-webkit-autofill {
  animation-name: autofill;
  animation-fill-mode: both;
}

/* 覆盖可能的内联样式 */
.input-bg input[style*="background-color"] {
  background-color: transparent !important;
}

.input-bg input[style*="background"] {
  background: transparent !important;
}

/* 新版浏览器支持的属性 */
.input-bg input {
  color-scheme: light;
}

/* 终极解决方案 - 使用CSS变量和现代浏览器特性 */
.input-bg {
  --autofill-bg: transparent;
}

.input-bg input {
  background-color: var(--autofill-bg) !important;
}

/* 覆盖所有可能的自动填充选择器 */
.input-bg input:-webkit-autofill,
.input-bg input:-webkit-autofill:hover,
.input-bg input:-webkit-autofill:focus,
.input-bg input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
  box-shadow: 0 0 0 1000px transparent inset !important;
  background-color: transparent !important;
  background-image: none !important;
}

/* 特别针对密码管理器 */
.input-bg input[data-lpignore="true"],
.input-bg input[data-form-type],
.input-bg input[data-lastpass-icon-added] {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
}

/* 强制保持验证码输入框的背景色 */

.input-yzm .image-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  width: 200rpx;
  height: 38px;
}

.input-yzm image {
  max-width: 100%;
  height: 100%;
}

.captcha-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  border: 1px dashed #ccc;
  border-radius: 4px;
}

.captcha-placeholder text {
  font-size: 12px;
  color: #999;
}

.check-box1 {
  position: relative;
  display: inline-block;
  font-size: 14px;
  padding-left: 24px;
  line-height: 1.1
}

.check-box1:before {
  content: "";
  position: absolute;
  left: 0;
  display: inline-block;
  width: 17px;
  height: 17px;
  background: url(../../static/img/p6.png) no-repeat;
  background-size: 100% auto;
}

.check-box1:before {
  background: url(../../static/img/p4.png) no-repeat;
  background-size: 100% auto;
}
</style>