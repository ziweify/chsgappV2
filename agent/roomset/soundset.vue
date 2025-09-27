<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" title="通知铃声"></TsCustom>
      <view class="flex-content">
        <view class="flex-list">
          <u-cell-group>
            <u-cell :stop="false" title="是否开启弹窗">
              <u-switch :activeValue="1" :inactiveValue="0" v-model="isReciveMsg" @change="switchChange($event)" :enableText="true" size="26" slot="value" activeColor="#0087B4FF" inactiveColor="#ccc"></u-switch>
            </u-cell>
            <u-cell title="私聊" :value="chatSound.label" :isLink="true" @click="showSound(1)"></u-cell>
            <u-cell title="上分申请" :value="upSound.label" :isLink="true" @click="showSound(2)"></u-cell>
            <u-cell title="下分申请" :value="downSound.label" :isLink="true" @click="showSound(3)"></u-cell>
            <u-cell title="入群申请" :value="joinSound.label" :isLink="true" @click="showSound(4)"></u-cell>
          </u-cell-group>
        </view>
      </view>
    </view>
    <u-picker :defaultIndex="defaultIndex" @confirm="confirm" confirmColor="#0087b4" :show="show" :columns="sounds" :closeOnClickOverlay="true" @close="show = false" @cancel="show = false" keyName="label" @change="soundChange"></u-picker>
  </view>
</template>

<script>

export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      audio:null,
      volume:1,
      backUrl:'agent/roomset/roomset',
      show:false,
      sounds:[],
      sounds1:[],
      sounds2:[],
      sounds3:[],
      sounds4:[],
      chatSound:{},
      upSound:{},
      downSound:{},
      joinSound:{},
      type:1,//1私聊，2上分申请，3下分申请，4入群申请
      defaultIndex:[1],
      isReciveMsg:1
    };
  },
  onLoad() {
    let isReciveMsg = uni.getStorageSync('isReciveMsg');
    if(parseInt(isReciveMsg)  == 0){
      this.isReciveMsg = 0;
    }
    //初始化查询本地声音
    let chatSound = uni.getStorageSync('chatSound');
    if(chatSound){
      this.chatSound = JSON.parse(chatSound);
    }else{
      this.chatSound = {label:'默认',id:1};
    }
    let upSound = uni.getStorageSync('upSound');
    if(upSound){
      this.upSound = JSON.parse(upSound);
    }else{
      this.upSound = {label:'默认',id:13};
    }
    let downSound = uni.getStorageSync('downSound');
    if(downSound){
      this.downSound = JSON.parse(downSound);
    }else{
      this.downSound = {label:'默认',id:13};
    }
    let joinSound = uni.getStorageSync('joinSound');
    if(joinSound){
      this.joinSound = JSON.parse(joinSound);
    }else{
      this.joinSound = {label:'默认',id:2};
    }

    let volume = uni.getStorageSync('volume');
    if(volume){
      this.volume = volume;
    }
    this.audio = uni.createInnerAudioContext();
    this.audio.volume = this.volume;

    //初始化私聊
    this.sounds1 = [{label:'无',id:0},{label:'默认',id:1}];
    this.sounds2 = [{label:'无',id:0},{label:'默认',id:13}];
    this.sounds3 = [{label:'无',id:0},{label:'默认',id:13}];
    this.sounds4 = [{label:'无',id:0},{label:'默认',id:2}];
    for(let i=2;i<=14;i++){//循环1-14
      this.sounds1.push({label:'提示音'+(i-1),id:i});
      this.sounds2.push({label:'提示音'+(i-1),id:i});
      this.sounds3.push({label:'提示音'+(i-1),id:i});
      this.sounds4.push({label:'提示音'+(i-1),id:i});
    }
    this.sounds2.push({label:'提示音15',id:15});
    this.sounds3.push({label:'提示音15',id:16});
    this.sounds4.push({label:'提示音15',id:17});
  },
  mounted() {

  },
  methods: {
    switchChange(e){
      uni.setStorageSync('isReciveMsg',e);
    },
    confirm(e){
      this.show = false;
      let json = e.value[0];
      if(this.type === 1){//私聊
        uni.setStorageSync('chatSound',JSON.stringify(json));
        this.chatSound = json;
      }else if(this.type === 2){//上分申请
        uni.setStorageSync('upSound',JSON.stringify(json));
        this.upSound = json;
      }else if(this.type === 3){//下分申请
        uni.setStorageSync('downSound',JSON.stringify(json));
        this.downSound = json;
      }else if(this.type === 4) {//入群申请
        uni.setStorageSync('joinSound', JSON.stringify(json));
        this.joinSound = json;
      }
      this.$u.toast('设置成功');
    },
    soundChange(e){
      let id = e.value[0].id;
      this.audio.src = "/static/wav/s"+id+".mp3";
      this.audio.play();
    },
    showSound(type){
      this.type = type;
      this.sounds = [this['sounds'+type]];
      let temparr = this.sounds[0];
      //循环找默认值
      for(let i=0;i<temparr.length;i++){
        if(type === 1){
          if(temparr[i].id === this.chatSound.id){
            this.defaultIndex = [i];
            break;
          }
        }else if(type === 2){
          if(temparr[i].id === this.upSound.id){
            this.defaultIndex = [i];
            break;
          }
        }else if(type === 3){
          if(temparr[i].id === this.downSound.id){
            this.defaultIndex = [i];
            break;
          }
        }else if(type === 4){
          if(temparr[i].id === this.joinSound.id){
            this.defaultIndex = [i];
            break;
          }
        }
      }
      this.show = true;
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
