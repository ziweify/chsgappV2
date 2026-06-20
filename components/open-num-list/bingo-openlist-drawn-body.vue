<template>
  <view class="bingo-drawn-body">
    <view class="bingo-period-bg" :style="ctx.bingoPeriodColStyle()"></view>
    <view class="bingo-table-header" :style="ctx.bingoHeaderAreaStyle()">
      <view
        v-for="(band, idx) in ctx.bingoHeaderBandSpecs()"
        :key="'hb-' + idx"
        class="bingo-header-band"
        :style="ctx.bingoHeaderBandStyle(band)"
      ></view>
      <view class="bingo-cell bingo-header-cell black" :style="ctx.bingoHeaderTextStyle(ctx.BINGO_OPENLIST.PERIOD_X, ctx.BINGO_OPENLIST.FONT_PERIOD)">期</view>
      <view class="bingo-cell bingo-header-cell black" :style="ctx.bingoHeaderTextStyle(ctx.BINGO_OPENLIST.TIME_X, ctx.BINGO_OPENLIST.FONT_TIME)">时间</view>
      <view
        v-for="(label, ballIndex) in ctx.bingoBallHeaderLabels"
        :key="'bh-' + ballIndex"
        class="bingo-cell bingo-header-cell black"
        :style="ctx.bingoBallHeaderStyle(ballIndex)"
      >{{ label }}</view>
      <view class="bingo-cell bingo-header-cell black" :style="ctx.bingoHeaderTextStyle(ctx.BINGO_OPENLIST.TOTAL_X + 18, ctx.BINGO_OPENLIST.FONT_DXDS)">总和</view>
      <view class="bingo-cell bingo-header-cell black" :style="ctx.bingoHeaderTextStyle(ctx.BINGO_OPENLIST.LH_X, ctx.BINGO_OPENLIST.FONT_LH)">龙虎</view>
    </view>
    <view class="bingo-grid-layer" :style="ctx.bingoGridLayerStyle()">
      <view
        v-for="(line, idx) in ctx.bingoGridLineSpecs()"
        :key="'vl-' + idx"
        class="bingo-grid-vline"
        :style="ctx.bingoGridLineStyle(line)"
      ></view>
    </view>
    <view
      class="bingo-image-row"
      v-for="row in rows"
      :key="row.item ? ctx.generateKey(row.item) : ('bingo-empty-' + row.index)"
      :style="ctx.getBingoRowStyle(row.index)"
    >
      <template v-if="row.item">
        <view class="bingo-cell" :style="ctx.bingoTextStyle(ctx.BINGO_OPENLIST.PERIOD_X, ctx.BINGO_OPENLIST.FONT_PERIOD)" :class="ctx.getBingoPeriodClass(row.item)">{{ ctx.getBingoPeriodDisplay(row.item) }}</view>
        <view class="bingo-cell" :style="ctx.bingoTextStyle(ctx.BINGO_OPENLIST.TIME_X, ctx.BINGO_OPENLIST.FONT_TIME)" :class="ctx.getBingoTimeClass(row.item)">{{ ctx.getBingoTimeDisplay(row.item) }}</view>
        <block v-for="(num, ballIndex) in ctx.getBingoBallList(row.item)" :key="ctx.generateKey(row.item, ballIndex)">
          <view class="bingo-cell" :style="ctx.bingoBallNumStyle(ballIndex, num)" :class="ctx.getBingoNumClass(num)">{{ ctx.formatBingoBallNum(num) }}</view>
          <view class="bingo-cell" :style="ctx.bingoBallDxStyle(ballIndex)" :class="ctx.getBingoBigSmallClass(ctx.getBingoBallBigSmall(row.item, ballIndex))">{{ ctx.getBingoBallBigSmall(row.item, ballIndex) }}</view>
          <view class="bingo-cell" :style="ctx.bingoBallDsStyle(ballIndex)" :class="ctx.getBingoSingleDoubleClass(ctx.getBingoBallSingleDouble(row.item, ballIndex))">{{ ctx.getBingoBallSingleDouble(row.item, ballIndex) }}</view>
        </block>
        <view class="bingo-cell" :style="ctx.bingoSumNumStyle(row.item.property && row.item.property.sum)" :class="ctx.getBingoBigSmallClass(row.item.property && row.item.property.sumBigSmall)">{{ (row.item.property && row.item.property.sum) || '-' }}</view>
        <view class="bingo-cell" :style="ctx.bingoSumDxStyle()" :class="ctx.getBingoBigSmallClass(row.item.property && row.item.property.sumBigSmall)">{{ (row.item.property && row.item.property.sumBigSmall) || '-' }}</view>
        <view class="bingo-cell" :style="ctx.bingoSumDsStyle()" :class="ctx.getBingoSingleDoubleClass(row.item.property && row.item.property.sumSingleDouble)">{{ (row.item.property && row.item.property.sumSingleDouble) || '-' }}</view>
        <view class="bingo-cell" :style="ctx.bingoLhStyle()" :class="ctx.getBingoDragonTigerClass(row.item.property && row.item.property.dragonTigerNum)">{{ (row.item.property && row.item.property.dragonTigerNum) || '-' }}</view>
      </template>
    </view>
  </view>
</template>

<script>
export default {
  name: 'bingo-openlist-drawn-body',
  inject: ['bingoOpenlistCtx'],
  props: {
    rows: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    ctx() {
      return this.bingoOpenlistCtx;
    }
  }
};
</script>

<style lang="scss" scoped>
.bingo-drawn-body {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  box-sizing: border-box;
}

.bingo-period-bg {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 0;
  background: #dbeef3;
}

.bingo-table-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 3;
  box-sizing: border-box;
  overflow: visible;
  border-bottom: 1px solid #8db4e3;
}

.bingo-header-band {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 0;
}

.bingo-header-cell {
  font-weight: 700;
  z-index: 1;
}

.bingo-grid-layer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.bingo-grid-vline {
  position: absolute;
  top: 0;
  bottom: 0;
}

.bingo-image-row {
  position: absolute;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  overflow: visible;
  z-index: 2;
  border-bottom: 1px solid #8db4e3;
}

.bingo-cell {
  position: absolute;
  display: block;
  font-family: 'BingoOpenlist', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  z-index: 2;
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
</style>
