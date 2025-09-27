// 此处第二个参数vm，就是我们在页面使用的this
const install = (Vue, vm) => {
	const http = uni.$u.http;
	const common = {
		getSiteConfig: () => http.get("/common/siteConfig"),
		getcaptcha: (params) => http.post("/common/captcha",params),//获取验证码

		//在线客服
		customChatRecords: (params) => http.get("/common/customChatRecords",{params:params}),//聊天记录
		uploadChatImage: (params) => http.post("/common/uploadChatImage",params),//上传聊天图片

		chatRecords: (params) => http.get("/common/chatRecords",{params:params}),//聊天室聊天记录
		logout: () => http.post("/common/logout"),//退出登陆
		updatePwd: (params) => http.post("/common/updatePwd",params),//修改密码

		getperiod: (params) => http.get("/common/period",{params:params}),//获取某个游戏的期数数据
		longdragon: (params) => http.get("/common/longdragon",{params:params}),//长龙查询
		lotteryPredictInfo: (params) => http.get("/common/lotteryPredictInfo",{params:params}),//预测

		resultByDate: (params) => http.get("/common/resultByDate",{params:params}),//根据条件查询开奖结果
		getOtherConfig: (params) => http.get("/common/getOtherConfig",{params:params}),//获取其他配置
		getGameListByIfok: (params) => http.get("/common/getGameListByIfok",{params:params}),//获取游戏列表
		getRoomConfig: (params) => http.get("/common/getRoomConfig",{params:params}),//房间配置
		tokenauth: (params) => http.post("/common/tokenauth", params, {custom:{catch:true}}),//token验证
	}
	
	const member = {//会员端接口
		register: (params) => http.post("/member/register", params,{custom:{catch:true}}),//注册
		login: (params) => http.post("/member/login", params,{custom:{catch:true}}),//登陆
		getHistoryRoomList: () => http.get("/member/getHistoryRoomList"),//房间历史列表
		delRoomhistory: (params) => http.post("/member/delRoomhistory",params),//删除房间
		enterroom: (params) => http.post("/member/enterroom",params),//加入房间
		updateNickName: (params) => http.post("/member/updateNickName",params),//修改昵称
		getRoomNotice: (params) => http.get("/member/getRoomNotice",{params:params}),//获取房间公告
		getperiodlistorsingle: (params) => http.get("/member/periodlistorsingle",{params:params}),//获取游戏列表

		quickPlayDetail: (params) => http.get("/member/quickPlayDetail",{params:params}),//快捷赔率
		getBetsSumByLotteryId: (params) => http.get("/member/getBetsSumByLotteryId",{params:params}),//期数订单数据
		getLotterySettledList: (params) => http.get("/member/getLotterySettledList",{params:params}),//根据游戏id和期数查询

		//钱包中心
		getBalanceInfo: () => http.get("/member/getBalanceInfo"),//获取余额信息
		getApplyList: (params) => http.get("/member/getApplyList",{params:params}),//获取申请列表
		getReport: (params) => http.get("/member/report",{params:params}),//获取报表
		getBetrecord: (params) => http.get("/member/getBetrecord",{params:params}),//获取投注记录
		getWjsRecord: (params) => http.get("/member/getWjsRecord",{params:params}),//获取未结算记录
		getMoneyLogList: (params) => http.get("/member/getMoneyLogList",{params:params}),//获取资金记录
		initFirstPwd: (params) => http.post("/member/initFirstPwd",params),//设置初始密码

		//房间介绍
		gameintroduce: (params) => http.get("/member/gameintroduce",{params:params}),//获取游戏介绍

		getRegUserinfo: (params) => http.get("/member/getRegUserinfo",{params:params}),//获取注册信息
	}

	const agent = {//代理端接口
		login: (params = {}) => http.post("/agent/login", params,{custom:{catch:true}}),//登陆
		logout: () => http.post("/agent/logout"),//退出登陆
		getRoomNotice: (params) => http.get("/agent/getRoomNotice",{params:params}),//获取房间公告
		updateGameStatus: (params) => http.get("/agent/updateGameStatus",{params:params}),//更新游戏开关
		getOnlineCount: () => http.get("/agent/getOnlineCount"),//获取在线人数
		getGameAndTimedata: (params) => http.get("/agent/getGameAndTimedata",{params:params}),//获取游戏列表和时间

		//在线客服
		getRecentChatUserList: (params) => http.get("/agent/getRecentChatUserList",{params:params}),//最近聊天会员列表
		deleteRecentChat: (params) => http.post("/agent/deleteRecentChat",params),//删除最近聊天记录

		getGameListAll: (params) => http.get("/agent/getGameListAll",{}),//获取游戏列表
		getOnlineUserList: (params) => http.get("/agent/getOnlineUserList",{params:params}),//获取在线用户列表

		//游戏数据
		getGameData: (params) => http.get("/agent/gameData",{params:params}),//获取游戏数据
		betDataByPeriod: (params) => http.get("/agent/betDataByPeriod",{params:params}),//获取某个期数的投注数据
		betDataRecord: (params) => http.get("/agent/betDataRecord",{params:params}),//投注数据记录列表

		//房间设置
		getConfigInfo: (params) => http.get("/agent/roomConfig/configInfo",{}),//获取房间配置
		saveConfig: (params) => http.post("/agent/roomConfig/saveConfig",params),//保存房间配置
		refreshRoomId: (params) => http.post("/agent/roomConfig/refreshRoomId",params),//刷新房间ID
		getGameSettingList: (params) => http.get("/agent/roomConfig/getGameSettingList",{}),//获取游戏列表
		switchGame: (params) => http.post("/agent/roomConfig/switchGame",params),//游戏开关设置
		saveGameSetting: (params) => http.post("/agent/roomConfig/saveGameSetting",params),//保存游戏设置
		getGameMsgList: (params) => http.get("/agent/roomConfig/getGameMsgList",{params}),//获取游戏公告列表
		saveGameMsg: (params) => http.post("/agent/roomConfig/saveGameMsg",params),//保存游戏消息
		synAllGameMsg: (params) => http.post("/agent/roomConfig/synAllGameMsg",params),//同步所有游戏消息
		resetGameMsg: (params) => http.post("/agent/roomConfig/resetGameMsg",params),//重置游戏消息

		//申请管理
		getApplyList: (params) => http.get("/agent/apply/getApplyList",{params:params}),//申请列表
		doApply: (params) => http.post("/agent/apply/doApply",params),//审核申请

		//管理中心
		getCenterInfo: () => http.get("/agent/center/centerInfo",{}),//获取代理信息
		getUserList: (params) => http.get("/agent/center/getUserList",{params:params}),//代理列表
		registerAccount: (params) => http.post("/agent/center/registerAccount",params),//注册账号
		updateAccount: (params) => http.post("/agent/center/updateAccount",params),//修改账号
		generateLink: (params) => http.post("/agent/center/generateLink",params),//生成链接
		modifyStatus: (params) => http.post("/agent/center/modifyStatus",params),//修改状态
		delAllZeroUser: () => http.post("/agent/center/delAllZeroUser",{}),//删除0余额用户
		shangxiafen: (params) => http.post("/agent/center/shangxiafen",params),//上下分
		getSonAccountList: (params) => http.get("/agent/center/getSonAccountList",{params:params}),//获取子账号列表
		addSonAccount: (params) => http.post("/agent/center/addSonAccount",params),//添加子账号
		delSonAccount: (params) => http.post("/agent/center/delSonAccount",params),//删除子账号
		updateSonStatus: (params) => http.post("/agent/center/updateSonStatus",params),//修改子账号状态
		resetErrors: (params) => http.post("/agent/center/resetErrors",params),//重置错误次数
		updateSonAccount: (params) => http.post("/agent/center/updateSonAccount",params),//修改子账号信息
		resetGoogle: (params) => http.post("/agent/center/resetGoogle",params),//重置谷歌验证
		getLinkRecord: (params) => http.get("/agent/center/getLinkRecord",{params:params}),//获取链接生成记录

		//二次验证
		getSecondver: (params) => http.get("/agent/verify/getSecondver",{params:params}),//获取二次验证
		saveSecondver: (params) => http.post("/agent/verify/saveSecondver",params),//保存二次验证
		resetSecondver: (params) => http.post("/agent/verify/resetSecondver",params),//重置二次验证

		//赔率设置
		getOddsSet: (params) => http.get("/agent/odds/getOddsSet",{params:params}),//获取赔率设置
		saveOddsSet: (params) => http.post("/agent/odds/saveOddsSet",params),//保存赔率设置
		synOddsSet: (params) => http.post("/agent/odds/synOddsSet",params),//同步赔率设置

		//报表
		getReportAll: (params) => http.get("/agent/report/getReportAll",{params:params}),//报表
		getReportUser: (params) => http.get("/agent/report/getReportUser",{params:params}),//用户报表
		getReportWjs: (params) => http.get("/agent/report/getReportWjs",{params:params}),//未结算报表
		getReportLogs: (params) => http.get("/agent/report/getReportLogs",{params:params}),//日志报表
		getBetrecordByUser: (params) => http.get("/agent/report/getBetrecordByUser",{params:params}),//用户投注记录

		//打单配置
		getUserListForOutbet: (params) => http.get("/agent/outbet/getUserListForOutbet",params),//获取会员列表
		addOutbetOrEdit: (params) => http.post("/agent/outbet/addOutbetOrEdit",params),//添加打单配置
		getOutbetList: (params) => http.get("/agent/outbet/getOutbetList",{params:params}),//获取打单配置列表
		getOutbetInfo: (params) => http.get("/agent/outbet/getOutbetInfo",{params:params}),//获取打单配置信息
		delOutbet: (params) => http.post("/agent/outbet/delOutbet",params),//删除打单配置
		updateOutbetStatus: (params) => http.post("/agent/outbet/updateOutbetStatus",params),//更新打单配置状态
		getOutbetRecord: (params) => http.get("/agent/outbet/getOutbetRecord",{params:params}),//获取打单记录
		getOutbetConfig: (params) => http.get("/agent/outbet/getOutbetConfig",{params:params}),//获取打单配置
		updateOutbetSwitch: (params) => http.post("/agent/outbet/updateOutbetSwitch",params),//更新打单总开关
		applyOutbet: (params) => http.post("/agent/outbet/applyOutbet",params),//申请打单
		getOutbetTypeList: (params) => http.get("/agent/outbet/getOutbetTypeList",{params:params}),//获取打单类型列表
	}

	uni.$u.api = {
		common,
		member,
		agent,
	};
}
export default {
	install
}
