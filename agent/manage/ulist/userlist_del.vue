<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="用户列表">
          <block slot='right'>
            <view @click="showAddDialog()">注册账号</view>
          </block>
        </TsCustom>
        <!-- 游戏选择和排序选择 -->
        <view class="filter-section">
          <view class="filter-row">
            <!-- 排序选择 -->
            <select v-model="query.sort" class="custom-select" @change="handleSortChange">
              <option v-for="(item, index) in sortList" :key="index" :value="item.key">{{item.title}}</option>
            </select>

            <!-- 状态选择 -->
            <select v-model="query.room_status" class="custom-select" @change="handleStatusChange">
              <option v-for="(item, index) in statusList" :key="index" :value="item.key">{{item.title}}</option>
            </select>
          </view>
        </view>
        <view style="padding: 30rpx;background: #fff;">
          <u-search @custom="search" :showAction="true" v-model="query.username" :clearabled="true" bgColor="#f5f9ff" placeholder="请输入玩家用户名/昵称" shape="square" @search="search"></u-search>
        </view>
        <!-- <view style="padding: 30rpx;display: flex;background: #fff;">
          <view style="display: flex;align-items: center;flex: 1">
            <text>是否显示0分用户</text>
            <u-switch @change="change()" v-model="query.zero" :activeValue="1" :enableText="true" :inactiveValue="0" activeColor="#0087B4FF" inactiveColor="#ccc" size="22" style="margin-left: 20rpx;"></u-switch>
          </view>
          <view><u-button @click="showDialogPanel" color="#0087B4FF" size="small" text="一键清空0分用户"></u-button></view>
        </view> -->
        <view class="list-h" style="margin-top: 15rpx;">
              <view class="span" style="flex:2;">在线</view>
              <view class="span" style="flex:6;">用户名</view>
              <view class="span" style="flex:4;">余额</view>
              <view class="span" style="flex:4;">状态</view>
              <view class="span" style="flex:3;">操作</view>
            </view>
      </template>
      <view class="list">
        <view v-for="(item,index) in list" :key="index" class="list-p">
          <view class="list-p-item" style="flex:2;">
            <view v-if="item.online == 1" class="zaixian">在线</view>
            <view v-else class="liuxian">离线</view>
          </view>
          <view class="list-p-item" style="flex:6;">
            <view style="display: flex;align-items: center;justify-content: center;">
              <view :class="item.room_status == 0 ? 'color-jinyong' : item.room_status == 1 ? 'color-zhengchang' : item.room_status == 2 ? 'color-jinyan' : 'color-dongjie'">{{ item.username }}</view>
              <view v-if="item.is_exclusive == 1" class="exclusive-tag">专</view>
            </view>
            <view>{{ item.name }}</view>
          </view>
          <view class="list-p-item" style="flex:4;color: rgb(156, 156, 156);">{{ item.kmoney }}</view>
          <view class="list-p-item" style="flex:4;" @click="statusClickShow(item)">
            <u-button v-if="item.room_status == 1" class="btn-zhengchang" text="正常" size="small" plain shape="circle"></u-button>
            <u-button v-if="item.room_status == 0" class="btn-jinyong" text="禁用" size="small" plain shape="circle"></u-button>
            <u-button v-if="item.room_status == 2" class="btn-jinyan" text="禁言" size="small" plain shape="circle"></u-button>
            <u-button v-if="item.room_status == 3" class="btn-dongjie" text="冻结" size="small" plain shape="circle"></u-button>
          </view>
         <view class="list-p-item list-p3 color-zhengchang" style="flex:3;"><view @click="actionClicShow(item)" class="tiem">更多</view></view>
        </view>
      </view>
    </z-paging>
    <u-action-sheet :title="actionTitle" :actions="actionList" @select="actionClick" :show="actionShow" :closeOnClickOverlay="true" @close="actionShow = false"></u-action-sheet>
    <u-action-sheet :title="statusTitle" :actions="statusAcList" @select="statusClick" :show="statusShow" :closeOnClickOverlay="true" @close="statusShow = false"></u-action-sheet>
    <u-modal confirm-text="确定" :show="showDialog" @confirm="delAllZeroUser" @cancel="showDialog = !showDialog" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">确定要删除所有0分用户？</view>
    </u-modal>
    <u-modal :show="isShangxiafenShow" :showConfirmButton="false" :closeOnClickOverlay="true" @close="isShangxiafenShow = false">
      <view style="width: 100%;height: 100%;">
        <view class="refresh-title">{{ ctiem && ctiem.username }}-上下分操作</view>
        <view class="refresh-tips" style="display: flex;align-items: center;margin-top: 10rpx;">
          <view>类型选择：</view>
          <u-radio-group v-model="shangxiafenType" placement="row">
            <u-radio style="margin-left: 20rpx" v-for="(item, index) in shangxiafenList"
                :key="index"
                :label="item.name"
                :name="item.key">
            </u-radio>
          </u-radio-group>
        </view>
        <view class="refresh-con">
          <u-input type="number" placeholder="请输入金额" v-model="cmoney"></u-input>
        </view>
        <view style="display: flex;margin-top:40rpx">
          <u-button @click="isShangxiafenShow = !isShangxiafenShow" class="btncon">取消</u-button>
          <u-button class="btncon" @click="doshxiafen()">确定</u-button>
        </view>
      </view>
    </u-modal>
    <u-modal :show="isRegisterShow" :showConfirmButton="false" :closeOnClickOverlay="true" @close="isRegisterShow = false">
      <view style="width: 100%;height: 100%;">
        <view class="refresh-title">注册账号</view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>登录账号：</view>
          <view style="flex: 1;display: flex;align-items: center;">
            <u-input placeholderStyle="font-size: 26rpx;" style="flex: 1;" type="text" placeholder="请输入6-16位登录账号" v-model="registerData.username"></u-input>
            <u-button style="width: 40rpx;margin-left: 10rpx;" @click="generateRandomUsername" size="small" type="primary">随机</u-button>
          </view>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>用户昵称：</view>
          <u-input placeholderStyle="font-size: 26rpx;" type="text" placeholder="请输入1-8位昵称（可选）" v-model="registerData.name"></u-input>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>登录密码：</view>
          <view style="flex: 1;display: flex;align-items: center;">
            <u-input placeholderStyle="font-size: 26rpx;" style="flex: 1;" type="text" placeholder="请输入登录密码" v-model="registerData.password"></u-input>
            <u-button style="width: 40rpx;margin-left: 10rpx;" @click="generateRandomPassword" size="small" type="primary">随机</u-button>
          </view>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>是否忽略飞单：</view>
          <u-radio-group v-model="registerData.ignore_outbet" placement="row">
            <u-radio style="margin-left: 20rpx" :label="'否'" :name="0"></u-radio>
            <u-radio style="margin-left: 20rpx" :label="'是'" :name="1"></u-radio>
          </u-radio-group>
        </view>
        <view style="display: flex;margin-top:40rpx">
          <u-button @click="isRegisterShow = !isRegisterShow" class="btncon">取消</u-button>
          <u-button class="btncon" @click="doRegister()">确定</u-button>
        </view>
      </view>
    </u-modal>
    <u-modal :show="isEditShow" :showConfirmButton="false" :closeOnClickOverlay="true" @close="isEditShow = false">
      <view style="width: 100%;height: 100%;">
        <view class="refresh-title">修改用户信息</view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>登录账号：</view>
          <view>{{editData.username}}</view>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>用户昵称：</view>
          <u-input placeholderStyle="font-size: 26rpx;" type="text" placeholder="请输入1-8位昵称" v-model="editData.name"></u-input>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>登录密码：</view>
          <view style="flex: 1;display: flex;align-items: center;">
            <u-input placeholderStyle="font-size: 26rpx;" style="flex: 1;" type="text" placeholder="留空则不修改" v-model="editData.password"></u-input>
            <u-button style="width: 40rpx;margin-left: 10rpx;" @click="generateEditPassword" size="small" type="primary">随机</u-button>
          </view>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>是否忽略飞单：</view>
          <u-radio-group v-model="editData.ignore_outbet" placement="row">
            <u-radio style="margin-left: 20rpx" :label="'否'" :name="0"></u-radio>
            <u-radio style="margin-left: 20rpx" :label="'是'" :name="1"></u-radio>
          </u-radio-group>
        </view>
        <view style="display: flex;margin-top:40rpx">
          <u-button @click="isEditShow = !isEditShow" class="btncon">取消</u-button>
          <u-button class="btncon" @click="doEditUser()">确定</u-button>
        </view>
      </view>
    </u-modal>
    <u-modal :show="isLinkShow" :showConfirmButton="false" :closeOnClickOverlay="true" @close="isLinkShow = false">
      <view style="width: 100%;height: 100%;">
        <view class="refresh-title">生成链接-{{ctiem && ctiem.username}}</view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>有效类型：</view>
          <u-radio-group v-model="linkData.type" placement="row">
            <u-radio style="margin-left: 20rpx" v-for="(item, index) in linkTypeList"
                :key="index"
                :label="item.name"
                :name="item.key">
            </u-radio>
          </u-radio-group>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>游戏选择：</view>
          <select v-model="linkData.gid" class="game-select">
            <option value="" disabled>请选择游戏</option>
            <option v-for="(item, index) in gameList" :key="index" :value="item.gid">{{item.gname}}</option>
          </select>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;" v-if="linkData.type === 'count'">
          <view>有效次数：</view>
          <u-input placeholderStyle="font-size: 26rpx;" type="number" placeholder="请输入有效次数" v-model="linkData.count"></u-input>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;" v-if="linkData.type === 'time'">
          <view>有效时间：</view>
          <view style="flex: 1;display: flex;align-items: center;">
            <u-input placeholderStyle="font-size: 26rpx;" style="flex: 1;" type="number" placeholder="请输入有效时间" v-model="linkData.days"></u-input>
            <view style="margin-left: 10rpx;color: #666;font-size: 26rpx;">天</view>
          </view>
        </view>
        <view style="display: flex;margin-top:40rpx">
          <u-button @click="isLinkShow = !isLinkShow" class="btncon">取消</u-button>
          <u-button class="btncon" @click="doGenerateLink()">确定</u-button>
                 </view>
       </view>
     </u-modal>
     
     <!-- 链接复制对话框 -->
     <u-modal :show="showLinkCopyDialog" :showConfirmButton="false" :closeOnClickOverlay="true" @close="showLinkCopyDialog = false">
       <view style="width: 100%;height: 100%;">
         <view class="refresh-title">链接已生成</view>
         <view class="refresh-tips" style="display: flex;align-items: center;">
           <view>生成的链接：</view>
         </view>
         <view class="refresh-con" style="margin-top: 10rpx;">
           <view class="link-display" @longpress="copyLinkToClipboard(generatedLink)">
             <text class="link-text">{{ generatedLink }}</text>
             <view class="link-tip">长按复制链接</view>
           </view>
         </view>
         <view style="display: flex;margin-top:40rpx">
           <u-button @click="showLinkCopyDialog = false" class="btncon">关闭</u-button>
           <u-button @click="copyLinkToClipboard(generatedLink)" class="btncon" style="background-color: #0087b4; color: #fff;">复制链接</u-button>
         </view>
       </view>
     </u-modal>
   </view>
 </template>

<script>
import clipboardUtils from '@/common/clipboardUtils.js';

export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      list:[],
      backUrl:"agent/manage/umanage",
      query:{
        username:'',
        zero:1,
        sort:'id',
        room_status:'-1'
      },
      registerData:{
        username:'',
        password:'',
        name:'',
        ignore_outbet: 0,
      },
      sortList:[{title:'默认排序',key:'id'},{title:'分数排序',key:'kmoney'},{title:'在线排序',key:'online'}],
      statusList:[{title:'全部',key:'-1'},{title:'正常',key:'1'},{title:'停用',key:'0'},{title:'禁言',key:'2'}],
      actionList:[{name:'信息',key:'info'},{name:'私聊',key:'chat'},{name:'修改',key:'mod'},{name:'上下分',key:'km'}],
      actionShow:false,
      actionTitle:'',
      statusShow:false,
      statusTitle:'',
      statusAcList:[{name:'正常',key:'1',color:'#0087B4'},{name:'停用',key:'0',color:'#ff4d4d'},{name:'禁言',key:'2',color:'#ff9f4d'}],
      operUserid:0,//当前操作的用户id
      ctiem:null,
      showDialog:false,
      isShangxiafenShow:false,
      isRegisterShow:false,
      isEditShow:false,
      isLinkShow:false,
      cmoney:'',
      editData:{
        username:'',
        password:'',
        name:'',
        ignore_outbet: 0,
      },
      linkData:{
        userid:'',
        gid:'',
        type:'count', // count: 次数, time: 时间
        count:1,
        days:1,
      },
             linkTypeList:[{name:'次数',key:'count'},{name:'时间',key:'time'}],
       shangxiafenList:[{name:'上分',key:'1'},{name:'下分',key:'2'}],
       shangxiafenType:'1',
       gameList:[],
       generatedLink: '', // 生成的链接
       showLinkCopyDialog: false // 是否显示链接复制对话框
    };
  },
  onLoad(){
    this.getGameListByIfok();
  },
  methods: {
    getGameListByIfok(){
      this.$u.api.common.getGameListByIfok({}).then(res => {
        this.gameList = res.data.list;
      });
    },
    showAddDialog(){
      this.isRegisterShow = true;
      // 重置注册数据
      this.registerData = {
        username:'',
        password:'',
        name:'',
        ignore_outbet: 0,
      };
    },
    generateRandomUsername(){
      // 预设的前缀数组，30个前缀
      const prefixes = [
        'ah', 'bh', 'ch', 'dh', 'eh', 'fh', 'gh', 'hh', 'ih', 'jh',
        'kh', 'lh', 'mh', 'nh', 'oh', 'ph', 'qh', 'rh', 'sh', 'th',
        'uh', 'vh', 'wh', 'xh', 'yh', 'zh', 'aa', 'bb', 'cc', 'dd'
      ];
      
      // 随机选择一个前缀
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      // 生成6位随机数字
      let randomNumbers = '';
      for (let i = 0; i < 6; i++) {
        randomNumbers += Math.floor(Math.random() * 10);
      }
      
      // 组合前缀和数字
      this.registerData.username = randomPrefix + randomNumbers;
    },
    generateRandomPassword(){
      // 预设的前缀数组，30个前缀
      const prefixes = [
        'ah', 'bh', 'ch', 'dh', 'eh', 'fh', 'gh', 'hh', 'ih', 'jh',
        'kh', 'lh', 'mh', 'nh', 'oh', 'ph', 'qh', 'rh', 'sh', 'th',
        'uh', 'vh', 'wh', 'xh', 'yh', 'zh', 'aa', 'bb', 'cc', 'dd'
      ];
      
      // 随机选择一个前缀
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      // 生成6位随机数字
      let randomNumbers = '';
      for (let i = 0; i < 6; i++) {
        randomNumbers += Math.floor(Math.random() * 10);
      }
      
      // 组合前缀和数字
      this.registerData.password = randomPrefix + randomNumbers;
    },
    generateEditPassword(){
      // 预设的前缀数组，30个前缀
      const prefixes = [
        'ah', 'bh', 'ch', 'dh', 'eh', 'fh', 'gh', 'hh', 'ih', 'jh',
        'kh', 'lh', 'mh', 'nh', 'oh', 'ph', 'qh', 'rh', 'sh', 'th',
        'uh', 'vh', 'wh', 'xh', 'yh', 'zh', 'aa', 'bb', 'cc', 'dd'
      ];
      
      // 随机选择一个前缀
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      // 生成6位随机数字
      let randomNumbers = '';
      for (let i = 0; i < 6; i++) {
        randomNumbers += Math.floor(Math.random() * 10);
      }
      
      // 组合前缀和数字
      this.editData.password = randomPrefix + randomNumbers;
    },
    doGenerateLink(){
      // 校验游戏选择
      if(!this.linkData.gid){
        this.$u.toast('请选择游戏');
        return;
      }
      
      // 根据有效类型进行不同的校验
      if(this.linkData.type === 'count'){
        // 校验有效次数
        if(!this.linkData.count || this.linkData.count < 1){
          this.$u.toast('有效次数必须大于0');
          return;
        }
      } else if(this.linkData.type === 'time'){
        // 校验有效时间
        if(!this.linkData.days || this.linkData.days <= 0){
          this.$u.toast('有效时间必须大于0天');
          return;
        }
      }
      
      uni.showLoading({title:'生成中...'});
      
      // 根据有效类型构建API参数
      let apiParams = {
        userid: this.linkData.userid,
        gid: this.linkData.gid,
        type: this.linkData.type
      };
      
      if(this.linkData.type === 'count'){
        apiParams.count = this.linkData.count;
      } else if(this.linkData.type === 'time'){
        apiParams.count = this.linkData.days;
      }
      
             // 调用生成链接API
       this.$u.api.agent.generateLink(apiParams).then(res => {
         this.isLinkShow = false;
         uni.hideLoading();
         //this.$u.toast(res.msg);
         // 将生成的链接保存到 data 中，让用户手动复制
         if(res.data) {
           this.generatedLink = res.data;
           this.showLinkCopyDialog = true;
         }
       }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '生成链接失败，请重试');
      });
    },
    doEditUser(){
      // 校验昵称长度（如果有输入）
      if(this.editData.name && (this.editData.name.length < 1 || this.editData.name.length > 8)){
        this.$u.toast('用户昵称长度应为1-8位');
        return;
      }
      
      // 校验密码长度（如果有输入）
      if(this.editData.password && (this.editData.password.length < 6 || this.editData.password.length > 16)){
        this.$u.toast('登录密码长度应为6-16位');
        return;
      }
      
      uni.showLoading({title:'修改中...'});
      
      const postdata = {
        userid: this.ctiem.userid,
        name: this.editData.name,
        password: this.editData.password,
        ignore_outbet: this.editData.ignore_outbet,
      };
      
      // 调用修改API
      this.$u.api.agent.updateAccount(postdata).then(res => {
        this.isEditShow = false;
        uni.hideLoading();
        this.$u.toast(res.msg);
        this.$refs.paging.reload();
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '修改失败，请重试');
      });
    },
    doRegister(){
      // 校验登录账号
      if(!this.registerData.username){
        this.$u.toast('请输入登录账号');
        return;
      }
      
      // 校验账号长度
      if(this.registerData.username.length < 6 || this.registerData.username.length > 16){
        this.$u.toast('登录账号长度应为6-16位');
        return;
      }
      
      // 校验密码（必填）
      if(!this.registerData.password){
        this.$u.toast('请输入登录密码');
        return;
      }
      
      // 校验密码长度
      if(this.registerData.password.length < 6 || this.registerData.password.length > 16){
        this.$u.toast('登录密码长度应为6-16位');
        return;
      }
      
      // 校验昵称长度（如果有输入）
      if(this.registerData.name && (this.registerData.name.length < 1 || this.registerData.name.length > 8)){
        this.$u.toast('用户昵称长度应为1-8位');
        return;
      }
      
      uni.showLoading({title:'注册中...'});
      
      // 调用注册API
      this.$u.api.agent.registerAccount(this.registerData).then(res => {
        this.isRegisterShow = false;
        uni.hideLoading();
        this.$u.toast(res.msg);
        this.$refs.paging.reload();
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '注册失败，请重试');
      });
    },
    doshxiafen(){
      //校验金额，必须是数字
      if(!this.cmoney){
        this.$u.toast('请输入金额');
        return;
      }
      if(isNaN(this.cmoney)){
        this.$u.toast('请输入正确的金额');
        return;
      }
      uni.showLoading({title:'操作中...'});
      this.$u.api.agent.shangxiafen({userid:this.ctiem.userid,type:this.shangxiafenType,kmoney:this.cmoney}).then(res => {
        this.isShangxiafenShow = false;
        uni.hideLoading();
        this.$u.toast(res.msg);
        this.$refs.paging.reload();
      });
    },
    showDialogPanel(){
      this.showDialog = true;
    },
    delAllZeroUser(){
      this.$u.api.agent.delAllZeroUser().then(res => {
        this.$u.toast(res.msg);
        this.$refs.paging.reload();
      });
    },
    statusClickShow(item){
      let str = '';
      if(item.room_status == 0){
        str = '禁用';
      }else if(item.room_status == 1){
        str = '正常';
      }else if(item.room_status == 2){
        str = '禁言';
      }
      this.statusShow = true;
      this.statusTitle = '更改状态-'+item.username+'-('+str+')';
      this.operUserid = item.userid;
    },
    statusClick(item){
      this.$u.api.agent.modifyStatus({userid:this.operUserid,room_status:item.key}).then(res => {
        this.$u.toast(res.msg);
        this.$refs.paging.reload();
      });
    },
    actionClicShow(item){
      this.actionShow = true;
      this.actionTitle = '操作-'+item.username;
      this.ctiem = item;
      
      // 根据是否为专属账号动态设置操作选项
      if(item.is_exclusive == 1){
        // 专属账号显示所有选项包括修改
        this.actionList = [
          /* {name:'信息',key:'info'}, */
          {name:'生成链接',key:'link'},
          {name:'私聊',key:'chat'},
          {name:'修改',key:'mod'},
          {name:'上下分',key:'km'}
        ];
      } else {
        // 非专属账号不显示修改选项
        this.actionList = [
          /* {name:'信息',key:'info'}, */
          {name:'生成链接',key:'link'},
          {name:'私聊',key:'chat'},
          {name:'上下分',key:'km'}
        ];
      }
    },
    actionClick(item){
      if(item.key == 'info'){
        this.$u.toast('暂未开放');
      }else if(item.key == 'link'){
        this.isLinkShow = true;
        this.linkData = {
          userid: this.ctiem.userid,
          gid: '',
          type: 'count',
          count: 1,
          days: 1,
        };
      }else if(item.key == 'chat'){
        uni.setStorageSync("chatName",this.ctiem.username);
        uni.setStorageSync("chatUserid",this.ctiem.userid);
        uni.setStorageSync("backUrl","agent/manage/ulist/userlist");
        uni.$utils.jump("copage/custChat");
      }else if(item.key == 'mod'){
        this.isEditShow = true;
        this.editData = {
          username: this.ctiem.username,
          name: this.ctiem.name || '',
          password: '',
          ignore_outbet: this.ctiem.ignore_outbet || 0,
        };
      }else if(item.key == 'km'){
        this.cmoney = '';
        this.isShangxiafenShow = true;
      }
    },
    change(){
      this.$refs.paging.reload();
    },
    /**
     * 处理排序选择变化
     */
    handleSortChange() {
      this.$refs.paging.reload();
    },
    
    /**
     * 处理状态选择变化
     */
    handleStatusChange() {
      this.$refs.paging.reload();
    },
    search(){
      //为空提示
      /*if(!this.query.username){
        this.$u.toast('请输入用户名/昵称');
        return;
      }*/
      this.$refs.paging.reload();
    },
         // 使用增强的复制工具类复制链接到剪贴板
     async copyLinkToClipboard(link) {
       try {
         const success = await clipboardUtils.copyText(link, {
           showToast: true,
           toastDuration: 2000,
           enableVibration: true,
           fallbackToManual: true
         });
         
         if (success) {
           // 复制成功，显示成功提示
           uni.showToast({
             title: '链接已复制',
             icon: 'success'
           });
         }
         
       } catch (error) {
         console.error('复制失败:', error);
         // 复制失败时，显示错误提示
         uni.showToast({
           title: '复制失败，请手动复制',
           icon: 'none'
         });
       }
     },
    queryList(page, pageSize) {
      this.query.page = page;
      this.query.pageSize = pageSize;
      this.$u.api.agent.getUserList(this.query).then(res => {
        this.$refs.paging.complete(res.data.records);
      }).catch(res => {
        this.$refs.paging.complete(false);
      })
    },
  }

}
</script>

<style lang="scss" scoped>
.refresh-title{
  padding-bottom: 15px;
  text-align: center;
  font-size: 15px;
  color: #606266;
  border-bottom: 1px solid #e5e5e5;
}
.refresh-tips{
  padding-top: 10px;
  padding-bottom: 15px;
  font-size: 28rpx;
  color: #606266;
}
.refresh-con{
  display: flex;
  align-items: center;

}
.btncon:first-child {
  border: 1rpx solid #ccc;
  width: 46%;
}
.btncon:last-child {
  color: #fff;
  background-color: #0087b4;
  width: 46%;
}
//在线和离线样式，文本颜色不同，背景颜色不同
.zaixian{
  color: #0087b4;
  border: 0.05333rem solid #0087b4;
  border-radius: 0.10667rem;
  padding: 5rpx;
  font-size: 24rpx;
}
.liuxian{
  color: #ff4d4d;
  border: 0.05333rem solid #ff4d4d;
  padding: 5rpx;
  font-size: 24rpx;
  border-radius: 0.10667rem;
}
.btn-zhengchang {
  background-color: #e1f8ff!important;
  color: #0087b4 !important;
  border: 0.05333rem solid #0087b4;
  width: 120rpx;
}
.btn-jinyong{
  background-color: #ffe1e1!important;
  color: #ff4d4d !important;
  border: 0.05333rem solid #ff4d4d;
  width: 120rpx;
 }
.btn-jinyan{
  background-color: #fff1e1!important;
  color: #ff9f4d !important;
  border: 0.05333rem solid #ff9f4d;
  width: 120rpx;
}
//冻结换个颜色深一点的颜色
.btn-dongjie{
  background-color: #f1f1f1!important;
  color: #5e5e5e !important;
  border: 0.05333rem solid #5e5e5e;
  width: 120rpx;
}
.layout{
  height: 100%;
  width: 100%;
  background-color: #f1f1f1;
  display: flex;
  flex-direction: column;
}
.list-h {
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 2rpx solid #eee;
  background-color: #fff;
  height: 100rpx;
  font-weight: 400;
  color: #000000;
  font-size: 30rpx;
  .span{
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.list {
  background: #fff;
  .list-p {
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-bottom: 2rpx solid #eee;
    background-color: #fff;
    height: 100rpx;
    color: #5e5e5e;
    font-size: 28rpx;
    .list-p-item{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}
.color-jinyong {color: #fe0101}
.color-zhengchang {color: rgb(0, 135, 180)}
.color-jinyan {color: #ff9f4d}
.color-dongjie {color: #5e5e5e}

.exclusive-tag {
  background-color: #ff6b35;
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 6rpx;
  border-radius: 6rpx;
  margin-left: 8rpx;
  line-height: 1;
  font-weight: bold;
}

.game-select {
  flex: 1;
  padding: 15rpx 20rpx;
  background-color: #f5f9ff;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  color: #333;
  font-size: 26rpx;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04ODQuMTI4IDM0NC4wNjRsLTMzNC4wOCAzMzQuMDk2YTMyIDMyIDAgMCAxLTQ1LjI0OCAwbC0zMzQuMDk2LTMzNC4wOTZhMzIgMzIgMCAwIDEgNDUuMjQ4LTQ1LjI0OEw1MTIgNjAyLjI0bDMwNi4xNzYtMzAzLjQyNGEzMiAzMiAwIDEgMSA0NS4yNTYgNDUuMjQ4eiIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==");
  background-repeat: no-repeat;
  background-position: right 20rpx center;
  background-size: 24rpx;
  padding-right: 60rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-select:focus {
  border-color: #0087B4;
  background-color: #fff;
  box-shadow: 0 0 0 4rpx rgba(0, 135, 180, 0.1);
}

.game-select:hover {
  border-color: #0087B4;
  background-color: #fff;
}

/* 筛选区域样式 */
.filter-section {
  background: #fff;
  padding: 15rpx 30rpx;
  
  .filter-row {
    display: flex;
    gap: 15rpx;
    align-items: center;
  }
}

/* 自定义下拉选择样式 */
.custom-select {
  flex: 1;
  padding: 12rpx 16rpx;
  background-color: #f5f9ff;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  color: #333;
  font-size: 26rpx;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04ODQuMTI4IDM0NC4wNjRsLTMzNC4wOCAzMzQuMDk2YTMyIDMyIDAgMCAxLTQ1LjI0OCAwbC0zMzQuMDk2LTMzNC4wOTZhMzIgMzIgMCAwIDEgNDUuMjQ4LTQ1LjI0OEw1MTIgNjAyLjI0bDMwNi4xNzYtMzAzLjQyNGEzMiAzMiAwIDEgMSA0NS4yNTYgNDUuMjQ4eiIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==");
  background-repeat: no-repeat;
  background-position: right 16rpx center;
  background-size: 18rpx;
  padding-right: 48rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 56rpx;
  box-sizing: border-box;
}

.custom-select:focus {
  border-color: #0087B4;
  background-color: #fff;
  box-shadow: 0 0 0 4rpx rgba(0, 135, 180, 0.1);
}

.custom-select:hover {
  border-color: #0087B4;
  background-color: #fff;
}

 
 .link-display {
   width: 100%;
   padding: 20rpx;
   background-color: #f8f9fa;
   border: 2rpx solid #e9ecef;
   border-radius: 12rpx;
   text-align: center;
   cursor: pointer;
   transition: all 0.3s ease;
 }
 
 .link-display:active {
   background-color: #e9ecef;
   transform: scale(0.98);
 }
 
 .link-text {
   display: block;
   font-size: 28rpx;
   color: #333;
   word-break: break-all;
   line-height: 1.5;
   margin-bottom: 10rpx;
   font-family: monospace;
 }
 
 .link-tip {
   font-size: 24rpx;
   color: #666;
   font-style: italic;
 }
</style>
