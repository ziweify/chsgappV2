<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="下注记录" class="t-head-m1">
          <block slot='right'>
            <view @click="isShowGamePanel = !isShowGamePanel" class="header-refresh-no">
              <text>{{ curItem.gname }}</text>
              <u-icon style="margin-left: 8rpx;" size="16" color="#fff" :name="isShowGamePanel ? 'arrow-up' : 'arrow-down'"></u-icon>
            </view>
          </block>
        </TsCustom>
        <view class="section">
          <view class="p1"><text style="margin-right: 40rpx;" class="color-type">账号：{{username}}</text> <text class="color-type">昵称：{{name}}</text></view>
          <view class="p1">日期：{{ query.startDate }} - {{ query.endDate }}</view>
        </view>
        <view class="list-h" style="margin-top: 15rpx;">
          <view class="span" style="flex:1;">游戏</view>
          <view class="span" style="flex:1;">玩法</view>
          <view class="span" style="flex:1;">时间</view>
          <view class="span" style="flex:1;">输赢</view>
        </view>
      </template>
      <view class="list">
        <view v-for="(item,index) in list" :key="index" class="list-p">
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view class="apply-type-color-2">{{ item.gname }}</view>
            <view class="color-type">{{ item.qishu }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.sname }}</view> <view class="color-type">{{ item.pname }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.time1 }}</view> <view>{{ item.time2 }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view :class="item.yk > 0 ? 'm-green' : (item.yk < 0 ? 'm-red' : '')">{{ item.yk > 0 ? '+' : '' }}{{ item.yk }}</view>
          </view>
        </view>
      </view>
    </z-paging>
    <u-overlay :show="isShowGamePanel" @click="isShowGamePanel = false" :style="{'top':top+'px'}">
      <u-transition @click.prevent :show="isShowGamePanel" :customStyle="{'position':'fixed','width':'100%'}" mode="fade">
        <view style="border-top: 1px solid #eee;">
          <view class="lottery">
            <view class="lotteryItem">
              <view class="lotteryI" v-for="(item,index) in gameList" :key="index">
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
      list:[],
      backUrl:"agent/manage/report/reportUser",//agent/manage/report/reportUser
      query:{
        gid:'-1',
        startDate:'',
        endDate:'',
        qishu:'',
        userid:'',
      },
      username:'',
      name:'',
      isShowGamePanel:false,
      curItem:{},
      top:0,
      gameList:[]
    };
  },
  onReady() {
    this.$u.getRect('.t-head-m1').then(res => {
      this.top = res.height;
    })
  },
  onLoad(option) {
    this.query.gid = option.gid;
    this.query.startDate = option.startDate;
    this.query.endDate = option.endDate;
    this.query.qishu = option.qishu;
    this.query.userid = option.userid;
    this.username = option.username;
    this.name = option.name;
    this.getGameListByIfok();
  },
  methods: {
    selectGid(item){
      this.isShowGamePanel = false;
      this.curItem = item;
      this.query.gid = item.gid;
      this.$refs.paging.reload();
    },
    getGameListByIfok(){
      this.$u.api.common.getGameListByIfok({type:1}).then(res => {
        this.gameList = res.data.list;
        for (let i = 0; i < this.gameList.length; i++) {
          if (this.gameList[i].gid == this.query.gid) {
            this.curItem = this.gameList[i];
            break;
          }
        }
      });
    },
    queryList(page, pageSize) {
      this.query.page = page;
      this.query.pageSize = pageSize;
      this.$u.api.agent.getBetrecordByUser(this.query).then(res => {
        this.$refs.paging.complete(res.data.list);
      });
    },
  }

}
</script>

<style lang="scss" scoped>
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
.section{
  padding: 0 0 20rpx 0;
  background: #fff;
  .van-tabs{
    display: flex;
    padding: 0 20rpx;
    .van-tab:first-child{
      border-radius: 20rpx 0 0 20rpx;
      border-left: 2rpx solid rgb(0, 135, 180);
    }
    .van-tab:last-child {
      border-radius: 0 20rpx 20rpx 0;
    }
    .van-tab {
      border-right: 2rpx solid rgb(0, 135, 180);
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 15rpx 20rpx;
      font-size: 28rpx;
      color: rgb(0, 135, 180);
      border-top: 2rpx solid rgb(0, 135, 180);
      border-bottom: 2rpx solid rgb(0, 135, 180);
    }
    .van-tab--active {
      color: #fff;
      font-weight: 500;
      background-color: rgb(0, 135, 180);
    }
  }
  .p1 {
    margin-top: 20rpx;
    width: 100%;
    height: 60rpx;
    background: #f5f9ff;
    font-size: 28rpx;
    text-align: center;
    font-weight: 400;
    color: #79828d;
    line-height: 60rpx;
  }
  .ykdata{
    margin: 15rpx 15rpx 0 15rpx;
    .ykdata-item{
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      .ykdata-title{
        flex: 1;
        text-align: center;
        font-size: 28rpx;
        color: #79828d;
      }
      .ykdata-value{
        flex: 1;
        text-align: center;
        font-size: 28rpx;
        color: #79828d;
      }
    }
  }
}
.layout{
  height: 100%;
  width: 100%;
  background-color: #f1f1f1;
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
  .list-p {
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 2rpx solid #eee;
    background-color: #fff;
    color: #5e5e5e;
    font-size: 28rpx;
    padding: 10rpx 0;
    .list-p-item{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}

//1上分 2下分 3结算 4回水 每个颜色都不一样
.color-type{color:rgb(0, 135, 180)};
</style>
