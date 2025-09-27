<template>
  <view class="custom-collapse">
    <slot></slot>
  </view>
</template>

<script>
export default {
  name: 'CustomCollapse',
  props: {
    // 是否开启手风琴模式，只允许一个面板展开
    accordion: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      collapse: this
    }
  },
  mounted() {
    // Collapse组件已挂载
  },
  data() {
    return {
      activeKeys: [], // 当前展开的面板key数组
      itemsMap: {} // 存储item key到index的映射，使用对象确保响应式
    }
  },
  methods: {
    // 切换面板展开状态
    toggle(key) {
      const index = this.activeKeys.indexOf(key);
      const itemIndex = this.itemsMap[key];
      
      if (index > -1) {
        // 当前面板已展开，收起
        this.activeKeys.splice(index, 1);
      } else {
        // 当前面板未展开，展开
        if (this.accordion) {
          // 手风琴模式，先收起所有面板
          this.activeKeys = [key];
        } else {
          // 非手风琴模式，可以同时展开多个
          this.activeKeys.push(key);
        }
      }
      
      // 强制触发响应式更新
      this.$forceUpdate();
      
      // 触发change事件，传递面板的index（与uni-collapse保持一致）
      if (this.accordion) {
        // 手风琴模式：传递当前展开面板的index，如果没有展开则传递null
        const activeKey = this.activeKeys.length > 0 ? this.activeKeys[0] : null;
        const activeIndex = activeKey !== null ? this.itemsMap[activeKey] : null;
        this.$emit('change', activeIndex);
      } else {
        // 非手风琴模式：传递所有展开面板的index数组
        const activeIndexes = this.activeKeys.map(k => this.itemsMap[k]).filter(i => i !== undefined && i !== null);
        this.$emit('change', activeIndexes);
      }
    },
    
    // 判断面板是否展开
    isActive(key) {
      return this.activeKeys.includes(key);
    },
    
    // 设置初始展开状态
    setInitialActive(key, open) {
      if (open && !this.activeKeys.includes(key)) {
        if (this.accordion) {
          this.activeKeys = [key];
        } else {
          this.activeKeys.push(key);
        }
      }
    },
    
    // 注册item的index映射
    registerItem(key, index) {
      this.$set(this.itemsMap, key, index);
    },
    
    // 注销item的index映射
    unregisterItem(key) {
      this.$delete(this.itemsMap, key);
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-collapse {
  width: 100%;
}
</style> 