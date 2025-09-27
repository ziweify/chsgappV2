<!--
  z-paging滚动逻辑优化说明：
  
  问题：之前z-paging每次接收到新消息都会自动滚动到底部，影响用户体验
  
  修复：
  1. 批量消息处理时，只有在用户主动发送消息或用户在底部时才滚动到底部
  2. 优化了滚动监听逻辑，更精确地判断用户是否在底部
  3. 完善了未读消息计数机制，当用户不在底部时正确累加未读消息数
  4. 切换到聊天模式时，只有在用户原本就在底部时才滚动到底部
  
  核心逻辑：
  - isAtBottom：跟踪用户是否在聊天底部
  - tmpToButomFlag：标记用户主动发送消息，必须滚动到底部
  - unreadCount：未读消息计数，用于显示新消息提示
-->
<template>
  <view class="skin_blue layout" style="display: flex; flex-direction: column">
    <view class="flex-layout">
      <!-- 主内容区域 -->
      <view class="flex-content">
        <view class="main-content">
          <!-- 聊天内容 -->
          <view class="chat-content" v-show="swiperCurrent === 0">
            <!-- 使用z-paging组件优化聊天列表性能 -->
            <z-paging 
              ref="paging" 
              v-model="chatList" 
              use-chat-record-mode 
              :default-page-size="chatPageSize"
              class="chat-list"
              :auto-height="true"
              :auto-to-bottom-when-chat="true"
              :refresher-enabled="true"
              :refresher-threshold="100"
              :refresher-triggered="refresherTriggered"
              :safe-area-inset-bottom="false"
              :keyboard-adjust="true"
              :auto-adjust-keyboard="true"
              :auto-show-back-to-top="true"
              :chat-record-mode-bottom-height="heightArr.bottomHeight || 160"
              :chat-record-mode-top-height="heightArr.topHeight || 160"
              :chat-record-mode-auto-adjust-keyboard="true"
              :chat-record-mode-keyboard-adjust-duration="300"
              :chat-record-maintain-scroll-position="true"
              :back-to-top-img="backTopImg"
              @query="queryList" 
              @onRefresh="onRefresh"
              @scroll="onScroll"
              @keyboardHeightChange="keyboardHeightChange"
              @hidedKeyboard="hidedKeyboard"
              @queryerror="queryError">

              <!-- 顶部 -->
              <template #top>
                <!-- 头部区域 -->
                <view class="top-height">
                  <!-- 状态栏 -->
                  <view class="hearder-status"></view>
                  
                  <!-- 导航栏 -->
                  <view class="header-bar">
                    <view class="header-bar-left" @click="backTo">
                      <u-icon style="margin-top:4rpx;" size="24" color="#fff" name="arrow-left"></u-icon>
                      <view class="header-bar-title">{{ curtime.gname || '群聊' }}</view>
                    </view>
                    <view class="header-bar-right">
                      <view class="item item1">
                        <view class="con1">
                          <view class="text1 span1">积分:</view>
                          <view class="text2 span1">{{ balanceInfo.kmoney || 0 }}</view>
                        </view>
                        <view class="con1">
                          <view class="text1 span1">输赢:</view>
                          <view class="text2 span1" :class="(balanceInfo.sy || 0) > 0 ? 'green' : ((balanceInfo.sy || 0) < 0 ? 'red' : '')">{{ balanceInfo.sy || 0 }}</view>
                        </view>
                      </view>
                      <view class="item item2">
                        <view class="con1" v-show="roomConfig.showTurnover == 1">
                          <view class="text1 span1">流水:</view>
                          <view class="text2 span1">{{ balanceInfo.jetotal || 0 }}</view>
                        </view>
                        <view class="con1" v-show="roomConfig.showTurnover == 0">
                          <view class="text1 span1"></view>
                          <view class="text2 span1"></view>
                        </view>
                        <view class="con1">
                          <view class="text1 span1">回水:</view>
                          <view class="text2 span1">{{ balanceInfo.backWater || 0 }}</view>
                        </view>
                      </view>
                    </view>
                  </view>
                  
                  <!-- 游戏信息栏 -->
                  <view class="drop-down" style="position: relative;">
                    <view class="drop-down-list">
                      <!-- 当期信息 -->
                      <view class="drop-down-list-item">
                        <view class="period title">{{ curtime.shortPeriod || '' }}</view>
                        <view class="drop-down-wating">
                          <view class="time">
                            <!-- 正常倒计时 -->
                            <view class="flip-down vue-countdown-component theme2" v-show="curtime.fp === 0 && curtime.timearr">
                              <view class="time-box">
                                <view class="base">{{ curtime.timearr && curtime.timearr[0] }}</view>
                              </view>
                              <view class="time-box">
                                <view class="base">{{ curtime.timearr && curtime.timearr[1] }}</view>
                              </view>
                              <view class="time-unit">:</view>
                              <view class="time-box">
                                <view class="base">{{ curtime.timearr && curtime.timearr[2] }}</view>
                              </view>
                              <view class="time-box">
                                <view class="base">{{ curtime.timearr && curtime.timearr[3] }}</view>
                              </view>
                            </view>
                            <!-- 封盘倒计时 -->
                            <view class="flip-down vue-countdown-component theme2 less10" v-show="curtime.stopstatus === 0 && curtime.fp === 1 && curtime.timearr">
                              <view class="time-box">
                                <view class="base">{{ curtime.timearr && curtime.timearr[0] }}</view>
                              </view>
                              <view class="time-box">
                                <view class="base">{{ curtime.timearr && curtime.timearr[1] }}</view>
                              </view>
                              <view class="time-unit">:</view>
                              <view class="time-box">
                                <view class="base">{{ curtime.timearr && curtime.timearr[2] }}</view>
                              </view>
                              <view class="time-box">
                                <view class="base">{{ curtime.timearr && curtime.timearr[3] }}</view>
                              </view>
                            </view>
                          </view>
                          <text class="word1" v-show="curtime.stopstatus === 0 && curtime.fp === 1">封盘中</text>
                          <text class="word1" v-show="curtime.stopstatus === 1">未开盘</text>
                          <view class="btns">
                            <button v-if="utype == 0" @click="betRecordTop">注单</button>
                            <button @click="dragonTop">长龙</button>
                            <button v-show="roomConfig.showPrediction == 1" @click="predictTop">预测</button>
                          </view>
                        </view>
                      </view>
                      
                      <!-- 开奖结果 -->
                      <view class="drop-down-list-item" @click="showOpenListClick">
                        <view class="period">{{ openResult.period || '' }}</view>
                        <view class="drop-down-opened">
                          <!-- PK10开奖结果 -->
                          <view v-if="template === 'PK10' && openResult.property !== undefined" class="pk10" style="display: flex; align-items: center;">
                            <view class="open-num min drop-down-list-item-ul">
                              <view v-for="(it, index) in openResult.openNum" :key="index" class="drop-down-list-item-ul-li" :class="'ball-'+it"></view>
                            </view>
                            <view class="firstSum">
                              <view>冠亚和</view>
                              <view class="span1wrap">
                                <view class="span1">{{ openResult.property.sum }}</view>
                                <view :class="{'red':openResult.property.bigSmall === '大','blue':openResult.property.bigSmall === '小'}" class="span1">{{ openResult.property.bigSmall }}</view>
                                <view :class="{'red':openResult.property.singleDouble === '双','blue':openResult.property.singleDouble === '单'}" class="span1">{{ openResult.property.singleDouble }}</view>
                              </view>
                            </view>
                          </view>
                          
                          <!-- SSC开奖结果 -->
                          <view v-if="template === 'SSC' && openResult.property !== undefined" class="skin_yuan" style="display: flex; align-items: center;">
                            <view class="open-num ssc min drop-down-list-item-ul">
                              <view v-for="(it, index) in openResult.openNum" :key="index" class="drop-down-list-item-ul-li" :class="'ball-'+it">{{it}}</view>
                            </view>
                            <view class="sscSum">
                              <view :class="{'red':openResult.property.sumBigSmall === '大','blue':openResult.property.sumBigSmall === '小'}">{{ openResult.property.sumBigSmall }}</view>
                              <view :class="{'red':openResult.property.sumSingleDouble === '双','blue':openResult.property.sumSingleDouble === '单'}">{{ openResult.property.sumSingleDouble }}</view>
                              <view :class="{'red':openResult.property.dragonTiger === '龙','blue':openResult.property.dragonTiger === '虎','green':openResult.property.dragonTiger === '和'}">{{ openResult.property.dragonTiger }}</view>
                            </view>
                          </view>
                          
                          <!-- BINGO开奖结果 -->
                          <view v-if="template === 'BINGO' && openResult.property !== undefined" class="skin_yuan" style="display: flex; align-items: center;">
                            <view class="open-num bingo min drop-down-list-item-ul">
                              <view v-for="(it, index) in openResult.openNum" :key="index" class="drop-down-list-item-ul-li" :class="'b'+it">{{it}}</view>
                            </view>
                            <view class="sscSum">
                              <view class="red" style="font-weight: bold">{{ openResult.property.sum }}</view>
                              <view :class="{'red':openResult.property.sumBigSmall === '大','blue':openResult.property.sumBigSmall === '小'}">{{ openResult.property.sumBigSmall }}</view>
                              <view :class="{'red':openResult.property.sumSingleDouble === '双','blue':openResult.property.sumSingleDouble === '单'}">{{ openResult.property.sumSingleDouble }}</view>
                              <view :class="{'red':openResult.property.dragonTigerNum === '龙','blue':openResult.property.dragonTigerNum === '虎','green':openResult.property.dragonTigerNum === '和'}">{{ openResult.property.dragonTigerNum }}</view>
                            </view>
                          </view>
                        </view>
                        <view class="drop-down-arrow">
                          <u-icon style="margin-right: 10rpx;" size="20" color="#e6e6e6" :name="isShowOpenList ? 'arrow-up-fill' : 'arrow-down-fill'"></u-icon>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
              </template>
              
              <!-- 聊天记录模板 -->
              <view v-for="(item,index) in chatList" :key="index">
                <view style="transform: scaleY(-1)" @touchstart="touchstart" :key="item.id || item.msgid || index">
                  <chat-item 
                    :chatroomNicknameLength="roomConfig.chatroomNicknameLength || 10" 
                    @mlongpress="onLongPress" 
                    :mindex="index" 
                    :utype="utype" 
                    shape="circle" 
                    :headImageDomain="headImageDomain" 
                    :conImageDomain="openImageDomain" 
                    @msgOrderDetail="msgOrderDetail" 
                    :uid="parsedUid" 
                    :item="item">
                  </chat-item>
                </view>
              </view>
              
              <!-- 无更多数据提示 -->
              <template #loadingMoreNoMore>
                <view class="no-more-data">已加载全部聊天记录</view>
              </template>

              <template #bottom>
                <!-- 底部聊天输入框 - 固定定位 -->
                <view class="chat-input-bar-container" v-show="swiperCurrent === 0">
                  <view class="chat-input-bar">
                    <view class="key-board" @click="emojiChange('iskeyshow','isbuttonsshow')">
                      <image src="/static/image/icon/keybtn.png"></image>
                    </view>
                    <view class="chat-input-container">
                      <u-input 
                        :placeholder="(balanceInfo.room_status == 2) ? '禁言中' :'发送消息...'" 
                        :disabled="balanceInfo.room_status == 2" 
                        @blur="ismsgfocus = false" 
                        @focus="ismsgfocus = true"
                        :readonly="roomConfig.banChat == 1" 
                        :focus="ismsgfocus" 
                        class="chat-input" 
                        v-model="sendmsg" 
                        :adjustPosition="false" 
                        type="text"
                        :maxlength="500"
                        @confirm="sendevent"/>
                    </view>
                    <view class="chat-input-send" v-if="utype == 0">
                      <image @click="emojiChange('isbuttonsshow','iskeyshow')" v-show="sendmsg.length <= 0" src="/static/img/more.png"></image>
                      <image @touchend.prevent="sendevent" v-show="sendmsg.length > 0" src="/static/img/send.png"></image>
                    </view>
                    <view class="chat-input-send" v-if="utype == 1">
                      <image @click="sendevent" src="/static/img/send.png"></image>
                    </view>
                  </view>
                  
                  <!-- 表情面板和工具栏 -->
                  <view class="emoji-panel-container" :style="[{height: emojiType === 'mykeyboard' ? heightArr.keyHeight+'px' : '0px'}]">
                    <scroll-view scroll-y style="height: 100%;flex: 1;">
                      <!-- 自定义键盘 -->
                      <block v-if="utype == 0">
                        <view class="key-board" v-show="iskeyshow">
                          <view class="nav_1">
                            <view class="key-board-ul-li" @click="myonkey('梭哈',0)">梭哈</view>
                            <view class="key-board-ul-li" @click="myonkey('取消',1)">取消</view>
                            <view class="key-board-ul-li" @click="myonkey('上分',1)">上分</view>
                            <view class="key-board-ul-li" @click="myonkey('查',1)">查</view>
                            <view class="key-board-ul-li" @click="myonkey('下分',1)">下分</view>
                            <view class="key-board-ul-li" @click="myonkey('重复',1)">重复</view>
                          </view>
                          <view class="nav_2" v-show="isshowssckey">
                            <view class="key-board-ul-li" @click="myonkey('前三',0)">前三</view>
                            <view class="key-board-ul-li" @click="myonkey('中三',0)">中三</view>
                            <view class="key-board-ul-li" @click="myonkey('后三',0)">后三</view>
                            <view class="key-board-ul-li" @click="myonkey('总和',0)">总和</view>
                            <view class="key-board-ul-li" @click="myonkey('豹子',0)">豹子</view>
                            <view class="key-board-ul-li" @click="myonkey('对子',0)">对子</view>
                            <view class="key-board-ul-li" @click="myonkey('顺子',0)">顺子</view>
                            <view class="key-board-ul-li" @click="myonkey('半顺',0)">半顺</view>
                            <view class="key-board-ul-li" @click="myonkey('杂六',0)">杂六</view>
                          </view>
                          <view class="nav_2" v-show="isshowbingokey">
                            <view class="key-board-ul-li" @click="myonkey('福',0)">福</view>
                            <view class="key-board-ul-li" @click="myonkey('禄',0)">禄</view>
                            <view class="key-board-ul-li" @click="myonkey('寿',0)">寿</view>
                            <view class="key-board-ul-li" @click="myonkey('喜',0)">喜</view>
                            <view class="key-board-ul-li" @click="myonkey('尾大',0)">尾大</view>
                            <view class="key-board-ul-li" @click="myonkey('尾小',0)">尾小</view>
                            <view class="key-board-ul-li" @click="myonkey('合单',0)">合单</view>
                            <view class="key-board-ul-li" @click="myonkey('合双',0)">合双</view>
                            <view class="key-board-ul-li" @click="myonkey('总和',0)">总和</view>
                          </view>
                          <view class="key-board-content">
                            <view class="nav_3">
                              <view class="key-board-ul-li" @click="myonkey('大',0)">大</view>
                              <view class="key-board-ul-li" @click="myonkey('小',0)">小</view>
                              <view class="key-board-ul-li" @click="myonkey('单',0)">单</view>
                              <view class="key-board-ul-li" @click="myonkey('双',0)">双</view>
                            </view>
                            <view class="nav_4">
                              <view class="key-board-ul-li" @click="myonkey('1',0)">1</view>
                              <view class="key-board-ul-li" @click="myonkey('2',0)">2</view>
                              <view class="key-board-ul-li" @click="myonkey('3',0)">3</view>
                              <view @longpress="longpressDel" class="key-board-ul-li drop-down-arrow1" style="color: #fe0101" @click="myonkey('删',0)">删</view>
                              <view class="key-board-ul-li" @click="myonkey('4',0)">4</view>
                              <view class="key-board-ul-li" @click="myonkey('5',0)">5</view>
                              <view class="key-board-ul-li" @click="myonkey('6',0)">6</view>
                              <view class="key-board-ul-li" @click="myonkey('龙',0)">龙</view>
                              <view class="key-board-ul-li" @click="myonkey('7',0)">7</view>
                              <view class="key-board-ul-li" @click="myonkey('8',0)">8</view>
                              <view class="key-board-ul-li" @click="myonkey('9',0)">9</view>
                              <view class="key-board-ul-li" @click="myonkey('冠亚',0)">冠亚</view>
                              <view class="key-board-ul-li" @click="myonkey('/#',0)">/&nbsp;&nbsp;#</view>
                              <view class="key-board-ul-li" @click="myonkey('0',0)">0</view>
                              <view :class="{'taking':roomConfig.banChat == 1}" class="key-board-ul-li" @touchend.prevent="myonkey('闲聊',0)">闲聊</view>
                              <view class="key-board-ul-li" @click="myonkey('虎',0)">虎</view>
                            </view>
                          </view>
                        </view>
                      </block>
                      
                      <!-- 工具按钮面板 -->
                      <view class="chat-form-buttons show" v-show="isbuttonsshow">
                        <view class="chat-form-buttons-list">
                          <view class="chat-form-buttons-list-li" @click="goto('')">
                            <view class="cont">
                              <image src="/static/image/icon/shangxiafenbtn.png" lazy="loaded"></image>
                            </view>
                            <view class="text">上下分</view>
                          </view>
                          <view class="chat-form-buttons-list-li" @click="goto('pages/wallet/walletApply',1)">
                            <view class="cont">
                              <image src="/static/image/icon/applyrecordbtn.png" lazy="loaded"></image>
                            </view>
                            <view class="text">申请记录</view>
                          </view>
                          <view class="chat-form-buttons-list-li" @click="goto('pages/wallet/wjsBetrecord',1)">
                            <view class="cont">
                              <image src="/static/image/icon/gamerecordbtn.png" lazy="loaded"></image>
                            </view>
                            <view class="text">未结记录</view>
                          </view>
                          <view class="chat-form-buttons-list-li" @click="goto('pages/wallet/report',1)">
                            <view class="cont">
                              <image src="/static/image/icon/gamereport.png" lazy="loaded"></image>
                            </view>
                            <view class="text">两周报表</view>
                          </view>
                          <view class="chat-form-buttons-list-li" @click="goto('',1)">
                            <view class="cont">
                              <image src="/static/image/icon/balancerecordbtn.png" lazy="loaded"></image>
                            </view>
                            <view class="text">积分帐变</view>
                          </view>
                          <view class="chat-form-buttons-list-li" @click="goto('',1)" v-show="roomConfig.selfWater == 1">
                            <view class="cont">
                              <image src="/static/image/icon/backwaterbtn.png" lazy="loaded"></image>
                            </view>
                            <view class="text">自助回水</view>
                          </view>
                        </view>
                      </view>
                    </scroll-view>
                  </view>
                </view>
              </template>
            </z-paging>
            
            <!-- 右侧悬浮按钮 -->
            <view :style="{'top':heightArr.topHeight+20+'px'}" class="coIcon" v-show="coicon1" @click="isshowright = !isshowright">
              <view class="span1">
                <image v-show="!isshowright" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAMAAAC7faEHAAAB7FBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+wOur2AAAAo3RSTlMAhB769vsb/v0CAb8VMgsM/A7pdOIx6s5g8ddTaewtFscSyoAFJGXL9dYDxobUEO5z0NoZJSlWwPLciIp/5IkvoD3dIQfDOeGu+bAordE81fTgUqNoR+dCe7M2P7iSqY58CruFCbZ+sQiDOHjrT4wNWBomTXlZxJ2cp3EUb6T45dlAXCAr31cjTsy+PkFtNG4Eq0ssLhf3gmuvwmrtH+ZENRPTAbDLLwAAAjFJREFUGBl9wQVDGgEAhuGPPEDA7u6csdSVXetQN113d3d3d+f7R3eHgg+DxK07hte2vUHalsHxwb9yuHvuZ6bNZ8rlMWgdKVZGhbnKdM3iAmo9axZYXTO7S1cNSNqemZ0q0uBrp7epVSULUK8NyQ3Vs3GMtDStNS2AbM0KTVbiir0BRFa4CjSvIWQzSsLEKzwLighEAQysLKqmYOVM5TXCkYFcrhcifckqVvJSxXTufACMvUDN0h5TYf3stUDz2axktwhaRGMHpl8+TRkhWyK4fv0jaolc2iYYgukE0DrJO2g0OTbscw3XmoSRugWGqFLUrxLoG196HJqZR8H9QoCh+UVFcOnoq7LpgzTynDUKRP4NSEmtngeyDdi0DXFSVthB1ygVcJBfVgNMtU6oOSmZrwB37pBwwpbk8/cFVxVQbU5iuhCX6qHbbKcng3sFcT5gLBY7K0uOCvvkKhLCcBh1JOAetkqYbNAY3BqEx+D5yRzWLw+GV6Cv3SALgLZDpQtktpZhxaJksQlkn+GFRpGot8UC3JAateK7dL0CrTRzcUKqeiCCyUZSlsXqAcznbBbL8s+THYOFNZBdaD77QSHkfgWoGy8O8H9ilpLlDi1BT5R4DjHUpZClReV4bwJmBWnmxOGMD8Edk0XvQAB/OUZmcnpvKGDXkytVS/eeEDfI4OZTh/08Bi/G7fFFtLXMmAsng16MLu+UK/sqv7sr6YuLZvDe80rX9FO0bGnQFl+A+swOSlXIZbNQAAAABJRU5ErkJggg==">
                </image>
                <image v-show="isshowright" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAMAAAC7faEHAAAB6VBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+oS8NlAAAAonRSTlMAhB769vsb/v0CAb8VMgsM/A7pdOIx6s5g8ddT7GktEscWyoAk4GUFy/XWA4YQxu7U0NpzGcApViXyiNyKf6CJL+TdPSEHwznh+a6wrSg81dH0Ukdoo+dCs3s2P0+Muwp5hZKDtusIsXgJuHypfjiODVkaTZ2cJhRvxFhxp6Qg5U5X+Fwj2UArbT7MvkE0BG5LLKsuF/eCa6/Cau01RObTHxPZei8IAAACMklEQVQYGX3BBUMaAQCG4Y88UhGxu2ubrufKhbHQ9ax1d3d3d3e9v3R3IHgg+DxK07hte2vUHalsHxwb9yuHvuZ6bNZ8rlMWgdKVZGhbnKdM3iAmo9axZYXTO7S1cNSNqemZ0q0uBrp7epVSULUK8NyQ3Vs3GMtDStNS2AbM0KTVbiir0BRFa4CjSvIWQzSsLEKzwLighEAQysLKqmYOVM5TXCkYFcrhcifckqVvJSxXTufACMvUDN0h5TYf3stUDz2axktwhaRGMHpl8+TRkhWyK4fv0jaolc2iYYgukE0DrJO2g0OTbscw3XmoSRugWGqFLUrxLoG196HJqZR8H9QoCh+UVFcOnoq7LpgzTynDUKRP4NSEmtngeyDdi0DXFSVthB1ygVcJBfVgNMtU6oOSmZrwB37pBwwpbk8/cFVxVQbU5iuhCX6qHbbKcng3sFcT5gLBY7K0uOCvvkKhLCcBh1JOAetkqYbNAY3BqEx+D5yRzWLw+GV6Cv3SALgLZDpQtktpZhxaJksQlkn+GFRpGot8UC3JAateK7dL0CrTRzcUKqeiCCyUZSlsXqAcznbBbL8s+THYOFNZBdaD77QSHkfgWoGy8O8H9ilpLlDi1BT5R4DjHUpZClReV4bwJmBWnmxOGMD8Edk0XvQAB/OUZmcnpvKGDXkytVS/eeEDfI4OZTh/08Bi/G7fFFtLXMmAsng16MLu+UK/sqv7sr6YuLZvDe80rX9FO0bGnQFl+A+swOSlXIZbNQAAAABJRU5ErkJggg=="></image>
              </view>
            </view>
            <u-transition :show="isshowright" :customStyle="{'position':'fixed','top':heightArr.topHeight+68+'px','right': '30rpx'}" mode="fade">
              <view class="right-icon">
                <view class="switch span1" @click="switchGame">
                  <image src="/static/image/icon/qiegame.png"></image>
                </view>
                <view class="customer span1" @click="customerTo">
                  <image src="/static/image/icon/customer.png"></image>
                </view>
                <view v-if="siteConfig.kjwurl" class="openResult span1" @click="siteTo">
                  <image src="/static/image/icon/kjw.png"></image>
                </view>
                <view v-if="utype == 0 && roomConfig.webInputKeyboard == 1" class="span1" @click="swiperCurrentChange">
                  <image  src="/static/image/icon/pan.png" class="beticon"></image>
                </view>
              </view>
            </u-transition>
          </view>
          
          <!-- 投注内容区域 -->
          
        </view>
      </view>
    </view>
    
    <!-- 投注底部栏 -->
    <view class="bet-footer" v-show="swiperCurrent === 1">
      <view class="footer-btns">
        <button
          v-for="(item, index1) in moneyList"
          :key="index1"
          @click="selectMoney(item)"
          size="mini"
        >{{ item }}</button>
      </view>
      <view class="footer-text">
        <view>下注总额：
          <text class="red-text">{{ zje }}</text>
        </view>
        <view class="span">共{{ zCount }}注单</view>
      </view>
      <view class="footer-content">
        <view class="van-cell van-field">
          <view class="van-cell__value van-cell__value--alone van-field__value">
            <view class="van-field__body"><input v-model="betMoney" type="number" placeholder="请输入下注金额" class="van-field__control"></view>
          </view>
        </view>
        <button @click="bet()" class="betbtn">下注</button>
        <button @click="betReset()" class="resetbtn">重置</button>
      </view>
    </view>
    
    <!-- 弹出层和面板 -->
    <view>
      <u-transition :show="topPanelShow" :customStyle="{'position':'fixed','width':'100%','top':heightArr.topHeight+'px'}" mode="fade">
        <!-- 预测面板 -->
        <view v-show="isshowpredict" class="predict-box">
          <view class="vanTop van-row">
            <view class="right-border van-col van-col--6">名次</view>
            <view class="van-col van-col--6">本群预测</view>
            <view class="van-col van-col--6"></view>
            <view class="van-col van-col--6"></view>
          </view>
          <view class="longDetail">
            <view class="van-row" v-for="(item, index) in predictInfoList" :key="index">
              <view class="right-border van-col van-col--6">
                <view>{{ item.name }}</view>
              </view>
              <view class="right-border van-col van-col--6">{{ item.referenceNum }}</view>
              <view class="right-border van-col van-col--6">
                <view class="big-single" :class="item.bigOrSmall == '小' ? 'bg-orange' : 'bg-blue'">{{ item.bigOrSmall }}</view>
              </view>
              <view class="van-col van-col--6">
                <view class="big-single" :class="item.singleOrDouble == '双' ? 'bg-orange' : 'bg-blue'">{{ item.singleOrDouble }}</view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 长龙面板 -->
        <view v-show="isclshow" class="chang-long-box">
          <view class="open-no-detail">
            <view class="vanTop van-row">
              <view class="van-col van-col--6">序号</view>
              <view class="van-col van-col--6">位置</view>
              <view class="van-col van-col--6">结果</view>
              <view class="van-col van-col--6">连期</view>
            </view>
            <view class="longDetail">
              <view class="van-row" v-for="(item,index) in cllist" :key="index">
                <view class="van-col van-col--6">{{ index+1 }}</view>
                <view class="van-col van-col--6">{{ item.position }}</view>
                <view class="van-col van-col--6">{{ item.betItem }}</view>
                <view class="van-col van-col--6" style="color: rgb(254, 1, 1);">{{ item.times }}</view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 开奖历史面板 -->
        <open-num-list :isShow="isShowOpenList" class="oepnListHeight" :template="template" :list="openresultlist"></open-num-list>
      </u-transition>
      
      <!-- 游戏切换弹窗 -->
      <u-popup :show="isShowSwitchPannel" mode="right" :closeOnClickOverlay="true" @close="isShowSwitchPannel = !isShowSwitchPannel" :safeAreaInsetTop="true">
        <view>
          <view @click="gotoSwitchGame(item)" class="game-switch-item" v-for="item in gTimeList" :key="item.gid">
            <view class="logo">
              <image :src="'/static/glogo1/'+item.gid+'.png'" lazy="loaded"></image>
            </view>
            <view class="lottery-name">
              <view class="p1">{{ item.gname }}</view>
              <view class="p2">{{ item.period }}期</view>
            </view>
            <view class="status">
              <view class="status-1">
                <text class="fpz-word" v-show="item.stopstatus == 0 && item.fp == 1">封盘中...</text>
                <text class="fpz-word" v-show="item.stopstatus == 1">未开盘</text>
                <text class="jfp-word" v-show="item.stopstatus == 0 && item.fp == 0">距离封盘</text>
              </view>
              <view class="status-2" v-show="item.stopstatus == 0 && item.fp == 0">
                <view>
                  <view class="flip-down vue-countdown-component theme5">
                    <view class="time-box">{{ item.timearr[0] }}</view>
                    <view class="time-box">{{ item.timearr[1] }}</view>
                    <view class="time-unit">:</view>
                    <view class="time-box">{{ item.timearr[2] }}</view>
                    <view class="time-box">{{ item.timearr[3] }}</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </u-popup>
      
      <!-- 注单详情弹窗 -->
      <u-popup :show="msgOrderDetailShow" mode="center" round="8" :customStyle="{'width':'90%'}" :closeOnClickOverlay="true" @close="msgOrderDetailShow = !msgOrderDetailShow">
        <view class="h-table">
          <text class="msgOrderDetailTitle">注单详情</text>
          <view class="h-tr">
            <text class="h-th">位置</text>
            <text class="h-th">号码</text>
            <text class="h-th">金额</text>
            <text class="h-th" v-if="orderShowTtype == 'settle'">盈亏</text>
          </view>
        </view>
        <scroll-view style="height: 600rpx" scroll-y="true">
          <view class="h-table">
            <view class="h-tr" v-for="(it, index) in msgOrderList" :key="it.id || it.orderNo || index">
              <view class="h-td"><text class="text">{{ it.b }}</text></view>
              <view class="h-td"><text class="text">{{ it.p }}</text></view>
              <view class="h-td"><text class="text">{{ it.a }}</text></view>
              <view class="h-td" v-if="orderShowTtype == 'settle'">
                <text class="text" v-if="it.y > 0" style="color: green;">+{{ it.y }}</text>
                <text class="text" v-if="it.y < 0" style="color: red;">{{ it.y }}</text>
                <text class="text" v-if="it.y == 0">{{ it.y }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </u-popup>
      
      <!-- 注单记录弹窗 -->
      <block v-if="utype == 0">
        <u-popup :show="betRecordShow" mode="center" round="8" :customStyle="{'width':'90%'}" :closeOnClickOverlay="true" @close="betRecordShow = !betRecordShow">
          <scroll-view style="height: 600rpx;" scroll-y="true" :show-arrow="false">
            <!-- 自定义注单记录折叠组件 -->
            <view class="bet-history-box">
              <view v-for="(item, betIndex) in periodOrderList" :key="item.period || item.id" class="bet-record-item">
                <!-- 注单记录标题栏 -->
                <view class="bet-record-header" @click="toggleBetRecord(betIndex)">
                  <view class="bet-list-item">
                    <view class="item-up">
                      <text class="strong">第{{ item.period }}期</text>
                      <text v-if="item.isSettle" class="text" :class="item.winLose > 0 ? 'green' : (item.winLose < 0 ? 'red' : '')">{{ item.winLose > 0 ? "+"+item.winLose : item.winLose }}</text>
                      <text v-if="!item.isSettle" class="text blue">未结算</text>
                    </view>
                    <view class="item-down">
                      <text class="total">注数：{{ item.totalCount }}注</text>
                      <text class="tmoney">金额：{{ item.totalMoney }}</text>
                      <text>收益</text>
                    </view>
                  </view>
                  <view class="bet-record-arrow" :class="{ 'bet-record-arrow-open': isBetRecordOpen(betIndex) }">
                    <u-icon name="arrow-down" size="20" color="#999"></u-icon>
                  </view>
                </view>
                <!-- 注单记录详情 -->
                <view v-show="isBetRecordOpen(betIndex)" class="bet-detail">
                  <view v-for="(order, orderIndex) in item.orders" :key="order.id || order.orderNo || orderIndex" class="bet-item">
                    <view class="left">{{ order.playGroupName }}[{{ order.playDetailName }}/{{ order.je }}]</view>
                    <view class="time">{{ order.time }}</view>
                    <view v-if="order.isSettle" class="text" :class="order.winLose > 0 ? 'green' : (order.winLose < 0 ? 'red' : '')">{{ order.winLose > 0 ? "+"+order.winLose : order.winLose }}</view>
                    <view v-if="!order.isSettle" class="text blue">未结算</view>
                  </view>
                </view>
              </view>
            </view>
          </scroll-view>
        </u-popup>
      </block>
      
      <!-- 操作菜单 -->
      <u-action-sheet @select="selectAction" :actions="actionlist" :closeOnClickOverlay="true" :safeAreaInsetBottom="true" @close="isShowAction = false" :closeOnClickAction="true" title="" :show="isShowAction"></u-action-sheet>
    </view>
  </view>
</template>

<script>
import {IMAGE_REQUEST_URL} from "@/common/config";
import {siteConfig} from "../libs/mixin/mixin";

export default {
  name: 'ChatNew',
  components: {},
  mixins: [uni.$mymixin],
  
  data() {
    return {
      chatList: [],
      gid: 0,
      uid: 0,
      
      // UI控制
      showShade: false, // 显示长按复制粘贴面板
      showPop: false,
      popButton: ["复制", "跟投"],
      popStyle: "",
      longpressItem: [],
      bottomTarget: "",
      
      // 投注相关
      tabclassIndex: 0,
      selectedButtons: [],
      selectedPlays: [],
      betMoney: '',
      moneyList: [10, 20, 50, 100, 200],
      zje: 0, // 总下注金额
      zCount: 0, // 总下注数量
      quickPlayDetailData: [],
      
      // UI面板控制
      isShowSwitchPannel: false,
      isshowright: true,
      isshowpredict: false,
      isclshow: false,
      isShowOpenList: false,
      iskeyshow: false,
      isbuttonsshow: false,
      coicon1: true,
      betRecordShow: false,
      msgOrderDetailShow: false,
      topPanelShow: false, // 顶部通用面板
      
      // 输入控制
      ismsgfocus: false,
      cursorPosition: 0,
      sendmsg: '', // 输入框里面的值
      emojiType: '',
      
      // 游戏和时间相关
      gname: '',
      curtime: [], // 当前开盘时间信息
      template: '',
      gTimeList: [],
      
      // 定时器
      balancetimer: null,
      periodtimer: null,
      
      // 开奖结果相关
      openResult: [], // 单期开奖结果
      openresultlist: [], // 开奖结果列表，最近50条
      cllist: [], // 长龙数据
      predictInfoList: [], // 预测结果列表
      
      // 键盘相关
      isshowssckey: false, // 是否显示时时彩前三中三等键盘键
      isshowbingokey: false, // 是否显示bingo键盘键
      keyboardHeight: 0,
      
      // 房间配置
      roomConfig: [],
      balanceInfo: [], // 余额信息
      
      // 弹窗相关
      msgOrderList: [], // 当前要显示的订单列表
      orderShowTtype: '',
      periodOrderList: [],
      
      // 性能和状态
      unreadCount: 0, // 未读数量
      isAtBottom: false, // 是否已经滚动到底部
      showLoading: false,
      tmpToButomFlag: false,
      previewImageFlag: false,
      
      // 高度和布局
      heightArr: {
        kbHeight: 0,
        btnsHeight: 0,
        topHeight: 0,
        bottomHeight: 0,
        keyHeight: 0,
        betBottomHeight: 0
      },
      
      // swiper相关
      swiperCurrent: 0,
      popupStatus: false,
      
      // 用户信息
      avatar: uni.getStorageSync('avatar'),
      headImageDomain: '',
      openImageDomain: '',
      utype: 0,
      
      // 操作菜单
      isShowAction: false,
      actionlist: [
        {name: '复制', code: 'copy'},
        {name: '跟投', code: 'follow'}
      ],
      actionIndex: 0,
      
      // z-paging相关数据
      refresherTriggered: false, // 下拉刷新状态
      chatPage: 1, // 当前页数
      chatPageSize: 10, // 每页数量
      totalChatCount: 0, // 总聊天记录数
      isLoadingMore: false, // 是否正在加载更多
      
      // 消息发送超时管理
      sendTimeouts: new Map(), // 存储消息发送超时定时器
      
      // 性能优化配置
      MAX_CHAT_MESSAGES: 50, // 最大聊天记录数量
      MESSAGE_CLEANUP_THRESHOLD: 80, // 触发清理的阈值
      lastCleanupTime: 0, // 上次清理时间
      
      // WebSocket消息批量处理
      messageBatchQueue: [], // 消息批处理队列
      messageBatchTimer: null, // 批处理定时器
      BATCH_PROCESS_DELAY: 200, // 批处理延迟(ms)
      
      // 发送状态控制
      isSending: false, // 防止重复发送
      
      // 自定义折叠组件状态
      collapseStates: {}, // 控制投注区域折叠状态
      betRecordStates: [], // 控制注单记录折叠状态
      
      // 其他
      imgurl: IMAGE_REQUEST_URL,
      tmp: {},
      backTopImg: '/static/img/backtop.png',
      siteConfig: siteConfig || {}
    }
  },
  
  computed: {
    windowObj() {
      return this.$u.sys();
    },
    
    // 优化性能：预计算uid，避免在每个聊天item中重复parseInt
    parsedUid() {
      return parseInt(this.uid);
    }
  },
  
  watch: {
    betMoney(newVal) {
      newVal = newVal + "";
      if (newVal.includes('.')) {
        newVal = newVal.replace('.', '');
      }
      // 使用正则表达式检查是否以0开头并且不是单独的0
      if (/^0?[0-9]+$/.test(newVal)) {
        // 如果以0开头且不是单独的0，则过滤掉以0开头的部分
        newVal = newVal.replace(/^0+/, '');
      }
      newVal = newVal.replace(/[^\d]/g, '');
      newVal = newVal <= 0 ? '' : newVal;
      this.betMoney = newVal;
      this.completeMoney();
    },
    
    selectedButtons() {
      this.completeMoney();
    },
    
    selectedPlays() {
      this.completeMoney();
    },
    
    'balanceInfo.room_status': {
      handler: function (val, oldVal) {
        if (val == 2) {
          this.sendmsg = "";
        }
      },
      deep: true
    }
  },
  
  onLoad() {
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.openImageDomain = uni.getStorageSync('openImageDomain');
    let that = this;
    this.uid = parseInt(this.userInfo.userid);
    this.utype = this.userInfo.type;
    this.gid = uni.getStorageSync('cgid');
    this.template = uni.getStorageSync('ctemplate');
    this.heightArr.statusbarHeight = this.windowObj.statusBarHeight;
    
    // 清理监听器
    uni.$off('websocketopen');
    uni.$off('openResult' + this.gid);
    uni.$off('gamechat' + this.gid);
    uni.$off('getBalanceInfo');
    uni.$off('roomStatusNotice');
    
    // 初始化远程数据
    this.getRoomConfig();
    this.utype == 0 && this.quickPlayDetail();
    
    // 预先初始化一次
    this.$u.api.common.longdragon({gid: this.gid}).then(res => {
      this.cllist = res.data;
    });
    this.$u.api.common.lotteryPredictInfo({gid: this.gid}).then(res => {
      this.predictInfoList = res.data;
    });
    this.$u.api.common.resultByDate({gid: this.gid}).then(res => {
      this.openresultlist = res.data.records;
    });
    
    // 连接成功发送查询单期开奖结果
    if (!uni.$socketUtils.isOpenSocket) {
      uni.$on('websocketopen', function(res) {
        uni.$socketUtils.send({eventType: "openResult", gid: that.gid});
        uni.$socketUtils.send({eventType: "getBalanceInfo"});
        uni.$socketUtils.send({eventType: "periodListOrSingle"});
        that.getperiod();
      });
    } else {
      uni.$socketUtils.send({eventType: "openResult", gid: that.gid});
      uni.$socketUtils.send({eventType: "getBalanceInfo"});
      uni.$socketUtils.send({eventType: "periodListOrSingle"});
    }
    
    if (this.template == 'SSC') {
      this.keyboardHeight = 210;
      this.isshowssckey = true;
    } else if (this.template == 'BINGO') {
      this.keyboardHeight = 210;
      this.isshowbingokey = true;
    } else {
      this.isshowssckey = false;
      this.keyboardHeight = 210;
    }
    
    // 当期开奖结果
    uni.$on('openResult' + this.gid, function(data) {
      that.openResult = data.data;
    });
    
    // 监听聊天消息
    uni.$on('gamechat' + this.gid, function(data) {
      let msg = data.data;
      
      // 确保sender字段类型一致，避免类型不匹配导致的布局错误
      if (msg && typeof msg.sender !== 'undefined') {
        msg.sender = parseInt(msg.sender);
      }
      if (Array.isArray(msg)) {
        msg.forEach(item => {
          if (item && typeof item.sender !== 'undefined') {
            item.sender = parseInt(item.sender);
          }
        });
      }
      
      // 计算未读消息数量的逻辑优化
      if (that.swiperCurrent === 0) {
        // 如果用户不在底部且不是主动发送消息，增加未读消息计数
        if (!that.isAtBottom && !that.tmpToButomFlag) {
          if (Array.isArray(msg)) {
            that.unreadCount += msg.length;
          } else {
            that.unreadCount += 1;
          }
        } 
        // 如果用户在底部或主动发送消息，清零未读消息计数
        else if (that.isAtBottom || that.tmpToButomFlag) {
          that.unreadCount = 0;
        }
      }
      
      // 处理消息数据 - 使用批处理机制优化性能
      if (Array.isArray(msg)) {
        // 批量消息直接添加到批处理队列
        that.addMessageToBatch(msg);
        that.tmpToButomFlag = false;
      } else {
        // 单条消息处理
        if (data.other.msgid && msg.sender == that.uid) {
          // 更新发送中的消息状态
          let messageUpdated = false;
          for (let i = 0; i < that.chatList.length; i++) {
            let oitem = that.chatList[i];
            if (data.other.msgid === oitem.msgid) {
              // 直接更新数组中的消息，确保sender字段正确
              that.$set(that.chatList, i, {
                ...msg, // 使用服务端返回的完整消息数据
                msgid: oitem.msgid, // 保持原有的msgid
                sendStatus: 'success' // 标记发送成功
              });
              messageUpdated = true;
              break;
            }
          }
          
          // 如果没有找到对应的消息，可能是发送失败，使用批处理添加
          if (!messageUpdated) {
            that.addMessageToBatch([msg]);
          }
          
          // 处理发送成功
          that.handleSendSuccess(data.other.msgid);
          
          uni.setStorageSync('sendmsg', that.sendmsg);
          that.sendmsg = "";
          !data.other.openResult && uni.$socketUtils.send({eventType: "getBalanceInfo"});
        } else {
          // 添加新消息到批处理队列
          that.addMessageToBatch([msg]);
          that.tmpToButomFlag = false;
        }
      }
      
      // 处理开奖结果和余额更新
      if (data.other.openResult && data.other.openResult == 1) {
        uni.$socketUtils.send({eventType: "openResult", gid: that.gid});
        setTimeout(function() {
          uni.$socketUtils.send({eventType: "getBalanceInfo"});
        }, 1000);
      }
      if (data.other.getBalanceInfo && data.other.getBalanceInfo == 1) {
        uni.$socketUtils.send({eventType: "getBalanceInfo"});
      }
    });
    
    // 获取余额信息
    uni.$on('getBalanceInfo', function(data) {
      that.balanceInfo = data.data;
    });
    
    uni.$on('roomStatusNotice', function(data) {
      console.log(data.data.room_status);
      that.balanceInfo.room_status = data.data.room_status;
    });
    
    // 监听所有彩种时间
    uni.$on('periodListOrSingle', function(res) {
      let gid = res.gid;
      if (gid && gid > 0) {
        for (let i = 0; i < that.gTimeList.length; i++) {
          if (that.gTimeList[i].gid == gid) {
            let cgame = that.gTimeList[i];
            let ngame = res.data[0];
            that.$set(that.gTimeList[i], 'stopstatus', ngame.stopstatus);
            if (cgame.period !== ngame.period) {
              that.$set(that.gTimeList[i], 'period', ngame.period);
              that.$set(that.gTimeList[i], 'djs', ngame.djs);
              that.$set(that.gTimeList[i], 'fp', ngame.fp);
              that.$set(that.gTimeList[i], 'nowSaleTime', ngame.nowSaleTime);
              that.$set(that.gTimeList[i], 'nowSealTime', ngame.nowSealTime);
              that.$set(that.gTimeList[i], 'nowOpenTime', ngame.nowOpenTime);
            }
            break;
          }
        }
      } else {
        if (that.gTimeList.length <= 0 || that.gTimeList.length !== res.data.length) {
          that.$set(that, 'gTimeList', res.data);
          return;
        }
        for (let i = 0; i < that.gTimeList.length; i++) {
          let cgame = that.gTimeList[i];
          let ngame = res.data[i];
          that.$set(that.gTimeList[i], 'stopstatus', ngame.stopstatus);
          if (cgame.period !== ngame.period) {
            that.$set(that.gTimeList[i], 'period', ngame.period);
            that.$set(that.gTimeList[i], 'djs', ngame.djs);
            that.$set(that.gTimeList[i], 'fp', ngame.fp);
            that.$set(that.gTimeList[i], 'nowSaleTime', ngame.nowSaleTime);
            that.$set(that.gTimeList[i], 'nowSealTime', ngame.nowSealTime);
            that.$set(that.gTimeList[i], 'nowOpenTime', ngame.nowOpenTime);
          }
        }
      }
    });
  },
  
  onReady() {
    // 设置默认高度，避免初始化时高度为0
    this.heightArr.bottomHeight = 160; // 默认输入框高度
    this.heightArr.topHeight = 160; // 默认头部高度
    
    this.$nextTick(() => {
      this.initTopHeight();
    });
  },
  
  onShow() {
    if (this.previewImageFlag) {
      this.previewImageFlag = false;
      return;
    }
    if (!this.periodtimer) {
      this.getperiod();
      this.getRoomConfig();
      this.utype == 0 && this.quickPlayDetail();
      this.periodtimer = setInterval(() => {
        this.timerCheck();
        this.gitemTimeCheck();
      }, 1000);
    }
    if (!this.balancetimer) {
      this.balancetimer = setInterval(() => {
        if (uni.$socketUtils.isOpenSocket) {
          uni.$socketUtils.send({eventType: "getBalanceInfo"});
          uni.$socketUtils.send({eventType: "periodListOrSingle"});
          uni.$socketUtils.send({eventType: "openResult", gid: this.gid});
          this.getRoomConfig();
        }
      }, 8000);
    }
  },
  
  onHide() {
    clearInterval(this.periodtimer);
    this.periodtimer = null;
    clearInterval(this.balancetimer);
    this.balancetimer = null;
  },
  
  beforeDestroy() {
    console.log("chat beforeDestroy");
    
    // 清理定时器
    if (this.periodtimer) {
      clearInterval(this.periodtimer);
      this.periodtimer = null;
    }
    if (this.balancetimer) {
      clearInterval(this.balancetimer);
      this.balancetimer = null;
    }
    
    // 清理所有发送超时定时器
    if (this.sendTimeouts && this.sendTimeouts.size > 0) {
      for (let [msgid, timeout] of this.sendTimeouts) {
        clearTimeout(timeout);
      }
      this.sendTimeouts.clear();
    }
    
    // 清理批处理定时器
    if (this.messageBatchTimer) {
      clearTimeout(this.messageBatchTimer);
      this.messageBatchTimer = null;
    }
    
    // 清理批处理队列
    this.messageBatchQueue = [];
    
    // 清理WebSocket监听器
    uni.$off('websocketopen');
    uni.$off('openResult' + this.gid);
    uni.$off('gamechat' + this.gid);
    uni.$off('getBalanceInfo');
    uni.$off('roomStatusNotice');
    uni.$off('periodListOrSingle');
    
    // 清理聊天数据
    this.chatList = [];
    this.messageBatchQueue = [];
  },
  
  mounted() {
    this.$nextTick(() => {
      // z-paging会自动调用queryList加载数据，不需要手动调用loadChatRecords
      console.log('页面挂载完成，等待z-paging自动加载数据');
    });
  },
  
  methods: {
    // 页面跳转
    goto(url, type = 0) {
      if (!url) {
        this.$u.toast('暂未开放');
        return;
      }
      if (type == 1) {
        uni.setStorageSync('backUrl', 'copage/chatnew');
      }
      uni.$utils.jump(url);
    },
    
    // 操作菜单选择
    selectAction(json) {
      let item = this.chatList[this.actionIndex];
      let content = "";
      if (Array.isArray(item.content)) {
        for (let c in item.content) {
          let con = item.content[c].con.replace(/<[^>]*>/g, '');
          content += con;
        }
      } else {
        content = item.content;
      }
      if (json.code === 'copy') { // 复制
        uni.setClipboardData({
          data: content,
          success: () => {
            uni.showToast({title: '复制成功', duration: 2000});
          },
          fail: () => {
            uni.showToast({title: '复制失败', icon: 'none', duration: 2000});
          }
        });
      } else if (json.code === 'follow') { // 跟投
        if (content) {
          this.sendmsg = content;
          this.sendevent();
        }
      }
    },
    
    // 长按事件
    onLongPress(index) {
      this.actionIndex = index;
      this.isShowAction = true;
    },
    
    // 触摸开始
    touchstart() {
      uni.hideKeyboard();
      this.emojiType = '';
    },
    
    // swiper切换到投注模式
    swiperCurrentChange() {
      this.swiperCurrent = 1;
      let that = this;
      setTimeout(function() {
        that.$u.getRect('.bet-footer').then(res => {
          that.heightArr.betBottomHeight = res.height;
        })
      }, 50);
    },
    
    // 计算投注金额
    completeMoney() {
      let c = 0;
      if (this.tabclassIndex === 0) {
        let c1 = this.selectedButtons.length;
        let c2 = this.selectedPlays.length;
        c = c1 * c2;
      } else {
        c = this.selectedPlays.length;
      }
      if (c >= 0 && parseInt(this.betMoney) >= 0) {
        this.zje = c * this.betMoney;
        this.zCount = c;
      }
    },
    
    // 重置投注
    betReset() {
      this.selectedButtons = [];
      this.selectedPlays = [];
      this.betMoney = '';
      this.zje = 0;
      this.zCount = 0;
    },
    
    // 下注
    bet() {
      if (this.balanceInfo.room_status == 2) {
        uni.showToast({title: "当前账号禁言中", icon: 'none'});
        return;
      }
      let str = "";
      if (this.tabclassIndex === 0) {
        if (this.selectedButtons.length <= 0 || this.selectedPlays.length <= 0) {
          uni.$utils.showToast('请选择玩法');
          return;
        }
        this.selectedButtons = this.selectedButtons.sort((a, b) => a - b);
        let str1 = this.selectedButtons.join('');
        let str2 = this.selectedPlays.join('');
        let str3 = this.betMoney;
        str = str1 + "/" + str2 + "/" + str3;
      } else {
        if (this.selectedPlays.length <= 0) {
          uni.$utils.showToast('请选择玩法');
          return;
        }
        let parr = {};
        let garr = [];
        this.selectedPlays.forEach((item, index) => {
          let tmparr = item.split('-');
          let gname = tmparr[0];
          let pname = tmparr[1];
          if (!parr[gname]) {
            parr[gname] = [];
          }
          parr[gname].push(pname);
        });
        
        let arr1 = [];
        for (let key in parr) {
          arr1.push(key + "/" + parr[key].join("") + "/" + this.betMoney);
        }
        arr1 = arr1.sort((a, b) => b - a);
        str = arr1.join("#");
        console.log(str);
      }
      
      // 下注金额判断betMoney
      if (isNaN(this.betMoney) || this.betMoney <= 0) {
        uni.$utils.showToast('请输入正确的下注金额');
        return;
      }
      this.tmpToButomFlag = true;
      uni.$socketUtils.send({eventType: "gamechat", gid: this.gid, content: str});
      this.selectedButtons = [];
      this.selectedPlays = [];
      uni.$utils.showToast('消息发送成功！');
    },
    
    // 选择金额
    selectMoney(money) {
      this.betMoney = money;
      this.completeMoney();
    },
    
    // 切换按钮选择
    toggleSelection(i) {
      const index = this.selectedButtons.indexOf(i);
      if (index === -1) {
        this.selectedButtons.push(i); // 添加到选中数组
      } else {
        this.selectedButtons.splice(index, 1); // 从选中数组移除
      }
    },
    
    // 切换玩法选择
    togglePlay(playname) {
      const index = this.selectedPlays.indexOf(playname);
      if (index === -1) {
        this.selectedPlays.push(playname); // 添加到选中数组
      } else {
        this.selectedPlays.splice(index, 1); // 从选中数组移除
      }
    },
    
    // 切换到聊天模式
    switchSwiper() {
      console.log('切换到聊天模式');
      this.swiperCurrent = 0;
      
      // 切换到聊天模式时，只有在用户原本就在底部时才滚动到底部
      if (this.isAtBottom) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.toBottom(300);
          }, 100);
        });
      }
    },
    
    // 选择tab
    tabsel(index) {
      if (index !== this.tabclassIndex) {
        this.selectedButtons = [];
        this.selectedPlays = [];
      }
      this.tabclassIndex = index;
    },
    
    // z-paging分页查询方法
    queryList(pageNo, pageSize) {
      console.log('queryList called:', {pageNo, pageSize, gid: this.gid});
      
      // 防止重复加载
      if (this.isLoadingMore) {
        return;
      }
      
      this.isLoadingMore = true;
      const params = {
        page: pageNo,
        pageSize: pageSize || this.chatPageSize,
        gid: this.gid
      };
      
      this.$u.api.common.chatRecords(params).then(res => {
        const newData = res.data.list || [];
        console.log('聊天记录加载成功:', {page: pageNo, count: newData.length});
        
        // 确保所有聊天记录的sender字段类型一致
        newData.forEach(item => {
          if (item && typeof item.sender !== 'undefined') {
            item.sender = parseInt(item.sender);
          }
        });
        
        // 使用z-paging的complete方法处理数据
        this.$refs.paging.complete(newData);
        
        // 只有在初始加载时才滚动到底部
        if (pageNo === 1 && newData.length > 0 && this.chatList.length === 0) {
          this.$nextTick(() => {
            setTimeout(() => {
              this.toBottom();
            }, 500);
          });
        }
        
        this.isLoadingMore = false;
      }).catch(err => {
        console.error('聊天记录加载失败:', err);
        this.$refs.paging.complete(false);
        this.isLoadingMore = false;
      });
    },
    
    // 下拉刷新
    onRefresh() {
      console.log('下拉刷新触发');
      this.refresherTriggered = true;
      
      // 重置状态
      this.isLoadingMore = false;
      this.unreadCount = 0;
      
      // 通过z-paging重新加载数据
      if (this.$refs.paging) {
        this.$refs.paging.reload();
      }
    },
    
    // 滚动监听 - 原始处理函数
    _onScrollHandler(e) {
      try {
        // 检查是否滚动到底部
        const scrollTop = e.detail.scrollTop;
        const scrollHeight = e.detail.scrollHeight;
        const clientHeight = e.detail.clientHeight;
        
        // 由于聊天记录模式使用了反转，需要调整判断逻辑
        const threshold = 50; // 优化阈值，提高判断准确性
        const wasAtBottom = this.isAtBottom;
        this.isAtBottom = scrollTop <= threshold;
        
        // 当用户滚动到底部时，清零未读消息计数
        if (this.isAtBottom && !wasAtBottom) {
          this.unreadCount = 0;
          console.log('用户滚动到底部，清零未读消息计数');
        }
        
        console.log('滚动位置:', {scrollTop, threshold, isAtBottom: this.isAtBottom, unreadCount: this.unreadCount});
      } catch (error) {
        console.error('滚动监听错误:', error);
      }
    },
    
    // 滚动监听 - 节流优化版本
    onScroll(e) {
      // 使用节流优化，避免高频滚动事件影响性能
      if (!this.throttledScrollHandler) {
        this.throttledScrollHandler = this.throttle(this._onScrollHandler.bind(this), 100);
      }
      this.throttledScrollHandler(e);
    },
    
    // 键盘高度变化监听
    keyboardHeightChange(res) {
      console.log('键盘高度变化:', res.height);
      
      // 更新键盘高度状态
      if (res.height > 0) {
        // 键盘弹起 - 隐藏自定义面板
        if (this.emojiType === 'mykeyboard') {
          this.heightArr.bottomHeight = this.heightArr.bottomHeight - this.heightArr.keyHeight;
          this.iskeyshow = false;
          this.isbuttonsshow = false;
        }
        this.emojiType = 'keyboard';
        this.heightArr.keyHeight = res.height;
        this.heightArr.bottomHeight = this.heightArr.bottomHeight + this.heightArr.keyHeight;
      } else {
        // 键盘收起
        if (this.emojiType === 'keyboard') {
          this.emojiType = '';
          this.heightArr.bottomHeight = this.heightArr.bottomHeight - this.heightArr.keyHeight;
        }
        this.heightArr.keyHeight = 0;
      }
      
      // 只有在用户正在输入或在底部时才滚动到底部
      if (this.ismsgfocus || this.isAtBottom) {
        setTimeout(() => {
          this.toBottom(300);
        }, 150);
      }
    },
    
    // 隐藏键盘
    hidedKeyboard() {
      console.log('z-paging请求隐藏键盘:', this.emojiType);
      
      if (this.emojiType === 'keyboard') {
        // 隐藏系统键盘
        uni.hideKeyboard();
      } else if (this.emojiType === 'mykeyboard') {
        // 隐藏自定义键盘面板
        this.iskeyshow = false;
        this.isbuttonsshow = false;
        this.emojiType = '';
        this.heightArr.bottomHeight = this.heightArr.bottomHeight - this.heightArr.keyHeight;
        this.heightArr.keyHeight = 0;
      }
    },
    
    // 处理消息发送超时
    handleSendTimeout(msgid) {
      this.updateMessageStatus(msgid, '发送超时', 'timeout');
      this.sendTimeouts.delete(msgid);
      this.isSending = false;
    },
    
    // 处理消息发送失败
    handleSendFailure(msgid) {
      this.updateMessageStatus(msgid, '发送失败', 'failed');
      if (this.sendTimeouts.has(msgid)) {
        clearTimeout(this.sendTimeouts.get(msgid));
        this.sendTimeouts.delete(msgid);
      }
      this.isSending = false;
    },
    
    // 处理消息发送成功
    handleSendSuccess(msgid) {
      if (this.sendTimeouts.has(msgid)) {
        clearTimeout(this.sendTimeouts.get(msgid));
        this.sendTimeouts.delete(msgid);
      }
      this.isSending = false;
    },
    
    // 更新消息状态
    updateMessageStatus(msgid, nickname, status) {
      for (let i = 0; i < this.chatList.length; i++) {
        let oitem = this.chatList[i];
        if (oitem.msgid === msgid) {
          this.$set(this.chatList, i, {
            ...oitem,
            nickname: nickname,
            sendStatus: status
          });
          break;
        }
      }
    },
    

    
    // 性能优化：清理过多的聊天消息
    cleanupChatMessages() {
      const now = Date.now();
      if (now - this.lastCleanupTime < 30000) {
        return;
      }
      
      if (this.chatList.length > this.MESSAGE_CLEANUP_THRESHOLD) {
        console.log('开始清理聊天消息，当前数量:', this.chatList.length);
        
        const keptMessages = this.chatList.slice(-this.MAX_CHAT_MESSAGES);
        this.chatList = keptMessages;
        
        this.lastCleanupTime = now;
        console.log('聊天消息清理完成，剩余数量:', keptMessages.length);
      }
    },
    
    // 性能优化：批量处理WebSocket消息
    batchProcessMessages() {
      if (this.messageBatchQueue.length === 0) return;
      
      const messagesToProcess = [...this.messageBatchQueue];
      this.messageBatchQueue = [];
      
      console.log('批量处理消息:', messagesToProcess.length, '条');
      
      // 批量添加到z-paging
      if (this.$refs.paging && this.$refs.paging.addChatRecordData) {
        this.$refs.paging.addChatRecordData(messagesToProcess, false);
      } else {
        this.chatList = this.chatList.concat(messagesToProcess);
      }
      
      // 检查是否需要清理消息
      this.cleanupChatMessages();
      
      // 滚动到底部的逻辑优化：只有在用户在底部或主动发送消息时才滚动
      if (this.swiperCurrent === 0) {
        // 如果是用户主动发送消息，必须滚动到底部
        if (this.tmpToButomFlag) {
          this.toBottom(150);
          this.tmpToButomFlag = false;
        }
        // 如果用户在底部且有新消息，也滚动到底部
        else if (this.isAtBottom && messagesToProcess.length > 0) {
          this.toBottom(150);
        }
      }
    },
    
    // 性能优化：添加消息到批处理队列
    addMessageToBatch(message) {
      if (Array.isArray(message)) {
        this.messageBatchQueue.push(...message);
      } else {
        this.messageBatchQueue.push(message);
      }
      
      if (this.messageBatchTimer) {
        clearTimeout(this.messageBatchTimer);
      }
      
      this.messageBatchTimer = setTimeout(() => {
        this.batchProcessMessages();
        this.messageBatchTimer = null;
      }, this.BATCH_PROCESS_DELAY);
    },
    
    // 性能优化：节流函数
    throttle(func, limit) {
      let inThrottle;
      return function executedFunction(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },
    
    // 切换游戏
    gotoSwitchGame(item) {
      uni.setStorageSync('cgid', item.gid);
      uni.setStorageSync('ctemplate', item.template);
      uni.$utils.jump('copage/chatnew', "redirectTo");
    },
    
    // 自定义折叠组件方法
    // 切换投注区域折叠状态
    toggleCollapseItem(tabIndex, collapseIndex) {
      const key = `${tabIndex}_${collapseIndex}`;
      this.$set(this.collapseStates, key, !this.collapseStates[key]);
    },
    
    // 检查投注区域是否展开（默认展开）
    isCollapseOpen(tabIndex, collapseIndex) {
      const key = `${tabIndex}_${collapseIndex}`;
      return this.collapseStates[key] !== false; // 默认展开
    },
    
    // 切换注单记录折叠状态
    toggleBetRecord(betIndex) {
      // 如果点击的是已展开的项目，则收起
      if (this.betRecordStates[betIndex]) {
        this.$set(this.betRecordStates, betIndex, false);
      } else {
        // 收起所有其他项目（手风琴效果）
        this.betRecordStates.forEach((state, index) => {
          this.$set(this.betRecordStates, index, false);
        });
        // 展开当前项目
        this.$set(this.betRecordStates, betIndex, true);
        // 加载数据
        this.loadBetRecordDetail(betIndex);
      }
    },
    
    // 检查注单记录是否展开
    isBetRecordOpen(betIndex) {
      return this.betRecordStates[betIndex] || false;
    },
    
    // 加载注单记录详情
    loadBetRecordDetail(betIndex) {
      if (this.periodOrderList[betIndex] && !this.periodOrderList[betIndex].orders) {
        uni.showLoading({title: '加载中'});
        let item = this.periodOrderList[betIndex];
        this.$u.api.member.getLotterySettledList({gid: this.gid, period: item.period}).then(res => {
          this.$set(this.periodOrderList[betIndex], 'orders', res.data);
          uni.hideLoading();
        }).catch(err => {
          uni.hideLoading();
        });
      }
    },
    
    // 自定义键盘输入
    myonkey(name, iswy) {
      if (this.balanceInfo.room_status == 2) {
        uni.showToast({title: "当前账号禁言中", icon: 'none'});
        return;
      }
      if (iswy == 1) {
        this.sendmsg = "";
      }
      if (name === "删") {
        this.sendmsg = this.sendmsg.substring(0, this.sendmsg.length - 1);
        return;
      }
      if (name === "重复") {
        this.sendmsg = uni.getStorageSync('sendmsg', '');
        return;
      }
      if (name === "闲聊") {
        if (this.roomConfig.banChat == 1) {
          uni.showToast({title: "暂未开放闲聊，请联系管理员", icon: 'none'});
          return;
        }
        this.heightArr.bottomHeight = this.heightArr.bottomHeight - this.heightArr.keyHeight;
        this.iskeyshow = false;
        this.heightArr.keyHeight = 0;
        this.$nextTick(() => {
          this.ismsgfocus = true;
          this.toBottom(true);
        })
        return;
      }
      if (name === "/#") {
        if (this.sendmsg) {
          let lastchar = this.sendmsg.charAt(this.sendmsg.length - 1);
          if (lastchar === "/") {
            name = "#";
            this.sendmsg = this.sendmsg.slice(0, -1);
          } else if (lastchar === "#") {
            name = "/";
            this.sendmsg = this.sendmsg.slice(0, -1);
          } else {
            name = "/";
          }
        } else {
          name = "/";
        }
      }
      this.sendmsg += name;
    },
    
    // 长按删除
    longpressDel() {
      this.sendmsg = "";
    },
    
    // 表情面板切换
    emojiChange(field, nfield) {
      if (this.utype == 1) {
        this.$nextTick(() => {
          this.ismsgfocus = true;
        })
        return;
      }
      
      console.log('表情面板切换:', {field, nfield, currentType: this.emojiType});
      
      if (this.emojiType === 'keyboard' || this.emojiType === 'mykeyboard') {
        if (this.emojiType === 'keyboard') {
          uni.hideKeyboard();
        }
        
        this.ismsgfocus = false;
        this[field] = false;
        this[nfield] = false;
        this.emojiType = '';
        this.heightArr.bottomHeight = this.heightArr.bottomHeight - this.heightArr.keyHeight;
        this.heightArr.keyHeight = 0;
      } else {
        uni.hideKeyboard();
        this.ismsgfocus = false;
        this[field] = true;
        this[nfield] = false;
        this.emojiType = 'mykeyboard';
        this.heightArr.keyHeight = this.keyboardHeight;
        this.heightArr.bottomHeight = this.heightArr.bottomHeight + this.heightArr.keyHeight;
      }
      
      if (this.isAtBottom) {
        setTimeout(() => {
          this.toBottom(300);
        }, 150);
      }
    },
    
    // 滚动到底部
    toBottom(duration = 150) {
      const that = this;
      setTimeout(() => {
        that.$nextTick(() => {
          console.log('执行滚动到底部');
          
          if (that.$refs.paging) {
            try {
              if (that.$refs.paging.scrollToChatRecordBottom) {
                that.$refs.paging.scrollToChatRecordBottom();
              } else if (that.$refs.paging.scrollToBottom) {
                that.$refs.paging.scrollToBottom(true);
              }
              
              that.isAtBottom = true;
              that.unreadCount = 0;
            } catch (e) {
              console.error('滚动到底部失败:', e);
            }
          }
        });
      }, duration || 100);
    },
    
    // 初始化顶部高度
    initTopHeight() {
      this.$u.getRect('.top-height').then(res => {
        this.heightArr.topHeight = res.height;
      })
      this.$u.getRect('.chat-input-bar-container').then(res => {
        this.heightArr.bottomHeight = res.height;
        console.log('输入框高度:', res.height);
      })
    },
    
    // 定时器检查
    timerCheck() {
      if (this.curtime.stopstatus === 1) {
        return;
      }
      this.curtime.djs -= 1;
      this.curtime.kjdjs -= 1;
      let fptime = this.curtime.djs;
      let kptime = this.curtime.kjdjs;
      if (fptime >= 0) {
        let minutes = Math.floor(fptime / 60);
        let seconds = fptime % 60;
        let timearr = [];
        if (minutes < 10) {
          timearr[0] = 0;
          timearr[1] = minutes;
        } else {
          timearr[0] = minutes.toString().split("")[0];
          timearr[1] = minutes.toString().split("")[1];
        }
        if (seconds < 10) {
          timearr[2] = 0;
          timearr[3] = seconds;
        } else {
          timearr[2] = seconds.toString().split("")[0];
          timearr[3] = seconds.toString().split("")[1];
        }
        this.curtime.fp = 0;
        this.curtime.timearr = timearr;
      } else if (fptime < 0 && this.curtime.kjdjs >= 0) {
        let minutes = Math.floor(kptime / 60);
        let seconds = kptime % 60;
        let timearr = [];
        if (minutes < 10) {
          timearr[0] = 0;
          timearr[1] = minutes;
        } else {
          timearr[0] = minutes.toString().split("")[0];
          timearr[1] = minutes.toString().split("")[1];
        }
        if (seconds < 10) {
          timearr[2] = 0;
          timearr[3] = seconds;
        } else {
          timearr[2] = seconds.toString().split("")[0];
          timearr[3] = seconds.toString().split("")[1];
        }
        this.curtime.timearr = timearr;
        this.curtime.fp = 1;
      } else {
        this.getperiod();
      }
    },
    
    // 游戏时间检查
    gitemTimeCheck() {
      for (let i = 0; i < this.gTimeList.length; i++) {
        let item = this.gTimeList[i];
        if (item.stopstatus === 1) {
          continue;
        }
        this.gTimeList[i].djs -= 1;
        let fptime = item.djs;
        if (fptime >= 0) {
          let minutes = Math.floor(fptime / 60);
          let seconds = fptime % 60;
          let timearr = [];
          if (minutes < 10) {
            timearr[0] = 0;
            timearr[1] = minutes;
          } else {
            timearr[0] = minutes.toString().split("")[0];
            timearr[1] = minutes.toString().split("")[1];
          }
          if (seconds < 10) {
            timearr[2] = 0;
            timearr[3] = seconds;
          } else {
            timearr[2] = seconds.toString().split("")[0];
            timearr[3] = seconds.toString().split("")[1];
          }
          this.gTimeList[i].fp = 0;
          this.gTimeList[i].timearr = timearr;
        } else if (fptime < 0 && Math.abs(fptime) < (item.nowOpenTime - item.nowSealTime)) {
          this.gTimeList[i].fp = 1;
        } else {
          if (uni.$socketUtils.isOpenSocket) {
            uni.$socketUtils.send({eventType: "periodListOrSingle", gid: item.gid});
          }
        }
      }
    },
    
    // 获取期数
    getperiod() {
      let that = this;
      this.$u.api.common.getperiod({gid: this.gid}).then(res => {
        that.curtime = res.data;
      }).catch(err => {
      });
    },
    
    // 获取房间配置
    getRoomConfig() {
      let that = this;
      this.$u.api.common.getRoomConfig().then(res => {
        that.roomConfig = res.data;
      });
    },
    
    // 快速玩法详情
    quickPlayDetail() {
      let that = this;
      this.$u.api.member.quickPlayDetail({gid: this.gid}).then(res => {
        that.quickPlayDetailData = res.data;
      }).catch(err => {
      });
    },
    
    // 发送消息
    sendevent() {
      if (this.isSending) {
        console.log('消息发送中，请勿重复操作');
        return;
      }
      
      if (this.sendmsg.length <= 0) {
        this.$u.toast('消息不能为空');
        return;
      }
      
      this.isSending = true;
      this.tmpToButomFlag = true;
      let msgid = this.$u.guid(20);
      let msgitem = {
        avatar: this.avatar,
        chatType: 'text',
        content: this.sendmsg,
        nickname: '发送中',
        sender: this.uid,
        msgid: msgid,
        sendStatus: 'sending',
        timestamp: Date.now()
      };
      
      // 使用z-paging添加发送中的消息
      if (this.$refs.paging && this.$refs.paging.addChatRecordData) {
        this.$refs.paging.addChatRecordData([msgitem], true);
      } else {
        this.chatList.push(msgitem);
      }
      
      let that = this;
      
      // 发送超时处理
      const sendTimeout = setTimeout(() => {
        console.log('消息发送超时:', msgid);
        that.handleSendTimeout(msgid);
      }, 10000);
      
      this.sendTimeouts.set(msgid, sendTimeout);
      
      setTimeout(function() {
        if (uni.$socketUtils.isOpenSocket) {
          uni.$socketUtils.send({
            eventType: "gamechat",
            gid: that.gid,
            content: that.sendmsg,
            msgid: msgid
          });
        } else {
          console.log('WebSocket未连接，消息发送失败');
          that.handleSendFailure(msgid);
          that.isSending = false;
        }
      }, 50);
    },
    
    // 返回
    backTo() {
      let url = "pages/gamehall/gamehall";
      if (this.utype == 1) {
        url = "agent/gamehall/hall";
      }
      //#ifdef H5
      uni.$utils.jump(url);
      //#endif
      //#ifdef APP-PLUS
      uni.$utils.jump(1, "navigateBack");
      //#endif
    },
    
    // 注单记录
    betRecordTop() {
      this.$u.api.member.getBetsSumByLotteryId({gid: this.gid}).then(res => {
        if (res.data.length <= 0) {
          this.$u.toast("暂无数据");
        } else {
          this.periodOrderList = res.data;
          // 初始化折叠状态数组
          this.betRecordStates = new Array(res.data.length).fill(false);
          this.betRecordShow = !this.betRecordShow;
        }
      }).catch(err => {
      });
    },
    

    
    // 长龙
    dragonTop() {
      this.isshowpredict = false;
      this.isShowOpenList = false;
      this.isclshow = !this.isclshow;
      this.topPanelShow = this.isclshow;
      if (this.isclshow) {
        this.$u.api.common.longdragon({gid: this.gid}).then(res => {
          this.cllist = res.data;
        });
      }
    },
    
    // 预测
    predictTop() {
      this.isclshow = false;
      this.isShowOpenList = false;
      this.isshowpredict = !this.isshowpredict;
      this.topPanelShow = this.isshowpredict;
      if (this.isshowpredict) {
        this.$u.api.common.lotteryPredictInfo({gid: this.gid}).then(res => {
          this.predictInfoList = res.data;
        });
      }
    },
    
    // 显示开奖历史
    showOpenListClick() {
      this.isshowpredict = false;
      this.isclshow = false;
      this.isShowOpenList = !this.isShowOpenList;
      this.topPanelShow = this.isShowOpenList;
      if (this.isShowOpenList) {
        this.$u.api.common.resultByDate({gid: this.gid}).then(res => {
          this.openresultlist = res.data.records;
        });
      }
    },
    
    // 网站跳转
    siteTo() {
      //#ifdef H5
      window.open(this.siteConfig.kjwurl)
      //#endif
      //#ifdef APP-PLUS
      plus.runtime.openURL(this.siteConfig.kjwurl)
      //#endif
    },
    
    // 客服
    customerTo() {
      let url = "copage/custChat";
      if (this.utype == 1) {
        url = "agent/nearchat/nearchat";
      }
      uni.setStorageSync('backUrl', 'copage/chatnew');
      uni.$utils.jump(url);
    },
    
    // 切换游戏
    switchGame() {
      this.isShowSwitchPannel = !this.isShowSwitchPannel
    },
    
    // 消息订单详情
    msgOrderDetail(item, orderShowTtype) {
      this.orderShowTtype = orderShowTtype;
      this.msgOrderDetailShow = true;
      this.msgOrderList = item;
    },
    
    // 查询错误处理
    queryError(error) {
      console.error('聊天记录查询错误:', error);
      this.isLoadingMore = false;
      this.refresherTriggered = false;
      if (error && error.message) {
        uni.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>

/* 注单详情 */
.h-table{
  .msgOrderDetailTitle{
    height: 84rpx;
    line-height: 84rpx;
    margin-left: 20rpx;
    font-size: 34rpx;
  }
  .h-tr{
    display: flex;
    height: 60rpx;
    flex:1;
    justify-content: space-around;
    border-bottom:1rpx solid #ccc;
    .h-th{
      flex:1;
      font-weight: 700;
      border-right:1rpx solid #ccc;
      color: #000000;
      width: 100rpx;
      font-size: 30rpx;
      background-color: rgb(227, 229, 241);
      text-align: center;
      line-height: 60rpx;
    }
    .h-td{
      flex:1;
      border-right:1rpx solid #ccc;
      width: 100rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      .text{
        font-size: 30rpx;
        text-align: center;
        line-height: 60rpx;
        color: #000000;
      }
    }
  }
}

.red{color: #fe0101 !important;}
.green{color: #00d123 !important;}
.blue{color: #0087b4 !important;}

.layout {
  background-color: #f1f1f1;
  height: 100%;
  width: 100%;
  overflow: hidden;
  .flex-layout {
    height: 100%;
    width: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    .flex-content {
      flex: 1;
      overflow-y: scroll;
      background-color: #ededed;
      .main-content{
        display: flex;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        -ms-flex-direction: column;
        flex-direction: column;
        position: relative;
        -webkit-box-pack: justify;
        -ms-flex-pack: justify;
        justify-content: space-between;
        height: 100%;
        overflow: hidden;
        .chat-content{
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all .2s ease;
          right: 0;
          .chat-list{
            flex: 1;
            overflow-y: auto;
            position: relative;
            scroll-behavior: smooth;
          }
        }
      }
    }
  }
}

/* 第二个sipwer */
.bet-content {
  position: relative;
  
  /* 渲染性能优化 */
  contain: layout style;
  will-change: transform;
  transform: translateZ(0);
  
  .bet-box {
    position: relative;
    
    /* 渲染性能优化 */
    contain: layout style paint;
    
    .odds-box {
      display: flex;
      justify-content: space-between;
      border-top: 1rpx solid #ddd;
      
      /* GPU加速 */
      transform: translateZ(0);
      .left-tab {
        background-color: #ededed;
        border-right: 1rpx solid #ddd;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        .van-sidebar {
          width: 162rpx;
          overflow-y: auto;
          flex: 1;
          /*.van-sidebar-item--select, .van-sidebar-item--select:active {
            background-color: #fff;
          }*/
          .van-sidebar-item {
            position: relative;
            display: block;
            box-sizing: border-box;
            overflow: hidden;
            color: #323233;
            font-size: 28rpx;
            line-height: 20rpx;
            cursor: pointer;
            padding: 0;
            background-color: #ededed;
            height: 94rpx;
            line-height: 94rpx;
            text-align: center;
            border-bottom: 1rpx solid #ddd;
          }
          .van-sidebar-item--select {
            background-color: #0087b4;
            color: #fff;
            font-weight: 500;
          }
          .van-sidebar-item__text {
            position: relative;
            display: inline-block;
            word-break: break-all;
          }
        }
        .returnicon {
          display: flex;
          justify-content: center;
          margin-bottom: 10rpx;
          image {
            width: 100rpx;
            height: 100rpx;
            border-radius: 100rpx;
          }
        }
      }
      .chat-list {
        position: relative;
        font-size: 28rpx;
        flex: 1;
        padding-top: 5rpx;
        display: flex;
        .right-content {
          overflow-y: auto;
          background-color: #ededed;
          padding-bottom: 10rpx;
          flex: 1;
          .odds-group-box {
            overflow: hidden;
            .quick {
              height: 100%;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              .quick-header {
                padding: 0 0 10rpx 0;
                background-color: #fff;
                border-bottom: 1rpx solid #ddd;
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                padding-right: 10.00005rpx;
                button {
                  margin-left: 1%;
                  flex: 0 0 19%;
                  font-size: 24rpx;
                  color: #323233;
                  border: 1rpx solid #ebedf0;
                  height: 60rpx;
                  padding: 0 6rpx;
                  line-height: 2.3;
                  margin-top: 10rpx;
                }
              }
            }
            .classActive{
              background-color: #0087b4;
              color:#fff !important;
            }
          }
          .oddsgroup {
            background-color: #fff;
            display: flex;
            flex-wrap: wrap;
            .lockedStatus{opacity: 0.5;}
            .odds {
              width: 100%;
              background-color: #fff;
              border-top: 1rpx solid transparent;
              border-bottom: 1rpx solid #ddd;
              font-size: 30rpx;
              padding: 24rpx 8rpx;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              justify-content: center;
              .sscball{
                width: 46rpx;
                height: 46rpx;
                margin-right: 22rpx;
                text-align: center;
                line-height: 46rpx;
                color: #000;
                font-weight: 700;
                font-size: 26rpx;
                border: 3px solid;
                border-radius: 50%;
              }
              .ball {
                width: 46rpx;
                height: 46rpx;
                margin-right: 22rpx;
                text-align: center;
                line-height: 46rpx;
                color: #fff;
                border-radius: 1.0667rpx;
                text-shadow: 0 0.53335rpx #000, 0.53335rpx 0 #000, -0.53335rpx 0 #000, 0 -0.53335rpx #000;
                font-weight: 700;
                font-size: 24rpx;
              }

              .odd {
                display: flex;
                justify-content: flex-start;
                align-items: center;
                color: red;
              }
              .oddname {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                font-weight: 500;
                color: #000;
                .span1 {
                  font-size: 28rpx;
                  margin-right: 8rpx;
                }
              }
            }
            .odds.checked .selected{
              position: absolute;
              top: 0;
              left: 0;
              bottom: 0;
              height: 100%;
              width: 100%;
              border: 4rpx solid #0087b4;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              border-radius: 0;
              background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABmFBMVEVHcEwAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QEm80BmMlSwORIv+MAh7QAh7T7+/sAj74AkL/x+fsElcQKmsj6+/v4+vsCksGP2O/m9vsAj78Hl8ae3vIBkcDU8fvX8vsDk8INnMt60Ov1+vsZpNEBkL8ToM7f9ftgxeZ90eyX2/FSwOMElMOd3vJOvuIQnsyg3/Jexua76ffw+ftWweSo4fTK7vm05vbY8/tjx+eq4/RMveEsrtiO2O9qyuje9fs/t97F7Pkmq9YOncsnrNYiqdUapNEMm8lZw+QxsdoGlsU3tNvs+PsVoc/V8fsrrthHu+Aqrden4fQYo9AXo9ALm8mR2fC+6fe/vVYBAAAAPnRSTlMAt6+sBgoBVVoDCwenwAIJubarsQQIqp+dnMIMw8QOvri8ta2iu7qpvQW0pMGepbOjoZqZlhaYDS12b8K8HluN5CkAAAHtSURBVEjHndRnc9NAEIdxA5KwCIQaCCQBQu+9l31OrrFNGkkIvffeewn9a+eFZSex7zT27jvN7G9Oc/ffTaVUtf6E0vWlVe54n6hgT6+oYE+vqOCidaKCVdc+9PeICvpLRAXrrk3obxAV9HeICvr9ooL+VlFBf5uo4NJlooKNrlXYtVFUsGueqGBHs2sJdiwXFfRsrgXobRIV9HaJCnr7RQW9laKCbpcMvfmigkkuCXqbXWji95+yG3oLXK74C/6dcrmdThcNAJxxuFUrXM6cB+B02+4jAP9PWl242ummAJispJNcuVJudJ/yAKW/xgbD7dWu3DBDubnuXQEgc8HY3jFcHLcNAEMjs914BmBs3NgCUHdyG+ByNONGvwIUfhpbcsJ99cYnANw1te9cCYAvxha5cPfMnw3eA8i/jeXn7wBcN7ashgdm30X2BUDmjYiIjLwC4LmxhTzcMvcSb2QAHmZFpPgYgEuRbTrCg43P9hSAm1EcUM4N2sYqXNMclFsAXIwD+qBom0eLE4muVU8C4H7WNside63hvDpMrSYrtg3Q2e2I9eid2JU+GAsMup3z8DpPLaDNMFjrXkvmCsDYe2NZVklOJHoGhR/GsuWCQ5JYEy8ffTOW9RgclvYrnUoFx0QFgyOig0cXqersNHwUdHG6t/mpAAAAAElFTkSuQmCC);
              background-size: 30rpx;
              background-repeat: no-repeat;
              background-position: 100% 100%;
            }
          }
          .oddsgroup.two .odds:nth-child(2n-1) {border-right: 1rpx solid #ddd;}
          .oddsgroup.two .odds {width: 50%;}
        }
      }
    }
  }
}

/* z-paging聊天优化样式 */
.chat-list {
  height: 100%;
  flex: 1;
  overflow: hidden;
  
  /* 基础优化，减少GPU加速过度使用 */
  transform: translateZ(0);
  
  /* 聊天记录反转显示 */
  ::v-deep .z-paging-content {
    transform: scaleY(-1);
    padding-bottom: 20rpx; /* 确保底部有足够边距 */
  }
  
  /* 减少过度的性能优化 */
  ::v-deep .z-paging-content-item {
    contain: layout;
    transform: translateZ(0);
  }
  
  /* 虚拟列表优化 - 减少复杂变换 */
  ::v-deep .z-paging-virtual-list {
    overflow: hidden;
  }
  
  /* 虚拟列表item优化 - 简化变换 */
  ::v-deep .z-paging-virtual-list-item {
    contain: layout;
    transform: scaleY(-1);
    transition: none;
  }
  
  /* 聊天记录容器 */
  ::v-deep .z-paging-chat-record-safe-area {
    background-color: #ededed;
    min-height: 160rpx;
  }
  
  /* 聊天记录底部安全区域 */
  ::v-deep .z-paging-chat-record-bottom-safe-area {
    background-color: #ededed;
    min-height: 160rpx;
  }
  
  /* 无更多数据提示 */
  .no-more-data {
    text-align: center;
    color: #999;
    font-size: 28rpx;
    padding: 20rpx;
    transform: scaleY(-1);
  }
}

/* 底部 */
.chat-input-bar-container{
  position: fixed;
  bottom: 0;
  z-index: 100;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
  width: 100%;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
  
  .chat-input-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-top: solid 1px #f5f5f5;
    background-color: #f8f8f8;
    padding: 10rpx 20rpx;
    .key-board{
      display: flex;
      align-items: center;
      height: 90rpx;
      padding-right: 20rpx;
      image{
        width: 60rpx;
        height: 60rpx;
        display: block;
      }
    }
    .chat-input-container {
      flex: 1;
      /* #ifndef APP-NVUE */
      display: flex;
      /* #endif */
      background-color: white;
      border-radius: 10rpx;
      .chat-input {
        flex: 1;
        font-size: 28rpx;
      }
    }
    .chat-input-send {
      display: flex;
      align-items: center;
      padding-left: 20rpx;
      image{
        width: 54rpx;
        height: 54rpx;
      }
    }
  }
  .emoji-panel-container {
    background-color: #f8f8f8;
    overflow: hidden;
    transition-property: height;
    transition-duration: 0.15s;
    /* #ifndef APP-NVUE */
    will-change: height;
    /* #endif */
    .key-board{
      font-size: 15px;
      padding: 4px 4px 4px 4px;
      background-color: #f0f2f8;
      z-index: 9999;
      .nav_1 {
        justify-content: space-between;
        height: 40px;
        background-color: #fff;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
        margin-bottom: 4px;
        .key-board-ul-li{
          border-right: 1px solid #eee;
          display: flex;
          align-items: center;
          flex: 1;
          text-align: center;
          height: 100%;
          justify-content: center;
          cursor: pointer;
        }
        .key-board-ul-li:active{
          background-color: #f0f2f8;
        }
      }
      .nav_2 {
        display: flex;
        flex-wrap: wrap;
        .key-board-ul-li {
          text-align: center;
          padding: 8px 0;
          background-color: #fff;
          border-right: 4px solid #f0f2f8;
          box-sizing: border-box;
          border-bottom: 4px solid #f0f2f8;
          border-radius: 10px;
        }
        .key-board-ul-li:active{ background-color: #f0f2f8;}
        .key-board-ul-li:last-child,.key-board-ul-li:nth-child(4) {border-right: none}
        .key-board-ul-li:nth-child(-n+4) {width: 25%}
        .key-board-ul-li:nth-child(n+5) {width: 20%}
      }
      .nav_pcdd {
        display: flex;
        flex-wrap: wrap;
        .key-board-ul-li {
          text-align: center;
          width: 25%;
          padding: 16rpx 0;
          background-color: #fff;
          border-right: 8rpx solid #f0f2f8;
          box-sizing: border-box;
          border-bottom: 8rpx solid #f0f2f8;
          border-radius: 20rpx;
        }
        .key-board-ul-li:active{ background-color: #f0f2f8;}
      }
      .key-board-content {
        display: flex;
        .nav_3 {
          flex: 1;
          .key-board-ul-li {
            background-color: #fff;
            text-align: center;
            border-right: 4px solid #f0f2f8;
            box-sizing: border-box;
            border-bottom: 4px solid #f0f2f8;
            border-radius: 10px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
          }
          .key-board-ul-li:active{ background-color: #f0f2f8;}
        }
        .nav_4 {
          display: flex;
          flex-wrap: wrap;
          flex: 4;
          .key-board-ul-li:nth-child(4n) {border-right: none}
          .key-board-ul-li:nth-child(8) {color: #fe0101}
          .key-board-ul-li:nth-child(12) {color: #92d17f}
          .key-board-ul-li:nth-child(16) {color: #0280fe}
          .key-board-ul-li.taking {background-color: #ccc;color: #fff}
          .key-board-ul-li:active{ background-color: #f0f2f8;}
          .key-board-ul-li {
            width: 25%;
            background-color: #fff;
            border-right: 4px solid #f0f2f8;
            box-sizing: border-box;
            border-bottom: 4px solid #f0f2f8;
            border-radius: 8px;
            height: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            .span1 {display: block;height: 100%}
          }
        }
      }
    }
    .chat-form-buttons{
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      height: 400rpx !important;
      background: #f6f6f6;
      .chat-form-buttons-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        width: 100%;
        .chat-form-buttons-list-li {
          margin-top: 16rpx;
          flex: 0 0 25%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          .cont {
            width: 128rpx;
            height: 128rpx;
            border-radius: 16rpx;
            background-color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          image {
            width: 44rpx;
            height: 44rpx;
          }
          .text {
            font-size: 28rpx;
            text-align: center;
            color: #7b7b7b;
            padding-top: 8rpx;
          }
        }
      }
    }
  }
}
.bet-footer {
  width: 100%;
  background-color: #fff;
  padding: 16rpx 10rpx;
  position: fixed;
  bottom: 0;
  .footer-btns {
    display: flex;
    justify-content: space-around;
    button {
      height: 60rpx;
      line-height: 60rpx;
      flex: 1;
      display: block;
      border: 0;
      color: #fff;
      border-radius: 8rpx;
      background-color: #0087b4;
      font-size: 28rpx;
      padding: 0;
      margin: 0;
      margin-right: 20rpx;
    }
    button:active{
      opacity: 0.7;
    }
  }
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-right: 20rpx;
    .van-cell {
      position: relative;
      display: flex;
      width: 100%;
      padding: 10.6667rpx 17.0667rpx;
      overflow: hidden;
      color: #323233;
      font-size: 14.01335rpx;
      line-height: 21.3333rpx;
      background-color: #fff;
    }
    .van-field {
      background-color: #ededed;
      flex: 1;
      height: 30px;
      font-size: 14px;
      border-radius: 8px;
      .van-field__control,.van-cell__value {
        height: 100%;
      }
      .van-field__body {
        padding-left: 20px;
        height: 100%;
      }
      .betbtn {
        width: 156rpx;
        margin: 0 18rpx;
        background-color: #0087b4;
        color: #fff;
      }
    }
    .betbtn {
      margin: 0 18rpx;
      background-color: #0087b4;
      color: #fff;
    }
    button{
      padding: 0 17px;
      height: 40px;
      line-height: 40px;
      font-size: 14px;
    }
    button:active{
      opacity: 0.7;
    }
    .resetbtn{
      color: #fff;
      background-color: #fe0101;
    }
  }
  .footer-text {
    display: flex;
    font-size: 28rpx;
    margin: 12rpx;
    .red-text{color: red;}
    .span{margin-left: 48rpx;}
  }
}


/**游戏列表倒计时面板css**/
.game-switch-item{
  position: relative;
  display: flex;
  padding: 0 20rpx;
  font-size: 26rpx;
  border-bottom: 1rpx solid #e5e5e5;
  height: 150rpx;
  align-items: center;
  background-color: #fff;
  .logo {
    width: 100rpx;
    height: 100rpx;
  }
  .lottery-name {
    margin-left: 20rpx;
    flex: 1;
    .p1:first-child {
      font-size: 30rpx;
      color: #000;
      font-weight: bold;
    }
    .p2:nth-child(2) {
      color: grey;
      font-size: 28rpx;
      padding-top: 6rpx;
    }
  }
  .logo image {
    max-width: 100%;
    height: 100%;
  }
  .status {
    text-align: right;
    padding-right: 8.0001rpx;
    .status-1 {
      font-size: 26rpx;
      color: #000;
      .fpz-word{
        color: #ff4a4a;
      }
      .jfp-word{
        color: #000;
      }
    }
    .status-2 {
      font-size: 24rpx;
      color: grey;
      padding-top: 12rpx;
      text-align: center;
      letter-spacing: 2.6667rpx;
      .vue-countdown-component {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: end;
        -ms-flex-pack: end;
        justify-content: center;
        justify-items: center;
        .time-box {
          width: 20rpx;
          min-width: auto;
          height: 40rpx;
          text-align: center;
          line-height: 40rpx;
          color: #888;
          font-size: 28rpx;
          padding: 0;
          margin: 0;
        }
        .time-unit {
          padding: 0 !important;
          width: auto !important;
          text-align: center;
          color: #888;
          height: 20rpx;
          line-height:30rpx;
          font-size: 28rpx;
          font-weight: 700;
          white-space: nowrap;
        }
      }
    }
  }
}

.hearder-status{
  background: linear-gradient(270deg, #08bbc2, #144988);
  height:var(--status-bar-height);
}
/**头部css**/
.header-bar {
  background: linear-gradient(270deg, #08bbc2, #144988);
  display: flex;
  position: relative;
  height: 50px;
  font-size: 24px;
  align-items: center;
  .header-bar-left {
    padding: 0 8px;
    display: flex;
    align-items: center;
    .header-bar-title {
      max-width: none;
      margin-right: 8px;
      display: flex;
      align-items: center;
      color: #fff;
      font-weight: 500;
      font-size: 19px;
      transition: all .3s ease-in
    }
  }
  .header-bar-right {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #fff;
    height: 100%;
    flex: 1;
    justify-content: flex-end;
    .item {
      display: flex;
      flex-direction: column;
      height: 100%;
      margin-right: 20rpx;
      .con1 {
        display: flex;
        align-items: center;
        height: 50%;
        .span1.green {color: #00d123}
        .span1.red {color: #f77062;}
      }
    }
    .item1 .text2 {
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      margin-right: 10rpx;
      margin-left: 6rpx;
    }
    .item2 .text2 {
      /*width: 130rpx;*/
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      margin-right: 10rpx;
      margin-left: 6rpx;
    }
  }
}
/**开奖倒计时，当期开奖结果css**/
.drop-down {
  font-size: 14px;
  background-color: #fff;
  width: 100%;
  .word1 {
    text-decoration: none;
    font-style: normal;
    color: red;
  }
  .word2 {
    color: #0087b4;
  }
  .drop-down-list {
    .drop-down-list-item {
      display: flex;
      height: 45px;
      border-bottom: 1px solid #e6e6e6;
      align-items: center;
      justify-content: flex-start;
      font-size: 28rpx;
      .period {
        text-align: center;
        display: inline-block;
        color: #646464;
        width: 30px;
        font-size: 12px;
        margin: 0 8px;
      }
      .drop-down-opened{
        .firstSum {
          display: flex;
          line-height: 16px;
          text-align: right;
          font-size: 12px;
          margin-left: 10rpx;
          flex-direction: column;
          .span1wrap {
            display: flex;
            margin-top: 6rpx;
          }
        }
        .sscSum {
          display: flex;
          font-size: 13px;
          justify-content: center;
          align-items: center;
          view{
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 8px;
          }
        }
      }
      .drop-down-wating {
        flex: 1;
        justify-content: space-between;
        display: flex;
        align-items: center;
        .btns{
          display: flex;
          align-items: center;
          .live-button {
            margin-right: 14rpx;
            height: 52rpx;
            width: 52rpx;
          }
          button {
            margin-right: 14rpx;
            background: #0087b4;
            border-radius: 10rpx;
            border: none;
            color: #fff;
            width: 86rpx;
            height: 50rpx;
            line-height: 50rpx;
            font-size: 28rpx;
            padding: 0;
          }
        }
        .time{
          .vue-countdown-component{
            display: flex;
            justify-content: flex-end;
            .time-unit {
              padding: 0 8rpx;
              color: #3293bc;
              font-size: 30rpx;
              font-weight: 700;
              line-height: 60rpx;
              white-space: nowrap;
            }
            .time-box {
              position: relative;
              box-sizing: border-box;
              height: 60rpx;
              /*min-width: 56rpx;*/
              font-size: 28rpx;
              text-align: center;
              background-color: #0087b4;
              perspective: 120rpx;
              border-radius: 6rpx;
              padding: 0 4rpx;
              color: #fff;
              line-height: 60rpx;
              font-weight: bold;
              .base {
                position: relative;
              }
            }
            .time-box:before {
              left: 2rpx;
            }
            .time-box:after {
              right: 2rpx;
            }
            .time-box + .time-box {
              margin-left: 4rpx;
            }
            .time-box:after,.time-box:before {
              content: "";
              position: absolute;
              background: #009acd;
              width: 2rpx;
              height: 12rpx;
              top: 50%;
              margin-top: -6rpx;
              z-index: -1;
            }
          }
          .theme2 .time-box {
            min-width: 40rpx;
          }
          .theme2 .time-box + .time-box {
            margin-left: 2rpx;
          }
          .less10 .time-box {
            color: #ff193c !important;
            text-shadow: #fff 2rpx 0 0, #fff 0 2rpx 0, #fff -2rpx 0 0, #fff 0 -2rpx 0;
          }
        }
      }
      .drop-down-arrow {
        background-color: transparent;
        border: none;
        display: flex;
        justify-content: center;
        font-weight: bold;
        float: right;
        width:100%;
        align-items: center;
        flex: 1;
        text {
          color: #e6e6e6;
          transform: rotate(360deg);
          font-size: 32rpx;
        }
      }
      .pk10 .open-num {
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .pk10 .open-num .drop-down-list-item-ul-li {
        width: 44rpx;
        height: 44rpx;
        margin-right: 4rpx;
        text-align: center;
        line-height: 44rpx;
        color: #fff;
        border-radius: 4rpx;
        text-shadow: 0 2rpx #000, 2rpx 0 #000, -2rpx 0 #000, 0 -2rpx #000;
        font-weight: 700;
        font-size: 26rpx;
      }
      .ssc{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 8px;
        .drop-down-list-item-ul-li {
          width: 25px;
          height: 25px;
          font-size: 14px;
          border-radius: 50%;
          font-weight: 700;
          justify-content: center;
          display: flex;
          align-items: center;
          border: 3px solid;
          margin-right: 9px;
          box-sizing: border-box;
        }
      }
      .bingo{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0 8px;
        .drop-down-list-item-ul-li {
          width: 50rpx;
          height: 50rpx;
          font-size: 26rpx;
          border-radius: 50%;
          font-weight: 700;
          justify-content: center;
          display: flex;
          align-items: center;
          margin-right: 20rpx;
        }
      }
    }
  }
}
/* 自定义折叠组件样式 */
.custom-collapse {
  background-color: #fff;
  
  .custom-collapse-item {
    border-bottom: 1rpx solid #ddd;
    
    .collapse-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx 30rpx;
      background-color: #fff;
      border-bottom: 1rpx solid #eee;
      
      .collapse-title {
        flex: 1;
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }
      
      .collapse-arrow {
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        
        &.collapse-arrow-open {
          transform: rotate(180deg);
        }
      }
    }
    
    .collapse-content {
      background-color: #fff;
    }
  }
}

/* 注单记录折叠组件样式 */
.bet-history-box {
  .text.red { color: #fe0101; }
  .text.green { color: #00d123; }
  .text.blue { color: #0087b4; }
  
  .bet-record-item {
    border-bottom: 1rpx solid #e6e6e6;
    
    .bet-record-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20rpx 0 0;
      background-color: #fff;
      
      .bet-list-item {
        flex: 1;
        height: 101rpx;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 30rpx;
        
        .item-up {
          display: flex;
          word-wrap: break-word;
          justify-content: space-between;
          
          .strong {
            font-size: 29rpx;
            color: #5b5b5b;
            font-weight: bold;
          }
        }
        
        .item-down {
          display: flex;
          justify-content: space-between;
          color: #828282;
          font-size: 24rpx;
          padding-top: 6rpx;
        }
      }
      
      .bet-record-arrow {
        padding: 20rpx;
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        
        &.bet-record-arrow-open {
          transform: rotate(180deg);
        }
      }
    }
    
    .bet-detail {
      max-height: 405rpx;
      background-color: #f5f5f5;
      
      .bet-item {
        font-size: 26.4rpx;
        display: flex;
        height: 81.6rpx;
        align-items: center;
        justify-content: space-between;
        padding: 0 30rpx;
        background-color: #f5f5f5;
        border-bottom: 2rpx solid #e6e6e6;
        
        .left, .status {
          font-weight: 600;
          flex: 1;
        }
        
        .time {
          flex: 1;
          text-align: center;
          flex-shrink: 0;
        }
        
        .text {
          font-size: 28rpx;
          font-weight: 500;
          flex: 1;
          text-align: right;
        }
      }
    }
  }
}
/* 长龙 */
.chang-long-box{
  overflow: hidden;
  background: #fff;
  .open-no-detail .van-col {
    text-align: center;
    height: 33px;
    line-height: 33px;
    box-sizing: border-box;
    border-bottom: 1px solid #e6e6e6;
  }
  .open-no-detail .longDetail {
    max-height: 440rpx;
    overflow-y: auto;
    width: 100%;
  }
  .van-col {
    float: left;
    min-height: 30px;
  }
  .van-col--6 {
    width: 25%
  }
}
/* 预测 */
.predict-box{
  overflow: hidden;
  background: #fff;
  .van-col {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 28px;
    box-sizing: border-box;
    border-bottom: 0.5px solid #e6e6e6;
  }
  .van-col {
    float: left;
    min-height: 30px;
  }
  .van-col--6 {
    width: 25%
  }
  .van-col.right-border {
    border-right: 1rpx solid #e6e6e6;
  }
  .longDetail {
    max-height: 380rpx;
    width: 100%;
    overflow-y: auto;
  }
  .big-single {
    border-radius: 7.4667rpx;
    height: 48rpx;
    line-height: 48rpx;
    width: 48rpx;
    font-size: 28rpx;
    text-align: center;
    font-weight: 700;
    display: inline-block;
    color: #fff;
  }
}

/* 悬浮按钮 */
.coIcon {
  position: fixed;
  z-index: 0;
  right: 30rpx;
  .span1 {
    width: 80rpx;
    height: 80rpx;
    background: #0087b4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32rpx;
    position: relative;
  }
  image {
    width: 50rpx;
    height: 50rpx;
  }
}
.coIcon.haxi {
  top: 386rpx;
}
.right-icon {
  display: flex;
  flex-direction: column;
  right: 30rpx;
  .span1 {
    width: 80rpx;
    height: 80rpx;
    background: #0087b4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8rpx;
    position: relative;
  }
  .span1 image {
    width: 50rpx;
    height: 50rpx;
  }
}

/* 开奖球样式 */
.ball-1 {background: linear-gradient(#ff0000, #ff0000)}
.ball-2 {background: linear-gradient(#0000ff, #0000ff)}
.ball-3 {background: linear-gradient(#888888, #888888)}
.ball-4 {background: linear-gradient(#ffa500, #ffa500)}
.ball-5 {background: linear-gradient(#00bfff, #00bfff)}
.ball-6 {background: linear-gradient(#9acd32, #9acd32)}
.ball-7 {background: linear-gradient(#ee82ee, #ee82ee)}
.ball-8 {background: linear-gradient(#ffd700, #ffd700)}
.ball-9 {background: linear-gradient(#a0522d, #a0522d)}
.ball-10 {background: linear-gradient(#32cd32, #32cd32)}

/* SSC球样式 */
.ball-0 {border-color: #ff6c6c; color: #ff6c6c;}
.ball-1 {border-color: #ff6c6c; color: #ff6c6c;}
.ball-2 {border-color: #5bb4e8; color: #5bb4e8;}
.ball-3 {border-color: #888888; color: #888888;}
.ball-4 {border-color: #30b08f; color: #30b08f;}
.ball-5 {border-color: #30b08f; color: #30b08f;}
.ball-6 {border-color: #ff6c6c; color: #ff6c6c;}
.ball-7 {border-color: #888888; color: #888888;}
.ball-8 {border-color: #ff6c6c; color: #ff6c6c;}
.ball-9 {border-color: #ff6c6c; color: #ff6c6c;}

/* BINGO球样式 */
.b1 {background: #ff6b6b; color: #fff;}
.b2 {background: #4ecdc4; color: #fff;}
.b3 {background: #45b7d1; color: #fff;}
.b4 {background: #96ceb4; color: #fff;}
.b5 {background: #feca57; color: #fff;}
.b6 {background: #ff9ff3; color: #fff;}
.b7 {background: #54a0ff; color: #fff;}
.b8 {background: #5f27cd; color: #fff;}
.b9 {background: #00d2d3; color: #fff;}
.b10 {background: #ff6348; color: #fff;}
.b11 {background: #2ed573; color: #fff;}
.b12 {background: #1e90ff; color: #fff;}
.b13 {background: #ffa502; color: #fff;}
.b14 {background: #3742fa; color: #fff;}
.b15 {background: #2f3542; color: #fff;}
.b16 {background: #ff4757; color: #fff;}
.b17 {background: #747d8c; color: #fff;}
.b18 {background: #ff6b81; color: #fff;}
.b19 {background: #a4b0be; color: #fff;}
.b20 {background: #57606f; color: #fff;}

/* 附加样式类 */
.bg-blue { background-color: #0087b4; }
.bg-orange { background-color: #ff9500; }

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .header-bar .header-bar-right .item {
    margin-right: 10rpx;
    .text1, .text2 {
      font-size: 12px;
    }
  }
  
  .drop-down .drop-down-list .drop-down-list-item .btns button {
    width: 70rpx;
    height: 42rpx;
    line-height: 42rpx;
    font-size: 24rpx;
  }
}

/* 兼容性优化 */
/* #ifdef APP-NVUE */
.layout {
  /* nvue特定样式 */
}
/* #endif */

/* #ifdef H5 */
.layout {
  /* H5特定样式 */
}
/* #endif */

/* #ifdef MP-WEIXIN */
.layout {
  /* 微信小程序特定样式 */
}
/* #endif */

</style> 