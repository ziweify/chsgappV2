<template>
  <view class="layout">
    <!-- 使用可复用的outbet配置组件 -->
    <OutbetConfigComponent 
      :isPopupMode="false" 
      :backUrl="backUrl"
    />
  </view>
</template>

<script>
import OutbetConfigComponent from '@/components/OutbetConfigComponent.vue';

export default {
  components: {
    OutbetConfigComponent
  },
  data() {
    return {
      backUrl: "agent/manage/outbetmanage"
    }
  },
  onLoad(options) {
    // 从URL参数获取返回地址
    if (options.from === 'room') {
      this.backUrl = 'copage/chat';
    }
  }
}
</script>

<style scoped>
.layout {
  height: 100vh;
  background: #f5f5f5;
}
</style>