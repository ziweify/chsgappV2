<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" safe-area-inset-bottom @query="queryList" :show-empty-view-reload="true">
      <template #top>
        <view class="layout-top">
          <TsCustom :backUrl="backUrl" :isBack="true" :title="gname"></TsCustom>
          <view class="list-h">
            <view class="span" style="flex:1;">用户名</view>
            <view class="span" style="flex:1;">余额</view>
            <view class="span" style="flex:1;">下注金额</view>
<!--            <view class="span" style="flex:2;">上期盈亏</view>-->
          </view>
        </view>
      </template>
      <view class="list">
        <view class="list-p" v-for="(item,index) in list" :key="index" @click="goto(item)">
          <view class="list-p-item">
            <view>{{ item.username }}</view>
            <view>{{ item.name }}</view>
          </view>
          <view class="list-p-item">{{ item.kmoney }}</view>
          <view class="list-p-item">{{ item.je }}</view>
<!--          <view class="list-p-item list-p3" style="flex:2;"><view class="tiem">0</view></view>-->
        </view>
      </view>
    </z-paging>
  </view>
</template>

<script>
export default {
  data() {
    return {
      gid: 0,
      list:[],
      gname:"",
      heightReduce:0,
      backUrl:"agent/gamedata/gamedata"
    };
  },
  onShow() {

  },
  onLoad() {
    //初始化websocket
    if(!uni.$socketUtils.isOpenSocket){uni.$socketUtils.initConnection();}
    this.gid = uni.getStorageSync('bd_gid');
    this.gname = uni.getStorageSync('bd_gname');
  },
  methods: {
    goto(item){
      uni.setStorageSync('bd_userid',item.userid);
      //uni.setStorageSync('bd_username',item.username);
      uni.$utils.jump('agent/gamedata/betdataRecord');
    },
    queryList(page, pageSize) {
      this.$u.api.agent.betDataByPeriod({gid:this.gid}).then(res => {
        this.$refs.paging.complete(res.data.list);
      }).catch(res => {
        this.$refs.paging.complete(false);
      })
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
    font-size: 28rpx;
    .list-p-item{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      flex:1;
    }
  }
}
.red {color: #fe0101}
.blue {color: rgb(0, 135, 180)}
</style>
