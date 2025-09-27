<template>
	<view class="l-td" :style="[tdStyle]">
    <slot></slot>
	</view>
</template>

<script>
import table from '../l-table/table.js'
export default{
	name:'l-td',
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
			default:false
		},
		bgColor:{
			type:String,
			default:'#fff'
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
		borderTop:{
			type:Boolean,
			default:true
		},
		borderRight:{
			type:Boolean,
			default:true
		}
	},
	created() {
	},
	computed:{
		tdStyle(){
			let style={
        fontWeight:this.fontWeight? '700':'400',
        fontSize:this.fontSize + 'rpx',
        color:this.color,
				backgroundColor:this.bgColor,
				justifyContent:this.align,
				padding: `0 ${this.padding}rpx` ,
				borderRight: this.table.borderShow || this.borderRight ? `${this.table.border}rpx solid ${this.table.borderColor}`:'0',
				borderTop:this.borderTop? `${this.table.border}rpx solid ${this.table.borderColor}` : '0',
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
    }
	}
}
</script>

<style lang="scss" scoped>
	.l-td{
		// flex: 1;
		width: 100rpx;
		display: flex;
		align-items: center;
	}
  /* #ifndef APP-NVUE */
  .l-td:last-child{
    flex: 1 !important;
    border-right:0 !important;
  }
  /* #endif */
</style>