<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="修改密码">
      </TsCustom>
      <view class="flex-content">
        <view class="PersonalInformation-home">
          <view class="PersonalInformation-head">
          </view>
          <view class="PersonalInformation-box">
            <view class="Personalmessage-ul">
              <view class="Personalmessage-ul-li">
                <view class="van-cell van-cell--required van-field">
                  <view class="van-cell__title van-field__label">
                    <view>旧密码</view>
                  </view>
                  <view class="van-cell__value van-field__value">
                    <view class="van-field__body">
                      <input v-model="formdata.oldPwd" :password="eyename == 'eye'" placeholder="请输入旧密码" class="van-field__control">
                      <view class="van-field__right-icon">
                        <u-icon style="margin-right: 14rpx;" color="#31C9E8" size="22" v-show="eyename == 'eye'" :name="eyename" @click="clearInput('eye-fill')"></u-icon>
                        <u-icon style="margin-right: 14rpx;" color="#31C9E8" size="22" v-show="eyename == 'eye-fill'" :name="eyename" @click="clearInput('eye')"></u-icon>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              <view class="Personalmessage-ul-li">
                <view class="van-cell van-cell--required van-field">
                  <view class="van-cell__title van-field__label">
                    <view>新密码</view>
                  </view>
                  <view class="van-cell__value van-field__value">
                    <view class="van-field__body">
                      <input v-model="formdata.newPwd" :password="eyename1 == 'eye'" placeholder="请输入8-16位大小写字母和数字的密码"
                             class="van-field__control">
                      <view class="van-field__right-icon">
                        <u-icon style="margin-right: 14rpx;" color="#31C9E8" size="22" v-show="eyename1 == 'eye'" :name="eyename1" @click="clearInput1('eye-fill')"></u-icon>
                        <u-icon style="margin-right: 14rpx;" color="#31C9E8" size="22" v-show="eyename1 == 'eye-fill'" :name="eyename1" @click="clearInput1('eye')"></u-icon>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
              <view class="Personalmessage-ul-li">
                <view class="van-cell van-cell--required van-field">
                  <view class="van-cell__title van-field__label">
                    <view> 确认密码</view>
                  </view>
                  <view class="van-cell__value van-field__value">
                    <view class="van-field__body">
                      <input v-model="formdata.reNewPwd" :password="eyename2 == 'eye'" placeholder="请再次输入新密码" class="van-field__control">
                      <view class="van-field__right-icon">
                        <u-icon style="margin-right: 14rpx;" color="#31C9E8" size="22" v-show="eyename2 == 'eye'" :name="eyename2" @click="clearInput2('eye-fill')"></u-icon>
                        <u-icon style="margin-right: 14rpx;" color="#31C9E8" size="22" v-show="eyename2 == 'eye-fill'" :name="eyename2" @click="clearInput2('eye')"></u-icon>
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <button class="PersonalInformation-btn van-button van-button--info van-button--normal" @click="saveTo">
              <view class="van-button__content">
                <view class="van-button__text" >确认提交</view>
              </view>
            </button>
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
      oldeyeshow:false,
      neweyeshow:false,
      reneweyeshow:false,
      eyename: 'eye',
      eyename1: 'eye',
      eyename2: 'eye',
      formdata:{
        oldPwd:'',
        newPwd:'',
        reNewPwd:''
      },
      backUrl:"agent/roomset/roomset"
    };
  },
  onLoad() {
  },
  methods:{
    clearInput(en) {
      this.eyename = en;
    },
    clearInput1(en) {
      this.eyename1 = en;
    },
    clearInput2(en) {
      this.eyename2 = en;
    },
    saveTo(){
      if(this.formdata.oldPwd == ''){
        uni.$utils.showToast('请输入旧密码');
        return;
      }
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;
      if (!passwordPattern.test(this.formdata.newPwd)) {
        uni.$utils.showToast('密码需要8-16位数字和字母组合，要求至少有一个大写字母');
        return;
      }
      //两次密码输入不一致
      if(this.formdata.newPwd != this.formdata.reNewPwd){
        uni.$utils.showToast('两次密码输入不一致');
        return;
      }
      //旧密码和新密码不能相同
      if(this.formdata.newPwd == this.formdata.oldPwd){
        uni.$utils.showToast('新密码不能与旧密码相同');
        return;
      }
      let that = this;
      uni.showLoading({title:'正在提交'});
      this.$u.api.common.updatePwd(that.formdata).then(res => {
        uni.hideLoading();
        uni.$utils.showToast(res.msg);
        setTimeout(function (){
          uni.$socketUtils.closeSocket('user');
          uni.$utils.jump('pages/common/login',"reLaunch");
        },1500);
      }).catch(err => {
        uni.$utils.showToast(err);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.layout{
  background: #f1f4fc;
  height: 100vh;
}
.van-cell {
  display: block
}

.van-field__label {
  font-size: 15px;
  margin-left: 10rpx;
}

.van-cell__value {
  border-bottom: 2rpx solid #e4e4e4;
  padding: 10rpx 0;
}

.van-field__control {
  font-size: 14px;
}


.PersonalInformation-home {
  width: 100%;
  height: 100%;
  background: #f1f4fc;
  position: relative
}

.PersonalInformation-home .PersonalInformation-head {
  width: 100%;
  top: 0;
  left: 0;
  height: 120rpx;
  background: linear-gradient(270deg, #08bbc2, #144988);
  position: absolute;
  z-index: 1
}

.PersonalInformation-home .PersonalInformation-box {
  position: absolute;
  width: calc(100% - 120rpx);
  left: 60rpx;
  top: 60rpx;
  margin: auto;
  z-index: 1;
  overflow-y: scroll
}

.PersonalInformation-home .PersonalInformation-box .Personalmessage-ul {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx 0;
  padding-bottom: 100rpx;
}

.PersonalInformation-home .PersonalInformation-box .Personalmessage-ul .van-cell {
  padding: 0 24rpx;
  padding-top: 20rpx;
}

.PersonalInformation-home .PersonalInformation-box .Personalmessage-ul-li {
  margin: 20rpx 10rpx 0 10rpx;
}

.PersonalInformation-home .PersonalInformation-btn {
  width: 100%;
  margin-top: 40rpx;
  height: 92rpx;
  line-height: 92rpx;
  background: linear-gradient(270deg, #08bbc2, #144988);
  border-radius: 100rpx;
  border: 0 solid #2ca0f5;
  font-weight: 500;
  color: #fff;
  font-size: 34rpx;
  box-shadow: 0 6rpx 24rpx 2rpx rgba(0, 0, 0, .2);
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
.van-cell--required:before{
  position: absolute;
  left: 20rpx;
  color: #ee0a24;
  font-size: 40rpx;
  content: "*";
}
</style>
