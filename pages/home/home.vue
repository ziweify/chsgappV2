<template>
  <view class="layout">
    <view class="home" :style="{'paddingTop':winobj.statusBarHeight+'px'}">
      <view class="header">
        <view class="avatar-box">
          <view class="avatar">
            <u-image radius="4" :showLoading="true" :src="avatar" mode="aspectFill" width="45" height="45">
              <template v-slot:loading>
                <u-loading-icon color="#0087b4"></u-loading-icon>
              </template>
            </u-image>
          </view>
          <view class="user">
            <view class="user-name">{{ nicname }}</view>
            <view class="user-id">ID:{{ username }}</view>
          </view>
        </view>
        <view class="set-box">
          <button class="setting" @click="personamessage">个人设置</button>
          <button class="logout" @click="showlogout">安全退出</button>
        </view>
      </view>
      <view class="main">
        <view class="main-room">
          <button :class="active1 == 'fjh' ? 'active':''" @click="showInput(1)">房间号</button>
          <button :class="active1 == 'tjm' ? 'active':''" @click="showInput(2)">推荐码</button>
        </view>
        <view class="main-input">
          <view class="main-input-box" v-show="maininputbox == 'maininputbox' ? true:false">
            <view class="password-input">
              <input v-model="roomid" @input="handleInput" ref="cpassword" maxlength="6" type="tel" class="vcode_value">
<!--              <input type="text" password="" style="position: absolute; z-index: -1; border: none; opacity: 0; width: 0px; height: 0px;">-->
              <view class="vcode_value_box">
                <input v-model="roomidarr[0]" type="number" maxlength="1">
                <input v-model="roomidarr[1]" type="number" maxlength="1">
                <input v-model="roomidarr[2]" type="number" maxlength="1">
                <input v-model="roomidarr[3]" type="number" maxlength="1">
                <input v-model="roomidarr[4]" type="number" maxlength="1">
                <input v-model="roomidarr[5]" type="number" maxlength="1">
              </view>
            </view>
          </view>
          <view class="sharebtn"  v-show="maininputbox == 'sharebtn' ? true:false">
            <input type="text" placeholder="请输入房间推荐码" maxlength="8">
          </view>
        </view>
        <view class="login-btn" @click="gamehallTo"></view>
        <view class="history-room">
          <view class="history-room-title">
            <view>房间历史：</view>
            <view>
              <u-icon color="#fff" size="22" name="info-circle" @click="open1"></u-icon>
            </view>
          </view>
          <view  class="history-room-list">
            <view @longpress="handleLongPress(item)" v-for="(item,index) in roomlist" class="history-room-item" @click="gamehallTo1(item)">
              <view class="room-avatar">
<!--                <image v-if="!item.roomAvatar" src="/static/img/room_bg.2c58cefc.png"></image>
                <image v-if="item.roomAvatar" :src="item.roomAvatar" lazy="loaded"></image>-->
                <u-image v-if="item.roomAvatar" loadingIcon="/static/img/loading.gif" :showLoading="true" :src="item.roomAvatar" width="60" height="60"></u-image>
                <u-image v-if="!item.roomAvatar" src="/static/img/room_bg.2c58cefc.png" width="60" height="60"></u-image>
              </view>
              <view class="room-no">{{ item.roomid }}</view>
              <view class="room-name">{{ item.roomName }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <u-toast ref="uToast" />
    <u-modal confirm-text="确定" :show="islogoutshow" @confirm="dologout" @cancel="islogoutshow = !islogoutshow" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">是否退出登陆？</view>
    </u-modal>
    <u-modal :show="show" @confirm="delroom" @cancel="show = !show" :content="content" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">{{ content }}</view>
    </u-modal>
  </view>
</template>
<script>
import tabbar from "@/uni_modules/uview-ui/libs/config/props/tabbar";

export default {
  data() {
    return {
      maininputbox:"maininputbox",
      active1:"fjh",
      fjmInput:false,
      codeInput:true,
      roomlist:[],
      avatar:"",
      username:"",
      nicname:"",
      show: false,
      title: '',
      content: '',
      cid:0,
      button: [{text: '取消',},{text: '确定',fontColor: '#ee0a24'}],
      roomidarr:['','','','','',''],
      roomid:"",
      type:1,
      islogoutshow:false,
      headImageDomain:'',
      logintype:0
    };
  },
  onLoad() {
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.loadRoomList();
    //判断平台类型
    if (this.$u.os() === 'android' || this.$u.os() === 'ios') {
      this.logintype = 1;
    } else if (this.$u.os() == 'h5') {
      this.logintype = 2;
    }
  },
  computed:{
    winobj(){
      return this.$u.sys();
    }
  },
  methods: {
    handleInput(event){//
      const inputValue = event.target.value;
      if(inputValue){
        this.roomidarr = ['','','','','',''];
        let arr = inputValue.split("");
        for (let i = 0;i < arr.length;i++){
          this.roomidarr[i] = arr[i];
        }
      }else{
        this.roomidarr = ['','','','','',''];
      }
    },
    delroom(res){
      let that = this;
      this.$u.api.member.delRoomhistory({id:that.cid}).then(res => {
        this.show = false;
        that.loadRoomList();
      }).catch(err => {
        uni.$utils.showToast(err);
      });
    },
    handleLongPress(item){
      this.cid = item.id;
      this.content = "是否删除"+item.roomid+"房间历史记录？";
      this.show = true;
    },
    open1() {
      this.$refs.uToast.show({
        message: '长按房间头像，即可删除历史记录',
      })
    },
    gamehallTo1(item){
      uni.showLoading({title:"加载中"});
      this.$u.api.member.enterroom({roomid:item.roomid,type:1,logintype:this.logintype}).then(res => {
        uni.hideLoading();
        uni.$utils.jump('pages/gamehall/gamehall','reLaunch');
      }).catch(err => {
        uni.showToast({title:err,icon: 'none'});
      });
    },
    gamehallTo(){
      if(!this.roomid){
        uni.showToast({title:"请输入正确的房间号码",icon: 'none'});
        return;
      }
      let that = this;
      uni.showLoading({title:"加载中"});
      this.$u.api.member.enterroom({roomid:that.roomid,type:that.type,logintype:that.logintype}).then(res => {
        uni.hideLoading();
        uni.$utils.jump('pages/gamehall/gamehall','reLaunch');
      });
    },
    personamessage(){
      uni.setStorageSync('backUrl','pages/home/home');
      uni.$utils.jump('pages/member/personamessage');
    },
    showlogout(){
      this.islogoutshow = !this.islogoutshow;
    },
    dologout(){
      this.$u.api.common.logout().then(res => {
        uni.removeStorageSync("token")
        uni.removeStorageSync("userInfo")
        uni.removeStorageSync("expiresTime")
        uni.reLaunch({
          url:'/pages/common/login'
        })
      }).catch(err => {
        uni.showToast({title:err,icon: 'none'})
      });
    },
    showInput(i){
      if (i==1) {
        this.active1 = 'fjh'
        this.maininputbox = 'maininputbox'
      } else {
        this.active1 = 'tjm'
        this.maininputbox  = 'sharebtn'
      }
      this.type = i;
    },
    loadRoomList(){
      let that = this;
      this.$u.api.member.getHistoryRoomList().then(res => {
        that.roomlist = res.data.roomlist;
        that.avatar = that.headImageDomain+res.data.avatar;
        that.nicname = res.data.nickname;
        that.username = res.data.username;
        uni.setStorageSync('avatar', res.data.avatar);
        uni.setStorageSync('nickname', res.data.nickname);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.password-input {
  position: relative;
  padding-top: 20px;
  overflow: hidden;
  display: flex;
  justify-content: center;
}

.vcode_value {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  background: none;
  opacity: 0;
  left: 0;
  z-index: 9999999;
}

.vcode_value_box {
  display: flex;
  width: 90%;
  align-items: center;
  justify-content: center;
}

.vcode_value_box input {
  width: 16.66666%;
  height: 42px;
  border-radius: 8px;
  font-size: 20px;
  text-align: center;
  box-sizing: border-box;
  background-color: transparent;
  border: none;
  color: #fff
}

.password .vcode_value_box input {
  background-color: #fff;
  color: #000;
  margin-left: 10rpx;
  border: 1px solid #c1c1c1;
}

.layout{
  width: 100%;
  height: 100%;
}

.home {
  width: 100%;
  height: 100%;
  background: url(../../static/img/bg.68d9ab3f.jpg) no-repeat;
  background-size: 100% 100%;
  font-size: 24rpx;
  flex-direction: column;
}

.header,.home {
  position: relative;
  display: flex;
  justify-content: space-between
}

.header {
  height: 72px;
  background: url(../../static/img/nav_bg.c454dbe6.png) no-repeat;
  background-position: bottom;
  background-size: 100% auto;
  padding: 0 20px 0 20px;
  box-sizing: border-box;
  .avatar-box{
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.avatar-box {
  display: flex
}

.avatar-box .avatar {
  background-color: #ccc;
  overflow: hidden;
  margin-right: 12rpx;
}

.avatar-box .user-name {
  color: #fff;
  font-size: 16px;
  max-width: 100px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  margin-top: 2px;
}

.avatar-box .user-id {
  color: #fff;
  font-size: 13px;
  margin-top: 5px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.set-box {
  display: flex;
  justify-content: center;
  align-items: center;
}

.set-box button {
  font-size: 12px;
  height: 30px;
  border-radius: 32rpx;
  padding-left: 27px;
  border: none;
  color: #fff;
  position: relative;
  box-sizing: border-box;
  padding-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.set-box button.setting {
  background: linear-gradient(0deg,#fd7e53,#fdbf43);
  margin-right: 10px;
}

.set-box button.setting:before {
  content: "";
  position: absolute;
  left: 10px;
  top: 9px;
  width: 12px;
  height: 13px;
  display: inline-block;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAwCAMAAABdTmjTAAAAUVBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////9jlXTzAAAAGnRSTlMARJxN07zx68BrVhUNNSx7r4zMg9yo4pZeczc6kycAAAE0SURBVEjHpZbbloIwDEVPgQIFFOWm7v//0HkorhkVKVmTJ9rsrjbNaYL0YY0H8I3SdvKs5k8JtM34Y1m7xz5KAIpxLAAoH1/RPBJVkKRQxXX5Jnq+xL2vXRx31zi+nD/QLdf78qd92fTlYKu5IYYTPg8XYsiDe07Mcbfb5kW1t+id47BIpGBNUyFJHmDaTW4zAXjJAYwpEYwATjMQ0pIJwKwFpgP60gSLSvBHYA+lKqjfHS4E9z5XQ7UB9wvA0h+A2+Gp5qFNwsWv9osU3ANk93sG0CfgEmgkqQHKfdgBWfzMALcLB2DVdP6a2v/CpmOYArRdnSkptnRLfQVQ9YdUtyNRk/hNz8r0YE2lQPXRIlNL6o6Wr85cGG0l11bMjW3C1oCMrc3YNI3t2NboJampyy+/ED82bzjkWTBLXgAAAABJRU5ErkJggg==);
  background-size: 100% 100%
}

.set-box button.logout {
  background: linear-gradient(0deg,#4487bf,#65d8dc)
}

.set-box button.logout:before {
  content: "";
  position: absolute;
  left: 10px;
  top: 9px;
  width: 12px;
  height: 13px;
  display: inline-block;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAyCAMAAAAtFKi+AAAAdVBMVEVHcEz////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////qLaloAAAAJnRSTlMAUDtq8NzTWATj6AoRSBhhsjVwIcAn+MWIl6ecu4H1eC1ByqCPrb2TR7oAAAGcSURBVEjH1ZXJloIwEEULCCDQCKLgPOv9/0/sBShKEoyrPl07cuqSml5KxGRBtJjLF3YClt8ABaAmXwAxkPw/4GcU8KdD/7WKaiswKWnigT+wsAIxgP/WWIDQCngAh5eoZgB49hzuAFH/nQIcx5K+AKweX0eAzWiVMgXQzWPWAOmHPuQvP60GCZgbVwK0eSfvCVmA+TNPX7/AOBq7R+VvgDLoIR0AHsBJRCJgPQByrQwi2QGoRMQQkcgOCsMZ1w7QBX8+aUf7TuiAylxFErZA6KQqv6uO3gWLzQC+AfwecAvJ60M6/LgAQZ80Mxdg1ckYIHABFsBWRJZA6eCfNbTt3wNN5pYCUxGpHWMKny9RZBhN3XKAuH+mApcLHisjAZoPragA9q+3RZ/nqB/qEuA+4j9V7zLLDgA3q/88HD51OQBXywrxFdqEVgBEvjVf0sFKOQLAWlN3vgRA1abVDLA9v+6xonXnMjVULumQcFt5fn06x/tSdUdX81rcYjZVWFVbmtxXY0Mwu6Xv7ovgk3wn+WoXKYD0sglq+QP7BQXvSBH6tFyjAAAAAElFTkSuQmCC);
  background-size: 100% 100%
}

.main {
  flex: 1;
  overflow-y: auto
}

.main-room {
  display: flex;
  justify-content: space-evenly;
  text-align: center;
  margin-top: 40rpx;
}

.main-room button {
  margin: 0;
  padding-right: 10px;
  width: 190rpx;
  height: 70rpx;
  border-radius: 32rpx;
  font-size: 32rpx;
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAABBCAMAAABYbu5jAAABs1BMVEVHcEwleKMleKMkd6MkeKN7rsf//wAAAAAkd6OAn78leKMgdZ8ld6Mid6F7rccAAP97rseAtcp7rsgleKMkd6ImeaYgYJ8jd6EleKMleKR6r8d7rsl8rsh7rsckeKMkd6MkeKQieKQneKQggJ8ld6QkeKQieJ8neaMkd6MwgKgoeqQkd6J8rsgkeKM5hat4rMZ9rcUkbZIkeKMkeKN5rMYpeqUleKMjeKN7rMd5rch5rcV8rcd9rch7rsh9rcp8rsh8qMdAia91qsZIjrFambp7rsd8rsd7rsd9r8l8rsh7rcd8rsh7rsl7rsgjd6MgeZ8keaMkd6YjeKQkeKIkd6Mld6MjdqMjeKMleKMkbbZ8rsgkd6QleKJjnr17rsh7rsh8rMZ8r8d7rch7sMpwp8Jinr17rMZWlrh5rcd8rMdWl7hxp8J7r8Z6q8d7rch7rcYleKN8rsg0gakmeKMneaRfnLthnbxqosAre6UpeqVLj7NupcJ7rcc/iK55rMZYl7g4g6s4hKsxf6hzqMQ7haxWl7g8hqxHjbFVlrdnob9Xl7hUlbdTlbZinr09hq1jnr08hq2pSG2lAAAAcHRSTlMAU/GN0vwBAfwI9xhvPNMB8hg8/k0oCEmy+0mN/tPux8Y12gjtajX42vi+vse57vw1B5v3KJu5bLNUVE5q/DXGKdpvvpv4s+5s2rv3m750KGlNc9Np/mxI+wfSa7P7dP51aWpNufxs906O97lsSXBwVVXLvQAAAkpJREFUGBnVwWN7IwEUBtA3nJk4qW3btrW2bdyZmDWXP3mbtk85afZb554DM9S12W3tDbWVFrpSlsrahnabvQ2pmKHC+ripgzSko6nHiv8k5OQ+IM3Jy80RkJ6gM5JGGXUC0igrJQ0rLcNlsg0iaZpoqEBK142kebezkEKmnhjQ34SqGyKxIN6BimsZxMTdW7igKoPYyKjCOZkiMSJm4owsPbGiz8IpFUZixpiNEwZix4Bj1SKxI1bjiFBCDJUIOKQjlnQ4IBiJJaOApBxi6j6SnhBTudhnzSOm8qwA7hFbPQC6ia1u4KGF2LJkw06M2WEjxmzoIsa6UE+M1aOcGCtHMTFWjBpirAYhYiyEOmKsDs3EWDPGiLExTBBjE5gkxiYx7iO2fOPw/Ca2/nogvSe2PknAGy8x5f0M4F2cmIp/AeB+Sky9dWNfr0IsKb1IyvcTS/58JAmOFWJoxSHgQH/QS+x4g3045GyMEDuRRieOtLYoxIzS0opjBdEwsRKOFuCE5AgQK4FHEk7pdC0TI3uuTpwxMPST2PgxNIBzBguXiYnlwkFc8KIwECYGwoHnz6DilSmqkOYpUdNLqHrtSkRI4yIJ1wekMOqQg6ukYatBuWgUKUkFpphfIY1S/DHTRwmXGR6RY3/iXtIcb/xXTB4ZRhpCf5Esr29u+UhDfFub67Jc1CcgPefXaZMsJ3Z3tjfWQj66Ur7Q2sb2zm5Clk3T+U6cZ4Yq9+z8gqwhC/OzbqgwIxXJ831xaW5mSr5SUzNzS4vfPBLUmf8BhVd+Ff8SDKoAAAAASUVORK5CYII=);
  border: none;
  color: #fff;
  background-size: 100% 100%!important;
  line-height: 70rpx;
}

.main-room button.active {
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL4AAABBCAMAAABYbu5jAAACZFBMVEVHcExJksNEicFIjMAAAP9IlcVfy9cA//9An7///wBWs89l2dxi0tpk19xEh79HjsJgzNhl1NleyNZUr81j1NtLl8Vj1dti0dpFh79l19xFib9Vss5KlcRgv99Kk8RgytRGisBUrc1Gi8FfyddIk8RKl8VXtM9fydZHjcFFjcFFicBLj8FJksNgz9lg399Mm8Zhztlk1dtdxdVGib9l1dxl2NxEiL9NncdTrM1Xt9Bl2Nxk19tGiMBm1tZm2d1l2N1k2Nxm19xt29tl2Nxl19tNnsZbxNVEicBFicBHhbhEiL9av9JSpshRpsxZuNFEiL1SqcxPo8lgv79avdJbwNNHmcJSqMtOoclZu9BAgL9FiL5Fhr9EiL9Ehr9EiL9Mm8Vi0dhfyNdgzdtMmMVm0t9izthh0dhGjsNj0dlj0tpj09pHj8Ni0dljz9dIjsJexdVdzdNIkMJGj8JGjMFk1dtJj8Fl191j0dpgzNlk09pj1NtIkMNGjMBl19tk19xgv9VOn8dbwtRbwtNXuNFPo8lavdNOn8hYt9FcuMxavtNRpMlVr81TrMxWtM9Urs1Ws89Vsc5XttBTq8xSqctYt9BRqMtYudFRpspZutFQpcpOoMhavdJavNJQo8lbv9NPoslNnMZcw9VNncdcwtROn8hbwNNMmsZMmcVextZdxdVLl8Vex9ZKlcRfytdfydZKlsVgy9dJlMRJksNgzdhhzthhz9lIkMJIkcNi0NlIj8Ji0dlHjsJHjcFi0tpGjMFj09pj1NpGi8Fk1dtGisBk1ttFicBk19tFiMBl19xFiL9l2NxEh7+xjS4dAAAAi3RSTlMA8ik1ATXTAQgB7vfy0vj88jXH+Pz8jfzu7sf4jgjTNY7u/PxOx9qO8k7TKfxqCNP8x9NUSdraSdq+vrNJGTxvm2wH97mzSbP8Gb5scDxwbb65CPf8GZxsPAj4nDxwu1ROU01UKE5pamrT02v+dHVUKf5p01R0U3QoKU1q0/v8GPyzs5v3ufycGbn3J4pVQAAAAhRJREFUGBnVwWNbpFEABuCnmjrvZNu2bdv22ra3tW3btm38qW2qK77T7LfOc9/QQl1+dk5uepKbxZ8JZeGWlJ6bk50PfbRQkZVXWPBLIgWFeVn4TyIxY8MP6WzMSBQwTKy0+iYpq+UCBtjFfZFYnB3GE+3s+Elqjs7R0Gv6nI/Sm7sGeqy1fE/AcjJUzXZ5Q8FlJlSsesVi/gKMEfWcSBRGmRH7jEjsVIyw2PYpFdvVGMbL7BEZMy8MCblPJwSDfAIe0AnwwQBhf5eQvUC/KbcoLUIfEX+bUryATvFlUsXQ2XyV1Bb06mm8TqpxF4CKC7QqAGw/S2s3UN9wjlZDPVpPEWtF9Qli1dh6jNhOpB0mlobg/cSCYX6QmDk8DhHzwF5qcDhAzAF++4j5IfUIsVTUHiVWi+bjxJpReZJYJapOE6uCsu08rT0KUHeRVh2AljO0WgA0bbpGakcTehVdIVUEnZRLpFKgo4m5QSlGgz7TblKahH4i6A6hIIEBpk4P6TiZYpDnPTqeGKJ4PybjrWCYCKMnVIwiMEJg5EsikYEYZd0LIvMwxsLXLJasgIpZNm8p2CyFqrDQdwRCw6CH8foP0ltmDL0UX//PUvP3VTAeE/evEnM3gQGahPDvkgpP0MAwkVlS+lM6pSWZAqNpoaqsprv9t0Tau2vKoEILfdo6uzrKk12t/04oa9fk8o6uzjao0/4D1sl2bu5w1U4AAAAASUVORK5CYII=)
}

.main-input {
  margin-top: 40rpx;
  padding: 0 30rpx;
}

.main-input .main-input-box {
  height: 160rpx;
  background: url(../../static/img/input_bg.17104cb6.png);
  background-size: 100% auto
}

.login-btn {
  margin: 40rpx auto 60rpx auto;
  width: 630rpx;
  height: 84rpx;
  background: url(../../static/img/go_room.74bb2ee4.png);
  background-size: 100% auto
}

.sharebtn {
  width: 630rpx;
  margin: 0 auto;
  height: 100rpx;
}
.sharebtn .input-placeholder {
  color: #ffffff!important;
}
.sharebtn input {

  width: 100%;
  height: 100%;
  border-radius: 60rpx;
  padding-left: 40rpx;
  font-size: 34rpx;
  box-shadow: inset 0 -2rpx 0 0 #4f89a8;
  border: none;
  background: #1c5675;
  color: #ffffff!important;
  box-sizing: border-box;
}



.sharebtn input::placeholder {
  color: #fff
}

.history-room .history-room-title {
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 32rpx;
  margin: 0 30rpx;
}

.history-room .history-room-title .van-icon {
  font-size: 36rpx;
}

.history-room-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 40rpx;
  max-height: 600rpx;
  overflow: auto
}

.history-room-list .history-room-item {
  width: 25%;
  text-align: center;
  color: #fff;
  margin-bottom: 40rpx;
  font-size: 28rpx;
}

.history-room-list .history-room-item .room-avatar {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
  position: relative;
  margin: 0 auto
}

.history-room-list .history-room-item .room-avatar image {
  display: block;
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
}

.history-room-list .history-room-item .room-no {
  padding: 5px 0 5px;
}
</style>
