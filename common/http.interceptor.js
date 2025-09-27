import {HTTP_REQUEST_URL} from './config.js';
const install = (Vue, vm) => {
	// 初始化请求配置
	uni.$u.http.setConfig((config) => {
		/* config 为默认全局配置*/
		config.baseURL = HTTP_REQUEST_URL; /* 根域名 */
		return config
	})

	// 请求拦截
	uni.$u.http.interceptors.request.use((config) => { // 可使用async await 做异步操作
		// 初始化请求拦截器时，会执行此方法，此时data为undefined，赋予默认{}
		config.header['Authorization'] = uni.getStorageSync('token');
		return config
	}, config => { // 可使用async await 做异步操作
		return Promise.reject(config)
	})

	// 响应拦截
	uni.$u.http.interceptors.response.use((response) => {
		const res = response.data;
		if(res.status == 200) {
			return res;
		} else if(res.status == 1003){
			uni.$utils.showToast(res.msg)
			vm.$store.commit('deleteUser')
			if(uni.$socketUtils.isOpenSocket){
				uni.$socketUtils.closeSocket('user_exit_gamehall');
			}
			setTimeout(()=>{
				uni.reLaunch({
					url:'/pages/common/login'
				})
			},1200)
			return false;
		}else{
			const custom = response.config?.custom;
			if (custom?.catch) {//如果需要catch返回，则进行reject
				return Promise.reject(res);
			} else {
				// 如果没有显式定义custom的toast参数为false的话，默认对报错进行toast弹出提示
				if (custom?.notToast !== true) {
					uni.$u.toast(res.msg);
				}
				return new Promise(() => { });// 否则返回一个pending中的promise，请求不会进入catch中
			}
		}
	}, (response) => {
		return Promise.reject(response)
	})
}
export default {
	install
}