<template>
  <view class="layout">
    <view class="layout-content">
      <view class="mysection">
        <TsCustom :backUrl="backUrl" :isBack="true" title="报表"></TsCustom>
      </view>
      <view style="background-color: #fff;flex: 1;overflow-y: auto;border-radius: 16rpx;">
        <u-cell-group>
          <u-cell @click="goto('agent/manage/report/reportAll')" icon="file-text" title="总报表" :isLink="true"></u-cell>
          <u-cell @click="goto('agent/manage/report/reportUser')" icon="file-text" title="用户报表" :isLink="true"></u-cell>
<!--          <u-cell icon="file-text" title="分类报表" :isLink="true"></u-cell>-->
          <u-cell @click="goto('agent/manage/report/reportWjs')" icon="file-text" title="未结报表" :isLink="true"></u-cell>
<!--          <u-cell icon="file-text" title="返佣报表" :isLink="true"></u-cell>
          <u-cell icon="file-text" title="红包报表" :isLink="true"></u-cell>
          <u-cell icon="file-text" title="回水报表" :isLink="true"></u-cell>-->
          <u-cell @click="goto('agent/manage/report/reportLogs')" icon="file-text" title="日志报表" :isLink="true"></u-cell>
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
  methods: {
    goto(url){
      uni.$utils.jump(url);
    },

  }
}
</script>

<style lang="scss" scoped>

</style>
