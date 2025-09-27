<template>
  <view class="layout">
    <view class="flex-layout">
      <TsCustom :backUrl="backUrl" :isBack="true" class="t-head-m1" title="房间介绍">
        <block slot='right'>
          <view class="header-refresh-no" @click="isShowGamePanel = !isShowGamePanel">
            <text>{{ curItem.gname }}</text>
            <u-icon :name="isShowGamePanel ? 'arrow-up' : 'arrow-down'" color="#fff" size="16" style="margin-left: 8rpx;"></u-icon>
          </view>
        </block>
      </TsCustom>
      <view class="flex-content">
        <view class="room-title">
          <view class="room-title-1">房间介绍</view>
          <view class="room-title-2">{{ notice }}</view>
        </view>
        <u-tabs :scrollable="false" :activeStyle="{'color':'rgb(1, 190, 255)'}" :list="list" lineColor="rgb(1, 190, 255)" @click="change"></u-tabs>
        <view v-show="current == 0" class="room-content">
          <view class="toptitle">
            <view class="toptitle-1">游戏规则</view>
            <view class="toptitle-title" @click="showTtitle1">
              {{ curItem.gname }}
            </view>
          </view>
          <view class="rules">
            <view v-show="curItem.template == 'PK10'" class="article">
              <view class="rules">
                <view>
                  <view><span class="label label-table">1、【3/大/5】</span></view>
                  <ul>
                    <view>
                      这种可识别为【第三名 大-5】，大小单双玩法1~10名都可以识别，龙虎玩法只有1~5名能识别。
                    </view>
                  </ul>
                  <view><span class="label label-table">2、【123大/5】</span></view>
                  <ul>
                    <view>
                      这种【不写位置】的，默认识别为只投第一名【第一名 1-5，第一名 2-5，第一名 3-5，第一名
                      大-5】，大小单双龙虎以及所有号码都支持这种识别方式。“第一名”车号大于“第十名”车号视为【龙】中奖、反之小于视为【虎】中奖，其余情形视为不中奖。
                    </view>
                  </ul>
                  <view><span class="label label-table">3、【1大5】</span></view>
                  <ul>
                    <view>
                      这种【投注的号码是非数字玩法】的，可以忽略'/'。<br>*【1大5】实际是【1/大/5】，识别为【第一名 大-5】。
                    </view>
                  </ul>
                  <view><span class="label label-table">4、【和】</span></view>
                  <ul>
                    <view>
                      这种被识别为【冠亚】玩法。<br>
                      *比如【和/大/5】会被识别为【冠亚和大小 大-5】，【和/345/5】会被识别为【冠亚 3-5，4-5，5-5】。<br>
                      *同时冠亚玩法也可以省略位置和号码之间的分隔符，比如【和345/5】，也会被识别为【冠亚
                      3-5，4-5，5-5】。
                    </view>
                  </ul>
                  <view><span class="label label-table">5、【位置10和号码10】</span></view>
                  <view>
                    <view>
                      第十名和号码10，都用0来代替。<br>
                      *比如【0/1/5】，会被识别为【第十名 1-5】。<br>
                      *比如【10大5】，会被识别为【第一名 大-5，第十名 大-5】。
                    </view>
                  </view>
                  <view><span class="label label-table">6、【前三 后三 前五 后五】</span></view>
                  <view>
                    <view>
                      这种是根据字面意思，来识别要投注的位置。<br>
                      *比如【前三/2/5】，会被识别为【第一名 2-5，第二名 2-5，第三名 2-5】。<br>
                      *同理，如果是【后五】，那么就是会投第六名到第十名。
                    </view>
                  </view>
                  <view><span class="label label-table">7、【梭哈】</span></view>
                  <view>
                    <view>
                      梭哈是指，以剩余积分最大的整数金额，对指令中包含的所有号码进行等额下注。<br>
                      *比如，剩余100，指令输入【1/123/梭哈】，那么下注后指令实际为【1/123/33】，此时分数剩余1。<br>
                      *比如，剩余100.5，指令输入【大单梭哈】，那么下注后指令实际为【1/大单/50】，此时分数剩余0.5。<br>
                      *注意：梭哈指令尽量以标准格式进行投注，比如 1/123/梭哈<br>
                      *注意：梭哈后，有剩余分数为正常现象，比如剩余积分不能被梭哈指令整除，或者梭哈后立马有上分或者往期游戏有结算
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-show="curItem.template == 'SSC'" class="article">
              <view class="rules">
                <view class="headline">投注方式</view>
                <view>
                  <view><span class="label label-table">1、【1/1大/20】</span></view>
                  <view>
                    <view>
                      这种可识别为：【第一球 1-20，第一球 大-20】，第一球~第五球可识别大小单双和0~9号码玩法。
                    </view>
                  </view>
                  <li><span class="label label-table">2、【1大5】</span></li>
                  <view>
                    <view>
                      这种【投注的号码是非数字玩法】的，可以忽略'/'。<br>*【1大5】实际是【1/大/5】，识别为【第一名 大-5】。
                    </view>
                  </view>
                  <view><span class="label label-table">3、【不指明位置】</span></view>
                  <view>
                    <view>
                      *比如：大/20这种【不指明位置】的，默认识别为第一球~第五球都投【第一球 大-20,第二球 大-20,第三球
                      大-20,第四球 大-20,第五球 大-20】。这种也称之为【不定位买法】，【12/5】，识别为【第12345球都买1和2】。
                    </view>
                  </view>
                  <view><view class="label label-table">4、【前三 中三 后三】</view></view>
                  <view>
                    <view>
                      *豹子、顺子、对子、半顺、杂六玩法【可以不用分隔符】，也可以【只写玩法与金额之间的分隔符
                      *比如：【前三豹子5】或者【中三顺子/5】，当然写【前三/豹子/5】也是可以的。同时也支持【不指明位置】玩法，比如【豹子5】，可识别为【前三豹子-5，中三豹子-5，后三豹子-5】。
                    </view>
                  </view>
                  <view><span class="label label-table">5、【梭哈】</span></view>
                  <view>
                    <view>
                      梭哈是指，以剩余积分最大的整数金额，对指令中包含的所有号码进行等额下注。<br>
                      *比如，剩余100，指令输入【1/123/梭哈】，那么下注后指令实际为【1/123/33】，此时分数剩余1。<br>
                      *比如，剩余100.5，指令输入【大梭哈】，那么下注后指令实际为【12345/大/20】，此时分数剩余0.5。<br>
                      *注意：梭哈指令尽量以标准格式进行投注，比如 1/123/梭哈<br>
                      *注意：梭哈后，有剩余分数为正常现象，比如剩余积分不能被梭哈指令整除，或者梭哈后立马有上分或者往期游戏有结算
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-show="curItem.template == 'BINGO'" class="article">
              <view class="rules">
                <view class="headline">投注方式</view>
                <view>
                  <view><span class="label label-table">1、【1/1大/20】</span></view>
                  <view>
                    <view>
                      这种可识别为：【第一球 1-20，第一球 大-20】，第一球~第五球可识别大小单双和0~9号码玩法。
                    </view>
                  </view>
                  <li><span class="label label-table">2、【1大5】</span></li>
                  <view>
                    <view>
                      这种【投注的号码是非数字玩法】的，可以忽略'/'。<br>*【1大5】实际是【1/大/5】，识别为【第一名 大-5】。
                    </view>
                  </view>
                  <view><span class="label label-table">3、【不指明位置】</span></view>
                  <view>
                    <view>
                      *比如：大/20这种【不指明位置】的，默认识别为第一球~第五球都投【第一球 大-20,第二球 大-20,第三球
                      大-20,第四球 大-20,第五球 大-20】。这种也称之为【不定位买法】，【12/5】，识别为【第12345球都买1和2】。
                    </view>
                  </view>
                  <!--                    <view><view class="label label-table">4、【前三 中三 后三】</view></view>
                                      <view>
                                        <view>
                                          *豹子、顺子、对子、半顺、杂六玩法【可以不用分隔符】，也可以【只写玩法与金额之间的分隔符
                                          *比如：【前三豹子5】或者【中三顺子/5】，当然写【前三/豹子/5】也是可以的。同时也支持【不指明位置】玩法，比如【豹子5】，可识别为【前三豹子-5，中三豹子-5，后三豹子-5】。
                                        </view>
                                      </view>-->
                  <view><span class="label label-table">4、【梭哈】</span></view>
                  <view>
                    <view>
                      梭哈是指，以剩余积分最大的整数金额，对指令中包含的所有号码进行等额下注。<br>
                      *比如，剩余100，指令输入【1/123/梭哈】，那么下注后指令实际为【1/123/33】，此时分数剩余1。<br>
                      *比如，剩余100.5，指令输入【大梭哈】，那么下注后指令实际为【12345/大/20】，此时分数剩余0.5。<br>
                      *注意：梭哈指令尽量以标准格式进行投注，比如 1/123/梭哈<br>
                      *注意：梭哈后，有剩余分数为正常现象，比如剩余积分不能被梭哈指令整除，或者梭哈后立马有上分或者往期游戏有结算
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-show="curItem.template == 'PCDD'" class="article">
              <view class="rules"><h4 class="headline" style="color: red;">
                特别说明：PC蛋蛋所有玩法仅支持单笔下注，如需多笔同时下注请使用#号分隔符。</h4>
                <view>
                  <view><span class="label label-table">1、【数字玩法】</span></view>
                  <view>
                    <view>数字玩法必须带'/'分隔符。</view>
                    <view>
                      【1/5】识别成【号码1-5】，PC蛋蛋号码下注位置范围0-27。多笔注单玩法【1/5#2/5】，识别为【号码1,2-5】。
                    </view>
                  </view>
                  <view><span class="label label-table">2、【特码玩法】</span></view>
                  <view>
                    <view>特码玩法必须带'/'分隔符。</view>
                    <view>
                      PCDD特码玩法必须在0-27号码之间选择三个不相同的号码作为特码来下单。比如【特码/1/2/3/5】，可识别为【特码包三1,2,3-5】。
                    </view>
                  </view>
                  <view><span class="label label-table">3、【混合玩法】</span></view>
                  <view>
                    <view>
                      混合玩法可省略'/'分隔符。
                    </view>
                    <view>【大/5】或【极小5】或【豹子5】，带'/'或者不带'/'，都可识别成功。</view>
                  </view>
                  <view><span class="label label-table">4、【色波玩法】</span></view>
                  <view>
                    <view>色波玩法可省略'/'分隔符。</view>
                    <view>
                      【红波5】或【蓝波/5】，带'/'或者不带'/'，都可识别成功。如果色波开奖为黄波(也叫灰波)，则会根据管理员设置的【开和是否返本】来结算。
                    </view>
                  </view>
                  <view><span class="label label-table">5、【梭哈】</span></view>
                  <view>
                    <view>
                      梭哈是指，以剩余积分最大的整数金额，对指令中包含的所有号码进行等额下注。<br>
                      *比如，剩余100，指令输入【1/梭哈】，那么下注后指令实际为【1/100】，此时分数剩余0。<br>
                      *比如，剩余100.5，指令输入【大梭哈】，那么下注后指令实际为【大/100】，此时分数剩余0.5。<br>
                      *注意：梭哈指令尽量以标准格式进行投注，比如 1/梭哈 或者 极大/梭哈<br>
                      *注意：梭哈后，有剩余分数为正常现象，比如剩余积分不能被梭哈指令整除，或者梭哈后立马有上分或者往期游戏有结算
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view v-show="curItem.template == 'K3'" class="article">
              <view class="rules"><h4 class="headline">快3游戏规则：</h4>
                <view>
                  <view><span class="label label-table">1、【大/5】</span></view>
                  <view>
                    <view>
                      这种识别为【两面】玩法，两面玩法支持大小单双。
                    </view>
                    <view>
                      *两面玩法支持忽略斜杠下注，比如：大5。
                    </view>
                  </view>
                  <view><span class="label label-table">2、【4/5/6/5】</span></view>
                  <view>
                    <view>
                      这种识别为【总和】玩法，总和玩法斜杠最后一个数字识别为金额，前面的都识别为总和号码，总和玩法下注范围是4-17。
                    </view>
                    <view>
                      *比如【456/5】识别为：【总和4-5 总和5-5 总和6-5】。
                    </view>
                  </view>
                  <view><span class="label label-table">3、【单骰/1/2/3/5】</span></view>
                  <view>
                    <view>
                      这种可识别为【单骰 1-5 单骰2-5 单骰3-5】，单骰玩法下注范围是1-6，,允许号码和号码之间省略斜杆。
                    </view>
                    <view>
                      *比如：单骰/123/5，或者单骰123/5。
                    </view>
                  </view>
                  <view><span class="label label-table">4、【对子1/5或豹子/1/5】</span></view>
                  <view>
                    <view>
                      这种分别识别为【对子 1-5】和【豹子 1-5】，对子和豹子下注范围是1-6，允许号码和号码之间省略斜杆，比如：对子123/5。
                    </view>
                    <view>
                      *豹子玩法会多一个全骰下注内容，比如：全骰/5或全骰5，解析为【豹子 1~6 金额5】，意思是下注全骰玩法，开出任意豹子都算中。
                    </view>
                  </view>
                  <view><span class="label label-table">5、【梭哈】</span></view>
                  <view>
                    <view>
                      梭哈是指，以剩余积分最大的整数金额，对指令中包含的所有号码进行等额下注。<br>
                      *比如，剩余100，指令输入【1/梭哈】，那么下注后指令实际为【1/100】，此时分数剩余0。<br>
                      *比如，剩余100.5，指令输入【大梭哈】，那么下注后指令实际为【大/100】，此时分数剩余0.5。<br>
                      *注意：梭哈指令尽量以标准格式进行投注，比如 1/梭哈 或者 极大/梭哈<br>
                      *注意：梭哈后，有剩余分数为正常现象，比如剩余积分不能被梭哈指令整除，或者梭哈后立马有上分或者往期游戏有结算
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-show="current == 1" class="room-content">
          <view class="toptitle">
            <view class="toptitle-title">
              {{ curItem.gname }}
            </view>
          </view>
          <view class="list">
            <view class="flex">
              <view class="flex-1">玩法</view>
              <view class="flex-1">赔率</view>
            </view>
            <view class="flex" v-for="item in odds">
              <view class="flex-1">{{ item.name }}</view>
              <view class="flex-1">{{ item.odds }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <u-overlay :show="isShowGamePanel" :style="{'top':top+'px'}" @click="isShowGamePanel = false">
      <u-transition :customStyle="{'position':'fixed','width':'100%'}" :show="isShowGamePanel" mode="fade" @click.prevent>
        <view style="border-top: 1px solid #eee;">
          <view class="lottery">
            <view class="lotteryItem">
              <view v-for="item in gameList" class="lotteryI">
                <view :class="{'active':item.gid == curItem.gid}" class="span1" @click.stop="selectGid(item)">{{ item.gname }}</view>
              </view>
            </view>
          </view>
        </view>
      </u-transition>
    </u-overlay>
  </view>
</template>

<script>
export default {
  mixins: [uni.$mymixin],
  data() {
    return {
      backUrl:"pages/gamehall/gamehall",
      isShowGamePanel:false,
      top:0,
      curItem:{},
      query:{
        gid:-1
      },
      gameList:[],
      notice:'',
      odds:[],
      list: [{
        name: '玩法说明'
      }, {
        name: '彩种赔率'
      }],
      current: 0
    };
  },
  onReady() {
    this.$u.getRect('.t-head-m1').then(res => {
      this.top = res.height;
    })
  },
  onLoad() {
    this.getGameListByIfok();
  },
  methods: {
    selectGid(item){
      this.isShowGamePanel = false;
      this.curItem = item;
      this.query.gid = item.gid;
      this.getGameintroduce();
    },
    getGameListByIfok(){
      this.$u.api.common.getGameListByIfok({type:2}).then(res => {
        this.gameList = res.data.list;
        this.curItem = this.gameList[0];
        this.query.gid = this.curItem.gid;
        this.getGameintroduce();
      });
    },
    getGameintroduce(){
      this.$u.api.member.gameintroduce({gid:this.curItem.gid}).then(res => {
        this.notice = res.data.notice;
        this.odds = res.data.odds;
      });
    },
    change(obj) {
      this.current = obj.index;
    },
    showTtitle1() {
      this.showTtitle = !this.showTtitle;
      if (!this.showTtitle) {
        this.tnicontitle = 'tn-icon-down';
      } else {
        this.tnicontitle = 'tn-icon-up';
      }
    },
    showTtitleText2() {
      this.showTtitle2 = !this.showTtitle2;
      if (!this.showTtitle2) {
        this.tnicontitle = 'tn-icon-down';
      } else {
        this.tnicontitle = 'tn-icon-up';
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.header-refresh-no {
  display: flex;
  align-items: center;
  color: #fff;
  font-weight: 500;
  font-size: 30rpx;
  height: 100%;
  justify-content: flex-end;
  margin-right: 20rpx;
}
.lottery {
  max-height: 80%;
  background-color: #fff;
  padding-bottom: 8px;
  .lotteryItem {
    display: flex;
    justify-content: flex-start;
    text-align: center;
    flex-wrap: wrap;
    .lotteryI {
      width: 33.3%;
      padding: 8px 8px 0 8px;
      box-sizing: border-box;
      .span1 {
        padding: 10px 5px;
        border-radius: 54px;
        background-color: #f4f4f4;
      }
    }
    .lotteryI .span1.active {
      color: #fff;
      background: #0087b4;
    }
  }
}

.layout{
  height: 100%;
  width: 100%;
  display: flex;
  background-color: #f4f4f4;
  .flex-layout{
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f4f4f4;
    .flex-content {
      flex: 1;
      overflow-y: scroll;
      background-color: #ededed;
      position: relative;
      .room-title {
        margin: 20rpx 32rpx;
        background: #fff;
        border-radius: 20rpx;
        font-size: 28rpx;
        .room-title-1 {
          padding: 20rpx 0 20rpx 32rpx;
          color: #9e9e9e;
          font-size: 26rpx;
          border-bottom: 4rpx solid #eee
        }
        .room-title-2 {
          padding: 20rpx 32rpx;
          font-size: 26rpx;
        }
      }
      .room-content {
        background: #fff;
        font-size: 26rpx;
        margin: 18rpx 32rpx;
        .toptitle {
          text-align: center;
          padding: 20rpx 24rpx;
          border-bottom: 2rpx solid #eee
        }
        .toptitle .toptitle-1 {
          position: absolute;
          color: #9e9e9e;
        }
        .toptitle .toptitle-title {
          font-size: 30rpx;
          color: #222
        }
        .rules {
          padding: 8rpx 18rpx 18rpx 18rpx;
        }
      }
    }
  }
}

.room-content .list .flex {
  display: flex;
  border-bottom: 4rpx solid #eee
}

.room-content .list .flex .flex-1 {
  width: 50%;
  text-align: center;
  font-size: 26rpx;
  line-height: 80rpx;
  color: #666
}

.article {
  line-height: 1.8
}
</style>
