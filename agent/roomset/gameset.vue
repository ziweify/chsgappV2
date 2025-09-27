<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="游戏设置">
        <block slot='right'>
          <view @click="saveGameSetting" class="header-refresh-no">保存</view>
        </block>
      </TsCustom>
      <view class="flex-content">
        <u-collapse>
          <u-collapse-item :clickable="false" :is-link="false" v-for="(item,index) in gameList" :title="item.gname" :key="index">
            <view slot="icon">
              <image style="width: 60rpx;height: 60rpx;margin-right: 10rpx;" :src="'/static/glogo1/'+item.gid+'.png'"></image>
            </view>
            <view slot="value" style="margin-right: 10rpx;" @tap.stop.prevent>
              <u-switch @change="doWwitch($event,item)" :activeValue="1" :inactiveValue="0" size="18" activeColor="#0087B4FF" inactiveColor="#ccc" v-model="item.ifok"></u-switch>
            </view>
            <view class="content">
              <u--form labelWidth="140" labelPosition="left" ref="uForm">
                <u-form-item label="序号：" prop="userInfo.name" borderBottom>
                  <u--input v-model="item.xsort" border="none"></u--input>
                </u-form-item>
                <u-form-item label="提前封盘时间/秒：" prop="userInfo.name" borderBottom>
                  <u--input v-model="item.fpseconds" border="none"></u--input>
                  <view @click="doBetch('fpseconds',index)" class="piliang">批量</view>
                </u-form-item>
                <!-- <u-form-item label="自动开始：" prop="userInfo.name" borderBottom>
                  <view style="display: flex;width: 100%;">
                    <view style="display: flex;flex: 1;align-items: center" @click="showPicker(index,'autoStartTime')">
                      <u-icon size="18" color="#ddd" name="clock"></u-icon>
                      <view style="margin-left: 20rpx;font-size: 28rpx;">
                        <text style="color: rgb(171 167 167);" v-if="!item.autoStartTime">自动开始时间</text>
                        <text v-if="item.autoStartTime">{{item.autoStartTime}}</text>
                      </view>
                    </view>
                    <view v-if="item.autoStartTime" style="display: flex;justify-content: flex-end;margin-right: 40rpx;">
                      <u-icon @click="clearStartTime(index)" size="16" color="#878a91" name="close-circle-fill"></u-icon>
                    </view>
                    <view @click="doBetch('autoStartTime',index)" class="piliang">批量</view>
                  </view>
                </u-form-item>
                <u-form-item label="自动结束：" prop="userInfo.name" borderBottom>
                  <view style="display: flex;width: 100%;">
                    <view style="display: flex;flex: 1;align-items: center" @click="showPicker(index,'autoEndTime')">
                      <u-icon size="18" color="#ddd" name="clock"></u-icon>
                      <view style="margin-left: 20rpx;font-size: 28rpx;">
                        <text style="color: rgb(171 167 167);" v-if="!item.autoEndTime">自动结束时间</text>
                        <text v-if="item.autoEndTime">{{item.autoEndTime}}</text>
                      </view>
                    </view>
                    <view v-if="item.autoEndTime" style="display: flex;justify-content: flex-end;margin-right: 40rpx;">
                      <u-icon @click="clearEndTime(index)" size="16" color="#878a91" name="close-circle-fill"></u-icon>
                    </view>
                    <view @click="doBetch('autoEndTime',index)" class="piliang">批量</view>
                  </view>
                </u-form-item> -->
                <u-form-item  label="" prop="userInfo.name" borderBottom>
                  <view style="display: flex;justify-content: flex-start;width: 160px;align-items: center">
                    <u-icon @click="tips()" size="22" color="rgb(0, 135, 180)" name="error-circle"></u-icon>
                    <view style="margin-left: 20rpx;">是否允许取消注单</view>
                  </view>
                  <view style="display: flex;justify-content: flex-end;flex: 1;margin-right: 40rpx;">
                    <u-switch :activeValue="1" :inactiveValue="0" size="16" activeColor="#0087B4FF" inactiveColor="#ccc" v-model="item.isCancelOrder"></u-switch>
                  </view>
                  <view @click="doBetch('isCancelOrder',index)" class="piliang">批量</view>
                </u-form-item>
                <view style="font-size: 24rpx;padding:20rpx 0;color: #8f8d8e">
                  注意：提前封盘时间请参考盘内封盘时间设置，最优选择是比盘内提前封盘，否则可能导致飞单失败。
                </view>
              </u--form>
            </view>
          </u-collapse-item>
        </u-collapse>
      </view>
      <view class="footer">
        <view class="footer-item" @click="switchGame(2,0,0)"  style="background: linear-gradient(270deg, rgb(106, 116, 117), #a2b6bd);">一键关闭</view>
        <view class="footer-item" @click="switchGame(3,0,0)">一键开启</view>
      </view>
    </view>
    <u-picker :show="show" ref="uPicker" :closeOnClickOverlay="true" @close="show = false" @cancel="show=false" :columns="columns" @confirm="confirm" @change="changeHandler"></u-picker>
    <u-popup :customStyle="{'width':'90%'}" :show="tipsShow" mode="center" :round="5" @close="tipsShow = false" :closeOnClickOverlay="true">
      <view style="padding: 10px;display: flex;flex-direction: column;justify-content: center">
        <text style="margin-bottom: 5px;color: #f56c6c">提示：</text>
        <view style="display: flex;justify-content: center;flex-direction: column;">
          <text style="line-height: 20px;color: #423f44">取消注单需满足三个条件：</text>
          <text style="line-height: 20px;color: #423f44">①游戏未封盘</text>
          <text style="line-height: 20px;color: #423f44">②游戏设置中开启允许取消注单</text>
          <text style="line-height: 20px;color: #423f44">③打盘报表中设置飞单模式为：距离封盘N秒飞，且游戏倒计时大于N秒</text>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl: 'agent/roomset/roomset',
      checked: true,
      gameList: [],
      tipsShow: false,
      show:false,
      columns:[[],[]],
      columnData:[],
      currentIndex:0,
      field:''
    }
  },
  onLoad() {
    //生成列时间，0-23点
    for(let i=0;i<24;i++){
      if(i < 10){
        this.columns[0].push('0'+i);
      }else{
        this.columns[0].push(i+'');
      }
      //生成列分钟，0-59分
      this.columnData[i] = [];
      for(let x=0;x<60;x++){
        if (x < 10){
          this.columnData[i].push('0'+x);
        }else{
          this.columnData[i].push(x+'');
        }
      }
    }
    this.columns[1] = this.columnData[0];
  },
  onReady() {
    this.getGameSettingList();
  },
  methods: {
    saveGameSetting(){
      uni.showLoading({title: '加载中'});
      this.$u.api.agent.saveGameSetting({gameList:this.gameList}).then(res => {
        uni.hideLoading();
        this.$u.toast(res.msg);
      });
    },
    doBetch(field,index){
      //循环批量设置
      for(let i=0;i<this.gameList.length;i++){
        if(i === index){
          continue;
        }
        this.gameList[i][field] = this.gameList[index][field];
      }
      this.$u.toast("已批量修改");
    },
    clearStartTime(index){
      this.gameList[index].autoStartTime = '';
    },
    clearEndTime(index){
      this.gameList[index].autoEndTime = '';
    },
    confirm(e){
      const time = e.value[0]+":"+e.value[1];
      this.gameList[this.currentIndex][this.field] = time;
      this.show = false;
    },
    changeHandler(e){
      const {columnIndex,index,picker = this.$refs.uPicker} = e;
      if (columnIndex === 0) {
        picker.setColumnValues(1, this.columnData[index])
      }
    },
    showPicker(index,field){
      this.currentIndex = index;
      this.field = field;
      this.show = true;
    },
    tips(){
      this.tipsShow = true;
    },
    doWwitch(value,item){
      this.switchGame(1,item.gid,value);
    },
    getGameSettingList(){
      this.$u.api.agent.getGameSettingList({}).then(res => {
        this.gameList = res.data.gameList;
      });
    },
    switchGame(type,gid,status){
      this.$u.api.agent.switchGame({type,gid,status}).then(res => {
        if(type == 2 || type == 3){
          this.getGameSettingList();
        }
        this.$u.toast(res.msg);
      });
    },
  }
}
</script>
<style lang="scss" scoped>

.piliang{
  border: 4rpx solid #dadbde;
  padding: 2rpx 18rpx;
  font-size: 24rpx;
  border-radius: 6px;
  margin-right: 20rpx;
  color: rgb(171, 167, 167);
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
  padding-left:20rpx;
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

.header-refresh-no {
  display: flex;
  align-items: center;
  color: #fff;
  font-weight: 500;
  font-size: 30rpx;
  justify-content: flex-end;
  margin-right: 15rpx;
  height: 100%;
}
</style>
