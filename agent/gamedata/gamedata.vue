<template>
  <view class="layout">
    <view class="layout-top">
      <TsCustom :backUrl="backUrl" :isBack="true" title="游戏数据"></TsCustom>
      <view class="list-h">
        <view class="span" style="flex:2;">游戏</view>
        <view class="span" style="flex:1;justify-content: left">流水</view>
        <view class="span" style="flex:1;">今日盈亏</view>
        <view class="span" style="flex:1;">倒计时</view>
      </view>
    </view>
    <view class="list">
      <load-refresh
          ref="loadRefresh"
          :isRefresh="true"
          :fixedHeight="heightReduce"
          refreshType="swappingSquares"
          color="#08bbc2"
          @refresh="refresh">
        <view slot="content-list">
          <view class="list-p" v-for="(item,index) in gamelist" :key="index" @click="goto(item)">
            <view class="list-p-item list-p1">
              <view class="gamename">{{ item.gname }}</view>
              <view>{{ item.period }}期</view>
            </view>
            <view class="list-p-item list-p2">
              <view style="width: 100%;">当期 {{ item.dqls }}</view>
              <view style="width: 100%;">当日 {{ item.jrls }}</view>
            </view>
            <view class="list-p-item list-p3" :class="item.jrsy > 0 ? 'blue' : (item.jrsy < 0 ? 'red' : '')">{{ item.jrsy }}</view>
            <view class="list-p-item list-p3">
              <view class="tiem" v-show="item.fp == 0">{{ item.timearr[0] }}{{ item.timearr[1] }}:{{ item.timearr[2] }}{{ item.timearr[3] }}</view>
              <view class="tiem" v-show="item.fp == 1">--:--</view>
              <view class="fp red" v-show="item.fp == 1">(封盘中)</view>
              <view class="fp red" v-show="item.stopstatus == 1">(未开盘)</view>
            </view>
          </view>
        </view>
      </load-refresh>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isempty: true,
      gamelist:[],
      timer:null,
      heightReduce:0,
      backUrl:"agent/gamehall/hall"
    };
  },
  onShow() {
    if (!this.timer) {
      this.periodListOrSingle();
      this.timer = setInterval(() => {this.timerCheck();}, 1000);
    }
  },
  onReady(){
    let windowHeight = this.$u.sys().windowHeight;
    this.$u.getRect('.layout-top').then(res => {
      this.heightReduce = windowHeight-res.height;
    })
  },
  onLoad() {
    //初始化websocket
    if(!uni.$socketUtils.isOpenSocket){uni.$socketUtils.initConnection();}
    this.periodListOrSingle();
    clearInterval(this.timer);this.timer = null;
    this.timer = setInterval(() => {this.timerCheck();}, 1000);
  },
  onHide() {
    clearInterval(this.timer);this.timer = null;
  },
  beforeDestroy() {
    clearInterval(this.timer);this.timer = null;
  },
  methods: {
    goto(item){
      uni.setStorageSync('bd_gid',item.gid);
      uni.setStorageSync('bd_gname',item.gname);
      uni.$utils.jump('agent/gamedata/betdata');
    },
    refresh(){
      this.periodListOrSingle(0,true);
    },
    periodListOrSingle(gid = 0,force = false) {
      //uni.showLoading({title: '加载中'});
      let that = this;
      this.$u.api.agent.getGameData({gid: gid}).then(res => {
        this.$refs.loadRefresh.completed();
        let gid = parseInt(res.data.gid);
        if (gid && gid > 0) {//
          for (let i = 0; i < that.gamelist.length; i++) {
            if (that.gamelist[i].gid == gid) {
              let cgame = that.gamelist[i];
              let ngame = res.data.list[0];
              that.$set(that.gamelist[i],'stopstatus', ngame.stopstatus);
              if(cgame.period !== ngame.period){
                that.$set(that.gamelist[i],'period', ngame.period);
                that.$set(that.gamelist[i],'djs', ngame.djs);
                that.$set(that.gamelist[i],'fp', ngame.fp);
                that.$set(that.gamelist[i],'nowSaleTime', ngame.nowSaleTime);
                that.$set(that.gamelist[i],'nowSealTime', ngame.nowSealTime);
                that.$set(that.gamelist[i],'nowOpenTime', ngame.nowOpenTime);
              }
              if(cgame.upPeriod !== ngame.upPeriod){
                that.$set(that.gamelist[i],'upPeriod', ngame.upPeriod);
                that.$set(that.gamelist[i],'openNum', ngame.openNum);
              }
              break;
            }
          }
        } else {
          if(that.gamelist.length <= 0 || that.gamelist.length !== res.data.list.length || force){
            that.$set(that, 'gamelist', res.data.list);
            return;
          }
          for (let i = 0; i < that.gamelist.length; i++) {
            let cgame = that.gamelist[i];
            let ngame = res.data.list[i];
            that.$set(that.gamelist[i],'stopstatus', ngame.stopstatus);
            if(cgame.period !== ngame.period){
              that.$set(that.gamelist[i],'period', ngame.period);
              that.$set(that.gamelist[i],'djs', ngame.djs);
              that.$set(that.gamelist[i],'fp', ngame.fp);
              that.$set(that.gamelist[i],'nowSaleTime', ngame.nowSaleTime);
              that.$set(that.gamelist[i],'nowSealTime', ngame.nowSealTime);
              that.$set(that.gamelist[i],'nowOpenTime', ngame.nowOpenTime);
            }
            if(cgame.upPeriod !== ngame.upPeriod){
              that.$set(that.gamelist[i],'upPeriod', ngame.upPeriod);
              that.$set(that.gamelist[i],'openNum', ngame.openNum);
            }
          }
        }
      }).catch(res => {
        this.$refs.loadRefresh.completed();
      })
    },
    timerCheck() {
      for (let i = 0; i < this.gamelist.length; i++) {
        let item = this.gamelist[i];
        if (item.stopstatus == 1 || item.ifok == 0) {
          continue;
        }
        this.gamelist[i].djs -= 1;
        let fptime = item.djs;
        if (fptime >= 0) {
          let minutes = Math.floor(fptime / 60);
          let seconds = fptime % 60;
          let timearr = [];
          if (minutes < 10) {
            timearr[0] = 0;
            timearr[1] = minutes;
          } else {
            timearr[0] = minutes.toString().split("")[0];
            timearr[1] = minutes.toString().split("")[1];
          }
          if (seconds < 10) {
            timearr[2] = 0;
            timearr[3] = seconds;
          } else {
            timearr[2] = seconds.toString().split("")[0];
            timearr[3] = seconds.toString().split("")[1];
          }
          this.gamelist[i].fp = 0;
          this.gamelist[i].timearr = timearr;
        } else if (fptime < 0 && Math.abs(fptime) <= (item.nowOpenTime-item.nowSealTime)) {
          this.gamelist[i].fp = 1;
        } else{
          this.periodListOrSingle(item.gid);
        }
      }
    },
  }

}
</script>

<style lang="scss" scoped>
.layout{
  height: 100%;
  width: 100%;
  background-color: #f1f1f1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.list-h {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 2rpx solid #eee;
  background-color: #fff;
  height: 100rpx;
  font-weight: 400;
  color: #000000;
  font-size: 30rpx;
  .span{
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.list {
  background: #fff;
  flex: 1;
  overflow-y: scroll;
  .list-p:active{
    background-color: #eee;
  }
  .list-p {
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 2rpx solid #eee;
    background-color: #fff;
    height: 100rpx;
    color: #5e5e5e;
    font-size: 26rpx;
    .fp{
      font-size: 24rpx;
    }
    .list-p1{
      color: rgb(0, 135, 180);
      flex: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .list-p2{
      flex:1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      color: rgb(141, 141, 141);
    }
    .list-p3{
      flex:1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}
.red {color: #fe0101}
.blue {color: rgb(0, 135, 180)}
</style>
