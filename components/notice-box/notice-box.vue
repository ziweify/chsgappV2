<template>
  <view class="notice-box" v-show="show">
    <view class="notice">
      <view class="notice-header">
        <image style="height: 330rpx;" class="img" src="/static/img/notice-header.svg"></image>
        <view class="close" @click="$emit('cancel')"></view>
      </view>
      <view class="notice-body">
        <view class="notice-menu">
          <view class="notice-menu-item" :class="{'active':titleIndex === index}" v-for="(title, titleIndex) in notices.map(item => item.title)" @click="choose(titleIndex)">{{ title }}</view>
        </view>
        <view class="notice-content">
          <view class="notice-content-item">
            <view class="date">{{ notices[index] && notices[index].time }}</view>
            <view class="p">{{ notices[index] && notices[index].content }}</view>
          </view>
        </view>
      </view>
      <view class="notice-pagination">{{ index+1 }} / {{ notices.length }}</view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'notice-box',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    notices: {
      type: Array,
      default: []
    },
  },
  data() {
    return {
      index:0
    }
  },
  methods: {
    choose(index) {
      this.index = index
    }
  }
}
</script>
<style lang="scss" scoped>
.notice-box{
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32.373333rpx;
  color: rgba(0, 0, 0, .72);
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: 2000;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, .5);
  -webkit-animation: fadeIn-22c4370f .25s ease-in 0s 1 normal both running;
  animation: fadeIn-22c4370f .25s ease-in 0s 1 normal both running;
}
.notice-box .notice {
  display: flex;
  flex-direction: column;
  width: 80%;
  /*height: 80%;*/
  animation: slideIn-22c4370f .25s ease-in-out 0s 1 normal both running;
  transition: opacity .25s ease-in-out 0s;
}
.notice-box .notice-header {
  position: relative;
  height: 324rpx;
  z-index: 0;
  flex: 0 0 300rpx;
}
.notice-box .notice-header .img{
  display: block;
  width: 100%;
}
.notice-box .notice-header .close:before {
  transform: rotate(45deg);
}
.notice-box .notice-header .close:after {
  transform: rotate(-45deg);
}
.notice-box .notice-header .close:after, .notice-box .notice-header .close:before {
  content: "";
  display: block;
  position: absolute;
  width: 70%;
  height: 4rpx;
  top: 50%;
  left: 15%;
  background-color: #fff;
}
.notice-box .notice-header .close{
  position: absolute;
  right: 0;
  top: 20.133333rpx;
  box-shadow: inset 0 0 0 4rpx #fff;
  background-color: transparent;
  width: 101.333333rpx;
  height: 101.333333rpx;
  cursor: pointer;
  border-width: initial;
  border-style: none;
  border-color: initial;
  border-image: initial;
  border-radius: 50%;
  outline: none;
  padding: 0;
  margin: 0;
  transition: background-color .2s ease-in-out 0s;
}
.notice-box .notice-body{
  position: relative;
  flex-basis: 506.666667rpx;
  box-sizing: border-box;
  padding-top: 40.533333rpx;
  display: flex;
  flex-direction: row;
  flex: 1;
  flex-grow: 1;
  padding-bottom: 40.533333rpx;
  background: #fff;
  border-radius: 0 0 40.533333rpx 40.533333rpx;
}
.notice-box .notice-body .notice-menu{
  position: relative;
  width: 223.333333rpx;
  margin-left: -20.266667rpx;
  flex-basis: 223.333333rpx;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 20.266667rpx;
  z-index: 1;
  border-right: 3.04rpx solid rgba(0, 0, 0, .1);
}
.notice-box .notice-body .notice-menu-item.active{
  color: #fff;
}
.notice-box .notice-body .notice-menu-item{
  position: relative;
  font-size: 30.4rpx;
  color: rgba(0, 0, 0, .6);
  z-index: 0;
  box-sizing: border-box;
  width: 223.333333rpx;
  text-align: center;
  cursor: pointer;
  padding: 24.32rpx 0 24.32rpx 20.266667rpx;
  transition: color .2s ease-in-out 0s;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.notice-box .notice-body .notice-menu-item.active:after, .notice-box .notice-body .notice-menu-item.active:before {
  transform: translateY(0);
  opacity: 1;
}
.notice-box .notice-body .notice-menu-item:before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  z-index: -1;
  box-shadow: 0 4.053333rpx 4.053333rpx rgba(0, 0, 0, .1);
  background: #5ba0da;
  transform: translateX(-201.28rpx);
  transition: all .3s ease-in-out 0s;
}
.notice-box .notice-body .notice-menu-item.active:after, .notice-box .notice-body .notice-menu-item.active:before {
  transform: translateY(0);
  opacity: 1;
}
.notice-box .notice-body .notice-menu-item:after {
  content: "";
  display: block;
  width: 20.266667rpx;
  height: 20.266667rpx;
  box-sizing: border-box;
  position: absolute;
  left: -2.026667rpx;
  bottom: -20.266667rpx;
  border-width: 10.133333rpx;
  border-style: solid;
  border-color: #2662a6 #2662a6 transparent transparent;
  border-image: initial;
  border-left: 10.133333rpx solid transparent;
  border-bottom: 10.133333rpx solid transparent;
  transform: translateX(-20.266667rpx);
  transition: all .3s ease-in-out 0s;
}
.notice-box .notice-body .notice-content{
  position: relative;
  height: 100%;
  flex: 1;
  flex-grow: 1;
  flex-basis: 202.666667rpx;
  width: 202.666667rpx;
  padding: 0 20.266667rpx;
}
.notice-box .notice-body .notice-content:before {
  top: 0;
  right: 0;
  background: linear-gradient(0deg, hsla(0, 0%, 100%, 0), #fff);
}
.notice-box .notice-body .notice-content:after, .notice-box .notice-body .notice-content:before {
  content: "";
  position: absolute;
  height: 40.533333rpx;
  width: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
  transition: all .3s ease-in-out 0s;
}
.notice-box .notice-body .notice-content>:first-child {
  margin-top: 0;
}
.notice-box .notice-body .notice-content-item{
  position: relative;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
.notice-box .notice-body .notice-content-item .date{
  font-size: 26.346667rpx;
  margin: 0;
}
.notice-box .notice-body .notice-content-item .p{
  margin: 10.133333rpx 0 0;
  font-size: 28.373333rpx;
}
.notice-box .notice .notice-pagination{
  line-height: 0;
  position: relative;
  text-align: center;
  bottom: 20.266667rpx;
  font-size: 24.32rpx;
}
</style>
