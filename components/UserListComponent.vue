<template>
  <view class="user-list-component" :class="{ 'popup-mode': isPopupMode }">
    <!-- 非弹窗模式使用 z-paging -->
    <template v-if="!isPopupMode">
      <z-paging ref="paging" v-model="list" :show-empty-view-reload="true" safe-area-inset-bottom @query="queryList" :default-page-size="20">
        <template #top>
          <!-- 标题栏 (仅在独立页面模式显示) -->
          <TsCustom v-if="showHeader" :backUrl="backUrl" :isBack="true" title="用户列表" @back="handleBack">
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
          
          <!-- 搜索框 -->
          <view class="search-section" style="padding: 30rpx;background: #fff;">
            <u-search @custom="search" :showAction="true" v-model="query.username" :clearabled="true" bgColor="#f5f9ff" placeholder="请输入玩家用户名/昵称" shape="square" @search="search" @input="onSearchInput" @clear="onSearchClear"></u-search>
          </view>
          
          <!-- 列表头部 -->
          <view class="list-h" style="margin-top: 15rpx;">
            <view class="span" style="flex:2;">在线</view>
            <view class="span" style="flex:6;">用户名</view>
            <view class="span" style="flex:4;">余额</view>
            <view class="span" style="flex:4;">状态</view>
            <view class="span" style="flex:3;">操作</view>
          </view>
        </template>
        
        <!-- 用户列表 -->
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
    </template>
    
    <!-- 弹窗模式使用简单布局 -->
    <template v-else>
      <!-- 固定头部区域 -->
      <view class="popup-header-section">
        <!-- 标题栏 (仅在独立页面模式显示) -->
        <TsCustom v-if="showHeader" :backUrl="backUrl" :isBack="true" title="用户列表" @back="handleBack">
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
        
        <!-- 搜索框 -->
        <view class="search-section" style="padding: 15rpx;background: #fff;">
          <u-search @custom="search" :showAction="true" v-model="query.username" :clearabled="true" bgColor="#f5f9ff" placeholder="请输入玩家用户名/昵称" shape="square" @search="search" @input="onSearchInput" @clear="onSearchClear"></u-search>
        </view>
        
        <!-- 列表头部 -->
        <view class="list-h" style="margin: 0; padding: 10rpx 20rpx; background: #f8f9fa;">
          <view class="span" style="flex:2;">在线</view>
          <view class="span" style="flex:6;">用户名</view>
          <view class="span" style="flex:4;">余额</view>
          <view class="span" style="flex:4;">状态</view>
          <view class="span" style="flex:3;">操作</view>
        </view>
      </view>
      
      <!-- 现代化用户列表 -->
      <view class="modern-user-list">
        <!-- 空状态提示 -->
        <view v-if="list.length === 0" class="empty-state">
          <text class="empty-text">暂无用户数据</text>
        </view>
        
        <!-- 表格式用户项 -->
        <view v-for="(item,index) in list" :key="`user-${item.userid || item.id || index}`" class="table-user-item" @click="showUserInfo(item)">
          <!-- 在线状态列 -->
          <view class="online-column">
            <view class="avatar-circle" :class="item.online == 1 ? 'online' : 'offline'">
              <text class="avatar-text">{{item.username ? item.username.charAt(0).toUpperCase() : 'U'}}</text>
            </view>
            <view class="online-indicator" v-if="item.online == 1"></view>
          </view>
          
          <!-- 用户名列 -->
          <view class="username-column">
            <view class="username-row">
              <text class="username" :class="item.room_status == 0 ? 'status-disabled' : item.room_status == 1 ? 'status-normal' : item.room_status == 2 ? 'status-muted' : 'status-frozen'">
                {{item.username}}
              </text>
              <view v-if="item.is_exclusive == 1" class="exclusive-badge">专</view>
            </view>
            <text class="real-name">{{item.name}}</text>
          </view>
          
          <!-- 余额列 -->
          <view class="balance-column">
            <text class="balance-amount">¥{{item.kmoney}}</text>
          </view>
          
          <!-- 状态列 -->
          <view class="status-column">
            <view class="status-badge" :class="`status-${item.room_status}`" @click.stop="statusClickShow(item)">
              <text class="status-text">
                {{item.room_status == 1 ? '正常' : item.room_status == 0 ? '禁用' : item.room_status == 2 ? '禁言' : '冻结'}}
              </text>
            </view>
          </view>
          
          <!-- 操作列 -->
          <view class="action-column">
            <view class="more-btn" @click.stop="actionClicShow(item)">
              <text class="more-text">⋯</text>
            </view>
          </view>
        </view>
        
        <!-- 加载更多按钮 -->
        <view v-if="hasMore" class="load-more-modern" @click="loadMore">
          <text class="load-more-text">加载更多用户</text>
        </view>
      </view>
    </template>
    
    <!-- 操作菜单 -->
    <u-action-sheet :title="actionTitle" :actions="actionList" @select="actionClick" :show="actionShow" :closeOnClickOverlay="true" @close="actionShow = false"></u-action-sheet>
    
    <!-- 状态修改菜单 -->
    <u-action-sheet :title="statusTitle" :actions="statusAcList" @select="statusClick" :show="statusShow" :closeOnClickOverlay="true" @close="statusShow = false"></u-action-sheet>
    
    <!-- 删除0分用户确认对话框 -->
    <u-modal confirm-text="确定" :show="showDialog" @confirm="delAllZeroUser" @cancel="showDialog = !showDialog" confirmColor="#ee0a24" :showCancelButton="true">
      <view class="slot-content" style="padding:20rpx;">确定要删除所有0分用户？</view>
    </u-modal>
    
    <!-- 上下分对话框 -->
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
    
    <!-- 注册用户对话框 -->
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
    
    <!-- 编辑用户对话框 -->
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
    
    <!-- 生成链接对话框 -->
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
  name: 'UserListComponent',
  mixins: [uni.$mymixin],
  props: {
    // 是否显示标题栏
    showHeader: {
      type: Boolean,
      default: false
    },
    // 返回地址
    backUrl: {
      type: String,
      default: 'agent/manage/umanage'
    },
    // 是否为弹窗模式
    isPopupMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: [],
      originalList: [], // 保存原始完整数据
      filteredList: [], // 保存过滤后的数据
      searchTimer: null, // 搜索防抖定时器
      query: {
        username: '',
        zero: 1,
        sort: 'id',
        room_status: '-1',
        page: 1,
        pageSize: 20
      },
      hasMore: true,
      loading: false,
      registerData: {
        username: '',
        password: '',
        name: '',
        ignore_outbet: 0,
      },
      editData: {
        username: '',
        password: '',
        name: '',
        ignore_outbet: 0,
      },
      linkData: {
        userid: '',
        gid: '',
        type: 'count', // count: 次数, time: 时间
        count: 1,
        days: 1,
      },
      sortList: [{title: '默认排序', key: 'id'}, {title: '分数排序', key: 'kmoney'}, {title: '在线排序', key: 'online'}],
      statusList: [{title: '全部', key: '-1'}, {title: '正常', key: '1'}, {title: '停用', key: '0'}, {title: '禁言', key: '2'}],
      actionList: [{name: '信息', key: 'info'}, {name: '私聊', key: 'chat'}, {name: '修改', key: 'mod'}, {name: '上下分', key: 'km'}, {name: '生成链接', key: 'link'}],
      actionShow: false,
      actionTitle: '',
      statusShow: false,
      statusTitle: '',
      statusAcList: [{name: '正常', key: '1', color: '#0087B4'}, {name: '停用', key: '0', color: '#ff4d4d'}, {name: '禁言', key: '2', color: '#ff9f4d'}],
      operUserid: 0, //当前操作的用户id
      ctiem: null,
      showDialog: false,
      isShangxiafenShow: false,
      isRegisterShow: false,
      isEditShow: false,
      isLinkShow: false,
      cmoney: '',
      linkTypeList: [{name: '次数', key: 'count'}, {name: '时间', key: 'time'}],
      shangxiafenList: [{name: '上分', key: '1'}, {name: '下分', key: '2'}],
      shangxiafenType: '1',
      gameList: [],
      generatedLink: '', // 生成的链接
      showLinkCopyDialog: false // 是否显示链接复制对话框
    };
  },
  mounted() {
    this.getGameListByIfok();
    // 弹窗模式下直接加载数据
    if (this.isPopupMode) {
      this.loadUserList();
    }
  },
  methods: {
    getGameListByIfok() {
      this.$u.api.common.getGameListByIfok({}).then(res => {
        this.gameList = res.data.list;
      });
    },
    
    showAddDialog() {
      this.isRegisterShow = true;
      // 重置注册数据
      this.registerData = {
        username: '',
        password: '',
        name: '',
        ignore_outbet: 0,
      };
    },
    
    // 查询用户列表 (z-paging模式)
    queryList(page, pageSize) {
      this.query.page = page;
      this.query.pageSize = pageSize;
      this.$u.api.agent.getUserList(this.query).then(res => {
        this.$refs.paging.complete(res.data.records);
      }).catch(res => {
        this.$refs.paging.complete(false);
      })
    },
    
    // 加载用户列表 (弹窗模式)
    loadUserList(reset = false) {
      if (this.loading) return;
      
      if (reset) {
        this.query.page = 1;
        this.list = [];
        this.originalList = [];
        this.hasMore = true;
      }
      
      // 创建不包含搜索关键词的查询参数，获取所有数据
      const apiQuery = { ...this.query };
      delete apiQuery.username; // 移除搜索关键词，获取完整数据
      
      this.loading = true;
      this.$u.api.agent.getUserList(apiQuery).then(res => {
        const newList = res.data.records || [];
        
        if (reset) {
          this.originalList = newList;
          this.list = newList;
        } else {
          this.originalList = [...this.originalList, ...newList];
          this.list = [...this.list, ...newList];
        }
        
        // 判断是否还有更多数据
        this.hasMore = newList.length >= this.query.pageSize;
        this.loading = false;
        
        // 如果有搜索关键词，立即执行本地搜索
        if (this.query.username) {
          this.performLocalSearch();
        }
      }).catch(res => {
        console.error('❌ 加载用户列表失败:', res);
        this.loading = false;
        uni.showToast({title: res.message || '加载失败', icon: 'none'});
      });
    },
    
    // 加载更多
    loadMore() {
      if (!this.hasMore || this.loading) return;
      this.query.page++;
      this.loadUserList();
    },
    
    // 搜索
    search() {
      this.performLocalSearch();
    },
    
    // 执行本地搜索
    performLocalSearch() {
      const keyword = this.query.username.trim().toLowerCase();
      
      if (!keyword) {
        // 没有搜索关键词，显示所有数据
        this.list = [...this.originalList];
        return;
      }
      
      // 在用户名和昵称中搜索
      this.list = this.originalList.filter(item => {
        const username = (item.username || '').toLowerCase();
        const name = (item.name || '').toLowerCase();
        return username.includes(keyword) || name.includes(keyword);
      });
    },
    
    // 搜索输入事件（实时搜索）
    onSearchInput(value) {
      // 防抖处理，避免频繁搜索
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => {
        this.performLocalSearch();
      }, 300);
    },
    
    // 清空搜索
    onSearchClear() {
      this.query.username = '';
      this.performLocalSearch();
    },
    
    // 排序改变
    handleSortChange() {
      if (this.isPopupMode) {
        this.loadUserList(true);
      } else {
        this.$refs.paging.reload();
      }
    },
    
    // 状态改变
    handleStatusChange() {
      if (this.isPopupMode) {
        this.loadUserList(true);
      } else {
        this.$refs.paging.reload();
      }
    },
    
    // 显示操作菜单
    actionClicShow(item) {
      this.ctiem = item;
      this.actionTitle = `操作用户：${item.username}`;
      this.actionShow = true;
    },
    
    // 操作选择
    actionClick(item) {
      this.actionShow = false;
      switch (item.key) {
        case 'info':
          this.showUserInfo();
          break;
        case 'chat':
          this.openChat();
          break;
        case 'mod':
          this.showEditUser();
          break;
        case 'km':
          this.showShangxiafen();
          break;
        case 'link':
          this.showGenerateLink();
          break;
      }
    },
    
    // 显示用户信息
    showUserInfo() {
      uni.showModal({
        title: '用户信息',
        content: `用户名: ${this.ctiem.username}\n昵称: ${this.ctiem.name}\n余额: ${this.ctiem.kmoney}\n状态: ${this.ctiem.room_status == 0 ? '停用' : this.ctiem.room_status == 1 ? '正常' : this.ctiem.room_status == 2 ? '禁言' : '冻结'}`,
        showCancel: false
      });
    },
    
    // 打开聊天
    openChat() {
      // 跳转到聊天页面，并传递用户信息
      uni.$utils.jump(`copage/chat?targetUserId=${this.ctiem.userid}&targetUsername=${this.ctiem.username}&chatType=private`);
    },
    
    // 显示编辑用户
    showEditUser() {
      this.editData = {
        username: this.ctiem.username,
        password: '',
        name: this.ctiem.name,
        ignore_outbet: this.ctiem.ignore_outbet,
      };
      this.isEditShow = true;
    },
    
    // 显示上下分
    showShangxiafen() {
      this.cmoney = '';
      this.shangxiafenType = '1';
      this.isShangxiafenShow = true;
    },
    
    // 显示生成链接
    showGenerateLink() {
      this.linkData = {
        userid: this.ctiem.userid,
        gid: '',
        type: 'count',
        count: 1,
        days: 1,
      };
      this.isLinkShow = true;
    },
    
    // 状态点击显示
    statusClickShow(item) {
      this.ctiem = item;
      this.statusTitle = `修改状态：${item.username}`;
      this.statusShow = true;
    },
    
    // 状态选择
    statusClick(item) {
      this.statusShow = false;
      this.$u.api.agent.changeUserStatus({
        userid: this.ctiem.userid,
        room_status: item.key
      }).then(res => {
        uni.showToast({title: '状态修改成功', icon: 'success'});
        if (this.isPopupMode) {
          this.loadUserList(true);
        } else {
          this.$refs.paging.reload();
        }
      }).catch(res => {
        uni.showToast({title: res.message || '状态修改失败', icon: 'none'});
      });
    },
    
    // 生成随机用户名
    generateRandomUsername() {
      const prefixes = [
        'ah', 'bh', 'ch', 'dh', 'eh', 'fh', 'gh', 'hh', 'ih', 'jh',
        'kh', 'lh', 'mh', 'nh', 'oh', 'ph', 'qh', 'rh', 'sh', 'th',
        'uh', 'vh', 'wh', 'xh', 'yh', 'zh', 'aa', 'bb', 'cc', 'dd'
      ];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let randomNumbers = '';
      for (let i = 0; i < 6; i++) {
        randomNumbers += Math.floor(Math.random() * 10);
      }
      this.registerData.username = randomPrefix + randomNumbers;
    },
    
    // 生成随机密码
    generateRandomPassword() {
      const prefixes = [
        'ah', 'bh', 'ch', 'dh', 'eh', 'fh', 'gh', 'hh', 'ih', 'jh',
        'kh', 'lh', 'mh', 'nh', 'oh', 'ph', 'qh', 'rh', 'sh', 'th',
        'uh', 'vh', 'wh', 'xh', 'yh', 'zh', 'aa', 'bb', 'cc', 'dd'
      ];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let randomNumbers = '';
      for (let i = 0; i < 6; i++) {
        randomNumbers += Math.floor(Math.random() * 10);
      }
      this.registerData.password = randomPrefix + randomNumbers;
    },
    
    // 生成编辑密码
    generateEditPassword() {
      const prefixes = [
        'ah', 'bh', 'ch', 'dh', 'eh', 'fh', 'gh', 'hh', 'ih', 'jh',
        'kh', 'lh', 'mh', 'nh', 'oh', 'ph', 'qh', 'rh', 'sh', 'th',
        'uh', 'vh', 'wh', 'xh', 'yh', 'zh', 'aa', 'bb', 'cc', 'dd'
      ];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let randomNumbers = '';
      for (let i = 0; i < 6; i++) {
        randomNumbers += Math.floor(Math.random() * 10);
      }
      this.editData.password = randomPrefix + randomNumbers;
    },
    
    // 执行注册
    doRegister() {
      if (!this.registerData.username || !this.registerData.password) {
        uni.showToast({title: '请填写完整信息', icon: 'none'});
        return;
      }
      
      this.$u.api.agent.registerAccount(this.registerData).then(res => {
        uni.showToast({title: '注册成功', icon: 'success'});
        this.isRegisterShow = false;
        if (this.isPopupMode) {
          this.loadUserList(true);
        } else {
          this.$refs.paging.reload();
        }
      }).catch(res => {
        uni.showToast({title: res.message || '注册失败', icon: 'none'});
      });
    },
    
    // 执行编辑
    doEditUser() {
      this.$u.api.agent.updateAccount({
        username: this.editData.username,
        password: this.editData.password,
        name: this.editData.name,
        ignore_outbet: this.editData.ignore_outbet
      }).then(res => {
        uni.showToast({title: '修改成功', icon: 'success'});
        this.isEditShow = false;
        if (this.isPopupMode) {
          this.loadUserList(true);
        } else {
          this.$refs.paging.reload();
        }
      }).catch(res => {
        uni.showToast({title: res.message || '修改失败', icon: 'none'});
      });
    },
    
    // 执行上下分
    doshxiafen() {
      if (!this.cmoney) {
        uni.showToast({title: '请输入金额', icon: 'none'});
        return;
      }
      
      this.$u.api.agent.shangxiafen({
        userid: this.ctiem.userid,
        type: this.shangxiafenType,
        money: this.cmoney
      }).then(res => {
        uni.showToast({title: '操作成功', icon: 'success'});
        this.isShangxiafenShow = false;
        if (this.isPopupMode) {
          this.loadUserList(true);
        } else {
          this.$refs.paging.reload();
        }
      }).catch(res => {
        uni.showToast({title: res.message || '操作失败', icon: 'none'});
      });
    },
    
    // 生成链接
    doGenerateLink() {
      if (!this.linkData.gid) {
        uni.showToast({title: '请选择游戏', icon: 'none'});
        return;
      }
      
      if (this.linkData.type === 'count' && (!this.linkData.count || this.linkData.count < 1)) {
        uni.showToast({title: '有效次数必须大于0', icon: 'none'});
        return;
      }
      
      if (this.linkData.type === 'time' && (!this.linkData.days || this.linkData.days <= 0)) {
        uni.showToast({title: '有效时间必须大于0天', icon: 'none'});
        return;
      }
      
      uni.showLoading({title: '生成中...'});
      
      // 构建API参数
      let apiParams = {
        userid: this.linkData.userid,
        gid: this.linkData.gid,
        type: this.linkData.type
      };
      
      if (this.linkData.type === 'count') {
        apiParams.count = this.linkData.count;
      } else if (this.linkData.type === 'time') {
        apiParams.count = this.linkData.days;
      }
      
      // 调用生成链接API
      console.log('🔗 生成链接请求参数:', apiParams);
      this.$u.api.agent.generateLink(apiParams).then(res => {
        console.log('🔗 生成链接响应:', res);
        uni.hideLoading();
        this.isLinkShow = false;
        
        // 保存生成的链接
        if (res.data) {
          this.generatedLink = res.data;
          this.showLinkCopyDialog = true;
          console.log('🔗 链接生成成功:', res.data);
        } else {
          console.error('🔗 链接生成失败: 无数据');
          uni.showToast({title: '链接生成失败', icon: 'none'});
        }
      }).catch(res => {
        console.error('🔗 生成链接API错误:', res);
        uni.hideLoading();
        uni.showToast({title: res.msg || res.message || '生成链接失败', icon: 'none'});
      });
    },
    
    // 复制链接到剪贴板
    copyLinkToClipboard(link) {
      if (!link) {
        uni.showToast({title: '链接为空', icon: 'none'});
        return;
      }
      
      // 使用uni-app的剪贴板API
      uni.setClipboardData({
        data: link,
        success: () => {
          uni.showToast({title: '链接已复制到剪贴板', icon: 'success'});
          this.showLinkCopyDialog = false; // 复制成功后关闭对话框
        },
        fail: () => {
          uni.showToast({title: '复制失败', icon: 'none'});
        }
      });
    },
    
    // 删除所有0分用户
    delAllZeroUser() {
      this.$u.api.agent.delAllZeroUser().then(res => {
        uni.showToast({title: '删除成功', icon: 'success'});
        this.showDialog = false;
        this.$refs.paging.reload();
      }).catch(res => {
        uni.showToast({title: res.message || '删除失败', icon: 'none'});
      });
    },
    
    // 处理返回按钮
    handleBack() {
      if (this.backUrl) {
        uni.$utils.jump(this.backUrl);
      } else {
        this.$emit('back');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-list-component {
  width: 100%;
  height: 100%;
  
  // 弹窗模式样式
  &.popup-mode {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;     // 🔧 允许flex正确计算
    max-height: 100%;  // 🔧 限制最大高度
    overflow: hidden;  // 防止整体溢出
    flex: 1 1 auto;    // 🔧 完全占据父容器空间
  }
}

.filter-section {
  background: #fff;
  padding: 30rpx;
  flex-shrink: 0; // 在弹窗模式下不缩小
  
  // 弹窗模式下适当缩小padding和间距
  .popup-mode & {
    padding: 15rpx 20rpx;
  }
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-section {
  flex-shrink: 0;
  
  // 弹窗模式下缩小padding
  .popup-mode & {
    padding: 15rpx 20rpx !important;
  }
}

.custom-select {
  flex: 1;
  padding: 20rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  background: #f8f9fa;
}

.game-select {
  flex: 1;
  padding: 20rpx;
  border: 1px solid #e0e0e0;
  border-radius: 8rpx;
  background: #f8f9fa;
}

.list-h {
  display: flex;
  background: #f8f9fa;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #e0e0e0;
}

.span {
  text-align: center;
  font-weight: bold;
  color: #333;
}

.list {
  background: #fff;
}

.list-p {
  display: flex;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;
}

.list-p-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.list-p3 {
  cursor: pointer;
}

.tiem {
  color: #0087B4;
  font-size: 28rpx;
}

.zaixian {
  background: #4CAF50;
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
}

.liuxian {
  background: #999;
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
}

.exclusive-tag {
  background: #FF9800;
  color: white;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  margin-left: 10rpx;
}

.color-zhengchang {
  color: #4CAF50;
  font-weight: bold;
}

.color-jinyong {
  color: #f56c6c;
  font-weight: bold;
}

.color-jinyan {
  color: #e6a23c;
  font-weight: bold;
}

.color-dongjie {
  color: #909399;
  font-weight: bold;
}

.btn-zhengchang {
  border-color: #4CAF50;
  color: #4CAF50;
}

.btn-jinyong {
  border-color: #f56c6c;
  color: #f56c6c;
}

.btn-jinyan {
  border-color: #e6a23c;
  color: #e6a23c;
}

.btn-dongjie {
  border-color: #909399;
  color: #909399;
}

.refresh-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
  color: #333;
}

.refresh-tips {
  margin-bottom: 30rpx;
  font-size: 28rpx;
  color: #666;
}

.refresh-con {
  margin-bottom: 30rpx;
}

.btncon {
  flex: 1;
  margin: 0 10rpx;
}

.slot-content {
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.link-display {
  background: #f5f5f5;
  padding: 20rpx;
  border-radius: 8rpx;
  border: 1px solid #e0e0e0;
}

.link-text {
  word-break: break-all;
  color: #0087b4;
  font-size: 26rpx;
}

.link-tip {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

// 弹窗模式专用样式
.popup-header-section {
  flex-shrink: 0; // 固定头部，不缩小
  flex-grow: 0;   // 不扩展
  background: #fff;
}

// 现代化用户列表容器
.modern-user-list {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8rpx 16rpx;
  min-height: 0;
  max-height: 100%;
  height: 100%;
  background: #f8f9fa;
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200rpx;
    
    .empty-text {
      font-size: 28rpx;
      color: #999;
      padding: 60rpx 40rpx;
      text-align: center;
      background: #f8f9fa;
      border-radius: 12rpx;
      border: 2rpx dashed #ddd;
    }
  }
}

// 表格式用户项样式
.table-user-item {
  display: flex;
  align-items: center;
  padding: 8rpx 12rpx;
  margin: 4rpx 0;
  background: #ffffff;
  border-radius: 8rpx;
  border: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;
  
  &:active {
    background: #f8f9fa;
  }
  
  // 在线状态列 (flex: 1)
  .online-column {
    position: relative;
    width: 60rpx;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    
    .avatar-circle {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      
      &.online {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
      }
      
      &.offline {
        background: linear-gradient(135deg, #9E9E9E, #757575);
        color: white;
      }
      
      .avatar-text {
        font-size: 18rpx;
        font-weight: 600;
      }
    }
    
    .online-indicator {
      position: absolute;
      bottom: 2rpx;
      right: 8rpx;
      width: 12rpx;
      height: 12rpx;
      background: #4CAF50;
      border: 2rpx solid white;
      border-radius: 50%;
    }
  }
  
  // 用户名列 (flex: 3)
  .username-column {
    flex: 3;
    min-width: 0;
    padding: 0 12rpx;
    
    .username-row {
      display: flex;
      align-items: center;
      margin-bottom: 2rpx;
      
      .username {
        font-size: 24rpx;
        font-weight: 600;
        margin-right: 8rpx;
        
        &.status-normal { color: #2E7D32; }
        &.status-disabled { color: #F44336; }
        &.status-muted { color: #FF9800; }
        &.status-frozen { color: #9C27B0; }
      }
      
      .exclusive-badge {
        background: #FF5252;
        color: white;
        font-size: 14rpx;
        padding: 2rpx 4rpx;
        border-radius: 4rpx;
        font-weight: 600;
      }
    }
    
    .real-name {
      font-size: 24rpx;
      color: #666;
    }
  }
  
  // 余额列 (flex: 2)
  .balance-column {
    flex: 2;
    text-align: right;
    padding: 0 8rpx;
    
    .balance-amount {
      font-size: 26rpx;
      color: #1976D2;
      font-weight: 600;
    }
  }
  
  // 状态列 (flex: 2)
  .status-column {
    flex: 2;
    padding: 0 8rpx;
    
    .status-badge {
      padding: 4rpx 8rpx;
      border-radius: 12rpx;
      text-align: center;
      
      &.status-1 {
        background: #E8F5E8;
        color: #2E7D32;
      }
      
      &.status-0 {
        background: #FFEBEE;
        color: #C62828;
      }
      
      &.status-2 {
        background: #FFF3E0;
        color: #E65100;
      }
      
      &.status-3 {
        background: #F3E5F5;
        color: #7B1FA2;
      }
      
      .status-text {
        font-size: 22rpx;
        font-weight: 500;
      }
    }
  }
  
  // 操作列 (flex: 1)
  .action-column {
    flex: 1;
    display: flex;
    justify-content: center;
    
    .more-btn {
      width: 32rpx;
      height: 32rpx;
      border-radius: 50%;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:active {
        background: #e0e0e0;
      }
      
      .more-text {
        font-size: 24rpx;
        color: #666;
        font-weight: 600;
      }
    }
  }
}

// 现代化加载更多按钮
.load-more-modern {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
  margin: 16rpx 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  
  &:active {
    transform: scale(0.98);
  }
  
  .load-more-text {
    color: white;
    font-size: 28rpx;
    font-weight: 600;
  }
}

// 旧版加载更多按钮样式（保留兼容性）
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  margin: 20rpx 0;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0e0;
  
  .load-more-text {
    font-size: 28rpx;
    color: #0087B4;
  }
}
</style>
