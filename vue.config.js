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
