<template>
  <view class="layout skin_blue">
    <view class="home">
      <view>
        <view :style="{'height':winobj.statusBarHeight+'px'}"></view>
        <view class="header">
          <view class="back" @click="backTo">
            <image src="/static/img/back.63f43cdd.png"></image>
          </view>
          <view class="title">游戏大厅</view>
        </view>
        <view class="notice-bar">
          <view class="notice-bar-icon">&nbsp;</view>
          <u-notice-bar @click="noticeClick" style="padding-left: 0;" bgColor="transparent" fontSize="16" color="#fff" icon="" :text="notice" direction="row"></u-notice-bar>
        </view>
      </view>
      <view class="main-content">
        <view class="main-list">
          <view class="main-list-item" v-for="item in gamelist" :key="item.gid" @click="gameTo(item)">
            <view class="item-top">
              <view class="item-logo">
                <image class="image" :src="'/static/glogo1/'+item.gid+'.png'" alt=""></image>
              </view>
              <view class="item-game-name">
                <image class="image" :src="'/static/glogo2/'+item.gid+'.png'" :alt="item.gname"></image>
              </view>
              <view class="item-status">
                <view class="item-status-period">第{{ item.period }}期</view>
                <view class="status">
                  <view class="time">
                    <view v-show="item.stopstatus == 1" class="fpz-word">未开盘</view>
                    <view v-show="item.stopstatus == 0 && item.fp == 1" class="fpz-word">封盘中...</view>
                    <view v-show="item.stopstatus == 0 && item.fp == 0">
                      <view class="flip-down vue-countdown-component theme4 less10" style="display: none;">
                        <view class="time-box">
                          <view class="base">0
                            <view class="base-b">0</view>
                          </view>
                          <view class="face anime">0</view>
                          <view class="back anime">0</view>
                        </view>
                        <view class="time-box">
                          <view class="base">0
                            <view class="base-b">0</view>
                          </view>
                          <view class="face anime">0</view>
                          <view class="back anime">0</view>
                        </view>
                        <view class="time-unit">:</view>
                        <view class="time-box">
                          <view class="base">0
                            <view class="base-b">0</view>
                          </view>
                          <view class="face anime">0</view>
                          <view class="back anime">0</view>
                        </view>
                        <view class="time-box">
                          <view class="base">0
                            <view class="base-b">0</view>
                          </view>
                          <view class="face anime">0</view>
                          <view class="back anime">0</view>
                        </view>
                      </view>
                      <view class="flip-down vue-countdown-component theme4" v-show="item.fp == 0">
                        <view class="time-box">
                          <view class="base">{{ item.timearr && item.timearr[0] || '0' }}</view>
                        </view>
                        <view class="time-box">
                          <view class="base">{{ item.timearr && item.timearr[1] || '0' }}</view>
                        </view>
                        <view class="time-unit">:</view>
                        <view class="time-box">
                          <view class="base">{{ item.timearr && item.timearr[2] || '0' }}</view>
                        </view>
                        <view class="time-box">
                          <view class="base">{{ item.timearr && item.timearr[3] || '0' }}</view>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="item-bottom">
              <view class="last-period">{{ item.upPeriod }}期</view>
              <view class="result-num">
                <view v-if="item.template == 'PK10'" class="open-num item-bottom-ul pk10">
                  <view v-for="(num, index) in item.openNum" :key="`pk10_${item.gid}_${index}`" class="item-bottom-ul-li" :class="'ball-'+num"></view>
                </view>
                <view v-if="item.template == 'SSC'" class="open-num2 ssc item-bottom-ul ssc">
                  <view v-for="(num, index) in item.openNum" :key="`ssc_${item.gid}_${index}`" class="item-bottom-ul-li ball" :class="'ball-'+num">{{ num }}</view>
                </view>
                <view v-if="item.template == 'K3'" class="open-num item-bottom-ul k3 sumObj">
                  <view v-for="(num, index) in item.openNum" :key="`k3_${item.gid}_${index}`" class="item-bottom-ul-li ball" :class="'ball-'+num"></view>
                  <view class="item-bottom-ul-li sum">{{ item.sum }}</view>
                </view>
                <view v-if="item.template == 'BINGO'" class="open-num item-bottom-ul bingo">
                  <view v-for="(num, index) in item.openNum" :key="`bingo_${item.gid}_${index}`" class="item-bottom-ul-li b" :class="'b'+num">{{num}}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="nav-bar">
        <view class="nav-bar-li">
          <image @click="navigateToPage('copage/custChat', 1)" src="/static/img/nav_0.23b78c18.png" alt="在线客服"></image>
          <view v-show="notReadCount" class="pulse"></view>
        </view>
        <view class="nav-bar-li">
          <image @click="navigateToPage('pages/wallet/wallet')" src="/static/img/nav_1.2c1e7767.png" alt="钱包中心"></image>
        </view>
        <view class="nav-bar-li">
          <image @click="navigateToPage('pages/gameintroduce/gameintroduce')" src="/static/img/nav_2.531a6777.png" alt="房间介绍"></image>
        </view>
        <view class="nav-bar-li">
          <image @click="navigateToPage('pages/personal/personal')" src="/static/img/nav_3.20a8767b.png" alt="个人中心"></image>
        </view>
      </view>
    </view>
    <u-modal :show="show" @cancel="show = !show" @confirm="confirmExit" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">是否退出房间？</view>
    </u-modal>
    <notice-box :show="isShowNotice" @cancel="closeNotice" :notices="alerts"></notice-box>
  </view>
</template>

<script>
export default {
  name: 'GameHall',
  mixins: [uni.$mymixin],
  data() {
    return {
      notice: '',
      show: false,
      gamelist: [],
      timer: null,
      kjTimer: null,
      showLoading: false,
      notReadCount: 0,
      alerts: [],
      isShowNotice: false
    };
  },
  computed: {
    winobj() {
      return uni.$u.sys();
    }
  },
  onShow() {
    this.initTimers();
    this.loadRoomNotice();
  },
  onLoad() {
    this.initPage();
  },
  onHide() {
    this.clearTimers();
  },
  beforeDestroy() {
    this.cleanup();
  },
  onBackPress(e) {
    if (e.from === 'backbutton') {
      this.backTo();
      return true;
    }
  },
  methods: {
    // 初始化页面
    initPage() {
      uni.showLoading({ title: '加载中...', mask: true });
      this.periodListOrSingle();
      this.clearTimers();
      this.initTimers();
      this.setupMessageListener();
    },

    // 初始化定时器
    initTimers() {
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.updateCountdown();
        }, 1000);
      }
      if (!this.kjTimer) {
        this.kjTimer = setInterval(() => {
          this.periodListOrSingle();
          this.loadRoomNotice();
        }, 10000);
      }
    },

    // 清理定时器
    clearTimers() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      if (this.kjTimer) {
        clearInterval(this.kjTimer);
        this.kjTimer = null;
      }
    },

    // 设置消息监听器
    setupMessageListener() {
      uni.$off('notReadMsgEvent');
      uni.$on('notReadMsgEvent', (data) => {
        this.notReadCount = 1;
      });
    },

    // 清理资源
    cleanup() {
      this.clearTimers();
      uni.$off('notReadMsgEvent');
    },

    // 通知点击事件
    noticeClick() {
      if (this.alerts.length > 0) {
        this.isShowNotice = true;
      }
    },

    // 统一的页面导航方法
    navigateToPage(url, type) {
      if (type === 1) {
        uni.setStorageSync("backUrl", "pages/gamehall/gamehall");
      }
      uni.$utils.jump(url);
    },

    // 更新倒计时
    updateCountdown() {
      if (!this.gamelist || this.gamelist.length === 0) return;

      for (let i = 0; i < this.gamelist.length; i++) {
        const item = this.gamelist[i];
        if (item.stopstatus === 1) {
          continue;
        }

        this.gamelist[i].djs -= 1;
        const fptime = item.djs;
        
        if (fptime >= 0) {
          this.updateTimeArray(i, fptime);
          this.gamelist[i].fp = 0;
        } else if (fptime < 0 && Math.abs(fptime) <= (item.nowOpenTime - item.nowSealTime)) {
          this.gamelist[i].fp = 1;
        } else {
          this.periodListOrSingle(item.gid);
        }
      }
    },

    // 更新时间数组
    updateTimeArray(index, fptime) {
      const minutes = Math.floor(fptime / 60);
      const seconds = fptime % 60;
      const timearr = [];
      
      if (minutes < 10) {
        timearr[0] = 0;
        timearr[1] = minutes;
      } else {
        timearr[0] = parseInt(minutes.toString().charAt(0));
        timearr[1] = parseInt(minutes.toString().charAt(1));
      }
      
      if (seconds < 10) {
        timearr[2] = 0;
        timearr[3] = seconds;
      } else {
        timearr[2] = parseInt(seconds.toString().charAt(0));
        timearr[3] = parseInt(seconds.toString().charAt(1));
      }
      
      this.$set(this.gamelist[index], 'timearr', timearr);
    },

    // 获取游戏数据
    async periodListOrSingle(gid = 0, force = false) {
      try {
        const res = await this.$u.api.member.getperiodlistorsingle({ gid });
        this.$nextTick(() => { uni.hideLoading(); });
        
        const responseGid = parseInt(res.data.gid);
        
        if (responseGid && responseGid > 0) {
          this.updateSingleGame(responseGid, res.data.list[0]);
        } else {
          this.updateAllGames(res.data.list, force);
        }
      } catch (err) {
        console.error('获取游戏数据失败:', err);
        this.$nextTick(() => { uni.hideLoading(); });
        uni.showToast({
          title: '获取游戏数据失败',
          icon: 'none'
        });
      }
    },

    // 更新单个游戏数据
    updateSingleGame(gid, newGame) {
      const index = this.gamelist.findIndex(game => game.gid == gid);
      if (index === -1) return;

      const currentGame = this.gamelist[index];
      this.$set(this.gamelist, index, {
        ...currentGame,
        stopstatus: newGame.stopstatus,
        ...(currentGame.period !== newGame.period && {
          period: newGame.period,
          djs: newGame.djs,
          fp: newGame.fp,
          nowSaleTime: newGame.nowSaleTime,
          nowSealTime: newGame.nowSealTime,
          nowOpenTime: newGame.nowOpenTime
        }),
        ...(currentGame.upPeriod !== newGame.upPeriod && {
          upPeriod: newGame.upPeriod,
          openNum: newGame.openNum,
          sum: newGame.sum
        })
      });
    },

    // 更新所有游戏数据
    updateAllGames(newGameList, force) {
      if (this.gamelist.length <= 0 || this.gamelist.length !== newGameList.length || force) {
        this.$set(this, 'gamelist', newGameList);
        return;
      }

      newGameList.forEach((newGame, index) => {
        if (index < this.gamelist.length) {
          this.updateSingleGame(newGame.gid, newGame);
        }
      });
    },

    // 加载房间通知
    async loadRoomNotice() {
      try {
        const res = await this.$u.api.member.getRoomNotice();
        this.notice = res.data.notice || '';
        this.notReadCount = res.data.notReadCount || 0;
        this.alerts = res.data.alerts || [];
        
        const isShowNotice = uni.getStorageSync('isShowNotice');
        if (this.alerts.length > 0 && !isShowNotice) {
          this.isShowNotice = true;
          uni.setStorageSync('isShowNotice', true);
        }
      } catch (err) {
        console.error('加载房间通知失败:', err);
      }
    },

    // 确认退出
    confirmExit() {
      try {
        // 使用游戏大厅退出原因，禁用自动重连但允许手动连接
        uni.$socketUtils.closeSocket('user_exit_gamehall');
        uni.reLaunch({ url: '/pages/home/home' });
      } catch (err) {
        console.error('退出失败:', err);
        uni.reLaunch({ url: '/pages/home/home' });
      }
    },

    // 返回操作
    backTo() {
      this.show = true;
    },

    // 关闭通知
    closeNotice() {
      this.isShowNotice = false;
    },

    // 进入游戏
    gameTo(item) {
      if (!item || !item.gid) {
        uni.showToast({
          title: '游戏信息错误',
          icon: 'none'
        });
        return;
      }
      
      uni.setStorageSync('cgid', item.gid);
      uni.setStorageSync('ctemplate', item.template);
      
      // 使用redirectTo确保旧的chat页面被销毁，防止监听器和定时器泄漏
      uni.redirectTo({
        url: '/copage/chat',
        fail: (err) => {
          console.error('跳转游戏失败:', err);
          // fallback到原方法
          uni.$utils.jump('copage/chat');
        }
      });
    },

    // 兼容旧方法名
    goto(url, type) {
      this.navigateToPage(url, type);
    },

    // 兼容旧方法名
    timerCheck() {
      this.updateCountdown();
    },

    // 兼容旧方法名
    btnclick() {
      this.confirmExit();
    }
  }
}
</script>

<style lang="scss" scoped>

.pulse {
  background-color: #f00; /* 红色背景 */
  width: 20rpx; /* 宽度 */
  height: 20rpx; /* 高度 */
  animation: pulse 1s infinite; /* 应用动画 */
  position: absolute;
  top: 0;
  border-radius: 50%;
  right: -10rpx;
}

@keyframes pulse {
  0% {
    transform: scale(1); /* 动画开始时的缩放 */
    opacity: 1; /* 不透明 */
  }

  50% {
    transform: scale(1.1); /* 动画中间时的缩放 */
    opacity: 0.7; /* 半透明 */
  }

  100% {
    transform: scale(1); /* 动画结束时的缩放 */
    opacity: 1; /* 不透明 */
  }
}

page{
  width: 100%;
  height: 100%;
}
.layout {
  width: 100%;
  height: 100%;
  background-color: #f1f1f1;
  overflow: hidden;
}

.nav-bar {
  height: 160rpx;
  background-size: cover;
  display: flex;
  justify-content: space-around;
  align-items: center
}

.nav-bar .nav-bar-li {
  position: relative
}

.nav-bar .nav-bar-li image {
  width: 110rpx;
  height: 110rpx;
}

.k3.open-num .item-bottom-ul-li{
  display: flex;
  width: 44.586667rpx;
  height: 44.586667rpx;
  text-align: center;
  line-height: 44rpx;
  background-size: 100% auto;
  margin-right: 20rpx;
  position: relative;
  justify-content: center;
  align-items: center;
  font-size: 36rpx;
}
//台湾宾果
.bingo .b3, .bingo .b6, .bingo .b9, .bingo .b12, .bingo .b15, .bingo .b18, .bingo .b21, .bingo .b24, .bingo .b27, .bingo .b30, .bingo .b33, .bingo .b36, .bingo .b39, .bingo .b42, .bingo .b45, .bingo .b48, .bingo .b51, .bingo .b54, .bingo .b57, .bingo .b60, .bingo .b63, .bingo .b66, .bingo .b69, .bingo .b72, .bingo .b75, .bingo .b78 {
    background: url(../../static/img/red01.png) center center no-repeat;
}
.bingo .b2, .bingo .b5, .bingo .b8, .bingo .b11, .bingo .b14, .bingo .b17, .bingo .b20, .bingo .b23, .bingo .b26, .bingo .b29, .bingo .b32, .bingo .b35, .bingo .b38, .bingo .b41, .bingo .b44, .bingo .b47, .bingo .b50, .bingo .b53, .bingo .b56, .bingo .b59, .bingo .b62, .bingo .b65, .bingo .b68, .bingo .b71, .bingo .b74, .bingo .b77, .bingo .b80 {
    background: url(../../static/img/green01.png) center center no-repeat;
}
.bingo .b1, .bingo .b4, .bingo .b7, .bingo .b10, .bingo .b13, .bingo .b16, .bingo .b19, .bingo .b22, .bingo .b25, .bingo .b28, .bingo .b31, .bingo .b34, .bingo .b37, .bingo .b40, .bingo .b43, .bingo .b46, .bingo .b49, .bingo .b52, .bingo .b55, .bingo .b58, .bingo .b61, .bingo .b64, .bingo .b67, .bingo .b70, .bingo .b73, .bingo .b76, .bingo .b79 {
    background: url(../../static/img/blue01.png) center center no-repeat;
}

.bingo .b {
    display: inline-block;
    width: 48rpx;
    height: 48rpx;
    font-size: 24rpx;
    color: #000000;
    margin-top: 4rpx;
    text-indent: -4rpx;
    text-align: center;
    font-weight: bold;
    line-height: 48rpx;
    margin-bottom: 4rpx;
}

.bingo.open-num{
  display: flex;
  flex: 1;
  justify-content: space-around;
  padding: 0 16rpx;
  align-items: center;
  height:100%;
}

.bingo.open-num .item-bottom-ul-li{
  display: flex;
  width: 58rpx;
  height: 58rpx;
  text-align: center;
  background-size: 100% auto;
  margin-right: 20rpx;
  justify-content: center;
  align-items: center;
  font-size: 26rpx;
  color: #000000;
  text-shadow:none;
}

.open-num.sumObj .item-bottom-ul-li:first-child, .open-num.sumObj .item-bottom-ul-li:nth-child(2) {
  margin-right: 60rpx;
}

.open-num.sumObj .item-bottom-ul-li:nth-child(3) {
  margin-right: 60rpx;
}

.open-num.sumObj .item-bottom-ul-li:first-child:after, .open-num.sumObj .item-bottom-ul-li:nth-child(2):after {
  content: "+";
  position: absolute;
  right: -42rpx;
  color: #868686;
  font-size: 36.48rpx;
  text-shadow: none;
}

.open-num.sumObj .item-bottom-ul-li:nth-child(3):after {
  content: "=";
  position: absolute;
  right: -44rpx;
  color: #868686;
  font-size: 36.48rpx;
  text-shadow: none;
}

.result-num .open-num .item-bottom-ul-li:first-child:after, .result-num .open-num .item-bottom-ul-li:nth-child(2):after, .result-num .open-num .item-bottom-ul-li:nth-child(3):after {
  color: #fff;
}

.open-num .item-bottom-ul-li:last-child {
  margin-right: 0;
}

.k3 .sum{
  color: #fff;
  font-weight: 700;
  font-size: 28rpx;
}

.main-list-item {
  background: url(../../static/img/bg_item_1.b8bea6d9.png) no-repeat top;
  background-size: 100% auto;
  position: relative;
  margin-bottom: 20rpx;
  border-radius: 20rpx;
  height: 249rpx;
}

.main-list-item .item-bottom {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 89rpx;
  background: url(../../static/img/bg_item_2.fd6d0bf8.png) no-repeat bottom;
  background-size: 100% auto;
  display: flex
}

.main-list-item .item-bottom .last-period {
  color: #fff;
  font-size: 26rpx;
  padding-left: 24rpx;
  height: 78rpx;
}

.main-list-item .item-bottom .last-period, .result-num {
  display: flex;
  align-items: center
}

.result-num {
  flex: 1;
  height: 74rpx;
  padding: 0 20rpx;
  overflow: hidden
}

.item-top, .result-num {
  justify-content: space-between
}

.item-top {
  display: flex;
  padding: 0 24rpx;
}


//toto
.item-top .item-logo image {
  width: 106rpx;
  height: 106rpx;
  margin: 27rpx 0 0 0;
}


.item-top .item-game-name {
  flex: 1;
  display: flex;
  justify-content: flex-start
}

.item-top .item-game-name image {
  width: 74%;
  height: 54rpx;
  margin-top: 60rpx;
  margin-left: 44rpx;
}


.item-top .item-game-name.haxi {
  flex-direction: column;
  margin-top: 36rpx
}

.item-top .item-game-name.haxi image {
  width: 74%
}


.item-top .item-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center
}

.item-top .item-status .item-status-period {
  color: #fff;
  font-size: 30rpx;
  padding-bottom: 16rpx;
}

.item-top .item-status .status {
  height: 40rpx;
  min-width: 230rpx;
}

.item-top .item-status .time {
  display: flex;
  justify-content: center
}

.item-top .item-status .time .fpz-word {
  font-size: 38rpx;
  font-style: normal;
  color: red
}

.item-top .item-status .time .kjz-word {
  color: #0087b4
}

.item-top .item-status .time .item-top-span {
  display: inline-block;
  text-align: center;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABgCAMAAAC9tQUyAAAAqFBMVEVHcEzt7/Lt8PPt7vLY2uDt7/LY2+Dq8fHY2+DV3OPt7/LY3N/Y2+Ds7vLW3ePr8PDZ2+Dt7/Ht7/LW2+Ds7/Lf3//s7/Lw8PDt7/Lt7vLj4//f39/q6urX2+DZ3N/X2+Dt7/Lt7/LZ2t/t7vLZ3N/r6+vY2+DV1erY2NjY2+DY2+HY2+Dt7/Lj4+Pt7/Ls7vLY2+DY2+DM5ubY3ODY2+Dt7/LY2+Dt7/J4gIjUAAAANnRSTlMA9FfI0fnqJPokm4mciSUy6M/oMuoI+CPpmAkIDJpYyOv6mZpXDesMDfnJ9dAJ0Yj29AqKm5z93OL8AAABEUlEQVRYw+3ZRZLDQBBE0RSrRWZmpmGq+9/MC5PCno2t3Dii/gFeVEvLBM717Y7TbsqdNdtOx+7jtiCy5OGsKLjiGu+eFMpLG3mvVZHCVXJHlqpCqFo6f766UKofb+y+CKm3LgAgFVopALQmPHASAIiE2C+wsJigtYAt1GzMuOAMDhd0MOaCY3hc0IOQU1BBBRVUUEEFFVTwucE/cgoqqKCCCiqooIIKPje44XobLLngEiMuOMKACw4w54JzrD+Z3m4NJEwwAWBCnhdmABDzwG8AwKvL8tyvwyhlfI7nm9NsViszvHLtMuwZwqtdk58ee3HBfx3Gvat1NPvZPc59JNk/++1qON36dx8a+tvpcHVR9r8dLzfS+g1NAAAAAElFTkSuQmCC) no-repeat;
  background-size: cover;
  color: #424242;
  width: 40rpx;
  height: 48rpx;
  line-height: 48rpx;
  font-size: 32rpx;
  margin-left: 12rpx;
}

.item-top .item-status .time .item-top-span:nth-child(3) {
  background: none;
  color: #fff;
  margin-left: 2rpx
}

.item-top .item-status .time .item-top-span:nth-child(4) {
  margin-left: 2rpx
}

.home {
  position: relative;
  width: 100%;
  height: 100%;
  background: url(../../static/img/bg.68d9ab3f.jpg) no-repeat;
  background-size: cover;
  font-size: 24rpx;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  background-position: bottom
}

.header {
  height: 108rpx;
  background: url(../../static/img/nav_bg.c454dbe6.png) no-repeat;
  background-position: bottom;
  background-size: 100% auto;
  position: relative
}

.header .back {
  position: absolute;
  top: 0;
  left: 0;
  padding: 12rpx 28rpx
}

.header .back image {
  width: 78rpx;
  height: 78rpx;
}

.header .title {
  color: #fefcf5;
  text-align: center;
  font-size: 36rpx;
  line-height: 108rpx
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden
}

.notice-bar {
  height: 72rpx;
  margin: 30rpx;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArIAAABJCAMAAAD2bTVBAAACKFBMVEVHcEz////w9fX///////////8bXob//////////////////wD///8AQIAaXIb///////////////////82cZUhY4n////e5+wqaI7///+lvtD///////////8cXIcZXYgcXYcua5C3z9slZowcXocbXIYaWIQcXIUcXIUbW4UcXIYaWYwdXocaXIUdX4cbW4YcXIYAAIAdX4gbXIUcXIcbXIYbW4YcXIYaXIYcXIckbZIkSZIbXIYAAP8bXIUfYokcW4UbXIUlZYscXIYbXYdShaMlZYwcXockZIsgYokdXocbW4Zgjqplka0AVaobWoX6+v8ubZEbW4YaW4ceYokaW4UjZYscXof6+vodXYYAgICjvM1RhKIcXYZSh6UhYolVh6YvbZL///8ubpFgjqwmZoyjv80kZYz///////87dZe3y9eApbxShaP///////80b5Npk68fYogva5G4zdkeYYjt7fYbXIcdX4chYokcW4UZVX8eX4cdX4gcXYYfYIgZVYgbW4caXYQaYYQaWYQhYokbW4YbXoYaXIUbXIgaWIcdXoccXoe7z9saWoYubJEaWIIlZo0cXYYcXIcbWoUoaI5ikaskZYwnZ44kZYssao9hkKwvbJBXiaYsao9Xh6ZFepxQg6Eua5BEeZtPgqIhZosgZIofYokhZYsgZYogY4oeYYkeYIgdX4ccXYYbXIYeYYgfY4kdXocfY4odYIgcXoccXIYdX4hB0QZPAAAApXRSTlMAKDMpBBMTMCEBLQESBGEOLw8iBq7zETbQJUcFHQlbHtjDQN/RxB3xm9jwFOab/OXeAvzYtPX82U7FBwfZAUv9sNHa+rJ/37Pg9/qzb20DkDHA8GL7ruqQMPECSIFjf/N7vS7Bb99I5CsqpUBYgCcboUnzvj37HbT26lwe9/bZ9x60TR1N60xMZC8xYq5AY8Ix369kMNpt4NrhwG6/e8F7d4DBeIHicmoBAAAFYklEQVR42u3d1XfbSBTH8XFid2wnTRpuqA2UmZmZmZmZaZmZmZmiXdmyZcuy/72dO1LSbGqn2Rd55pzf97l58fmce65GqsSqWKl2fbp/9/a1sxcuSiMUUIsWzl67fff+93ex0pUgO+rjg/vS6Xw+n0Io0AS6dHrfwXdHsf/R3FVr1qcJq+tmZRZCAeRpc12Cm16/ZtXcEYIdXTOVvLoSaiGXSyIUWLlcQeJ1Se3UmtEjEfvmCuGVBitZtb0SCAWQz43k0sgVale8/lSwL7yWl/M1R1wNhMoSsc3JWZt/5tXhxY6bJiasVRBeE+IPMyLHcUyEAkpwI3UCX0KoLVhi0k4bNwzYZTPzEqycr5mMafYhVIZMU6oVs5bQ5mcuKyV2+kTaCcSElV7pT/9BqAxJtqRWTFraDiZOLy520vyUK3ZYAuv4XP9GqAz5bB2JNme5qfmTiol9Y45YCgaBpT/9C6Ey5LEdQCuWgznji9zuWtwv1vTA4odD5WVLaM1+s4ufuBm2fKknlkYswCJ10IpBK80uXT6E7BRfrAmwSC20pm92ypDzWF+sHLH4qZAyaGnQ+mafHyx2/GS3XyxGLFJs0Ppm3cmDL8EWQCxS3+yCx2KXpLI5b4+FWKSiWdpnc9nUkoGnDbvEImsYDsQiVc06hiHW2Zf7n0WsSXlrAa68kLLXYHI1SNV4Yld2ZQtJby3Ar4PUNEurQbKQ7Vopyb4tr70ciEUqm3XkFdg7kuyGbME/LcBPg5QlS6tBIbtBPlywDUMW6TJmt9GjBifpuABDFmkwZpNW9gtB9kN5JguxSHWz8mz2c8aOHbWSCQPHBUj9QwMjkbSOHmPvuXIvgFikwZhNWu6X7APsBUinzeAkO0znBdgLkBabgZ20DrPNFu58IU3I0mawmU3AKot0WmYnsBkWVlmkzzJrzWDPFkAW6UO28BKbhQMDpNORwSw2L4cHDJAmZB1Bdh57EWSRTmRfYc+BLNKJ7FtsHcginciuY9/j8gvpdPn1M7uDQy6kEdnCHfYrbiUgjchaf7C7uGGL9CGbtO6yR/fwWAzSQyw9FnPvEau+j4cPkSZkDTt5P8I6f8ORAdLnwODPTsYePMQyi3RZZR8+YIxFf8R/V0R67AWJ5O9RQTbyNTYDpMte8ENEkA0f2YRXbyD1xdJesOlImN5wFN2IFxwh9cnSC442RuVr5GortuA1ckiDIWtvqaj1XjAb2oExi3QYsjtC/lu8q/knuAOG1N9ku3m1TzZWefw0XjyPFBYrjwtOH6+M9X/fo46fwec9kLJi/c97nOF1j7+iVM8b8RElpK5Y+ohSI68f9Km6hnjLWHyqDqkqltaCsS3xhsFfBG3m1y/CLFJX7MXrvPm/313u4G2X8dllpOKVF4m93MY7hnzcPtbK23rxcXuk2oj19tjeNt4aG0KWhUO8h/ZZpw9okTpg+xzaY3t4KMyeqP0qb2m0DRq0QIsUAStGrGE3tvCr7axI7ZWc/9JkyEEr0YItKhdXDyyNWKPpJ84ri4oVu0Er55e67QG0HluEgo7s+WDt7kuct4ZZiWIdnPML3xBaWg88tggFHdkzMwT2uwuCZEeMla45znnFqV6BltRKtggFnSm9GvZnpyo4jzezYWuoF6r37Nx7ICHVZjKO45gIBZTgRuoEvsSBvTv3CIz1Dexp1YmrMM57TpxtolmLUBmym86e+IgcVtaxERSrDtE/5hU3bl47/9WhrattO4FQANn26q2Hvj1/7eaNCkkwVB1jI6w2OoYjVNbGRGuL2awqhTYcicbxq6FyFY9GShxsVQ03azsjt6O3rpzDwEXBjdZzV25Fb0c6S6us+hf2UwkZzxkMBgAAAABJRU5ErkJggg==) no-repeat;
  background-size: cover;
  display: flex;
  align-items: center
}

.notice-bar .notice-bar-icon {
  display: inline-block;
  background: url(data:image/png;base64,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) no-repeat;
  background-size: 100% auto;
  width: 49rpx;
  height: 41rpx;
  margin-left: 28rpx;
}

.notice-bar .van-notice-bar {
  flex: 1;
  background-color: transparent;
  color: #fff
}

.pull-text .van-pull-refresh__head {
  color: #f1f1f1
}

.main-list {
  margin: 0 28rpx 0 28rpx;
  flex: 1;
  overflow: auto;
}

.loading-icon {
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: 76rpx;
  height: 76rpx;
  top: -96rpx;
  margin-left: -40rpx;
  left: 50%;
  z-index: 9999999
}

.skelecton-item {
  margin-bottom: 20rpx
}

.item-bottom-ul {
  margin: 0;
  padding: 0;
}

.open-num {
  display: flex;
  align-items: center;
  justify-content: flex-start
}

.open-num.min .item-bottom-ul-li {
  font-weight: 700;
  width: 42rpx;
  height: 42rpx;
  line-height: 42rpx;
  border-radius: 4rpx;
  font-size: 26rpx
}

.open-num .item-bottom-ul-li {
  color: #fff;
  font-weight: 700;
  width: 44rpx;
  height: 44rpx;
  margin-right: 6rpx;
  text-align: center;
  line-height: 44rpx;
  border-radius: 4rpx;
  text-shadow: 0 2rpx #000, 2rpx 0 #000, -2rpx 0 #000, 0 -2rpx #000;
  font-size: 26rpx
}


.balls {
  justify-content: center !important
}

.balls, .balls .item-bottom-ul-li {
  display: flex
}

.balls .item-bottom-ul-li {
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background-color: #ccc;
  position: relative;
  font-weight: 700;
  font-size: 24rpx;
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-shadow: 0 2rpx #000, 2rpx 0 #000, -2rpx 0 #000, 0 -2rpx #000;
}

.balls .item-bottom-ul-li:first-child, .balls .item-bottom-ul-li:nth-child(2) {
  margin-right: 60rpx
}

.balls .item-bottom-ul-li:first-child:after, .balls .item-bottom-ul-li:nth-child(2):after {
  content: "+";
  position: absolute;
  color: #868686;
  right: -40rpx;
  font-size: 36rpx;
  text-shadow: none
}

.balls .item-bottom-ul-li:nth-child(3) {
  margin-right: 60rpx
}

.balls .item-bottom-ul-li:nth-child(3):after {
  content: "=";
  position: absolute;
  color: #868686;
  right: -40rpx;
  font-size: 36rpx;
  text-shadow: none
}

.balls .item-bottom-ul-li.yellow-ball {
  background: linear-gradient(#ffdf49 1%, #ffc12d)
}

.balls .item-bottom-ul-li.green-ball {
  background: linear-gradient(#59e14b 1%, #3ac12c)
}

.balls .item-bottom-ul-li.blue-ball {
  background: linear-gradient(#619cff, #0a5eff)
}

.balls .item-bottom-ul-li.red-ball {
  background: linear-gradient(#fa7476, #ee0909)
}

.balls .item-bottom-ul-li.gray {
  background: linear-gradient(#999 1%, #777) !important
}

.result-num .balls .item-bottom-ul-li:first-child:after,
.result-num .balls .item-bottom-ul-li:nth-child(2):after,
.result-num .balls .item-bottom-ul-li:nth-child(3):after {
  color: #fff
}

.vue-countdown-component {
  display: flex;
  justify-content: flex-end
}


@keyframes animate-filp-face {
  0% {
    transform: rotateX(-.01deg);
    opacity: 1
  }

  50% {
    opacity: 1
  }

  51% {
    opacity: 0
  }

  to {
    transform: rotateX(-180deg);
    opacity: 0
  }
}


@keyframes animate-filp-back {
  0% {
    transform: rotateX(180deg)
  }

  to {
    transform: rotateX(-.01deg)
  }
}

.vue-countdown-component.ie .base .base-b {
  clip: rect(30rpx, auto, auto, auto)
}

.vue-countdown-component.ie .face {
  clip: rect(auto, auto, 30rpx, auto)
}

.vue-countdown-component.ie .back {
  clip: rect(30rpx, auto, auto, auto)
}

.vue-countdown-component.theme2 .time-box {
  min-width: 40rpx
}

.vue-countdown-component.theme2 .time-box + .time-box {
  margin-left: 2rpx
}

.vue-countdown-component.theme3 .time-box {
  color: #fff;
  background-color: transparent;
  min-width: auto;
  min-width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  font-size: 22rpx;
  padding: 0 1rpx;
}

.vue-countdown-component.theme3 .time-box + .time-box {
  margin-left: 1rpx
}

.vue-countdown-component.theme3 .time-box:after, .vue-countdown-component.theme3 .time-box:before {
  background: transparent
}

.vue-countdown-component.theme3 .time-box > .back, .vue-countdown-component.theme3 .time-box > .base .base-b, .vue-countdown-component.theme3 .time-box > .face {
  background-color: transparent;
  display: none
}

.vue-countdown-component.theme3 .time-unit {
  color: #fff;
  padding: 0 2rpx;
  height: 40rpx;
  line-height: 36rpx
}

.vue-countdown-component.theme4 .time-box {
  background-color: transparent;
  min-width: auto;
  color: #333;
  min-width: 40rpx;
  height: 52rpx;
  line-height: 52rpx;
  font-size: 30rpx;
  text-shadow: #fff 2rpx 0 0, #fff 0 2rpx 0, #fff -2rpx 0 0, #fff 0 -2rpx 0;
  padding: 0 2rpx;
}

.vue-countdown-component.theme4 .time-box + .time-box {
  margin-left: 1rpx
}

.vue-countdown-component.theme4 .time-box:after, .vue-countdown-component.theme4 .time-box:before {
  background: transparent
}

.vue-countdown-component.theme4 .time-box > .back, .vue-countdown-component.theme4 .time-box > .face {
  background-color: transparent;
  display: none
}

.vue-countdown-component.theme4 .time-box > .base {
  background-image: linear-gradient(180deg, #eeeff2 0, #eeeff2 50%, #d8dbe0 0, #d8dbe0);
  border-radius: 10rpx;
  width: 44rpx;
  font-weight: bold;
}

//todo
.tn-countdown__item {
  background-image: linear-gradient(180deg, #eeeff2 0, #eeeff2 50%, #d8dbe0 0, #d8dbe0);
  border-radius: 10rpx;
  width: 44rpx
}

.vue-countdown-component.theme4 .time-box > .base .base-b {
  background-color: transparent;
  display: none
}

.vue-countdown-component.theme4 .time-unit {
  font-weight: 700;
  color: #ff193c;
  height: 52rpx;
  line-height: 52rpx
}

.vue-countdown-component.theme5 .time-box {
  min-width: auto;
  text-align: center;
  width: 20rpx !important;
  height: 40rpx;
  line-height: 40rpx;
  font-size: 24rpx;
  color: #888;
  background-color: transparent;
  padding: 0;
  margin: 0;
  display: block
}

.vue-countdown-component.theme5 .time-box + .time-box {
  margin-left: 0
}

.vue-countdown-component.theme5 .time-box:after, .vue-countdown-component.theme5 .time-box:before {
  background: transparent;
  display: none
}


.vue-countdown-component.theme5 .time-unit {
  padding: 0 !important;
  width: auto !important;
  text-align: center;
  color: #888;
  height: 40rpx;
  line-height: 36rpx
}

.vue-countdown-component .time-unit {
  color: #3293bc;
  padding: 0 8rpx;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 60rpx;
  white-space: nowrap
}

.vue-countdown-component .time-box {
  position: relative;
  box-sizing: border-box;
  text-align: center;
  background-color: #0087b4;
  color: #fff;
  height: 60rpx;
  min-width: 56rpx;
  font-size: 28rpx;
  perspective: 12rpx;
  border-radius: 6rpx;
  padding: 0 4rpx;
  line-height: 60rpx;
}

.vue-countdown-component .time-box:before {
  left: -2rpx
}

.vue-countdown-component .time-box:after, .vue-countdown-component .time-box:before {
  content: "";
  position: absolute;
  background: #009acd;
  top: 50%;
  width: 2rpx;
  height: 12rpx;
  margin-top: -6rpx;
  z-index: -1
}

.vue-countdown-component .time-box:after {
  right: -2rpx
}

.vue-countdown-component .time-box + .time-box {
  margin-left: 16rpx
}


.vue-countdown-component.less10 .time-box {
  color: #ff193c !important;
  text-shadow: #fff 2rpx 0 0, #fff 0 2rpx 0, #fff -2rpx 0 0, #fff 0 -2rpx 0
}

.skin_blue .big-single {
  border-radius: 6rpx;
  height: 48rpx;
  line-height: 48rpx;
  width: 48rpx;
  font-size: 28rpx;
  margin-right: 4rpx;
  text-align: center;
  font-weight: 700;
  display: inline-block;
  color: #fff
}

.open-num2 {
  display: flex;
  flex: 1;
  justify-content: space-around;
  padding: 0 16rpx;
  align-items: center;
  height:100%;
}

.open-num2.min .item-bottom-ul-li {
  width: 38rpx;
  height: 38rpx;
  line-height: 38rpx;
  font-size: 26rpx;
}

.open-num2 .item-bottom-ul-li {
  width: 44rpx;
  height: 44rpx;
  margin-right: 16rpx;
  border-radius: 50%;
  border: 6.4rpx solid;
  color: #222;
  font-weight: 700;
  background: #fff;
  font-size: 28rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.open-num2 .item-bottom-ul-li:last-child {
  margin-right: 0
}

</style>
