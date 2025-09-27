import Decimal from '@/static/decimal.min.js'
const timeoutMap = {};
//弹出toast信息
const showToast = (title,icon = 'none') => {
	uni.showToast({
		title,
		icon
	})
}

const setTabbar = (that) => {
	const nav = that.$t("nav")
	for(let i = 0; i < nav.length; i++){
		uni.setTabBarItem({
			index:i,
			text:nav[i],
			fail(res) {
				console.log(res);
			}
		})
	}
}

const jump = (url,type = 'navigateTo') => {
	//const backUrl = page.route || page.$route.path;
	//if(backUrl){uni.setStorageSync('backUrl',backUrl);}
	switch(type){
		case 'navigateTo':
			if(!url){
				uni.navigateBack({delta:1});
				return;
			}
			uni.navigateTo({url: "/"+url});
			return;
		case 'redirectTo':
			uni.redirectTo({url: "/"+url})
			return;
		case 'reLaunch':
			uni.reLaunch({url: "/"+url})
			return;
		case 'switchTab':
			uni.switchTab({url: "/"+url})
			return;
		case 'navigateBack':
			const plength = getCurrentPages().length;
			if(url && plength <= 1){
				uni.navigateTo({url:"/"+url});
			}else{
				uni.navigateBack({delta:1});
			}
			/*if(typeof url === 'number' && pages.length > 1) {
				uni.navigateBack({delta:url});
			}else{
				url = uni.getStorageSync('backUrl') || '';
				uni.navigateTo({url:"/"+url});
			}*/
	}
}

// 判断字符串是否为数字和字母组合
const checkIsNumAndWords = str =>{
   
    var reg =  /^[0-9a-zA-Z]*$/;  
    if (!reg.test(str)) {
        return false;
    } else {
        return true;
    }
}

//去除所有特殊字符
const charFilter = str => {
    var pattern = new RegExp("[`~!#$^&*()=|{}':;',\\[\\]<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]", 'g');
    return str.replace(pattern, '');
}

//判断是否有特殊字符
const charTest = str => {
	var pattern = new RegExp("[`~!#$^&*()=|{}':;',\\[\\]<>/?~！#￥……&*（）——|{}【】‘；：”“'。，、？]", 'g');
	if(pattern.test(str)) return true
	return false
}

//去除html标签
const removehtmltag = (str) => {
    return str.replace(/<[^>]+>/g, '')
}

// 获取url参数
const getQueryString = (name) => {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    const search = window.location.search.split('?')[1] || '';
    const r = search.match(reg) || [];
    return r[2];
}

const stamp2Time = (ts,type = 'd') => {
	if(!ts) return 0
	if(typeof(ts) == 'string') ts = Number(ts)
	if(ts.toString().length > 10) ts = ts / 1000
	const d = parseInt(ts  / 60 / 60 / 24, 10);
	const h = parseInt(ts  / 60 / 60 % 24, 10);
	const m = parseInt(ts  / 60 % 60, 10);
	const s =parseInt(ts  % 60, 10);
	
	switch(type){
		case 'd':
			return checkTime(d);
		case 'h':
			return checkTime(h);
		case 'm':
			return checkTime(m);
		case 's':
			return checkTime(s);
	}
}

function checkTime(i){
	if (i < 10) {
	        i = "0" + i;
	    }
	return i;
}

//解决js加减法的精度问题
const math = (a,method,b) => {
	switch(method){
		case '+':
			return new Decimal(a).add(new Decimal(b)).toNumber() ;
		case '-':
			return new Decimal(a).sub(new Decimal(b)).toNumber();
		case '*':
			return new Decimal(a).mul(new Decimal(b)).toNumber();
		case '/':
			return new Decimal(a).div(new Decimal(b)).toNumber();
	}
}

//根据基准宽度和高度计算比例高度值
const getDivicePx = (vm,height,type = 1)=>{
	const baseHeight = 677,baseWidth = 375;
	const sys = vm.$u.sys();
	let screenHeight = sys.windowHeight; // 获取屏幕高度
	let screenWidth = sys.windowWidth; // 获取屏幕宽度
	let statusBarHeight = sys.statusBarHeight || 0; // 状态栏高度，部分设备可能没有
	let baseHeaderHeight = height; // 基准设备上固定元素的高度
	let currentAspectRatio = screenHeight/screenWidth;
	let baseAspectRatio = baseHeight/baseWidth;
	let headerHeight = 0;
	if (currentAspectRatio > baseAspectRatio) {
		headerHeight = baseHeaderHeight * (screenWidth/baseWidth);
	} else {
		headerHeight = baseHeaderHeight * (screenHeight/baseHeight);
	}
	if(type == 1){
		return headerHeight+statusBarHeight;
	}else{
		return screenHeight-headerHeight+statusBarHeight;
	}
}

function delay(callback, ms = 100, key) {
	const timeout = setTimeout(callback, ms);
	if (!!key) {
		timeoutMap[key] && clearTimeout(timeoutMap[key]);
		timeoutMap[key] = timeout;
	}
	return timeout;
}


export default{
	showToast,
	setTabbar,
	jump,
	checkIsNumAndWords,
	charFilter,
	charTest,
	removehtmltag,
	getQueryString,
	stamp2Time,
	math,
	getDivicePx,
	delay
}