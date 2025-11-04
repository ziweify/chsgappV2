/**
 * 聊天页面可见性修复示例
 * 
 * 这个文件展示了如何在 chat.vue 中集成页面可见性管理
 * 复制相关代码到 chat.vue 即可使用
 * 
 * 使用方法：
 * 1. 复制 data() 中的新增字段到你的 chat.vue
 * 2. 复制 onLoad() 中的代码到你的 onLoad()
 * 3. 替换 onShow() 和 onHide()
 * 4. 复制 methods 中的方法到你的 methods
 * 5. 更新 onUnload() 添加清理代码
 */

export default {
  data() {
    return {
      // ========== 🆕 新增字段 ==========
      visibilityUnsubscribe: null,  // 可见性监听取消函数
      isPageActive: false,           // 页面是否活跃
      pageHideTime: null,            // 页面隐藏时间
      
      // ========== 现有字段（示例）==========
      gid: 0,
      utype: 0,
      periodtimer: null,
      balancetimer: null,
      isDestroyed: false,
      // ... 其他现有字段
    };
  },
  
  onLoad(e) {
    // ========== 现有的 onLoad 代码 ==========
    // this.gid = e.gid;
    // ... 其他初始化代码
    
    // ========== 🆕 添加页面可见性监听 ==========
    // 只在 H5 环境添加（小程序和 APP 用 onShow/onHide 即可）
    // #ifdef H5
    this.visibilityUnsubscribe = uni.$visibilityManager.addListener('visible', (data) => {
      console.log('📱 聊天页面恢复可见', {
        隐藏时长: `${(data.hiddenDuration / 1000).toFixed(1)}秒`,
        来源: data.source
      });
      
      // 只在页面处于活跃状态时处理
      if (this.isPageActive) {
        this.handlePageResume(data);
      }
    }, { priority: 50 });
    
    console.log('✅ 聊天页面可见性监听已注册');
    // #endif
  },
  
  onShow() {
    console.log('📱 聊天页面 onShow');
    
    // ========== 🆕 修改：添加活跃状态和时长计算 ==========
    this.isPageActive = true;
    const hiddenDuration = this.pageHideTime ? Date.now() - this.pageHideTime : 0;
    
    if (hiddenDuration > 0) {
      console.log(`页面恢复，后台时长: ${(hiddenDuration / 1000).toFixed(1)}秒`);
    }
    
    // ========== 🆕 修改：统一使用辅助方法启动定时器 ==========
    this.startAllTimers();
    
    // ========== 🆕 修改：立即刷新数据 ==========
    this.refreshChatData();
    
    // ========== 🆕 新增：监听全局应用恢复事件 ==========
    uni.$on('app_resumed_from_background', this.handleAppResume);
    
    // ========== 现有代码：其他 onShow 逻辑 ==========
    // 例如：预览图片标记检查
    if (this.previewImageFlag) {
      this.previewImageFlag = false;
      return;
    }
  },
  
  onHide() {
    console.log('📱 聊天页面 onHide');
    
    // ========== 🆕 修改：记录状态 ==========
    this.isPageActive = false;
    this.pageHideTime = Date.now();
    
    // ========== 🆕 修改：清理定时器 ==========
    this.clearAllTimers();
    
    // ========== 🆕 新增：取消全局事件监听 ==========
    uni.$off('app_resumed_from_background', this.handleAppResume);
  },
  
  onUnload() {
    console.log('📱 聊天页面 onUnload');
    
    // ========== 🆕 新增：清理可见性监听 ==========
    if (this.visibilityUnsubscribe) {
      this.visibilityUnsubscribe();
      this.visibilityUnsubscribe = null;
    }
    
    // ========== 🆕 修改：统一清理定时器 ==========
    this.clearAllTimers();
    
    // ========== 🆕 新增：取消全局事件监听 ==========
    uni.$off('app_resumed_from_background', this.handleAppResume);
    
    // ========== 🆕 修改：标记为已销毁 ==========
    this.isDestroyed = true;
    
    // ========== 现有代码：其他清理逻辑 ==========
    // ... 其他 onUnload 代码
  },
  
  methods: {
    // ========== 🆕 新增方法 ==========
    
    /**
     * 处理页面恢复
     * @param {Object} data - 恢复数据 {hiddenDuration, source, ...}
     */
    handlePageResume(data) {
      console.log('⚡ 聊天页面恢复处理', data);
      
      // 1. 检查并重启定时器（如果不存在）
      if (!this.periodtimer || !this.balancetimer) {
        console.log('⚠️ 检测到定时器丢失，重新启动');
        this.startAllTimers();
      }
      
      // 2. 立即刷新数据
      this.refreshChatData();
      
      // 3. 如果隐藏时间较长（超过10秒），执行深度刷新
      if (data.hiddenDuration && data.hiddenDuration > 10000) {
        console.log('⚡ 后台时间较长，执行深度刷新');
        this.deepRefreshChatData();
      }
    },
    
    /**
     * 处理应用从后台恢复
     * @param {Object} data - 恢复数据
     */
    handleAppResume(data) {
      console.log('📱 应用从后台恢复', data);
      
      // 只在当前页面活跃时处理
      if (this.isPageActive) {
        this.handlePageResume(data);
      }
    },
    
    /**
     * 启动所有定时器
     * 统一管理定时器的启动，确保不会重复创建
     */
    startAllTimers() {
      console.log('🕐 启动所有定时器');
      
      // 先清理旧定时器
      this.clearAllTimers();
      
      // 1. 启动期号/倒计时定时器（每秒）
      if (!this.periodtimer) {
        // 先执行一次
        this.getperiod && this.getperiod();
        
        this.periodtimer = setInterval(() => {
          // 检查页面状态和销毁标记
          if (!this.isDestroyed && this.isPageActive) {
            this.timerCheck && this.timerCheck();
            this.gitemTimeCheck && this.gitemTimeCheck();
          }
        }, 1000);
        
        console.log('✅ 期号定时器已启动');
      }
      
      // 2. 启动余额/数据查询定时器（8-10秒）
      if (!this.balancetimer) {
        // 房主账号查询更复杂，微调查询间隔
        const queryInterval = this.utype === 1 ? 10000 : 8000;
        
        this.balancetimer = setInterval(() => {
          console.log(`⏰ 余额定时器触发 - 类型:${this.utype}, ID:${this.balancetimer}`);
          
          // 检查页面状态、销毁标记和 WebSocket 连接
          if (!this.isDestroyed && this.isPageActive && uni.$socketUtils.isOpenSocket) {
            this.sendWebSocketQueries();
            this.getRoomConfig && this.getRoomConfig();
          }
        }, queryInterval);
        
        console.log(`✅ 余额定时器已启动（间隔: ${queryInterval/1000}秒）`);
      }
    },
    
    /**
     * 清理所有定时器
     * 统一管理定时器的清理
     */
    clearAllTimers() {
      if (this.periodtimer) {
        clearInterval(this.periodtimer);
        this.periodtimer = null;
        console.log('🧹 期号定时器已清理');
      }
      
      if (this.balancetimer) {
        clearInterval(this.balancetimer);
        this.balancetimer = null;
        console.log('🧹 余额定时器已清理');
      }
    },
    
    /**
     * 发送 WebSocket 查询
     * 根据用户类型发送不同的查询请求
     */
    sendWebSocketQueries() {
      if (!uni.$socketUtils || !uni.$socketUtils.isOpenSocket) {
        console.warn('⚠️ WebSocket 未连接，跳过查询');
        return;
      }
      
      if (this.utype === 1) {
        // 房主账号：分散发送消息，避免复杂查询同时触发
        uni.$socketUtils.send({eventType: "openResult", gid: this.gid});
        setTimeout(() => {
          uni.$socketUtils.send({eventType: "periodListOrSingle"});
        }, 200);
        setTimeout(() => {
          uni.$socketUtils.send({eventType: "getBalanceInfo"});
        }, 400);
      } else {
        // 普通会员：正常发送
        uni.$socketUtils.send({eventType: "getBalanceInfo"});
        uni.$socketUtils.send({eventType: "periodListOrSingle"});
        uni.$socketUtils.send({eventType: "openResult", gid: this.gid});
      }
    },
    
    /**
     * 刷新聊天数据
     * 页面恢复时立即刷新一次数据
     */
    refreshChatData() {
      console.log('🔄 刷新聊天数据');
      
      // 1. 发送 WebSocket 查询
      this.sendWebSocketQueries();
      
      // 2. 刷新房间配置
      if (this.getRoomConfig) {
        this.getRoomConfig();
      }
      
      // 3. 获取期号信息
      if (this.getperiod) {
        this.getperiod();
      }
      
      // 4. 如果是会员，更新快捷下注详情
      if (this.utype == 0 && this.quickPlayDetail) {
        this.quickPlayDetail();
      }
    },
    
    /**
     * 深度刷新聊天数据
     * 后台时间较长时，执行更全面的数据刷新
     */
    deepRefreshChatData() {
      console.log('⚡ 深度刷新聊天数据');
      
      // 1. 执行常规刷新
      this.refreshChatData();
      
      // 2. 重新加载聊天记录（如果有此方法）
      if (this.loadChatRecords) {
        console.log('🔄 重新加载聊天记录');
        // 可以考虑只加载最近的消息
        // this.loadChatRecords();
      }
      
      // 3. 刷新其他可能过期的数据
      // 例如：长龙数据
      if (this.gid && this.$u && this.$u.api && this.$u.api.common && this.$u.api.common.longdragon) {
        this.$u.api.common.longdragon({gid: this.gid}).then(res => {
          this.cllist = res.data;
          console.log('✅ 长龙数据已刷新');
        }).catch(err => {
          console.error('❌ 长龙数据刷新失败:', err);
        });
      }
      
      // 4. 其他需要深度刷新的数据
      // ...
    },
    
    // ========== 现有方法（示例，需保持原有逻辑）==========
    
    /**
     * 定时器检查 - 示例方法
     */
    timerCheck() {
      // 现有的定时器检查逻辑
      // ...
    },
    
    /**
     * 游戏时间检查 - 示例方法
     */
    gitemTimeCheck() {
      // 现有的游戏时间检查逻辑
      // ...
    },
    
    /**
     * 获取期号 - 示例方法
     */
    getperiod() {
      // 现有的获取期号逻辑
      // ...
    },
    
    /**
     * 获取房间配置 - 示例方法
     */
    getRoomConfig() {
      // 现有的获取房间配置逻辑
      // ...
    },
    
    /**
     * 快捷下注详情 - 示例方法
     */
    quickPlayDetail() {
      // 现有的快捷下注详情逻辑
      // ...
    },
    
    // ... 其他现有方法
  }
};

