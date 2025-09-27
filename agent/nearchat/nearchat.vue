<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="最近聊天"></TsCustom>
        <view class="mrg-search">
          <view class="mrg-search-item">
            <u-search @search="search" v-model="username" shape="square" :showAction="false" placeholder="请输入用户名" :clearabled="true"></u-search>
            <u-button @click="search" style="width: 50px;height: 64rpx;" :ripple="true" size="mini" text="搜索"></u-button>
          </view>
          <u-subsection mode="subsection" activeColor="#0087b4" :list="tabList" :current="current" @change="change" :animation="false"></u-subsection>
        </view>
      </template>
      <view v-for="(item,index) in list" :key="index">
        <view class="Personal-home">
          <view class="Personal-content">
            <view class="online" @click="gotoChat(item)">
              <view :class="item.online === 1 ? 'online-zaixian' : 'online-lixian'" class="online-icon"></view>
            </view>
            <view class="Personal-info" @click="gotoChat(item)">
              <view class="Personal-conten-dataimg" style="position: relative;">
<!--                <image :src="item.avatar"></image>-->
                <u-image v-if="item.avatar" :showLoading="true" :src="toImageUrl(item.avatar)" mode="aspectFill" width="50" height="50">
                  <template v-slot:loading>
                    <u-loading-icon color="#0087b4"></u-loading-icon>
                  </template>
                </u-image>
                <view v-if="item.unreadCount > 0" class="unreadmsg">{{ item.unreadCount <= 99 ? item.unreadCount : 99 }}</view>
              </view>
              <view class="Personal-conten-datatitle">
                <view class="Personal-conten-datatitle-1">{{ item.name }}</view>
                <view class="Personal-conten-datatitle-1">账号：{{ item.username }}</view>
                <view class="Personal-conten-datatitle-1" style="margin-top: 10rpx;">余额：{{ item.kmoney }}</view>
              </view>
            </view>
            <view class="Personal-delete" @click="deleteShowAction(item)">
              <view class="close"><u-icon size="11" color="#fff" name="close"></u-icon></view>
            </view>
          </view>
        </view>
      </view>
    </z-paging>
    <u-modal confirm-text="确定" :show="isDeleteShow" @confirm="doDelete" @cancel="isDeleteShow = !isDeleteShow" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">删除后会清空与该会员的聊天记录，确认要删除该会员{{ curUser && curUser.username }}的聊天吗？（同时删除聊天记录）</view>
    </u-modal>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      tabList:['在线排序','最近排序','积分排序'],
      current:1,
      list:[],
      username:'',
      isDeleteShow:false,
      curUser:null,
      headImageDomain:'',
      backUrl:'agent/gamehall/hall'
    };
  },
  onLoad() {
    this.headImageDomain = uni.getStorageSync('headImageDomain');
  },
  methods: {
    search(){
      if(!this.username){
        this.$u.toast('请输入用户名');
        return;
      }
      this.$refs.paging.reload();
    },
    toImageUrl(url){
      return this.headImageDomain+url;
    },
    gotoChat(item){
      uni.setStorageSync("chatName",item.username);
      uni.setStorageSync("chatUserid",item.userid);
      uni.setStorageSync("backUrl","agent/nearchat/nearchat");
      uni.$utils.jump("copage/custChat");
    },
    deleteShowAction(item){
      this.isDeleteShow = true;
      this.curUser = item;
    },
    doDelete(item){
      this.isDeleteShow = false;
      this.$u.api.agent.deleteRecentChat({userid:this.curUser.userid}).then(res => {
        this.$u.toast(res.msg);
        this.$refs.paging.reload();
      }).catch(res => {
        this.$u.toast(res.msg);
      })
    },
    getSortName(){
      if(this.current === 0){
        return 'online';
      }else if (this.current === 1){
        return 'lastOnlineTime';
      }else if (this.current === 2){
        return 'kmoney';
      }
    },
    queryList(pageNo, pageSize) {
      //uni.showLoading({title: '加载中'});
      const params = {page: pageNo,pageSize: pageSize};
      params.username = this.username;
      params.sort = this.getSortName();
      this.$u.api.agent.getRecentChatUserList(params).then(res => {
        //uni.hideLoading();
        this.$refs.paging.complete(res.data.list);
      }).catch(res => {
        this.$refs.paging.complete(false);
      })
    },
    change(index) {
      this.current = index;
      this.$refs.paging.reload();
    },
  }
}
</script>

<style lang="scss">

.unreadmsg{
  background-color: #f00; /* 红色背景 */
  width: 30rpx; /* 宽度 */
  height: 30rpx; /* 高度 */
  position: absolute;
  top: -12rpx;
  border-radius: 50%;
  right: 0;
  color: #fff;
  font-size: 24rpx;
  padding:4rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.layout {
  width: 100%;
  height: 100%;
  background-color: #f1f1f1;
  overflow: hidden;
}

.mrg-search{
  padding: 20rpx;
  background: #fff;
  .mrg-search-item{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20rpx;
    .u-search{
      margin-right: 20rpx !important;
    }
  }
}

.Personal-home {
  width: 100%;
  height: 100%;
  background: #f1f4fc;
  .Personal-content {
    background: #fff;
    padding: 30rpx 30rpx;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #eee;
    .online{
      .online-icon{
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 15px;
      }
      .online-lixian{
        background: #9a90a1;
      }
      .online-zaixian{
        background: #00d123;
      }
    }
    .Personal-info{
      display: flex;
      flex: 1;
      .Personal-conten-datatitle {
        color: #181818;
        overflow: hidden;
        margin-left: 40rpx;
        .Personal-conten-datatitle-1:first-child {
          margin: 0;
          font-size: 32rpx;
          margin-bottom: 20rpx;
        }
        .Personal-conten-datatitle-1:nth-child(2) {
          margin: 0;
          color: grey;
          font-size: 24rpx;
        }
        .Personal-conten-datatitle-1:nth-child(3) {
          margin: 0;
          color: grey;
          font-size: 24rpx;
        }
      }
      .Personal-conten-dataimg {
        width: 60px;
        height: 60px;
        image {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
    }
    .Personal-delete{
      padding: 10px;
      .close{
        background: #dadbde;
        border-radius: 50%;
        padding: 3px;
      }
    }
  }
}

// 禁用u-subsection组件动画
::v-deep .u-subsection {
  transition: none !important;
  animation: none !important;
}

::v-deep .u-subsection__bar {
  transition: none !important;
  animation: none !important;
}
</style>
