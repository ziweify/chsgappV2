<template>
  <view :class="[template.toLowerCase(), {'bingo-group-mode': isBingoGroupStyle, 'bingo-group-page-mode': pageMode && isBingoGroupStyle}]" class="open-num-list" v-if="isShow">
    <view class="open-num-item" v-if="!isBingoGroupStyle">
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
    <view class="van-pull-refresh" :class="{'bingo-image-wrap': isBingoGroupStyle}">
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
      
      <!-- BINGO模板：群样式（与群聊开奖图片一致） -->
      <template v-if="isBingoGroupStyle">
        <view class="bingo-image-panel">
          <component :is="pageMode ? 'view' : 'scroll-view'" :scroll-y="!pageMode" class="bingo-image-scroll" :class="{'bingo-image-scroll-page': pageMode}">
            <view v-if="shouldShowBingoImage" class="bingo-openlist-image-wrap">
              <image
                class="bingo-openlist-image"
                :src="resolvedOpenListImageUrl"
                mode="widthFix"
                @error="onBingoImageError"
              />
            </view>
            <view v-else class="bingo-openlist-table" :class="{'bingo-openlist-table-page': pageMode}" :style="bingoTableStyle">
              <view
                class="bingo-image-row"
                v-for="(item, rowIndex) in bingoImageList"
                :key="generateKey(item)"
                :style="getBingoRowStyle(rowIndex)"
              >
                <text class="bingo-cell" :style="bingoTextStyle(BINGO_OPENLIST.PERIOD_X, BINGO_OPENLIST.FONT_PERIOD)" :class="getBingoPeriodClass(item)">{{ getBingoPeriodDisplay(item) }}</text>
                <text class="bingo-cell" :style="bingoTextStyle(BINGO_OPENLIST.TIME_X, BINGO_OPENLIST.FONT_TIME)" :class="getBingoTimeClass(item)">{{ getBingoTimeDisplay(item) }}</text>
                <block v-for="(num, ballIndex) in getBingoBallList(item)" :key="generateKey(item, ballIndex)">
                  <text class="bingo-cell" :style="bingoBallNumStyle(ballIndex, num)" :class="getBingoNumClass(num)">{{ formatBingoBallNum(num) }}</text>
                  <text class="bingo-cell" :style="bingoBallDxStyle(ballIndex)" :class="getBingoBigSmallClass(getBingoBallBigSmall(item, ballIndex))">{{ getBingoBallBigSmall(item, ballIndex) }}</text>
                  <text class="bingo-cell" :style="bingoBallDsStyle(ballIndex)" :class="getBingoSingleDoubleClass(getBingoBallSingleDouble(item, ballIndex))">{{ getBingoBallSingleDouble(item, ballIndex) }}</text>
                </block>
                <text class="bingo-cell" :style="bingoSumNumStyle(item.property.sum)" :class="getBingoBigSmallClass(item.property.sumBigSmall)">{{ item.property.sum }}</text>
                <text class="bingo-cell" :style="bingoSumDxStyle()" :class="getBingoBigSmallClass(item.property.sumBigSmall)">{{ item.property.sumBigSmall }}</text>
                <text class="bingo-cell" :style="bingoSumDsStyle()" :class="getBingoSingleDoubleClass(item.property.sumSingleDouble)">{{ item.property.sumSingleDouble }}</text>
                <text class="bingo-cell" :style="bingoLhStyle()" :class="getBingoDragonTigerClass(item.property.dragonTigerNum)">{{ item.property.dragonTigerNum }}</text>
              </view>
            </view>
          </component>
        </view>
      </template>

      <!-- BINGO模板：基本样式 -->
      <template v-if="isBINGO && !isBingoGroupStyle">
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
    <view class="btns" v-if="!pageMode">
      <button @click="tokjresult">查看更多</button>
    </view>
  </view>
</template>

<script>
// 与 BuilderResultImage::buildTwbgOpenListImg 一致的绘制参数（786px 宽画布）
const BINGO_OPENLIST = {
	BG_W: 786,
	BANNER_H: 48,
	START_Y: 77,
	ROW_H: 28,
	TEXT_BASELINE: 15,
	PERIOD_X: 5,
	TIME_X: 59,
	BALL_START_X: 94,
	BALL_CELL_W: 102,
	BALL_NUM_X: 33,
	BALL_NUM_NNN: 6,
	BALL_DX_X: 69,
	BALL_DS_X: 102,
	TOTAL_X: 635,
	TOTAL_SUM_NNN: 5,
	TOTAL_DX_X: 48,
	TOTAL_DS_X: 81,
	LH_X: 751,
	FONT_PERIOD: 18,
	FONT_TIME: 16,
	FONT_NUM: 18,
	FONT_DXDS: 17,
	FONT_LH: 18,
	NOBANNER_H: 952,
	ROW_COUNT: 31,
	// GD2 imagettftext 的 size 是 point；CSS font-size 是 px（96DPI 下 point×96/72）
	FONT_POINT_TO_PX: 96 / 72,
	// 描边+重绘后字形在行内略偏上，按 point→px 后的 ascender 比例微调
	FONT_ASCENDER_RATIO: 0.88
};

	export default {
		name: 'open-num-list',
		data() {
			return {
				showBingoImage: true,
				BINGO_OPENLIST
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
			isBingoGroupStyle() {
				return this.isBINGO && (this.historyStyle == 1 || this.historyStyle === '1');
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
				const limit = this.pageMode ? this.maxItems : Math.min(this.maxItems, 50);
				return this.list.filter(item => {
					return item &&
						   (item.shortPeriod || item.period || item.id) &&
						   item.openNum &&
						   Array.isArray(item.openNum) &&
						   item.property &&
						   typeof item.property === 'object';
				}).slice(0, limit);
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
			},
			resolvedOpenListImageUrl() {
				return this.openListImageUrl || '';
			},
			// 查看更多页用 HTML 表格 + 分页数据铺满整页；聊天下拉仍用 webp 图
			shouldShowBingoImage() {
				if (this.pageMode) {
					return false;
				}
				return !this.forceTable && this.showBingoImage && !!this.resolvedOpenListImageUrl;
			},
			bingoImageList() {
				const rows = this.pageMode ? this.formattedList : this.formattedList.slice(0, 31);
				return rows.slice().reverse();
			},
			// 背景图 openlist-nobanner.png 786×952；行位置按服务端 startY=77、rowHeight=28 换算
			bingoTableStyle() {
				const { BG_W, START_Y, BANNER_H, ROW_H, NOBANNER_H } = BINGO_OPENLIST;
				const rowCount = Math.max(this.bingoImageList.length, 1);
				const tableTop = START_Y - BANNER_H;
				const contentH = tableTop + ROW_H * rowCount;
				const bgRatio = NOBANNER_H / BG_W;
				const contentRatio = contentH / BG_W;
				const tableMinRatio = this.pageMode
					? Math.max(bgRatio, contentRatio)
					: Math.max(bgRatio, Math.min(contentRatio, (tableTop + ROW_H * BINGO_OPENLIST.ROW_COUNT) / BG_W));
				return {
					minHeight: `calc(100vw * ${tableMinRatio})`
				};
			}
		},
		mounted() {
			this.loadBingoFont();
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
			},
			openListImageUrl() {
				this.showBingoImage = true;
			},
			isShow(val) {
				if (val && this.isBingoGroupStyle) {
					this.showBingoImage = true;
				}
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
					return value > 0 && value <= 10000;
				}
			},
			// 开奖结果页模式：隐藏「查看更多」、由外层 z-paging 滚动分页
			pageMode: {
				type: Boolean,
				default: false
			},
			// 强制使用 HTML 表格（分页页不使用单张图片）
			forceTable: {
				type: Boolean,
				default: false
			},
			// 宾果开奖列表图片地址（与群聊发送的开奖图一致）
			openListImageUrl: {
				type: String,
				default: ''
			},
			// 开奖历史显示样式 0：基本 1：群样式
			historyStyle: {
				type: [Number, String],
				default: 0
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
					uni.setStorageSync('kjresultHistoryStyle', this.historyStyle);
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
			getBingoBigSmallClass(value) {
				if (!value) return '';
				return value === '大' ? 'red' : 'black';
			},
			getBingoSingleDoubleClass(value) {
				if (!value) return '';
				return value === '双' ? 'red' : 'black';
			},
			getBingoDragonTigerClass(value) {
				if (!value) return '';
				if (value === '龙') return 'red';
				if (value === '虎') return 'black';
				return 'green';
			},
			getBingoPeriodDisplay(item) {
				const period = item.period || item.shortPeriod || '';
				return String(period).slice(-3);
			},
			bingoPxVw(px) {
				return `calc(100vw * ${px / BINGO_OPENLIST.BG_W})`;
			},
			loadBingoFont() {
				if (typeof uni.loadFontFace !== 'function') {
					return;
				}
				const sources = [
					'url("/static/font/st.ttf")',
					'url("static/font/st.ttf")'
				];
				sources.forEach((source) => {
					uni.loadFontFace({
						global: true,
						family: 'BingoOpenlist',
						source,
						success() {},
						fail() {}
					});
				});
			},
			// GD2 point → CSS px，再按 imagettftext 基线定位
			bingoTextStyle(x, fontSize, extraX = 0) {
				const scaledSize = fontSize * BINGO_OPENLIST.FONT_POINT_TO_PX;
				const topInRow = BINGO_OPENLIST.TEXT_BASELINE - scaledSize * BINGO_OPENLIST.FONT_ASCENDER_RATIO;
				return {
					left: this.bingoPxVw(x + extraX),
					top: this.bingoPxVw(topInRow),
					fontSize: this.bingoPxVw(scaledSize)
				};
			},
			getBingoRowStyle(rowIndex) {
				const top = (BINGO_OPENLIST.START_Y - BINGO_OPENLIST.BANNER_H) + BINGO_OPENLIST.ROW_H * rowIndex;
				return {
					top: this.bingoPxVw(top),
					height: this.bingoPxVw(BINGO_OPENLIST.ROW_H)
				};
			},
			bingoBallNumStyle(ballIndex, num) {
				const x = BINGO_OPENLIST.BALL_START_X + ballIndex * BINGO_OPENLIST.BALL_CELL_W;
				const nnn = parseInt(num, 10) < 10 ? BINGO_OPENLIST.BALL_NUM_NNN : 0;
				return this.bingoTextStyle(x + BINGO_OPENLIST.BALL_NUM_X, BINGO_OPENLIST.FONT_NUM, nnn);
			},
			bingoBallDxStyle(ballIndex) {
				const x = BINGO_OPENLIST.BALL_START_X + ballIndex * BINGO_OPENLIST.BALL_CELL_W;
				return this.bingoTextStyle(x + BINGO_OPENLIST.BALL_DX_X, BINGO_OPENLIST.FONT_DXDS);
			},
			bingoBallDsStyle(ballIndex) {
				const x = BINGO_OPENLIST.BALL_START_X + ballIndex * BINGO_OPENLIST.BALL_CELL_W;
				return this.bingoTextStyle(x + BINGO_OPENLIST.BALL_DS_X, BINGO_OPENLIST.FONT_DXDS);
			},
			bingoSumNumStyle(sum) {
				const nnn = parseInt(sum, 10) < 100 ? BINGO_OPENLIST.TOTAL_SUM_NNN : 0;
				return this.bingoTextStyle(BINGO_OPENLIST.TOTAL_X, BINGO_OPENLIST.FONT_DXDS, nnn);
			},
			bingoSumDxStyle() {
				return this.bingoTextStyle(BINGO_OPENLIST.TOTAL_X + BINGO_OPENLIST.TOTAL_DX_X, BINGO_OPENLIST.FONT_DXDS);
			},
			bingoSumDsStyle() {
				return this.bingoTextStyle(BINGO_OPENLIST.TOTAL_X + BINGO_OPENLIST.TOTAL_DS_X, BINGO_OPENLIST.FONT_DXDS);
			},
			bingoLhStyle() {
				return this.bingoTextStyle(BINGO_OPENLIST.LH_X, BINGO_OPENLIST.FONT_LH);
			},
			getBingoTimeDisplay(item) {
				if (item.shortOpenTime) {
					return item.shortOpenTime;
				}
				if (item.openTime) {
					const parts = String(item.openTime).split(' ');
					if (parts[1]) {
						return parts[1].slice(0, 5);
					}
				}
				return '--:--';
			},
			getBingoBallList(item) {
				const nums = Array.isArray(item.openNum) ? item.openNum.slice(0, 5) : [];
				while (nums.length < 5) {
					nums.push(0);
				}
				return nums;
			},
			formatBingoBallNum(num) {
				const value = parseInt(num, 10);
				return value > 0 ? value : '-';
			},
			getBingoBallBigSmall(item, ballIndex) {
				return (item.property.bigSmalls && item.property.bigSmalls[ballIndex]) || '-';
			},
			getBingoBallSingleDouble(item, ballIndex) {
				return (item.property.singleDoubles && item.property.singleDoubles[ballIndex]) || '-';
			},
			getBingoPeriodClass(item) {
				return item.isOpened === false ? 'gray' : 'black';
			},
			getBingoTimeClass(item) {
				return item.isOpened === false ? 'gray' : 'black';
			},
			getBingoNumClass(num) {
				const value = parseInt(num, 10);
				if (Number.isNaN(value)) return 'black';
				return value > 40 ? 'red' : 'black';
			},
			onBingoImageError() {
				this.showBingoImage = false;
			},
			// 生成唯一key
			generateKey(item, suffix = '') {
				try {
					const baseKey = item.shortPeriod || item.period || item.id || `item_${Math.random().toString(36).substr(2, 9)}`;
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
					
					if (!item.shortPeriod && !item.period && !item.id) {
						console.warn(`[open-num-list] 第${index}项缺少shortPeriod、period或id字段`);
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
@font-face {
  font-family: 'BingoOpenlist';
  src: url('~@/static/font/st.ttf') format('truetype'),
    url('/static/font/st.ttf') format('truetype'),
    url('../../static/font/st.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

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

// BINGO 群样式展开面板
.bingo.bingo-group-mode {
  &.open-num-list {
    max-height: none;
    background: transparent;
    border-radius: 0;
    overflow: visible;
  }

  .bingo-image-wrap {
    flex: 1;
    overflow: visible;
  }

  .bingo-image-panel {
    width: 100%;
    background: #fff;
  }

  .bingo-image-scroll {
    max-height: calc(100vh - 220px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .bingo-openlist-image-wrap {
    width: 100%;
    overflow: hidden;
    position: relative;
    padding-bottom: 121.12%;
    height: 0;
  }

  .bingo-openlist-image {
    position: absolute;
    top: -5.04%;
    left: 0;
    width: 100%;
    display: block;
  }

  .bingo-openlist-table {
    position: relative;
    width: 100%;
    background: url(../../static/img/bg/openlist-nobanner.png) no-repeat top center;
    background-size: 100% auto;
    background-color: #fff;
    box-sizing: border-box;
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
  }

  .bingo-image-row {
    position: absolute;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
  }

  .bingo-cell {
    position: absolute;
    font-family: 'BingoOpenlist', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    font-weight: 700;
    line-height: 1;
    white-space: nowrap;
    -webkit-text-size-adjust: none;
    text-size-adjust: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &.red {
      color: #dc1414;
    }

    &.black {
      color: #000;
    }

    &.gray {
      color: #808080;
    }

    &.green {
      color: #28a745;
    }
  }

  .btns {
    position: relative;
    z-index: 2;
  }

  &.bingo-group-page-mode {
    &.open-num-list {
      width: 100% !important;
      max-width: 100% !important;
      max-height: none !important;
      min-height: 0;
      margin: 0;
      padding: 0;
      border-radius: 0 !important;
      overflow: visible !important;
      background: #fff;
      box-sizing: border-box;
      flex: 1;
    }

    .van-pull-refresh,
    .bingo-image-wrap {
      width: 100%;
      flex: 1;
      overflow: visible;
    }

    .bingo-image-panel {
      width: 100%;
      background: #fff;
    }

    .bingo-image-scroll-page {
      max-height: none !important;
      overflow: visible !important;
      width: 100%;
    }

    .bingo-openlist-table-page {
      width: 100%;
      background-color: #fff;
      min-height: calc(100vh - 190px);
      box-sizing: border-box;
    }

    .bingo-openlist-table-page .bingo-image-row::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 1px;
      background: rgba(186, 166, 210, 0.45);
      pointer-events: none;
    }
  }
}

// BINGO 旧版紧凑列表样式（保留给其他页面引用）
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
  
  .van-pull-refresh:not(.bingo-image-wrap) {
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
  .open-num-list:not(.bingo-group-page-mode) {
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
