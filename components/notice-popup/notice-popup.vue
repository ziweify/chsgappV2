<template>
  <view class="modal-container" v-if="show">
    <view class="header">
      <image style="width: 100%;" src="/static/img/noticebg.png"/>
      <uni-icons color="#fff" type="close" size="48" style="position: absolute;right: 0;top: 56rpx;" @click="$emit('cancel')"/>
    </view>
    <view class="modal-content">
      <view class="modal-content-left">
        <view class="modal-content-left-item" :class="{'left-active':titleIndex === index}" v-for="(title, titleIndex) in notices.map(item => item.title)" @click="choose(titleIndex)">
          {{ title }}
        </view>
      </view>
      <view class="modal-content-right">
        <view style="color: #8f8d8e;">{{ notices[index] && notices[index].time }}</view>
        <view style="flex: 1; overflow-y: auto;margin-top: 10rpx;">
          {{ notices[index] && notices[index].content }}
        </view>
        <text style="display: flex;justify-content: center;align-items: center;padding:10rpx;">{{ index+1 }}/{{ notices.length }}</text>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  name: 'modal',
  props: {
    show: {
      type: Boolean,
      default: true
    },
    notices: {
      type: Array,
      default: []
    },
    pageSize: {
      type: Number,
      default: 10
    },
    pageNumber: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 0
    },
    time: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      styles: {
        'bottom': 'justify-content: flex-end;',
        'center': 'justify-content: center;',
        'top': 'justify-content: flex-start;',
      },
      index: 0,
      continues: 2
    }
  },
  methods: {
    choose(index) {
      this.index = index
    }
  },
  computed: {
    totalPage() {
      return Math.ceil(this.total / this.pageSize);
    },
    startNumAndEndNum() {
      const {continues, pageNumber, totalPage} = this;
      let start = 0, end = 0;
      if (continues > totalPage) {
        start = 1;
        end = totalPage;
        let showArray = Array.from({length: totalPage}, (v, i) => start + i)
        return {start, end, showArray};
      } else {
        start = pageNumber - parseInt(continues / 2);
        end = pageNumber + parseInt(continues / 2);
        if (start < 1) {
          start = 1;
          end = continues;
        }
        if (end > totalPage) {
          end = totalPage;
          start = totalPage - continues + 1;
        }
        let showArray = Array.from({length: end}, (v, i) => start + i)
        for (let i = 0; i < showArray.length; i++) {
          if (showArray[i] > end) {
            showArray.splice(i - showArray.length)
          }
        }
        return {start, end, showArray};
      }
    },
  },
}
</script>
<style lang="scss" scoped>
$fontSizeLg: 17px;
$fontSizeSm: 15px;
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: rgba(0, 0, 0, .3);
  transition: all 5s;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  justify-content: center;

  .header{
    width:85%;
    position: relative;
    margin-bottom: -6rpx;
  }

  .modal-content {
    overflow: hidden;
    height: 50%;
    font-size: $fontSizeSm;
    display: flex;
    z-index: 1000;
    width: 85%;
    background: #FFFFFF;
    border-top: 1px solid lightgray;
    .modal-content-left{
      width: 240rpx;
      height: 100%;
      overflow-y:auto;
      border-right: 1px solid lightgray;
      &-item{
        padding: 30rpx 10rpx;
        margin-bottom: 2rpx;
        background: #fff;
        color: #1a1a1a;
        border-bottom: 1px solid lightgray;
      }
      .left-active{
        background: #5BA0DB !important;
        color: #fff !important;
      }
    }
    .modal-content-right{
      padding: 20rpx 20rpx 0 20rpx;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
      font-size: 28rpx;
    }
  }

  @keyframes fadeZoom {
    0% {
      transform: scale(.7);
      opacity: .6;
    }

    80% {
      transform: scale(1.2);
      opacity: .3;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .active {
    background: skyblue;
  }
}
</style>
