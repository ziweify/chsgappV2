<template>
  <view class="modal-container">
    <view class="modal-content">
      <view style="border-right: 1px solid lightgray;background: #EEF7FE;">
        <view style="padding: 20rpx 30rpx;border-bottom: 1px solid #fff;display: flex;justify-content: flex-start;">
          <uni-icons v-if="customMsgType == 2 || customMsgType == 3" type="info-filled" size="30" style="margin-right: 20rpx;" color="#9BCEFD"/>
          <uni-icons v-if="customMsgType == 1" type="email-filled" size="30" style="margin-right: 20rpx;" color="#9BCEFD"/>
          <text style="margin: auto 0;">{{ title }}</text>
        </view>
      </view>
      <view style="display: flex; flex-direction: row; justify-content: space-between;border-bottom: 2rpx solid #CBCBCB;">
<!--        <view :style="'display: flex; flex-direction: column; padding: 20rpx 0;border-bottom: 1px solid #fff; color: #fff;'" v-if="customMsgType == 2">
          <text style="color: #2A2A2A; font-size: 36rpx;">{{ msg1 }}</text>
          <text style="color: #8D8D8D; font-size: 32rpx;">{{ msg2 }}</text>
        </view>
        <view style="margin: auto 0" v-if="customMsgType == 2">
          <text style="background-color: #C7C7C7; padding: 10rpx 20rpx; margin-right: 24rpx; color: #fff; border-radius: 40rpx;">忽略</text>
          <text style="background-color: #FC5658; padding: 10rpx 20rpx; margin-right: 24rpx; color: #fff; border-radius: 40rpx;">拒绝</text>
          <text style="background-color: #126295; padding: 10rpx 20rpx; margin-right: 24rpx; color: #fff; border-radius: 40rpx;">通过</text>
        </view>-->
        <view class="msg-siliao">
          <image :src="avatar" style="width: 80rpx;height: 80rpx;"></image>
          <view style="margin-left: 20rpx;">{{customMsg.nickname}}</view>
          <view style="margin-left: 20rpx;">{{customMsg.content}}</view>
        </view>
      </view>
      <text style="color: #16839A;text-align: center;padding: 30rpx 0;" @click="goto()">进入查看</text>
    </view>
    <uni-icons type="close" color="#fff" size="48" style="margin: 20rpx auto 0 auto;z-index: 1000;" @click="close()"/>
  </view>
</template>
<script>
export default {
  mixins: [uni.$mymixin],
  name: 'notice-popup',
  data() {
    return {
      title: '',
      msg1: '111',
      msg2: '222',
      customMsgType: 1,//1 私聊消息 2上下分申请
      customMsg: {},
      headImageDomain: '',
      avatar:'',
      audio:null
    }
  },
  onLoad() {
    uni.$off('newMessageNotice');
    let that = this;
    uni.$on('newMessageNotice', function(res) {
      that.init();
    });
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.init();
  },
  beforeDestroy() {
    uni.$off('newMessageNotice');
    //销毁音频
    if(this.audio){
      this.audio.offEnded();
      this.audio.stop();
      this.audio.destroy();
      this.audio = null;
    }
  },
  methods: {
    init(){
      this.customMsgType = uni.getStorageSync('customMsgType');
      let msg = uni.getStorageSync('customMsg');
      this.customMsg = JSON.parse(msg);let sound = {};
      if(this.customMsgType == 1){//私聊消息
        this.title = '私聊消息';
        this.avatar = this.headImageDomain+this.customMsg.avatar;
        //语音
        sound = uni.getStorageSync('chatSound');
        if(sound){
          sound = JSON.parse(sound);
        }else{
          sound = {label:'默认',id:1};
        }
      }else if (this.customMsgType == 2){//上下分申请
        let tstr = this.customMsg.other.applyType == 2 ? '上分申请' : '下分申请';
        this.title = "您有新的("+this.customMsg.other.money+")"+tstr;
        this.avatar = this.headImageDomain+this.customMsg.other.avatar;
        this.customMsg.nickname = this.customMsg.other.nickname;
        //语音
        if(this.customMsg.other.applyType == 2){
          sound = uni.getStorageSync('upSound');
          if(sound){
            sound = JSON.parse(sound);
          }else{
            sound = {label:'默认',id:13};
          }
        }else{
          sound = uni.getStorageSync('downSound');
          if(sound){
            sound = JSON.parse(sound);
          }else{
            sound = {label:'默认',id:13};
          }
        }
      }else if (this.customMsgType == 3){//入群申请
        this.title = '入群申请';
        this.avatar = this.headImageDomain+this.customMsg.other.avatar;
        this.customMsg.nickname = this.customMsg.other.nickname;
        //语音
        sound = uni.getStorageSync('joinSound');
        if(sound){
          sound = JSON.parse(sound);
        }else{
          sound = {label:'默认',id:2};
        }
      }
      if(sound.id == 0){
        return;
      }
      let volume = uni.getStorageSync('volume');
      if(!volume){
        volume = 1;
      }
      this.audio = uni.createInnerAudioContext();
      this.audio.src = '/static/wav/s'+sound.id+'.mp3';
      this.audio.volume = volume;
      this.audio.sessionCategory = 'playback';
      //this.audio.loop = true;
      let that = this;
      this.audio.onEnded(()=>{
        setTimeout(function(){
          if(that.audio){
            that.audio.play();
          }
        },800);
      });
      this.audio.play();
    },
    goto(){
      if(this.customMsgType == 1){//私聊
        uni.setStorageSync("chatName",this.customMsg.nickname);
        uni.setStorageSync("chatUserid",this.customMsg.sender);
        uni.$utils.jump("copage/custChat",'redirectTo');
      }else if (this.customMsgType == 2){//上下分申请
        uni.$utils.jump("agent/manage/apply",'redirectTo');
      }else if (this.customMsgType == 3){//入群申请
        uni.$utils.jump("agent/manage/groupApply",'redirectTo');
      }
    },
    close() {
      let len = getCurrentPages().length;
      if(len === 1){
        let userInfo = uni.getStorageSync('userInfo');
        if(userInfo.type === 1){
          uni.$utils.jump('agent/gamehall/hall','reLaunch');
        }else{
          uni.$utils.jump('pages/gamehall/gamehall','reLaunch');
        }
      }else{
        uni.navigateBack();
      }
    }
  },
}
</script>
<style lang="scss" scoped>
$fontSizeLg: 17px;
$fontSizeSm: 15px;

.msg-siliao{
  display: flex;
  padding: 30rpx;
  align-items: center;
  font-size: 28rpx;
  color: #2A2A2A;
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.4);
  transition: all 5s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 40rpx;
  /*animation: fadeZoom .15s linear;*/
  .modal-content {
    border-radius: 26rpx;
    background: #FFFFFF;
    overflow: hidden;
    width: 100%;
    font-size: $fontSizeSm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  @keyframes fadeZoom {
    0% {
      transform: scale(.7);
      opacity: .6;
    }

    80% {
      transform: scale(1.2);
      opacity: .3;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
}
</style>
