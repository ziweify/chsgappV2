<template>
  <view class="layout">
  <z-paging :auto-hide-keyboard-when-chat="false" :paging-style="{'background':'url(/static/img/chatbg.f614ca48.png)'}" @scroll="scroll" ref="paging" v-model="chatList" use-chat-record-mode safe-area-inset-bottom bottom-bg-color="#f8f8f8"
            @query="queryList">
    <template #top>
      <TsCustom :backUrl="backUrl" :isBack="true" :title="ctile">
        <block slot="icon">
          <image style="width: 22px;height: 22px;margin-right: 5px;" src="/static/image/icon/severIcon.png"></image>
        </block>
      </TsCustom>
    </template>
    <view v-for="(item,index) in chatList" :key="index">
      <view style="transform: scaleY(-1)">
        <view :class="index === chatList.length-1 ? 'linetop' : ''" class="timeLine" v-show="item.showtime">
          <text class="timeLine-text">{{item.showtime}}</text>
        </view>
        <chat-item :headImageDomain="headImageDomain" :conImageDomain="chatImageDomain" :uid="uid" :item="item"></chat-item>
      </view>
    </view>
    <!-- 底部聊天输入框 -->
    <template #bottom>
      <view class="chat-input-bar-container">
        <view class="chat-input-bar">
          <view class="key-board" @click="chooseAndUploadImage">
            <image src="/static/image/icon/imagebtn.png"></image>
          </view>
          <view class="chat-input-container">
            <u-input :focus="focus" class="chat-input" v-model="sendmsg" :adjustPosition="false" type="text"/>
          </view>
          <view class="chat-input-send">
            <image @touchend.prevent="sendevent" src="/static/img/send.png"></image>
          </view>
        </view>
      </view>
    </template>
  </z-paging>
  </view>
</template>
<script>
import {HTTP_REQUEST_URL} from "@/common/config";

export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      isAtBottom:false,
      unreadCount:0,
      chatList:[],
      sendmsg:'',
      avatar: uni.getStorageSync('avatar'),
      uid:0,
      tmpToButomFlag:false,
      headImageDomain:'',
      chatImageDomain:'',
      utype:1,
      ctile:'在线客服',
      receiver:'',
      uploadUrl:'',
      focus:false,
      ingnoreNotice:true,
      backUrl:''
    };
  },
  computed: {
    windowObj() {
      return this.$u.sys();
    }
  },
  onLoad(){
    this.backUrl = uni.getStorageSync('backUrl');
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.chatImageDomain = uni.getStorageSync('chatImageDomain');
    let userInfo = uni.getStorageSync('userInfo');
    this.uid = userInfo.userid;
    this.utype = userInfo.type;
    this.uploadUrl = HTTP_REQUEST_URL + '/common/uploadChatImage';
    if(this.utype == 1){//房主
      this.ctile = uni.getStorageSync('chatName');
      this.receiver = uni.getStorageSync('chatUserid');
    }
    if(uni.$socketUtils.isOpenSocket){
      uni.$socketUtils.send({eventType:"resetNotReadMsg",receiver:this.receiver});
    }
    let that = this;
    //监听聊天消息
    uni.$off('customchat');
    uni.$on('customchat', function(data) {
      //console.log("gamechat"+that.gid,data);
      let msg = data.data;
      let isBottom = false;
      if (!that.isAtBottom) {
        if(Array.isArray(msg)){
          that.unreadCount += msg.length;
        }else{
          that.unreadCount += 1;
        }
        if(that.tmpToButomFlag){
          isBottom = true;
        }
      }
      if(Array.isArray(msg)){
        this.$nextTick(function (){that.$refs.paging.addChatRecordData(msg,isBottom);that.tmpToButomFlag = false;});
      }else{
        if(data.other.msgid && msg.sender == that.uid){
          for (let i = 0; i < that.chatList.length; i++) {
            let oitem = that.chatList[i];
            if(data.other.msgid === oitem.msgid){
              that.chatList[i].nickname = msg.nickname;
              break;
            }
          }
          uni.setStorageSync('sendmsg',that.sendmsg);
          that.sendmsg = "";
        }else{
          this.$nextTick(function (){that.$refs.paging.addChatRecordData(msg,isBottom);that.tmpToButomFlag = false;});
        }
      }
    });
  },
  beforeDestroy(){
    uni.$off('customchat');
  },
  methods: {
    chooseAndUploadImage() {
      // 选择图片
      let that = this;
      let msgid = this.$u.guid(20);let chatType = "image";
      uni.chooseImage({
        count: 1, // 默认9，设置图片的数量
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        crop: true, // 启用图片裁剪
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths;
          uni.showLoading({title: '正在上传'});
          //如果是app
          // #ifdef APP-PLUS
          // 压缩图片
          uni.compressImage({
            src: tempFilePaths[0],
            quality: 50, // 压缩质量，范围为0-100，默认为80
            success: (compressRes) => {
              const uploadTask = uni.uploadFile({
                url: that.uploadUrl, // 服务器上传接口地址
                filePath: tempFilePaths[0],
                name: 'file', // 必须填写，后台用来接收文件
                header: {
                  'Authorization': uni.getStorageSync('token') // 添加请求头 Authorization
                },
                formData: {},
                success: (uploadFileRes) => {
                  uni.hideLoading();
                  let data = JSON.parse(uploadFileRes.data);
                  let msgitem = {avatar:that.avatar,chatType:chatType,content:data.data.url,nickname:'发送中',sender:that.uid,msgid:msgid};
                  if(that.utype == 1){
                    msgitem.receiver = that.receiver;
                  }
                  that.$refs.paging.addChatRecordData(msgitem);
                  msgitem = {eventType:"customchat",chatType:chatType,content:data.data.url,msgid:msgid};
                  if(that.utype == 1){
                    msgitem.receiver = that.receiver;
                  }
                  uni.$socketUtils.send(msgitem);
                },
                fail: (uploadFileErr) => {
                  uni.hideLoading();
                  console.error('图片上传失败', uploadFileErr);
                }
              });
              // 监听上传进度变化
              uploadTask.onProgressUpdate((res) => {
                console.log('上传进度' + res.progress + '%');
              });
            },
            fail: (compressErr) => {
              console.error('图片压缩失败', compressErr);
            }
          });
          // #endif
          // #ifdef H5
          const uploadTask = uni.uploadFile({
            url: that.uploadUrl, // 服务器上传接口地址
            filePath: tempFilePaths[0],
            name: 'file', // 必须填写，后台用来接收文件
            header: {
              'Authorization': uni.getStorageSync('token') // 添加请求头 Authorization
            },
            formData: {},
            success: (uploadFileRes) => {
              uni.hideLoading();
              let data = JSON.parse(uploadFileRes.data);
              let msgitem = {avatar:that.avatar,chatType:chatType,content:data.data.url,nickname:'发送中',sender:that.uid,msgid:msgid};
              that.$refs.paging.addChatRecordData(msgitem);
              msgitem = {eventType:"customchat",chatType:chatType,content:data.data.url,msgid:msgid};
              if(that.utype == 1){
                msgitem.receiver = that.receiver;
              }
              uni.$socketUtils.send(msgitem);
            },
            fail: (uploadFileErr) => {
              uni.hideLoading();
              console.error('图片上传失败', uploadFileErr);
            }
          });
          // 监听上传进度变化
          uploadTask.onProgressUpdate((res) => {
            console.log('上传进度' + res.progress + '%');
          });
          // #endif
        },
        fail: (chooseImageErr) => {
          console.error('选择图片失败', chooseImageErr);
          uni.$utils.showToast('选择图片失败');
        }
      });
    },
    showTime(starttime,endtime){
      var diff = Math.abs(endtime-starttime);
      return diff > 600;
    },
    scroll(e){
      const { scrollTop,scrollHeight} = e.detail;
      this.isAtBottom = scrollTop <= 50;
      if (this.isAtBottom) {
        this.unreadCount = 0;
      }
    },
    queryList(pageNo, pageSize) {
      const params = {page: pageNo,pageSize: pageSize};
      if(this.utype == 1){//房主
        params.uid = this.receiver;
      }
      this.$u.api.common.customChatRecords(params).then(res => {
        this.$refs.paging.complete(res.data.list);
      }).catch(res => {
        this.$refs.paging.complete(false);
      })
    },
    sendevent(){
      if(this.sendmsg.length <= 0){
        this.$u.toast('发送消息不能为空');
        return;
      }
      let msgid = this.$u.guid(20);let chatType = "text";
      let msgitem = {avatar:this.avatar,chatType:chatType,content:this.sendmsg,nickname:'发送中',sender:this.uid,msgid:msgid};
      this.$refs.paging.addChatRecordData(msgitem);
      msgitem = {eventType:"customchat",chatType:chatType,content:this.sendmsg,msgid:msgid};
      if(this.utype == 1){//房主
        msgitem.receiver = this.receiver;
      }
      uni.$socketUtils.send(msgitem);
    }
  }
}
</script>

<style lang="scss" scoped>
/* 底部 */
.chat-input-bar-container{
  .chat-input-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-top: solid 1px #f5f5f5;
    background-color: #f8f8f8;
    padding: 10rpx 20rpx;
    .key-board{
      display: flex;
      align-items: center;
      height: 90rpx;
      padding-right: 20rpx;
      image{
        width: 29px;
        height: 29px;
        display: block;
      }
    }
    .chat-input-container {
      flex: 1;
      /* #ifndef APP-NVUE */
      display: flex;
      /* #endif */
      background-color: white;
      border-radius: 10rpx;
      .chat-input {
        flex: 1;
        font-size: 28rpx;
      }
    }
    .chat-input-send {
      display: flex;
      align-items: center;
      padding-left: 20rpx;
      image{
        width: 29px;
        height: 29px;
      }
    }
  }
}
.layout{
  background-repeat: no-repeat;
  background-size: cover;
}
.timeLine{
  margin: 0 10px;
  font-size: 12px;
  text-align: center;
  color: #483d54;
  .timeLine-text{
    background: #f3f5f9;
    padding: 5px;
    border-radius: 4px;
  }
}
.linetop{
  padding-top: 10px !important;
  margin-bottom: -10px !important;
}
</style>



