/* module.exports = {
	// 配置路径别名
	 configureWebpack: {
		devServer: {
			// 调试时允许内网穿透，让外网的人访问到本地调试的H5页面
			disableHostCheck: false,
            //关闭https
            https: false,
		}
	},
	//productionSourceMap: false,
} */ 
// 原版
module.exports = {
  devServer: {
    host: '0.0.0.0',  // 允许外部访问
    port: 8080,       // 端口号
    disableHostCheck: true,  // 禁用主机检查
    // ✅ 配置自动打开的域名
    public: 'h5.chsg.com:8080',  // 指定公开访问的地址
    // 或者使用 open 配置（如果上面不生效）
    // open: true,
    // openPage: 'http://h5.chsg.com:8080/',
    proxy: {
      '/api': {
        target: 'http://adm.jys.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
};


// module.exports = {
// 	// 配置路径别名
// 	configureWebpack: {
// 		devServer: {
// 			// 调试时允许内网穿透，让外网的人访问到本地调试的H5页面
// 			disableHostCheck: true,
// 			proxy: {
// 				'/api': {
// 				  // target:'http://127.0.0.1:4040/api/',
// 				  target: 'https://okfxtm.com',
// 				  changeOrigin: true,
// 				},
// 				// '/publication': {
// 				//   // target:'http://127.0.0.1:4040/api/',
// 				//   target: 'https://www.researchgate.net/',
// 				//   changeOrigin: true,
// 				// }
// 			  }
// 		}
// 	},
// 	//productionSourceMap: false,
// }
