<template>
  <v-scroll :isInit="isInit" :height="height" @load="load" :refresher-enabled="refresherEnabled" @ref="ref" ref="scroll">
    <slot name="box" v-bind="list"></slot>
  </v-scroll>
</template>
<script>
export default {
  name:'paging',
  props: {
    data: {
      default() {
        return {};
      },
      type: Object,
      require: false,
    },
    refresherEnabled:{
      default:true,
      required:false,
      type:Boolean
    },
    ajax: {
      require: true,
      type: Function,
    },
    height: {
      require: false,
      type: Number|String,
    },
    isInit:{
      default:false,
      required:false,
      type:Boolean
    }
  },
  data() {
    return {
      list: [],
      page: 0,
    };
  },
  methods: {
    load(over) {
      this.page++;
      this.getList(over);
    },
    ref(over) {
      this.page = 1;
      this.getList(over);
    },
    resetData() {
      this.page = 1;
      this.list = [];
    },
    getList(over) {
      let data = Object.assign(
        {
          page: this.page
        },
        this.data
      );
      this.ajax(data).then((res) => {
        let queryVo = res.data;
        if (queryVo.currentPage == 1) this.list = [];
        this.list = [...this.list, ...queryVo.records];
        over &&
          over({
            finished: queryVo.records.length < queryVo.pageSize,
          });
      });
    },
  },
  created() {},
};
</script>