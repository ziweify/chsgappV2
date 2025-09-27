<template>
  <view class="layout">
    <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
      <template #top>
        <TsCustom :backUrl="backUrl" :isBack="true" title="子账号列表">
          <block slot='right'>
            <view @click="showAddDialog()">添加子账号</view>
          </block>
        </TsCustom>
        <view style="padding: 30rpx;background: #fff;">
          <u-search @custom="search" :showAction="true" v-model="query.username" :clearabled="true" bgColor="#f5f9ff" placeholder="请输入玩家用户名/昵称" shape="square" @search="search"></u-search>
        </view>
        <view class="list-h" style="margin-top: 15rpx;">
              <view class="span" style="flex:2;">在线</view>
              <view class="span" style="flex:6;">用户名</view>
              <view class="span" style="flex:4;">口令</view>
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
            <view :class="item.userreg.status == 2 ? 'color-jinyong' : item.userreg.status == 0 ? 'color-zhengchang' : 'color-dongjie'">{{ item.userreg.username }}</view>
            <view>{{ item.userreg.name }}</view>
          </view>
          <view class="list-p-item" style="flex:4;color: rgb(156, 156, 156);">
            <view v-if="item.userreg.google_open == 1" class="color-zhengchang">开启</view>
            <view v-if="item.userreg.google_open == 0" class="color-jinyong">关闭</view>
          </view>
          <view class="list-p-item" style="flex:4;" @click="statusClickShow(item)">
            <u-button v-if="item.userreg.status == 0" class="btn-zhengchang" text="正常" size="small" plain shape="circle"></u-button>
            <u-button v-if="item.userreg.status == 2" class="btn-jinyong" text="禁用" size="small" plain shape="circle"></u-button>
          </view>
         <view class="list-p-item list-p3 color-zhengchang" style="flex:3;"><view @click="actionClicShow(item)" class="tiem">更多</view></view>
        </view>
      </view>
    </z-paging>
    <u-action-sheet :title="actionTitle" :actions="actionList" @select="actionClick" :show="actionShow" :closeOnClickOverlay="true" @close="actionShow = false"></u-action-sheet>
    <u-action-sheet :title="statusTitle" :actions="statusAcList" @select="statusClick" :show="statusShow" :closeOnClickOverlay="true" @close="statusShow = false"></u-action-sheet>
    <u-modal confirm-text="确定" :show="showDialog" @confirm="delUser" @cancel="showDialog = !showDialog" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">确定要删除用户{{ctiem && ctiem.userreg.username}}？</view>
    </u-modal>
    <u-modal :show="isEditShow" :showConfirmButton="false" :closeOnClickOverlay="true" @close="isEditShow = false">
      <view style="width: 100%;height: 100%;">
        <view class="refresh-title">{{editMode === 'add' ? '添加' : '修改'}}子账号</view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>登录账号：</view>
          <u-input v-if="editMode === 'add'" type="text" placeholder="请输入6-16位登录账号" v-model="addData.username"></u-input>
          <view v-else>{{addData.username}}</view>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>账号昵称：</view>
          <u-input type="text" placeholder="请输入1-8位昵称" v-model="addData.name"></u-input>
        </view>
        <view class="refresh-tips" style="display: flex;align-items: center;">
          <view>登录密码：</view>
          <u-input type="password" :placeholder="editMode == 'add' ? '请输入8-16位登录密码' : '留空则不修改'" v-model="addData.password"></u-input>
        </view>
        <view style="display: flex;margin-top:40rpx">
          <u-button @click="isEditShow = !isEditShow" class="btncon">取消</u-button>
          <u-button class="btncon" @click="addson()">确定</u-button>
        </view>
      </view>
    </u-modal>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      list:[],
      backUrl:"agent/manage/umanage",
      query:{
        username:'',
        zero:1,
        sort:'username',
        room_status:'-1'
      },
      addData:{
        username:'',
        password:'',
        name:'',
      },
      title1:'默认排序',
      title2:'全部',//{name:'信息',key:'info'},
      actionList:[{name:'删除',key:'del'},{name:'修改',key:'mod'},{name:'重置错误次数',key:'resetcs'},{name:'重置谷歌口令',key:'resetkl'}],
      actionShow:false,
      actionTitle:'',
      statusShow:false,
      statusTitle:'',
      statusAcList:[{name:'正常',key:'0',color:'#0087B4'},{name:'停用',key:'2',color:'#ff4d4d'}],
      operUserid:0,//当前操作的用户id
      ctiem:null,
      showDialog:false,
      isEditShow:false,
      cmoney:'',
      shangxiafenList:[{name:'上分',key:'1'},{name:'下分',key:'2'}],
      shangxiafenType:'1',
      editMode:'add',
    };
  },
  methods: {
    showAddDialog(){
      this.isEditShow = !this.isEditShow;
      this.editMode = 'add';
      //重置数据
      this.addData = {
        username:'',
        password:'',
        name:'',
      };
    },
    addson(){
      if(this.editMode == 'add') {
        //校验
        if (!this.addData.username) {
          this.$u.toast('请输入登录账号');
          return;
        }
        if (!this.addData.name) {
          this.$u.toast('请输入账号昵称');
          return;
        }
        if (!this.addData.password) {
          this.$u.toast('请输入登录密码');
          return;
        }
        uni.showLoading({title: '加载中...'});
        this.$u.api.agent.addSonAccount(this.addData).then(res => {
          this.isEditShow = false;
          uni.hideLoading();
          this.$u.toast(res.msg);
          this.$refs.paging.reload();
        });
      }else if (this.editMode == 'edit') {
        //校验
        if (!this.addData.name) {
          this.$u.toast('请输入账号昵称');
          return;
        }
        uni.showLoading({title: '加载中...'});
        let postdata = {
          userid:this.ctiem.userid,
          name:this.addData.name,
          password:this.addData.password,
        };
        this.$u.api.agent.updateSonAccount(postdata).then(res => {
          this.isEditShow = false;
          uni.hideLoading();
          this.$u.toast(res.msg);
          this.$refs.paging.reload();
        });
      }
    },
    showDialogPanel(){
      this.showDialog = true;
    },
    delUser(){
      this.$u.api.agent.delSonAccount({userid:this.ctiem.userid}).then(res => {
        this.$u.toast(res.msg);
        this.$refs.paging.reload();
      });
    },
    statusClickShow(item){
      let str = '';
      if(item.userreg.status == 2){
        str = '禁用';
      }else if(item.userreg.status == 0){
        str = '正常';
      }
      this.statusShow = true;
      this.statusTitle = '更改状态-'+item.userreg.username+'-('+str+')';
      this.operUserid = item.userid;
    },
    statusClick(item){
      this.$u.api.agent.updateSonStatus({userid:this.operUserid,status:item.key}).then(res => {
        this.$u.toast(res.msg);
        this.$refs.paging.reload();
      });
    },
    actionClicShow(item){
      this.actionShow = true;
      this.actionTitle = '操作-'+item.userreg.username;
      this.ctiem = item;
    },
    actionClick(item){
      if(item.key == 'info'){
        this.$u.toast('暂未开放');
      }else if(item.key == 'del'){
        this.showDialog = true;
      }else if(item.key == 'mod'){
        this.editMode = 'edit';
        this.isEditShow = true;
        this.addData = {
          username:this.ctiem.userreg.username,
          name:this.ctiem.userreg.name,
          password:'',
        };
      }else if(item.key == 'resetcs'){
        this.$u.api.agent.resetErrors({userid:this.ctiem.userid}).then(res => {
          this.$u.toast(res.msg);
        });
      }else if (item.key == 'resetkl') {
        this.$u.api.agent.resetGoogle({userid:this.ctiem.userid}).then(res => {
          this.$u.toast(res.msg);
          this.$refs.paging.reload();
        });
      }
    },
    change(){
      this.$refs.paging.reload();
    },
    selectSort(item,type){
      if(type == 1){
        this.query.sort = item.key;
        this.title1 = item.title;
      }else if(type == 2){
        this.query.room_status = item.key;
        this.title2 = item.title;
      }
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
    queryList(page, pageSize) {
      this.query.page = page;
      this.query.pageSize = pageSize;
      this.$u.api.agent.getSonAccountList(this.query).then(res => {
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
  font-size: 14px;
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

::v-deep .u-collapse-item__content__text{
  padding: 0 !important;
}
</style>
