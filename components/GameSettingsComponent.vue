<template>
  <view class="game-settings-component">
    <!-- 只在非弹窗模式下显示标题栏 -->
    <view v-if="!isPopupMode" class="header-section">
      <TsCustom :backUrl="backUrl" :isBack="true" title="游戏设置">
        <block slot='right'>
          <view @click="saveGameSetting" class="header-refresh-no">保存</view>
        </block>
      </TsCustom>
    </view>
    
    <!-- 在弹窗模式下显示保存按钮 -->
    <view v-if="isPopupMode" class="popup-actions">
      <view class="save-button" @click="saveGameSetting">
        <u-icon name="checkmark" color="#fff" size="16"></u-icon>
        <text>保存设置</text>
      </view>
    </view>
    
    <!-- 游戏设置内容 -->
    <view class="content-section">
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
    
    <!-- 底部操作按钮 -->
    <view class="footer">
      <view class="footer-item" @click="switchGame(2,0,0)"  style="background: linear-gradient(270deg, rgb(106, 116, 117), #a2b6bd);">一键关闭</view>
      <view class="footer-item" @click="switchGame(3,0,0)">一键开启</view>
    </view>
    
    <!-- 提示弹窗 -->
    <u-popup :customStyle="{'width':'90%'}" :show="tipsShow" mode="center" :round="5" @close="tipsShow = false" :closeOnClickOverlay="true">
      <view style="padding: 10px;display: flex;flex-direction: column;justify-content: center">
        <text style="margin-bottom: 5px;color: #f56c6c">提示：</text>
        <text style="line-height: 20px;color: #423f44">取消注单需满足三个条件：</text>
        <text style="line-height: 20px;color: #423f44">①游戏未封盘</text>
        <text style="line-height: 20px;color: #423f44">②游戏设置中开启允许取消注单</text>
        <text style="line-height: 20px;color: #423f44">③打盘报表中设置飞单模式为：距离封盘N秒飞，且游戏倒计时大于N秒</text>
      </view>
    </u-popup>
  </view>
</template>

<script>
export default {
  name: 'GameSettingsComponent',
  mixins: [uni.$mymixin],
  props: {
    // 是否为弹窗模式
    isPopupMode: {
      type: Boolean,
      default: false
    },
    // 返回URL（非弹窗模式使用）
    backUrl: {
      type: String,
      default: 'agent/roomset/roomset'
    }
  },
  data() {
    return {
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
  onLoad(options) {
    // 如果URL中有returnUrl参数，使用它作为返回地址
    if (options && options.returnUrl) {
      this.backUrl = decodeURIComponent(options.returnUrl);
      console.log('🎮 游戏设置组件接收到返回地址:', this.backUrl);
    }
    
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
    //生成列分钟，0-59分
    for(let i=0;i<60;i++){
      if(i < 10){
        this.columns[1].push('0'+i);
      }else{
        this.columns[1].push(i+'');
      }
    }
    this.getGameList();
  },
  mounted() {
    // 在弹窗模式下，onLoad可能不会被调用，所以在mounted中也调用一次
    if (this.isPopupMode) {
      this.getGameList();
    }
  },
  methods: {
    tips(){
      this.tipsShow = true;
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
    showPicker(index,field){
      this.field = field;
      this.currentIndex = index;
      this.show = true;
    },
    confirm(e) {
      this.show = false;
      let h = e.value[0];
      let m = e.value[1];
      this.gameList[this.currentIndex][this.field] = h+':'+m;
    },
    doWwitch(value,item){
      this.switchGame(1,item.gid,value);
    },
    switchGame(type,gid,status){
      this.$u.api.agent.switchGame({type,gid,status}).then(res => {
        if(type == 2 || type == 3){
          this.getGameList();
        }
        this.$u.toast(res.msg);
      });
    },
    getGameList(){
      this.$u.api.agent.getGameSettingList({}).then(res=>{
        this.gameList = res.data.gameList;
      });
    },
    saveGameSetting(){
      uni.showLoading({title: '保存中'});
      this.$u.api.agent.saveGameSetting({gameList:this.gameList}).then(res => {
        uni.hideLoading();
        this.$u.toast(res.msg);
        if (this.isPopupMode) {
          // 弹窗模式下，触发保存成功事件
          this.$emit('saved');
        }
      }).catch(err => {
        uni.hideLoading();
        console.error('保存游戏设置失败:', err);
        this.$u.toast('保存失败，请重试');
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.game-settings-component {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.header-section {
  flex-shrink: 0;
}

.popup-actions {
  padding: 20rpx;
  background: #fff;
  border-bottom: 1px solid #eee;
  
  .save-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    padding: 20rpx;
    background: #0087B4;
    color: #fff;
    border-radius: 12rpx;
    cursor: pointer;
    
    &:hover {
      background: #006699;
    }
    
    text {
      font-size: 28rpx;
    }
  }
}

.content-section {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx;
}

.content {
  padding: 20rpx;
}

.piliang {
  background: #0087B4;
  color: white;
  padding: 10rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  cursor: pointer;
}

.footer {
  display: flex;
  padding: 20rpx;
  gap: 20rpx;
  background: #fff;
  border-top: 1px solid #eee;
  
  .footer-item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    background: #0087B4;
    color: white;
    border-radius: 12rpx;
    cursor: pointer;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.header-refresh-no {
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 20rpx;
  cursor: pointer;
}
</style>
