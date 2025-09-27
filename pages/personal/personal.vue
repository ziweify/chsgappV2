<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="个人中心"></TsCustom>
      <view class="flex-content">
        <view class="flex-list">
          <u-cell-group style="background-color: #fff">
            <u-cell :isLink="true" @click="goto('pages/member/personamessage',1)">
              <view slot="icon">
                <u-image v-show="avatar" radius="4" :showLoading="true" :src="avatar" mode="aspectFill" width="55" height="55">
                  <template v-slot:loading>
                    <u-loading-icon color="#0087b4"></u-loading-icon>
                  </template>
                </u-image>
              </view>
              <view slot="title" class="Personal-conten-datatitle" v-if="regUserinfo">
                <view class="Personal-conten-datatitle-1">{{ regUserinfo.name }}</view>
                <view class="Personal-conten-datatitle-1">账号：{{ regUserinfo.username }}</view>
              </view>
            </u-cell>
          </u-cell-group>

          <u-cell-group style="background-color: #fff;margin-top: 20rpx;">
            <u-cell :stop="false" title="游戏开奖声音">
              <u-switch @change="switchChange('gamekjVoice')" :activeValue="1" :inactiveValue="0" :enableText="true" size="26" slot="value" activeColor="#0087B4FF" inactiveColor="#ccc" v-model="gamekjVoice"></u-switch>
            </u-cell>
<!--            <u-cell title="聊天室默认聊天条数" :isLink="true" :stop="false" @click="showInput()">
              <text slot="value">50</text>
            </u-cell>-->
            <u-cell :stop="false" title="投注模式">
              <u-switch @change="switchChange('betMode')" :activeValue="1" :inactiveValue="0" :enableText="true" activeText="极速" inactiveText="稳定" size="26" slot="value" activeColor="#0087B4FF" inactiveColor="#ccc" v-model="betMode"></u-switch>
            </u-cell>
            <u-cell title="分享app" :isLink="true"></u-cell>
          </u-cell-group>

          <u-cell-group style="background-color: #fff;margin-top: 20rpx;">
            <u-cell >
              <view slot="title">
                <view @click="show = true" class="" style="width: 100%;text-align: center;padding:10rpx 0;">退出登录</view>
              </view>
            </u-cell>
          </u-cell-group>
        </view>
      </view>
    </view>
    <u-modal :show="show" @cancel="show = !show" @confirm="btnclick" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">是否退出登录？</view>
    </u-modal>
<!--    <u-modal :show="isShowInput" :showConfirmButton="false" :closeOnClickOverlay="true" @close="isShowInput = false">
      <view style="width: 100%;height: 100%;">
        <view class="tit1">请输入条数</view>
        <u-input :focus="focus" v-model="inputValue"></u-input>
        <view style="display: flex;margin-top:40rpx">
          <u-button @click="isShowInput = !isShowInput" class="btncon">取消</u-button>
          <u-button class="btncon" @click="saveInput">确定</u-button>
        </view>
      </view>
    </u-modal>-->
  </view>
</template>

<script>

export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl: 'pages/gamehall/gamehall',
      regUserinfo:[],
      isShowInput:false,
      inputValue:'',
      focus:false,
      nofocus:false,
      headImageDomain:'',
      avatar:'',
      gamekjVoice:1,
      betMode:1,
      show:false
    };
  },
  onLoad() {
    //初始化游戏开奖声音
    let gamekjVoice = uni.getStorageSync('gamekjVoice');
    if(parseInt(gamekjVoice) === 0){
      this.gamekjVoice = 0;
    }
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.getRegUserinfo();
  },
  methods: {
    btnclick(){
      this.show = false;
      this.$u.api.common.logout().then(res => {
        uni.$socketUtils.closeSocket('user');
        uni.removeStorageSync("token");
        uni.removeStorageSync("userInfo");
        uni.removeStorageSync("expiresTime");
        uni.reLaunch({url:'/pages/common/login'});
      });
    },
    goto(url,type = 0){
      if(type == 1){
        uni.setStorageSync('backUrl','pages/personal/personal');
      }
      uni.$utils.jump(url);
    },
    saveInput(){
      this.isShowInput = false;
      if(this.currentItem.value == this.inputValue){
        this.$u.toast('您的设置未有变更');
        return;
      }
      this.$u.api.agent.saveConfig({key:this.currentItem.key,value:this.inputValue}).then(res => {
        this.configInfo.input[this.currentIndex].value = this.inputValue;
        this.$u.toast(res.msg);
      });
    },
    switchChange(field){
      let value = this[field];
      uni.setStorageSync(field,value);
    },
    getRegUserinfo(){
      this.$u.api.member.getRegUserinfo({}).then(res => {
        this.regUserinfo = res.data;
        this.avatar = this.headImageDomain+res.data.avatar;
      });
    },
    showInput(item,index) {
      this.currentItem = item;
      this.currentIndex = index;
      this.inputValue = item.value;
      this.isShowInput = true;
      this.$nextTick(() => {this.focus = true;})
    }
  }
}
</script>

<style lang="scss" scoped>

.refresh-title{
  padding-bottom: 15px;
  text-align: center;
  font-size: 15px;
  color: #606266;
  border-bottom: 1px solid #e5e5e5;
}
.refresh-tips{
  padding-top: 10px;
  padding-bottom: 15px;
  font-size: 14px;
  color: #606266;
}
.refresh-con{
  display: flex;
  align-items: center;

}

.head-img{
  width: 110rpx;
  height: 110rpx;
  border-radius: 4rpx;
}
.Personal-conten-datatitle {
  color: #181818;
  overflow: hidden;
  margin-left: 20rpx;
}
.Personal-conten-datatitle-1:first-child {
  margin: 0;
  font-weight: 600;
  font-size: 32rpx;
  margin-bottom: 8rpx;
}
.Personal-conten-datatitle-1:nth-child(3) {
  margin: 0;
  color: grey;
  font-size: 28rpx;
}
.Personal-conten-datatitle-1:nth-child(2) {
  margin: 0;
  color: grey;
  font-size: 28rpx;
}

.layout{
  width: 100%;
  height: 100%;
  overflow: hidden;
  .flex-layout{
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    .flex-content {
      width: 100%;
      height: 100%;
      background: #f1f4fc;
      flex: 1;
      overflow-y: auto;
    }
  }
}

.tit1 {
  color: #a1a1a1;
  margin-bottom: 20rpx;
}


.btncon:first-child {
  border: 1rpx solid #ccc;
  width: 46%;
}


.btncon:last-child {
  color: #fff;
  background-color: #0087b4;
  width: 46%;
}
</style>
