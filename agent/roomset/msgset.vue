<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" class="t-head-m1">
        <view slot="title" style="display: flex;align-items: center;" @click="isShowGamePanel = !isShowGamePanel">
          <view>{{ curItem.gname }}</view>
          <u-icon style="margin-left: 8rpx;" size="18" color="#fff" :name="isShowGamePanel ? 'arrow-up' : 'arrow-down'"></u-icon>
        </view>
        <block slot='right'>
          <view @click="showMod(3)">消息重置</view>
        </block>
      </TsCustom>
      <view class="flex-content">
        <u-collapse>
          <u-collapse-item :title="item.msg_name" :clickable="false" v-for="(item,index) in msgList" :key="index">
            <view class="content">
              <view class="switch-container">
                <view class="switch-label">启用状态</view>
                <u-switch 
                  :value="item.ifok == 1"
                  @change="(val) => switchChange(val, index)"
                  size="22" 
                  activeColor="#08bbc2"
                ></u-switch>
              </view>
              <view class="tips">
                注意：所有花括号（比如{游戏}）包含的都属于系统内置识别码，请不要更改，否则会导致系统无法识别指令。
              </view>
              <view v-show="item.is_time" class="line"><view class="line-left"></view><view class="line-con">时间</view></view>
              <view v-show="item.is_time" class="u-border" style="display: flex;align-items: center;justify-content: space-between;border-radius: 8rpx;padding: 10rpx 20rpx;">
                <view>距封盘</view>
                <view style="display: flex;align-items: center">
                  <view style="width: 50rpx;margin-right:10rpx;">
                    <u--input v-model="item.msg_time" border="none"></u--input>
                  </view>
                  <view>秒</view>
                </view>
              </view>
              <view class="line"><view class="line-left"></view><view class="line-con">内容</view></view>
              <view>
                <u--textarea :autoHeight="true" v-model="item.msg_content" style="background-color: transparent;" count placeholder="请输入内容"></u--textarea>
              </view>
              <view class="line"><view class="line-left"></view><view class="line-con">说明</view></view>
              <view>
                <u--textarea v-model="item.remark" style="background-color: transparent;color: #8f8d8e;" disabled></u--textarea>
              </view>
            </view>
          </u-collapse-item>
        </u-collapse>
      </view>
      <view class="footer">
        <view class="footer-item" @click="showMod(2)">同步所有</view>
        <view class="footer-item" @click="showMod(1)">保存设置</view>
      </view>
    </view>
    <u-overlay :show="isShowGamePanel" @click="isShowGamePanel = false" :style="{'top':top+'px'}">
      <u-transition @click.prevent :show="isShowGamePanel" :customStyle="{'position':'fixed','width':'100%'}" mode="fade">
        <view style="border-top: 1px solid #eee;">
          <view class="van-dropdown-item__content">
            <view class="lotteryItem">
              <view class="lotteryI" v-for="item in gameList" :key="item.gid">
                <view @click.stop="selectGid(item)" class="span1" :class="{'active':item.gid == curItem.gid}">{{ item.gname }}</view>
              </view>
            </view>
          </view>
        </view>
      </u-transition>
    </u-overlay>
    <u-modal confirm-text="确定" :show="showModel" @confirm="doAction" @cancel="showModel = !showModel" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">{{ modalContetn }}</view>
    </u-modal>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl: 'agent/roomset/roomset',
      msgList: [],
      gameList:[],
      curItem:{},
      isShowGamePanel:false,
      top:0,
      showModel:false,
      modalContetn:'',
      type:1,
    }
  },
  onLoad() {
    this.getGameListAll();
  },
  onReady() {
    this.$u.getRect('.t-head-m1').then(res => {
      this.top = res.height;
    })
  },
  methods: {
    showMod(type){
      this.showModel = true;
      this.type = type;
      if(type === 1){
        this.modalContetn = "确认要保存设置？";
      }else if (type === 2){
        this.modalContetn = "确认要根据"+this.curItem.gname+"同步所有游戏？";
      }else if (type === 3){
        this.modalContetn = "确认要恢复到系统初始消息设置吗？";
      }
    },
    doAction(){
      this.showModel = false;
      if(this.type === 1){//保存设置
        this.saveGameMsg();
      }else if (this.type === 2) {//同步所有
        this.synAllGameMsg();
      }else if(this.type === 3){//消息重置
        this.resetGameMsg();
      }
    },
    selectGid(item){
      this.isShowGamePanel = false;
      this.curItem = item;
      this.getGameMsgList(item.gid);
    },
    switchChange(val, index) {
      // val是布尔值，需要转换为1或0
      this.msgList[index].ifok = val ? 1 : 0;
    },
    saveGameSetting(){
      uni.showLoading({title: '加载中'});
      this.$u.api.agent.saveGameSetting({msgList:this.msgList}).then(res => {
        uni.hideLoading();
        this.$u.toast(res.msg);
      });
    },
    getGameListAll(){
      this.$u.api.agent.getGameListAll({}).then(res => {
        this.gameList = res.data.list;
        this.curItem = this.gameList[0];
        this.getGameMsgList(this.curItem.gid);
      });
    },
    getGameMsgList(gid){
      this.$u.api.agent.getGameMsgList({gid:gid}).then(res => {
        this.msgList = res.data.list.map(item => {
          // 如果后端没有返回ifok字段，设置默认值为1
          if (item.ifok === undefined || item.ifok === null) {
            item.ifok = 1;
          }
          return item;
        });
      });
    },
    synAllGameMsg(){
      uni.showLoading({title: '加载中'});
      this.$u.api.agent.synAllGameMsg({gid:this.curItem.gid}).then(res => {
        uni.hideLoading();
        this.$u.toast(res.msg);
      });
    },
    saveGameMsg(){
      uni.showLoading({title: '加载中'});
      this.$u.api.agent.saveGameMsg({gid:this.curItem.gid,msgList:this.msgList}).then(res => {
        uni.hideLoading();
        this.$u.toast(res.msg);
      });
    },
    resetGameMsg(){
      uni.showLoading({title: '加载中'});
      this.$u.api.agent.resetGameMsg({gid:this.curItem.gid}).then(res => {
        uni.hideLoading();
        this.getGameMsgList(this.curItem.gid);
        this.$u.toast(res.msg);
      });
    },
  }
}
</script>
<style lang="scss" scoped>
.van-dropdown-item__content {
  max-height: 80%;
  background-color: #fff;
  padding-bottom: 8px;
}
.lotteryItem {
  display: flex;
  justify-content: flex-start;
  text-align: center;
  flex-wrap: wrap;
}

.lotteryItem .lotteryI {
  width: 33.3%;
  padding: 8px 8px 0 8px;
  box-sizing: border-box;
}

.lotteryItem .lotteryI .span1 {
  padding: 10px 5px;
  border-radius: 54px;
  background-color: #f4f4f4;
}

.lotteryItem .lotteryI .span1.active {
  color: #fff;
  background: #0087b4;
}

.tips{
  font-size: 24rpx;
  color: #9e9e9e;
}

.footer{
  display: flex;
  width: 100%;
  background: #f3f7f9;
  justify-content: space-around;
  padding: 40rpx 0;
  &-item{
    color: #fff;
    background: linear-gradient(270deg, #08bbc2, #144988);
    border-radius: 40rpx;
    padding: 20rpx 100rpx;
    text-align: center;
    font-size: 30rpx;
  }
}

.content{
  background-color: #f3f7f9;
  padding: 20rpx;
  
  .switch-container{
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    border-radius: 6rpx;
    padding: 16rpx 16rpx;
    margin-bottom: 16rpx;
    .switch-label{
      font-size: 24rpx;
      color: #303133;
      font-weight: 400;
    }
  }
  .line{
    display: flex;
    align-items: center;
    margin: 20rpx 0;
    .line-left{
      width: 8rpx;
      height: 50rpx;
      background-color: #08bbc2;
    }
    .line-con{
      margin-left: 10rpx;
    }
  }
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
      flex: 1;
      overflow-y: auto;
      scroll-behavior: smooth;
    }
  }
}
</style>
