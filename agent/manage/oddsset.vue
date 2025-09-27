<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="赔率设置" class="t-head-m1">
        <block slot='right'>
          <view @click="isShowGamePanel = !isShowGamePanel" class="header-refresh-no">
            <text>{{ curItem.gname }}</text>
            <u-icon style="margin-left: 8rpx;" size="16" color="#fff" :name="isShowGamePanel ? 'arrow-up' : 'arrow-down'"></u-icon>
          </view>
        </block>
      </TsCustom>
      <view class="flex-content">
        <u-collapse>
          <u-collapse-item :is-link="true" v-for="(item,index) in list" :title="item.name">
            <view class="content">
              <u--form labelWidth="140" labelPosition="left" ref="uForm">
                <u-form-item label="赔率：" prop="userInfo.name" borderBottom>
                  <u--input v-model="item.odds" border="none"></u--input>
                </u-form-item>
                <u-form-item label="个人单注最低限额：" prop="userInfo.name" borderBottom>
                  <u--input v-model="item.minBetAmount" border="none"></u--input>
                  <view @click="doBetch('minBetAmount',index)" class="piliang">批量</view>
                </u-form-item>
                <u-form-item label="个人单注最高限额：" prop="userInfo.name" borderBottom>
                  <u--input v-model="item.maxBetAmount" border="none"></u--input>
                  <view @click="doBetch('maxBetAmount',index)" class="piliang">批量</view>
                </u-form-item>
                <u-form-item label="个人单期最高限额：" prop="userInfo.name" borderBottom>
                  <u--input v-model="item.maxUserPeriodAmount" border="none"></u--input>
                  <view @click="doBetch('maxUserPeriodAmount',index)" class="piliang">批量</view>
                </u-form-item>
                <u-form-item label="单期总限额：" prop="userInfo.name" borderBottom>
                  <u--input v-model="item.maxPeriodAmount" border="none"></u--input>
                  <view @click="doBetch('maxPeriodAmount',index)" class="piliang">批量</view>
                </u-form-item>
                <view style="font-size: 24rpx;padding:20rpx 0;color: #8f8d8e">
                  注意：赔率可设置为0，为0无法下注该玩法。
                </view>
              </u--form>
            </view>
          </u-collapse-item>
        </u-collapse>
      </view>
      <view class="footer">
        <view class="footer-item" @click="synOddsset()"  style="background: linear-gradient(270deg, rgb(106, 116, 117), #a2b6bd);">同步同类游戏</view>
        <view class="footer-item" @click="saveOddsSetting()">保存设置</view>
      </view>
    </view>
    <u-overlay :show="isShowGamePanel" @click="isShowGamePanel = false" :style="{'top':top+'px'}">
      <u-transition @click.prevent :show="isShowGamePanel" :customStyle="{'position':'fixed','width':'100%'}" mode="fade">
        <view style="border-top: 1px solid #eee;">
          <view class="lottery">
            <view class="lotteryItem">
              <view class="lotteryI" v-for="item in gameList">
                <view @click.stop="selectGid(item)" class="span1" :class="{'active':item.gid == curItem.gid}">{{ item.gname }}</view>
              </view>
            </view>
          </view>
        </view>
      </u-transition>
    </u-overlay>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl: 'agent/manage/center',
      gameList: [],
      field:'',
      isShowGamePanel:false,
      top:0,
      curItem:{},
      list:[],
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
    selectGid(item){
      this.isShowGamePanel = false;
      this.curItem = item;
      this.getOddsSet();
    },
    getGameListAll(){
      this.$u.api.agent.getGameListAll({}).then(res => {
        this.gameList = res.data.list;
        this.curItem = this.gameList[0];
        this.getOddsSet();
      });
    },
    saveOddsSetting(){
      uni.showLoading({title: '加载中'});
      let params = {};
      params.odds = this.list;
      params.gid = this.curItem.gid;
      this.$u.api.agent.saveOddsSet(params).then(res => {
        uni.hideLoading();
        this.$u.toast(res.msg);
      });
    },
    synOddsset(){
      uni.showLoading({title: '加载中'});
      this.$u.api.agent.synOddsSet({gid:this.curItem.gid}).then(res => {
        uni.hideLoading();
        this.$u.toast(res.msg);
      });
    },
    doBetch(field,index){
      //循环批量设置
      for(let i=0;i<this.list.length;i++){
        if(i === index){
          continue;
        }
        this.list[i][field] = this.list[index][field];
      }
      this.$u.toast("已批量修改");
    },
    clearStartTime(index){
      this.gameList[index].autoStartTime = '';
    },
    clearEndTime(index){
      this.gameList[index].autoEndTime = '';
    },
    doWwitch(value,item){
      this.switchGame(1,item.gid,value);
    },
    getOddsSet(gid){
      this.$u.api.agent.getOddsSet({gid:this.curItem.gid}).then(res => {
        this.list = res.data;
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
    padding: 20rpx 40rpx;
    text-align: center;
    font-size: 28rpx;
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
  height: 100%;
  justify-content: flex-end;
  margin-right: 20rpx;
}

.lottery {
  max-height: 80%;
  background-color: #fff;
  padding-bottom: 8px;
  .lotteryItem {
    display: flex;
    justify-content: flex-start;
    text-align: center;
    flex-wrap: wrap;
    .lotteryI {
      width: 33.3%;
      padding: 8px 8px 0 8px;
      box-sizing: border-box;
      .span1 {
        padding: 10px 5px;
        border-radius: 54px;
        background-color: #f4f4f4;
      }
    }
    .lotteryI .span1.active {
      color: #fff;
      background: #0087b4;
    }
  }
}
</style>
