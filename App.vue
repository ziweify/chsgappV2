<script>
	//import pageAnimation from './components/page-animation'
	export default {
		//mixins: [pageAnimation],
		// 此处globalData为了演示其作用，不是uView框架的一部分
		globalData: {
      checkConfigTimer:null,
		},
    onLoad(){

    },
    onHide() {
      console.log('📱 App onHide - 应用进入后台');
      // 记录进入后台的时间
      this.globalData.appHideTime = Date.now();
      
      // 触发可见性管理器的隐藏事件（非H5环境）
      // #ifndef H5
      if (uni.$visibilityManager) {
        uni.$visibilityManager.handleVisibilityChange(false, 'app_hide');
      }
      // #endif
    },
    onShow() {
      const hideTime = this.globalData.appHideTime;
      const hiddenDuration = hideTime ? Date.now() - hideTime : 0;
      console.log(`📱 App onShow - 应用恢复前台，后台时长: ${(hiddenDuration/1000).toFixed(1)}秒`);
      
      // 触发可见性管理器的显示事件（非H5环境）
      // #ifndef H5
      if (uni.$visibilityManager) {
        uni.$visibilityManager.handleVisibilityChange(true, 'app_show');
      }
      // #endif
      
      // 刷新站点配置
      this.getSiteConfig();
      
      // 如果后台时间超过 5 秒，执行额外的恢复操作
      if (hiddenDuration > 5000) {
        console.log('⚡ 后台时间较长，执行深度恢复');
        
        // 1. 检查 WebSocket 连接状态
        if (uni.$socketUtils && !uni.$socketUtils.isOpenSocket && !uni.$socketUtils.isUserClose) {
          console.log('🔄 检测到 WebSocket 断开，尝试重连');
          setTimeout(() => {
            uni.$socketUtils.debouncedReconnect('app_show_deep_recovery', true);
          }, 800);
        }
        
        // 2. 触发全局事件，通知各页面刷新数据
        uni.$emit('app_resumed_from_background', { hiddenDuration });
      }
    },
		onLaunch() {
      this.getSiteConfig();
      clearInterval(this.globalData.checkConfigTimer);
      this.globalData.checkConfigTimer = null;
      this.globalData.checkConfigTimer = setInterval(() => {
        this.getSiteConfig();
      },20000);
			//自定义缓存清理方法，应放在onLaunch最上方
			//this.clearStorage()//

			//检测是否登陆，如果未登录，跳转到登录页面
			//this.checkIsLogin()
			
			//开启socket
			//this.$store.dispatch("startSocket")
			
			//获取法币的汇率
			//this.getFiatExchageRate()
		},
		methods: {
			clearStorage() {
				//当前版本号
				const currentH5Version = 1.0
				//缓存中的版本号
				const h5Version = uni.getStorageSync('h5Version') || 0
				//如果当前版本号大于缓存中的版本号，则清除缓存
				if (currentH5Version > h5Version) {
					uni.clearStorageSync()
					//清除缓存后，保存当前版本号
					uni.setStorageSync('h5Version', currentH5Version)
				}
			},
      getSiteConfig() {
        this.$u.api.common.getSiteConfig().then((res) => {
          let data = res.data;
          uni.setStorageSync('headImageDomain',data.headImageDomain);
          uni.setStorageSync('chatImageDomain',data.chatImageDomain);
          uni.setStorageSync('openImageDomain',data.openImageDomain);
		  uni.setStorageSync('open_register',data.open_register);
          uni.setStorageSync('siteConfig',data);
        })
			},
		}
	}
</script>
<style>
	/*page,html,body{
		background-color: rgb(20, 21, 26);
	}
	.notice-popup,.notice-popup .u-mode-center-box, .notice-popup .u-mode-center-box>uni-scroll-view>.uni-scroll-view,
	.notice-popup .u-mode-center-box>uni-scroll-view>.uni-scroll-view>.uni-scroll-view {
		overflow: unset!important;
	}*/
</style>
<style lang="scss">
	//@import 'components/page-animation/index.css';//
  @import "@/uni_modules/uview-ui/index.scss";
	//@import "common/demo.scss";
	//@import "static/iconfont/iconfont.css";
	//@import 'static/animate.min.css';
	
/*	.icon {
	       width: 1em; height: 1em;
	       vertical-align: -0.15em;
	       fill: currentColor;
	       overflow: hidden;
	    }
		
	image{
		will-change: transform
	}*/
	
/*	@font-face {
		font-family: 'Din';
		src: url('static/DIN-Regular.ttf');
	}
	
	@font-face {
		font-family: 'puhui';
		src: url('static/puhui.ttf');
	}*/

/* #ifndef APP-NVUE */
page,body,html {
  font: 28rpx PingFangSC-Medium, PingFang SC;
  width: 100%;
  height: 100%;
  background: transparent;
}

/* 提升 uni.showModal 的 z-index 层级，避免被其他组件遮挡 */
/* #ifdef H5 */
uni-modal {
  z-index: 99999999 !important;
}
uni-modal .uni-modal {
  z-index: 99999999 !important;
}
uni-modal .uni-modal__mask {
  z-index: 99999999 !important;
}
uni-modal .uni-modal__container {
  z-index: 99999999 !important;
}
/* #endif */

/* #ifdef MP-WEIXIN */
uni-modal {
  z-index: 99999999 !important;
}
uni-modal .uni-modal {
  z-index: 99999999 !important;
}
uni-modal .uni-modal__mask {
  z-index: 99999999 !important;
}
uni-modal .uni-modal__container {
  z-index: 99999999 !important;
}
/* #endif */

/* #ifdef APP-PLUS */
uni-modal {
  z-index: 99999999 !important;
}
uni-modal .uni-modal {
  z-index: 99999999 !important;
}
uni-modal .uni-modal__mask {
  z-index: 99999999 !important;
}
uni-modal .uni-modal__container {
  z-index: 99999999 !important;
}
/* #endif */
/* #endif */
/* #ifdef APP-NVUE */
.contet{
  background-color: #f1f1f1;
}
/* #endif */
</style>
