<template>
  <view class="layout skin_blue">
    <!-- 这里就很整洁了，只要设置ref，绑定query事件，绑定list就可以了 -->
    <z-paging ref="paging" v-model="list" @query="getResultByDate" :default-page-size="20">
      <!-- 需要固定在顶部不滚动的view放在slot="top"的view中，如果需要跟着滚动，则不要设置slot="top" -->
      <template #top>
        <view class="t-head">
          <view class="t-head-m1">
            <TsCustom :backUrl="backUrl" :isBack="true" title="开奖结果">
              <block slot='right' v-if="siteConfig.kjwurl">
                  <view @click="qgkjw" class="right-icon"><view class="right-btn">全国开奖网</view></view>
              </block>
            </TsCustom>
            <view class="header-wrapper">
              <view class="lotteryName" @click="isShowGamePanel = !isShowGamePanel">
                <view>{{ currentGname }}</view>
                <u-icon color="#999" size="20" name="arrow-down"></u-icon>
              </view>
              <view class="datePicker" @click="datepicker()">
                <view>{{ query.date }}</view>
                <u-icon color="#999" size="25" name="calendar"></u-icon>
              </view>
            </view>
          </view>
          <view class="t-table-header">
            <view class="t-table-header__th">期数/时间</view>
            <view class="t-table-header__th van-tag-box">
              <view v-for="(item,index) in curTabList" :key="index" class="van-tag van-tag--default" @click="sel(index)" :class="{'van-tag--primary':tclass == index}">{{ item }}</view>
            </view>
          </view>
        </view>
      </template>
      <!-- 如果希望其他view跟着页面滚动，可以放在z-paging标签内 -->
      <view class="t-table">
        <view v-for="(item,index) in list" class="t-table-body__tr" :key="index">
          <view class="t-table-body__td period van-hairline--bottom">
            {{ item.period }}<br>
            <view class="time span1">{{ item.shortOpenTime }}</view>
          </view>
          <view class="t-table-body__td detail van-hairline--bottom">
            <view class="sc pk10" v-if="template == 'PK10' && tclass == 0">
              <view class="b span1" :class="'ball-'+it" v-for="it in item.openNum" :key="it"></view>
            </view>
            <view class="sc pk10" v-if="template == 'PK10' && tclass == 1">
              <view v-for="(bx,i) in item.property.bigSmalls" :key="i" :class="gclass(bx,1)" class="n">{{ bx }}</view>
            </view>
            <view class="sc pk10" v-if="template == 'PK10' && tclass == 2">
              <view v-for="(bx,i) in item.property.singleDoubles" :key="i" :class="gclass(bx,2)" class="n">{{ bx }}</view>
            </view>
            <view class="sc pk10" v-if="template == 'PK10' && tclass == 3">
              <view class="n col-red">{{ item.property.sum }}</view>
              <view class="n" :class="gclass(item.property.bigSmall,1)">{{ item.property.bigSmall }}</view>
              <view class="n" :class="gclass(item.property.singleDouble,2)">{{ item.property.singleDouble }}</view>
              <view class="b-20"></view>
              <view class="n" :class="gclass(item.property.dragonTigerNum1,3)">{{ item.property.dragonTigerNum1 }}</view>
              <view class="n" :class="gclass(item.property.dragonTigerNum2,3)">{{ item.property.dragonTigerNum2 }}</view>
              <view class="n" :class="gclass(item.property.dragonTigerNum3,3)">{{ item.property.dragonTigerNum3 }}</view>
              <view class="n" :class="gclass(item.property.dragonTigerNum4,3)">{{ item.property.dragonTigerNum4 }}</view>
              <view class="n" :class="gclass(item.property.dragonTigerNum5,3)">{{ item.property.dragonTigerNum5 }}</view>
            </view>

            <view class="bingo" v-if="template == 'BINGO' && tclass == 0">
              <view class="b span1" :class="'b'+it" v-for="it in item.openNum" :key="it">{{it}}</view>
            </view>
            <view class="bingo pk10" v-if="template == 'BINGO' && tclass == 1">
              <view v-for="(bx,i) in item.property.bigSmalls" :key="i" :class="gclass(bx,1)" class="n">{{ bx }}</view>
            </view>
            <view class="bingo pk10" v-if="template == 'BINGO' && tclass == 2">
              <view v-for="(bx,i) in item.property.singleDoubles" :key="i" :class="gclass(bx,2)" class="n">{{ bx }}</view>
            </view>
            <view class="bingo pk10" v-if="template == 'BINGO' && tclass == 3">
              <view class="n col-red">{{ item.property.sum }}</view>
              <view class="n" :class="gclass(item.property.sumBigSmall,1)">{{ item.property.sumBigSmall }}</view>
              <view class="n" :class="gclass(item.property.sumSingleDouble,2)">{{ item.property.sumSingleDouble }}</view>
              <view class="b-20"></view>
              <view class="n" :class="gclass(item.property.dragonTigerNum,3)">{{ item.property.dragonTigerNum }}</view>
            </view>

            <view class="ssc" v-if="template == 'SSC' && tclass == 0">
              <view class="b" :class="'ball-'+it" v-for="it in item.openNum" :key="it">{{ it }}</view>
            </view>
            <view class="ssc" v-if="template == 'SSC' && tclass == 1">
              <view v-for="(bx,i) in item.property.bigSmalls" :key="i" :class="gclass(bx,1)" class="n">{{ bx }}</view>
            </view>
            <view class="ssc" v-if="template == 'SSC' && tclass == 2">
              <view v-for="(bx,i) in item.property.singleDoubles" :key="i" :class="gclass(bx,2)" class="n">{{ bx }}</view>
            </view>
            <view class="ssc" v-if="template == 'SSC' && tclass == 3">
              <view class="n ng col-red">{{ item.property.sum }}</view>
              <view class="n" :class="gclass(item.property.sumBigSmall,1)">{{ item.property.sumBigSmall }}</view>
              <view class="n" :class="gclass(item.property.sumSingleDouble,2)">{{ item.property.sumSingleDouble }}</view>
              <view class="n" :class="gclass(item.property.dragonTiger,3)">{{ item.property.dragonTiger }}</view>
              <view class="ng" :class="gclass(item.property.topThree,4)">{{ item.property.topThree }}</view>
              <view class="ng" :class="gclass(item.property.middleThree,4)">{{ item.property.middleThree }}</view>
              <view class="ng" :class="gclass(item.property.tailThree,4)">{{ item.property.tailThree }}</view>
            </view>

            <view class="k3" v-if="template == 'K3' && tclass == 0">
              <view class="b" :class="'b'+it" v-for="it in item.openNum" :key="it">{{ it }}</view>
              <view class="n col-red">{{ item.property.sum }}</view>
              <view class="n nb" :class="gclass(item.property.sumBigSmall,1)">{{ item.property.sumBigSmall }}</view>
              <view class="n nb" :class="gclass(item.property.sumSingleDouble,2)">{{ item.property.sumSingleDouble }}</view>
            </view>
            <view class="k3" v-if="template == 'K3' && tclass == 1">
              <view class="n" :class="gclass(item.property.yxx1,5)">{{ item.property.yxx1 }}</view>
              <view class="n" :class="gclass(item.property.yxx2,5)">{{ item.property.yxx2 }}</view>
              <view class="n" :class="gclass(item.property.yxx3,5)">{{ item.property.yxx3 }}</view>
            </view>
          </view>
        </view>
      </view>
    </z-paging>
    <u-calendar :closeOnClickOverlay="true" @close="showcalendar = !showcalendar" :defaultDate="query.date" :minDate="minDate" :maxDate="maxDate" :show="showcalendar" @confirm="change" mode="single"></u-calendar>
    <u-overlay :show="isShowGamePanel" @click="isShowGamePanel = false" :style="{'top':top+'px'}">
      <u-transition @tap.stop :show="isShowGamePanel" :customStyle="{'position':'fixed','width':'100%'}" mode="fade">
        <view style="border-top: 1px solid #eee;">
          <view class="van-dropdown-item__content">
            <view class="lotteryItem">
              <view class="lotteryI" v-for="item in glist" :key="item.gid">
                <view @click.stop="selectGid(item)" class="span1" :class="{'active':item.gid == query.gid}">{{ item.gname }}</view>
              </view>
            </view>
          </view>
        </view>
      </u-transition>
    </u-overlay>
  </view>
</template>
<script>
import {siteConfig} from "../libs/mixin/mixin";

export default {
  data() {
    return {
      tclass: 0,
      showcalendar: false,
      show: false,
      djxlshow: false,
      glist:[],
      currentGid:0,
      currentGname:'',
      top:0,
      tablist:{"PK10":['号码','大小','单双','亚冠/龙虎'],'SSC':['号码','大小','单双','总和/形态'],'K3':['号码','鱼虾蟹'],'BINGO':['号码','大小','单双','总和']},
      template:'PK10',
      curTabList:[],
      query:{gid:0,date:''},
      backUrl:"copage/chat",
      list:[],
      minDate:'',
      maxDate:'',
      isShowGamePanel:false
    };
  },
  onReady() {
    this.$u.getRect('.t-head-m1').then(res => {
      this.top = res.height;
    })
  },
  onLoad(){
    this.backUrl = uni.getStorageSync('backUrl');
    this.query.gid = uni.getStorageSync('cgid');
    this.top1 = uni.$utils.getDivicePx(this,94);
    this.loadGameList(1);
  },
  methods: {
    siteConfig() {
      return siteConfig
    },
    getResultByDate(pageNo, pageSize) {
      // 组件加载时会自动触发此方法，因此默认页面加载时会自动触发，无需手动调用
      // 这里的pageNo和pageSize会自动计算好，直接传给服务器即可
      // 模拟请求服务器获取分页数据，请替换成自己的网络请求
      const param = this.query;
      param.page = pageNo;
      param.pageSize = pageSize || 20; // 确保每页20条数据
      this.$u.api.common.resultByDate(param).then(res => {
        // 将请求的结果数组传递给z-paging
        this.$refs.paging.complete(res.data.records);
      }).catch(res => {
        // 如果请求失败写this.$refs.paging.complete(false);
        // 注意，每次都需要在catch中写这句话很麻烦，z-paging提供了方案可以全局统一处理
        // 在底层的网络请求抛出异常时，写uni.$emit('z-paging-error-emit');即可
        this.$refs.paging.complete(false);
      })
    },
    gclass(name,type = 1) {
      let r = '';
      if(type === 1){//大小
        r = name === '大' ? 'bg-blue' : (name == '通杀' ? 'col-red' : 'bg-orange');
      }else if(type === 2){//单双
        r = name === '单' ? 'bg-blue' : (name == '通杀' ? 'col-red' : 'bg-orange');
      }else if(type == 3){//龙虎和 和bg-green
        r = name === '龙' ? 'bg-blue' : (name == '虎' ? 'bg-orange' :'bg-green');
      }else if(type == 4){//前三中三后三
        if(name == '杂六'){
          r = 'col-gray';
        }else if(name == '半顺'){
          r = 'col-orange';
        }else if(name == '顺子'){
          r = 'col-blue';
        }else if(name == '对子'){
          r = 'col-green';
        }else if(name == '豹子'){
          r = 'col-gray';
        }
      }else if(type == 5){
        if(name == '鱼' || name == '鸡'){
          r = 'col-red';
        }else if(name == '虾' || name == '蟹'){
          r = 'col-green';
        }else if(name == '铜钱' || name == '葫芦'){
          r = 'col-blue';
        }
      }
      return r;
    },
    selectGid(item){
      this.isShowGamePanel = false;
      this.query.gid = item.gid;
      this.currentGname = item.gname;
      this.template = item.template;
      this.djxlshow = false;
      this.tclass = 0;
      this.curTabList = this.tablist[this.template];
      this.$refs.paging.reload(true);

    },
    loadGameList(flag = 0){
      this.$u.api.common.getGameListByIfok().then(res => {
        this.query.date = res.data.date;
        this.minDate = res.data.minDate;
        this.maxDate = res.data.maxDate;
        this.glist = res.data.list;
        if(!this.query.gid){
          this.query.gid = res.data.list[0].gid;
          this.currentGname = res.data.list[0].gname;
          this.template = res.data.list[0].template;
        }else{
          for(let i=0;i<res.data.list.length;i++){
            if(res.data.list[i].gid == this.query.gid){
              this.currentGname = res.data.list[i].gname;
              this.template = res.data.list[i].template;
            }
          }
        }
        this.curTabList = this.tablist[this.template];
        flag == 0 && this.$refs.paging.reload(true);
      }).catch(err => {
        uni.$utils.showToast(err);
      });
    },
    change(e){
      this.showcalendar = !this.showcalendar;
      this.query.date = e[0];
      this.$refs.paging.reload(true);
    },
    sel(index) {
      this.tclass = index;
    },
    datepicker(){
      this.showcalendar = !this.showcalendar;
    },
    qgkjw() {
      //#ifdef H5
      window.open('https://www.www-163kai.vip/')
      //#endif
      //#ifdef APP-PLUS
      plus.runtime.openURL('https://www.www-163kai.vip/')
      //#endif
    },
    showdate() {
      this.show = !this.show
    }
  }
}
</script>

<style lang="scss" scoped>

.layout{
  background-color: #ededed;
  width: 100%;
  height:100%;
  display: flex;
  flex-direction: column;
}
.right-icon{
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
}
.right-icon .right-btn {
  padding: 10.13rpx 20.27rpx;
  border: 2.03rpx solid #fff;
  border-radius: 60.8rpx;
  color: #fff;
  margin-right: 15rpx;
  font-size: 26rpx;
}

.lotteryName {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
  padding: 0 30.4rpx;
  color: #666;
  font-size: 30rpx;
  border-right: 2rpx solid #eee;
}

.header-wrapper {
  width: 100%;
  height: 101rpx;
  display: flex;
  background-color: #fff;
  .datePicker {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    padding: 0 30rpx;
    color: #666;
    font-size: 30rpx;
  }
}

.lotteryItem {
  display: flex;
  justify-content: flex-start;
  text-align: center;
  flex-wrap: wrap;
}

.lotteryItem .lotteryI {
  width: 33.3%;
  padding: 8px 8px 0 8px;
  box-sizing: border-box;
}

.lotteryItem .lotteryI .span1 {
  padding: 10px 5px;
  border-radius: 54px;
  background-color: #f4f4f4;
}

.lotteryItem .lotteryI .span1.active {
  color: #fff;
  background: #0087b4;
}

.van-dropdown-item__content {
  max-height: 80%;
  background-color: #fff;
  padding-bottom: 8px;
}

.t-table-header__th.van-tag-box .van-tag--default {
  background-color: silver;
}

.t-table-header__th.van-tag-box .van-tag {
  padding: 14.186667rpx 18.24rpx;
  border-radius: 8.106667rpx;
  font-size: 28.32rpx;
  font-weight: 400;
  color: #fff;
}

.van-tag--default {
  background-color: #969799;
}

.van-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 0 8.106667rpx;
  color: #fff;
  font-size: 24.32rpx;
  line-height: 32.32rpx;
  border-radius: 4.053333rpx;
}

.t-table-header__th.van-tag-box {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.t-table-header__th {
  flex: 1;
  line-height: 91.2rpx;
  font-size: 32.67rpx;
  color: #666;
}

.t-table-header__th:first-child {
  flex: 0 0 202.67rpx;
  width: 202.67rpx;
}

.t-table-header {
  width: 100%;
  border-bottom: 2rpx solid #ccc;
  padding: 8rpx 0;
  margin-top: 10rpx;
  text-align: center;
}

.t-table-header, .t-table {
  background-color: #fff;
  display: flex;
}

.t-table {
  font-size: 24.32rpx;
  text-align: center;
  overflow: hidden;
  flex: 1;
  flex-direction: column;
}

.t-table-header__th.van-tag-box .van-tag--primary {
  background-color: #0087b4;
  color: #fff;
}

.t-table-body__td.detail {
  flex: 1;
}

.t-table-body__td {
  font-size: 28.32rpx;
  line-height: 40.53rpx;
  padding: 12.16rpx 0;
  color: #333;
}

.time {
  color: #999;
}

.t-table-body__td.period {
  flex: 0 0 202.67rpx;
  width: 202.67rpx;
}

.t-table-body__tr {
  display: flex;
}

.t-table-body__tr [class*=van-hairline]:after{
  border-bottom: 1rpx solid #888;
}

[class*=van-hairline]:after {
  position: absolute;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  content: " ";
  pointer-events: none;
  top: -50%;
  right: -50%;
  bottom: -50%;
  left: -50%;
  border: 0 solid #ebedf0;
  -webkit-transform: scale(.5);
  transform: scale(.5);
}

.van-hairline, .van-hairline--bottom{
  position: relative;
}

.bingo{
  display: flex;
  justify-content: space-around;
  height: 100%;
  align-items: center;
  width: 100%;
  color: #fff;
  .b{
    display: flex;
    width: 60rpx;
    height: 60rpx;
    text-align: center;
    background-size: 100% auto;
    margin-right: 20rpx;
    justify-content: center;
    align-items: center;
    font-size: 26rpx;
    color: #000000;
    font-weight: 550;
  }
  .n {
    height: 48.64rpx;
    width: 48.64rpx;
    line-height: 48.64rpx;
    text-align: center;
    font-size: 28.32rpx;
    margin-right: 4.053333rpx;
    border-radius: 6.08rpx;
    font-weight: 700;
    min-width: 40.53rpx;
    display: inline-block;
  }
  .bg-orange {background-color: #ff9b00;}
  .bg-blue {background-color: #0087fe;}
  .ng {
    display: inline-block;
    height: 40.53rpx;
    font-size: 32.67rpx;
    font-weight: 700;
  }
}

.sc{
  display: flex;
  justify-content: space-around;
  height: 100%;
  align-items: center;
  width: 100%;
  color: #fff;
  .b,.n {
    height: 48.64rpx;
    width: 48.64rpx;
    line-height: 48.64rpx;
    text-align: center;
    font-size: 28.32rpx;
    margin-right: 4.053333rpx;
    border-radius: 6.08rpx;
    font-weight: 700;
    min-width: 40.53rpx;
    display: inline-block;
  }
  .bg-orange {background-color: #ff9b00;}
  .bg-blue {background-color: #0087fe;}
  .ng {
    display: inline-block;
    height: 40.53rpx;
    font-size: 32.67rpx;
    font-weight: 700;
  }
}

.col-orange {
  color: #ff9b00;
}

.col-green {
  color: #00dd34;
}

.col-gray {
  color: #666;
}

.col-blue {
  color: #0087fe;
}

.col-red {color: red;}

.b-20{
  display: inline-block;
  width: 64rpx;
}

.ssc{
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-pack: distribute;
  justify-content: space-around;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  height: 100%;
  width: 100%;
  color: #fff;
  .b{
    width: 60rpx;
    height: 60rpx;
    color: #222;
    border: 6rpx solid;
    text-align: center;
    margin-right: 4rpx;
    font-size: 14px;
    font-weight: 700;
    -webkit-transform: none;
    transform: none;
    border-radius: 50%;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }
  .bn,.n {
    height: 48.64rpx;
    margin-right: 4.053333rpx;
    text-align: center;
    width: 48.64rpx;
    font-size: 14px;
    border-radius: 60.8rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 700;
  }
  .ng{
    display: inline-block;
    height: 40.533333rpx;
    font-size: 32.426667rpx;
    font-weight: 700;
  }
  .bg-orange{background: linear-gradient(#ff9a00, #f60);}
  .bg-blue{background: linear-gradient(#619cff, #0a5eff);}
  .bg-green {background: #00dd34;}
}

.k3{
  display: flex;
  -ms-flex-pack: distribute;
  justify-content: space-around;
  height: 100%;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  .bg-blue{background: linear-gradient(#619cff, #0a5eff);}
  .bg-orange{background: linear-gradient(#ff9a00, #f60);}
  color: #fff;
  .b {
    height: 48.64rpx;
    width: 48.64rpx;
    margin: 2.026667rpx;
    text-align: center;
    line-height: 54.72rpx;
    font-size: 28.373333rpx;
    display: block;
    float: left;
    color: #fff;
    text-indent: -101332.32rpx;
    background-size: 100%;
    background-position: 0 0;
    background-image: url(../static/img/ball_4.png);
  }
  .n {
    height: 48.64rpx;
    line-height: 48.64rpx;
    min-width: 48.64rpx;
    font-size: 32.426667rpx;
    /*margin-right: 40.053333rpx;*/
    text-align: center;
    border-radius: 60.8rpx;
    font-weight: 700;
  }
  .nb{
    min-width: 48.64rpx;
    font-size: 28.373333rpx;
    font-weight: 400;
  }
  .b2 {
    background-position: 0 -48.64rpx;
    color: transparent;
    border-radius: 0 !important;
  }
  .b3{
    background-position: 0 -97.28rpx;
    color: transparent;
    border-radius: 0 !important;
  }
  .b4{
    background-position: 0 -145.92rpx;
    color: transparent;
    border-radius: 0 !important;
  }
  .b5{
    background-position: 0 -193.92rpx;
    color: transparent;
    border-radius: 0 !important;
  }
  .b6{
      background-position: 0 -243.2rpx;
      color: transparent;
      border-radius: 0 !important;
  }
}


</style>

