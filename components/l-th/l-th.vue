<template>
	<view class="l-th " :style="[thStyle]">
		<slot></slot>
	</view>
</template>

<script>
import table from '../l-table/table.js'
	export default{
		name:'l-th',
		mixins:[table],
		inject:['table'],
		props:{
			width:{
				type:String,
				default:''
			},
			height:{
				type:String | Number,
				default:'100'
			},
			fontWeight:{
				type:Boolean,
				default:true
			},
			bgColor:{
				type:String,
				default:'#f1f1f1'
			},
			color:{
				type:String,
				default:'#000000'
			},
			align:{
				type:String,
				default:'center'
			},
			fontSize:{
				type:String | Number,
				default:'30'
			},
			padding:{
				type:String | Number,
				default:'10'
			},
			borderRight:{
				type:Boolean,
				default:true
			}
		},
		computed:{
			thStyle(){
				let style={
          fontWeight:this.fontWeight? '700':'400',
          fontSize:this.fontSize + 'rpx',
          color:this.color,
					backgroundColor:this.bgColor,
					justifyContent:this.align,
					padding: `0 ${this.padding}rpx`,
					borderRight:this.table.borderShow  || this.borderRight ? `${this.table.border}rpx solid ${this.table.borderColor}`:'0',
					flex:this.width ? `0 0 ${this.width}` : '1',
					minHeight:this.height + 'rpx'
				}
				return style
			},
      teStyle(){
        let style={
          fontWeight:this.fontWeight? '700':'400',
          fontSize:this.fontSize + 'rpx',
          color:this.color,
        }
        return style
      },
		}
	}
</script>

<style lang="scss" scoped>
	.l-th{
		font-weight: 700;
		border-right:2rpx solid #ccc;
		display: flex;
		align-items: center;
	}
  /* #ifndef APP-NVUE */
  .l-th:last-child{
    border-right:0 !important;
  }
  /* #endif */
</style>