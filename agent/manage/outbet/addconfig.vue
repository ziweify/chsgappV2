<template>
  <view class="layout">
    <view class="ts-custom">
      <TsCustom :backUrl="backUrl" :isBack="true" :title="isEdit ? '编辑打单配置' : '添加打单配置'"></TsCustom>
    </view>
    
    <view class="form-container">
      <u-form labelWidth="80" :model="formData">
        <!-- 名称 -->
        <u-form-item label="名称" class="form-item">
          <u-input 
            v-model="formData.name" 
            placeholder="请输入1-10位中英文组合" 
            maxlength="10"
            :clearable="true"
          />
        </u-form-item>

        <!-- 盘口网站 -->
        <u-form-item label="盘口网站" class="form-item">
          <select v-model="formData.type" class="custom-select">
            <option value="" disabled>请选择盘口网站</option>
            <option v-for="(item, index) in typeList" :key="index" :value="item.value">{{item.label}}</option>
          </select>
        </u-form-item>

        <!-- 盘口类型 -->
        <u-form-item label="盘口类型" class="form-item">
          <select v-model="formData.abcd" class="custom-select">
            <option value="" disabled>请选择盘口类型</option>
            <option v-for="(item, index) in typeAbcdList" :key="index" :value="item.value">{{item.label}}</option>
          </select>
        </u-form-item>

        <!-- 盘口账号 -->
        <u-form-item label="盘口账号" class="form-item">
          <u-input 
            v-model="formData.username" 
            placeholder="请输入盘口账号"
            :clearable="true"
          />
        </u-form-item>

        <!-- 盘口密码 -->
        <u-form-item label="盘口密码" class="form-item">
          <u-input 
            v-model="formData.password" 
            placeholder="请输入盘口密码"
            :clearable="true"
          />
        </u-form-item>

        <!-- 打单彩种 -->
        <u-form-item label="游戏选择" class="form-item">
          <view class="multi-select-container" @click="showGameSelect">
            <view class="selected-games" v-if="selectedGames.length > 0">
              <text class="game-tag" v-for="game in selectedGamesDisplay" :key="game.gid">{{ game.gname }}</text>
              <text v-if="selectedGames.length > 3" class="more-text">等{{ selectedGames.length }}项</text>
            </view>
            <text v-else class="placeholder-text">请选择游戏</text>
          </view>
        </u-form-item>

        <!-- 投注模式 -->
        <u-form-item label="投注模式" class="form-item">
          <select v-model="formData.bet_mode" class="custom-select">
            <option value="" disabled>请选择投注模式</option>
            <option v-for="(item, index) in betModeList" :key="index" :value="item.value">{{item.label}}</option>
          </select>
        </u-form-item>

        <!-- 订单模式 -->
        <u-form-item label="订单模式" class="form-item">
          <select v-model="formData.order_mode" class="custom-select">
            <option value="" disabled>请选择订单模式</option>
            <option v-for="(item, index) in orderModeList" :key="index" :value="item.value">{{item.label}}</option>
          </select>
        </u-form-item>

        <!-- 正反跟 -->
        <u-form-item v-if="ishowhebing == 1" label="正反跟" class="form-item">
          <u-radio-group v-model="formData.indicator" placement="row">
            <u-radio :name="1" label="正跟" style="margin-right: 30rpx;"></u-radio>
            <u-radio :name="0" label="反跟"></u-radio>
          </u-radio-group>
        </u-form-item>

        <!-- 是否合并订单 -->
        <u-form-item v-if="ishowhebing == 1" label="合并去重" class="form-item">
          <u-switch 
            v-model="formData.is_hebing" 
            :active-value="1" 
            :inactive-value="0"
            active-color="#0087B4"
          ></u-switch>
        </u-form-item>

        <!-- 飞单倍数 -->
        <u-form-item label="打单倍数" class="form-item">
          <u-input 
            v-model="formData.flyjiabei" 
            placeholder="请输入飞单倍数"
            type="number"
            :clearable="true"
          />
        </u-form-item>

        <!-- 大额分投 -->
        <u-form-item label="大额分投" class="form-item">
          <u-input 
            v-model="formData.chai_money" 
            placeholder="请输入大额分投金额"
            type="number"
            :clearable="true"
          />
        </u-form-item>

        <!-- 起飞金额 -->
        <u-form-item label="起飞金额" class="form-item">
          <u-input 
            v-model="formData.start_money" 
            placeholder="请输入起飞金额"
            type="number"
            :clearable="true"
          />
        </u-form-item>

        <!-- 指定会员 -->
        <u-form-item label="指定会员" class="form-item">
          <view class="member-select-container" @click="showMemberSelect">
            <view class="selected-members" v-if="selectedMembers.length > 0">
              <text class="member-tag" v-for="member in selectedMembersDisplay" :key="member.username">{{ member.username }}</text>
              <text v-if="selectedMembers.length > 3" class="more-text">等{{ selectedMembers.length }}位</text>
            </view>
            <text v-else class="placeholder-text">留空则不限制会员</text>
          </view>
        </u-form-item>

        <!-- 网址 -->
        <u-form-item label="网址" class="form-item">
          <!-- 如果uView textarea还有问题，可以使用原生textarea -->
          <textarea 
            v-model="formData.urls" 
            placeholder="请输入网址，多个网址请换行输入"
            class="native-textarea"
            maxlength="1000"
            rows="4"
          ></textarea>
          <!-- uView textarea备选方案 -->
          <!-- <u--textarea 
            v-model="formData.urls" 
            placeholder="请输入网址，多个网址请换行输入"
            :maxlength="1000"
            height="80"
            :auto-height="true"
            :border="true"
            :count="true"
          /> -->
        </u-form-item>

        <!-- 开关 -->
        <u-form-item label="启用状态" class="form-item">
          <u-switch 
            v-model="formData.enabled" 
            :active-value="1" 
            :inactive-value="0"
            active-color="#0087B4"
          ></u-switch>
        </u-form-item>
      </u-form>

      <!-- 提交按钮 -->
      <view class="submit-container">
        <u-button @click="submitForm" type="primary" :custom-style="submitButtonStyle">
          保存配置
        </u-button>
      </view>
    </view>

    <!-- 说明文字弹窗 -->
    <u-popup :show="showTipPopup" mode="center" :border-radius="10" @close="showTipPopup = false">
      <view class="tip-popup">
        <view class="tip-header">
          <text class="tip-title">{{ currentTipTitle }}</text>
          <text @click="showTipPopup = false" class="close-icon">×</text>
        </view>
        <view class="tip-content">
          <text>{{ currentTipContent }}</text>
        </view>
      </view>
    </u-popup>

    <!-- 游戏选择弹窗 -->
    <u-popup :show="showGamePopup" mode="bottom" height="80%" :border-radius="20" @close="showGamePopup = false" :safe-area-inset-bottom="true">
      <view class="game-popup">
        <!-- 弹窗头部 -->
        <view class="popup-header">
          <view class="header-left">
            <text @click="showGamePopup = false" class="close-btn">取消</text>
          </view>
          <view class="header-center">
            <text class="popup-title">选择游戏</text>
            <text class="selected-count" v-if="tempSelectedGids.length > 0">(已选{{ tempSelectedGids.length }}项)</text>
          </view>
          <view class="header-right">
            <text @click="confirmGameSelect" class="confirm-btn">确定</text>
          </view>
        </view>

        <!-- 操作栏 -->
        <view class="action-section">
          <view class="game-count">
            <text class="count-text">共{{ gameList.length }}个游戏</text>
          </view>
          <view class="action-buttons">
            <view @click="selectAllGames" class="select-all-btn" :class="{ 'active': isAllGamesSelected }">
              <text class="btn-icon">{{ isAllGamesSelected ? '✓' : '□' }}</text>
              <text class="btn-text">{{ isAllGamesSelected ? '取消全选' : '全选' }}</text>
            </view>
          </view>
        </view>

        <!-- 游戏列表 -->
        <view class="game-list-container">
          <view v-if="gameList.length === 0 && !gameListLoading" class="empty-state">
            <text class="empty-text">暂无游戏数据</text>
          </view>
          
          <view v-if="gameListLoading" class="loading-state">
            <text class="loading-text">加载中...</text>
          </view>

          <view v-else-if="gameList.length > 0">
            <scroll-view scroll-y="true" class="game-scroll-area">
            <view class="game-grid">
              <u-checkbox-group v-model="tempSelectedGids">
                <view 
                  v-for="game in gameList" 
                  :key="game.gid" 
                  class="game-grid-item"
                  :class="{ 'selected': tempSelectedGids.includes(game.gid) }"
                >
                  <view class="game-content">
                    <text class="game-name">{{ game.gname }}</text>
                    <u-checkbox 
                      :name="game.gid" 
                      active-color="#0087B4"
                      size="18"
                    ></u-checkbox>
                  </view>
                </view>
              </u-checkbox-group>
            </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </u-popup>

    <!-- 会员选择弹窗 -->
    <u-popup :show="showMemberPopup" mode="bottom" height="80%" :border-radius="20" @close="showMemberPopup = false" :safe-area-inset-bottom="true">
      <view class="member-popup">
        <!-- 弹窗头部 -->
        <view class="popup-header">
          <view class="header-left">
            <text @click="showMemberPopup = false" class="close-btn">取消</text>
          </view>
          <view class="header-center">
            <text class="popup-title">选择会员</text>
            <text class="selected-count" v-if="tempSelectedMembers.length > 0">(已选{{ tempSelectedMembers.length }}位)</text>
          </view>
          <view class="header-right">
            <text @click="confirmMemberSelect" class="confirm-btn">确定</text>
          </view>
        </view>

        <!-- 搜索和操作栏 -->
        <view class="action-section">
          <view class="search-container">
            <u-search 
              v-model="memberSearchKeyword" 
              placeholder="搜索会员账号"
              :show-action="false"
              bg-color="#f8f9fa"
              shape="round"
              height="36"
              @search="searchMembers"
            ></u-search>
          </view>
          <view class="action-buttons">
            <view @click="selectAllMembers" class="select-all-btn" :class="{ 'active': isAllMembersSelected }">
              <text class="btn-icon">{{ isAllMembersSelected ? '✓' : '□' }}</text>
              <text class="btn-text">{{ isAllMembersSelected ? '取消全选' : '全选' }}</text>
            </view>
          </view>
        </view>

        <!-- 会员列表 -->
        <view class="member-list-container">
          <view v-if="memberList.length === 0 && !memberListLoading" class="empty-state">
            <text class="empty-text">暂无会员数据</text>
          </view>
          
          <view v-if="memberListLoading" class="loading-state">
            <text class="loading-text">加载中...</text>
          </view>

          <view v-else-if="memberList.length > 0">
            <scroll-view scroll-y="true" class="member-scroll-area">
              <view class="member-grid">
                <u-checkbox-group v-model="tempSelectedMembers">
                  <view 
                    v-for="member in memberList" 
                    :key="member.username" 
                    class="member-grid-item"
                    :class="{ 'selected': tempSelectedMembers.includes(member.username) }"
                  >
                    <view class="member-content">
                      <view class="member-info">
                        <text class="member-username">{{ member.username }}</text>
                        [<text class="member-name" v-if="member.name">{{ member.name }}</text>]
                      </view>
                      <u-checkbox 
                        :name="member.username" 
                        active-color="#0087B4"
                        size="18"
                      ></u-checkbox>
                    </view>
                  </view>
                </u-checkbox-group>
              </view>
            </scroll-view>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl: "agent/manage/outbet/outbetlist",
      isEdit: false, // 是否为编辑模式
      editConfigId: null, // 编辑的配置ID
      formData: {
        name: '',
        type: '',
        abcd: '',
        username: '',
        password: '',
        gids: [],
        bet_mode: 1,
        order_mode: 1,
        indicator: 1,
        is_hebing: 1,
        flyjiabei: 1,
        chai_money: 0,
        start_money: 0,
        zhidinguser: [],
        urls: '',
        enabled: 1
      },

      typeList: [],
      typeAbcdList: [
        { label: 'A', value: 'A' },
        { label: 'B', value: 'B' },
        { label: 'C', value: 'C' },
        { label: 'D', value: 'D' }
      ],
      betModeList: [
        { label: '服务器投注', value: 1 },
        { label: 'API投注', value: 2 },
        { label: '软件投注', value: 3 }
      ],
      orderModeList: [
        { label: '封盘合并', value: 1 },
        { label: '分段合并', value: 2 }
      ],
      gameList: [],
      selectedGames: [],
      tempSelectedGids: [],
      memberList: [],
      selectedMembers: [],
      tempSelectedMembers: [],
      showTipPopup: false,
      showGamePopup: false,
      showMemberPopup: false,
      currentTipTitle: '',
      currentTipContent: '',
      memberSearchKeyword: '',
      gameListLoading: false,
      memberListLoading: false,
      submitButtonStyle: {
        background: '#0087B4',
        width: '100%',
        height: '64rpx',
        fontSize: '26rpx'
      },
      tipContentMap: {
        '名称': '1-10位中英文组合，用于区分不同的站点设置，可任意填写',
        '盘口网站': '目前支持大吉和SGWIN两种盘口网站',
        '盘口账号': '盘口方提供的登录账号',
        '盘口密码': '盘口方提供的登录密码',
        '打单彩种': '选择需要进行打单的彩种游戏，可多选',
        '投注模式': '1=服务器投资 2=API投注 3=软件投注',
        '订单模式': '1=封盘合并 2=分段合并，决定订单的合并方式',
        '正反跟': '1=正跟 0=反跟，决定跟单的方向',
        '是否合并订单': '1=是 0=否，是否将多个订单合并处理',
        '飞单倍数': '默认值是1，设置飞单的倍数',
        '大额分投': '默认值是0，填写大于0的金额将进行拆分，例如填写5000，则会员下注6000将拆分成5000和1000下注',
        '起飞金额': '默认值是0，填0则不限制，例如：填5000，则4999不飞，5000、6000则飞',
        '指定会员': '选择特定的会员账号进行打单配置',
        '网址': '输入相关的网址信息，多个网址请换行输入',
        '开关': '1=启用 0=关闭，控制配置是否生效'
      },
      ishowhebing:0,
    };
  },
  computed: {
    selectedGamesDisplay() {
      return this.selectedGames.slice(0, 3);
    },
    selectedMembersDisplay() {
      return this.selectedMembers.slice(0, 3);
    },
    filteredGameList() {
      return this.gameList;
    },
    isAllGamesSelected() {
      if (this.gameList.length === 0) return false;
      return this.gameList.every(game => this.tempSelectedGids.includes(game.gid));
    },
    isAllMembersSelected() {
      if (this.memberList.length === 0) return false;
      return this.memberList.every(member => this.tempSelectedMembers.includes(member.username));
    }
  },
  onLoad(options) {
    // 检查是否为编辑模式 - 优先从URL参数获取，其次从存储获取
    if(options.id) {
      this.editConfigId = options.id;
      this.isEdit = true;
      // 加载配置数据
      this.loadConfigData();
    } else {
      // 兼容旧的存储方式
      this.editConfigId = uni.getStorageSync('editConfigId');
      if(this.editConfigId) {
        this.isEdit = true;
        // 清除存储的编辑ID
        uni.removeStorageSync('editConfigId');
        // 加载配置数据
        this.loadConfigData();
      }
    }
    
    this.loadTypeList();
    this.loadGameList();
  },
  methods: {
    // 加载配置数据（编辑模式）
    loadConfigData() {
      uni.showLoading({ title: '加载中...' });
      this.$u.api.agent.getOutbetInfo({ id: this.editConfigId }).then(res => {
        const data = res.data;
        
        // 填充表单数据
        this.formData = {
          name: data.name || '',
          type: data.type || '',
          abcd: data.abcd || '',
          username: data.username || '',
          password: data.password || '',
          gids: data.gids ? (typeof data.gids === 'string' ? data.gids.split(',').map(id => parseInt(id)) : data.gids) : [],
          bet_mode: data.bet_mode || '',
          order_mode: data.order_mode || '',
          indicator: data.indicator !== undefined ? data.indicator : 1,
          is_hebing: data.is_hebing !== undefined ? data.is_hebing : 0,
          flyjiabei: data.flyjiabei || 1,
          chai_money: data.chai_money || 0,
          start_money: data.start_money || 0,
          zhidinguser: data.zhidinguser ? (typeof data.zhidinguser === 'string' ? data.zhidinguser.split(',').filter(u => u) : data.zhidinguser) : [],
          urls: data.urls || '',
          enabled: data.enabled !== undefined ? data.enabled : 1
        };
        
        // 处理指定会员名称
        if(data.zhidingusernames) {
          const usernames = typeof data.zhidingusernames === 'string' ? 
            data.zhidingusernames.split(',').filter(u => u.trim()) : 
            data.zhidingusernames;
          this.formData.zhidinguser = usernames;
          // 构造selectedMembers用于显示
          this.selectedMembers = usernames.map(username => ({
            username: username.trim(),
            name: username.trim() // 暂时用用户名作为显示名称
          }));
        }
        
        // 加载游戏数据后设置已选择的游戏
        this.loadGameList().then(() => {
          // 根据游戏ID设置已选择的游戏
          if(this.formData.gids && this.formData.gids.length > 0) {
            this.selectedGames = this.gameList.filter(game => 
              this.formData.gids.includes(game.gid)
            );
          }
          
          // 如果有游戏名称但没有游戏ID，通过名称匹配
          if(data.gidsname && (!this.formData.gids || this.formData.gids.length === 0)) {
            const gameNames = typeof data.gidsname === 'string' ? 
              data.gidsname.split(',').filter(name => name.trim()) : 
              data.gidsname;
            this.selectedGames = this.gameList.filter(game => 
              gameNames.includes(game.gname)
            );
            this.formData.gids = this.selectedGames.map(game => game.gid);
          }
        });
        
        uni.hideLoading();
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || '加载配置失败');
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      });
    },

    // 加载打单类型列表
    loadTypeList() {
      return this.$u.api.agent.getOutbetTypeList({}).then(res => {
        // 将接口返回的数据转换为前端需要的格式
        this.typeList = (res.data.list || []).map(item => ({
          label: item.name,
          value: item.id
        }));
        this.ishowhebing = res.data.ishowhebing;
        return this.typeList;
      }).catch(err => {
        this.$u.toast('获取打单类型列表失败');
        return [];
      });
    },

    // 加载游戏列表
    loadGameList() {
      this.gameListLoading = true;
      return this.$u.api.common.getGameListByIfok({}).then(res => {
        this.gameList = res.data.list || [];
        return this.gameList;
      }).catch(err => {
        this.$u.toast('获取游戏列表失败');
        return [];
      }).finally(() => {
        this.gameListLoading = false;
      });
    },

    // 全选/取消全选游戏
    selectAllGames() {
      if (this.isAllGamesSelected) {
        // 取消全选
        this.tempSelectedGids = [];
      } else {
        // 全选
        this.tempSelectedGids = this.gameList.map(game => game.gid);
      }
    },

    // 显示说明
    showTip(title) {
      this.currentTipTitle = title;
      this.currentTipContent = this.tipContentMap[title] || '暂无说明';
      this.showTipPopup = true;
    },

    // 显示游戏选择
    showGameSelect() {
      this.tempSelectedGids = [...this.formData.gids];
      this.showGamePopup = true;
    },

    // 确认游戏选择
    confirmGameSelect() {
      this.formData.gids = [...this.tempSelectedGids];
      this.selectedGames = this.gameList.filter(game => 
        this.formData.gids.includes(game.gid)
      );
      this.showGamePopup = false;
    },

    // 显示会员选择
    showMemberSelect() {
      this.tempSelectedMembers = [...this.formData.zhidinguser];
      this.searchMembers(); // 初始加载
      this.showMemberPopup = true;
    },

    // 全选/取消全选会员
    selectAllMembers() {
      if (this.isAllMembersSelected) {
        // 取消全选
        this.tempSelectedMembers = [];
      } else {
        // 全选
        this.tempSelectedMembers = this.memberList.map(member => member.username);
      }
    },

    // 搜索会员
    searchMembers() {
      this.memberListLoading = true;
      const params = {};
      if (this.memberSearchKeyword) {
        params.keyword = this.memberSearchKeyword;
      }
      
      this.$u.api.agent.getUserListForOutbet(params).then(res => {
        this.memberList = res.data || [];
      }).catch(err => {
        this.$u.toast('搜索会员失败');
      }).finally(() => {
        this.memberListLoading = false;
      });
    },

    // 确认会员选择
    confirmMemberSelect() {
      this.formData.zhidinguser = [...this.tempSelectedMembers];
      this.selectedMembers = this.memberList.filter(member => 
        this.formData.zhidinguser.includes(member.username)
      );
      this.showMemberPopup = false;
    },

    // 提交表单
    submitForm() {
      uni.showLoading({ title: this.isEdit ? '更新中...' : '保存中...' });
      
      // 准备提交数据
      const submitData = {
        ...this.formData,
        gids: this.formData.gids.join(','), // 将数组转为字符串
        zhidinguser: this.formData.zhidinguser.join(',') // 将数组转为字符串
      };

      // 如果是编辑模式，添加ID
      if(this.isEdit) {
        submitData.id = this.editConfigId;
      }

      // 调用保存接口，让后端处理验证
      this.$u.api.agent.addOutbetOrEdit(submitData).then(res => {
        uni.hideLoading();
        this.$u.toast(this.isEdit ? '更新成功' : '保存成功');
        setTimeout(() => {
          // 回到backUrl
          uni.redirectTo({
            url: '/' + this.backUrl
          });
        }, 800);
      }).catch(err => {
        uni.hideLoading();
        this.$u.toast(err.msg || (this.isEdit ? '更新失败' : '保存失败'));
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.form-container {
  flex: 1;
  padding: 15rpx;
  padding-bottom: 30rpx;
  box-sizing: border-box;
}

.form-item {
  background: #fff;
  margin-bottom: 12rpx;
  border-radius: 12rpx;
  padding: 8rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  
  ::v-deep .u-form-item {
    padding: 6rpx 0;
    
    .u-form-item__body {
      min-height: 48rpx;
    }
    
    .u-form-item__label {
      font-size: 26rpx;
      line-height: 1.2;
      font-weight: 500;
    }
  }
}

.multi-select-container,
.member-select-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
  min-height: 48rpx;
  cursor: pointer;

  .selected-games,
  .selected-members {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    gap: 6rpx;
    align-items: center;
    line-height: 1.3;
  }

  .game-tag,
  .member-tag {
    background: #e3f2fd;
    color: #0087B4;
    padding: 4rpx 10rpx;
    border-radius: 12rpx;
    font-size: 20rpx;
    flex-shrink: 0;
    line-height: 1.2;
  }

  .more-text {
    color: #999;
    font-size: 20rpx;
    align-self: center;
  }

  .placeholder-text {
    color: #c0c4cc;
    font-size: 24rpx;
  }
}

.submit-container {
  padding: 20rpx;
  background: #fff;
  margin-top: 12rpx;
  border-radius: 12rpx;
}

.tip-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;

  .tip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    background: #f8f9fa;
    border-bottom: 2rpx solid #eee;

    .tip-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .close-icon {
      color: #999;
      font-size: 40rpx;
      cursor: pointer;
      line-height: 1;
      font-weight: bold;
      
      &:hover {
        color: #666;
      }
    }
  }

  .tip-content {
    padding: 30rpx;
    color: #666;
    font-size: 28rpx;
    line-height: 1.6;
  }
}

.game-popup {
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 20rpx 20rpx 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background: #fff;
    border-bottom: 2rpx solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 10;

    .header-left {
      flex: 1;
      text-align: left;
    }

    .header-right {
      flex: 1;
      text-align: right;
    }

    .header-center {
      flex: 2;
      text-align: center;
      
      .popup-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
      }

      .selected-count {
        font-size: 24rpx;
        color: #0087B4;
        margin-left: 10rpx;
      }
    }

    .close-btn {
      color: #666;
      font-size: 30rpx;
      padding: 10rpx;
    }

    .confirm-btn {
      color: #0087B4;
      font-size: 30rpx;
      font-weight: bold;
      text-align: right;
      padding: 10rpx;
    }
  }

  .action-section {
    padding: 25rpx 30rpx;
    background: #fff;
    border-bottom: 2rpx solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .game-count {
      .count-text {
        color: #666;
        font-size: 28rpx;
      }
    }

    .action-buttons {
      .select-all-btn {
        display: flex;
        align-items: center;
        padding: 12rpx 24rpx;
        border-radius: 25rpx;
        background: #f8f9fa;
        border: 2rpx solid #e9ecef;
        transition: all 0.3s ease;

        .btn-icon {
          font-size: 28rpx;
          color: #6c757d;
          margin-right: 10rpx;
          font-weight: bold;
        }

        .btn-text {
          color: #495057;
          font-size: 28rpx;
        }

        &.active {
          background: #e8f5e8;
          border-color: #28a745;

          .btn-icon {
            color: #28a745;
          }

          .btn-text {
            color: #28a745;
            font-weight: 500;
          }
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }
  }

  .game-list-container {
    flex: 1;
    min-height: 400rpx;

    .empty-state, .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300rpx;

      .empty-text, .loading-text {
        color: #999;
        font-size: 28rpx;
      }
    }

    .game-scroll-area {
      max-height: 400rpx;
      padding: 0 20rpx;
    }

    .game-grid {
      display: flex;
      flex-wrap: wrap;
      padding: 20rpx;
      gap: 20rpx;

      ::v-deep .u-checkbox-group {
        display: flex !important;
        flex-wrap: wrap !important;
        width: 100% !important;
        gap: 20rpx !important;
      }

      .game-grid-item {
        width: calc(50% - 10rpx);
        transition: all 0.3s ease;

        &.selected {
          .game-content {
            background: #f0f8ff;
            border-color: #0087B4;
          }
        }

        .game-content {
          width: 100%;
          padding: 20rpx;
          background: #fff;
          border: 2rpx solid #e9ecef;
          border-radius: 8rpx;
          min-height: 60rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
          box-sizing: border-box;

          .game-name {
            font-size: 26rpx;
            color: #333;
            font-weight: 500;
            line-height: 1.3;
            flex: 1;
            margin-right: 15rpx;
          }

          ::v-deep .u-checkbox {
            .u-checkbox__icon-wrap {
              width: 32rpx;
              height: 32rpx;
            }
            
            .u-checkbox__label {
              display: none !important;
            }
          }
        }
      }
    }
  }
}

.member-popup {
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 20rpx 20rpx 0 0;

  .popup-header {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background: #fff;
    border-bottom: 2rpx solid #f0f0f0;
    position: sticky;
    top: 0;
    z-index: 10;

    .header-left {
      flex: 1;
      text-align: left;
    }

    .header-right {
      flex: 1;
      text-align: right;
    }

    .header-center {
      flex: 2;
      text-align: center;
      
      .popup-title {
        font-size: 34rpx;
        font-weight: bold;
        color: #333;
      }

      .selected-count {
        font-size: 24rpx;
        color: #0087B4;
        margin-left: 10rpx;
      }
    }

    .close-btn {
      color: #666;
      font-size: 30rpx;
      padding: 10rpx;
    }

    .confirm-btn {
      color: #0087B4;
      font-size: 30rpx;
      font-weight: bold;
      padding: 10rpx;
    }
  }

  .action-section {
    padding: 20rpx 30rpx;
    background: #fff;
    border-bottom: 2rpx solid #f0f0f0;
    display: flex;
    flex-direction: column;
    gap: 15rpx;

    .search-container {
      flex: 1;
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;

      .select-all-btn {
        display: flex;
        align-items: center;
        padding: 12rpx 24rpx;
        border-radius: 25rpx;
        background: #f8f9fa;
        border: 2rpx solid #e9ecef;
        transition: all 0.3s ease;

        .btn-icon {
          font-size: 28rpx;
          color: #6c757d;
          margin-right: 10rpx;
          font-weight: bold;
        }

        .btn-text {
          color: #495057;
          font-size: 28rpx;
        }

        &.active {
          background: #e8f5e8;
          border-color: #28a745;

          .btn-icon {
            color: #28a745;
          }

          .btn-text {
            color: #28a745;
            font-weight: 500;
          }
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }
  }

  .member-list-container {
    flex: 1;
    min-height: 300rpx;

    .empty-state, .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 300rpx;

      .empty-text, .loading-text {
        color: #999;
        font-size: 28rpx;
      }
    }

    .member-scroll-area {
      max-height: 400rpx;
      padding: 0 20rpx;
    }

    .member-grid {
      display: flex;
      flex-wrap: wrap;
      padding: 20rpx;
      gap: 20rpx;

      ::v-deep .u-checkbox-group {
        display: flex !important;
        flex-wrap: wrap !important;
        width: 100% !important;
        gap: 20rpx !important;
      }

      .member-grid-item {
        width: calc(50% - 10rpx);
        transition: all 0.3s ease;

        &.selected {
          .member-content {
            background: #f0f8ff;
            border-color: #0087B4;
          }
        }

        .member-content {
          width: 100%;
          padding: 20rpx;
          background: #fff;
          border: 2rpx solid #e9ecef;
          border-radius: 8rpx;
          min-height: 80rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
          box-sizing: border-box;

          .member-info {
            flex: 1;
            margin-right: 15rpx;

            .member-username {
              font-size: 26rpx;
              color: #333;
              font-weight: 500;
              line-height: 1.3;
            }

            .member-name {
              font-size: 22rpx;
              color: #0087B4;
              margin-top: 5rpx;
              line-height: 1.2;
            }
          }

          ::v-deep .u-checkbox {
            flex-shrink: 0;
            
            .u-checkbox__icon-wrap {
              width: 32rpx;
              height: 32rpx;
            }
            
            .u-checkbox__label {
              display: none !important;
            }
          }
        }
      }
    }
  }
}

::v-deep .u-radio-group {
  .u-radio {
    margin-right: 24rpx;
    
    .u-radio__label {
      font-size: 22rpx;
    }
    
    .u-radio__icon-wrap {
      width: 32rpx;
      height: 32rpx;
    }
  }
}

::v-deep .u-switch {
  transform: scale(0.7);
}

/* 优化uView输入框样式 */
::v-deep .u-input {
  .u-input__content {
    min-height: 48rpx;
    
    .u-input__content__field-wrapper {
      min-height: 48rpx;
      
      .u-input__content__field-wrapper__field {
        font-size: 22rpx;
        line-height: 1.3;
      }
    }
  }
}

.custom-select {
  flex: 1;
  padding: 8rpx 14rpx;
  background-color: #f5f9ff;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  color: #333;
  font-size: 22rpx;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik04ODQuMTI4IDM0NC4wNjRsLTMzNC4wOCAzMzQuMDk2YTMyIDMyIDAgMCAxLTQ1LjI0OCAwbC0zMzQuMDk2LTMzNC4wOTZhMzIgMzIgMCAwIDEgNDUuMjQ4LTQ1LjI0OEw1MTIgNjAyLjI0bDMwNi4xNzYtMzAzLjQyNGEzMiAzMiAwIDEgMSA0NS4yNTYgNDUuMjQ4eiIgZmlsbD0iIzMzMzMzMyIvPjwvc3ZnPg==");
  background-repeat: no-repeat;
  background-position: right 14rpx center;
  background-size: 18rpx;
  padding-right: 44rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  min-height: 48rpx;
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

/* Textarea 样式优化 */
::v-deep .u--textarea {
  .u-textarea {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    line-height: 1.5 !important;
  }
  
  .u-textarea__textarea {
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
    line-height: 1.5 !important;
    resize: vertical !important;
  }
}

/* 原生 textarea 样式 */
.native-textarea {
  width: 100%;
  height: 96rpx;
  background-color: #f5f9ff;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  padding: 12rpx;
  font-size: 22rpx;
  color: #333;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: all 0.3s ease;
  line-height: 1.3;

  &:focus {
    border-color: #0087B4;
    background-color: #fff;
    box-shadow: 0 0 0 4rpx rgba(0, 135, 180, 0.1);
  }

  &:hover {
    border-color: #0087B4;
    background-color: #fff;
  }

  &::placeholder {
    color: #c0c4cc;
    font-size: 22rpx;
  }
}

/* 确保表单项中的textarea正常显示 */
.form-item {
  ::v-deep .u--textarea {
    width: 100%;
    
    .u-textarea {
      width: 100%;
      min-height: 80rpx;
      background-color: #f5f9ff;
      border: 2rpx solid #e5e5e5;
      border-radius: 12rpx;
      padding: 20rpx;
      font-size: 26rpx;
      line-height: 1.5;
      color: #333;
      
      &:focus {
        border-color: #0087B4;
        background-color: #fff;
        box-shadow: 0 0 0 4rpx rgba(0, 135, 180, 0.1);
      }
    }
    
    .u-textarea__textarea {
      font-size: 26rpx !important;
      color: #333 !important;
      line-height: 1.5 !important;
      white-space: pre-wrap !important;
      word-break: break-all !important;
      
      &::placeholder {
        color: #c0c4cc;
        font-size: 26rpx;
      }
    }
  }
}
</style>

<!-- 全局样式 -->
<style>
/* 全局样式：确保页面可以正常滚动 */
page {
  background-color: #f5f5f5;
}

/* H5端处理 */
/* #ifdef H5 */
html, body {
  margin: 0;
  padding: 0;
}
/* #endif */
</style> 