<template>
  <view class="layout">
    <GameSettingsComponent :isPopupMode="false" :backUrl="backUrl" />
  </view>
</template>

<script>
import GameSettingsComponent from '@/components/GameSettingsComponent.vue';

export default {
  components: {
    GameSettingsComponent
  },
  data() {
    return {
      backUrl: 'agent/roomset/roomset' // 默认返回地址
    };
  },
  onLoad(options) {
    // 如果URL中有returnUrl参数，使用它作为返回地址
    if (options && options.returnUrl) {
      this.backUrl = decodeURIComponent(options.returnUrl);
      console.log('🎮 游戏设置页面接收到返回地址:', this.backUrl);
    }
  }
};
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  background: #f5f5f5;
}
</style>