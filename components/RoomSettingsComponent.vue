<template>
  <view class="room-settings-container">
    <!-- 头部信息 - 在所有模式下都显示 -->
    <view class="room-info-section">
      <u-cell-group style="background-color: #fff">
        <u-cell>
          <view slot="icon">
            <u-image radius="4" @click="chooseAndUploadImage" :showLoading="true" :src="avatar" mode="aspectFill" width="55" height="55">
              <template v-slot:loading>
                <u-loading-icon color="#0087b4"></u-loading-icon>
              </template>
            </u-image>
          </view>
          <view slot="title" class="Personal-conten-datatitle">
            <view class="Personal-conten-datatitle-1">房间号：{{ account.roomid }}</view>
            <view class="Personal-conten-datatitle-1">到期时间：{{ account.expiryDate }}</view>
            <view class="Personal-conten-datatitle-1">当前账号：{{ account.username }}</view>
          </view>
        </u-cell>
      </u-cell-group>
    </view>

    <!-- 设置菜单 -->
    <view class="settings-menu-section">
      <u-cell-group style="background-color: #fff; margin-top: 20rpx;">
        <u-cell title="游戏设置" :isLink="true" @click="gotoGameSet()"></u-cell>
        <u-cell title="消息设置" :isLink="true" @click="msgsetTo()"></u-cell>
        <u-cell title="修改密码" :isLink="true" @click="gotoModifypwd()"></u-cell>
        <u-cell title="通知铃声" :isLink="true" @click="gotoSound()"></u-cell>
      </u-cell-group>

      <u-cell-group style="background-color: #fff; margin-top: 20rpx;">
        <u-cell title="刷新房号" :isLink="true" @click="refreshNo()"></u-cell>
      </u-cell-group>
    </view>

    <!-- 配置项列表 -->
    <view class="config-list-section">
      <u-cell-group style="background-color: #fff; margin-top: 20rpx;" v-if="configInfo.switch">
        <view v-for="(item, index) in configInfo.switch" :key="index">
          <u-cell :title="item.name" :value="item.value == 1 ? '开启' : '关闭'" :isLink="true" @click="tips(item)">
            <view slot="right-icon" @tap.stop.prevent>
              <u-switch @change="switchChange($event, item)" :activeValue="1" :inactiveValue="0" size="18" activeColor="#0087B4FF" inactiveColor="#ccc" v-model="item.value"></u-switch>
            </view>
          </u-cell>
        </view>
      </u-cell-group>

      <u-cell-group style="background-color: #fff; margin-top: 20rpx;" v-if="configInfo.input">
        <view v-for="(item, index) in configInfo.input" :key="index">
          <u-cell :title="item.name" :value="item.value" :isLink="true" @click="showInput(item, index)">
            <view slot="right-icon" @tap.stop.prevent>
              <u-icon name="question-circle" color="#ccc" size="18" @click="tips(item)"></u-icon>
            </view>
          </u-cell>
        </view>
      </u-cell-group>
    </view>

    <!-- 刷新房号弹窗 -->
    <u-modal :show="isShowReresh" title="刷新房号" :showConfirmButton="false" :closeOnClickOverlay="false">
      <view class="refresh-title">刷新房号</view>
      <view class="refresh-tips">刷新房号后，之前的房号将失效，会员需要重新获取房号进入房间</view>
      <view class="refresh-con">
        <u-input :focus="nofocus" placeholder="请输入新房号" v-model="refreshValue"></u-input>
      </view>
      <view style="display: flex; margin-top: 40rpx">
        <u-button @click="isShowReresh = false" class="btncon">取消</u-button>
        <u-button class="btncon" @click="doRefreshNo()">确定</u-button>
      </view>
    </u-modal>

    <!-- 输入弹窗 -->
    <u-modal :show="isShowInput" :title="currentItem.name" :showConfirmButton="false" :closeOnClickOverlay="false">
      <view class="refresh-title">{{ currentItem.name }}</view>
      <view class="refresh-tips">{{ currentItem.remark }}</view>
      <view class="refresh-con">
        <u-input :focus="focus" :placeholder="'请输入' + currentItem.name" v-model="inputValue"></u-input>
      </view>
      <view style="display: flex; margin-top: 40rpx">
        <u-button @click="isShowInput = false" class="btncon">取消</u-button>
        <u-button class="btncon" @click="saveInput()">确定</u-button>
      </view>
    </u-modal>

    <!-- 提示弹窗 -->
    <u-modal :show="tipsShow" title="说明" :showConfirmButton="false" :closeOnClickOverlay="true" @close="tipsShow = false">
      <view class="refresh-title">说明</view>
      <view class="refresh-tips" v-for="(item, index) in msgMap[currentKey]" :key="index">
        {{ item.content }}
      </view>
      <view style="display: flex; margin-top: 40rpx; justify-content: center;">
        <u-button @click="tipsShow = false" class="btncon">知道了</u-button>
      </view>
    </u-modal>
  </view>
</template>

<script>
export default {
  name: 'RoomSettingsComponent',
  mixins: [uni.$mymixin],
  props: {
    // 是否为弹窗模式
    isPopupMode: {
      type: Boolean,
      default: false
    },
    // 返回URL
    backUrl: {
      type: String,
      default: "agent/gamehall/hall"
    }
  },
  data() {
    return {
      tipsShow: false,
      currentKey: '',
      msgMap: {
        roomName: [{type: 'text', content: '群主房间显示的名字(会员不会看到该名字)'}],
        roomNickname: [{type: 'text', content: '聊天室内会员看到的群主昵称'}],
        roomNotice: [{type: 'text', content: '设置公告后玩家进入房间，可以在游戏大厅顶部看到滚动公告内容'}],
        chatroomNicknameLength: [{type: 'text', content: '控制聊天室消息中会员的昵称显示长度，比如设置为2，用户昵称是[张三丰]，那么在聊天室内则会显示为[张三]'}],
        lowScoreNoBillMessage: [{type: 'text', content: '设置后将不会发送分数低于设置的值的会员积分，比如设置为100，那么结算后如果会员的积分低于100，则不会出现在结算后的积分核对账单中(设置0则不限制)'}],
        wrongAttemptsAllowed: [{type: 'text', content: '用于限制会员下分时的下分密码可错次数，若会员下分时输入的密码错误次数超过系统设置的次数，系统则会限制该会员来确保会员的财产安全。强烈建议所有会员都启用下分密码(下分密码启用路径：会员个人中心-安全设置-下分密码)'}],
        passwordAttemptsAllowed: [{type: 'text', content: '用于限制群主子账号连续登录时的密码可错次数，超过系统设置的次数后，系统则会停用该子账号'}],
        wordBetWarning: [{type: 'text', content: '设置后单注下注金额大于或等于预警值将会通知群主(设置0则不预警)'}],
        bigWinningWarning: [{type: 'text', content: '设置后会员单注中奖金额大于或等于预警值将会通知群主(设置0则不预警)'}],
        groupJoinReview: [{type: 'text', content: '开启后新会员入群需要群主审核，关闭则可以直接进群'}],
        creditChAndGrpJoinSound: [{type: 'text', content: '开启后有会员上下分或进群，会有提示音播报，关闭则不播报提示音'}],
      },
      configInfo: {},
      account: {},
      avatar: '',
      isShowReresh: false,
      refreshValue: '',
      nofocus: false,
      isShowInput: false,
      currentItem: {},
      currentIndex: 0,
      inputValue: '',
      focus: false,
      headImageDomain: ''
    }
  },
  mounted() {
    this.initAvatar();
    this.getConfigInfo();
  },
  methods: {
    // 初始化头像
    initAvatar() {
      this.headImageDomain = uni.getStorageSync('headImageDomain');
      let aurl = uni.getStorageSync('avatar');
      if (aurl) {
        this.avatar = this.headImageDomain + aurl;
      } else {
        this.avatar = '/static/img/room_bg.2c58cefc.png';
      }
    },
    
    // 获取配置信息
    getConfigInfo() {
      this.$u.api.agent.getConfigInfo({}).then(res => {
        this.configInfo = res.data.configInfo;
        this.account = res.data.account;
        // 如果API返回了头像，则更新头像
        if (res.data.account.roomAvatar) {
          this.avatar = res.data.account.roomAvatar;
        }
      });
    },
    
    // 选择并上传头像
    chooseAndUploadImage() {
      if (this.isPopupMode) {
        this.$u.toast('弹窗模式下暂不支持上传头像');
        return;
      }
      
      uni.chooseImage({
        count: 1,
        success: (res) => {
          const tempFilePaths = res.tempFilePaths;
          uni.uploadFile({
            url: this.$u.http.config.baseURL + '/agent/uploadAvatar',
            filePath: tempFilePaths[0],
            name: 'file',
            header: {
              'Authorization': uni.getStorageSync('token')
            },
            success: (uploadRes) => {
              const data = JSON.parse(uploadRes.data);
              if (data.status === 200) {
                this.avatar = this.headImageDomain + data.data.url;
                uni.setStorageSync('avatar', data.data.url);
                this.$u.toast('头像上传成功');
              } else {
                this.$u.toast(data.msg || '上传失败');
              }
            },
            fail: () => {
              this.$u.toast('上传失败');
            }
          });
        }
      });
    },
    
    // 刷新房号
    refreshNo() {
      this.isShowReresh = true;
      this.$nextTick(() => {
        this.nofocus = true;
      });
    },
    
    // 执行刷新房号
    doRefreshNo() {
      if (!this.refreshValue.trim()) {
        this.$u.toast('请输入新房号');
        return;
      }
      
      this.$u.api.agent.refreshRoomNo({roomid: this.refreshValue}).then(res => {
        this.isShowReresh = false;
        this.refreshValue = '';
        this.getConfigInfo();
        this.$u.toast(res.msg);
      });
    },
    
    // 保存输入
    saveInput() {
      this.isShowInput = false;
      if (this.currentItem.value == this.inputValue) {
        this.$u.toast('您的设置未有变更');
        return;
      }
      
      this.$u.api.agent.saveConfig({key: this.currentItem.key, value: this.inputValue}).then(res => {
        this.configInfo.input[this.currentIndex].value = this.inputValue;
        this.$u.toast(res.msg);
      });
    },
    
    // 开关变更
    switchChange(event, item) {
      this.$u.api.agent.saveConfig({key: item.key, value: event}).then(res => {
        this.$u.toast(res.msg);
      });
    },
    
    // 显示提示
    tips(item) {
      this.currentKey = item.key;
      this.tipsShow = true;
    },
    
    // 显示输入框
    showInput(item, index) {
      this.currentItem = item;
      this.currentIndex = index;
      this.inputValue = item.value;
      this.isShowInput = true;
      this.$nextTick(() => {
        this.focus = true;
      });
    },
    
    // 跳转到修改密码
    gotoModifypwd() {
      if (this.isPopupMode) {
        this.$emit('navigate', 'agent/common/modifypwd');
      } else {
        uni.$utils.jump('agent/common/modifypwd');
      }
    },
    
    // 跳转到游戏设置
    gotoGameSet() {
      if (this.isPopupMode) {
        this.$emit('navigate', 'agent/roomset/gameset');
      } else {
        uni.$utils.jump('agent/roomset/gameset');
      }
    },
    
    // 跳转到消息设置
    msgsetTo() {
      if (this.isPopupMode) {
        this.$emit('navigate', 'agent/roomset/msgset');
      } else {
        uni.$utils.jump('agent/roomset/msgset');
      }
    },
    
    // 跳转到声音设置
    gotoSound() {
      if (this.isPopupMode) {
        this.$emit('navigate', 'agent/roomset/soundset');
      } else {
        uni.$utils.jump('agent/roomset/soundset');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.room-settings-container {
  height: 100%;
  background-color: #f5f5f5;
}

.room-info-section {
  margin-bottom: 20rpx;
}

.settings-menu-section {
  // 菜单样式
}

.config-list-section {
  // 配置列表样式
}

.refresh-title {
  padding-bottom: 15px;
  text-align: center;
  font-size: 15px;
  color: #606266;
  border-bottom: 1px solid #e5e5e5;
}

.refresh-tips {
  padding-top: 10px;
  padding-bottom: 15px;
  font-size: 14px;
  color: #606266;
}

.refresh-con {
  display: flex;
  align-items: center;
}

.Personal-conten-datatitle {
  color: #181818;
  overflow: hidden;
}

.Personal-conten-datatitle-1 {
  font-size: 28rpx;
  line-height: 40rpx;
  margin-bottom: 10rpx;
}

.btncon {
  flex: 1;
  margin: 0 10rpx;
}
</style>
