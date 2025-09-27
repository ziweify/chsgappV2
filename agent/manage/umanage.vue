<template>
  <view class="layout">
    <view class="layout-content">
      <view class="mysection">
        <TsCustom :backUrl="backUrl" :isBack="true" title="用户管理"></TsCustom>
      </view>
      <view style="background-color: #fff;flex: 1;overflow-y: auto;border-radius: 16rpx;">
        <u-cell-group>
          <u-cell @click="goto('agent/manage/ulist/userlist')" icon="account" title="用户列表" :isLink="true"></u-cell>
          <u-cell v-if="userInfo.ifson == 0" @click="goto('agent/manage/ulist/sonuserlist')" icon="woman" title="子账号列表" :isLink="true"></u-cell>
          <u-cell @click="goto('agent/manage/ulist/linkrecord')" icon="file-text" title="链接生成记录" :isLink="true"></u-cell>
<!--          <u-cell icon="woman" title="代理列表" :isLink="true"></u-cell>
          <u-cell icon="android-fill" title="机器人列表" :isLink="true"></u-cell>-->
        </u-cell-group>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl:'agent/manage/center',
      info:{},
      show:false
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

</style>
