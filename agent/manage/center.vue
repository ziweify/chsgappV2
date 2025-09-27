<template>
  <view class="layout">
    <view class="layout-content">
      <view class="mysection">
        <TsCustom :backUrl="backUrl" :isBack="true" title="管理中心"></TsCustom>
        <view class="section-div bord">
          <view class="section-div-1">
            <view class="section-div-2">
              <!-- 用户信息展示区域 -->
              <view class="user-info-section">
                <view class="user-avatar-container">
                  <view class="user-avatar">
                    <u-icon name="account-fill" size="32" color="#ffffff"></u-icon>
                  </view>
                  <view class="online-indicator"></view>
                </view>
                <view class="user-details">
                  <view class="user-name">{{ info.username }}</view>
                  <view class="user-role">
                    <u-icon name="star-fill" size="14" color="#FFD700"></u-icon>
                    <text class="role-text">代理商</text>
                  </view>
                </view>
                <view class="user-actions">
                  <view class="last-login">
                    <text class="login-time">{{ getCurrentTime() }}</text>
                  </view>
                </view>
              </view>
              <!-- 双余额显示区域 -->
              <view class="balance-container">
                <view class="balance-item">
                  <text class="balance-amount">{{ info.balance }}</text>
                  <text class="balance-label">用户余额</text>
                </view>
                <view class="balance-separator"></view>
                <view class="balance-item">
                  <text class="balance-amount">{{ info.bsb_coin || '0' }}</text>
                  <text class="balance-label">百胜币</text>
                </view>
              </view>
            </view>
            <view class="section-line"></view>
            <view class="section-div-4">
              <view class="section-div-4-1">
                <text class="text">{{ info.totalMoney }}</text>
                <text>今日流水</text>
              </view>
              <view class="section-div-4-1">
                <text class="text" :class="info.sy > 0 ? 'm-green' : (info.sy < 0 ? 'm-red' : '')">{{ info.sy }}</text>
                <text>今日盈亏</text>
              </view>
              <view class="section-div-4-1">
                <text class="text">{{ info.backWater }}</text>
                <text>今日回水</text>
              </view>
              <view class="section-div-4-1">
                <text class="text" :class="info.totalSy > 0 ? 'm-green' : (info.totalSy < 0 ? 'm-red' : '')">{{ info.totalSy }}</text>
                <text>总盈亏</text>
              </view>
            </view>
          </view>
          <view class="van-grid van-hairline--top">
            <view class="van-grid-item" border="none" style="flex-basis: 33.3333%;">
              <view @click="goto('agent/manage/apply')" class="van-grid-item__content van-grid-item__content--center van-grid-item__content--clickable van-hairline">
                <view class="des-img van-image">
                  <image src="/static/img/m0.png" class="van-image__img"></image>
                </view>
                <view class="des-p">申请管理</view>
              </view>
            </view>
            <view class="van-grid-item" border="none" style="flex-basis: 33.3333%;">
              <view @click="goto('agent/manage/groupApply')" class="van-grid-item__content van-grid-item__content--center van-grid-item__content--clickable van-hairline">
                <view class="des-img van-image">
                  <image src="/static/img/m1.png" class="van-image__img"></image>
                </view>
                <view class="des-p">入群申请</view>
              </view>
            </view>
            <view @click="goto('')" class="van-grid-item" border="none" style="flex-basis: 33.3333%;" url="/manager/collectiontype/collectiontype">
              <view class="van-grid-item__content van-grid-item__content--center van-grid-item__content--clickable van-hairline">
                <view class="des-img van-image">
                  <image src="/static/img/m2.png" class="van-image__img"></image>
                </view>
                <view class="des-p">收款方式</view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view style="background-color: #fff;margin-top: 20rpx;flex: 1;overflow-y: auto;margin: 28rpx 28rpx 0 28rpx;border-radius: 16rpx;">
        <u-cell-group>
          <u-cell @click="goto('agent/manage/umanage')" icon="account" title="用户管理" :isLink="true"></u-cell>
          <u-cell @click="goto('agent/manage/report/repManage')" icon="file-text" title="报表" :isLink="true"></u-cell>
<!--          <u-cell icon="integral" title="现场监控" :isLink="true"></u-cell>-->
          <u-cell @click="goto('agent/manage/outbetmanage')" icon="twitter" title="打单中心" :isLink="true"></u-cell>
          <u-cell @click="goto('agent/manage/oddsset')" icon="coupon" title="赔率限额" :isLink="true"></u-cell>
<!--          <u-cell icon="car" title="打盘报表" :isLink="true"></u-cell>-->
          <u-cell @click="goto('copage/kjresult',2)" icon="gift" title="开奖结果" :isLink="true"></u-cell>
<!--          <u-cell icon="rmb-circle-fill" title="发红包" :isLink="true"></u-cell>
          <u-cell icon="server-man" title="反馈" :isLink="true"></u-cell>-->
          <!-- <u-cell @click="goto('')" icon="download" title="H5/APP 下载" :isLink="true"></u-cell> -->
          <u-cell @click="goto('agent/manage/secondver')" icon="lock" title="二次验证" :isLink="true"></u-cell>
          <u-cell icon="info-circle" title="当前版本" :isLink="false" value="1.6.5"></u-cell>
        </u-cell-group>
      </view>
      <view style="text-align: center; padding:30rpx;">
        <button class="PersonalInformation-btn van-button van-button--info van-button--normal"  @click="show = !show">
          <view class="van-button__content">退出</view>
        </button>
      </view>
    </view>
    <u-modal :show="show" @cancel="show = !show" @confirm="logout" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">是否退出当前账号？</view>
    </u-modal>
  </view>
</template>
<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl:'agent/gamehall/hall',
      info:{},
      show:false
    };
  },
  onReady() {
    this.getCenterInfo();
  },
  methods: {
    goto(url,type = 1){
      if(!url){
        this.$u.toast('暂未开放');
        return;
      }
      if(type == 2){
        uni.setStorageSync('backUrl','agent/manage/center');
      }
      uni.$utils.jump(url);
    },
    getCenterInfo(){
      this.$u.api.agent.getCenterInfo({}).then(res => {
        this.info = res.data;
      });
    },
    getCurrentTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    },
    logout() {
      this.show = false;
      this.$u.api.common.logout().then(res => {
        uni.$socketUtils.closeSocket('user');
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");
        uni.removeStorageSync("expiresTime");
        uni.reLaunch({url:'/agent/login/login'});
      });
    }
  }
}
</script>

<style lang="scss" scoped>

.layout{
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #f1f4fc;
  .layout-content{
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: #f1f4fc;
  }
}

.mysection {
  display: flex;
  flex-direction: column;
  justify-content: space-between
}

.PersonalInformation-btn {
  width: 90%;
  height: 85rpx;
  line-height: 85rpx;
  background: linear-gradient(270deg, #08bbc2, #144988);
  border-radius: 100rpx;
  border: 0 solid #2ca0f5;
  font-weight: 500;
  color: #fff;
  font-size: 32rpx;
  box-shadow: 0 .08*2rem .32*2rem .026667*2rem rgba(0, 0, 0, .2);
}

.mysection .bord {
  margin-top: 24rpx;
}

.mysection .bord .van-grid {
  border-radius: 0 0 16rpx 16rpx;
  background-color: #fff;
  margin: 0 28rpx;
}

.mysection .section-div .van-grid .van-grid-item__content {
  background: transparent !important;
  padding: 30rpx !important;
}

.mysection .section-div .section-div-1 {
  background: linear-gradient(270deg, #09b4c3, #1155a5);
  margin: 0 28rpx;
  border-radius: 16rpx 16rpx 0 0
}

.mysection .section-div .section-div-1 .section-line {
  height: 3rpx;
  width: 90%;
  margin-left: 24rpx;
  background-color: #6fc2ff
}

.mysection .section-div .section-div-1 .section-div-2 {
  padding: 40rpx 0 20rpx 26rpx;
}

/* 用户信息展示区域样式 */
.mysection .section-div .section-div-1 .section-div-2 .user-info-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20rpx;
  margin-bottom: 20rpx;
}

.mysection .section-div .section-div-1 .section-div-2 .user-avatar-container {
  position: relative;
  margin-right: 20rpx;
}

.mysection .section-div .section-div-1 .section-div-2 .user-avatar {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
}

.mysection .section-div .section-div-1 .section-div-2 .online-indicator {
  position: absolute;
  bottom: 5rpx;
  right: 5rpx;
  width: 20rpx;
  height: 20rpx;
  background: #00ff88;
  border-radius: 50%;
  border: 3rpx solid #ffffff;
  box-shadow: 0 0 10rpx rgba(0, 255, 136, 0.6);
}

.mysection .section-div .section-div-1 .section-div-2 .user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.mysection .section-div .section-div-1 .section-div-2 .user-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.mysection .section-div .section-div-1 .section-div-2 .user-role {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.mysection .section-div .section-div-1 .section-div-2 .role-text {
  font-size: 24rpx;
  color: #d0ebff;
  font-weight: 400;
}

.mysection .section-div .section-div-1 .section-div-2 .user-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.mysection .section-div .section-div-1 .section-div-2 .last-login {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
}

.mysection .section-div .section-div-1 .section-div-2 .login-time {
  font-size: 22rpx;
  color: #d0ebff;
  font-weight: 300;
}

.mysection .section-div .section-div-1 .section-div-2 .balance-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40rpx;
}

.mysection .section-div .section-div-1 .section-div-2 .balance-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mysection .section-div .section-div-1 .section-div-2 .balance-amount {
  font-size: 46rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.mysection .section-div .section-div-1 .section-div-2 .balance-label {
  font-size: 26rpx;
  color: #d0ebff;
  font-weight: 300;
}

.mysection .section-div .section-div-1 .section-div-2 .balance-separator {
  width: 2rpx;
  height: 80rpx;
  background-color: #6fc2ff;
  opacity: 0.6;
}

.text{
  color: #878787;
}

.mysection .section-div .section-div-1 .section-div-4 {
  display: flex;
  align-items: center;
  padding: 20rpx;
  justify-content: space-between
}

.mysection .section-div .section-div-1 .section-div-4 .section-div-4-1 {
  display: inline-block;
  .text{
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 600;
  }
}

.mysection .section-div .section-div-1 .section-div-4 .section-div-4-1 text {
  display: block;
  color: #fff;
  font-size: 24rpx;
  color: #d0ebff;
  font-weight: 400
}

.mysection .des-p {
  color: #8e919a;
  font-size: 26rpx;
}

.mysection .des-img {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
}

.van-grid {
  display: flex;
  flex-wrap: wrap
}

.van-image__img{
  display: block;
  width: 100%;
  height: 100%
}


.van-grid-item__content {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  background-color: #fff
}


.van-grid-item__content--center {
  align-items: center;
  justify-content: center
}

.van-grid-item__content:after {
  z-index: 1;
  border-width: 0 .026667rem .026667rem 0
}
</style>
