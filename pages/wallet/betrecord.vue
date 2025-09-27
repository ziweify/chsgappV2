<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="下注记录"></TsCustom>
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
            <view class="bet-amount">{{ item.je }}</view>
            <view :class="item.yk > 0 ? 'm-green' : (item.yk < 0 ? 'm-red' : '')">{{ item.yk > 0 ? '+' : '' }}{{ item.yk }}</view>
          </view>
        </view>
      </view>
    </z-paging>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      list:[],
      backUrl:"pages/wallet/report",
      query:{
        gid:'-1',
        date:'',
        qishu:'',
      }
    };
  },
  onLoad(option) {
    this.query.date = option.date;
    this.query.gid = option.gid;
  },
  methods: {
    queryList(page, pageSize) {
      this.query.page = page;
      this.query.pageSize = pageSize;
      this.$u.api.member.getBetrecord(this.query).then(res => {
        this.$refs.paging.complete(res.data.list);
      });
    },
  }

}
</script>

<style lang="scss" scoped>
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

// 下注金额样式
.bet-amount {
  font-weight: 600;
  color: #333;
  font-size: 28rpx;
  margin-bottom: 8rpx;
}

// 输赢金额样式增强
.m-green {
  color: #07c160;
  font-weight: 600;
}

.m-red {
  color: #ff4757;
  font-weight: 600;
}
</style>
