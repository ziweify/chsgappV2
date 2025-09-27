<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="二次验证"></TsCustom>
      <view class="flex-content">
        <view class="shareCode" v-show="info.google_open == 0">
          <view>步骤：</view>
          <view class="tiptext">
            1.下载安装Google认证器(Authenticator)客户端。
            目前客户端有:android版|ios版。
          </view>
          <view class="tiptext">
            2.然后选择“扫描条形码"。
          </view>
          <view class="tiptext">
            3.扫描以下二维码,再输入下方二次验证码完成认证。
          </view>
          <view class="promotewrap">
            <view class="promote">二维码：</view>
          </view>
          <view id="qrcode" class="qrcode">
            <uqrcode ref="uqrcode" canvas-id="qrcode" :value="info.codeurl" :options="options"></uqrcode>
          </view>
          <view class="saveTip">{{ info.secret }}</view>
        </view>
        <view class="input-bg input-yzm" >
          <view v-show="info.google_open == 0" style="color: #938f8f;margin-bottom:8rpx;">二次验证码：</view>
          <view v-show="info.google_open == 1" style="color: #00d123;margin-bottom:8rpx;">二次验证已开启：</view>
          <input v-model="code" type="number" placeholder="请输入谷歌验证码" class="input-box">
        </view>
        <view style="text-align: center;margin-top: 80rpx">
          <button v-show="info.google_open == 0" @click="saveSecondver" class="van-button">立即保存</button>
          <button v-show="info.google_open == 1" @click="resetSecondver" class="van-button">重置二次验证</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl: 'agent/manage/center',
      options: {
        margin: 10
      },
      info:{},
      code:'',
    };
  },
  onLoad() {
    this.getSecondver();
  },
  methods: {
    backTo() {
      uni.navigateTo({
        url: '/manager/mcenter/mcenter'
      })
    },
    getSecondver() {
      this.$u.api.agent.getSecondver({}).then(res => {
        this.info = res.data;
      });
    },
    saveSecondver() {
      //验证
      if (!this.code) {
        this.$u.toast('请输入谷歌验证码');
        return;
      }
      this.$u.api.agent.saveSecondver({code: this.code, secret: this.info.secret}).then(res => {
        this.$u.toast(res.msg);
        this.code = '';
        this.getSecondver();
      });
    },
    resetSecondver() {
      //验证
      if (!this.code) {
        this.$u.toast('请输入谷歌验证码');
        return;
      }
      this.$u.api.agent.resetSecondver({code:this.code}).then(res => {
        this.$u.toast(res.msg);
        this.code = '';
        this.getSecondver();
      });
    }
  }
}
</script>

<style lang="scss" scoped>

.input-bg {
  margin: .266667*2rem auto;
  width: 8.426667*2rem;
  height: 1.12*2rem;
  box-sizing: border-box;
  position: relative;
}

.input-yzm {
  margin: .346667*2rem auto 0 auto;
  width: 8.426667*2rem;
  height: 1.12*2rem;
  box-sizing: border-box;
  position: relative
}

.input-yzm input {
  flex: 1;
  margin-right: .35rem;
  height: 1.85rem;
  font-size: .373333*2rem
}

.input-yzm image {
  max-width: 100%;
  height: 100%;
}
.promotewrap{
  display: flex;
  margin-top: .6rem;
  color: #adadad;
}
.shareCode {
  margin: 30rpx;
}

.shareCode .promote {
  font-size: .85rem;
}

.shareCode .qrcode {
  display: flex;
  justify-content: center;
  align-items: center;
}
.input-box{
  border: 1px solid #ebebeb;
  border-radius: 3px;
  padding: 10rpx 20rpx;
}
.shareCode .saveTip {
  font-size: 28rpx;
  font-weight: 400;
  color: #737373;
  text-align: center;
}

.tiptext{
  color: #f31818;
  margin-top: 8rpx;
}

.van-button {
  text-align: center;
  cursor: pointer;
  width: 90%;
  height: 80rpx;
  line-height: 80rpx;
  background: linear-gradient(270deg, #08bbc2, #144988);
  border-radius: 40rpx;
  border: 0 solid #2ca0f5;
  font-weight: 500;
  color: #fff;
  font-size: 32rpx;
  box-shadow: 0 .08*2rem .32*2rem .026667*2rem rgba(0, 0, 0, .2)
}
</style>
