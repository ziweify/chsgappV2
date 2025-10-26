<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="房间设置"></TsCustom>
      <view class="flex-content">
        <!-- 使用可复用的房间设置组件 -->
        <RoomSettingsComponent 
          :isPopupMode="false" 
          :backUrl="backUrl"
        />
      </view>
    </view>
  </view>
</template>

<script>
import RoomSettingsComponent from '@/components/RoomSettingsComponent.vue';

export default {
  components: {
    RoomSettingsComponent
  },
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl: 'agent/gamehall/hall'
    }
  }
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  background: #f5f5f5;
}

.flex-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex-content {
  flex: 1;
  overflow-y: auto;
}
</style>