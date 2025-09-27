<template>
  <view class="login-container" v-cloak>
    <view class="logo-box toll" :style="{'paddingTop':50+winobj.statusBarHeight+'px'}">
      <image src="/static/img/mlogo.png"></image>
    </view>
    <view class="content">
      <view class="form">
        <view class="input-box-wrap">
          <view class="shape1">
            <view @click="siwtchYzm" class="btn" :plain="true">二次验证</view>
          </view>
          <view class="input-bg username">
            <input v-model="login.account" type="text" placeholder="请输入房主账号" class="input-box">
          </view>
          <view class="input-bg password" style="display: flex;">
            <input v-model="login.password" type="text" class="input-box"
                   placeholder="请输入密码" :password="eyename == 'eye'" autocomplete="new-password">
            <u-icon style="margin-right: 14rpx;" color="#31C9E8" size="22" v-show="eyename == 'eye'" :name="eyename" @click="clearInput('eye-fill')"></u-icon>
            <u-icon style="margin-right: 14rpx;" color="#31C9E8" size="22" v-show="eyename == 'eye-fill'" :name="eyename" @click="clearInput('eye')"></u-icon>
          </view>
          <view class="input-yzm" v-show="!yzmtype">
            <input type="number" v-model="login.gcode" placeholder="请输入谷歌验证码" class="input-box">
          </view>
          <view class="input-yzm">
            <input style="margin-right: 10px;" v-model="login.code" type="number" placeholder="请输入验证码" class="input-box">
            <view class="image-wrap">
              <image @tap="captcha()" :src="base64"></image>
            </view>
          </view>
        </view>
        <view class="check-box-wrap">
          <view :class="checkbox" @click="jizhumima">记住密码</view>
        </view>
        <view class="submit-btn" @tap="bindLogin()">
          <button class="submit-btn"></button>
        </view>
        <view class="submit-btn2" @click="backLogin">
          <button></button>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      hidepassword: true,
      eyename: 'eye',
      show: false,
      check1: false,
      title: '',
      content: '',
      checkbox: 'check-box',
      yzmtype:true,
      login: {
        account: '',
        password: '',
        code:'',
        key:'',
        logintype:0,
        gcode:''
      },
      base64: ''
    };
  },
  computed:{
    winobj(){
      return this.$u.sys();
    }
  },
  onLoad() {
    this.captcha();
    let a_username = uni.getStorageSync('a_username');
    let a_password = uni.getStorageSync('a_password');
    if (a_username && a_username != '' && a_password && a_password != '') {
      this.login.account = a_username;
      this.login.password = a_password;
    }
    //判断平台类型
    if (this.$u.os() === 'android' || this.$u.os() === 'ios') {
      this.login.logintype = 1;
    } else if (this.$u.os() === 'h5') {
      this.login.logintype = 2;
    }
  },
  methods: {
    siwtchYzm(){
      this.yzmtype = !this.yzmtype;
    },
    jizhumima() {
      this.check1 = !this.check1
      if (this.check1) {
        this.checkbox = 'check-box1';
      } else {
        this.checkbox = 'check-box';
      }
    },
    clearInput(en) {
      this.eyename = en;
    },
    homeTo() {
      uni.navigateTo({
        url: '/pages/home/home'
      })
    },
    backLogin() {
      uni.$utils.jump('pages/common/login');
    },
    bindLogin() {
      if(uni.$socketUtils.isOpenSocket){
        uni.$socketUtils.closeSocket('user');
      }
      this.$u.throttle(async () => {
        //判断是否为空
        if (this.login.account == '' || this.login.password == '') {
          uni.$utils.showToast('账号或密码不能为空');
          return;
        }
        if (!this.$u.trim(this.login.code)) {
          uni.$utils.showToast('请输入验证码');
          return;
        }
        let that = this;
        uni.showLoading({title: '登录中'});
        this.$u.api.agent.login(this.login).then(res => {
          uni.hideLoading();
          uni.setStorageSync('token', res.data.token);
          uni.setStorageSync('isShowNotice', false);
          uni.setStorageSync('userInfo', res.data.userInfo);
          uni.setStorageSync('avatar', res.data.userInfo.avatar);
          uni.setStorageSync('expiresTime', res.data.expires_time);
          if (that.check1) {
            uni.setStorageSync('a_username', that.login.account);
            uni.setStorageSync('a_password', that.login.password);
          } else {
            uni.setStorageSync('a_username', '');
            uni.setStorageSync('a_password', '');
          }
          //等待存储成功后跳转
          uni.$utils.jump("agent/gamehall/hall","reLaunch");
        }).catch(res => {
          that.captcha();
          that.$u.toast(res.msg);
          uni.hideLoading();
        });
      },1000);
    },
    captcha() {
      let that = this;
      this.$u.api.common.getcaptcha().then(res => {
        that.login.key = res.data.key;
        //base64图片赋值
        that.base64 = 'data:image/png;base64,' + res.data.base64;
      }).catch(err => {
        uni.$utils.showToast("验证码获取失败");
      });
    }
  }
}
</script>
<style lang="scss" scoped>

.shape1 {
  display: flex;
  justify-content: end;
  margin-right: 16px;
  .btn{
    color: #fff;
    border: 1px solid #fff;
    font-size: 14px;
    border-radius: 20px;
    padding: 0 18px;
    line-height: 30px;
  }
  .btn:active{
    background-color: rgba(237, 237, 237, 0.85);
    color: #8f8d8e;
  }
}

.submit-btn2 {
  padding: 0 20px;
  margin-top: 10px;
}

.submit-btn2 button {
  width: 100%;
  height: 44px;
  border: none;
  background: url(/static/img/mem_login.f5f46261.png) no-repeat;
  background-size: 100% auto
}

.login-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: url(../../static/img/bg.jpg) no-repeat;
  background-size: 100% 100%;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  background-position: bottom
}

.content {
  flex: 1;
  margin: 0 15px;
}

.logo-box {
  min-height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-box.toll image {
  width: 132px;
  height: 60px;
  display: block;
}


.form {
  margin-top: 30px;
  padding-bottom: 20px;
  background: url(/static/img/login_bg2.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}


.input-box-wrap {
  padding-top: 38px;
}

.input-bg {
  margin: 15px 20px;
  height: 42px;
  box-sizing: border-box;
  background: url(data:image/png;base64,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) no-repeat;
  background-size: 100% 100%;
  overflow: hidden;
  position: relative;
}

.input-bg.username:before{
  content: "";
  position: absolute;
  display: inline-block;
  top: 10px;
  left: 17px;
  width: 17px;
}


.input-bg.username:before {
  height: 19px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAABACAMAAABxwuT6AAABMlBMVEVHcEw/k98/kN5Bk+JOovBNofBRpfVAldoyhtMvgc9Elecld8U7is9Tp/YvgtA2idZUp/Uvgc81iNZHnOcyhtNUqfhVqfhUqPdPo/Ezh9ROovApe8ktf8wugc0meMYyhdQ2itZGl+cugc5RpvQmeMcmecZHm+lJnew6j9s5jNpLoO09kN09kd5El+VCluQ/k+A/k+E9kN4+kd8yhdIxg9FWqvkzh9UqfMlVqfdRpfNUqPUsfMoyh9VSp/YsfsstgM0pfMg2iddTqPQ1iNU1iNZUp/ZSp/VNoe5CleNImeo4i9g5jNo8kNxKnew8j9w+kt83i9gzh9Q6jttVqvhUqPYwg9Akd8UpfMpGm+lNovFQpPMsf81Dl+ZSpvU8kN4/k+FLn+1BleMnecZInewugM4oescxYryVAAAAUHRSTlMAJxEvYUAiCW9YHH0GrztghhqEFIFUkcmS2ubEMePoaeN4pVu0i+dVTUPh0GbAzVH31t74xNWQ+fWbSaQkbNvUa7d46q3Rw6nHDPKXp/HrjF8TTpkAAALBSURBVEjHpZeHdtpAEEUlepMAiWZTTTEGY1Pce+8NQ4qTEDtxkv//hUQ7K4mys5JOnn2OYd+7W0aDhQSBKW9qY2hoI+UV7CuZHk4pnbSJ+qQhQ5LPDlvZHjK1XbFmYx9QxZywF1IqJV3Yp0+N4OUBPaTv4NIYPOWxu9+pJqubTOvjuzjr0jOZaSejOy4U3vkK8sxaHmrtoBcYZ00au9wS2EhNY+BKbFf9QjSPbWwefJVpesBEG6kCPvNQwhV/YX3pK6bXJF4GhzMk0GTW+gcR56PrhYQPt0I4HMKnr//S9KDisPpAInVWsYnT9OOwv0kirHLXXzQtujitv0girJW9xHnhnRkSrDOLYLlx2A0JkWFFYFMLOLwAB4uwvJWRplUcXiWBFfbExBuh+3aDz96aOOLMbOxsJLLd659EbbbbBvcamXoJ7A7zaoU64C6hFXkj6jG6zN8DD6+nGwJv3ZlziV1qcdrg6RXUaU2OtzrUeOL911+modflqNHkrqg5yr3dqL2Brsf7VrvRaLfuH42hnsq/WYW6A1TdkOU99g5j76zvz36lj0jxW6A3yq2WGzB++v1b5YbHFkt9rkpFFI2faIFn8jslY/AkjrT22bOp0nkgKLv3991yMHBeGjPOmM0dMANzm42J4vgbm3OmG5hlEyYaZc0dNfEEuu5aIsI+VSSxhqwd/Ui1LuLXQlzXUxN7y+mjCr8NFD2XGytIno4FrPovQIN5s6BlOhS07t4gjZb1Afk3qGjne22RhmX6/ugbUdneN+oypI/oTuBdPmIPjuQhD2c8hDey3ecAGfKHZOHPRHv2nyL2gNCWzpJXWy77sGuLINl/n0OYpubg+UWoARMXjvUXDkQXPBaqfzRlBUfKEqgqFN41hZ3BYQIVBPLnPecMzgElfNJUEByqQDCAq07h6hhccwrXxuCwUzj8//Bfc59nvFJ1hi0AAAAASUVORK5CYII=) no-repeat;
  background-size: 100% 100%;
}

.input-bg.password:before {
  content: "";
  position: absolute;
  top: 10px;
  left: 17px;
  width: 17px;
  height: 19px;
  display: inline-block;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAABGCAMAAACnmwfnAAAA0lBMVEVHcExKnu0wg9IrfsxMn+1FmOYtgc4kecY/k99Gl+c8kN0necc5jNswhNJSo/U3i9lWq/k7j9xVqfhSp/ZRpfRLofJGmOc1h9VVqfdSpfRMoO5SpfRQpPJSpfRFl+ZAlOFUqPVWqvhXq/lDlOIkd8RUp/VVqvlFl+ZPovFGmeZOo/FSpfQ/k+FEl+VDluRCleFXqvkmeMQkd8QneMUkd8VBleJDl+ZVqfgpe8lLn+0wg9FSpvUsf81Hm+o9kN4zhtU6jdtOovBQpfNPo/E2idc3i9k34wJEAAAANHRSTlMAIzryOf1QOZmW8vRQ8gXykDr1YBcNHvLar1ei2IGj9EzH5jFp4Cqb6IRH4LXX7NjQ4LZ3QYeKOAAAAbhJREFUWMPt1WtTgkAUgOE1NUNSSETFO97vt0QqU8vq//+l2LNoEzDAHqaxZnr9ds4+AyqjhPxE2aasL1qthS43s5y0ILfMcy25wHNVOWd+KyeHvnqvZLoq9cLZRM70KJcIY/Oe1tL5EFg/36mslMuKfH4PerCtWce21qurnCZKl03MWuBNb1ma+jVTNXsYdOMVdqwSZupMPcKpsXM+hvFR9cXKEWo65002V3yxBmeq7kUVFpovrr7RPD7WGiyqvg/1AM6M3JsRLAZ+j3j+FfJ4EhNs4/dlxYJwzA8/Ql6Ybf6xA+8gL8w2vxNnk5DHz3SBbdyPZ3nYF1h1a79LJuuCK8emPywDbU83qKZt67djtkE2U4lgoBPIHI/npIHHDRtPbria2DhtGHvDaHP+fVO0T5P0nnbLh+8AXRS/0HgxoIhYwmOJSB80XgwIia9O+J3GiwFJpIjHRVI80K45MaCIOIPHGZJ5ovFiQIAPGHywcaQr43Ecj+Mk/kzjxYD+Ln6g8WJAl8ApG4t4LFK8RuC19RIjX9kqxflHd8Jr2n2Kqw6gE0YlkiUeL8kKj1ckhcfWp9zB2g75BOiaIN0UFO9FAAAAAElFTkSuQmCC) no-repeat;
  background-size: 100% 100%
}

.input-bg input {
  width: 100%;
  height: 42px;
  padding-left: 50px;
  padding-right: 10px;
  font-size: 14px;
  background: none;
  border: none;
  box-sizing: border-box;
  line-height: 42px;
}

.check-box-wrap {
  text-align: right;
  padding-right: 20px;
}

.check-box {
  position: relative;
  display: inline-block;
  padding-left: 24px;
  font-size: 14px;
  line-height: 1.1;
}

.check-box:before {
  content: "";
  position: absolute;
  left: 0;
  display: inline-block;
  width: 17px;
  height: 17px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABABAMAAACwx9nGAAAAKlBMVEUVQGoVRWUeQGAcOXEVRmYWRWcVRGYWRmYWRWUUSGkVRGcYR2b////a5vExgWYoAAAADHRSTlMXMAIJT2h4gBAnYUEJePBIAAAAg0lEQVQ4y+3JoRECMRAF0H8ucUHj9jr4MVcAGM4CAg90ADYz10CKgAKYoYxtgV6oYFcyiH32QdQhgtF7Cqr3VTB5vxBN9WNQTUT2vhOD9yU+Pj4+/o/f9ovfXu+G274Qw+54MZwfhcjv58FwmjvR1hvTKxFTXpn6QtQGU6qCsTooEN8X7Zx5PqJTdCEAAAAASUVORK5CYII=) no-repeat;
  background-size: 100% 100%
}

.check-box.checked:before {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABACAMAAAB1NzTHAAAAV1BMVEVHcEwWRmYXQmUUSGkWRWcVRmYVRGYVQGoVRWUfP2EYR2ba5vH///8/o/+SyPiw1fVKqP52u/pvuPvN4fKl0PbS4/Jesf3B3PSBwPmJw/lUrf58vfqayvey4pWZAAAAC3RSTlMAgBEnZ094GDAIQT5skrEAAAFFSURBVEjH7dfJkoMgFAVQGgfENDjiFP//O5spVky0Cm42Xd3ejW5OyfB4FoSQbzDEhqOcW41z4zlFOTWeMvN6i4wxjBqeoDwxnBUoL9jF/xPvG5yrdREC5UrWQsDc4XqCeDUYLOYOWbqusbgdoZXv3bh7bOPu7tMdtO+jm/WElU1lsVhDqk4N8+t2OV2FFG2ni+q+09OBPuOjXeD2bdFe9An3s3zyzaE+5n6WOs1e90EHVi6bl88jl6Hn3R2Kx3D9aObwduFLW0fd+v1EwrqNR/pkuecQ2ax8iQq3ELWK7nXbBHRGoFVOm16hTju/1U9co3bfr+E+3x7VasR5X86HHsI7Uzkf/KSkvH7QF//FHMlf4Fmaf0UnT7ONp3l0Us9pUmofn6y0VyHKijIDUhb2IsYpSwogCbPXQM4pZUCo1cajIR/nB5UWoIIzcJwyAAAAAElFTkSuQmCC) no-repeat;
  background-size: 100% 100%;
}

.submit-btn {
  padding: 0 20px;
  margin-top: 20px;
}

.submit-btn button {
  width: 100%;
  height: 44px;
  border: none;
  background: url(../../static/img/login_btn2.png) no-repeat;
  background-size: 100% 100%;
}


.input-yzm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  box-sizing: border-box;
  position: relative;
  margin: 15px 20px;
}

.input-yzm:before {
  content: "";
  position: absolute;
  display: inline-block;
  top: 13px;
  left: 20px;
  width: 18px;
  height: 20px;
  background: url(data:image/png;base64,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) no-repeat;
  background-size: 100% 100%
}

.input-yzm input {
  border: none;
  flex: 1;
  height: 42px;
  border-radius: 24px;
  padding-left: 50px;
  font-size: 14px;
  line-height: 42px;
  background-color: #dae6f1;
}

.input-yzm .image-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  width: 200rpx;
  height: 38px;
}

.input-yzm image {
  max-width: 100%;
  height: 100%;
}

.check-box1 {
  position: relative;
  display: inline-block;
  font-size: 14px;
  padding-left: 24px;
  line-height: 1.1
}


.check-box1:before {
  content: "";
  position: absolute;
  left: 0;
  display: inline-block;
  width: 17px;
  height: 17px;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABABAMAAACwx9nGAAAAKlBMVEUVQGoVRWUeQGAcOXEVRmYWRWcVRGYWRmYWRWUUSGkVRGcYR2b////a5vExgWYoAAAADHRSTlMXMAIJT2h4gBAnYUEJePBIAAAAg0lEQVQ4y+3JoRECMRAF0H8ucUHj9jr4MVcAGM4CAg90ADYz10CKgAKYoYxtgV6oYFcyiH32QdQhgtF7Cqr3VTB5vxBN9WNQTUT2vhOD9yU+Pj4+/o/f9ovfXu+G274Qw+54MZwfhcjv58FwmjvR1hvTKxFTXpn6QtQGU6qCsTooEN8X7Zx5PqJTdCEAAAAASUVORK5CYII=) no-repeat;
  background-size: 100% auto;
}

.check-box1:before {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABACAMAAAB1NzTHAAAAV1BMVEVHcEwWRmYXQmUUSGkWRWcVRmYVRGYVQGoVRWUfP2EYR2ba5vH///8/o/+SyPiw1fVKqP52u/pvuPvN4fKl0PbS4/Jesf3B3PSBwPmJw/lUrf58vfqayvey4pWZAAAAC3RSTlMAgBEnZ094GDAIQT5skrEAAAFFSURBVEjH7dfJkoMgFAVQGgfENDjiFP//O5spVky0Cm42Xd3ejW5OyfB4FoSQbzDEhqOcW41z4zlFOTWeMvN6i4wxjBqeoDwxnBUoL9jF/xPvG5yrdREC5UrWQsDc4XqCeDUYLOYOWbqusbgdoZXv3bh7bOPu7tMdtO+jm/WElU1lsVhDqk4N8+t2OV2FFG2ni+q+09OBPuOjXeD2bdFe9An3s3zyzaE+5n6WOs1e90EHVi6bl88jl6Hn3R2Kx3D9aObwduFLW0fd+v1EwrqNR/pkuecQ2ax8iQq3ELWK7nXbBHRGoFVOm16hTju/1U9co3bfr+E+3x7VasR5X86HHsI7Uzkf/KSkvH7QF//FHMlf4Fmaf0UnT7ONp3l0Us9pUmofn6y0VyHKijIDUhb2IsYpSwogCbPXQM4pZUCo1cajIR/nB5UWoIIzcJwyAAAAAElFTkSuQmCC) no-repeat;
  background-size: 100% auto;
}
</style>