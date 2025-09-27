<template>
  <view class="layout">
    <view class="layout-content">
      <view class="mysection">
        <TsCustom :backUrl="backUrl" :isBack="true" title="打单中心"></TsCustom>
      </view>
      <view style="background-color: #fff;flex: 1;overflow-y: auto;border-radius: 16rpx;">
        <u-cell-group>
          <u-cell @click="goto('agent/manage/outbet/outbetlist')" icon="coupon-fill" title="打单配置" :isLink="true"></u-cell>
          <u-cell @click="goto('agent/manage/outbet/outbetrecord')" icon="file-text" title="打单记录" :isLink="true"></u-cell>
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
