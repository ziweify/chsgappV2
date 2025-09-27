<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="个人信息"></TsCustom>
      <view class="flex-content">
        <view class="Personalmessage-home">
          <view class="Personalmessage-ul">
            <view class="Personalmessage-ul-li" @click="personalportraitTo">
              <view class="lefttext">头像设置</view>
              <view  class="boxdata">
                <view  class="data-img">
                  <u-image :showLoading="true" :src="avatar" mode="aspectFill" width="55" height="55">
                    <template v-slot:loading>
                      <u-loading-icon color="#0087b4"></u-loading-icon>
                    </template>
                  </u-image>
                </view>
                <view class="data-icon"></view>
              </view>
            </view>
            <view class="Personalmessage-ul-li" @click="personaliconTo">
              <view class="lefttext">修改昵称</view>
              <view class="boxdata">
                <view class="data-text">{{ nickname }}</view>
                <view class="data-icon">
                </view>
              </view>
            </view>
            <view class="Personalmessage-ul-li" @click="personalinformationTo">
              <view class="lefttext">修改密码</view>
              <view class="boxdata">
                <view class="data-icon">
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      avatar:'',
      nickname:'',
      backUrl:"",
      headImageDomain:''
    };
  },
  onShow() {
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.avatar = this.headImageDomain+uni.getStorageSync('avatar');
    this.nickname = uni.getStorageSync('nickname');
  },
  onLoad() {
    this.backUrl = uni.getStorageSync('backUrl');
  },
  methods:{
    backTo(){
      uni.navigateBack();
    },
    personalportraitTo(){
      uni.$utils.jump('pages/member/personalportrait');
    },
    personaliconTo(){
      uni.$utils.jump('pages/member/personalicon');
    },
    personalinformationTo(){
      uni.$utils.jump('pages/common/modifypwd');
    },
  }
}
</script>

<style lang="scss" scoped>
.Personalmessage-home {
  height: 100%;
  background: #f1f4fc
}
.layout{
  background: #f1f4fc;
  height: 100vh;
}

.Personalmessage-home .Personalmessage-ul {
  background: #fff
}

.Personalmessage-home .Personalmessage-ul .Personalmessage-ul-li {
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  padding: 0 20rpx;
  min-height: 90rpx;
}

.Personalmessage-home .Personalmessage-ul .lefttext {
  margin: auto 0;
  margin-left: 20rpx;
  font-size: 34rpx;
  color: #222
}

.Personalmessage-home .Personalmessage-ul  .boxdata {
  display: flex;
  overflow: hidden
}

.Personalmessage-home .Personalmessage-ul  .boxdata .data-img {
  margin: 8rpx 0;
  width: 112rpx;
  height: 112rpx;
  border-radius: 20rpx;
}

.Personalmessage-home .Personalmessage-ul .boxdata .data-img image {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 20rpx;
}

.Personalmessage-home .Personalmessage-ul  .boxdata .data-text {
  line-height: 90rpx;
  font-size: 32rpx;
  color: grey;
}

.Personalmessage-home .Personalmessage-ul .boxdata .data-icon {
  margin: auto 10rpx auto 20rpx;
  width: 14rpx;
  height: 28rpx;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeBAMAAAA4FegcAAAAMFBMVEVHcEyzs76ys726ur2ztL+0tMCrq8Wzs760tMCztb+ys76ztb+ys72ytL+ztL+ys74bYC92AAAAD3RSTlMA0PYTu0EJchwx7UZayKcm/w0wAAAARklEQVQY02PgOMYABV0fDaCs/f+FoSyW/zBBNn+4YAptBBvggheggvX/F0AY7P8/bYAJqcKFAqgvNB8mxDAfJsTA8xLKAABvYjlwVC0szAAAAABJRU5ErkJggg==) no-repeat;
  background-size: 100% 100%
}

.Personalmessage-home .Personalmessage-ul view:nth-child(2),.Personalmessage-home .Personalmessage-ul view:nth-child(3) {
  border-top: 2rpx solid #e6e6e6;
}
</style>
