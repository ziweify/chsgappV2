<template>
  <view :class="template.toLowerCase()" class="open-num-list" v-if="isShow">
    <view class="open-num-item">
      <view class="period span1">期数</view>
      <view class="drop-down-opened">
        <view class="scnumList" v-if="isPK10">
          <view class="numList">
            <view class="span1">一</view>
            <view class="span1">二</view>
            <view class="span1">三</view>
            <view class="span1">四</view>
            <view class="span1">五</view>
            <view class="span1">六</view>
            <view class="span1">七</view>
            <view class="span1">八</view>
            <view class="span1">九</view>
            <view class="span1">十</view>
          </view>
          <view class="gyhe">冠亚和</view>
          <view class="lh">1-5龙虎</view>
        </view>
        <view class="sscnumList" v-if="isSSCOrBINGO">
          <view class="numList">
            <view class="span1">一</view>
            <view class="span1">二</view>
            <view class="span1">三</view>
            <view class="span1">四</view>
            <view class="span1" >五</view>
          </view>
          <view  class="kjjg">开奖结果</view>
        </view>
      </view>
    </view>
    <view class="van-pull-refresh">
      <!-- PK10模板 -->
      <template v-if="isPK10">
        <view class="open-num-item" v-for="item in formattedList" :key="generateKey(item)">
          <view class="period">{{ item.shortPeriod }}</view>
          <view class="drop-down-opened">
            <view class="open-num min">
              <view 
                class="drop-down-list-item-ul-li" 
                v-for="(it, itIndex) in item.openNum" 
                :key="generateKey(item, itIndex)"
                :class="'ball-'+it"
              ></view>
            </view>
            <view class="firstSum2">
              <view class="first">
                <view style="width: 24rpx;text-align: center;">{{ item.property.sum }}</view>
                <view class="blue">{{ item.property.bigSmall }}</view>
                <view class="blue">{{ item.property.singleDouble }}</view>
              </view>
              <view :class="getDragonTigerClass(item.property.dragonTigerNum1)">{{ item.property.dragonTigerNum1 }}</view>
              <view :class="getDragonTigerClass(item.property.dragonTigerNum2)">{{ item.property.dragonTigerNum2 }}</view>
              <view :class="getDragonTigerClass(item.property.dragonTigerNum3)">{{ item.property.dragonTigerNum3 }}</view>
              <view :class="getDragonTigerClass(item.property.dragonTigerNum4)">{{ item.property.dragonTigerNum4 }}</view>
              <view :class="getDragonTigerClass(item.property.dragonTigerNum5)">{{ item.property.dragonTigerNum5 }}</view>
            </view>
          </view>
        </view>
      </template>
      
      <!-- SSC模板 -->
      <template v-if="isSSC">
        <view class="open-num-item" v-for="item in formattedList" :key="generateKey(item)">
          <span class="period">{{ item.shortPeriod }}</span>
          <view class="drop-down-opened">
            <view class="open-num min open-num-ul">
              <view 
                class="drop-down-list-item-ul-li" 
                v-for="(it, itIndex) in item.openNum" 
                :key="generateKey(item, itIndex)"
                :class="'ball-'+it"
              >{{ it }}</view>
            </view>
            <view class="sscSum">
              <view :class="getBigSmallClass(item.property.sumBigSmall)">{{ item.property.sumBigSmall }}</view>
              <view :class="getSingleDoubleClass(item.property.sumSingleDouble)">{{ item.property.sumSingleDouble }}</view>
              <view :class="getDragonTigerClass(item.property.dragonTiger)">{{ item.property.dragonTiger }}</view>
            </view>
          </view>
        </view>
      </template>
      
      <!-- BINGO模板 -->
      <template v-if="isBINGO">
        <view class="open-num-item" v-for="item in formattedList" :key="generateKey(item)">
          <span class="period">{{ item.shortPeriod }}</span>
          <view class="drop-down-opened">
            <view class="open-num min open-num-ul">
              <view 
                class="drop-down-list-item-ul-li" 
                v-for="(it, itIndex) in item.openNum" 
                :key="generateKey(item, itIndex)"
                :class="'b'+it"
              >{{ it }}</view>
            </view>
            <view class="sscSum">
              <view class="red" style="font-weight: bold">{{ item.property.sum }}</view>
              <view :class="getBigSmallClass(item.property.sumBigSmall)">{{ item.property.sumBigSmall }}</view>
              <view :class="getSingleDoubleClass(item.property.sumSingleDouble)">{{ item.property.sumSingleDouble }}</view>
              <view :class="getDragonTigerClass(item.property.dragonTigerNum)">{{ item.property.dragonTigerNum }}</view>
            </view>
          </view>
        </view>
      </template>
    </view>
    <view class="btns">
      <button @click="tokjresult">查看更多</button>
    </view>
  </view>
</template>

<script>
	export default {
		name: 'open-num-list',
		data() {
			return {
				// 可以在这里添加组件内部状态数据
			};
		},
		computed: {
			// 计算当前模板是否为PK10
			isPK10() {
				return this.template === 'PK10';
			},
			// 计算当前模板是否为SSC
			isSSC() {
				return this.template === 'SSC';
			},
			// 计算当前模板是否为BINGO
			isBINGO() {
				return this.template === 'BINGO';
			},
			// 计算当前模板是否为SSC或BINGO（用于表头显示）
			isSSCOrBINGO() {
				return this.template === 'SSC' || this.template === 'BINGO';
			},
			// 格式化后的列表数据
			formattedList() {
				if (!Array.isArray(this.list)) {
					return [];
				}
				return this.list.filter(item => {
					return item && 
						   (item.shortPeriod || item.id) && 
						   item.openNum && 
						   Array.isArray(item.openNum) &&
						   item.property &&
						   typeof item.property === 'object';
				}).slice(0, 50); // 限制最大显示数量，提高性能
			},
			// 判断是否有有效数据
			hasData() {
				return this.formattedList.length > 0;
			},
			// 获取模板类型对应的中文名称
			templateName() {
				const names = {
					'PK10': '北京赛车',
					'SSC': '时时彩',
					'BINGO': '宾果'
				};
				return names[this.template] || this.template;
			}
		},
		watch: {
			// 监听list变化，进行数据验证
			list: {
				handler(newList) {
					if (newList && newList.length > 0) {
						this.validateListData(newList);
					}
				},
				immediate: true
			}
		},
		beforeDestroy() {
			// 组件销毁时清理资源
			this.cleanup();
		},
		props: {
			// 显示的开奖数据列表
			list: {
				type: Array,
				default: () => [],
				validator(value) {
					return Array.isArray(value);
				}
			},
			// 是否显示组件
			isShow: {
				type: [Boolean, String],
				default: false
			},
			// 游戏类型（暂时保留兼容性）
			gtype: {
				type: String,
				default: 'member'
			},
			// 模板类型：PK10, SSC, BINGO
			template: {
				type: String,
				required: true,
				validator(value) {
					return ['PK10', 'SSC', 'BINGO'].includes(value);
				}
			},
			// 最大显示条数（可选）
			maxItems: {
				type: Number,
				default: 50,
				validator(value) {
					return value > 0 && value <= 100;
				}
			}
		},
		methods: {
			// 触发完成事件
			finish() {
				this.$emit('finish');
			},
			// 跳转到开奖结果详情页
			tokjresult() {
				try {
					uni.setStorageSync('backUrl', 'copage/chat');
					uni.$utils.jump("copage/kjresult");
				} catch (error) {
					uni.showToast({
						title: '页面跳转失败',
						icon: 'none'
					});
				}
			},
			// 获取龙虎颜色类名
			getDragonTigerClass(value) {
				if (!value) return '';
				if (value === '龙') return 'red';
				if (value === '虎') return 'blue';
				return 'green';
			},
			// 获取大小单双颜色类名
			getBigSmallClass(value) {
				if (!value) return '';
				return value === '大' ? 'red' : 'blue';
			},
			getSingleDoubleClass(value) {
				if (!value) return '';
				return value === '双' ? 'red' : 'blue';
			},
			// 生成唯一key
			generateKey(item, suffix = '') {
				try {
					const baseKey = item.shortPeriod || item.id || `item_${Math.random().toString(36).substr(2, 9)}`;
					return suffix ? `${baseKey}-${suffix}` : baseKey;
				} catch (error) {
					console.warn('[open-num-list] 生成key失败:', error);
					return `fallback_${Math.random().toString(36).substr(2, 9)}`;
				}
			},
			// 验证列表数据格式
			validateListData(list) {
				if (!Array.isArray(list)) {
					console.warn('[open-num-list] list数据格式错误，应为数组');
					return false;
				}
				
				let validCount = 0;
				let invalidCount = 0;
				
				list.forEach((item, index) => {
					if (!item) {
						invalidCount++;
						return;
					}
					
					if (!item.shortPeriod && !item.id) {
						console.warn(`[open-num-list] 第${index}项缺少shortPeriod或id字段`);
						invalidCount++;
						return;
					}
					
					if (!Array.isArray(item.openNum)) {
						console.warn(`[open-num-list] 第${index}项openNum字段应为数组`);
						invalidCount++;
						return;
					}
					
					if (!item.property || typeof item.property !== 'object') {
						console.warn(`[open-num-list] 第${index}项property字段缺失或格式错误`);
						invalidCount++;
						return;
					}
					
					validCount++;
				});
				
				if (invalidCount > 0) {
					console.warn(`[open-num-list] 数据验证完成，有效数据：${validCount}条，无效数据：${invalidCount}条`);
				}
				
				return validCount > 0;
			},
			// 处理开奖号码显示
			formatOpenNum(openNum) {
				if (!Array.isArray(openNum)) {
					return [];
				}
				return openNum.filter(num => num !== null && num !== undefined);
			},
			// 安全获取属性值
			safeGetProperty(item, property, defaultValue = '') {
				try {
					return item?.property?.[property] || defaultValue;
				} catch (error) {
					console.warn(`[open-num-list] 获取属性${property}失败:`, error);
					return defaultValue;
				}
			},
			// 组件清理方法
			cleanup() {
				// 清理定时器、事件监听器等
				if (this._timer) {
					clearTimeout(this._timer);
					this._timer = null;
				}
			},
			// 处理数据更新
			handleDataUpdate() {
				// 防抖处理，避免频繁更新
				if (this._updateTimer) {
					clearTimeout(this._updateTimer);
				}
				
				this._updateTimer = setTimeout(() => {
					this.$forceUpdate();
				}, 100);
			},
			// 错误处理方法
			handleError(error, context = 'unknown') {
				console.error(`[open-num-list] ${context}发生错误:`, error);
				
				// 可以在这里添加错误上报逻辑
				if (uni.$errorReport) {
					uni.$errorReport.report({
						component: 'open-num-list',
						context,
						error: error.message || error,
						template: this.template
					});
				}
			}
		},
		// 错误边界处理
		errorCaptured(err, instance, info) {
			this.handleError(err, `errorCaptured-${info}`);
			return false; // 阻止错误继续传播
		}
	}
</script>

<style lang="scss" scoped>
// 公共变量定义
$border-color: #e6e6e6;
$text-color: #646464;
$red-color: #fe0101;
$blue-color: #007aff;
$green-color: #28a745;
$btn-bg-color: #0087b4;
$white-color: #fff;

// 公共混合样式
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-start {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

@mixin ball-base {
  text-align: center;
  border-radius: 8rpx;
  font-weight: 700;
  margin-right: 6rpx;
}

// 主容器样式
.open-num-list {
  max-height: 530rpx;
  display: flex;
  flex-direction: column;
  background-color: $white-color;
  border-radius: 16rpx;
  overflow: hidden;
}

// 按钮区域样式
.btns {
  text-align: center;
  border-top: 2rpx solid $border-color;
  padding: 12rpx 0;
  background-color: #fafafa;
  
  button {
    background: $btn-bg-color;
    border-radius: 12rpx;
    border: none;
    color: $white-color;
    width: 270rpx;
    height: 60rpx;
    font-size: 24rpx;
    font-weight: 500;
    transition: background-color 0.3s ease;
    
    &:active {
      background: darken($btn-bg-color, 10%);
    }
  }
}

// 公共开奖项样式
.open-num-item {
  @include flex-start;
  font-size: 24rpx;
  color: $text-color;
  border-bottom: 1rpx solid $border-color;
  padding: 8rpx 0;
  min-height: 70rpx;
  
  .period {
    color: $text-color;
    text-align: center;
    flex-shrink: 0;
    @include flex-center;
    font-weight: 500;
  }
  
  .drop-down-opened {
    flex: 1;
    @include flex-start;
    padding: 2rpx 0;
  }
}

// 公共颜色类
.red {
  color: $red-color;
  font-weight: 600;
}

.blue {
  color: $blue-color;
  font-weight: 600;
}

.green {
  color: $green-color;
  font-weight: 600;
}

// 滚动区域样式
.van-pull-refresh {
  flex: 1;
  overflow-y: auto;
  
  .open-num {
    @include flex-start;
    
    .drop-down-list-item-ul-li {
      @include ball-base;
      @include flex-center;
      box-sizing: border-box;
    }
  }
}

// PK10 特定样式
.pk10 {
  .open-num-item {
    .period {
      width: 60rpx;
      margin: 0 16rpx;
    }
  }
  
  .scnumList {
    @include flex-start;
    
    .numList {
      @include flex-start;
      
      .span1 {
        @include flex-center;
        margin-right: 8rpx;
        width: 36rpx;
        font-weight: 500;
      }
    }
    
    .gyhe {
      width: 80rpx;
      margin-right: 12rpx;
      text-align: center;
    }
    
    .lh {
      font-size: 24rpx;
    }
  }
  
  .van-pull-refresh {
    .drop-down-list-item-ul-li {
      width: 44rpx;
      height: 44rpx;
      line-height: 44rpx;
      color: $white-color;
      text-shadow: 0 2rpx #000, 2rpx 0 #000, -2rpx 0 #000, 0 -2rpx #000;
      font-size: 26rpx;
      border-radius: 8rpx;
    }
    
    .open-num.min .drop-down-list-item-ul-li {
      width: 38rpx;
      height: 38rpx;
      line-height: 38rpx;
    }
    
    .firstSum2 {
      display: flex;
      line-height: 32rpx;
      font-size: 24rpx;
      
      .first {
        margin-left: 8rpx;
        margin-right: 8rpx;
        display: flex;
        gap: 4rpx;
      }
    }
  }
}

// SSC 特定样式
.ssc {
  .open-num-item {
    .period {
      width: 60rpx;
      margin: 0 16rpx;
      font-size: 24rpx;
    }
  }
  
  .sscnumList {
    @include flex-start;
    font-size: 28rpx;
    .numList {
      display: flex;
      padding: 0 16rpx;
      .span1 {
        margin-right: 24rpx;
        width: 46rpx;
        font-weight: 500;
        text-align: center;
      }
    }
    
    .kjjg {
      @include flex-center;
    }
    
    .sscSum {
      display: flex;
      align-items: center;
      margin-left: 20rpx;
      gap: 16rpx;
    }
  }
  
  .van-pull-refresh {
    .open-num {
      padding: 0 16rpx;
    }
    
    .drop-down-list-item-ul-li {
      width: 50rpx;
      height: 50rpx;
      font-size: 26rpx;
      border-radius: 50%;
      border: 6rpx solid;
      color: #222;
      background: $white-color;
      line-height: 38rpx;
      margin-right: 20rpx;
    }
    
    .sscSum {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      gap: 16rpx;
    }
  }
}

// BINGO 特定样式
.bingo {
  .open-num-item {
    .period {
      width: 60rpx;
      margin: 0 16rpx;
      font-size: 24rpx;
    }
  }
  
  .sscnumList {
    @include flex-start;
    font-size: 28rpx;
    .numList {
      display: flex;
      padding: 0 16rpx;
      .span1 {
        margin-right: 24rpx;
        width: 46rpx;
        font-weight: 500;
        text-align: center;
      }
    }
    
    .kjjg {
      @include flex-center;
    }
  }
  
  .van-pull-refresh {
    .open-num {
      display: flex;
      justify-content: space-around;
      padding: 0 16rpx;
      align-items: center;
      height: 100%;
    }
    
    .drop-down-list-item-ul-li {
      display: flex;
      width: 50rpx;
      height: 50rpx;
      text-align: center;
      background-size: 100% auto;
      margin-right: 20rpx;
      justify-content: center;
      align-items: center;
      font-size: 26rpx;
      color: #000000;
      text-shadow: none;
      
      &:last-child {
        margin-right: 0;
      }
    }
    
    .sscSum {
      display: flex;
      align-items: center;
      margin-left: 12rpx;
      font-size: 28rpx;
      gap: 16rpx;
    }
  }
  
  // 台湾宾果球颜色规则
  // 红色球 (3的倍数)
  .b3, .b6, .b9, .b12, .b15, .b18, .b21, .b24, .b27, .b30, 
  .b33, .b36, .b39, .b42, .b45, .b48, .b51, .b54, .b57, .b60, 
  .b63, .b66, .b69, .b72, .b75, .b78 {
    background: url(../../static/img/red01.png) center center no-repeat;
  }
  
  // 绿色球 (3n+2)
  .b2, .b5, .b8, .b11, .b14, .b17, .b20, .b23, .b26, .b29, 
  .b32, .b35, .b38, .b41, .b44, .b47, .b50, .b53, .b56, .b59, 
  .b62, .b65, .b68, .b71, .b74, .b77, .b80 {
    background: url(../../static/img/green01.png) center center no-repeat;
  }
  
  // 蓝色球 (3n+1)
  .b1, .b4, .b7, .b10, .b13, .b16, .b19, .b22, .b25, .b28, 
  .b31, .b34, .b37, .b40, .b43, .b46, .b49, .b52, .b55, .b58, 
  .b61, .b64, .b67, .b70, .b73, .b76, .b79 {
    background: url(../../static/img/blue01.png) center center no-repeat;
  }
}

// 响应式适配
@media screen and (max-width: 750rpx) {
  .open-num-list {
    max-height: 450rpx;
  }
  
  .open-num-item {
    font-size: 22rpx;
    
    .period {
      font-size: 20rpx;
    }
  }
}

// 暗色模式适配（预留）
@media (prefers-color-scheme: dark) {
  .open-num-list {
    background-color: #1a1a1a;
    color: #ffffff;
  }
  
  .btns {
    background-color: #2a2a2a;
    border-top-color: #333;
  }
  
  .open-num-item {
    border-bottom-color: #333;
    color: #cccccc;
  }
}
</style>
