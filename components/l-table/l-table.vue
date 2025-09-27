<template>
		<view class="l-table" :style="[tableStyle]">
			<slot></slot>
		</view>
</template>

<script>
import table from './table.js'
export default{
	name:'l-table',
	mixins:[table],
	props:{
		width:{
			type:String,
			default:'100%'
		},
		borderColor:{
			type:String,
			default:'#ccc'
		},
		border:{
			type:String,
			default:'2'
		},
		borderShow:{
			type:Boolean,
			default:true
		},
		borderRight:{
			type:Boolean,
			default:false
		},
		borderLeft:{
			type:Boolean,
			default:false
		},
		borderTop:{
			type:Boolean,
			default:false
		},
		borderBottom:{
			type:Boolean,
			default:false
		}
	},
	provide(){
		return {
			table:this
		}
	},
	computed:{
		tableStyle(){
			let style={
				width:this.width,
				// border:this.borderShow? `${this.border}rpx solid ${this.borderColor} `:'inherit',
				borderBottom: this.borderShow || this.borderBottom ?`${this.border}rpx solid ${this.borderColor}`:'inherit',
			  borderTop:this.borderShow || this.borderTop ? `${this.border}rpx solid ${this.borderColor}`: 'inherit',
			  borderLeft:this.borderShow || this.borderLeft ? `${this.border}rpx solid ${this.borderColor}`: 'inherit',
			  borderRight:this.borderShow || this.borderRight ? `${this.border}rpx solid ${this.borderColor}`: 'inherit',
			}
			return style
		}
	}
}
</script>

<style lang="scss">
	.l-table{
    /* #ifndef APP-NVUE */
    width: 100%;
    /* #endif */
	}
</style>