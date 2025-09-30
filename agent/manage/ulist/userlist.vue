<template>
  <view class="layout">
    <!-- 使用完整的用户列表组件，显示标题栏 -->
    <UserListComponent 
      :showHeader="true"
      :backUrl="backUrl"
    />
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
      backUrl: "agent/manage/umanage"
    };
  }
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
 }
</style>