<template>
  <view>
    <view @click="finish(item)" class="game-switch-item" v-for="(item,index) in list">
      <view class="logo">
        <image :src="'/static/glogo1/'+item.gid+'.png'" lazy="loaded"></image>
      </view>
      <view class="lottery-name">
        <view class="p1">{{ item.gname }}</view>
        <view class="p2">{{ item.period }}期</view>
      </view>
      <view class="status">
        <view class="status-1">
          <text class="fpz-word" v-show="item.stopstatus == 0 && item.fp == 1">封盘中...</text>
          <text class="fpz-word" v-show="item.stopstatus == 1">未开盘</text>
          <text class="jfp-word" v-show="item.stopstatus == 0 && item.fp == 0">距离封盘</text>
        </view>
        <view class="status-2" v-show="item.stopstatus == 0 && item.fp == 0">
          <view>
            <view class="flip-down vue-countdown-component theme5">
              <view class="time-box">{{ item.timearr[0] }}</view>
              <view class="time-box">{{ item.timearr[1] }}</view>
              <view class="time-unit">:</view>
              <view class="time-box">{{ item.timearr[2] }}</view>
              <view class="time-box">{{ item.timearr[3] }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
	export default {
		name: 'gameTimeList',
		data() {
			return {
        timer: null,
        kjtimer: null,
        list:[]
			};
		},
		computed: {
      winobj(){
        return this.$u.sys();
      }
		},
		props: {

		},
    beforeDestroy() {
      console.log("gametimelist beforeDestroy");
      if (this.timer) {clearInterval(this.timer);}
      if (this.kjtimer) {clearInterval(this.kjtimer);}
    },
    onUnload(){
      console.log("gametimelist onUnload");
    },
    created(){
      this.timerCheck();
      //初始化定时器
      if (this.timer) {clearInterval(this.timer);}
      if (this.kjtimer) {clearInterval(this.kjtimer);}
      this.timer = setInterval(() => {this.timerCheck();}, 1000);
      this.kjtimer = setInterval(() => {
        console.log("gametimelist kjtimer");
        if(uni.$socketUtils.isOpenSocket){uni.$socketUtils.send({eventType:"periodListOrSingle"});}
      }, 10000);
      if(uni.$socketUtils.isOpenSocket){
        uni.$socketUtils.send({eventType:"periodListOrSingle"});
      }
      let that = this;

    },
		methods: {
      timerCheck() {

      },
      finish(item){
        this.$emit('gfinish',item);
      }
		}
	}
</script>

<style lang="scss" scoped>

.vue-countdown-component
</style>
