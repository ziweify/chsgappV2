module.exports = {
    props: {},
    data() {
        return {
            userInfo:{},
            siteConfig:{}
        }
    },
    onLoad() {
        this.userInfo = uni.getStorageSync('userInfo');
        this.siteConfig = uni.getStorageSync('siteConfig');
        if(!uni.$socketUtils.isOpenSocket){uni.$socketUtils.initConnection();}
        //注册监听通知
        let that = this;
        uni.$off('customchat');
        uni.$on('customchat', function(res) {
            const pages = getCurrentPages(); // 获取当前页面栈
            const currentPage = pages[pages.length-1]; //当前页面
            if(currentPage.route === 'copage/custChat'){
                return;
            }
            uni.$emit('notReadMsgEvent');
            let isReciveMsg = uni.getStorageSync('isReciveMsg');
            if(parseInt(isReciveMsg)  == 0){
                return;
            }
            if(that.userInfo.type == 1){//只有房主才可以接收通知
                let msg = res.data;
                uni.setStorageSync('customMsgType',1);
                uni.setStorageSync('customMsg',JSON.stringify(msg));
                const pagePath = "copage/noticePop";
                if (currentPage.route !== pagePath) {//页面未打开，执行跳转
                    uni.$utils.jump(pagePath);
                }else{
                    uni.$emit('newMessageNotice');
                }
            }
        });
        if(that.userInfo.type == 1){//只有房主才有申请通知
            uni.$off('applyMsgEvent');
            uni.$on('applyMsgEvent', function(res) {
                const pages = getCurrentPages(); // 获取当前页面栈
                const currentPage = pages[pages.length-1]; //当前页面
                let curl = 'agent/manage/apply';
                if(res.other.mtype == 3){//入群申请
                    curl = 'agent/manage/groupApply';
                }
                if(currentPage.route === curl){
                    return;
                }
                uni.$emit('notReadApplyEvent');
                let isReciveMsg = uni.getStorageSync('isReciveMsg');
                if(parseInt(isReciveMsg)  == 0){
                    return;
                }
                uni.setStorageSync('customMsgType',res.other.mtype);
                uni.setStorageSync('customMsg',JSON.stringify(res));
                const pagePath = "copage/noticePop";
                if (currentPage.route !== pagePath) {//页面未打开，执行跳转
                    uni.$utils.jump(pagePath);
                }else{
                    uni.$emit('newMessageNotice');
                }
            });
        }

    },
    created() {

    },
    beforeDestroy() {
        console.log("mixin beforeDestroy");
    },
    computed: {},
    methods: {}
}
