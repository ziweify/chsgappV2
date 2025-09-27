import Vue from 'vue';
import App from './App';
import store from '@/store';
import uView from '@/uni_modules/uview-ui';
import websocketUtils from '@/common/websocketUtils.js';
// import performanceMonitor from '@/common/performanceMonitor.js';
import mymixin from '@/libs/mixin/mixin';

// 初始化性能监控器 - 已禁用
// uni.$performanceMonitor = performanceMonitor;

// 初始化WebSocket工具
uni.$socketUtils = new websocketUtils();

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
