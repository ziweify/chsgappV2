<template>
  <view class="custom-collapse-item">
    <!-- 标题区域 -->
    <view 
      class="collapse-header" 
      :class="[`align-${align}`, { 'is-active': isOpen }]"
      @click="toggle"
    >
      <!-- 自定义标题插槽 -->
      <slot name="title" v-if="hasSlotTitle"></slot>
      <!-- 默认标题 -->
      <view v-else class="default-title">
        <text>{{ title }}</text>
        <view class="arrow" :class="{ 'arrow-active': isOpen }">
          <text class="arrow-icon">▼</text>
        </view>
      </view>
    </view>
    
    <!-- 内容区域 -->
    <view 
      class="collapse-content" 
      :class="{ 'collapse-content-active': isOpen }"
      :style="contentStyle"
    >
      <view class="collapse-content-inner">
        <slot></slot>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CustomCollapseItem',
  inject: ['collapse'],
  props: {
    // 面板标题
    title: {
      type: String,
      default: ''
    },
    // 是否默认展开
    open: {
      type: Boolean,
      default: false
    },
    // 是否显示动画
    showAnimation: {
      type: Boolean,
      default: true
    },
    // 标题对齐方式
    align: {
      type: String,
      default: 'left', // left, center, right
      validator: value => ['left', 'center', 'right'].includes(value)
    },
    // 面板在列表中的索引
    itemIndex: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      key: null, // 当前面板的唯一标识
      isOpen: false
    }
  },
  computed: {
    contentStyle() {
      if (!this.showAnimation) {
        return this.isOpen ? {} : { display: 'none' };
      }
      return {};
    },
    hasSlotTitle() {
      return !!(this.$slots.title || this.$scopedSlots.title);
    }
  },
  created() {
    // 生成唯一key
    this.key = this._uid || Math.random().toString(36).substr(2, 9);
    
    // 设置初始展开状态
    this.isOpen = this.open;
  },
  beforeDestroy() {
    // 注销item
    if (this.collapse && this.itemIndex !== null) {
      this.collapse.unregisterItem(this.key);
    }
  },
  watch: {
    // 监听父组件的展开状态变化 - 修复Vue 2.x兼容性
  },
  mounted() {
    // 在mounted时设置初始状态和监听
    if (this.collapse) {
      // 注册item到父组件
      if (this.itemIndex !== null) {
        this.collapse.registerItem(this.key, this.itemIndex);
      }
      this.collapse.setInitialActive(this.key, this.open);
      
      this.updateOpenState();
      // 手动监听父组件的activeKeys变化
      this.$watch(() => this.collapse.activeKeys, (newKeys) => {
        this.updateOpenState();
      }, { immediate: true });
    }
  },
  methods: {
    toggle() {
      if (this.collapse) {
        this.collapse.toggle(this.key);
      } else {
        // 如果没有父组件，独立工作
        this.isOpen = !this.isOpen;
      }
    },
    updateOpenState() {
      if (this.collapse && this.collapse.activeKeys) {
        const newState = this.collapse.activeKeys.includes(this.key);
        this.isOpen = newState;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-collapse-item {
  background-color: #fff;
  
  .collapse-header {
    position: relative;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.3s;
    border-bottom: 1rpx solid #e6e6e6;
    
    &:active {
      background-color: #f8f8f8;
    }
    
    &.align-left {
      text-align: left;
      
      .default-title {
        justify-content: space-between;
      }
    }
    
    &.align-center {
      text-align: center;
      
      .default-title {
        justify-content: center;
        
        .arrow {
          position: absolute;
          right: 32rpx;
        }
      }
    }
    
    &.align-right {
      text-align: right;
      
      .default-title {
        justify-content: flex-end;
      }
    }
    
    .default-title {
      display: flex;
      align-items: center;
      padding: 24rpx 32rpx;
      font-size: 28rpx;
      color: #333;
      min-height: 60rpx;
      
      .arrow {
        transition: transform 0.3s ease;
        margin-left: 16rpx;
        
        .arrow-icon {
          font-size: 20rpx;
          color: #999;
          display: inline-block;
          transform-origin: center;
        }
        
        &.arrow-active {
          transform: rotate(180deg);
        }
      }
    }
  }
  
  .collapse-content {
    overflow: hidden;
    background-color: #fff;
    
    &:not(.collapse-content-active) {
      max-height: 0;
      transition: max-height 0.3s ease-in-out;
    }
    
    &.collapse-content-active {
      max-height: 2000rpx;
      transition: max-height 0.3s ease-in-out;
    }
    
    .collapse-content-inner {
      background-color: #fff;
    }
  }
}

/* 无动画模式的特殊处理 */
.custom-collapse-item {
  .collapse-content {
    &[style*="display: none"] {
      max-height: none !important;
      transition: none !important;
    }
  }
}
</style> 