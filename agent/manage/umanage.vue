<template>
  <view class="layout">
    <view class="layout-content" v-if="!showUserListComponent">
      <view class="mysection">
        <TsCustom :backUrl="backUrl" :isBack="true" title="用户管理"></TsCustom>
      </view>
      <view style="background-color: #fff;flex: 1;overflow-y: auto;border-radius: 16rpx;">
        <u-cell-group>
          <u-cell @click="goto('agent/manage/ulist/userlist')" icon="account" title="用户列表" :isLink="true"></u-cell>
          <u-cell @click="showUserListComponent = true" icon="account-fill" title="🔥 用户管理组件 🔥" :isLink="true"></u-cell>
          <u-cell v-if="userInfo.ifson == 0" @click="goto('agent/manage/ulist/sonuserlist')" icon="woman" title="子账号列表" :isLink="true"></u-cell>
          <u-cell @click="goto('agent/manage/ulist/linkrecord')" icon="file-text" title="链接生成记录" :isLink="true"></u-cell>
<!--          <u-cell icon="woman" title="代理列表" :isLink="true"></u-cell>
          <u-cell icon="android-fill" title="机器人列表" :isLink="true"></u-cell>-->
        </u-cell-group>
      </view>
    </view>
    
    <!-- 用户列表组件 -->
    <view v-if="showUserListComponent" style="height: 100vh;">
      <UserListComponent 
        :showHeader="true"
        :backUrl="''"
        @back="showUserListComponent = false"
      />
    </view>
  </view>
</template>
<script>
import UserListComponent from '@/components/UserListComponent.vue'

export default {
  mixins: [uni.$mymixin],
  components: {
    UserListComponent
  },
  data() {
    return {
      backUrl:'agent/manage/center',
      info:{},
      show:false,
      showUserListComponent: false
    };
  },
  onReady() {

  },
  methods: {
    goto(url){
      uni.$utils.jump(url);
    },

  }
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
}

.layout-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.mysection {
  flex-shrink: 0;
}

.back-btn {
  position: fixed;
  bottom: 30rpx;
  right: 30rpx;
  z-index: 999;
}
</style>
