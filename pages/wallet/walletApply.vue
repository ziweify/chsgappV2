<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="申请记录">
<!--          <block slot='right'>
            <view @click="showDate()">选择日期</view>
          </block>-->
        </TsCustom>
        <view class="section">
          <view class="van-tabs">
            <view v-for="(item,index) in tabsList" :key="index" class="van-tab" :class="item.key == ckey ? 'van-tab--active' : ''" @click="selectTab(item)">{{ item.title }}</view>
          </view>
          <view class="p1">{{ query.startDate }} - {{ query.endDate }}</view>
        </view>
        <view class="list-h" style="margin-top: 15rpx;">
              <view class="span" style="flex:1;">类型</view>
              <view class="span" style="flex:1;">时间</view>
              <view class="span" style="flex:1;">积分</view>
              <view class="span" style="flex:1;">状态</view>
            </view>
      </template>
      <view class="list">
        <view v-for="(item,index) in list" :key="index" class="list-p">
          <view class="list-p-item" style="flex:1;">
            <text :class="item.applyType == 2 ? 'apply-type-color-2' : 'apply-type-color-3'">{{ item.applyType == 2 ? '上分' : '下分' }}</text>
          </view>
          <view class="list-p-item" style="flex:1;color: rgb(156, 156, 156);font-size: 26rpx;">
            <view>{{ item.time1 }}</view> <view>{{ item.time2 }}</view>
          </view>
          <view class="list-p-item" style="flex:1;">{{ item.value }}</view>
          <view class="list-p-item" style="flex:1;">
              <text class="pp" :class="item.status == 5 ? 't-jiaoyizhong' : item.status == 3 ? 't-tongguo' : item.status == 2 ? 't-jujue' : 't-hulue'">{{ item.status == 1 ? '待审核' : item.status == 5 ? '交易中' : item.status == 3 ? '通过' : item.status == 2 ? '拒绝' : '忽略' }}</text>
          </view>
        </view>
      </view>
    </z-paging>
<!--    <u-calendar :closeOnClickOverlay="true" @close="showcalendar = !showcalendar" :minDate="minDate" :maxDate="maxDate" :show="showcalendar" @confirm="dateConfrim" mode="range"></u-calendar>-->
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
        startDate:'',
        endDate:'',
      },
      minDate:'',
      maxDate:'',
      showcalendar:false,
      citem:[],
      cstatus:0,
      ckey:'today',
      tabsList:[{title:'今天',key:'today'},{title:'昨天',key:'yesterday'}],
    };
  },
  onLoad() {
    this.backUrl = uni.getStorageSync('backUrl');
    this.getOtherConfig();
    //初始化当期日期
    this.query.startDate = uni.$u.timeFormat(new Date(), 'yyyy-mm-dd');
    this.query.endDate = uni.$u.timeFormat(new Date(), 'yyyy-mm-dd');
  },
  methods: {
    dateConfrim(item){
      this.query.startDate = item[0];
      this.query.endDate = item[item.length - 1];
      this.showcalendar = false;
      this.$refs.paging.reload();
    },
    getOtherConfig(){
      this.$u.api.common.getOtherConfig({}).then(res => {
        this.minDate = res.data.minDate;
        this.maxDate = res.data.maxDate;
      });
    },
    showDate(){
      this.showcalendar = !this.showcalendar;
    },
    selectTab(item){
      this.ckey = item.key;
      if(item.key == 'today'){
        this.query.startDate = uni.$u.timeFormat(new Date(), 'yyyy-mm-dd');
        this.query.endDate = uni.$u.timeFormat(new Date(), 'yyyy-mm-dd');
        }else if(item.key == 'yesterday'){
        this.query.startDate = uni.$u.timeFormat(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'yyyy-mm-dd');
        this.query.endDate = uni.$u.timeFormat(new Date(new Date().getTime() - 24 * 60 * 60 * 1000), 'yyyy-mm-dd');
      }
      this.$refs.paging.reload();
    },
    actionClicShow(item,type){
      this.showDialog = true;
      this.dialogTitle = '是否'+(type == 3 ? '通过' : type == 2 ? '拒绝' : '忽略')+item.username+'的'+item.value+(item.applyType == 2 ? '上分' : '下分')+'申请?';
      this.citem = item;
      this.cstatus = type;
    },
    search(){
      this.$refs.paging.reload();
    },
    queryList(page, pageSize) {
      this.query.page = page;
      this.query.pageSize = pageSize;
      this.$u.api.member.getApplyList(this.query).then(res => {
        this.$refs.paging.complete(res.data.records);
      });
    },
  }

}
</script>

<style lang="scss" scoped>
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
      padding: 14rpx 20rpx;
      font-size: 24rpx;
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
    .list-p-item{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}
.color-daishenghe{color: #ff9f4d};
.color-jiaoyizhong{color: #5e5e5e};
.color-tongguo{color: #fff;background-color:#00ab84};
.color-jujue{color: #fff;background-color:#fe0101;};
.color-hulue{color: #fff;background-color:#8e919a;};
.t-jujue{color: #fe0101};
.t-tongguo{color: #00ab84};
.t-hulue{color: #8e919a};
.t-jiaoyizhong{color: rgb(0, 135, 180)};

//申请类型颜色, 2:上分 3:下分 两个分别不同的颜色，不要绿色和红色,和上面颜色不能一样，不能是5e5e5e，fe0101
.apply-type-color-2{color:rgb(0, 135, 180)};
.apply-type-color-3{color:#ff9f4d};
</style>
