<template>
  <view class="skin_blue layout" style="display: flex; flex-direction: column">
    <view class="flex-layout">
      <view class="top-height">
        <view class="hearder-status"></view>
        <view class="header-bar">
          <view class="header-bar-left" @click="backTo">
            <u-icon style="margin-top:4rpx;" size="24" color="#fff" name="arrow-left"></u-icon>
            <view class="header-bar-title">{{ curtime.gname }}</view>
            <!-- <view style="font-size: 24rpx;color: #eee;font-weight: bold;">{{ userInfo.username }}</view> -->
          </view>
          <view class="header-bar-right">
            <view class="item item1">
              <view class="con1">
                <view class="text1 span1">积分:</view>
                <view class="text2 span1">{{ Math.floor(balanceInfo.kmoney) }}</view>
              </view>
              <view class="con1">
                <view class="text1 span1">输赢:</view>
                <view class="text2 span1" :class="balanceInfo.sy > 0 ? 'green' : (balanceInfo.sy < 0 ? 'red' : '')">{{ Math.floor(balanceInfo.sy) }}</view>
              </view>
            </view>
            <view class="item item2">
              <view class="con1" v-show="roomConfig.showTurnover == 1">
                <view class="text1 span1">流水:</view>
                <view class="text2 span1">{{ Math.floor(balanceInfo.jetotal) }}</view>
              </view>
              <view class="con1" v-show="roomConfig.showTurnover == 0"><view class="text1 span1"></view><view class="text2 span1"></view></view>
              <view class="con1" v-if="utype == 0 && roomConfig.show_online_count == 0">
                <view class="text1 span1">回水:</view>
                <view class="text2 span1">{{ Math.floor(balanceInfo.backWater) }}</view>
              </view>
              <view class="con1" v-if="utype == 1 || roomConfig.show_online_count == 1">
                <view class="text1 span1">人数:</view>
                <view class="text2 span1">{{ roomConfig.onlineCount }}</view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- WebSocket连接状态通知栏 -->
        <view v-show="showWebSocketError" class="websocket-notice" @click="manualReconnectAndSync" @dblclick="forceSyncWebSocketStatus">
          <view class="notice-content">
            <u-icon name="warning-fill" color="#ff6600" size="16"></u-icon>
            <text class="notice-text">服务异常，正在连接中...</text>
            <text class="notice-action">点击重连</text>
          </view>
        </view>
        
        <view class="drop-down" style="position: relative;">
          <view class="drop-down-list">
            <view class="drop-down-list-item">
              <view class="period title">{{ curtime.shortPeriod }}</view>
              <view class="drop-down-wating">
                <view class="time">
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
                    <view class="time-box"><view class="base">{{ curtime.timearr && curtime.timearr[3] }}</view></view>
                  </view>
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
<!--                  <image src="/static/image/icon/live.png" alt="直播" class="live-button"></image>-->
                  <button v-if="utype == 0" @click="betRecordTop">注单</button>
                  <button @click="dragonTop">长龙</button>
                  <button v-show="roomConfig.showPrediction == 1" @click="predictTop"> 预测</button>
                  <button v-if="utype == 1" @click="showOnlineUserListPopup">在线</button>
                </view>
              </view>
            </view>
            <view class="drop-down-list-item" @click="showOpenListClick">
              <view class="period">{{ openResult.period }}</view>
              <view class="drop-down-opened">
                <view v-if="template === 'PK10' && openResult.property !== undefined" class="pk10" style="display: flex; align-items: center;">
                  <view class="open-num min drop-down-list-item-ul">
                    <view v-for="(it, index) in openResult.openNum" :key="`pk10-${index}`" class="drop-down-list-item-ul-li" :class="'ball-'+it"></view>
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
                <view v-if="template === 'SSC' && openResult.property !== undefined" class="skin_yuan" style="display: flex; align-items: center;">
                  <view class="open-num ssc min drop-down-list-item-ul">
                    <view v-for="(it, index) in openResult.openNum" :key="`ssc-${index}`" class="drop-down-list-item-ul-li" :class="'ball-'+it">{{it}}</view>
                  </view>
                  <view class="sscSum">
                    <view :class="{'red':openResult.property.sumBigSmall === '大','blue':openResult.property.sumBigSmall === '小'}">{{ openResult.property.sumBigSmall }}</view>
                    <view :class="{'red':openResult.property.sumSingleDouble === '双','blue':openResult.property.sumSingleDouble === '单'}">{{ openResult.property.sumSingleDouble }}</view>
                    <view :class="{'red':openResult.property.dragonTiger === '龙','blue':openResult.property.dragonTiger === '虎','green':openResult.property.dragonTiger === '和'}">{{ openResult.property.dragonTiger }}</view>
                  </view>
                </view>
                <view v-if="template === 'BINGO' && openResult.property !== undefined" class="skin_yuan" style="display: flex; align-items: center;">
                  <view class="open-num bingo min drop-down-list-item-ul">
                    <view v-for="(it, index) in openResult.openNum" :key="`bingo-${index}`" class="drop-down-list-item-ul-li" :class="'b'+it">{{it}}</view>
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
      <view class="flex-content">
        <view class="main-content">
          <view class="chat-content" v-show="swiperCurrent === 0">
            <view @scroll="scroll" @scrolltoupper="loadMoreMessages" @touchstart="onTouchStart" @touchmove="onTouchMove" ref="chat" class="chat-list" :class="{'loading-more': isLoadingMore}">
              <!-- 加载更多指示器 -->
              <view v-if="isLoadingMore" class="loading-more-indicator">
                <text class="loading-text">加载更多消息...</text>
              </view>
              <view v-if="!hasMoreMessages && chatList.length > 0" class="no-more-indicator">
                <text class="no-more-text">没有更多消息了</text>
              </view>
              <view v-for="(item,index) in chatList" :key="item.msgid || item.id || `chat-${item.time}-${index}`" @touchstart="touchstart" class="chat-item-wrapper">
                <chat-item :chatroomNicknameLength="roomConfig.chatroomNicknameLength" @mlongpress="onLongPress" :mindex="index" :utype="utype" shape="circle" :headImageDomain="headImageDomain" :conImageDomain="openImageDomain" @msgOrderDetail="msgOrderDetail" :uid="uid" :item="item" :chatList="chatList"></chat-item>
              </view>
            </view>
            <view class="chat-input-bar-container" v-show="swiperCurrent === 0">
              <view class="chat-input-bar">
                <view class="key-board" @click="emojiChange('iskeyshow','isbuttonsshow')">
                  <image src="/static/image/icon/keybtn.png"></image>
                </view>
                <view class="chat-input-container">
                  <u-input :placeholder="balanceInfo.room_status == 2 ? '禁言中' :''" :disabled="balanceInfo.room_status == 2" @blur="ismsgfocus = false" :readonly="roomConfig.banChat == 1 && utype == 0" :focus="ismsgfocus" class="chat-input" v-model="sendmsg" :adjustPosition="false" type="text"/>
                </view>
                <view class="chat-input-send" v-if="utype == 0">
                  <image @click="emojiChange('isbuttonsshow','iskeyshow')" v-show="sendmsg.length <= 0" src="/static/img/more.png"></image>
                  <image @touchend.prevent="sendevent" v-show="sendmsg.length > 0" src="/static/img/send.png"></image>
                </view>
                <view class="chat-input-send" v-if="utype == 1">
                  <image @click="sendevent" src="/static/img/send.png"></image>
                </view>
              </view>
              <!--  表情面板，这里使用height控制隐藏显示是为了有高度变化的动画效果（如果不需要切换表情面板则不用写） -->
              <view class="emoji-panel-container" :style="[{height: emojiType ? heightArr.keyHeight+'px' : '0px'}]">
                <scroll-view scroll-y style="height: 100%;flex: 1;">
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
                      <view class="nav_1" v-show="isshowbingokey">
                        <!-- <view class="key-board-ul-li" @click="myonkey('福',0)">福</view>
                        <view class="key-board-ul-li" @click="myonkey('禄',0)">禄</view>
                        <view class="key-board-ul-li" @click="myonkey('寿',0)">寿</view>
                        <view class="key-board-ul-li" @click="myonkey('喜',0)">喜</view> -->
                        <view style="width: 20%" class="key-board-ul-li" @click="myonkey('尾大',0)">尾大</view>
                        <view style="width: 20%" class="key-board-ul-li" @click="myonkey('尾小',0)">尾小</view>
                        <view style="width: 20%" class="key-board-ul-li" @click="myonkey('合单',0)">合单</view>
                        <view style="width: 20%" class="key-board-ul-li" @click="myonkey('合双',0)">合双</view>
                        <view style="width: 20%" class="key-board-ul-li" @click="myonkey('总和',0)">总和</view>
                      </view>
                      <view class="nav_pcdd" style="display: none;">
                        <view class="key-board-ul-li">大单</view>
                        <view class="key-board-ul-li">小单</view>
                        <view class="key-board-ul-li">大双</view>
                        <view class="key-board-ul-li">小双</view>
                        <view class="key-board-ul-li">极大</view>
                        <view class="key-board-ul-li">极小</view>
                        <view class="key-board-ul-li">特码</view>
                        <view class="key-board-ul-li">豹子</view>
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
                          <view @longpress="longpressDel" class="key-board-ul-li drop-down-arrow1" style="color: #ff5252" @click="myonkey('删',0)">删</view>
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
                      <view class="chat-form-buttons-list-li" @click="goto('pages/wallet/moneyLog',1)">
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
<!--                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="/static/image/icon/fulireportbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">福利报表</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="/static/image/icon/redbabtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">红包报表</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="/static/image/icon/agentreportbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">代理报表</view>
                      </view>-->
                    </view>
                  </view>
                </scroll-view>
              </view>
            </view>
            <view :style="{'top':heightArr.topHeight+10+'px'}" class="coIcon" v-show="coicon1" @click="isshowright = !isshowright">
              <view class="span1">
                <image v-show="!isshowright" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAMAAAC7faEHAAAB7FBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+wOur2AAAAo3RSTlMAhB769vsb/v0CAb8VMgsM/A7pdOIx6s5g8ddTaewtFscSyoAFJGXL9dYDxobUEO5z0NoZJSlWwPLciIp/5IkvoD3dIQfDOeGu+bAordE81fTgUqNoR+dCe7M2P7iSqY58CruFCbZ+sQiDOHjrT4wNWBomTXlZxJ2cp3EUb6T45dlAXCAr31cjTsy+PkFtNG4Eq0ssLhf3gmuvwmrtH+ZENRPTAbDLLwAAAjFJREFUGBl9wQVDGgEAhuGPPEDA7u6csdSVXetQN113d3d3d+f7R3eHggcDn0dxasc212e5M0ob12yd8iuFgboqbIY/lSuJQMEKEjQsDSuRNw2TUeHY1O30rh7PnnRj2vhM8XrzgM6V/YrJLOkDPFdl99YNRk9QcWqyG4AWzep1Q2Gx/pM7DBxTlDcPskJKItgMxjlNC6RBYUhJVc6H0gWKKACjWCmcbYMbsgysgB6ldAGMkEx10BlUakvgjUxVsFJzeA6uoFQLRr9MRwpPKk7L8eWyFME3aQwqZPJ7YJdsloLHL1M1jEibwSHLTsChmIPAiCzrIE+qh02yHN4LnNeMdiBtvyzpPqhUFrxXxJ5B4LoiSgyoSNe0CcjVR3BqWmYVGHUyFfggv1Uz1sM2ucCrGZUd4LsrPcyAedcU9Rd+6TusVlR5EXiKH7tg/gLFbITfaoRxxXi7YPQmPHAqpsYFP/QFsjXrXg6mW480qww2BLQVJmWzcAKyFsnmBQxKQ+DOlM39213dskuD5ZI/B0o0h4U+KJPkgL7XSu0y1Mv0wQ3ZSik3AxbLsgw2LFIKp+ZBh1+W9BxY36qkAqvAd1TT7mTAxUwl4d8B7FNUO5Dv1H/SDwHbmxSzDCg9rQShtUBzWDa7DWDJFtnUXvIAB8KKc6INU1H1urBMNWWvnvoAn6NJCc5cMbAYPxvX5owSkT+kJF6ucWH3ZLFfyZV/XpVHRMPX6nea05/cbVumnAEl+AcVNeYU6LJ/mQAAAABJRU5ErkJggg==">
                </image>
                <image v-show="isshowright" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAMAAAC7faEHAAAB6VBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+oS8NlAAAAonRSTlMAhB769vsb/v0CAb8VMgsM/A7pdOIx6s5g8ddT7GktEscWyoAk4GUFy/XWA4YQxu7U0NpzGcApViXyiNyKf6CJL+TdPSEHwznh+a6wrSg81dH0Ukdoo+dCs3s2P0+Muwp5hZKDtusIsXgJuHypfjiODVkaTZ2cJhRvxFhxp6Qg5U5X+Fwj2UArbT7MvkE0BG5LLKsuF/eCa6/Cau01RObTHxPZei8IAAACMklEQVQYGX3BBUMaAQCG4Y88UhGxu2ubrufKhbHQ9ax1d3d3d3e9v3R3IHgg+DxK07hte2vUHalsHxwb9yuHvuZ6bNZ8rlMWgdKVZGhbnKdM3iAmo9axZYXTO7S1cNSNqemZ0q0uBrp7epVSULUK8NyQ3Vs3GMtDStNS2AbM0KTVbiir0BRFa4CjSvIWQzSsLEKzwLighEAQysLKqmYOVM5TXCkYFcrhcifckqVvJSxXTufACMvUDN0h5TYf3stUDz2axktwhaRGMHpl8+TRkhWyK4fv0jaolc2iYYgukE0DrJO2g0OTbscw3XmoSRugWGqFLUrxLoG196HJqZR8H9QoCh+UVFcOnoq7LpgzTynDUKRP4NSEmtngeyDdi0DXFSVthB1ygVcJBfVgNMtU6oOSmZrwB37pBwwpbk8/cFVxVQbU5iuhCX6qHbbKcng3sFcT5gLBY7K0uOCvvkKhLCcBh1JOAetkqYbNAY3BqEx+D5yRzWLw+GV6Cv3SALgLZDpQtktpZhxaJksQlkn+GFRpGot8UC3JAateK7dL0CrTRzcUKqeiCCyUZSlsXqAcznbBbL8s+THYOFNZBdaD77QSHkfgWoGy8O8H9ilpLlDi1BT5R4DjHUpZClReV4bwJmBWnmxOGMD8Edk0XvQAB/OUZmcnpvKGDXkytVS/eeEDfI4OZTh/08Bi/G7fFFtLXMmAsng16MLu+UK/sqv7sr6YuLZvDe80rX9FO0bGnQFl+A+swOSlXIZbNQAAAABJRU5ErkJggg=="></image>
              </view>
            </view>
            <u-transition :show="isshowright" :customStyle="{'position':'fixed','top':heightArr.topHeight+58+'px','right': '30rpx'}" mode="fade">
              <view class="right-icon">
                <view class="switch span1" @click="switchGame">
                  <image src="/static/image/icon/qiegame.png"></image>
                </view>
                <!-- 打单配置 - 只对房主和房主子账号显示 -->
                <view v-if="utype == 1" class="fullscreen-panel span1" @click="showFullScreenPanel">
                  <text class="betting-icon">⚙️</text>
                  <text class="span1-text" style="color: #FF9800;">打单</text>
                </view>
                <!-- 用户管理 - 只对房主和房主子账号显示 -->
                <view v-if="utype == 1" class="user-management span1" @click="showUserManagementPanel">
                  <text class="user-icon">👥</text>
                  <text class="span1-text" style="color: #FF9800;">用户</text>
                </view>
                <!-- 房间设置 - 只对房主和房主子账号显示 -->
                <view v-if="utype == 1" class="room-settings span1" @click="showRoomSettingsPanel">
                  <text class="room-icon">🏠</text>
                  <text class="span1-text" style="color: #FF9800;">房间</text>
                </view>
                <view class="customer span1" @click="customerTo">
                  <image src="/static/image/icon/customer.png"></image>
                </view>
                <view v-if="siteConfig.kjwurl" class="openResult span1" @click="siteTo">
                  <image src="/static/image/icon/kjw.png"></image>
                </view>
                <!--<view v-if="utype == 0 && roomConfig.webInputKeyboard == 1" class="span1" @click="swiperCurrentChange">
                  <image  src="/static/image/icon/pan.png" class="beticon"></image>
                </view>-->
              </view>
            </u-transition>
            <view class="icon-to-bottom" @click="toBottom(150, true, true)" v-show="!emojiType && !isAtBottom">
              <view v-if="unreadCount > 0 && unreadCount < 99" class="unread-message">{{ unreadCount }}</view>
              <view v-if="unreadCount > 99" class="unread-message">99+</view>
            </view>
          </view>
          <!--<view class="bet-content" v-show="swiperCurrent === 1">
            <view class="bet-box">
              <view class="odds-box">
                <view class="left-tab">
                  <view class="van-sidebar">
                    <view v-for="(item,index) in quickPlayDetailData" class="van-sidebar-item" :class="{ 'van-sidebar-item--select': tabclassIndex === index }" @click="tabsel(index)">
                      <view class="van-sidebar-item__text">{{ item.name }}</view>
                    </view>
                  </view>
                  <view class="returnicon key" @click="switchSwiper">
                    <image src="/static/image/icon/qunliaobtn.png" lazy="loaded"></image>
                  </view>
                </view>
                <view class="chat-list chat-list-wrap" :style="{'height':(windowObj.windowHeight-heightArr.topHeight-heightArr.betBottomHeight)+'px'}">
                  <template v-for="(item,index) in quickPlayDetailData">
                    <view v-show="tabclassIndex == index" class="right-content" :class="template.toLowerCase()" v-if="index === 0">
                      <view class="odds-group-box">
                        <view class="quick">
                          <view class="quick-header">
                            <button :disabled="curtime.fp == 1" :class="{ 'classActive': selectedButtons.includes(it.f),'lockedStatus':curtime.fp == 1}" @tap="toggleSelection(it.f)" v-for="(it,i) in item['list']" size="mini">{{ it.name }}</button>
                          </view>
                          <view id="quickcomponent" class="quick-content">
                            <view class="oddsgroup two">
                              <view :disabled="curtime.fp == 1" :class="{ 'checked': selectedPlays.includes(pitem.f),'lockedStatus':curtime.fp == 1}" @tap="togglePlay(pitem.f)" class="odds" v-for="(pitem,pindex) in item['list'][0]['plist']">
                                <view v-if="pitem.isn === 0" class="oddname"><view class="span1">{{ pitem.name }}</view></view>
                                <view v-if="pitem.isn === 1 && template == 'PK10'" class="oddimg"><view> <view class="ball" :class="'ball-'+pitem.name"></view></view></view>
                                <view v-if="pitem.isn === 1 && template == 'SSC'" class="oddimg"><view> <view class="sscball" :class="'ball-'+pitem.name">{{ pitem.name }}</view></view></view>
                                <view v-if="curtime.fp == 0" class="odd"><view>{{ pitem.odds }}</view></view>
                                <view v-if="curtime.fp == 1" class="lockedodd">--</view>
                                <view v-if="curtime.fp == 0" class="selected"></view>
                              </view>
                            </view>
                          </view>
                        </view>
                      </view>
                    </view>
                    <view v-show="tabclassIndex == index" class="right-content" :class="template.toLowerCase()" v-if="index !== 0">
                      <custom-collapse>
                        <custom-collapse-item :show-animation="false" :title="it.name" :align="'center'" :open="true" v-for="(it,i) in item['list']" :key="`collapse-${i}`">
                          <view style="border-top: 0.5px solid #ddd;" class="oddsgroup two">
                            <view :class="{ 'checked': selectedPlays.includes(it.f+'-'+pitem.f),'lockedStatus':curtime.fp == 1}" @tap="togglePlay(it.f+'-'+pitem.f)" class="odds" v-for="(pitem,pindex) in it['plist']">
                              <view v-if="pitem.isn === 0" class="oddname"><view class="span1">{{ pitem.name }}</view></view>
                              <view v-if="pitem.isn === 1 && template == 'PK10'" class="oddimg"><view> <view class="ball" :class="'ball-'+pitem.name"></view></view></view>
                              <view v-if="pitem.isn === 1 && template == 'SSC'" class="oddimg"><view> <view class="sscball" :class="'ball-'+pitem.name">{{ pitem.name }}</view></view></view>
                              <view v-if="curtime.fp == 0" class="odd"><view>{{ pitem.odds }}</view></view>
                              <view v-if="curtime.fp == 1" class="lockedodd">--</view>
                              <view v-if="curtime.fp == 0" class="selected"></view>
                            </view>
                          </view>
                        </custom-collapse-item>
                      </custom-collapse>
                    </view>
                  </template>
                </view>
              </view>
            </view>
          </view>-->
        </view>
      </view>
    </view>
    <view class="bet-footer" v-show="swiperCurrent === 1">
      <view class="footer-btns">
        <button @click="selectMoney(item)" v-for="(item, index) in moneyList" :key="`money-${index}`" size="mini">{{ item }}</button>
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
    <view>
      <u-transition :show="topPanelShow" :customStyle="{'position':'fixed','width':'100%','top':heightArr.topHeight+'px'}" mode="fade">
        <view v-show="isshowpredict" class="predict-box">
          <view class="vanTop van-row">
            <view class="right-border van-col van-col--6">名次</view>
            <view class="van-col van-col--6">本群预测</view>
            <view class="van-col van-col--6"></view>
            <view class="van-col van-col--6"></view>
          </view>
          <view class="longDetail">
            <view class="van-row" v-for="(item, index) in predictInfoList" :key="`predict-${index}`">
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
        <view v-show="isclshow" class="chang-long-box">
          <view class="open-no-detail">
            <view class="vanTop van-row">
              <view class="van-col van-col--6">序号</view>
              <view class="van-col van-col--6">位置</view>
              <view class="van-col van-col--6">结果</view>
              <view class="van-col van-col--6">连期</view>
            </view>
            <view class="longDetail">
              <view class="van-row" v-for="(item,index) in cllist" :key="`cllist-${index}`">
                <view class="van-col van-col--6">{{ index+1 }}</view>
                <view class="van-col van-col--6">{{ item.position }}</view>
                <view class="van-col van-col--6">{{ item.betItem }}</view>
                <view class="van-col van-col--6" style="color: rgb(254, 1, 1);">{{ item.times }}</view>
              </view>
            </view>
          </view>
        </view>
        <open-num-list :isShow="isShowOpenList" class="oepnListHeight" :template="template" :list="openresultlist" :openListImageUrl="openListImageUrl" :historyStyle="roomConfig.openHistoryStyle || 0" :gid="gid"></open-num-list>
      </u-transition>
      <u-popup :show="isShowSwitchPannel" mode="right" :closeOnClickOverlay="true" @close="isShowSwitchPannel = !isShowSwitchPannel" :safeAreaInsetTop="true">
        <view>
          <view @click="gotoSwitchGame(item)" class="game-switch-item" v-for="item in gTimeList" :key="`game-${item.gid}`">
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
      
      <!-- 快捷打单配置弹窗 - 简单版本 -->
      <u-popup :show="isShowFullScreenPanel" mode="center" :closeOnClickOverlay="true" @close="closeBettingCenter" :safeAreaInsetTop="true" :customStyle="{'width':'95%','height':'90%','max-width':'800px','border-radius':'16px','overflow':'visible'}">
        <view class="quick-config-panel">
          <view class="quick-config-header">
            <text class="header-title">打单配置</text>
            <view class="header-close" @click="closeBettingCenter">
              <u-icon name="close" color="#fff" size="20"></u-icon>
            </view>
          </view>
          <view class="quick-config-content">
            <!-- 使用可复用的outbet配置组件 -->
            <OutbetConfigComponent 
              :isPopupMode="true" 
              :backUrl="'copage/chat'"
              @addConfig="handleAddConfig"
              @editConfig="handleEditConfig"
            />
          </view>
        </view>
      </u-popup>
      
      <!-- 房间设置弹窗 -->
      <u-popup :show="isShowRoomSettingsPanel" mode="center" :closeOnClickOverlay="true" @close="closeRoomSettingsPanel" :safeAreaInsetTop="true" :customStyle="{'width':'95%','height':'85%','max-width':'800px','border-radius':'16px','overflow':'visible'}">
        <view class="room-settings-panel">
          <view class="room-settings-header">
            <view class="header-left">
              <!-- 返回按钮，只在非主页面时显示 -->
              <view v-if="currentRoomSettingsPage !== 'main'" class="header-back" @click="goBackInRoomSettings">
                <u-icon name="arrow-left" color="#fff" size="20"></u-icon>
              </view>
            </view>
            <text class="header-title">{{ getRoomSettingsPageTitle() }}</text>
            <view class="header-close" @click="closeRoomSettingsPanel">
              <u-icon name="close" color="#fff" size="20"></u-icon>
            </view>
          </view>
          <view class="room-settings-content">
            <!-- 主页面：房间设置 -->
            <RoomSettingsComponent 
              v-if="currentRoomSettingsPage === 'main'"
              :isPopupMode="true" 
              :currentGameId="gid"
              :backUrl="'copage/chat'"
              @navigate="handleRoomSettingsInternalNavigate"
            />
            
            <!-- 游戏设置页面 -->
            <GameSettingsComponent 
              v-if="currentRoomSettingsPage === 'gameset'"
              :isPopupMode="true"
              @saved="onGameSettingsSaved"
            />
            
            <!-- 其他页面的简化版本（临时） -->
            <view v-if="currentRoomSettingsPage !== 'main' && currentRoomSettingsPage !== 'gameset'" class="embedded-page">
              <view class="page-header">
                <text class="page-title">{{ getRoomSettingsPageTitle() }}</text>
                <text class="page-subtitle">弹窗内简化版本</text>
              </view>
              
              <view class="page-actions">
                <view class="action-button primary" @click="openFullPage">
                  <u-icon name="external-link" color="#fff" size="16"></u-icon>
                  <text>打开完整页面</text>
                </view>
                <view class="action-button secondary" @click="goBackInRoomSettings">
                  <u-icon name="arrow-left" color="#666" size="16"></u-icon>
                  <text>返回房间设置</text>
                </view>
              </view>
              
              <view class="page-content">
                <text class="content-text">
                  完整的{{ getRoomSettingsPageTitle() }}功能请点击上方"打开完整页面"按钮。
                </text>
                <text class="content-text">
                  这里可以显示一些快捷设置选项。
                </text>
              </view>
            </view>
          </view>
        </view>
      </u-popup>
      
      <!-- 用户管理弹窗 -->
      <u-popup :show="isShowUserManagementPanel" mode="center" :closeOnClickOverlay="true" @close="closeUserManagementPanel" :safeAreaInsetTop="true" :customStyle="{'width':'95%','height':'95%','max-width':'800px','border-radius':'16px','overflow':'visible'}">
        <view class="user-management-panel">
          <view class="user-management-header">
            <text class="header-title">用户管理</text>
            <view class="header-close" @click="closeUserManagementPanel">
              <u-icon name="close" color="#fff" size="20"></u-icon>
            </view>
          </view>
          
          <!-- Tab 导航 -->
          <view class="tab-navigation">
            <view class="tab-item" 
                  :class="{ active: currentUserTab === 'users' }" 
                  @click="switchUserTab('users')">
              <text>用户</text>
            </view>
            <view class="tab-item" 
                  :class="{ active: currentUserTab === 'subaccounts' }" 
                  @click="switchUserTab('subaccounts')">
              <text>子账号</text>
            </view>
            <view class="tab-item" 
                  :class="{ active: currentUserTab === 'links' }" 
                  @click="switchUserTab('links')">
              <text>链接记录</text>
            </view>
          </view>
          
          <!-- Tab 内容 -->
          <view class="user-management-content">
            <view v-if="currentUserTab === 'users'" class="tab-content">
              <!-- 用户列表组件 -->
              <UserListComponent 
                :showHeader="false"
                :backUrl="''"
                :isPopupMode="true"
              />
            </view>
            <view v-if="currentUserTab === 'subaccounts'" class="tab-content placeholder-content">
              <text class="tab-placeholder">子账号管理功能开发中...</text>
            </view>
            <view v-if="currentUserTab === 'links'" class="tab-content placeholder-content">
              <text class="tab-placeholder">链接记录功能开发中...</text>
            </view>
          </view>
        </view>
      </u-popup>
      
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
            <view class="h-tr" v-for="(it, index) in msgOrderList" :key="`order-${index}`">
              <view class="h-td"><text class="text">{{ it.b }}</text></view>
              <view class="h-td"><text class="text">{{ it.p }}</text></view>
              <view class="h-td"><text class="text">{{ Math.floor(it.a) }}</text></view>
              <view class="h-td" v-if="orderShowTtype == 'settle'">
                <text class="text" v-if="it.y > 0" style="color: green;">+{{ Math.floor(it.y) }}</text>
                <text class="text" v-if="it.y < 0" style="color: red;">{{ Math.floor(it.y) }}</text>
                <text class="text" v-if="it.y == 0">{{ Math.floor(it.y) }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </u-popup>
      <block v-if="utype == 0">
        <u-popup :show="betRecordShow" mode="center" round="8" :customStyle="{'width':'90%'}" :closeOnClickOverlay="true" @close="betRecordShow = !betRecordShow">
          <scroll-view style="height: 600rpx;" scroll-y="true" :show-arrow="false">
            <custom-collapse class="bet-history-box" :accordion="true" @change="betRecordTabChange">
              <custom-collapse-item v-for="(item, index) in periodOrderList" :key="`period-${index}`" :item-index="index">
                <template v-slot:title>
                  <view class="bet-list-item">
                    <view class="item-up">
                      <text class="strong">第{{ item.period }}期</text>
                      <text v-if="item.isSettle" class="text" :class="item.winLose > 0 ? 'green' : (item.winLose < 0 ? 'red' : '')">{{ item.winLose > 0 ? "+"+Math.floor(item.winLose) : Math.floor(item.winLose) }}</text>
                      <text v-if="!item.isSettle" class="text blue">未结算</text>
                    </view>
                    <view class="item-down">
                      <text class="total">注数：{{ item.totalCount }}注</text>
                      <text class="tmoney">金额：{{ Math.floor(item.totalMoney) }}</text>
                      <text>收益</text>
                    </view>
                  </view>
                </template>
                <view class="bet-detail" v-for="(order, orderIndex) in item.orders" :key="`bet-${index}-${orderIndex}`">
                  <view class="bet-item">
                    <view class="left">{{ order.playGroupName }}[{{ order.playDetailName }}/{{ Math.floor(order.je) }}]</view>
                    <view class="time">{{ order.time }}</view>
                    <view v-if="order.isSettle" class="text" :class="order.winLose > 0 ? 'green' : (order.winLose < 0 ? 'red' : '')">{{ order.winLose > 0 ? "+"+Math.floor(order.winLose) : Math.floor(order.winLose) }}</view>
                    <view v-if="!order.isSettle" class="text blue">未结算</view>
                  </view>
                </view>
              </custom-collapse-item>
            </custom-collapse>
          </scroll-view>
        </u-popup>
      </block>
      <!-- 浮动操作面板 -->
      <view 
        v-show="showFloatingActions" 
        class="floating-action-panel" 
        :style="floatingActionStyle"
        @touchstart.stop
        @touchmove.stop
        @touchend.stop
        @click.stop>
        <view class="action-button copy-btn" @click="handleFloatingAction('copy')">
          <u-icon name="copy" color="#fff" size="16"></u-icon>
          <text class="action-text">复制</text>
        </view>
        <view class="action-button follow-btn" @click="handleFloatingAction('follow')">
          <u-icon name="play-right-fill" color="#fff" size="16"></u-icon>
          <text class="action-text">跟投</text>
        </view>
      </view>
      
      <!-- 遮罩层用于关闭浮动面板 -->
      <view 
        v-show="showFloatingActions" 
        class="floating-action-overlay" 
        @click="hideFloatingActions"
        @touchstart="hideFloatingActions">
      </view>
      
      <!-- 在线用户列表弹窗 -->
      <u-popup 
        :show="showOnlineUserList" 
        mode="center" 
        round="8" 
        :customStyle="{'width':'90%','max-height':'70%'}" 
        :closeOnClickOverlay="true" 
        @close="showOnlineUserList = false">
        <view class="online-user-list-container">
          <view class="online-user-header">
            <text class="online-user-title">在线用户列表</text>
            <text class="online-user-count">({{ onlineUserList.length }}人)</text>
          </view>
          <scroll-view style="height: 600rpx" scroll-y="true">
            <view class="online-user-table">
              <view class="online-user-tr header">
                <view class="online-user-th">账号</view>
                <view class="online-user-th">昵称</view>
                <view class="online-user-th">余额</view>
              </view>
              <view 
                class="online-user-tr" 
                v-for="(user, index) in onlineUserList" 
                :key="`online-user-${index}`">
                <view class="online-user-td">{{ user.username }}</view>
                <view class="online-user-td">{{ user.name }}</view>
                <view class="online-user-td">{{ Math.floor(user.kmoney) }}</view>
              </view>
            </view>
          </scroll-view>
        </view>
      </u-popup>
    </view>
  </view>
</template>

<script>
import {IMAGE_REQUEST_URL} from "@/common/config";
//import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin';
//import htmlParser from '@/utils/htmlParser.js';
import {siteConfig} from "../libs/mixin/mixin";
import CustomCollapse from '@/components/custom-collapse/custom-collapse.vue';
import CustomCollapseItem from '@/components/custom-collapse/custom-collapse-item.vue';
import OutbetConfigComponent from '@/components/OutbetConfigComponent.vue';
import UserListComponent from '@/components/UserListComponent.vue';
import RoomSettingsComponent from '@/components/RoomSettingsComponent.vue';
import GameSettingsComponent from '@/components/GameSettingsComponent.vue';
import clipboardUtils from '@/common/clipboardUtils.js';
export default {
  components: {
    CustomCollapse,
    CustomCollapseItem,
    OutbetConfigComponent,
    UserListComponent,
    RoomSettingsComponent,
    GameSettingsComponent
  },
  mixins: [uni.$mymixin],
  data() {
    return {
      chatList: [],gid:0,uid:0,
      // WebSocket事件监听器管理
      eventListeners: {},
      isDestroyed: false, // 标记组件是否已销毁
      lastPlayTime: 0, // 上次播放开奖声音的时间
      showShade:false,//显示长按复制粘贴面板
      showPop: false,
      popButton: ["复制", "跟投"],
      popStyle: "",
      longpressItem:[],
      bottomTarget: "",
      // 分页加载相关
      isLoadingMore: false, // 是否正在加载更多
      hasMoreMessages: true, // 是否还有更多消息
      pageSize: 10, // 每页消息数量
      nextLastId: null, // 服务器返回的下一页lastId，用于加载更多
      loadMoreTimer: null, // 加载更多防抖定时器
      loadStartTime: null, // 加载开始时间，用于性能监控
      lastScrollPosition: null, // 最后的滚动位置，用于恢复
      tabclassIndex: 0,
      isShowSwitchPannel: false,
      isShowFullScreenPanel: false, // 全屏快捷导航面板
      configPageUrl: '', // 打单配置页面URL
      isBettingCenterClosing: false, // 标记是否正在关闭打单中心弹窗
      isShowUserManagementPanel: false, // 用户管理面板
      currentUserTab: 'users', // 当前用户管理标签页
      isShowRoomSettingsPanel: false, // 房间设置面板
      currentRoomSettingsPage: 'main', // 当前房间设置页面：main, gameset, msgset, soundset, modifypwd
      roomSettingsPageStack: ['main'], // 房间设置页面栈，用于返回导航
      pendingMessages: [], // 待显示的消息缓存（当不在底部时）
      lastSyncCheck: 0, // 上次WebSocket状态检测时间
      recentlyCorrected: false, // 是否最近刚修正过状态
      lastHealthCheck: 0, // 上次轻量级健康检查时间
      lastBottomDetection: 0, // 上次检测到底部的时间
      lastUserInteraction: 0, // 上次用户交互时间
      isUserScrolling: false, // 是否为用户主动滚动
      scrollResetTimer: null, // 滚动状态重置定时器
      lastStateCorrection: 0, // 上次状态修正时间
      isshowright: true,
      isshowpredict: false,
      isclshow: false,
      isShowOpenList: false,
      iskeyshow: false,
      isbuttonsshow: false,
      coicon1: true,
      betRecordShow: false,
      ismsgfocus:false,
      cursorPosition:0,
      gname:'',
      sendmsg:'',//输入框里面的值
      curtime:[],//当前开盘时间信息
      balancetimer:null,
      periodtimer:null,
      openResult:[],//单期开奖结果
      template:'',
      openresultlist:[],//开奖结果列表，最近50条
      cllist:[],//长龙数据
      predictInfoList:[],//预测结果列表
      isshowssckey:false,//是否显示时时彩前三中三等键盘键
      isshowbingokey:false,//是否显示bingo键盘键
      roomConfig:{},
      imgurl:IMAGE_REQUEST_URL,
      msgOrderDetailShow:false,//订单详情弹窗
      msgOrderList:[],//当前要显示的订单列表
      balanceInfo:[],//余额信息
      unreadCount: 0,//未读数量
      isAtBottom: false,//是否已经滚动到底部
      showLoading:false,
      tmpToButomFlag:false,
      orderShowTtype:'',
      quickPlayDetailData:[],
      selectedButtons:[],
      selectedPlays:[],
      betMoney:'',
      moneyList:[10,20,50,100,200],
      zje:0,//总下注金额
      zCount:0,//总下注数量
      gTimeList:[],
      heightArr:{kbHeight:0,btnsHeight:0,topHeight:0,bottomHeight:0,keyHeight:0,betBottomHeight:0},
      swiperCurrent:0,
      popupStatus:false,
      previewImageFlag:false,
      periodOrderList:[],
      avatar: uni.getStorageSync('avatar'),
      tmp:{},
      topPanelShow:false,//顶部通用面板
      emojiType:'',
      keyboardHeight:0,
      headImageDomain:'',
      openImageDomain:'',
      utype:0,
      // 浮动操作面板相关
      showFloatingActions: false,
      floatingActionStyle: {},
      selectedMessageIndex: 0,
      longPressPosition: { x: 0, y: 0 },
      //是否第一次加载
      isFirstLoad:true,
      reloadflag:false,
      
      // 聊天记录自动清理相关
      lastScrollTime: Date.now(), // 最后滚动时间
      chatCleanupTimer: null, // 聊天记录清理定时器
      maxChatRecords: 100, // 最大聊天记录条数（从300优化到100）
      scrollInactiveTime: 5 * 60 * 1000, // 5分钟无滑动时间（从10分钟优化到5分钟）
      
      // 性能优化配置
      performanceConfig: {
        batchProcessDelay: 200,        // 批处理延迟200ms
        scrollDebounceDelay: 300,      // 滚动防抖300ms
        cleanupInterval: 60000,        // 清理间隔1分钟
        maxMemoryUsage: 100 * 1024 * 1024, // 最大内存使用100MB
      },
      
      // 性能监控
      performanceStats: {
        messageCount: 0,
        lastCleanup: Date.now(),
        timerCount: 0,
        listenerCount: 0
      },
      
      // WebSocket连接状态提示
      showWebSocketError: false, // 是否显示WebSocket连接异常提示
      
      // 在线用户列表相关
      showOnlineUserList: false,
      onlineUserList: [],
    }
  },
  onReady() {
    this.initTopHeight();
    
    // 页面就绪后检查WebSocket状态
    this.$nextTick(() => {
      setTimeout(() => {
        // 禁用状态检测，避免误判导致不必要的重连
        // this.checkAndSyncWebSocketStatus();
      }, 1000);
    });
  },
  onShow(){
    console.log('🔄 onShow被触发');
    console.log('👁️ 页面显示状态 - UID:', this.uid, 'UType:', this.utype, 'WebSocket状态:', uni.$socketUtils?.isOpenSocket);
    if (typeof console.trace === 'function') {
      console.trace('🚨 onShow调用栈');
    }
    this.initializePageShow();
  },
  onHide(){
    //console.log("🌙 chat.vue onHide");
    
    // 清理定时器
    this.clearAllTimers();
    
    // 标记组件为隐藏状态但不完全销毁（可能还会回来）
    // this.isDestroyed = true; // 不在这里设置，因为onShow可能会重新激活
  },
  beforeDestroy(){
    //console.log("💀 chat.vue beforeDestroy - 开始销毁组件");
    
    // 立即标记组件为已销毁，防止任何事件继续执行
    this.isDestroyed = true;
    
    // 清理所有定时器
    this.clearAllTimers();
    
    // 重置分页状态
    this.nextLastId = null;
    this.lastScrollPosition = null;
    
    // 清理WebSocket监听器
    this.clearWebSocketListeners();
    
    // 清理键盘监听器
    uni.offKeyboardHeightChange(this.keyboardHeightChange);
    
    // 清理全局调试方法
    if (uni.$chatDebug) {
      delete uni.$chatDebug;
    }
    
    //console.log("✅ chat.vue beforeDestroy - 组件销毁完成");
  },
  onUnload(){
    //console.log("🚪 chat.vue onUnload - 页面卸载");
    
    // 立即标记组件为已销毁
    this.isDestroyed = true;
    
    // 执行完整清理
    this.clearAllTimers();
    this.clearWebSocketListeners();
    
    // 清理性能监控定时器
    if (this.performanceMonitorTimer) {
      clearInterval(this.performanceMonitorTimer);
      this.performanceMonitorTimer = null;
    }
    
    // 清理键盘监听器
    uni.offKeyboardHeightChange(this.keyboardHeightChange);
    
    // 清理页面可见性监听器
    /* if (document && typeof document.removeEventListener === 'function') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    } */
    
    //console.log("✅ chat.vue onUnload - 页面卸载完成");
  },
  onLoad(){
    this.reloadflag = true;
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.openImageDomain = uni.getStorageSync('openImageDomain');
    this.uid = this.userInfo.userid;
    this.utype = this.userInfo.type;
    this.gid = uni.getStorageSync('cgid');
    console.log('🔍 页面初始化 - UID:', this.uid, 'UType:', this.utype, 'UserInfo:', this.userInfo);
    this.template = uni.getStorageSync('ctemplate');
    this.heightArr.statusbarHeight = this.windowObj.statusBarHeight;
    
    // 性能优化初始化
    this.pageStartTime = Date.now();
    
    // 初始化防抖方法
    this.debouncedToBottom = this.debounce(() => {
      this.toBottom(150);
    }, this.performanceConfig.scrollDebounceDelay);
    
    // 启动性能监控（每30秒检查一次）
    this.performanceMonitorTimer = setInterval(() => {
      this.monitorPerformance();
    }, 30000);
    
    // 设置页面标题为当前登录账号
    if (this.userInfo && this.userInfo.username) {
      // #ifdef H5
      if (typeof document !== 'undefined') {
        document.title = this.userInfo.username;
      }
      // #endif
      
      // 设置导航栏标题（适用于APP和小程序）
      uni.setNavigationBarTitle({
        title: this.userInfo.username
      });
    }
    
    // 注册全局调试方法
    uni.$chatDebug = {
      checkWebSocketStatus: () => this.forceSyncWebSocketStatus(),
      testConnection: () => this.testWebSocketConnection(),
      syncChatData: () => this.syncChatData(),
      manualReconnect: () => this.manualReconnectAndSync(),
      testReconnect: () => uni.$socketUtils.testReconnectMechanism(),
      forceReconnect: () => uni.$socketUtils.forceReconnect(),
      getStatus: () => uni.$socketUtils.getDiagnosticInfo()
    };
    
    // 绑定WebSocket事件监听器
    this.bindWebSocketListeners();
    this.loadChatRecords();
    this.getperiod();
    if(!this.periodtimer){
        this.periodtimer = setInterval(() => {
          if(!this.isDestroyed){
            this.timerCheck();
            this.gitemTimeCheck();
          }
        },1000);
      }
      
      // 确保清理旧的定时器，防止重复创建
      if(this.balancetimer){
        console.log('🧹 清理已存在的balancetimer');
        clearInterval(this.balancetimer);
        this.balancetimer = null;
      }
      
      if(!this.balancetimer){
        // 房主账号查询更复杂，微调查询间隔
        const queryInterval = this.utype === 1 ? 10000 : 8000; // 房主10秒，会员8秒
        console.log(`🕐 设置定时查询间隔: ${queryInterval/1000}秒 (用户类型: ${this.utype})`);
        this.balancetimer = setInterval(() => {
          console.log(`⏰ 定时器触发 - 类型:${this.utype}, ID:${this.balancetimer}`);
          if(!this.isDestroyed && uni.$socketUtils.isOpenSocket){
            // 房主账号分散发送消息，避免复杂查询同时触发
            if (this.utype === 1) {
              uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
              setTimeout(() => {
                uni.$socketUtils.send({eventType:"periodListOrSingle"});
              }, 200);
              setTimeout(() => {
                uni.$socketUtils.send({eventType:"getBalanceInfo"});
              }, 400);
            } else {
              // 普通会员正常发送
              uni.$socketUtils.send({eventType:"getBalanceInfo"});
              uni.$socketUtils.send({eventType:"periodListOrSingle"});
              uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
            }
            this.getRoomConfig();
          }
        }, queryInterval);
      }
    
    //初始化远程数据
    this.getRoomConfig();
    this.utype == 0 && this.quickPlayDetail();

    //预先初始化一次
    this.$u.api.common.longdragon({gid:this.gid}).then(res => {this.cllist = res.data;});
    this.$u.api.common.lotteryPredictInfo({gid:this.gid}).then(res => {this.predictInfoList = res.data;});
    this.$u.api.common.resultByDate({gid:this.gid}).then(res => {this.openresultlist = res.data.records;});

    //连接成功发送查询单期开奖结果
    if(!uni.$socketUtils.isOpenSocket){
      // WebSocket未连接时，等待连接成功事件（新的重连机制会自动重连）
      //console.log('WebSocket未连接，自动重连机制已启动');
    }else{
      // 房主账号延迟并分散发送消息，避免复杂查询同时触发
      if (this.utype === 1) {
        console.log('🏠 房主账号onLoad，延迟分散发送WebSocket消息');
        uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
        setTimeout(() => {
          uni.$socketUtils.send({eventType:"periodListOrSingle"});
        }, 500);
        setTimeout(() => {
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
        }, 1000);
      } else {
        // 普通会员正常发送
        uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
        uni.$socketUtils.send({eventType:"getBalanceInfo"});
        uni.$socketUtils.send({eventType:"periodListOrSingle"});
      }
    }
    if(this.template == 'SSC'){
      this.keyboardHeight = 210;
      this.isshowssckey = true;
    }else if(this.template == 'BINGO'){
      this.keyboardHeight = 250;
      this.isshowbingokey = true;
    }else{
      this.isshowssckey = false;
      this.keyboardHeight = 210;
    }
    //that.chatList = [];
    // 所有事件监听器已通过bindWebSocketListeners()统一管理

    //键盘高度监听
    uni.offKeyboardHeightChange(this.keyboardHeightChange);
    uni.onKeyboardHeightChange(this.keyboardHeightChange);
    
    // 启动聊天记录自动清理定时器
    this.startChatCleanupTimer();
    
    // H5环境下添加页面可见性监听
    // #ifdef H5
    /* if (document && typeof document.addEventListener === 'function') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    } */
    // #endif
  },
  computed: {
    windowObj() {
      return this.$u.sys();
    },
    openListImageUrl() {
      if (this.template !== 'BINGO' || !this.openImageDomain) {
        return '';
      }
      const list = this.chatList || [];
      for (let i = list.length - 1; i >= 0; i--) {
        const item = list[i];
        if (item.chatType === 'image' && item.content && item.content.indexOf('openlist_') > -1) {
          return item.content.startsWith('http') ? item.content : (this.openImageDomain + item.content);
        }
      }
      if (this.openResult && this.openResult.period && this.gid) {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dstr = `${now.getFullYear()}${month}${day}`;
        return `${this.openImageDomain}/upload/openimg/${dstr}/${this.gid}/openlist_${this.openResult.period}.webp`;
      }
      return '';
    }
  },
  watch: {
    /*sendmsg(newVal, oldVal) {
      if(newVal.lenght > 0){
        this.cursorPosition = this.sendmsg.length;
      }
    },*/
    betMoney(newVal){
      newVal = newVal+"";
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
    selectedButtons(){
      this.completeMoney();
    },
    selectedPlays(){
      this.completeMoney();
    },
    'balanceInfo.room_status': {
      handler: function (val, oldVal) {
        if(val == 2){
          this.sendmsg = "";
        }
      },
      deep: true
    }
  },
  mounted() {
    this.$nextTick(()=>{
      // 重置分页状态
      this.hasMoreMessages = true;
      this.isLoadingMore = false;
      this.nextLastId = null;
      this.lastScrollPosition = null;
      
      //this.loadChatRecords();
      
    });
  },
  methods: {
    // ========== WebSocket事件监听器管理 ==========
    
    // 统一绑定所有WebSocket事件监听器
    bindWebSocketListeners() {
      this.clearWebSocketListeners(); // 先清理避免重复绑定
      
      // 定义所有事件监听器
      this.eventListeners = {
        websocketopen: this.onWebSocketOpen,
        [`openResult${this.gid}`]: this.onOpenResult,
        [`gamechat${this.gid}`]: this.onGameChat,
        getBalanceInfo: this.onGetBalanceInfo,
        roomStatusNotice: this.onRoomStatusNotice,
        periodListOrSingle: this.onPeriodListOrSingle,
        openKjNotice: this.onOpenKjNotice
      };
      
      // 绑定所有监听器
      Object.keys(this.eventListeners).forEach(eventName => {
        uni.$on(eventName, this.eventListeners[eventName]);
      });
    },
    
    // 统一清理所有WebSocket事件监听器
    clearWebSocketListeners() {
      Object.keys(this.eventListeners).forEach(eventName => {
        uni.$off(eventName, this.eventListeners[eventName]);
      });
      this.eventListeners = {};
    },
    
    // 手动重连并同步数据（用于处理重连后没有加载历史记录的情况）
    manualReconnectAndSync() {
      console.log('🔧 手动重连并同步数据');
      
      // 显示重连提示
      uni.showToast({
        title: '正在重连...',
        icon: 'loading',
        duration: 3000
      });
      
      // 先测试WebSocket真实连接状态
      if(this.testWebSocketConnection()) {
        console.log('WebSocket连接测试通过，直接同步数据');
        uni.hideToast();
        uni.showToast({
          title: '连接正常，同步数据',
          icon: 'success',
          duration: 2000
        });
        this.syncChatData();
        return;
      }
      
      // 如果未连接，强制重置WebSocket状态并重连
      if(uni.$socketUtils) {
        console.log('WebSocket未连接，强制重置状态并重连');
        
        // 强制重置WebSocket的阻止重连的状态标志
        uni.$socketUtils.isUserClose = false;
        uni.$socketUtils.shouldAutoReconnect = true;
        uni.$socketUtils.isReconnecting = false;
        uni.$socketUtils.reconnectLock = false;
        uni.$socketUtils.disableAutoReconnect = false;
        uni.$socketUtils.isUserExitApp = false;
        
        // 确保重连后能加载历史记录
        this.reloadflag = false;
        
        // 监听一次连接成功事件，确保重连后同步数据
        const onReconnectSuccess = (res) => {
          console.log('手动重连成功，同步数据');
          uni.$off('websocketopen', onReconnectSuccess);
          uni.hideToast();
          /* uni.showToast({
            title: '重连成功',
            icon: 'success',
            duration: 2000
          }); */
          setTimeout(() => {
            this.syncChatData();
          }, 1000);
        };
        
        // 监听连接失败（超时处理）
        const timeoutHandler = setTimeout(() => {
          uni.$off('websocketopen', onReconnectSuccess);
          uni.hideToast();
          uni.showToast({
            title: '重连超时，请检查网络',
            icon: 'none',
            duration: 3000
          });
          console.warn('手动重连超时');
        }, 10000); // 10秒超时
        
        uni.$on('websocketopen', (res) => {
          clearTimeout(timeoutHandler);
          onReconnectSuccess(res);
        });
        
        // 尝试使用多种重连方式
        if (typeof uni.$socketUtils.debouncedReconnect === 'function') {
          // 方式1：使用防抖重连
          console.log('使用防抖重连');
          uni.$socketUtils.debouncedReconnect('manual_reconnect', true);
        } else if (typeof uni.$socketUtils.manualReconnect === 'function') {
          // 方式2：使用手动重连
          console.log('使用手动重连');
          uni.$socketUtils.manualReconnect();
        } else if (typeof uni.$socketUtils.initConnection === 'function') {
          // 方式3：重新初始化连接
          console.log('重新初始化连接');
          uni.$socketUtils.initConnection();
        } else {
          console.error('WebSocket工具类方法不可用');
          uni.hideToast();
          uni.showToast({
            title: 'WebSocket工具不可用',
            icon: 'none',
            duration: 3000
          });
        }
      } else {
        console.error('WebSocket工具类不可用');
        uni.hideToast();
        uni.showToast({
          title: 'WebSocket工具类不存在',
          icon: 'none',
          duration: 3000
        });
      }
    },
    
    // 测试WebSocket连接状态
    testWebSocketConnection() {
      if (!uni.$socketUtils || !uni.$socketUtils.socketTask) {
        console.log('🔍 WebSocket测试: socketTask不存在');
        return false;
      }
      
      try {
        // 尝试发送一个测试心跳包
        uni.$socketUtils.socketTask.send({
          data: JSON.stringify({ eventType: 'ping', timestamp: Date.now() }),
          success: () => {
            console.log('✅ WebSocket测试: 发送成功，连接正常');
            // 如果发送成功但isOpenSocket为false，修正状态
            if (!uni.$socketUtils.isOpenSocket) {
              console.log('🔄 修正WebSocket状态为已连接');
              uni.$socketUtils.isOpenSocket = true;
              this.showWebSocketError = false;
            }
          },
          fail: (error) => {
            console.warn('❌ WebSocket测试: 发送失败，连接异常', error);
            // 发送失败，修正状态为断开
            uni.$socketUtils.isOpenSocket = false;
            this.showWebSocketError = true;
          }
        });
        
        // 返回当前的isOpenSocket状态
        return uni.$socketUtils.isOpenSocket;
        
      } catch (error) {
        console.error('🔍 WebSocket测试出错:', error);
        uni.$socketUtils.isOpenSocket = false;
        return false;
      }
    },
    
    // 同步聊天数据
    syncChatData() {
      console.log('🔄 同步聊天数据');
      
      // 防闪烁检查：如果打单中心正在关闭，跳过数据同步
      if (this.isBettingCenterClosing) {
        console.log('🚫 打单中心正在关闭，跳过聊天数据同步');
        return;
      }
      
      if(!uni.$socketUtils.isOpenSocket) {
        console.warn('WebSocket未连接，无法同步数据');
        return;
      }
      
      // 清空并重新加载聊天记录
      this.chatList = [];
      this.hasMoreMessages = true;
      this.isLoadingMore = false;
      this.nextLastId = null;
      this.lastScrollPosition = null;
      this.unreadCount = 0;
      
      // 重新加载聊天记录
      this.loadChatRecords();
      
      // 发送其他必要的请求 - 应用房主分散发送机制
      if (this.utype === 1) {
        console.log('🏠 房主账号syncChatData，延迟分散发送WebSocket消息');
        uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
        setTimeout(() => {
          uni.$socketUtils.send({eventType:"periodListOrSingle"});
        }, 500);
        setTimeout(() => {
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
        }, 1000);
      } else {
        // 普通会员正常发送
        uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
        uni.$socketUtils.send({eventType:"getBalanceInfo"});
        uni.$socketUtils.send({eventType:"periodListOrSingle"});
      }
      this.getperiod();
      
      /* uni.showToast({
        title: '数据同步完成',
        icon: 'success',
        duration: 2000
      }); */
    },
    
    // 强制同步WebSocket状态（调试用）
    forceSyncWebSocketStatus() {
      console.log('🔧 强制同步WebSocket状态');
      
      if (!uni.$socketUtils) {
        console.error('WebSocket工具类不存在');
        const errorMsg = 'WebSocket工具类不存在';
        uni.showModal({
          title: 'WebSocket诊断',
          content: errorMsg,
          showCancel: false
        });
        return { success: false, error: errorMsg };
      }
      
      // 获取详细诊断信息
      let diagnosticInfo = {};
      if (typeof uni.$socketUtils.getDiagnosticInfo === 'function') {
        diagnosticInfo = uni.$socketUtils.getDiagnosticInfo();
      }
      
      const socketTask = uni.$socketUtils.socketTask;
      const currentIsOpenSocket = uni.$socketUtils.isOpenSocket;
      
      console.log('=== WebSocket诊断信息 ===');
      console.log('基本状态:');
      console.log('- socketTask存在:', !!socketTask);
      console.log('- isOpenSocket:', currentIsOpenSocket);
      console.log('- isReconnecting:', uni.$socketUtils.isReconnecting);
      console.log('- isUserClose:', uni.$socketUtils.isUserClose);
      console.log('- shouldAutoReconnect:', uni.$socketUtils.shouldAutoReconnect);
      console.log('- lastHeartbeatTime:', uni.$socketUtils.lastHeartbeatTime);
      console.log('- reconnectAttempts:', uni.$socketUtils.reconnectAttempts);
      console.log('- isNetworkAvailable:', uni.$socketUtils.isNetworkAvailable);
      
      // 构建诊断信息显示
      let statusInfo = [];
      statusInfo.push(`连接状态: ${currentIsOpenSocket ? '已连接' : '未连接'}`);
      statusInfo.push(`socketTask: ${!!socketTask ? '存在' : '不存在'}`);
      statusInfo.push(`重连中: ${uni.$socketUtils.isReconnecting ? '是' : '否'}`);
      statusInfo.push(`用户关闭: ${uni.$socketUtils.isUserClose ? '是' : '否'}`);
      statusInfo.push(`自动重连: ${uni.$socketUtils.shouldAutoReconnect ? '启用' : '禁用'}`);
      statusInfo.push(`重连次数: ${uni.$socketUtils.reconnectAttempts || 0}`);
      statusInfo.push(`网络可用: ${uni.$socketUtils.isNetworkAvailable ? '是' : '否'}`);
      
      if (uni.$socketUtils.lastHeartbeatTime) {
        const timeSinceHeartbeat = Date.now() - uni.$socketUtils.lastHeartbeatTime;
        statusInfo.push(`最后心跳: ${Math.round(timeSinceHeartbeat / 1000)}秒前`);
      } else {
        statusInfo.push(`最后心跳: 无`);
      }
      
      // #ifdef H5
      if (socketTask && socketTask.readyState !== undefined) {
        const readyStateMap = {
          0: '连接中',
          1: '已开启',
          2: '关闭中', 
          3: '已关闭'
        };
        statusInfo.push(`WebSocket状态: ${readyStateMap[socketTask.readyState] || socketTask.readyState}`);
        console.log('- H5 readyState:', socketTask.readyState);
      }
      // #endif
      
      // 显示诊断信息弹窗
      uni.showModal({
        title: 'WebSocket诊断信息',
        content: statusInfo.join('\n'),
        confirmText: '强制重连',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            console.log('用户选择强制重连');
            this.manualReconnectAndSync();
          }
        }
      });
      
      // 执行状态修正
      if (socketTask) {
        // #ifdef H5
        if (socketTask.readyState !== undefined) {
          const shouldBeOpen = (socketTask.readyState === 1);
          if (currentIsOpenSocket !== shouldBeOpen) {
            console.log('🔄 修正状态不同步问题');
            uni.$socketUtils.isOpenSocket = shouldBeOpen;
            if (shouldBeOpen) {
              this.showWebSocketError = false;
            }
            return { success: true, corrected: true, newState: shouldBeOpen };
          }
        }
        // #endif
        
        // 对所有平台进行连接测试
        this.testWebSocketConnection();
        return { success: true, tested: true };
      } else {
        console.log('🔄 socketTask不存在，修正isOpenSocket为false');
        uni.$socketUtils.isOpenSocket = false;
        this.showWebSocketError = true;
        return { success: true, corrected: true, newState: false };
      }
    },
    
    // 轻量级连接健康检查（不触发页面重新渲染）
    lightweightHealthCheck() {
      // 防抖机制：避免频繁检查
      const now = Date.now();
      if (this.lastHealthCheck && (now - this.lastHealthCheck) < 10000) {
        return; // 10秒内不重复检查
      }
      this.lastHealthCheck = now;
      
      if (!uni.$socketUtils || !uni.$socketUtils.socketTask) {
        return;
      }
      
      try {
        // 检查心跳超时（但不发出事件，只记录日志）
        const lastHeartbeat = uni.$socketUtils.lastHeartbeatTime;
        if (lastHeartbeat && (now - lastHeartbeat > 60000)) {
          console.warn('🔧 轻量级检查：心跳超时超过60秒，可能连接异常');
          // 不触发重连，让现有的重连机制处理
        }
        
        // 检查连接时长，记录连接稳定性
        const connectionStartTime = uni.$socketUtils.connectionStartTime;
        if (connectionStartTime) {
          const uptime = now - connectionStartTime;
          if (uptime > 300000) { // 5分钟以上的连接
            console.log(`📊 连接稳定性良好，已连接 ${Math.floor(uptime/60000)} 分钟`);
          }
        }
      } catch (error) {
        console.error('轻量级健康检查出错:', error);
      }
    },
    
    // 检测并同步WebSocket状态（已禁用，避免页面重新渲染）
    checkAndSyncWebSocketStatus() {
      // 防闪烁检查：如果打单中心正在关闭，跳过状态检测
      if (this.isBettingCenterClosing) {
        return;
      }
      
      // 防抖机制：避免频繁检测和修正，减少页面重新渲染
      const now = Date.now();
      if (this.lastSyncCheck && (now - this.lastSyncCheck) < 3000) {
        return; // 3秒内不重复检测
      }
      this.lastSyncCheck = now;
      
      if (!uni.$socketUtils) {
        return;
      }
      
      try {
        // 获取WebSocket的真实状态
        const socketTask = uni.$socketUtils.socketTask;
        const currentIsOpenSocket = uni.$socketUtils.isOpenSocket;
        
        if (socketTask) {
          // 检查WebSocket的readyState
          // 1 = OPEN (连接已建立)
          // 0 = CONNECTING (连接正在建立)
          // 2 = CLOSING (连接正在关闭) 
          // 3 = CLOSED (连接已关闭)
          
          let actualState = 'unknown';
          let shouldBeOpen = false;
          
          // 根据不同平台获取readyState
          // #ifdef H5
          if (socketTask.readyState !== undefined) {
            actualState = socketTask.readyState;
            shouldBeOpen = (actualState === 1); // WebSocket.OPEN
          }
          // #endif
          
                     // #ifdef APP-PLUS || MP-WEIXIN || MP-ALIPAY
           // 在App和小程序中，socketTask没有readyState属性
           // 我们通过测试发送来检测连接状态
           if (socketTask.send && typeof socketTask.send === 'function') {
             // 如果isOpenSocket为true，我们相信这个状态
             // 如果为false，我们进行测试发送来验证
             if (currentIsOpenSocket) {
               shouldBeOpen = true;
               actualState = 'trusted_open';
             } else {
               // 状态为false时，偶尔进行测试验证（避免频繁测试）
               const now = Date.now();
               const lastTest = uni.$socketUtils.lastConnectionTest || 0;
               if (now - lastTest > 10000) { // 10秒测试一次
                 uni.$socketUtils.lastConnectionTest = now;
                 this.testWebSocketConnection();
               }
               shouldBeOpen = uni.$socketUtils.isOpenSocket; // 使用测试后的结果
               actualState = 'test_checked';
             }
           }
           // #endif
          
          // 状态不同步检测和修复
          if (currentIsOpenSocket !== shouldBeOpen) {
            console.warn(`🔧 WebSocket状态不同步检测到！`);
            console.warn(`- isOpenSocket: ${currentIsOpenSocket}`);
            console.warn(`- 实际状态: ${actualState}`);
            console.warn(`- 应该为: ${shouldBeOpen}`);
            
            // 修正状态标志
            uni.$socketUtils.isOpenSocket = shouldBeOpen;
            
            // 如果实际是连接状态但标志为false，发出连接成功事件
            // 但不要频繁发出，避免触发页面重新渲染
            if (shouldBeOpen && !currentIsOpenSocket && !this.recentlyCorrected) {
              console.log('🔄 修正WebSocket状态为已连接，发出连接事件');
              this.recentlyCorrected = true;
              setTimeout(() => {
                this.recentlyCorrected = false;
              }, 5000); // 5秒内不重复修正
              uni.$emit("websocketopen", { corrected: true });
            }
          }
        } else {
          // socketTask不存在但isOpenSocket为true，修正状态
          if (currentIsOpenSocket) {
            console.warn('🔧 socketTask不存在但isOpenSocket为true，修正状态');
            uni.$socketUtils.isOpenSocket = false;
          }
        }
        
        // 额外的健康检查：测试发送心跳
        if (uni.$socketUtils.isOpenSocket && socketTask) {
          // 检查上次心跳时间，如果超过30秒没有心跳响应，可能连接异常
          const lastHeartbeat = uni.$socketUtils.lastHeartbeatTime;
          const now = Date.now();
          if (lastHeartbeat && (now - lastHeartbeat > 30000)) {
            console.warn('🔧 心跳超时，可能连接异常，尝试重连');
            uni.$socketUtils.isOpenSocket = false;
          }
        }
        
      } catch (error) {
        console.error('检测WebSocket状态时出错:', error);
      }
    },
    
    // 安全的事件监听器执行（检查组件是否已销毁）
    safeExecute(callback) {
      if (this.isDestroyed) {
        console.warn('⚠️ 组件已销毁，跳过事件处理');
        return;
      }
      if (typeof callback === 'function') {
        callback();
      }
    },
    
    // 清理所有定时器
    clearAllTimers() {
      if (this.periodtimer) {
        clearInterval(this.periodtimer);
        this.periodtimer = null;
      }
      if (this.balancetimer) {
        clearInterval(this.balancetimer);
        this.balancetimer = null;
      }
      if (this.loadMoreTimer) {
        clearTimeout(this.loadMoreTimer);
        this.loadMoreTimer = null;
      }
      if (this.chatCleanupTimer) {
        clearInterval(this.chatCleanupTimer);
        this.chatCleanupTimer = null;
      }
    },
    
    // 处理页面可见性变化
    /* handleVisibilityChange() {
      console.log("sssssssssssssssss")
      if (document.hidden) {
        this.clearAllTimers();
      } else {
        if (!this.isDestroyed) {
          // 页面重新显示时恢复定时器
          this.initializePageShow();
        }
      }
    }, */
    
    // ========== WebSocket事件处理器 ==========
    
    // WebSocket连接成功
    onWebSocketOpen(res) {
      this.safeExecute(() => {
        console.log('🔌 onWebSocketOpen被调用，参数:', res);
        console.log('👤 用户信息 - ID:', this.uid, '类型:', this.utype, '(0=会员,1=管理员)');
        if (typeof console.trace === 'function') {
          console.trace('🚨 onWebSocketOpen调用栈');
        }
        
        // 防闪烁检查：如果打单中心正在关闭，跳过数据加载
        if (this.isBettingCenterClosing) {
          console.log('🚫 打单中心正在关闭，跳过WebSocket数据加载');
          return;
        }
        
        // 检查是否是首次加载（页面刚打开时的连接）
        const isFirstLoad = this.reloadflag;
        
        if(isFirstLoad){
          //console.log('📥 首次连接，仅发送基础请求');
          this.reloadflag = false;
          // 房主账号延迟并分散发送消息，避免复杂查询同时触发
          if (this.utype === 1) {
            console.log('🏠 房主账号首次连接，延迟分散发送WebSocket消息');
            uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
            setTimeout(() => {
              uni.$socketUtils.send({eventType:"periodListOrSingle"});
            }, 500);
            setTimeout(() => {
              uni.$socketUtils.send({eventType:"getBalanceInfo"});
            }, 1000);
          } else {
            // 普通会员正常发送
            uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
            uni.$socketUtils.send({eventType:"getBalanceInfo"});
            uni.$socketUtils.send({eventType:"periodListOrSingle"});
          }
          return;
        }
        
        // 重连场景：始终重新拉取最新消息并滚到底部（与后台恢复/心跳超时后的预期一致）
        console.log('🔌 WebSocket重连，清空列表并重新加载聊天记录至最新');
        this.chatList = [];
        this.hasMoreMessages = true;
        this.isLoadingMore = false;
        this.nextLastId = null;
        this.lastScrollPosition = null;
        this.unreadCount = 0;
        this.isAtBottom = true;
        this.loadChatRecords(false, false);
        
        // 发送其他必要的请求
        // 房主账号延迟并分散发送消息，避免复杂查询同时触发
        if (this.utype === 1) {
          console.log('🏠 房主账号，延迟分散发送WebSocket消息');
          uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
          setTimeout(() => {
            uni.$socketUtils.send({eventType:"periodListOrSingle"});
          }, 500);
          setTimeout(() => {
            uni.$socketUtils.send({eventType:"getBalanceInfo"});
          }, 1000);
        } else {
          // 普通会员正常发送
          uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
          uni.$socketUtils.send({eventType:"periodListOrSingle"});
        }
        this.getperiod();
      });
    },
    
    // 开奖结果
    onOpenResult(data) {
      this.safeExecute(() => {
        this.openResult = data.data;
        if(this.openresultlist.length > 0 && this.openresultlist[0].shortPeriod != this.openResult.period){
          this.$u.api.common.resultByDate({gid:this.gid}).then(res => {this.openresultlist = res.data.records;});
        }else if(this.openresultlist.length <= 0){
          this.$u.api.common.resultByDate({gid:this.gid}).then(res => {this.openresultlist = res.data.records;});
        }
      });
    },
    
    // 游戏聊天消息
    onGameChat(data) {
      this.safeExecute(() => {
        // 消息计数器（用于调试）
        if (!this.messageCounter) this.messageCounter = 0;
        this.messageCounter++;
        
        // 调试日志：确认消息接收正常（弹窗状态无关）
        console.log(`📨 [${this.messageCounter}] 收到聊天消息，弹窗状态:`, this.isShowFullScreenPanel ? '已打开' : '已关闭', '当前位置:', this.isAtBottom ? '底部' : '非底部');
        console.log('📨 消息详情:', {
          data: data.data,
          other: data.other,
          otherType: Array.isArray(data.other) ? 'Array' : typeof data.other,
          msgid: data.other?.msgid,
          sender: data.data?.sender,
          currentUid: this.uid,
          manualResend: data.other?.manualResend,
          eventType: data.eventType,
          gid: data.gid
        });
        let msg = data.data;
        let shouldShowImmediately = false;
        
        // 判断是否应该立即显示消息
        if (this.isAtBottom) {
          shouldShowImmediately = true;
        } else if (this.tmpToButomFlag) {
          // 用户刚发送消息，强制显示
          shouldShowImmediately = true;
        } else if (data.other && data.other.manualResend) {
          // 🔧 新增：手动重新发送的消息总是立即显示
          shouldShowImmediately = true;
          console.log('✅ 手动重新发送消息，强制立即显示:', Array.isArray(msg) ? msg.length + '条消息' : msg.content);
        } else if (msg.sender != this.uid) {
          // 🔧 新增：系统回复消息（非自己发送的）总是立即显示
          shouldShowImmediately = true;
          console.log('✅ 系统回复消息，强制立即显示:', msg.content);
        }
        
        if(Array.isArray(msg)){
          // 批量消息处理
          if (shouldShowImmediately) {
            // 立即显示消息
            this.$nextTick(() => {
              this.chatList = this.chatList.concat(msg);
              this.tmpToButomFlag = false;
              
              // 如果是手动重新发送的消息，强制关闭弹窗并滚动到底部显示
              if (data.other && data.other.manualResend) {
                console.log('🔄 手动重新发送消息，强制关闭弹窗并滚动到底部');
                
                // 强制关闭所有弹窗
                this.isShowFullScreenPanel = false;
                this.isShowUserManagementPanel = false;
                this.isShowRoomSettingsPanel = false;
                
                // 延迟滚动，确保弹窗关闭动画完成
                setTimeout(() => {
                  this.toBottom(200, false, false);
                  // 确保isAtBottom状态正确
                  this.isAtBottom = true;
                }, 300);
              }
            });
          } else {
            // 不在底部，缓存消息并增加未读计数
            this.pendingMessages = this.pendingMessages.concat(msg);
            this.unreadCount += msg.length;
            console.log('📦 消息已缓存，未读计数:', this.unreadCount, '缓存消息数:', this.pendingMessages.length);
          }
        }else{
          // 单个消息处理
          // 简化的消息处理逻辑
          const hasMessageId = data.other && !Array.isArray(data.other) && data.other.msgid;
          
          if(hasMessageId && msg.sender == this.uid){
            console.log('✅ 收到带msgid的自己消息确认，发送者:', msg.sender, '内容:', msg.content);
            console.log('🔄 这是自己消息的确认，查找并更新"发送中"状态');
            let found = false;
            for (let i = 0; i < this.chatList.length; i++) {
              let oitem = this.chatList[i];
              if(data.other.msgid === oitem.msgid && oitem.sender == this.uid && oitem.nickname == '发送中'){
                console.log('✅ 找到"发送中"消息，更新为正确昵称');
                this.$set(this.chatList[i], 'nickname', this.nickname || '我');
                // 清空输入框
                uni.setStorageSync('sendmsg',this.sendmsg);
                this.sendmsg = "";
                this.tmpToButomFlag = false;
                !data.other?.openResult && uni.$socketUtils.send({eventType:"getBalanceInfo"});
                found = true;
                break;
              }
            }
            if(!found) {
              console.log('⚠️ 未找到对应的"发送中"消息，可能是历史消息');
              // 作为新消息处理，继续到统一显示逻辑
            } else {
              // 确认消息处理完成，滚动到底部（只有在用户确实在底部时）
              if(this.isAtBottom && this.swiperCurrent == 0 && !this.isLoadingMore){
                this.toBottom(150, true, false); // 不加载待显示消息，只滚动
              }
              return; // 不添加到聊天列表
            }
          }
          
          if(msg.sender == this.uid && (!data.other || Array.isArray(data.other))){
            // 备用确认机制：自己的消息但没有msgid，尝试按内容匹配更新
            console.log('🔄 备用确认机制：尝试按内容匹配更新消息，内容:', msg.content, '昵称:', msg.nickname);
            let found = false;
            
            // 查找最近的"发送中"消息进行更新
            for (let i = this.chatList.length - 1; i >= 0; i--) {
              let oitem = this.chatList[i];
              if(oitem.sender == this.uid && oitem.content == msg.content && oitem.nickname == '发送中'){
                console.log('✅ 找到匹配的"发送中"消息，更新昵称到:', msg.nickname);
                this.$set(this.chatList[i], 'nickname', msg.nickname);
                found = true;
                break;
              }
            }
            
            if (!found) {
              console.warn('⚠️ 备用确认机制：未找到匹配的"发送中"消息，作为新消息显示');
              // 如果没找到匹配的消息，直接执行显示逻辑
              console.log('🔍 系统回复消息显示判断:', {
                shouldShowImmediately,
                isAtBottom: this.isAtBottom,
                tmpToButomFlag: this.tmpToButomFlag,
                sender: msg.sender,
                content: msg.content
              });
              
              if (shouldShowImmediately) {
                console.log('✅ 立即显示系统回复消息:', msg.content);
                this.$nextTick(() => {
                  this.chatList.push(msg);
                });
              } else {
                console.log('📦 缓存系统回复消息:', msg.content);
                this.pendingMessages.push(msg);
                this.unreadCount += 1;
                console.log('📦 系统回复消息已缓存，未读计数:', this.unreadCount);
              }
              
              // 滚动到底部（只有在用户确实在底部时）
              if(shouldShowImmediately && this.isAtBottom && this.swiperCurrent == 0 && !this.isLoadingMore){
                this.toBottom(150, true, false); // 不加载待显示消息，只滚动
              }
              return; // 处理完成
            } else {
              // 找到了匹配的消息，确认处理完成
              // 清空输入框和重置状态
              uni.setStorageSync('sendmsg',this.sendmsg);
              this.sendmsg = "";
              this.tmpToButomFlag = false;
              !data.other?.openResult && uni.$socketUtils.send({eventType:"getBalanceInfo"});
              
              // 滚动到底部（只有在用户确实在底部时）
              if(this.isAtBottom && this.swiperCurrent == 0 && !this.isLoadingMore){
                this.toBottom(150, true, false); // 不加载待显示消息，只滚动
              }
              return;
            }
          }else{
            // 其他消息处理（包括其他人的消息）
            console.log('🎯 成功进入else分支 - 其他消息处理');
            if(hasMessageId && msg.sender != this.uid) {
              console.log('👥 收到其他人的带msgid消息:', msg.content);
            }
            console.log('🔄 进入其他消息处理分支，msg.sender:', msg.sender, 'this.uid:', this.uid);
            if (msg.sender == this.uid) {
              console.log('🔄 收到自己消息的广播（非确认），内容:', msg.content, '昵称:', msg.nickname);
              // 这是自己消息的广播，检查是否已存在相同内容的消息
              const existingMsg = this.chatList.find(item => 
                item.sender == this.uid && 
                item.content == msg.content && 
                (item.nickname == '发送中' || item.nickname == msg.nickname)
              );
              if (existingMsg) {
                console.log('🔄 找到现有消息，更新昵称从', existingMsg.nickname, '到', msg.nickname);
                // 如果找到"发送中"的消息，更新为正确的昵称
                if (existingMsg.nickname == '发送中') {
                  this.$set(existingMsg, 'nickname', msg.nickname);
                }
                return; // 跳过重复添加
              } else {
                console.log('⚠️ 未找到对应的"发送中"消息，可能是历史消息');
                // 如果没找到对应的"发送中"消息，说明可能是历史消息或页面刷新后的消息
                // 这种情况下正常处理，但不需要特殊逻辑
              }
            } else {
              console.log('👥 收到其他人的消息，发送者ID:', msg.sender, '昵称:', msg.nickname, '内容:', msg.content);
            }
            
            // 其他人的消息或自己的历史消息 - 根据位置决定是否立即显示
            console.log('🔍 消息显示判断:', {
              shouldShowImmediately,
              isAtBottom: this.isAtBottom,
              tmpToButomFlag: this.tmpToButomFlag,
              sender: msg.sender,
              content: msg.content
            });
            
            // 🔧 特殊处理：投注相关消息总是立即显示
            const isBettingMessage = msg.content && (
              msg.content.includes('下单成功') ||
              msg.content.includes('解析失败') ||
              msg.content.includes('余额不足') ||
              msg.content.includes('撤单') ||
              msg.content.includes('流水记录') ||
              msg.content.includes('已收到') ||
              msg.content.includes('申请') ||
              msg.content.includes('投注') ||
              msg.content.includes('下注')
            );
            
            if (shouldShowImmediately || isBettingMessage) {
              console.log('✅ 立即显示消息:', msg.content, isBettingMessage ? '(投注相关消息)' : '');
              this.$nextTick(() => {
                this.chatList.push(msg);
                this.tmpToButomFlag = false;
                
                // 如果是手动重新发送的单个消息，也要强制关闭弹窗并滚动到底部
                if (data.other && data.other.manualResend) {
                  console.log('🔄 手动重新发送单个消息，强制关闭弹窗并滚动到底部');
                  
                  // 强制关闭所有弹窗
                  this.isShowFullScreenPanel = false;
                  this.isShowUserManagementPanel = false;
                  this.isShowRoomSettingsPanel = false;
                  
                  // 延迟滚动，确保弹窗关闭动画完成
                  setTimeout(() => {
                    this.toBottom(200, false, false);
                    // 确保isAtBottom状态正确
                    this.isAtBottom = true;
                  }, 300);
                }
              });
            } else {
              // 不在底部，缓存消息并增加未读计数
              console.log('📦 缓存消息:', msg.content, '原因: shouldShowImmediately =', shouldShowImmediately);
              this.pendingMessages.push(msg);
              this.unreadCount += 1;
              console.log('📦 单个消息已缓存，未读计数:', this.unreadCount, '缓存消息数:', this.pendingMessages.length);
            }
          }
        }
        
        // 🔧 修复：只有用户在底部或刚发送消息时才自动滚动
        // 关键：用户翻看历史记录时不打断
        if(this.isAtBottom && this.swiperCurrent == 0 && !this.isLoadingMore && !this.tmpToButomFlag){
          this.toBottom(150, true, false); // 不加载待显示消息，只滚动
        } else if(this.tmpToButomFlag && this.swiperCurrent == 0 && !this.isLoadingMore){
          // 用户刚发送消息，自动滚动到底部
          this.toBottom(150, true, false);
        } else {
          // 用户不在底部，消息已加载但不自动滚动
          console.log('📌 消息已加载，但用户不在底部，保持当前位置');
        }
        
        if(data.other.openResult && data.other.openResult == 1){
          uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
          setTimeout(function (){
            uni.$socketUtils.send({eventType:"getBalanceInfo"});
          },1000);
        }
        if(data.other.getBalanceInfo && data.other.getBalanceInfo == 1){
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
        }
      });
    },
    
    // 获取余额信息
    onGetBalanceInfo(data) {
      this.safeExecute(() => {
        // 将金额数据转换为整数显示
        const balanceData = data.data;
        if (balanceData) {
          if (balanceData.kmoney !== undefined) balanceData.kmoney = Math.floor(balanceData.kmoney);
          if (balanceData.sy !== undefined) balanceData.sy = Math.floor(balanceData.sy);
          if (balanceData.jetotal !== undefined) balanceData.jetotal = Math.floor(balanceData.jetotal);
          if (balanceData.backWater !== undefined) balanceData.backWater = Math.floor(balanceData.backWater);
        }
        this.balanceInfo = balanceData;
      });
    },
    
    // 房间状态通知
    onRoomStatusNotice(data) {
      this.safeExecute(() => {
        this.balanceInfo.room_status = data.data.room_status;
      });
    },
    
    // 所有彩种时间信息
    onPeriodListOrSingle(res) {
      this.safeExecute(() => {
        let gid = res.gid;
        if (gid && gid > 0) {
          for (let i = 0; i < this.gTimeList.length; i++) {
            if (this.gTimeList[i].gid == gid) {
              let cgame = this.gTimeList[i];
              let ngame = res.data[0];
              this.$set(this.gTimeList[i],'stopstatus', ngame.stopstatus);
              if(cgame.period !== ngame.period){
                this.$set(this.gTimeList[i],'period', ngame.period);
                this.$set(this.gTimeList[i],'djs', ngame.djs);
                this.$set(this.gTimeList[i],'fp', ngame.fp);
                this.$set(this.gTimeList[i],'nowSaleTime', ngame.nowSaleTime);
                this.$set(this.gTimeList[i],'nowSealTime', ngame.nowSealTime);
                this.$set(this.gTimeList[i],'nowOpenTime', ngame.nowOpenTime);
              }
              break;
            }
          }
        } else {
          if(this.gTimeList.length <= 0 || this.gTimeList.length !== res.data.length){
            this.$set(this, 'gTimeList', res.data);
            return;
          }
          for (let i = 0; i < this.gTimeList.length; i++) {
            let cgame = this.gTimeList[i];
            let ngame = res.data[i];
            this.$set(this.gTimeList[i],'stopstatus', ngame.stopstatus);
            if(cgame.period !== ngame.period){
              this.$set(this.gTimeList[i],'period', ngame.period);
              this.$set(this.gTimeList[i],'djs', ngame.djs);
              this.$set(this.gTimeList[i],'fp', ngame.fp);
              this.$set(this.gTimeList[i],'nowSaleTime', ngame.nowSaleTime);
              this.$set(this.gTimeList[i],'nowSealTime', ngame.nowSealTime);
              this.$set(this.gTimeList[i],'nowOpenTime', ngame.nowOpenTime);
            }
          }
        }
      });
    },
    
    // 开奖声音通知
    onOpenKjNotice(gid) {
      this.safeExecute(() => {
        // 检查gid是否匹配当前页面的gid
        if (gid && gid == this.gid) {
          this.playOpenResultSound();
        }
      });
    },
    
    // ========== 开奖声音播放 ==========
    
    // 播放开奖声音
    playOpenResultSound() {
      // 只有会员才能播放开奖语音
      if (this.utype !== 0) {
        return;
      }
      
      // 检查用户是否启用了开奖语音
      let gamekjVoice = parseInt(uni.getStorageSync('gamekjVoice'));
      if (gamekjVoice !== 1 && !isNaN(gamekjVoice)) {
        return;
      }
      
      // 防抖处理：1.6秒内只能播放一次
      let nowTime = new Date().getTime();
      if (nowTime - this.lastPlayTime < 1600) {
        return;
      }
      
      this.lastPlayTime = nowTime;
      
      // 播放开奖声音
      try {
        let audio = uni.createInnerAudioContext();
        audio.src = '/static/wav/kaijiang.mp3';
        audio.volume = 1; // 音量
        audio.sessionCategory = 'playback';
        audio.play();
        
        // 监听播放错误
        audio.onError((err) => {
          console.error('开奖声音播放失败:', err);
        });
        
        // 播放完成后销毁音频实例
        audio.onEnded(() => {
          audio.destroy();
        });
      } catch (error) {
        console.error('创建音频实例失败:', error);
      }
    },
    
    // ========== 聊天记录自动清理功能 ==========
    
    // 启动聊天记录清理检查定时器
    startChatCleanupTimer() {
      // 清除现有定时器
      if (this.chatCleanupTimer) {
        clearInterval(this.chatCleanupTimer);
      }
      
      // 每分钟检查一次是否需要清理聊天记录
      this.chatCleanupTimer = setInterval(() => {
        if (!this.isDestroyed) {
          this.checkChatCleanup();
        }
      }, 60000); // 60秒检查一次
      
      //console.log('🧹 聊天记录自动清理定时器已启动');
    },
    
    // 显示在线用户列表
    showOnlineUserListPopup() {
      this.showOnlineUserList = true;
      this.loadOnlineUserList();
    },
    
    // 加载在线用户列表
    loadOnlineUserList() {
      uni.showLoading({
        title: '加载中...'
      });
      
      this.$u.api.agent.getOnlineUserList({gid: this.gid}).then(res => {
        uni.hideLoading();
        if (res.data && Array.isArray(res.data)) {
          // 处理在线用户余额为整数
          this.onlineUserList = res.data.map(user => ({
            ...user,
            kmoney: Math.floor(user.kmoney || 0)
          }));
        } else {
          this.onlineUserList = [];
          uni.showToast({
            title: '暂无在线用户',
            icon: 'none'
          });
        }
      }).catch(err => {
        uni.hideLoading();
        console.error('加载在线用户列表失败:', err);
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
        this.onlineUserList = [];
      });
    },
    
    // 检查是否需要清理聊天记录
    checkChatCleanup() {
      const now = Date.now();
      const timeSinceLastScroll = now - this.lastScrollTime;
      const shouldCleanup = this.chatList.length > this.maxChatRecords && 
                           timeSinceLastScroll > this.scrollInactiveTime;
      
      if (shouldCleanup) {
        /* console.log('🧹 触发聊天记录自动清理:', {
          消息条数: this.chatList.length,
          最大条数: this.maxChatRecords,
          无滑动时间: Math.round(timeSinceLastScroll / 1000 / 60) + '分钟',
          阈值: this.scrollInactiveTime / 1000 / 60 + '分钟'
        }); */
        
        this.performChatCleanup();
      }
    },
    
    // 执行聊天记录清理
    performChatCleanup() {
      try {
        // 记录清理前的状态
        const beforeCount = this.chatList.length;
        
        // 清空聊天记录
        this.chatList = [];
        
        // 重置分页状态
        this.hasMoreMessages = true;
        this.isLoadingMore = false;
        this.nextLastId = null;
        this.lastScrollPosition = null;
        this.unreadCount = 0;
        
        // 重新加载第一页聊天记录
        this.loadChatRecords();
        
        // 更新最后滚动时间，防止立即再次清理
        this.lastScrollTime = Date.now();
      } catch (error) {
        console.error('❌ 聊天记录清理失败:', error);
      }
    },
    
    // 手动触发聊天记录清理（调试用）
    manualChatCleanup() {
      //console.log('🧹 手动触发聊天记录清理');
      this.performChatCleanup();
    },
    
    // 更新最后滚动时间（在用户交互时调用）
    updateLastScrollTime() {
      this.lastScrollTime = Date.now();
    },
    
    // ========== 性能优化方法 ==========
    
    // 性能监控
    monitorPerformance() {
      try {
        // 更新统计信息
        this.performanceStats.messageCount = this.chatList.length;
        this.performanceStats.timerCount = this.getActiveTimersCount();
        
        // 检查内存使用（如果浏览器支持）
        if (performance.memory) {
          const memoryUsage = performance.memory.usedJSHeapSize;
          
          // 如果内存使用过高，触发清理
          if (memoryUsage > this.performanceConfig.maxMemoryUsage) {
            console.warn('⚠️ 内存使用过高:', Math.round(memoryUsage / 1024 / 1024) + 'MB');
            this.performanceCleanup();
          }
        }
        
        // 检查聊天消息数量
        if (this.chatList.length > this.maxChatRecords * 0.8) {
          console.log('📊 聊天消息接近上限:', this.chatList.length + '/' + this.maxChatRecords);
        }
        
        // 每5分钟输出性能统计
        const now = Date.now();
        if (now - this.performanceStats.lastCleanup > 5 * 60 * 1000) {
          this.logPerformanceStats();
          this.performanceStats.lastCleanup = now;
        }
        
      } catch (error) {
        console.error('❌ 性能监控失败:', error);
      }
    },
    
    // 获取活跃定时器数量
    getActiveTimersCount() {
      const timerNames = ['periodtimer', 'balancetimer', 'chatCleanupTimer', 'scrollDebounceTimer', 'toBottomTimer'];
      return timerNames.filter(name => this[name] !== null).length;
    },
    
    // 输出性能统计
    logPerformanceStats() {
      const stats = {
        聊天消息数量: this.performanceStats.messageCount,
        活跃定时器数量: this.performanceStats.timerCount,
        内存使用: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB' : '不支持',
        页面运行时间: Math.round((Date.now() - this.pageStartTime) / 1000 / 60) + '分钟'
      };
      console.log('📊 性能统计:', stats);
    },
    
    // 性能清理
    performanceCleanup() {
      console.log('🧹 执行性能清理...');
      
      // 清理聊天记录
      if (this.chatList.length > this.maxChatRecords * 0.5) {
        this.performChatCleanup();
      }
      
      // 清理待显示消息
      if (this.pendingMessages && this.pendingMessages.length > 20) {
        this.pendingMessages = this.pendingMessages.slice(-10);
        console.log('🧹 清理待显示消息');
      }
      
      // 强制垃圾回收（如果浏览器支持）
      if (window.gc) {
        window.gc();
        console.log('🧹 执行垃圾回收');
      }
    },
    
    // 防抖的滚动到底部方法
    debouncedToBottom: null, // 将在onLoad中初始化
    
    // 防抖工具方法
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // ========== 原有方法 ==========
    goto(url,type = 0){
      if(!url){
        this.$u.toast('暂未开放');
        return;
      }
      if(type == 1){
        uni.setStorageSync('backUrl','copage/chat');
      }
      uni.$utils.jump(url);
    },
    // 处理浮动面板按钮点击
    handleFloatingAction(action) {
      let item = this.chatList[this.selectedMessageIndex];
      let content = "";
      
      // 提取消息内容
      if(Array.isArray(item.content)){
        for(let c in item.content){
          let con = item.content[c].con.replace(/<[^>]*>/g, '');
          content += con;
        }
      }else{
        content = item.content;
      }
      
      if(action === 'copy'){
        // 使用增强的复制工具类
        this.copyMessageContent(content);
      }else if(action === 'follow'){
        // 跟投功能
        if(content){
          this.sendmsg = content;
          this.sendevent();
          this.hideFloatingActions();
        }
      }
    },
    
    // 复制消息内容到剪贴板
    async copyMessageContent(content) {
      try {
        // 使用增强的复制工具类
        const success = await clipboardUtils.copyText(content, {
          showToast: true,
          toastDuration: 2000,
          enableVibration: true,
          fallbackToManual: true
        });
        
        if (success) {
          // 复制成功，隐藏浮动面板
          this.hideFloatingActions();
        }
        
      } catch (error) {
        console.error('复制失败:', error);
        // 复制失败时，将内容放入输入框方便用户手动复制
        this.sendmsg = content;
        this.hideFloatingActions();
        
        // 显示提示
        uni.showModal({
          title: '复制失败',
          content: '内容已放入输入框，请手动复制',
          confirmText: '我知道了',
          showCancel: false,
          success: () => {
            // 聚焦输入框
            this.$nextTick(() => {
              this.ismsgfocus = true;
            });
          }
        });
      }
    },
    
    // 隐藏浮动操作面板
    hideFloatingActions() {
      this.showFloatingActions = false;
      this.selectedMessageIndex = 0;
      this.longPressPosition = { x: 0, y: 0 };
    },
    
    // 长按消息处理
    onLongPress(index, event) {
      this.selectedMessageIndex = index;
      
      // 触觉反馈
      // #ifdef APP-PLUS || MP-WEIXIN
      uni.vibrateShort({
        type: 'light'
      });
      // #endif
      
      // 获取长按位置
      let touches = event.touches || event.changedTouches;
      if (touches && touches.length > 0) {
        this.longPressPosition.x = touches[0].clientX;
        this.longPressPosition.y = touches[0].clientY;
      }
      
      // 计算浮动面板位置
      this.calculateFloatingActionPosition();
      
      // 显示浮动面板
      this.showFloatingActions = true;
    },
    
    // 计算浮动操作面板位置
    calculateFloatingActionPosition() {
      const systemInfo = uni.getSystemInfoSync();
      const windowWidth = systemInfo.windowWidth;
      const windowHeight = systemInfo.windowHeight;
      const pixelRatio = systemInfo.pixelRatio || 1;
      
      // 将rpx转换为px（面板实际大小）
      const panelWidth = 160 * windowWidth / 750; // rpx转px
      const panelHeight = 60; // 面板高度（px）
      const margin = 10; // 边距
      
      let left = this.longPressPosition.x;
      let top = this.longPressPosition.y - 70; // 在手指上方显示
      
      // 防止超出左边界
      if (left < margin) {
        left = margin;
      }
      
      // 防止超出右边界  
      if (left + panelWidth > windowWidth - margin) {
        left = windowWidth - panelWidth - margin;
      }
      
      // 防止超出上边界
      if (top < this.heightArr.topHeight + margin) {
        top = this.longPressPosition.y + 40; // 显示在手指下方
      }
      
      // 防止超出下边界
      if (top + panelHeight > windowHeight - this.heightArr.bottomHeight - margin) {
        top = windowHeight - this.heightArr.bottomHeight - panelHeight - margin;
      }
      
      // 确保面板显示在消息旁边（优先显示在右侧）
      const messageItem = this.chatList[this.selectedMessageIndex];
      if (messageItem && messageItem.sender !== this.uid) {
        // 别人的消息，显示在右侧
        left = Math.min(this.longPressPosition.x + 50, windowWidth - panelWidth - margin);
      } else {
        // 自己的消息，显示在左侧
        left = Math.max(this.longPressPosition.x - panelWidth - 50, margin);
      }
      
      this.floatingActionStyle = {
        left: left + 'px',
        top: top + 'px'
      };
    },
    touchstart() {
      uni.hideKeyboard();
      this.emojiType = '';
      // 隐藏浮动操作面板
      if (this.showFloatingActions) {
        this.hideFloatingActions();
      }
    },
    parsehtml(text){
      return HtmlParser(text);
    },
    swiperCurrentChange(){
      this.swiperCurrent = 1;
      let that = this;
      setTimeout(function (){
        that.$u.getRect('.bet-footer').then(res => {
          that.heightArr.betBottomHeight = res.height;
        })
      },50);
    },
    topStyle(){
      const style = {marginTop:this.heightArr.topHeight+'px'};
      if(this.swiperCurrent === 0){
        style['marginBottom'] = this.heightArr.bottomHeight+'px';
        style['height'] = this.windowObj.windowHeight-this.heightArr.topHeight-this.heightArr.bottomHeight+'px';
      }else{
        style['marginBottom'] = this.heightArr.betBottomHeight+'px';
        style['height'] = this.windowObj.windowHeight-this.heightArr.topHeight-this.heightArr.betBottomHeight+'px';
      }
      return style;
    },
    completeMoney(){
      let c = 0;
      if(this.tabclassIndex === 0){
        let c1 = this.selectedButtons.length;
        let c2 = this.selectedPlays.length;
        c = c1*c2;
      }else{
        c = this.selectedPlays.length;
      }
      if(c >= 0 && parseInt(this.betMoney) >= 0){
        this.zje = c*this.betMoney;
        this.zCount = c;
      }
    },
    betReset(){
      this.selectedButtons = [];
      this.selectedPlays = [];
      this.betMoney = '';
      this.zje = 0;
      this.zCount = 0;
    },
    bet(){
      if(this.balanceInfo.room_status == 2){
        uni.showToast({title: "当前账号禁言中",icon: 'none'});
        return;
      }
      let str = "";
      if(this.tabclassIndex === 0){
        if(this.selectedButtons.length <= 0 || this.selectedPlays.length <= 0){
          uni.$utils.showToast('请选择玩法');
          return;
        }
        this.selectedButtons = this.selectedButtons.sort((a, b) => a - b);
        //let arr1 = this.selectedButtons.map(item => item + 1);
        let str1 = this.selectedButtons.join('');
        let str2 = this.selectedPlays.join('');
        let str3 = this.betMoney;
        str = str1+"/"+str2+"/"+str3;
        //console.log(arr1,this.selectedPlays)
      }else{
        if(this.selectedPlays.length <= 0){
          uni.$utils.showToast('请选择玩法');
          return;
        }
        //循环数组
        //console.log(this.selectedPlays);
        let parr = {};let garr = [];
        this.selectedPlays.forEach((item,index)=>{
          let tmparr = item.split('-');
          let gname = tmparr[0];
          let pname = tmparr[1];
          //如果tmp中有该元素
          if(!parr[gname]){
            parr[gname] = [];
          }
          parr[gname].push(pname);
        });
        //console.log(parr);
        let arr1 = [];
        for (let key in parr) {
          arr1.push(key+"/"+parr[key].join("")+"/"+this.betMoney);
        }
        arr1 = arr1.sort((a, b) =>  b - a);
        str = arr1.join("#");
        //console.log(str);
      }
      //下注金额判断betMoney
      if(isNaN(this.betMoney) || this.betMoney <= 0){
        uni.$utils.showToast('请输入正确的下注金额');
        return;
      }
      this.tmpToButomFlag = true;
      
      // 创建msgid和"发送中"消息（与普通聊天保持一致）
      let msgid = this.$u.guid(20);
      let msgitem = {avatar:this.avatar,chatType:'text',content:str,nickname:'发送中',sender:this.uid,msgid:msgid};
      this.chatList.push(msgitem);
      this.toBottom(150, true, false); // 用户发送消息，只滚动到底部，不加载历史待显示消息
      
      // 发送下注消息（包含msgid）
      let that = this;
      setTimeout(function (){
        uni.$socketUtils.send({eventType:"gamechat",gid:that.gid,content:str,msgid:msgid});
      },50);
      
      //uni.setStorageSync('sendmsg',str);
      //uni.$socketUtils.send({eventType:"getBalanceInfo"});
      this.selectedButtons = [];
      this.selectedPlays = [];
      uni.$utils.showToast('消息发送成功！');
    },
    selectMoney(money){
      this.betMoney = money;
      this.completeMoney();
    },
    toggleSelection(i) {
      const index = this.selectedButtons.indexOf(i);
      if (index === -1) {
        this.selectedButtons.push(i); // 添加到选中数组
      } else {
        this.selectedButtons.splice(index, 1); // 从选中数组移除
      }
    },
    togglePlay(playname) {
      const index = this.selectedPlays.indexOf(playname);
      if (index === -1) {
        this.selectedPlays.push(playname); // 添加到选中数组
      } else {
        this.selectedPlays.splice(index, 1); // 从选中数组移除
      }
      //console.log(this.selectedPlays);
    },
    onSwiperChange(e) {
      this.swiperCurrent = e.detail.current;
    },
    switchSwiper(){
      this.swiperCurrent = 0;
      this.toBottom(150, true, true); // 用户切换标签页，加载待显示消息
    },
    tabsel(index) {
      if(index !== this.tabclassIndex){
        this.selectedButtons = [];
        this.selectedPlays = [];
      }
      this.tabclassIndex = index;
    },
    // 用户触摸开始 - 标记用户开始交互
    onTouchStart(e) {
      this.lastUserInteraction = Date.now();
      this.isUserScrolling = true;
    },
    // 用户触摸移动 - 更新用户交互时间
    onTouchMove(e) {
      this.lastUserInteraction = Date.now();
      this.isUserScrolling = true;
    },
    scroll(e){
      //console.log(s.scrollHeight,s.scrollTop,s.offsetHeight);
      try{
        let s = this.$refs.chat.$el;
        
        // 如果正在加载更多，完全跳过scroll事件处理，避免任何干扰
        if (this.isLoadingMore) {
          return;
        }
        
        // 更新最后滚动时间
        this.lastScrollTime = Date.now();
        
        const previousIsAtBottom = this.isAtBottom;
        // 🔧 增加容错范围：150px约等于2-3条消息的高度
        // 这样用户在接近底部时也能自动滚动，而不是必须在绝对底部
        this.isAtBottom =  s.scrollHeight - s.offsetHeight - s.scrollTop - s.offsetTop < 150;
        
        // 严格的用户交互检测，避免DOM更新引起的误判
        const now = Date.now();
        if(this.isAtBottom && !previousIsAtBottom){
          // 多重防误判检查：
          const timeSinceLastDetection = now - this.lastBottomDetection;
          const timeSinceUserInteraction = now - this.lastUserInteraction;
          
          // 只有满足以下条件才认为是真正的用户滚动：
          // 1. 距离上次检测超过1秒（防抖）
          // 2. 最近2秒内有用户触摸交互
          // 3. 当前标记为用户滚动状态
          const hasValidScrollGesture = timeSinceLastDetection > 1000;
          const hasRecentUserInteraction = timeSinceUserInteraction < 2000;
          const isConfirmedUserScroll = this.isUserScrolling && hasRecentUserInteraction;
          
          if (hasValidScrollGesture && isConfirmedUserScroll && this.pendingMessages.length > 0) {
            console.log('📥 确认用户主动滚动到底部，加载待显示消息');
            this.lastBottomDetection = now;
            this.unreadCount = 0;
            this.chatList = this.chatList.concat(this.pendingMessages);
            this.pendingMessages = [];
            this.isUserScrolling = false; // 重置用户滚动状态
          } else if (hasValidScrollGesture && isConfirmedUserScroll) {
            // 用户滚动到底部但没有待显示消息，只清零计数
            this.lastBottomDetection = now;
            this.unreadCount = 0;
            this.isUserScrolling = false; // 重置用户滚动状态
            console.log('📥 用户滚动到底部，无待显示消息');
          } else {
            // 疑似系统引起的滚动事件，忽略
            console.log('🚫 忽略系统引起的滚动事件 - 用户交互检查未通过');
          }
        } else if(this.isAtBottom) {
          // 如果已经在底部，只清零计数，不重复加载消息
          this.unreadCount = 0;
        }
        
        // 在滚动结束一定时间后重置用户滚动状态
        clearTimeout(this.scrollResetTimer);
        this.scrollResetTimer = setTimeout(() => {
          this.isUserScrolling = false;
        }, 500);
        
        // 检查是否滚动到顶部附近，用于触发加载更多
        const isNearTop = s.scrollTop < 50; // 减少触发距离，避免过早触发
        if (isNearTop && this.hasMoreMessages && this.chatList.length > 0 && !this.isLoadingMore) {
          // 防抖处理，避免频繁触发
          clearTimeout(this.loadMoreTimer);
          this.loadMoreTimer = setTimeout(() => {
            if (!this.isLoadingMore) { // 二次检查确保不重复触发
              this.loadMoreMessages();
            }
          }, 150); // 减少防抖时间，提高响应性
        }
      }catch (e){}
    },
    // 加载更多消息
    loadMoreMessages() {
      // 严格检查加载条件
      if (this.isLoadingMore || !this.hasMoreMessages || !this.nextLastId) {
        return;
      }
      
      //console.log('触发加载更多消息，当前消息数:', this.chatList.length);
      
      // 更新最后滚动时间（用户主动上拉加载更多）
      this.updateLastScrollTime();
      
      // 立即设置加载状态，防止重复触发
      this.isLoadingMore = true;
      
      // 清除任何待执行的加载定时器
      if (this.loadMoreTimer) {
        clearTimeout(this.loadMoreTimer);
        this.loadMoreTimer = null;
      }
      
      // 记录当前滚动位置，作为后备
      try {
        const chatElement = this.$refs.chat.$el;
        this.lastScrollPosition = {
          scrollTop: chatElement.scrollTop,
          scrollHeight: chatElement.scrollHeight
        };
      } catch (e) {
        console.error('记录滚动位置失败:', e);
      }
      
      this.loadChatRecords(true);
      
      // 记录用户行为 - 已禁用
      // if (uni.$performanceMonitor) {
      //   uni.$performanceMonitor.recordCustomMetric('load_more_trigger', 1, {
      //     type: 'scroll_to_top',
      //     currentMessageCount: this.chatList.length
      //   });
      // }
    },
    gotoSwitchGame(item){
      uni.setStorageSync('cgid', item.gid);
      uni.setStorageSync('ctemplate', item.template);
      uni.$utils.jump('copage/chat',"redirectTo");
    },
    myonkey(name,iswy){
      if(this.balanceInfo.room_status == 2){
        uni.showToast({title: "当前账号禁言中",icon: 'none'});
        return;
      }
      if(iswy == 1){
        this.sendmsg = "";
      }
      if(name === "删"){
        this.sendmsg = this.sendmsg.substring(0,this.sendmsg.length-1);
        return;
      }
      if(name === "重复"){
        this.sendmsg = uni.getStorageSync('sendmsg','');
        return;
      }
      if(name === "闲聊"){
        if(this.roomConfig.banChat == 1 && this.utype == 0){
          uni.showToast({title: "暂未开放闲聊，请联系管理员",icon: 'none'});
          return;
        }
        this.heightArr.bottomHeight = this.heightArr.bottomHeight-this.heightArr.keyHeight;
        this.iskeyshow = false;
        this.heightArr.keyHeight = 0;
        this.$nextTick(() => {
          this.ismsgfocus = true;
          this.toBottom(150, true, true); // 用户点击闲聊，加载待显示消息
        })
        return;
      }
      if(name === "/#"){
        if(this.sendmsg){
          let lastchar = this.sendmsg.charAt(this.sendmsg.length-1);
          if(lastchar === "/"){
            name = "#";
            this.sendmsg = this.sendmsg.slice(0, -1);
          }else if(lastchar === "#"){
            name = "/";
            this.sendmsg = this.sendmsg.slice(0, -1);
          }else{
            name = "/";
          }
        }else{
          name = "/";
        }
      }
      this.sendmsg += name;
    },
    longpressDel(){
      this.sendmsg = "";
    },
    emojiChange(field,nfield) {
      if(this.utype == 1){
        this.$nextTick(() => {this.ismsgfocus = true;})
        return;
      }
      
      // 更新最后滚动时间（用户操作键盘）
      this.updateLastScrollTime();
      
      if (this.emojiType === 'keyboard' || this.emojiType === 'mykeyboard') {
        // 点击了键盘，展示键盘
        //this.ismsgfocus = true;
        uni.hideKeyboard();// 隐藏键盘
        this.ismsgfocus = false;
        this[field] = false;
        this[nfield] = false;
        this.emojiType = '';
        this.heightArr.bottomHeight = this.heightArr.bottomHeight-this.heightArr.keyHeight;
        this.heightArr.keyHeight = 0;
      } else {
        this[field] = true;
        this[nfield] = false;
        this.emojiType = 'mykeyboard';
        this.heightArr.keyHeight = this.keyboardHeight;
        this.heightArr.bottomHeight = this.heightArr.bottomHeight+this.heightArr.keyHeight;
      }
      
      // 只有不是在加载更多时才滚动到底部（键盘操作不加载待显示消息）
      if (!this.isLoadingMore) {
        this.toBottom(150, true, false); // 键盘操作不加载待显示消息，只滚动
      }
    },
    
    // 加载待显示的消息
    loadPendingMessages() {
      if (this.pendingMessages.length > 0) {
        console.log('📥 加载待显示消息:', this.pendingMessages.length, '条');
        // 将待显示的消息添加到聊天列表
        this.chatList = this.chatList.concat(this.pendingMessages);
        // 清空待显示消息缓存
        this.pendingMessages = [];
        // 重置未读计数
        this.unreadCount = 0;
        console.log('✅ 待显示消息已加载，未读计数已重置');
      }
    },
    
    toBottom(duration = 150, smooth = true, shouldLoadPending = false){
      // 如果正在加载更多，不执行滚动到底部
      if (this.isLoadingMore) {
        return;
      }
      
      // console.log('🎯 toBottom被调用:', {duration, smooth, shouldLoadPending, isAtBottom: this.isAtBottom});
      
      // 只有在明确指定时才加载待显示的消息（避免误触发）
      if (shouldLoadPending) {
        this.loadPendingMessages();
      }
      
      // 更新最后滚动时间
      this.updateLastScrollTime();
      
      let that = this;
      setTimeout(function (){
        that.$nextTick(function (){
          let C = that.$refs.chat.$el;  // 获取引用元素
          
          if (!smooth) {
            // 临时禁用平滑滚动
            C.style.scrollBehavior = 'auto';
          }
          
          C.scrollTop = C.scrollHeight;
          
          if (!smooth) {
            // 恢复平滑滚动
            setTimeout(() => {
              C.style.scrollBehavior = 'smooth';
            }, 0);
          }
        });
      },10);
    },
    initTopHeight() {
      this.$u.getRect('.top-height').then(res => {
        this.heightArr.topHeight = res.height;
      })
      this.$u.getRect('.chat-input-bar-container').then(res => {
        this.heightArr.bottomHeight = res.height;
      })
    },
    timerCheck(){
      // 禁用会导致页面重新渲染的状态检测，但保留重连机制
      // this.checkAndSyncWebSocketStatus(); // 这个函数会触发页面重新渲染，暂时禁用
      
      //判断websocket是否连接
      if(!uni.$socketUtils.isOpenSocket){
        //如果没有链接显示顶部提示
        this.showWebSocketError = true;
        
        // 触发重连机制（如果websocketUtils支持且未在重连中）
        if(uni.$socketUtils && typeof uni.$socketUtils.debouncedReconnect === 'function') {
          // 检查WebSocket实际状态，避免误判
          const hasSocketTask = uni.$socketUtils.socketTask;
          const isActuallyConnected = hasSocketTask && 
            (typeof hasSocketTask.readyState === 'undefined' || hasSocketTask.readyState === 1);
          
          // 如果实际上是连接的，修正状态而不是重连
          if (isActuallyConnected) {
            const now = Date.now();
            
            // 防抖：10秒内不重复修正状态，避免频繁修正
            if (now - this.lastStateCorrection < 10000) {
              return; // 最近修正过，跳过本次修正
            }
            
            console.log('🔄 timerCheck发现状态不同步，仅修正状态，不触发事件');
            
            // 静默修正状态，不触发任何事件或回调
            uni.$socketUtils.isOpenSocket = true;
            this.lastStateCorrection = now;
            
            // 只有在真正显示错误提示时才隐藏，避免不必要的DOM变化
            if (this.showWebSocketError) {
              this.showWebSocketError = false;
            }
            
            return; // 修正状态后直接返回，不触发重连
          }
          
          // 检查是否在重连中，如果超过30秒还在重连中，可能重连卡住了，强制重置
          const isReconnectingTooLong = uni.$socketUtils.isReconnecting && 
            (Date.now() - (uni.$socketUtils.lastReconnectTime || 0)) > 30000;
          
          if (!uni.$socketUtils.isReconnecting || isReconnectingTooLong) {
            if (isReconnectingTooLong) {
              console.log('⚠️ 重连超时，强制重置重连状态');
              uni.$socketUtils.isReconnecting = false;
              uni.$socketUtils.reconnectLock = false;
            }
            
            console.log('⚠️ timerCheck检测到WebSocket真正断开，触发重连');
            
            // 强制重置所有可能阻止重连的状态
            const wasBlocked = uni.$socketUtils.isUserClose || !uni.$socketUtils.shouldAutoReconnect || 
                               uni.$socketUtils.disableAutoReconnect || uni.$socketUtils.isUserExitApp;
            
            if (wasBlocked) {
              console.log('⚠️ 重连被阻止，强制重置所有状态', {
                isUserClose: uni.$socketUtils.isUserClose,
                shouldAutoReconnect: uni.$socketUtils.shouldAutoReconnect,
                disableAutoReconnect: uni.$socketUtils.disableAutoReconnect,
                isUserExitApp: uni.$socketUtils.isUserExitApp
              });
              
              // 强制重置所有状态
              uni.$socketUtils.isUserClose = false;
              uni.$socketUtils.shouldAutoReconnect = true;
              uni.$socketUtils.disableAutoReconnect = false;
              uni.$socketUtils.isUserExitApp = false;
              uni.$socketUtils.isReconnecting = false;
              uni.$socketUtils.reconnectLock = false;
            }
            
            // 强制立即重连，跳过防抖
            uni.$socketUtils.debouncedReconnect('timer_check_disconnected', true);
          }
        }
        
        return;
      } else {
        // WebSocket已连接，隐藏错误提示
        this.showWebSocketError = false;
        
        // 轻量级连接健康检查（不触发页面重新渲染）
        this.lightweightHealthCheck();
      }
      if(this.curtime.stopstatus === 1){
        return;
      }
      this.curtime.djs -= 1;
      this.curtime.kjdjs -= 1;
      let fptime = this.curtime.djs;
      let kptime = this.curtime.kjdjs;
      if(fptime >= 0){
        let minutes = Math.floor(fptime / 60);
        let seconds = fptime % 60;
        let timearr = [];
        if(minutes < 10){
          timearr[0] = 0;
          timearr[1] = minutes;
        }else{
          timearr[0] = minutes.toString().split("")[0];
          timearr[1] = minutes.toString().split("")[1];
        }
        if(seconds < 10){
          timearr[2] = 0;
          timearr[3] = seconds;
        }else{
          timearr[2] = seconds.toString().split("")[0];
          timearr[3] = seconds.toString().split("")[1];
        }
        this.curtime.fp = 0;
        this.curtime.timearr = timearr;
        //console.log(fptime,minutes,seconds,this.gamelist[i].timearr)
      }else if(fptime < 0 && this.curtime.kjdjs >= 0){
        let minutes = Math.floor(kptime / 60);
        let seconds = kptime % 60;
        let timearr = [];
        if(minutes < 10){
          timearr[0] = 0;
          timearr[1] = minutes;
        }else{
          timearr[0] = minutes.toString().split("")[0];
          timearr[1] = minutes.toString().split("")[1];
        }
        if(seconds < 10){
          timearr[2] = 0;
          timearr[3] = seconds;
        }else{
          timearr[2] = seconds.toString().split("")[0];
          timearr[3] = seconds.toString().split("")[1];
        }
        this.curtime.timearr = timearr;
        this.curtime.fp = 1;
      }else{
        this.getperiod();
      }
    },
    gitemTimeCheck(){
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
        } else if (fptime < 0 && Math.abs(fptime) < (item.nowOpenTime-item.nowSealTime)) {
          this.gTimeList[i].fp = 1;
        } else{
          if(uni.$socketUtils.isOpenSocket){
            uni.$socketUtils.send({eventType:"periodListOrSingle",gid:item.gid});
          }
        }
      }
    },
    getperiod(){
      let that = this;
      this.$u.api.common.getperiod({gid:this.gid}).then(res => {that.curtime = res.data;}).catch(err => {});
    },
    getRoomConfig(){
      let that = this;
      this.$u.api.common.getRoomConfig().then(res => {
        that.roomConfig = res.data;
        //如果roomStatus为0，那么清理所有数据回到登录页
        if(that.roomConfig.roomStatus == 0){
          uni.reLaunch({
            url: '/pages/common/login'
          });
        }
      });
    },
    quickPlayDetail(){
      let that = this;
      this.$u.api.member.quickPlayDetail({gid:this.gid}).then(res => {that.quickPlayDetailData = res.data;}).catch(err => {});
    },
    loadChatRecords(isLoadMore = false, shouldLoadPending = true) {
      const params = {
        pageSize: this.pageSize,
        gid: this.gid
      };
      
      // 如果是加载更多，添加nextLastId参数
      if (isLoadMore && this.nextLastId) {
        params.lastId = this.nextLastId;
      }
      
      let that = this;
      this.loadStartTime = Date.now(); // 记录开始时间用于性能监控
      
      // 注意：isLoadingMore状态已经在loadMoreMessages中设置了
      
      this.$u.api.common.chatRecords(params).then(res => {
        const newMessages = res.data.list || [];
        const responseNextLastId = res.data.nextLastId; // 服务器返回的下一页lastId
        
        if (isLoadMore) {
          // 加载更多：将历史消息添加到列表前面
          if (newMessages.length > 0) {
            // 记录当前滚动位置信息
            const chatElement = that.$refs.chat.$el;
            const oldScrollHeight = chatElement.scrollHeight;
            const oldScrollTop = chatElement.scrollTop;
            
            // 立即禁用平滑滚动，避免视觉跳跃
            chatElement.style.scrollBehavior = 'auto';
            
            // MySQL查询是desc，需要反转后再添加到前面，确保时间顺序正确
            const reversedHistoryMessages = [...newMessages].reverse();
            that.chatList = [...reversedHistoryMessages, ...that.chatList];
            
            // 同步更新DOM并恢复滚动位置
            that.$nextTick(() => {
              const newScrollHeight = chatElement.scrollHeight;
              const scrollDiff = newScrollHeight - oldScrollHeight;
              const targetScrollTop = oldScrollTop + scrollDiff;
              
              // 立即设置滚动位置，避免闪烁
              chatElement.scrollTop = targetScrollTop;
              
              // 使用单次requestAnimationFrame确保渲染完成后恢复平滑滚动
              requestAnimationFrame(() => {
                // 最终确认滚动位置
                if (Math.abs(chatElement.scrollTop - targetScrollTop) > 2) {
                  chatElement.scrollTop = targetScrollTop;
                }
                
                // 恢复平滑滚动
                chatElement.style.scrollBehavior = 'smooth';
                
                // 标记加载完成
                that.isLoadingMore = false;
                
                //console.log('加载更多完成，滚动位置:', chatElement.scrollTop, '目标位置:', targetScrollTop);
              });
            });
            
          } else {
            // 没有更多消息了
            that.isLoadingMore = false;
          }
        } else {
          // 首次加载：MySQL查询是desc，所以需要反转数组让最旧的消息在前面，最新的在后面
          const reversedMessages = [...newMessages].reverse();
          that.chatList = reversedMessages;
          
          // 首次加载后滚动到底部，根据参数决定是否加载待显示消息
          that.toBottom(150, false, shouldLoadPending);
        }
        
        // 更新nextLastId和hasMoreMessages状态
        that.nextLastId = responseNextLastId;
        that.hasMoreMessages = !!responseNextLastId; // 有nextLastId就表示还有更多消息
        
        // 记录性能指标 - 已禁用
        // if (uni.$performanceMonitor) {
        //   const loadTime = Date.now() - (that.loadStartTime || Date.now());
        //   uni.$performanceMonitor.recordCustomMetric('chat_load_time', loadTime, {
        //     isLoadMore,
        //     messageCount: newMessages.length
        //   });
        // }
      }).catch(err => {
        console.error('加载聊天记录失败:', err);
        if (isLoadMore) {
          // 立即重置加载状态
          that.isLoadingMore = false;
          
          // 如果加载失败，给用户一个重试的机会
          setTimeout(() => {
            that.hasMoreMessages = true;
          }, 3000);
        }
        uni.showToast({
          title: '加载消息失败，请重试',
          icon: 'none'
        });
      });
    },
    keyboardHeightChange(res) {
      if (res.height > 0) {
        if(this.emojiType === 'mykeyboard'){
          this.heightArr.bottomHeight = this.heightArr.bottomHeight-this.heightArr.keyHeight;
          this.iskeyshow = false;
          this.isbuttonsshow = false;
        }
        this.emojiType = 'keyboard';// 键盘展开
        this.heightArr.keyHeight = res.height;
        this.heightArr.bottomHeight = this.heightArr.bottomHeight+this.heightArr.keyHeight;
      }else{
        this.emojiType = '';
        this.heightArr.bottomHeight = this.heightArr.bottomHeight-this.heightArr.keyHeight;
        this.heightArr.keyHeight = res.height;
      }
      
      // 只有不是在加载更多时才滚动到底部（键盘高度变化不加载待显示消息）
      if (!this.isLoadingMore) {
        this.toBottom(150, true, false); // 键盘高度变化不加载待显示消息，只滚动
      }
    },
    sendevent() {
      if(this.sendmsg.length <= 0){
        this.$u.toast('消息不能为空');
        return;
      }
      
      // 更新最后滚动时间（用户发送消息）
      this.updateLastScrollTime();
      
      this.tmpToButomFlag = true;let msgid = this.$u.guid(20);
      let msgitem = {avatar:this.avatar,chatType:'text',content:this.sendmsg,nickname:'发送中',sender:this.uid,msgid:msgid};
      this.chatList.push(msgitem);
      this.toBottom(150, true, false);let that = this; // 用户发送消息，只滚动到底部，不加载历史待显示消息
      setTimeout(function (){
        uni.$socketUtils.send({eventType:"gamechat",gid:that.gid,content:that.sendmsg,msgid:msgid});
      },50);
    },
    backTo() {
      let url = "pages/gamehall/gamehall";
      if(this.utype == 1){
        url = "agent/gamehall/hall";
      }
      //#ifdef H5
      uni.$utils.jump(url);
      //#endif
      //#ifdef APP-PLUS
      uni.$utils.jump(1,"navigateBack");
      //#endif
    },
    betRecordTop() {
      this.$u.api.member.getBetsSumByLotteryId({gid:this.gid}).then(res => {
        if(res.data.length <= 0){
          this.$u.toast("暂无数据");
        }else{
          // 处理注单列表金额为整数
          const processedData = res.data.map(item => ({
            ...item,
            totalMoney: Math.floor(item.totalMoney || 0),
            winLose: Math.floor(item.winLose || 0)
          }));
          this.periodOrderList = processedData;
          this.betRecordShow = !this.betRecordShow;
        }
      }).catch(err => {});
    },
    betRecordTabChange(index){
      if(index !== null && index !== undefined){
        uni.showLoading({title: '加载中'});
        let item = this.periodOrderList[index];
        this.$u.api.member.getLotterySettledList({gid:this.gid,period:item.period}).then(res => {
          // 处理订单详情金额为整数
          const processedOrders = res.data.map(order => ({
            ...order,
            je: Math.floor(order.je || 0),
            winLose: Math.floor(order.winLose || 0)
          }));
          this.periodOrderList[index].orders = processedOrders;
          uni.hideLoading();
        }).catch(err => { uni.hideLoading();});
      }
    },
    dragonTop() {
      this.isshowpredict = false;
      this.isShowOpenList = false;
      this.isclshow = !this.isclshow;
      this.topPanelShow = this.isclshow;
      if(this.isclshow){
        this.$u.api.common.longdragon({gid:this.gid}).then(res => {this.cllist = res.data;});
      }
    },
    predictTop() {
      this.isclshow = false;
      this.isShowOpenList = false;
      this.isshowpredict = !this.isshowpredict;
      this.topPanelShow = this.isshowpredict;
      if(this.isshowpredict){
        this.$u.api.common.lotteryPredictInfo({gid:this.gid}).then(res => {this.predictInfoList = res.data;});
      }
    },
    showOpenListClick() {
      this.isshowpredict = false;
      this.isclshow = false;
      this.isShowOpenList = !this.isShowOpenList;
      this.topPanelShow = this.isShowOpenList;
      // if(this.isShowOpenList){
      //   this.$u.api.common.resultByDate({gid:this.gid}).then(res => {this.openresultlist = res.data.records;});
      // }
    },
    siteTo() {
      //#ifdef H5
      window.open(siteConfig.kjwurl)
      //#endif
      //#ifdef APP-PLUS
      plus.runtime.openURL(siteConfig.kjwurl)
      //#endif
    },
    customerTo() {
      let url = "copage/custChat";
      if(this.utype == 1){
        url = "agent/nearchat/nearchat";
      }
      uni.setStorageSync('backUrl','copage/chat');
      uni.$utils.jump(url);
    },
    switchGame() {
      this.isShowSwitchPannel = !this.isShowSwitchPannel
    },
    showFullScreenPanel() {
      console.log('🎯 点击打单配置按钮，当前状态:', this.isShowFullScreenPanel);
      this.isShowFullScreenPanel = !this.isShowFullScreenPanel;
      console.log('🎯 弹窗状态已切换为:', this.isShowFullScreenPanel);
    },
    showUserManagementPanel() {
      console.log('👥 点击用户管理按钮，当前状态:', this.isShowUserManagementPanel);
      this.isShowUserManagementPanel = !this.isShowUserManagementPanel;
      console.log('👥 用户管理弹窗状态已切换为:', this.isShowUserManagementPanel);
    },
    closeUserManagementPanel() {
      console.log('👥 关闭用户管理弹窗');
      this.isShowUserManagementPanel = false;
    },
    switchUserTab(tab) {
      console.log('👥 切换用户管理标签页:', tab);
      this.currentUserTab = tab;
    },
    showRoomSettingsPanel() {
      console.log('🏠 点击房间设置按钮，当前状态:', this.isShowRoomSettingsPanel);
      this.isShowRoomSettingsPanel = !this.isShowRoomSettingsPanel;
      console.log('🏠 房间设置弹窗状态已切换为:', this.isShowRoomSettingsPanel);
    },
    closeRoomSettingsPanel() {
      console.log('🏠 关闭房间设置弹窗');
      this.isShowRoomSettingsPanel = false;
      // 重置页面状态
      this.currentRoomSettingsPage = 'main';
      this.roomSettingsPageStack = ['main'];
    },
    
    // 获取当前页面标题
    getRoomSettingsPageTitle() {
      const titles = {
        'main': '房间设置',
        'gameset': '游戏设置', 
        'msgset': '消息设置',
        'soundset': '通知铃声',
        'modifypwd': '修改密码'
      };
      return titles[this.currentRoomSettingsPage] || '房间设置';
    },
    
    // 弹窗内部导航
    handleRoomSettingsInternalNavigate(url) {
      console.log('🏠 房间设置内部导航:', url);
      
      // 解析URL，提取页面类型
      let pageType = 'main';
      if (url.includes('gameset')) {
        pageType = 'gameset';
      } else if (url.includes('msgset')) {
        pageType = 'msgset';
      } else if (url.includes('soundset')) {
        pageType = 'soundset';
      } else if (url.includes('modifypwd')) {
        pageType = 'modifypwd';
      }
      
      // 添加到页面栈
      this.roomSettingsPageStack.push(pageType);
      this.currentRoomSettingsPage = pageType;
      
      console.log('🏠 页面栈:', this.roomSettingsPageStack);
    },
    
    // 在房间设置弹窗内返回上一页
    goBackInRoomSettings() {
      console.log('🏠 房间设置返回，当前栈:', this.roomSettingsPageStack);
      
      if (this.roomSettingsPageStack.length > 1) {
        // 移除当前页面
        this.roomSettingsPageStack.pop();
        // 切换到上一页
        this.currentRoomSettingsPage = this.roomSettingsPageStack[this.roomSettingsPageStack.length - 1];
        
        console.log('🏠 返回到页面:', this.currentRoomSettingsPage);
      }
    },
    
    // 打开完整页面
    openFullPage() {
      const pageMap = {
        'gameset': 'agent/roomset/gameset',
        'msgset': 'agent/roomset/msgset',
        'soundset': 'agent/roomset/soundset',
        'modifypwd': 'agent/common/modifypwd'
      };
      
      const url = pageMap[this.currentRoomSettingsPage];
      if (url) {
        console.log('🏠 打开完整页面:', url);
        this.handleRoomSettingsNavigate(url);
      }
    },
    
    // 游戏设置保存成功回调
    onGameSettingsSaved() {
      console.log('🎮 游戏设置保存成功');
      // 可以在这里添加一些反馈，比如显示成功提示
      // 或者刷新相关数据
    },
    
    handleRoomSettingsNavigate(url) {
      console.log('🏠 房间设置导航（外部跳转）:', url);
      // 关闭弹窗并跳转，传递返回地址参数
      this.closeRoomSettingsPanel();
      
      // 在URL中添加返回地址参数
      const returnUrl = encodeURIComponent('copage/chat');
      const separator = url.includes('?') ? '&' : '?';
      const urlWithReturn = `${url}${separator}returnUrl=${returnUrl}`;
      
      uni.$utils.jump(urlWithReturn);
    },
    
    closeBettingCenter() {
      console.log('🚪 关闭打单中心弹窗，设置保护标志');
      this.isBettingCenterClosing = true; // 标记正在关闭
      this.isShowFullScreenPanel = false;
      
      // 同时设置WebSocket的弹窗关闭标志
      if (uni.$socketUtils) {
        uni.$socketUtils.isBettingCenterClosing = true;
      }
      
      // 500ms后重置标志，避免影响后续正常操作
      setTimeout(() => {
        this.isBettingCenterClosing = false;
        if (uni.$socketUtils) {
          uni.$socketUtils.isBettingCenterClosing = false;
        }
        console.log('🔄 打单中心关闭保护标志已重置');
      }, 500);
    },
    // 处理添加配置事件
    handleAddConfig() {
      console.log('🔧 处理添加配置事件');
      // 关闭快捷导航弹窗
      this.isShowFullScreenPanel = false;
      // 跳转到添加配置页面，传递正确的返回地址
      const backUrl = 'copage/chat';
      const addUrl = 'agent/manage/outbet/addconfig?from=' + encodeURIComponent(backUrl);
      console.log('🔧 准备跳转到添加页面:', addUrl);
      
      try {
        uni.$utils.jump(addUrl);
        console.log('🔧 添加配置跳转成功');
      } catch (error) {
        console.error('🔧 添加配置跳转失败:', error);
        uni.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
      }
    },
    
    
    // 处理编辑配置事件
    handleEditConfig(item) {
      console.log('🔧 处理编辑配置事件:', item);
      
      // 显示加载提示
      uni.showLoading({ title: '正在跳转到编辑页面...' });
      
      // 延迟关闭弹窗和跳转，让用户看到反馈
      setTimeout(() => {
        // 关闭快捷导航弹窗
        this.isShowFullScreenPanel = false;
        // 跳转到编辑配置页面，传递正确的返回地址
        const backUrl = 'copage/chat';
        const jumpUrl = 'agent/manage/outbet/addconfig?id=' + item.id + '&from=' + encodeURIComponent(backUrl);
        console.log('🔧 准备跳转到编辑页面:', jumpUrl);
        
        // 尝试多种跳转方式
        try {
          // 方式1：使用uni.$utils.jump (注意：jump方法会自动添加/前缀)
          console.log('🔧 尝试使用 uni.$utils.jump 跳转');
          uni.$utils.jump(jumpUrl);
        } catch (error) {
          console.error('🔧 uni.$utils.jump 跳转失败:', error);
          
          // 方式2：直接使用uni.navigateTo
          try {
            console.log('🔧 尝试使用 uni.navigateTo 跳转');
            uni.navigateTo({
              url: jumpUrl,
              success: (res) => {
                console.log('🔧 uni.navigateTo 跳转成功:', res);
              },
              fail: (err) => {
                console.error('🔧 uni.navigateTo 跳转失败:', err);
                
                // 方式3：使用uni.redirectTo
                console.log('🔧 尝试使用 uni.redirectTo 跳转');
                uni.redirectTo({
                  url: jumpUrl,
                  success: (res) => {
                    console.log('🔧 uni.redirectTo 跳转成功:', res);
                  },
                  fail: (err) => {
                    console.error('🔧 uni.redirectTo 跳转失败:', err);
                    uni.showToast({
                      title: '跳转失败，请重试',
                      icon: 'none'
                    });
                  }
                });
              }
            });
          } catch (error2) {
            console.error('🔧 所有跳转方式都失败:', error2);
            uni.showToast({
              title: '跳转失败，请重试',
              icon: 'none'
            });
          }
        }
        
        uni.hideLoading();
      }, 500);
    },
    msgOrderDetail(item,orderShowTtype){
      this.orderShowTtype = orderShowTtype;
      this.msgOrderDetailShow = true;
      // 处理订单详情金额为整数
      if (Array.isArray(item)) {
        this.msgOrderList = item.map(order => ({
          ...order,
          a: Math.floor(order.a || 0),
          y: Math.floor(order.y || 0)
        }));
      } else {
        this.msgOrderList = item;
      }
    },
    // ========== 页面显示逻辑 ==========
    
    // 提取onShow的逻辑到单独方法，避免直接调用生命周期钩子
    initializePageShow() {
      console.log('🔄 initializePageShow被调用');
      if(this.isFirstLoad){
        this.isFirstLoad = false;
        console.log('🔄 首次加载，确保WebSocket连接正常');
        
        // 首次加载时，检查WebSocket状态，如果未连接则强制连接
        if (!uni.$socketUtils.isOpenSocket) {
          console.log('🔌 首次加载检测到WebSocket未连接，强制初始化连接');
          // 重置所有可能的阻止标志
          uni.$socketUtils.isUserClose = false;
          uni.$socketUtils.shouldAutoReconnect = true;
          uni.$socketUtils.disableAutoReconnect = false;
          uni.$socketUtils.isUserExitApp = false;
          uni.$socketUtils.isReconnecting = false;
          uni.$socketUtils.reconnectLock = false;
          
          // 立即初始化连接
          // ✅ 修复：第三个参数才是isManualCall，不要传url参数
          uni.$socketUtils.initConnection(null, null, true);
        }
        return;
      }
      if(this.previewImageFlag){
        this.previewImageFlag = false;
        return;
      }
      
      // 防闪烁检查：如果打单中心正在关闭，跳过页面显示初始化
      if (this.isBettingCenterClosing) {
        console.log('🚫 打单中心正在关闭，跳过页面显示初始化');
        return;
      }

      //先清理
      this.clearAllTimers();
      this.clearWebSocketListeners();
      
      // 确保组件未被标记为销毁
      this.isDestroyed = false;
      
      // 重置reloadflag，确保后续重连能正常加载历史记录
      this.reloadflag = false;
      
      this.chatList = [];
      this.loadChatRecords();

      // 重新绑定事件监听器（防止某些情况下丢失）
      this.bindWebSocketListeners();
      
      if(!this.periodtimer){
        this.getperiod();
        this.getRoomConfig();
        this.utype == 0 && this.quickPlayDetail();
        this.periodtimer = setInterval(() => {
          if(!this.isDestroyed){
            this.timerCheck();
            this.gitemTimeCheck();
          }
        },1000);
      }
      
      // 确保清理旧的定时器，防止重复创建
      if(this.balancetimer){
        console.log('🧹 清理已存在的balancetimer');
        clearInterval(this.balancetimer);
        this.balancetimer = null;
      }
      
      if(!this.balancetimer){
        // 房主账号查询更复杂，微调查询间隔
        const queryInterval = this.utype === 1 ? 10000 : 8000; // 房主10秒，会员8秒
        console.log(`🕐 设置定时查询间隔: ${queryInterval/1000}秒 (用户类型: ${this.utype})`);
        this.balancetimer = setInterval(() => {
          console.log(`⏰ 定时器触发 - 类型:${this.utype}, ID:${this.balancetimer}`);
          if(!this.isDestroyed && uni.$socketUtils.isOpenSocket){
            // 房主账号分散发送消息，避免复杂查询同时触发
            if (this.utype === 1) {
              uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
              setTimeout(() => {
                uni.$socketUtils.send({eventType:"periodListOrSingle"});
              }, 200);
              setTimeout(() => {
                uni.$socketUtils.send({eventType:"getBalanceInfo"});
              }, 400);
            } else {
              // 普通会员正常发送
              uni.$socketUtils.send({eventType:"getBalanceInfo"});
              uni.$socketUtils.send({eventType:"periodListOrSingle"});
              uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
            }
            this.getRoomConfig();
          }
        }, queryInterval);
      }
      
      // 重新启动聊天记录清理定时器
      this.startChatCleanupTimer();
    },
  }
}
</script>

<style lang="scss" scoped>

/* WebSocket连接状态提示栏 */
.websocket-notice {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(90deg, #ff6600, #ff8800);
  padding: 10rpx 0;
  animation: websocket-notice-slide 0.3s ease-out;
  
  .notice-content {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20rpx;
    
    .notice-text {
      color: white;
      font-size: 28rpx;
      font-weight: 500;
      margin: 0 15rpx;
    }
    
    .notice-action {
      color: white;
      font-size: 26rpx;
      background: rgba(255, 255, 255, 0.2);
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  }
}

@keyframes websocket-notice-slide {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

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

.red{color: #ff5252 !important;}
.green{color: #81c784 !important;}
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
            /* 优化渲染性能，减少重排重绘 */
            contain: layout style paint;
            will-change: scroll-position;
            transform: translateZ(0); /* 启用硬件加速 */
          }
          
          .chat-list.loading-more {
            scroll-behavior: auto !important;
            /* 加载时优化渲染 */
            contain: strict;
          }
          
          /* 聊天项包装器优化 */
          .chat-item-wrapper {
            /* 减少重绘和重排 */
            contain: layout style paint;
            will-change: auto;
            /* 为每个聊天项启用合成层，减少重绘影响 */
            transform: translateZ(0);
            /* 优化图片渲染 */
            image-rendering: optimizeQuality;
            /* 防止内容跳跃 */
            min-height: 60rpx;
          }
        }
      }
    }
  }
}

/* 第二个sipwer */
.bet-content {
  position: relative;
  .bet-box {
    position: relative;
    .odds-box {
      display: flex;
      justify-content: space-between;
      border-top: 1rpx solid #ddd;
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
              background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABmFBMVEVHcEwAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QEm80BmMlSwORIv+MAh7QAh7T7+/sAj74AkL/x+fsElcQKmsj6+/v4+vsCksGP2O/m9vsAj78Hl8ae3vIBkcDU8fvX8vsDk8INnMt60Ov1+vsZpNEBkL8ToM7f9ftgxeZ90eyX2/FSwOMElMOd3vJOvuIQnsyg3/Jexea76ffw+ftWweSo4fTK7vm05vbY8/tjx+eq4/RMveEsrtiO2O9qyuje9fs/t97F7Pkmq9YOncsnrNYiqdUapNEMm8lZw+QxsdoGlsU3tNvs+PsVoc/V8fsrrthHu+Aqrden4fQYo9AXo9ALm8mR2fC+6fe/vVYBAAAAPnRSTlMAt6+sBgoBVVoDCwenwAIJubarsQQIqp+dnMIMw8QOvri8ta2iu7qpvQW0pMGepbOjoZqZlhaYDS12b8K8HluN5CkAAAHtSURBVEjHndRnc9NAEIdxA5KwCIQaCCQBQu+9l31OrrFNGkkIvffeewn9a+eFZSex7zT27jvN7G9Oc/ffTaVUtf6E0vWlVe54n6hgT6+oYE+vqOCidaKCVdc+9PeICvpLRAXrrk3obxAV9HeICvr9ooL+VlFBf5uo4NJlooKNrlXYtVFUsGueqGBHs2sJdiwXFfRsrgXobRIV9HaJCnr7RQW9laKCbpcMvfmigkkuCXqbXWji95+yG3oLXK74C/6dcrmdThcNAJxxuFUrXM6cB+B02+4jAP9PWl242ummAJispJNcuVJudJ/yAKW/xgbD7dWu3DBDubnuXQEgc8HY3jFcHLcNAEMjs914BmBs3NgCUHdyG+ByNONGvwIUfhpbcsJ99cYnANw1te9cCYAvxha5cPfMnw3eA8i/jeXn7wBcN7ashgdm30X2BUDmjYiIjLwC4LmxhTzcMvcSb2QAHmZFpPgYgEuRbTrCg43P9hSAm1EcUM4N2sYqXNMclFsAXIwD+qBom0eLE4muVU8C4H7WNside63hvDpMrSYrtg3Q2e2I9eid2JU+GAsMup3z8DpPLaDNMFjrXkvmCsDYe2NZVklOJHoGhR/GsuWCQ5JYEy8ffTOW9RgclvYrnUoFx0QFgyOig0cXqursNHwUdHG6t/mpAAAAAElFTkSuQmCC);
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

/* 底部 */
.chat-input-bar-container{
  width: 100%;
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
          .key-board-ul-li:nth-child(8) {color: #ff5252}
                      .key-board-ul-li:nth-child(12) {color: #81c784}
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
      background-color: #ff5252;
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
  background: linear-gradient(270deg, #0087b4, #006699);
  height:var(--status-bar-height);
}
/**头部css**/
.header-bar {
  background: linear-gradient(270deg, #0087b4, #006699);
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
        .span1.green {color: #81c784; font-weight: 600; text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.5);}
        .span1.red {color: #ff5252; font-weight: 600; text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.4);}
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
/* 注单列表 */
.bet-history-box{
  .text.red{color: #ff5252;}
  .text.green{color: #81c784;}
  .text.blue{color: #0087b4;}
  .bet-list-item {
    height: 101rpx; /* 1.333333rem */
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 30rpx; /* 0.4rem */
    .item-up{
      display: flex;
      word-wrap: break-word;
      justify-content: space-between;
      .strong{
        font-size: 29rpx;
        color: #5b5b5b;
        font-weight: bold;
      }
    }
    .item-down{
      display: flex;
      justify-content: space-between;
      color: #828282;
      font-size: 24rpx;
      padding-top: 6rpx;
    }
  }
  .bet-detail{
    max-height: 405rpx;
    .bet-item{
      font-size: 26.4rpx;
      display: flex;
      height: 81.6rpx;
      align-items: center;
      justify-content: space-between;
      padding: 0 30rpx;
      background-color: #f5f5f5;
      border-bottom: 2rpx solid #e6e6e6;
      .left,.status {
        font-weight: 600;
        flex: 1;
      }
      .time{
        flex: 1;
        text-align: center;
        /*min-width: 300rpx;*/
        -ms-flex-negative: 0;
        flex-shrink: 0;
      }
      .text{
        font-size: 28rpx;
        font-weight: 500;
        flex: 1;
        text-align: right;
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
.icon-to-bottom {
  position: fixed;
  z-index: 100;
  width: 40px;
  height: 40px;
  right: 15px;
  border-radius: 50%;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAMAAAC8EZcfAAABqlBMVEVHcEw2Njb5+fkwMDA7Ozv4+Pj6+vr19fVCQkL39/cuLi78/PwvLy8xMTE1NTX8/PwvLy8wMDDf39+9vb2pqanU1NTv7++zs7MuLi4xMTErKystLS0uLi4xMTEsLCz6+vr6+vr29vb9/f38/Pzs7Oz8/Pzw8PDc3NyGhoZubm55eXnz8/P6+vrY2NjCwsLY2Njz8/Pz8/Ph4eH09PTt7e3r6+vPz8/5+fmBgYFPT0+5ubnw8PD4+Pi8vLzv7+/y8vL6+vrb29v19fX29vafn5/7+/u4uLj8/Pzs7Ozs7Ozn5+eRkZH19fW/v7/j4+Pp6enm5ubz8/Pk5OSurq6bm5vKyspfX1/X19f39/fp6enQ0NBVVVXo6OjGxsadnZ2xsbG/v7/U1NT6+vrd3d319fU+Pj76+vqnp6f4+Pj4+Pj19fXt7e2tra3o6Oj09PRcXFzf39/MzMyvr6/Ozs6/v7/y8vLQ0NDu7u7w8PDX19fv7+/l5eXu7u7z8/Ph4eHf399QUFCioqLi4uKsrKz4+Pjq6urp6en39/ft7e3v7++EhIT39/f8/PympqZRj4lKAAAAjXRSTlMACdMMBtPR1QPUGM4SFA7PEB/f8f3l2PcbGh0hJCcjzqHRy8isv5aCOC8KwsMrH+PHnY2mdZ5OuRgtV1KOWqm4ln9vzkGwFrpE2txCsC2VpJyJfEI3JCNCyy1hFZBnRlRLMpAlxSN9DoVxyD9NP3IMOOn56PC/d7a6R6BqhoBteSBJVzS8iJi0Oao0Yar1uaHpAAAJ+0lEQVR42uXd93vTRhgH8DiOa6pYxoaGRo6DPLMTMkhCM8gmtMxSoJRdoOzVvfce/p97956kOw3bNyQ5fXq/EfrA5/m+dyfprXR0df1Pxj7f2MO0vcNkID2+0XElQxu7e/Lv+yvrpX8W65VKffGf0vrK/b9P3h1jmJ3RIcCDJ4/u7FT2B47Kzp1HTx44yvh1Y39slhxbr2c4ytLmH2NxGm3dg+X1Kit7xTNYZ3V9+UFMRruyzx5WHdwrLYaDrD58Ztc6et6lR7uWjrV0u4ZHif/73UeXoiVavLsPK26dbUoxw+skxsrDu9ERLd57K72szidzDxYJxt6V9yIiWrw7bHjU9mrgoEo2xjsWMQLeifuQnlvHgNLO8CoZI/oT7p8Im0h8y3WHZ+l8MO9gkLYRE+vLoQoJb7LE8Kgu3XawRodYmgyPCL6xzYqLx6vzGCmxsjkWjpDEN+XER3lpoeEmQohTYYRIfE/qXl5aYniJ9SfqQnJP8BzFp8zzE/fvf07uIhR9J0pMfCo8SnRCLJ1QEpLpt0N8YfA8RCTcmVIQkt1l1yovqW46hGHVmZR5d1JaCL6XE2x86ZAGG+LES0kh9iVOVqPwuYXVkwkZIfFViC9kHiWCsCIjBN/LamQ+l7D6UlgIvkmYf93R+Jgyo3k4KSgE39QunX7pSAadiLtTQkKyP+/Q/NLpaIW9vTsiOzb4XpSi97HC0gtuIfgSz+PwscLnCV4h+J7F42OFz0DIu0Dqzv6STscgxAulzrdQwIcmYFw+Rlh6wSOEAm/G6GOEmxxFJju02RujzxH2mu33a/AlS2SBxOUDISyUUrKdEAq8HGuBXUVeblNkCPBYPW4fFdaPtYyQFPjb3th9dBp+27LIUOD3TQgwXh+ZhugvNt9vUWQS4HonAqQRrreIkAQY9wr2ruTmEZIAVzpSYKbIK00jhADPmB0pMFNk80yTCEmAb3csQCfCt5tECAFe6lyANMJLwRFCgEc7GKAT4VGIMDDA7C8dDNCJ8JdsUIQQ4LsdDdCJ8N2ACCFAvER4AnzzyAE5wJEjh3gixMvEK4QAj1W5AnzrtUbjoATv0OuNxkeHOCKsHvNHCMCf+AI82GjICLGv0fiYJ8KffECyRGb4ZiAAhYXE1/iQZxbO+JYJBHiNr8LpAw0JoeV77U0eYPWaN0J7DfPtMX3iQtt3gG+n8a5jUuGj3HuMsJDXZ0d41FNjCDA3x78JCgr5fRZwLueOkGwypsBVREgo4LNqbLo3GlLhL4WuIgJCEZ8d4ZeuGkOAAlNQTCjmcyYhGyGZgkOC9wmcQkGfVeOhnA+Y+R2AAlsHl1DUh4QY+HvGC8xeM4VvZDiE4j5SY/NalgLxGklmz0jcabUVSvisSXgmm3RWCZmCCzJPm22EMj7r+XOBmYQE+LXUvXRLoZTPWiVfe4GZb0TXSFuhnM9aJd9kvMAhyZv9pkJZH5mEQx5gNjMj+zTSRCjtI8CZjLOMyYUuMyf9uBQolPcR4FzGudiRXUY/Lf88FyBU8BHgad3ZZ8iVWF9U6Gn5hCo+ss8s6s7VmOwy+oTKE7tHqOQj+8yEnvMATaldJlCo5iP7jBkykBWq+poAJ9SAVKjsSweXeFER6AiVfQBc9AFPqwJtobIPgKd9wDllICNU8gFwzgec4Qc27W71tfG1624xwBkfcIgb2KK71dfKx9HdosAhH/BXbmCr7lZfa1+77hYF/uoDficGbCY8cPCTtxS6Ww7wOx9wgftSF2V3y7nULXiAWf1n/puFCLtbzs3Cz66bBXS7lTFM/ruZCLtbFtA0MuztFr5h1dai6czIdWfWNHrDat3ya0ORdGYkuzNDGr3ltx6atAvdEXRmJLsz3Rc031OdtiB2rYuqu0V2mQUfMKdfNsVuqSPqbsEuY17WfZ0FXTsu+FASVXcLVfi45gHifUb7fu90t77XMkzzyF7Gt/dOd+s2u4idVfKDKXxHGEl3C03BH7SMvwWsG1+lwu2/yXbfUl8Zur8FnNW1q92h9t+ku2/dVzXd20SHSXj5isSje9jdLQS8cpm90DGT0LieCk8o70tdN9xTkO6Et6XaM6F2t8ga1v3/KwxqXBgPq4ep0r0cL3grTGt8IRWOUMWXuuCrMK3xRTOULqtSd9W86KswrXH/9TC6rGrd1ev9/grbNdaNiyl1oZovddHQM03e+kB7deE35T6wYvf3t4Jnl2Zf7EE1fielKlTzpd7phyUS9OoRLJPCvGqnWq07PV8IWCKuZSIfoXJ3yw4w8OUyGuGsci9doXs+2yxAJsLRe6pCed+90aYBWq+I4givKryg16fQvUTAq06A+7qaR5j/U0HYtLvF4/sz3zxANsJtszNvAZvbrQKkERr5jc686L2RN1oEaEeIi/zB8U68Kn/8A1zgVl8bWJcTVOS/7sUPvPcXKnDgRSQgwvxS/J9rLOXbBcisk/78cNwfvAwjX6sV4i1yrNMQJmDbAruKbORH1+IEro3CCk5yfhYG03BkPL7P1sZHOCYgW2SYhtuP4/rw7/G2PQF7OL5MRBGi7RpNw/zTrXg+ndx6mscTMJvg/7gTpmFhYLUcx8en5dWBgsFZYFpkWCgDq1vRf767tTpgL5Aezu+LGeHTx1F/AP34KesT+EQ7mQPh9ni0n5CPb4MvJ+Bjhf35gZG1KD/CXxsZwBuMmM9eynizQRmO1qI7xqA2ivPDG4zMQQt2lQeHozoIYnjQrq/cURVEWMgfXpqO4iiN6aXD+YKkzyscqYV/GEltRMXnCNFug5dKcaMc7nEu5Y0iXh6wvyTkD5yB/VAH4c1amAfi1G6CTxfa/1oIcZmLN6bDOlJo+kYRyqvmo8KcVebR2XAOZZodtcqbU/PZQqvMBUT8cV79WKv5HxGvYJU3EcbBW5YQh3i4ePO82sFg528WD0N8ofjso9USSbTfwExExFNny7JHq5XPnsI8mH25pFXeUA5/gxDxTMR1Lo4Mj8scTjc+PFIk1dUyNL6wzs9DIZI6Q4qDt85eETve78rZW4OQnlXdZCLkAwghxBxDfOPGuS3eAxK3zt14g+HlQoyvGZEYb23Uyu2OmCzXNm4RXWQ8R0iJhmVEyKXh+S/KwYd0lr+YH15COEtnMLyozhGFqZjLuIzFwcHBU6ufzZ4/V/v80+lyefrTz2vnzs9+tnoK/UbRpcO8ZCQ85hTgBCwXTCTG/AAoMdM1imBDOKLDPKxL9ER+li0hkhjRfAQkUiInHkiFB/51HnD9mkbDS/TEchowItpGQBoGYoKTjgKiGQbgHF0ivvOUbSNGWkqA2sP6AbYhnKPrie1EamrESKxETPfAP8sBzqWL9VBvMGIkZmIoHfjX8BuJ2HVeI1FaTmaQn7In4HfFPLwn8idcw3s6f1dHxt7+hwMClPv+U/9CRNf/ZPwL+6IcPUObdoIAAAAASUVORK5CYII=);
  background-size: contain;
  transition: all .3s;
  bottom: 170rpx;
  .unread-message {
    position: absolute;
    right: 0;
    background-color: red;
    min-width: 32rpx;
    height: 32rpx;
    line-height: 32rpx;
    border-radius: 50%;
    font-size: 20rpx;
    text-align: center;
    color: #fff;
    letter-spacing: 0;
  }
}

/* 加载更多指示器样式 */
.loading-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15rpx 0;
  background-color: transparent;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

.no-more-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15rpx 0;
  background-color: #f8f8f8;
  border-bottom: 1rpx solid #e5e5e5;
}

.no-more-text {
  font-size: 24rpx;
  color: #ccc;
  position: relative;
}

.no-more-text::before,
.no-more-text::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 60rpx;
  height: 1rpx;
  background-color: #e0e0e0;
}

.no-more-text::before {
  left: -80rpx;
}

.no-more-text::after {
  right: -80rpx;
}

/* WebSocket连接状态通知栏样式 */
.websocket-notice {
  background: linear-gradient(135deg, #ff6600, #ff8800);
  color: #fff;
  padding: 15rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 10rpx rgba(255, 102, 0, 0.3);
  position: relative;
  z-index: 10;
}

.notice-content {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: notice-pulse 2s infinite;
  cursor: pointer;
}

.notice-text {
  margin-left: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #fff;
}

.notice-action {
  margin-left: 24rpx;
  font-size: 26rpx;
  color: #fff;
  border: 1rpx solid #fff;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.websocket-notice:active .notice-action {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0.95);
}

@keyframes notice-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* 浮动操作面板样式 */
.floating-action-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 998;
  background: transparent;
}

.floating-action-panel {
  position: fixed;
  z-index: 999;
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25rpx;
  padding: 8rpx;
  backdrop-filter: blur(15rpx);
  box-shadow: 0 6rpx 30rpx rgba(0, 135, 180, 0.15), 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  animation: floating-action-show 0.2s ease-out;
}

@keyframes floating-action-show {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.action-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 20rpx;
  margin: 0 4rpx;
  border-radius: 20rpx;
  min-width: 60rpx;
  transition: all 0.2s ease;
  position: relative;
}

.action-button:active {
  transform: scale(0.95);
  opacity: 0.9;
}

.copy-btn:active {
  box-shadow: 0 1rpx 4rpx rgba(76, 175, 80, 0.5);
}

.follow-btn:active {
  box-shadow: 0 1rpx 4rpx rgba(33, 150, 243, 0.5);
}

.copy-btn {
  background: linear-gradient(135deg, #4CAF50, #388e3c);
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
}

.follow-btn {
  background: linear-gradient(135deg, #2196F3, #1565c0);
  box-shadow: 0 2rpx 8rpx rgba(33, 150, 243, 0.3);
}

.action-text {
  color: #fff;
  font-size: 20rpx;
  margin-top: 4rpx;
  font-weight: 500;
  text-align: center;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

/* 消息项wrapper增加相对定位 */
.chat-item-wrapper {
  position: relative;
}

/* 在线用户列表样式 */
.online-user-list-container {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .online-user-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30rpx 0;
    background: linear-gradient(135deg, #0087b4, #006699);
    color: #fff;
    
    .online-user-title {
      font-size: 36rpx;
      font-weight: 600;
      margin-right: 20rpx;
    }
    
    .online-user-count {
      font-size: 28rpx;
      opacity: 0.9;
    }
  }
  
  .online-user-table {
    .online-user-tr {
      display: flex;
      align-items: center;
      min-height: 80rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      &.header {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #333;
      }
      
      .online-user-th,
      .online-user-td {
        flex: 1;
        text-align: center;
        padding: 20rpx 10rpx;
        font-size: 28rpx;
        word-break: break-all;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .online-user-th {
        color: #666;
        font-weight: 600;
      }
      
      .online-user-td {
        color: #333;
      }
    }
    
    .online-user-tr:nth-child(even) {
      background-color: #fafafa;
    }
    
    .online-user-tr:last-child {
      border-bottom: none;
    }
  }
}

/* 快捷打单配置按钮样式 - 绿色背景 */
.fullscreen-panel.span1 {
  background: #4CAF50 !important; /* 绿色背景 */
  border-radius: 50%;
  display: flex;
  
  .betting-icon {
    font-size: 30rpx;
    margin-bottom: 4rpx;
  }
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 用户管理按钮样式 - 绿色背景 */
.user-management.span1 {
  background: #4CAF50 !important; /* 绿色背景 */
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  .user-icon {
    font-size: 30rpx;
    margin-bottom: 4rpx;
  }
}

/* 房间设置按钮样式 - 绿色背景，与其他管理按钮统一 */
.room-settings.span1 {
  background: #4CAF50 !important; /* 绿色背景，与打单配置、用户管理按钮统一 */
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  .room-icon {
    font-size: 30rpx;
    margin-bottom: 4rpx;
  }
}

/* 房间设置弹窗样式 */
.room-settings-panel {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .room-settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18rpx 30rpx; /* 进一步减小高度 */
    background: linear-gradient(135deg, #0087B4, #006699); /* 保持蓝色渐变用于弹窗标题 */
    color: #fff;
    
    .header-left {
      width: 48rpx; /* 与关闭按钮同宽，保持对称 */
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }
    
    .header-back {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
    
    .header-title {
      font-size: 28rpx; /* 进一步缩小字体 */
      font-weight: 600;
      flex: 1;
      text-align: center;
    }
    
    .header-close {
      width: 48rpx; /* 进一步缩小关闭按钮 */
      height: 48rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }
    }
  }
  
  .room-settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx;
    background: #f8f9fa; /* 浅色背景 */
  }
  
  .embedded-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 30rpx;
    
    .page-header {
      text-align: center;
      margin-bottom: 40rpx;
      
      .page-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        display: block;
        margin-bottom: 10rpx;
      }
      
      .page-subtitle {
        font-size: 24rpx;
        color: #666;
        display: block;
      }
    }
    
    .page-actions {
      display: flex;
      gap: 20rpx;
      margin-bottom: 40rpx;
      
      .action-button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10rpx;
        padding: 20rpx;
        border-radius: 12rpx;
        cursor: pointer;
        
        &.primary {
          background: #0087B4;
          color: #fff;
          
          &:hover {
            background: #006699;
          }
        }
        
        &.secondary {
          background: #f5f5f5;
          color: #666;
          border: 1px solid #ddd;
          
          &:hover {
            background: #e9e9e9;
          }
        }
        
        text {
          font-size: 28rpx;
        }
      }
    }
    
    .page-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      
      .content-text {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 20rpx;
        display: block;
      }
    }
  }
}

.span1-text {
  font-size: 20rpx;
  color: white;
  margin-top: 4rpx;
  text-align: center;
  line-height: 1;
  font-weight: bold;
}

/* 快捷配置弹窗样式 */
.quick-config-panel {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  position: relative !important; /* 为绝对定位的标题栏提供定位上下文 */
}

.quick-config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 30rpx; /* 统一高度 */
  background: linear-gradient(135deg, #0087B4, #006699); /* 统一蓝色渐变 */
  color: #fff;
}

.header-title {
  font-size: 28rpx; /* 统一字体大小 */
  font-weight: 600;
  color: #fff;
}

.header-close {
  width: 48rpx; /* 统一关闭按钮大小 */
  height: 48rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.quick-config-content {
  position: absolute;
  top: 60rpx; /* 从标题栏下方开始 */
  left: 0;
  right: 0;
  bottom: 0; /* 占满剩余空间 */
  overflow: auto; /* 允许滚动 */
  padding-top: 10rpx;
  box-sizing: border-box;
  
  /* 确保内容不会超出这个区域 */
  max-height: calc(100% - 60rpx);
}


/* 用户管理弹窗样式 */
.user-management-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.user-management-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 30rpx; /* 统一高度 */
  background: linear-gradient(135deg, #0087B4, #006699); /* 统一蓝色渐变 */
  color: #fff;
  
  .header-title {
    font-size: 28rpx; /* 统一字体大小 */
    font-weight: 600;
  }
  
  .header-close {
    width: 48rpx; /* 统一关闭按钮大小 */
    height: 48rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.tab-navigation {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 0 20rpx;
  height: 80rpx;
  
  .tab-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    
    text {
      font-size: 28rpx;
      color: #666;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    &.active {
      text {
        color: #4CAF50;
        font-weight: bold;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background: #4CAF50;
        border-radius: 2rpx;
      }
    }
    
    &:hover:not(.active) {
      text {
        color: #4CAF50;
      }
    }
  }
}

.user-management-content {
  flex: 1 1 auto;  // 🔧 完全占据剩余空间
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;   // 关键：允许flex子项缩小
  height: 100%;    // 🔧 占满父容器高度
  
  .tab-content {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    overflow: visible;
    max-height: none;
  }
  
  .tab-content.placeholder-content {
    align-items: center;
    justify-content: center;
  }
  
  .tab-placeholder {
    font-size: 28rpx;
    color: #999;
    padding: 60rpx 40rpx;
    text-align: center;
    background: #f8f9fa;
    border-radius: 12rpx;
    border: 2rpx dashed #ddd;
  }
}
</style>
