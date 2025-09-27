<template>
  <view class="layout">
    <view class="flex-layout" style="height: 100%;">
      <TsCustom :backUrl="backUrl" :isBack="true" title="修改头像">
        <block slot='right'>
          <view style="margin-right: 20rpx;" @click="successsubTo">
            <u-icon style="font-weight: bold" size="24" color="#fff" name="more-dot-fill"></u-icon>
          </view>
        </block>
      </TsCustom>
      <view class="flex-content" style="height: 100%;">
        <view class="dataca-home">
          <view class="content-data">
            <u-image :showLoading="true" :src="avatar" mode="aspectFit">
              <template v-slot:loading>
                <u-loading-icon color="#0087b4"></u-loading-icon>
              </template>
            </u-image>
          </view>
        </view>
        <u-action-sheet :closeOnClickOverlay="true" @close="show = false" :actions="list" :show="show" @select="actionclick"></u-action-sheet>
        <view class="content-valuedata" style="display: none;">
          <view class="van-uploader">
            <view class="van-uploader__wrapper">
              <view class="van-uploader__upload">
                <i class="van-icon van-icon-photograph van-uploader__upload-icon">
                </i>
                <input type="file" accept="image/jpg,image/jpeg,image/png,image/PNG,image/webp,image/bmp"
                       class="van-uploader__input">
              </view>
            </view>
          </view>
          <view class="van-uploader">
            <view class="van-uploader__wrapper">
              <view class="van-uploader__upload">
                <i class="van-icon van-icon-photograph van-uploader__upload-icon"></i>
                <input capture="camera" type="file" accept="image/*" class="van-uploader__input">
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {HTTP_REQUEST_URL} from '@/common/config.js';

export default {
  data() {
    return {
      show: false,
      avatar: '',
      list:[{name:'从手机相册选择'}, {name:'取消'}],
      backUrl:"pages/member/personamessage",
      headImageDomain:''
    };
  },
  onLoad() {
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.avatar = this.headImageDomain+uni.getStorageSync('avatar');
  },
  methods: {
    actionclick(res){
      this.show = !this.show;
      if(res.name == '从手机相册选择'){
        this.chooseAndUploadImage();
      }
    },
    successsubTo(){
        this.show = !this.show;
    },
    chooseAndUploadImage() {
      // 选择图片
      let that = this;
      uni.chooseImage({
        count: 1, // 默认9，设置图片的数量
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        crop: true, // 启用图片裁剪
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths;
          //如果是app
          // #ifdef APP-PLUS
          // 压缩图片
          uni.compressImage({
            src: tempFilePaths[0],
            quality: 50, // 压缩质量，范围为0-100，默认为80
            success: (compressRes) => {
              const uploadTask = uni.uploadFile({
                url: HTTP_REQUEST_URL + '/member/uploadheadimg', // 服务器上传接口地址
                filePath: tempFilePaths[0],
                name: 'file', // 必须填写，后台用来接收文件
                header: {
                  'Authorization': uni.getStorageSync('token') // 添加请求头 Authorization
                },
                formData: {},
                success: (uploadFileRes) => {
                  let data = JSON.parse(uploadFileRes.data);
                  that.avatar = that.headImageDomain+data.data.url;
                  uni.setStorageSync('avatar', data.data.url);
                  //console.log('图片上传成功', uploadFileRes);
                },
                fail: (uploadFileErr) => {
                  console.error('图片上传失败', uploadFileErr);
                }
              });
              // 监听上传进度变化
              uploadTask.onProgressUpdate((res) => {
                console.log('上传进度' + res.progress + '%');
              });
            },
            fail: (compressErr) => {
              console.error('图片压缩失败', compressErr);
            }
          });
          // #endif
          // #ifdef H5
          const uploadTask = uni.uploadFile({
            url: HTTP_REQUEST_URL + '/member/uploadheadimg', // 服务器上传接口地址
            filePath: tempFilePaths[0],
            name: 'file', // 必须填写，后台用来接收文件
            header: {
              'Authorization': uni.getStorageSync('token') // 添加请求头 Authorization
            },
            formData: {},
            success: (uploadFileRes) => {
              let data = JSON.parse(uploadFileRes.data);
              that.avatar = that.headImageDomain+data.data.url;
              uni.setStorageSync('avatar', data.data.url);
              //console.log('图片上传成功', uploadFileRes);
            },
            fail: (uploadFileErr) => {
              console.error('图片上传失败', uploadFileErr);
            }
          });
          // 监听上传进度变化
          uploadTask.onProgressUpdate((res) => {
            console.log('上传进度' + res.progress + '%');
          });
          // #endif
        },
        fail: (chooseImageErr) => {
          console.error('选择图片失败', chooseImageErr);
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.layout {
  background-color: white;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.imgdatasrc {
  font-size: .533333*2rem;
  color: #fff
}

.successsub {
  width: 1.333333*2rem;
  text-align: center
}

.Personalmessage-ul {
  width: 100%
}

.Personalmessage-ul-li {
  text-align: center;
  height: 1.413333*2rem;
  background: #fff;
  font-size: .426667*2rem;
  font-weight: 400;
  color: #1a1a1a;
  line-height: 1.413333*2rem;
  width: 100%
}

.dataca-home {
  height: 100%;
  background: #fff
}

.dataca-home .content-data, .dataca-home {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center
}

.dataca-home .content-data {
  max-height: 10.666667*2rem
}

.dataca-home .content-data image {
  width: 100%;
  height: 100%
}
</style>
