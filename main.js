import Vue from 'vue';
import App from './App';
import store from '@/store';
import uView from '@/uni_modules/uview-ui';
import websocketUtils from '@/common/websocketUtils.js';
import VisibilityManager from '@/common/visibilityManager.js';
// import performanceMonitor from '@/common/performanceMonitor.js';
import mymixin from '@/libs/mixin/mixin';

// 初始化性能监控器 - 已禁用
// uni.$performanceMonitor = performanceMonitor;

// 初始化WebSocket工具
uni.$socketUtils = new websocketUtils();

// 初始化页面可见性管理器
uni.$visibilityManager = new VisibilityManager();

// 将 WebSocket 与可见性管理器关联
// 页面恢复可见时，检查并重连 WebSocket
uni.$visibilityManager.addListener('visible', (data) => {
    console.log('📱 全局：页面恢复可见', data);
    
    // 页面恢复时，检查 WebSocket 连接状态
    if (!uni.$socketUtils.isOpenSocket) {
        console.log('🔄 全局：检测到 WebSocket 未连接，尝试重连');
        // 给一些时间让页面完全恢复
        setTimeout(() => {
            if (!uni.$socketUtils.isOpenSocket && !uni.$socketUtils.isUserClose) {
                uni.$socketUtils.debouncedReconnect('visibility_manager_visible', true);
            }
        }, 500);
    }
}, { priority: 100 }); // 高优先级，优先执行

// 页面隐藏时的处理
uni.$visibilityManager.addListener('hidden', (data) => {
    console.log('📱 全局：页面进入后台', data);
    // 页面隐藏时保持 WebSocket 连接，不做额外操作
});

Vue.config.productionTip = false;
Vue.use(uView);
//uni.$u.config.unit = 'rpx'
App.mpType = 'app';

const app = new Vue({
	store,
	...App
});

// http拦截器，将此部分放在new Vue()和app.$mount()之间，才能App.vue中正常使用
import httpInterceptor from '@/common/http.interceptor.js';
Vue.use(httpInterceptor, app);
// http接口API抽离，免于写url或者一些固定的参数
import httpApi from '@/common/http.api.js';
Vue.use(httpApi, app);

//常用js工具
import utils from '@/common/utils'
uni.$utils = utils;
uni.$mymixin = mymixin;

// 添加全局显示性能报告的方法 - 已禁用
// uni.$showPerformanceReport = () => {
//     performanceMonitor.showPerformanceReport();
// };

app.$mount();
