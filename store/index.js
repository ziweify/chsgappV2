import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
import Socketio from '@/js_sdk/hyoga-uni-socket_io/uni-socket.io.js'
const store = new Vuex.Store({
	state: {
		site_name: 'SG',
		coins: [],
		assetsType: [],
		baseUrl: process.env.NODE_ENV === 'development' ? '/api' : "/api",
		baseDomain:"",
		logo: '',
		logoRed: '',
		lang: uni.getStorageSync('lang') || 'en',
		token: uni.getStorageSync('token') || '',
		user: uni.getStorageSync('user') || {},
		socket:null,
		fiat:uni.getStorageSync('fiat') || {currency_code:'USD',rate:1,saveTime:0},
		fiats:uni.getStorageSync('fiats') || []
	},
	actions: {
		startSocket({commit,state}){
			return new Promise((resole, reject) => {
				state.socket = Socketio(state.baseDomain, {
					transports: [ 'websocket', 'polling' ],
					reconnection: true
				});
				state.socket.on("connect",(socket)=>{
					resole(true)
				})
			})
		}
	},
	mutations: {
		setSiteName(state, str) {
			state.site_name = str
		},
		setLogo(state, logo) {
			state.logo = logo
		},
		setLogoRed(state, logo) {
			state.logoRed = logo
		},
		//登陆过后保存用户信息
		saveUser(state, data) {
			state.token = data.message
			uni.setStorageSync('token', data.message)
		},
		//刷新用户信息
		refreshUser(state, data) {
			state.user = data
			uni.setStorageSync('user', data)
		},
		//清除用户信息
		deleteUser(state) {
			uni.removeStorageSync('token')
			uni.removeStorageSync('userInfo')
		}
	}
})

export default store
