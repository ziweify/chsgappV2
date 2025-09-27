<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20" :auto="false">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="积分账变">
          <block slot='right'>
            <view @click="showDate()">选择日期</view>
          </block>
        </TsCustom>
        <u-collapse class="sort">
          <u-collapse-item :title="title1">
            <view class="sort1">
              <view v-for="item in gameList" :key="item.gid" class="sort1-item" @click="selectGame(item)">
                <view class="sort1-item-text"><view>{{ item.gname }}</view></view>
                <view class="sort1-item-icon"><u-icon v-show="item.gid == query.gid" color="#0087B4FF" name="checkbox-mark" size="18"></u-icon></view>
              </view>
            </view>
          </u-collapse-item>
        </u-collapse>
        <view style="padding:20rpx 30rpx 0 30rpx;background: #fff;">
          <u-search @clear="search" searchIcon="" @custom="search" :showAction="true" v-model="query.qishu" :clearabled="true" bgColor="#f5f9ff" placeholder="请输入期数" shape="square" @search="search"></u-search>
        </view>
        <view class="section">
          <view class="van-tabs">
            <view v-for="(item,index) in tabsList" :key="index" class="van-tab" :class="item.key == curtabkey ? 'van-tab--active' : ''" @click="selectTab(item)">{{ item.title }}</view>
          </view>
          <view class="p1">{{ query.startDate }} - {{ query.endDate }}</view>
        </view>
        <view class="list-h" style="margin-top: 15rpx;">
          <view class="span" style="flex:1;">类型</view>
          <view class="span" style="flex:1;">备注</view>
          <view class="span" style="flex:1;">时间</view>
          <view class="span" style="flex:1;">积分</view>
        </view>
      </template>
      <view class="list">
        <view v-for="(item,index) in list" :key="index" class="list-p">
          <view class="list-p-item" style="flex:1;">
<!--            <view class="apply-type-color-2">{{ item.username }}</view>-->
            <view class="color-type">{{ typeMap[item.moneyType] }}</view>
          </view>
          <view class="list-p-item" style="flex:1;color: rgb(156, 156, 156);font-size: 26rpx;">
            <block  v-if="item.qishu">
              <view>{{ item.gname }}</view> <view>{{ item.qishu }}期</view>
            </block>
            <block v-else>
              <view>{{ item.bz }}</view>
            </block>
          </view>
          <view class="list-p-item" style="flex:1;color: rgb(156, 156, 156);font-size: 26rpx;">
            <view>{{ item.time1 }}</view> <view>{{ item.time2 }}</view>
          </view>
          <view class="list-p-item" style="flex:1;">
            <view :class="item.operateType == 1 ? 'm-green' : (item.operateType == 2 ? 'm-red' : '')">{{ item.operateType == 1 ? '+' : '-' }}{{ item.money }}</view>
          </view>
        </view>
      </view>
    </z-paging>
    <u-calendar :allowSameDay="true" :closeOnClickOverlay="true" @close="showcalendar = !showcalendar" :minDate="minDate" :maxDate="maxDate" :show="showcalendar" @confirm="dateConfrim" mode="range"></u-calendar>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      list: [],
      backUrl: "pages/wallet/wallet",
      query: {
        gid: '-1',
        startDate: '',
        endDate: '',
        qishu: '',
      },
      title1: '全部游戏',
      gameList: [],
      minDate: '',
      maxDate: '',
      showcalendar: false,
      curtabkey: 'today',
      tabsList: [
        { title: '今日', key: 'today' },
        { title: '昨日', key: 'yesterday' },
        { title: '本周', key: 'week' },
        { title: '上周', key: 'lastWeek' }
      ],
      sdate: [],
      typeMap: {
        1: '下注',
        2: '结算',
        3: '上分',
        4: '下分',
        5: '红包',
        6: '回水',
        7: '撤单',
        8: '返佣'
      },
    };
  },
  onLoad() {
    let backUrl = uni.getStorageSync('backUrl');
    if(backUrl){
      this.backUrl = backUrl;
    }
    // 先获取日期数据，然后再触发查询
    this.initData();
  },
  methods: {
    // 新增初始化数据方法
    initData() {
      this.getGameListByIfok().then(() => {
        // 确保日期数据已获取到后再触发z-paging查询
        this.$nextTick(() => {
          this.$refs.paging.reload();
        });
      });
    },
    selectGame(item) {
      this.query.gid = item.gid;
      this.title1 = item.gname;
      this.$refs.paging.reload();
    },
    dateConfrim(item) {
      this.query.startDate = item[0];
      this.query.endDate = item[item.length - 1];
      this.showcalendar = false;
      this.$refs.paging.reload();
    },
    getGameListByIfok() {
      return new Promise((resolve, reject) => {
        this.$u.api.common.getGameListByIfok({ type: 1, isdates: 1 }).then(res => {
          if (res && res.data) {
            this.gameList = res.data.list || [];
            this.minDate = res.data.minDate || '';
            this.maxDate = res.data.maxDate || '';
            this.query.startDate = res.data.date || '';
            this.query.endDate = res.data.date || '';
            this.sdate = res.data.sdate || [];
            resolve(res.data);
          } else {
            reject(new Error('数据格式错误'));
          }
        }).catch(err => {
          console.error('获取游戏列表失败:', err);
          uni.showToast({
            title: '获取游戏列表失败',
            icon: 'none'
          });
          reject(err);
        });
      });
    },
    showDate() {
      this.showcalendar = !this.showcalendar;
    },
    selectTab(item) {
      this.curtabkey = item.key;
      switch (item.key) {
        case 'today': // 今日
          this.query.startDate = this.sdate[10] || '';
          this.query.endDate = this.sdate[10] || '';
          break;
        case 'yesterday': // 昨日
          this.query.startDate = this.sdate[0] || '';
          this.query.endDate = this.sdate[0] || '';
          break;
        case 'week': // 本周
          this.query.startDate = this.sdate[5] || '';
          this.query.endDate = this.sdate[6] || '';
          break;
        case 'lastWeek': // 上周
          this.query.startDate = this.sdate[7] || '';
          this.query.endDate = this.sdate[8] || '';
          break;
        default:
          break;
      }
      this.$refs.paging.reload();
    },
    search() {
      this.$refs.paging.reload();
    },
    queryList(page, pageSize) {
      // 检查必要的参数是否已设置
      if (!this.query.startDate || !this.query.endDate) {
        this.$refs.paging.complete([]);
        return;
      }
      
      this.query.page = page;
      this.query.pageSize = pageSize;
      
      this.$u.api.member.getMoneyLogList(this.query).then(res => {
        if (res && res.data) {
          this.$refs.paging.complete(res.data.records || []);
        } else {
          this.$refs.paging.complete([]);
        }
      }).catch(err => {
        console.error('获取记录列表失败:', err);
        this.$refs.paging.complete([]);
        uni.showToast({
          title: '获取记录失败',
          icon: 'none'
        });
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.sort {
  background: #fff;
  .sort1 {
    display: flex;
    flex-direction: column;
    .sort1-item {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 30rpx;
      padding: 20rpx 10rpx;
      .sort1-item-text {
        width: 55%;
        text-align: right;
      }
      .sort1-item-icon {
        width: 45%;
        margin-left: 10rpx;
      }
    }
  }
}
.pp {
  font-size: 24rpx;
  padding: 6rpx;
  border-radius: 6rpx;
}
.section {
  padding: 20rpx 0;
  background: #fff;
  .van-tabs {
    display: flex;
    padding: 0 20rpx;
    .van-tab:first-child {
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
.layout {
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
  .span {
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
    .list-p-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}

// 1上分 2下分 3结算 4回水 每个颜色都不一样
.color-type {
  color: rgb(0, 135, 180);
}

// 添加缺失的样式类
.m-green {
  color: #52c41a;
}

.m-red {
  color: #ff4d4f;
}
</style>
