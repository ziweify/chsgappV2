<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="未结报表"></TsCustom>
        
        <!-- 游戏选择和刷新频率选择 -->
        <view class="filter-section">
          <view class="filter-row">
            <!-- 游戏选择 -->
            <select v-model="query.gid" class="custom-select" @change="handleGameChange">
              <option v-for="(item, index) in gameList" :key="index" :value="item.gid">{{item.gname}}</option>
            </select>

            <!-- 刷新频率选择 -->
            <select v-model="reflash" class="custom-select" @change="handleReflashChange">
              <option v-for="(item, index) in reflashList" :key="index" :value="item.key">{{item.title}}</option>
            </select>
          </view>
        </view>
        <view style="padding: 30rpx 30rpx 15rpx 30rpx;background: #fff;">
          <u-search @custom="search" @clear="search" searchIcon="" :showAction="true" v-model="query.username" :clearabled="true" bgColor="#f5f9ff" placeholder="请输入玩家用户名/昵称" shape="square"></u-search>
        </view>
        <view class="section">
          <view class="ykdata">
            <view class="ykdata-item">
              <view class="ykdata-title">总积分</view>
            </view>
            <view class="ykdata-item" style="margin-top:8rpx;">
              <view class="ykdata-value color-type">{{ totalMoney }}</view>
            </view>
          </view>
        </view>
        <view class="list-h" style="margin-top: 15rpx;">
          <view class="span" style="flex:1;">用户</view>
          <view class="span" style="flex:1;">游戏</view>
          <view class="span" style="flex:1;">玩法</view>
          <view class="span" style="flex:1;">积分</view>
        </view>
      </template>
      <view class="list">
        <view v-for="(item,index) in list" :key="index" class="list-p">
          <view class="list-p-item" style="flex:1;">
            <view class="apply-type-color-2">{{ item.username }}</view>
            <view class="color-type">{{ item.name }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.gname }}</view> <view class="color-type">{{ item.qishu }}</view>
          </view>
          <view class="list-p-item" style="flex:1;font-size: 26rpx;">
            <view>{{ item.sname }}</view> <view class="color-type">{{ item.pname }}</view>
          </view>
          <view class="list-p-item" style="flex:1;">
            <view class="color-type">{{ item.je }}</view>
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
      totalMoney:{},
      backUrl:"agent/manage/report/repManage",
      query:{
        username:'',
        gid:'-1',
      },
      reflash:0,
      gameList:[],
      sortList:[{title:'默认排序',key:'-1'},{title:'输赢降序',key:'1'},{title:'输赢升序',key:'2'},{title:'流水降序',key:'3'},{title:'流水升序',key:'4'}],
      reflashList:[{title:'手动',key:0},{title:'10秒',key:10}, {title:'20秒',key:20}, {title:'30秒',key:30}],
      timer:null,
    };
  },
  onLoad() {
    this.getGameListByIfok();
  },
  methods: {
    timerReflash(){
      this.timer = setInterval(() => {
        this.$refs.paging.reload();
      }, this.reflash * 1000);
    },
    /**
     * 处理游戏选择变化
     */
    handleGameChange(){
      this.$refs.paging.reload();
    },

    /**
     * 处理刷新频率选择变化
     */
    handleReflashChange(){
      if(this.timer){
        clearInterval(this.timer);
      }
      if(this.reflash != 0){
        this.timerReflash();
      }
    },
    getGameListByIfok(){
      this.$u.api.common.getGameListByIfok({type:1}).then(res => {
        this.gameList = res.data.list;
      });
    },
    search(){
      this.$refs.paging.reload();
    },
    queryList(page, pageSize) {
      this.query.page = page;
      this.query.pageSize = pageSize;
      this.$u.api.agent.getReportWjs(this.query).then(res => {
        this.totalMoney = res.data.totalMoney;
        this.$refs.paging.complete(res.data.records);
      });
    },
  }

}
</script>

<style lang="scss" scoped>
/* 筛选区域样式 */
.filter-section {
  background: #fff;
  padding: 15rpx 30rpx;
  
  .filter-row {
    display: flex;
    gap: 15rpx;
    align-items: center;
  }
}

/* 自定义下拉选择样式 */
.custom-select {
  flex: 1;
  padding: 12rpx 16rpx;
  background-color: #f5f9ff;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  color: #333;
  font-size: 26rpx;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04ODQuMTI4IDM0NC4wNjRsLTMzNC4wOCAzMzQuMDk2YTMyIDMyIDAgMCAxLTQ1LjI0OCAwbC0zMzQuMDk2LTMzNC4wOTZhMzIgMzIgMCAwIDEgNDUuMjQ4LTQ1LjI0OEw1MTIgNjAyLjI0bDMwNi4xNzYtMzAzLjQyNGEzMiAzMiAwIDEgMSA0NS4yNTYgNDUuMjQ4eiIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==");
  background-repeat: no-repeat;
  background-position: right 16rpx center;
  background-size: 18rpx;
  padding-right: 48rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56rpx;
  box-sizing: border-box;
}

.custom-select:focus {
  border-color: #0087B4;
  background-color: #fff;
  box-shadow: 0 0 0 4rpx rgba(0, 135, 180, 0.1);
}

.custom-select:hover {
  border-color: #0087B4;
  background-color: #fff;
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
