<template>
	<view>
    <view class="header-line" :style="{'height':winobj.statusBarHeight+'px'}"></view>
    <view class="header-bar">
      <view class="header-bar-left item" @tap="BackPage">
        <template v-if="isBack">
          <u-icon size="24" color="#fff" name="arrow-left"></u-icon>
        </template>
      </view>
      <view class="header-bar-title item">
        <template v-if="$slots.title">
          <slot name="title" />
        </template>
        <template v-if="!$slots.title">
          <slot name="icon"></slot>{{ title }}
        </template>
      </view>
      <view class="header-bar-right item">
        <slot name="right"></slot>
      </view>
    </view>
	</view>
</template>

<script>
  export default {
		name: 'TsCustom',
		data() {
			return {
				StatusBar: this.StatusBar
			};
		},
		computed: {
      winobj(){
        return this.$u.sys();
      }
		},
		props: {
			bgColor: {
				type: String,
				default: ''
			},
			isBack: {
				type: [Boolean, String],
				default: false
			},
			title: {
				type: String,
				default: ''
			},
      backUrl: {
        type: String,
        default: ''
      },
		},
		methods: {
			BackPage() {
        // #ifdef APP-PLUS
        uni.$utils.jump('',"navigateBack");
        // #endif
        // #ifndef APP-PLUS
        uni.$utils.jump(this.backUrl,"navigateTo");
        // #endif
			}
		}
	}
</script>

<style lang="scss" scoped>
.header-line{
  background: linear-gradient(270deg,#08bbc2,#144988);
}

.header-bar{
  height: 88rpx;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  background: linear-gradient(270deg,#08bbc2,#144988);
  width: 100%;
  justify-content: space-around;
}

.header-bar .item{
  flex: 1; // 每个元素占据 1/3 的宽度
  height: 100%;
}

/*.header-bar.left .header-bar-left {
  position: relative;
}*/

.header-bar .header-bar-left {
  padding: 0 16rpx;
  display: flex;
  align-items: center;
}

.header-bar .header-bar-title {
  display: flex;
  align-items: center;
  margin: 0 auto;
  color: #fff;
  font-weight: 500;
  font-size: 36rpx;
  justify-content: center;
}

.header-bar .header-bar-right {
  display: flex;
  align-items: center;
  color: #fff;
  font-weight: 500;
  font-size: 26rpx;
  height: 100%;
  justify-content: flex-end;
  margin-right: 20rpx;
}
</style>
