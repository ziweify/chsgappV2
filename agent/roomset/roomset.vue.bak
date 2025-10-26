<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="房间设置">
        <block slot='right'>
          <view @click="refreshNo">刷新房号</view>
        </block>
      </TsCustom>
      <view class="flex-content">
        <view class="flex-list">
          <u-cell-group style="background-color: #fff">
            <u-cell>
              <view slot="icon">
                <u-image radius="4" @click="chooseAndUploadImage" :showLoading="true" :src="avatar" mode="aspectFill" width="55" height="55">
                  <template v-slot:loading>
                    <u-loading-icon color="#0087b4"></u-loading-icon>
                  </template>
                </u-image>
              </view>
              <view slot="title" class="Personal-conten-datatitle">
                <view class="Personal-conten-datatitle-1">房间号：{{ account.roomid }}</view>
                <view class="Personal-conten-datatitle-1">到期时间：{{ account.expiryDate }}</view>
                <view class="Personal-conten-datatitle-1">当前账号：{{ account.username }}</view>
              </view>
            </u-cell>
          </u-cell-group>

          <u-cell-group style="background-color: #fff;margin-top: 20rpx;">
            <u-cell title="游戏设置" :isLink="true" @click="gotoGameSet()"></u-cell>
            <u-cell title="消息设置" :isLink="true" @click="msgsetTo()"></u-cell>
            <u-cell title="修改密码" :isLink="true" @click="gotoModifypwd()"></u-cell>
            <u-cell title="通知铃声" :isLink="true" @click="gotoSound()"></u-cell>
          </u-cell-group>

          <u-cell-group style="background-color: #fff;margin-top: 20rpx;">
            <u-cell v-for="(item,index) in configInfo.input" :title="item.name" :isLink="true" :stop="false" @click="showInput(item,index)">
              <view @click.stop="tips(item)" slot="icon">
                <u-icon size="22" color="rgb(0, 135, 180)" name="error-circle"></u-icon>
              </view>
              <text v-if="item.type === 'input'" slot="value">{{item.value}}</text>
            </u-cell>
          </u-cell-group>
          <u-cell-group style="background-color: #fff;margin-top: 20rpx;">
            <u-cell v-for="(item,index) in configInfo.switch" :stop="false" :title="item.name">
              <view @click.stop="tips(item)" slot="icon">
                <u-icon size="22" color="rgb(0, 135, 180)" name="error-circle"></u-icon>
              </view>
              <u-switch @change="switchChange($event,item)" :activeValue="1" :inactiveValue="0" :enableText="true" :activeText="item.activeText" :inactiveText="item.inactiveText" size="26" slot="value" activeColor="#0087B4FF" inactiveColor="#ccc" v-model="item.value"></u-switch>
            </u-cell>
          </u-cell-group>
        </view>
      </view>
    </view>

    <u-modal :show="isShowInput" :showConfirmButton="false" :closeOnClickOverlay="true" @close="isShowInput = false">
      <view style="width: 100%;height: 100%;">
        <view class="tit1">{{currentItem.name}}</view>
        <u-input :focus="focus" v-if="currentItem.type === 'input'" v-model="inputValue"></u-input>
        <u--textarea v-if="currentItem.type === 'textarea'" count maxlength="300" v-model="inputValue" placeholder="请输入内容" ></u--textarea>
        <view style="display: flex;margin-top:40rpx">
          <u-button @click="isShowInput = !isShowInput" class="btncon">取消</u-button>
          <u-button class="btncon" @click="saveInput">确定</u-button>
        </view>
      </view>
    </u-modal>
    <u-modal :show="isShowReresh" :showConfirmButton="false" :closeOnClickOverlay="true" @close="isShowReresh = false">
      <view style="width: 100%;height: 100%;">
        <view class="refresh-title">更新房间号</view>
        <view class="refresh-tips">机器人房间号刷新后，再次进入房间需要输入新的房间号，请确认是否刷新房间号？</view>
        <view class="refresh-con">
          <view style="margin-right: 15rpx;"><text style="color: #fe0101">*</text>密码</view>
          <u-input type="password" placeholder="请输入密码" :focus="nofocus" v-model="password"></u-input>
        </view>
        <view style="display: flex;margin-top:40rpx">
          <u-button @click="isShowReresh = !isShowReresh" class="btncon">取消</u-button>
          <u-button class="btncon" @click="doRefreshNo">确定</u-button>
        </view>
      </view>
    </u-modal>
    <u-popup :customStyle="{'width':'90%'}" :show="tipsShow" mode="center" :round="5" @close="tipsShow = false" :closeOnClickOverlay="true">
      <view style="padding: 10px;display: flex;flex-direction: column;justify-content: center">
        <text style="margin-bottom: 5px;color: #f56c6c">提示：</text>
        <view v-for="(item,index) in msgMap[currentKey]" style="display: flex;justify-content: center;">
          <text v-if="item.type == 'text'" style="line-height: 20px;color: #423f44">{{item.content}}</text>
          <image style="width: 250rpx;height: 300rpx;margin-top: 10rpx;" v-if="item.type == 'image'" :src="item.content"></image>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
import {HTTP_REQUEST_URL} from "@/common/config";

export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      tipsShow:false,
      backUrl: 'agent/gamehall/hall',
      currentKey:'',
      msgMap:{
        roomName:[{type:'text',content:'群主房间显示的名字(会员不会看到该名字)'}],
        roomNickname:[{type:'text',content:'聊天室内会员看到的群主昵称'}],
        roomNotice:[{type:'text',content:'设置公告后玩家进入房间，可以在游戏大厅顶部看到滚动公告内容'}],
        chatroomNicknameLength:[{type:'text',content:'控制聊天室消息中会员的昵称显示长度，比如设置为2，用户昵称是[张三丰]，那么在聊天室内则会显示为[张三]'}],
        lowScoreNoBillMessage:[{type:'text',content:'设置后将不会发送分数低于设置的值的会员积分，比如设置为100，那么结算后如果会员的积分低于100，则不会出现在结算后的积分核对账单中(设置0则不限制)'}],
        wrongAttemptsAllowed:[{type:'text',content:'用于限制会员下分时的下分密码可错次数，若会员下分时输入的密码错误次数超过系统设置的次数，系统则会限制该会员来确保会员的财产安全。强烈建议所有会员都启用下分密码(下分密码启用路径：会员个人中心-安全设置-下分密码)'}],
        passwordAttemptsAllowed:[{type:'text',content:'用于限制群主子账号连续登录时的密码可错次数，超过系统设置的次数后，系统则会停用该子账号'}],
        wordBetWarning:[{type:'text',content:'设置后单注下注金额大于或等于预警值将会通知群主(设置0则不预警)'}],
        bigWinningWarning:[{type:'text',content:'设置后会员单注中奖金额大于或等于预警值将会通知群主(设置0则不预警)'}],
        groupJoinReview:[{type:'text',content:'开启后新会员入群需要群主审核，关闭则可以直接进群'}],
        creditChAndGrpJoinSound:[{type:'text',content:'开启后有会员上下分或进群，会有提示音播报，关闭则不播报提示音'}],
        dtSettleMethod:[{type:'text',content:'时时彩类型龙虎和玩法的结算方式，返本表示开和就把本金返还会员，通杀表示开和会员全输'}],
        selfWater:[{type:'text',content:'开启后会员可以进行自助回水，关闭后会员将无法看到自助回水功能'}],
        showOdds:[{type:'text',content:'开启后会员可以在房间介绍或聊天室的常规投注模式中看到赔率，关闭则无法看到赔率'}],
        showTurnover:[{type:'text',content:'开启后会员聊天室右上角会显示流水，关闭则不显示'}],
        showPrediction:[{type:'text',content:'开启后会员右上角会有个预测功能的按钮，关闭则不显示该功能按钮'}],
        banChat:[{type:'text',content:'禁止后会员将只能从下注键盘中选取发送内容，允许后会员可以使用系统键盘发送任意消息'}],
        webInputKeyboard:[{type:'text',content:'开启后会员默认使用机器人下注键盘，关闭后不显示'}],
        betSuccessResponse:[{type:'text',content:'开启后会员下注成功系统会回复消息，关闭则不回复'}],
        betUserCreditOnly:[{type:'text',content:'开启后结算的账单消息中只显示有下注的用户积分，关闭则发送所有会员积分'}],
        orderSummaryDisplay:[{type:'text',content:'开启后玩家下注将简化显示，点击可查看详情，关闭后将直接显示会员所有下注内容'}],
        nonOrderCommandResponse:[{type:'text',content:'开启后玩家发送了错误的下注指令系统也会回复，关闭后则不会回复错误指令'}],
        currentDrawImage:[{type:'text',content:'开启后结算消息会发送当期的开奖图，关闭则不发'},{type:'image',content:'/static/img/kj2.png'}],
        latestDrawImage:[{type:'text',content:'开启后结算消息会发送近20期的开奖图样式一(请前往群内查看)，关闭则不发'},{type:'image',content:'/static/img/kj1.png'}],
        allowRepeatCreditChanges:[{type:'text',content:'开启后则允许用户重复提交上下分申请，关闭后则不能重复提交，需要等待上一笔上下分完成后才能提交新的申请'}],
        agentSubTurnoverDetails:[{type:'text',content:'关闭显示后，代理身份的会员将无法查看代理报表中的：旗下流水、会员流水、返佣比例'}],
        waterStatByTotalTurnover:[{type:'text',content:'开启后回水时会把所有游戏的流水汇总统计后，按总流水进行计算回水比例，关闭则是按单个游戏的流水进行计算回水比例（不影响特殊回水比例）'}],
      },
      configInfo:[],
      account:[],
      isShowInput:false,
      currentIndex:0,
      currentItem:{},
      inputValue:'',
      focus:false,
      isShowReresh:false,
      nofocus:false,
      password:'',
      headImageDomain:'',
      avatar:'',
    };
  },
  onLoad() {
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    let aurl = uni.getStorageSync('avatar');
    if(aurl){
      this.avatar = this.headImageDomain+uni.getStorageSync('avatar');
    }else{
      this.avatar = '/static/img/room_bg.2c58cefc.png';
    }
    this.getConfigInfo();
  },
  methods: {
    chooseAndUploadImage() {
      // 选择图片
      let that = this;
      uni.chooseImage({
        count: 1, // 默认9，设置图片的数量
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        crop: true, // 启用图片裁剪
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths;
          //如果是app
          // #ifdef APP-PLUS
          // 压缩图片
          uni.compressImage({
            src: tempFilePaths[0],
            quality: 50, // 压缩质量，范围为0-100，默认为80
            success: (compressRes) => {
              const uploadTask = uni.uploadFile({
                url: HTTP_REQUEST_URL + '/member/uploadheadimg', // 服务器上传接口地址
                filePath: tempFilePaths[0],
                name: 'file', // 必须填写，后台用来接收文件
                header: {
                  'Authorization': uni.getStorageSync('token') // 添加请求头 Authorization
                },
                formData: {},
                success: (uploadFileRes) => {
                  let data = JSON.parse(uploadFileRes.data);
                  that.avatar = that.headImageDomain+data.data.url;
                  uni.setStorageSync('avatar', data.data.url);
                  //console.log('图片上传成功', uploadFileRes);
                },
                fail: (uploadFileErr) => {
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
            url: HTTP_REQUEST_URL + '/member/uploadheadimg', // 服务器上传接口地址
            filePath: tempFilePaths[0],
            name: 'file', // 必须填写，后台用来接收文件
            header: {
              'Authorization': uni.getStorageSync('token') // 添加请求头 Authorization
            },
            formData: {},
            success: (uploadFileRes) => {
              let data = JSON.parse(uploadFileRes.data);
              that.avatar = that.headImageDomain+data.data.url;
              uni.setStorageSync('avatar', data.data.url);
              //console.log('图片上传成功', uploadFileRes);
            },
            fail: (uploadFileErr) => {
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
        }
      });
    },
    doRefreshNo(){
      if(this.$u.test.empty(this.password)){
        this.$u.toast('请输入密码');
        return;
      }
      this.isShowReresh = false;
      uni.showLoading({title: '加载中'});
      this.$u.api.agent.refreshRoomId({password:this.password}).then(res => {
        uni.hideLoading();
        this.account.roomid = res.data.roomid;
        this.$u.toast(res.msg);
      });
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
    switchChange(event,item){
      this.$u.api.agent.saveConfig({key:item.key,value:event}).then(res => {
        this.$u.toast(res.msg);
      });
    },
    refreshNo(){
      this.isShowReresh = true;
      this.$nextTick(() => {this.nofocus = true;})
    },
    getConfigInfo(){
      this.$u.api.agent.getConfigInfo({}).then(res => {
        this.configInfo = res.data.configInfo;
        this.account = res.data.account;
      });
    },
    tips(item){
      this.currentKey = item.key;
      this.tipsShow = true;
    },
    showInput(item,index) {
      this.currentItem = item;
      this.currentIndex = index;
      this.inputValue = item.value;
      this.isShowInput = true;
      this.$nextTick(() => {this.focus = true;})
    },
    gotoModifypwd() {
      uni.$utils.jump('agent/common/modifypwd');
    },
    gotoGameSet() {
      uni.$utils.jump('agent/roomset/gameset');
    },
    msgsetTo() {
      uni.$utils.jump('agent/roomset/msgset');
    },
    gotoSound(){
      uni.$utils.jump('agent/roomset/soundset');
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
