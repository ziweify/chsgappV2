<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="两周报表" class="t-head-m1">
          <block slot='right'>
            <view @click="isShowGamePanel = !isShowGamePanel" class="header-refresh-no">
              <text>{{ curItem.gname }}</text>
              <u-icon style="margin-left: 8rpx;" size="16" color="#fff" :name="isShowGamePanel ? 'arrow-up' : 'arrow-down'"></u-icon>
            </view>
          </block>
        </TsCustom>
        <view class="section">
          <view class="van-tabs">
            <view v-for="(item,index) in tabsList" :key="index" class="van-tab" :class="item.key == query.type ? 'van-tab--active' : ''" @click="selectTab(item)">{{ item.title }}</view>
          </view>
        </view>
        <view class="list-h" style="margin-top: 15rpx;">
          <view class="span" style="flex:1;">日期</view>
          <view class="span" style="flex:1;">注数</view>
          <view class="span" style="flex:1;">投注金额</view>
          <view class="span" style="flex:1;">有效金额</view>
          <view class="span" style="flex:1;">盈亏</view>
        </view>
      </template>
      <view class="list">
        <view v-for="(item,index) in list" :key="index" class="list-p" :class="{'disabled-row': parseInt(item.count) === 0}" @click="goto(item)">
          <view class="list-p-item" style="flex:1;">
            <view class="apply-type-color-2">{{ item.date }}</view>
            <view class="color-type">星期{{ item.week }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.count }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.bet_amount }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.valid_amount }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view :class="item.win_amount > 0 ? 'm-green' : (item.win_amount < 0 ? 'm-red' : '')">{{ item.win_amount }}</view>
          </view>
        </view>
      </view>
      
      <!-- 添加合计行 -->
      <view class="total-row" v-if="list.length > 0">
        <view class="total-item" style="flex:1;">
          <view class="total-label">合计</view>
        </view>
        <view class="total-item" style="flex:1;">
          <view class="total-value">{{ totalCount }}</view>
        </view>
        <view class="total-item" style="flex:1;">
          <view class="total-value">{{ totalBetAmount }}</view>
        </view>
        <view class="total-item" style="flex:1;">
          <view class="total-value">{{ totalValidAmount }}</view>
        </view>
        <view class="total-item" style="flex:1;">
          <view class="total-value" :class="totalWinAmount > 0 ? 'm-green' : (totalWinAmount < 0 ? 'm-red' : '')">{{ totalWinAmount }}</view>
        </view>
      </view>
    </z-paging>
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
      list:[],
      backUrl:"pages/wallet/wallet",
      query:{
        gid:'-1',
        type:1,
      },
      isShowGamePanel:false,
      top:0,
      curItem:{},
      gameList:[],
      tabsList:[{title:'本周',key:1},{title:'上周',key:2}],
    };
  },
  computed: {
    // 计算总笔数
    totalCount() {
      return this.list.reduce((sum, item) => sum + (parseInt(item.count) || 0), 0);
    },
    // 计算总投注金额
    totalBetAmount() {
      return this.list.reduce((sum, item) => sum + (parseFloat(item.bet_amount) || 0), 0).toFixed(2);
    },
    // 计算总有效金额
    totalValidAmount() {
      return this.list.reduce((sum, item) => sum + (parseFloat(item.valid_amount) || 0), 0).toFixed(2);
    },
    // 计算总盈亏
    totalWinAmount() {
      return this.list.reduce((sum, item) => sum + (parseFloat(item.win_amount) || 0), 0).toFixed(2);
    }
  },
  onReady() {
    this.$u.getRect('.t-head-m1').then(res => {
      this.top = res.height;
    })
  },
  onLoad() {
    let backUrl = uni.getStorageSync('backUrl');
    if(backUrl){
      this.backUrl = backUrl;
    }
    this.getGameListByIfok();
  },
  methods: {
    goto(item){
      // 如果笔数为0，则不能点击进入
      if (parseInt(item.count) === 0) {
        uni.showToast({
          title: '该日期无投注记录',
          icon: 'none'
        });
        return;
      }
      
      let url = 'pages/wallet/betrecord?date=' + item.date + '&gid=' + this.query.gid;
      uni.$utils.jump(url);
    },
    selectGid(item){
      this.isShowGamePanel = false;
      this.curItem = item;
      this.query.gid = item.gid;
      this.$refs.paging.reload();
    },
    getGameListByIfok(){
      this.$u.api.common.getGameListByIfok({type:1}).then(res => {
        this.gameList = res.data.list;
        this.curItem = this.gameList[0];
        this.query.gid = this.curItem.gid;
      });
    },
    selectTab(item){
      this.query.type = item.key;
      this.$refs.paging.reload();
    },
    queryList(page, pageSize) {
      this.query.page = page;
      this.query.pageSize = pageSize;
      this.$u.api.member.getReport(this.query).then(res => {
        this.$refs.paging.complete(res.data);
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
.pp{
  font-size: 24rpx;
  padding: 6rpx;
  border-radius: 6rpx;
}
.section{
  padding: 20rpx 0;
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
  font-size: 26rpx;
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
    font-size: 24rpx;
    padding: 10rpx 0;
    .list-p-item{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    // 禁用行样式
    &.disabled-row {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: #f9f9f9;
      
      .list-p-item {
        color: #999;
      }
    }
  }
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
//1上分 2下分 3结算 4回水 每个颜色都不一样
.color-type{color:rgb(0, 135, 180)};

.total-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 2rpx solid #0087b4;
  background-color: #f8f9fa;
  height: 100rpx;
  color: #000000;
  font-size: 26rpx;
  font-weight: 600;
  margin-top: 20rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  
  .total-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-width: 120rpx;
    
    .total-label {
      font-size: 24rpx;
      color: #0087b4;
      font-weight: 600;
      line-height: 1.2;
    }
    
    .total-value {
      font-size: 24rpx;
      font-weight: 600;
      color: #333;
      line-height: 1.2;
    }
  }
}
</style>
