<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="申请管理">
          <block slot='right'>
            <view @click="showDate()">选择日期</view>
          </block>
        </TsCustom>
        <view style="padding: 30rpx;background: #fff;">
          <u-search @custom="search" :showAction="true" v-model="query.username" :clearabled="true" bgColor="#f5f9ff" placeholder="请输入玩家用户名/昵称" shape="square" @search="search"></u-search>
        </view>
        <view class="section">
          <view class="van-tabs">
            <view v-for="(item,index) in tabsList" :key="index" class="van-tab" :class="item.key == query.status ? 'van-tab--active' : ''" @click="selectTab(item)">{{ item.title }}</view>
          </view>
          <view class="p1">{{ query.startDate }} - {{ query.endDate }}</view>
        </view>
        <view class="list-h" style="margin-top: 15rpx;">
              <view class="span" style="flex:1;">类型</view>
              <view class="span" style="flex:1;">用户</view>
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
          <view class="list-p-item" style="flex:1;">
            <view class="apply-type-color-2">{{ item.username }}</view>
            <view>{{ item.name }}</view>
          </view>
          <view class="list-p-item" style="flex:1;color: rgb(156, 156, 156);font-size: 26rpx;">
            <view>{{ item.time1 }}</view> <view>{{ item.time2 }}</view>
          </view>
          <view class="list-p-item" style="flex:1;">{{ item.value }}</view>
          <view class="list-p-item" style="flex:1;">
            <view v-if="item.status == 1" style="">
              <u-button style="margin-top: 6rpx;" @click="actionClicShow(item,3)" class="color-tongguo" text="通过" size="mini" shape="circle"></u-button>
              <u-button style="margin-top: 6rpx;" @click="actionClicShow(item,2)" class="color-jujue" text="拒绝" size="mini" shape="circle"></u-button>
              <u-button style="margin-top: 6rpx;margin-bottom: 6rpx;" @click="actionClicShow(item,4)" class="color-hulue" text="忽略" size="mini" shape="circle"></u-button>
            </view>
            <view v-else>
              <text class="pp" :class="item.status == 5 ? 't-jiaoyizhong' : item.status == 3 ? 't-tongguo' : item.status == 2 ? 't-jujue' : 't-hulue'">{{ item.status == 1 ? '待审核' : item.status == 5 ? '交易中' : item.status == 3 ? '通过' : item.status == 2 ? '拒绝' : '忽略' }}</text>
            </view>
          </view>
        </view>
      </view>
    </z-paging>
    <u-calendar :allowSameDay="true" :closeOnClickOverlay="true" @close="showcalendar = !showcalendar" :minDate="minDate" :show="showcalendar" @confirm="dateConfrim" mode="range"></u-calendar>
    <u-modal confirm-text="确定" :show="showDialog" @confirm="doApply" @cancel="showDialog = !showDialog" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">{{dialogTitle}}</view>
    </u-modal>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      list:[],
      backUrl:"agent/manage/center",
      query:{
        username:'',
        status:'-1',
        startDate:'',
        endDate:'',
        qtype:1,
      },
      minDate:'',
      maxDate:'',
      showcalendar:false,
      showDialog:false,
      citem:[],
      cstatus:0,
      tabsList:[{title:'全部',key:'-1'},{title:'待审核',key:'1'},{title:'交易中',key:'5'},{title:'通过',key:'3'},{title:'拒绝',key:'2'},{title:'忽略',key:'4'}],
      dialogTitle:'',
    };
  },
  onLoad() {
    this.getOtherConfig();
    //初始化当期日期
    this.query.startDate = uni.$u.timeFormat(new Date(), 'yyyy-mm-dd');
    this.query.endDate = uni.$u.timeFormat(new Date(), 'yyyy-mm-dd');
  },
  methods: {
    doApply(){
      //显示加载
      uni.showLoading({title: '加载中'});
      let params = {};
      params.id = this.citem.id;
      params.status = this.cstatus;
      this.$u.api.agent.doApply(params).then(res => {
        uni.hideLoading();
        this.$u.toast('操作成功');
        this.showDialog = false;
        this.$refs.paging.reload();
      });
    },
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
      this.query.status = item.key;
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
      this.$u.api.agent.getApplyList(this.query).then(res => {
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
      padding: 20rpx 20rpx;
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
