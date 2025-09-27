<template>
	<view class="l-tr">
		<slot></slot>
	</view>
</template>

<script>
import table from '../l-table/table.js'
export default{
	name:'l-tr',
	mixins:[table]
}
</script>

<style lang="scss">
	.l-tr{
    /* #ifndef APP-NVUE */
    width: 100%;
    display: flex;
    /* #endif */
    /* #ifdef APP-NVUE */
    flex: 1;
    flex-direction: row;
    /* #endif */
	}

</style>