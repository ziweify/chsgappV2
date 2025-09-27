<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" safe-area-inset-bottom @query="queryList" :show-empty-view-reload="true">
      <template #top>
        <view class="layout-top">
          <TsCustom :backUrl="backUrl" :isBack="true" title="下注详情"></TsCustom>
          <view class="list-h">
            <view class="span" style="flex:1;">位置</view>
            <view class="span" style="flex:1;">投注内容</view>
            <view class="span" style="flex:1;">投注金额</view>
            <view class="span" style="flex:1;">赔率</view>
          </view>
        </view>
      </template>
      <view class="list">
        <view class="list-p" v-for="(item,index) in list" :key="index">
          <view class="list-p-item">{{ item.sname }}</view>
          <view class="list-p-item">{{ item.pname }}</view>
          <view class="list-p-item">{{ item.je }}</view>
          <view class="list-p-item">{{ item.peilv1 }}</view>
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
      userid:"",
      username:"",
      heightReduce:0,
      backUrl:"agent/gamedata/betdata"
    };
  },
  onLoad() {
    //初始化websocket
    if(!uni.$socketUtils.isOpenSocket){uni.$socketUtils.initConnection();}
    this.gid = uni.getStorageSync('bd_gid');
    this.userid = uni.getStorageSync('bd_userid');
    //this.username = uni.getStorageSync('bd_username');
  },
  methods: {
    queryList(page, pageSize) {
      let param = {page:page,pageSize:pageSize};
      param.gid = this.gid;
      param.userid = this.userid;
      this.$u.api.agent.betDataRecord(param).then(res => {
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
