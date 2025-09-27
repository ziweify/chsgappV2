<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="修改昵称">
        <block slot='right'>
          <view @click="successsubTo">完成</view>
        </block>
      </TsCustom>
      <view class="flex-content">
        <view class="PersonalIcon-home">
          <view class="van-cell van-field">
            <view style="width: 100%" class="van-cell__value van-cell__value--alone van-field__value">
              <view class="van-field__body">
                <input type="text" class="van-field__control" v-model="nname">
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
      nname: uni.getStorageSync('nickname'),
      backUrl:"pages/member/personamessage"
    };
  },
  methods: {
    successsubTo(){
      let that = this;
      let oldN = uni.getStorageSync('nickname');
      if(oldN == this.nname){
        uni.$utils.jump(this.backUrl);
        return;
      }
      this.$u.api.member.updateNickName({nickname:this.nname}).then(res => {
        uni.setStorageSync('nickname', that.nname);
        uni.navigateBack();
      }).catch(err => {
        uni.$utils.showToast(err);
      });
    }
  }
}
</script>

<style lang="scss" scoped>

.successsub {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  font-size: 34rpx;
  width: 100rpx;
  text-align: center;
  font-weight: 400;
  color: #fff;
  line-height: 34rpx;
}
.PersonalIcon-home {
  width: 100%;
  height: 100vh;
}

.layout{
  background: #f1f4fc
}

.van-field__label {
  flex: none;
  box-sizing: border-box;
  width: 6.2em;
  margin-right: 24rpx;
  color: #646566;
  text-align: left;
  word-wrap: break-word
}

.van-field__label--center {
  text-align: center
}

.van-field__label--right {
  text-align: right
}

.van-field--disabled .van-field__label {
  color: #c8c9cc
}

.van-field__value {
  overflow: visible
}

.van-field__body {
  display: flex;
  align-items: center
}

.van-field__control {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  color: #323233;
  line-height: inherit;
  text-align: left;
  background-color: transparent;
  border: 0;
  resize: none
}


.van-field__control::placeholder {
  color: #c8c9cc
}

.van-field__control:disabled {
  color: #c8c9cc;
  cursor: not-allowed;
  opacity: 1;
}



.van-field__control:read-only {
  cursor: default
}

.van-field__control--center {
  justify-content: center;
  text-align: center
}

.van-field__control--right {
  justify-content: flex-end;
  text-align: right
}

.van-field__control--custom {
  display: flex;
  align-items: center;
  min-height: 48rpx;
}

.van-field__control[type=date],.van-field__control[type=datetime-local],.van-field__control[type=time] {
  min-height: 48rpx;
}

.van-field__control[type=search] {
}

.van-field__button,.van-field__clear,.van-field__icon,.van-field__right-icon {
  flex-shrink: 0
}

.van-field__clear,.van-field__right-icon {
  margin-right: -16rpx;
  padding: 0 16rpx;
  line-height: inherit
}

.van-field__clear {
  color: #c8c9cc;
  font-size: 32rpx;
  cursor: pointer
}

.van-field__left-icon .van-icon,.van-field__right-icon .van-icon {
  display: block;
  font-size: 32rpx;
  line-height: inherit
}

.van-field__left-icon {
  margin-right: 8rpx;
}

.van-field__right-icon {
  color: #969799
}

.van-field__button {
  padding-left: 16rpx;
}

.van-field__error-message {
  color: #ee0a24;
  font-size: 24rpx;
  text-align: left
}

.van-field__error-message--center {
  text-align: center
}

.van-field__error-message--right {
  text-align: right
}

.van-field__word-limit {
  color: #646566;
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  text-align: right
}



.van-field--error .van-field__control,.van-field--error .van-field__control::placeholder {
  color: #ee0a24;
}

.van-field--min-height .van-field__control {
  min-height: 120rpx;
}


.van-cell {
  position: relative;
  display: flex;
  width: 100%;
  overflow: hidden;
  color: #323233;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  line-height: 48rpx;
  background-color: #fff
}

.van-cell,.van-cell:after {
  box-sizing: border-box
}

.van-cell:after {
  position: absolute;
  content: " ";
  pointer-events: none;
  bottom: 0;
  right: 32rpx;
  left: 32rpx;
  border-bottom: 2rpx solid #ebedf0;
  transform: scaleY(.5)
}

</style>
