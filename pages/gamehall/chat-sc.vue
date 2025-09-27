<template>
  <z-paging-swiper class="skin_blue">
    <template #top>
      <view class="top-height">
        <view class="hearder-status"></view>
        <view class="header-bar">
          <view class="header-bar-left" @click="backTo">
            <u-icon style="margin-top:4rpx;" size="24" color="#fff" name="arrow-left"></u-icon>
            <view class="header-bar-title">{{ curtime.gname }}</view>
          </view>
          <view class="header-bar-right">
            <view class="item item1">
              <view class="con1">
                <view class="text1 span1">积分:</view>
                <view class="text2 span1">{{ balanceInfo.kmoney }}</view>
              </view>
              <view class="con1">
                <view class="text1 span1">输赢:</view>
                <view class="text2 span1" :class="balanceInfo.sy > 0 ? 'green' : (balanceInfo.sy < 0 ? 'red' : '')">{{ balanceInfo.sy }}</view>
              </view>
            </view>
            <view class="item item2">
              <view class="con1" v-show="roomConfig.showTurnover == 1">
                <view class="text1 span1">流水:</view>
                <view class="text2 span1">{{ balanceInfo.jetotal }}</view>
              </view>
              <view class="con1" v-show="roomConfig.showTurnover == 0"><view class="text1 span1"></view><view class="text2 span1"></view></view>
              <view class="con1">
                <view class="text1 span1">回水:</view>
                <view class="text2 span1">{{ balanceInfo.backWater }}</view>
              </view>
            </view>
          </view>
        </view>
        <view class="drop-down">
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
                  <image src="/static/image/icon/live.png" alt="直播" class="live-button"></image>
                  <button v-if="utype == 0" @click="betRecordTop">注单</button>
                  <button @click="dragonTop">长龙</button>
                  <button v-show="roomConfig.showPrediction == 1" @click="predictTop"> 预测</button>
                </view>
              </view>
            </view>
            <view class="drop-down-list-item" @click="showOpenListClick">
              <view class="period">{{ openResult.period }}</view>
              <view class="drop-down-opened">
                <view v-if="template === 'PK10' && openResult.property !== undefined" class="pk10" style="display: flex; align-items: center;">
                  <view class="open-num min drop-down-list-item-ul">
                    <view v-for="(it) in openResult.openNum" class="drop-down-list-item-ul-li" :class="'ball-'+it"></view>
                  </view>
                  <view class="firstSum">
                    <view>冠亚和</view>
                    <view class="span1wrap">
                      <view class="span1">{{ openResult.property.sum }}</view>
                      <view class="red span1">{{ openResult.property.bigSmall }}</view>
                      <view class="red span1">{{ openResult.property.singleDouble }}</view>
                    </view>
                  </view>
                </view>
                <view v-if="template === 'SSC' && openResult.property !== undefined" class="skin_yuan" style="display: flex; align-items: center;">
                  <view class="open-num ssc min drop-down-list-item-ul">
                    <view v-for="it in openResult.openNum" class="drop-down-list-item-ul-li" :class="'ball-'+it">{{it}}</view>
                  </view>
                  <view class="sscSum">
                    <view class="red">{{ openResult.property.sumBigSmall }}</view>
                    <view class="red">{{ openResult.property.sumSingleDouble }}</view>
                    <view class="green">{{ openResult.property.dragonTiger }}</view>
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
    <!-- swiper必须设置height:100%，因为swiper有默认的高度，只有设置高度100%才可以铺满页面  -->
    <swiper duration="200" :disable-programmatic-animation="true" :skip-hidden-item-layout="true" class="swiper" :current="swiperCurrent" @change="onSwiperChange">
      <swiper-item>
        <z-paging @scroll="scroll" ref="paging" v-model="chatList" use-chat-record-mode safe-area-inset-bottom bottom-bg-color="#f8f8f8"
                  @query="queryList" @keyboardHeightChange="keyboardHeightChange" @hidedKeyboard="hidedKeyboard">
          <!--         <template #cell="{item,index}">
                      <view style="transform: scaleY(-1)">
                        <chat-item @msgOrderDetail="msgOrderDetail" :uid="uid" :item="item"></chat-item>
                      </view>
                    </template>-->
          <view v-for="(item,index) in chatList" :key="index">
            <view style="transform: scaleY(-1)">
              <chat-item :utype="utype" shape="circle" :headImageDomain="headImageDomain" :conImageDomain="openImageDomain" @msgOrderDetail="msgOrderDetail" :uid="uid" :item="item"></chat-item>
            </view>
          </view>
          <!-- 底部聊天输入框 -->
          <template #bottom>
            <view class="chat-input-bar-container">
              <view class="chat-input-bar">
                <view class="key-board" @click="emojiChange('iskeyshow','isbuttonsshow')">
                  <image src="/static/image/icon/keybtn.png"></image>
                </view>
                <view class="chat-input-container">
                  <u-input @blur="ismsgfocus = false" :readonly="roomConfig.banChat == 1" :focus="ismsgfocus" class="chat-input" v-model="sendmsg" :adjustPosition="false" type="text"/>
                </view>
                <view class="chat-input-send" v-if="utype == 0">
                  <image @click="emojiChange('isbuttonsshow','iskeyshow')" v-show="sendmsg.length <= 0" src="/static/img/more.png"></image>
                  <image @click="sendevent" v-show="sendmsg.length > 0" src="/static/img/send.png"></image>
                </view>
                <view class="chat-input-send" v-if="utype == 1">
                  <image @click="sendevent" src="/static/img/send.png"></image>
                </view>
              </view>
              <!--  表情面板，这里使用height控制隐藏显示是为了有高度变化的动画效果（如果不需要切换表情面板则不用写） -->
              <view class="emoji-panel-container" :style="[{height: emojiType === 'keyboard' ? keyboardHeight+'px' : '0px'}]">
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
                          <view :class="{'taking':roomConfig.banChat == 1}" class="key-board-ul-li" @click="myonkey('闲聊',0)">闲聊</view>
                          <view class="key-board-ul-li" @click="myonkey('虎',0)">虎</view>
                        </view>
                      </view>
                    </view>
                  </block>
                  <view class="chat-form-buttons show" v-show="isbuttonsshow">
                    <view class="chat-form-buttons-list">
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/shangxiafenbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">上下分</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/applyrecordbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">申请记录</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/gamerecordbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">游戏记录</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/gamereport.png" lazy="loaded"></image>
                        </view>
                        <view class="text">竞猜报表</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/balancerecordbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">积分帐变</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/backwaterbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">自助回水</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/fulireportbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">福利报表</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/redbabtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">红包报表</view>
                      </view>
                      <view class="chat-form-buttons-list-li">
                        <view class="cont">
                          <image src="../../static/image/icon/agentreportbtn.png" lazy="loaded"></image>
                        </view>
                        <view class="text">代理报表</view>
                      </view>
                    </view>
                  </view>
                </scroll-view>
              </view>
            </view>
          </template>
        </z-paging>
        消息数量：{{chatList.length}}
        <view :style="{'top':'20rpx'}" class="coIcon" v-show="coicon1" @click="isshowright = !isshowright">
          <view class="span1">
            <image v-show="!isshowright" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAMAAAC7faEHAAAB7FBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+wOur2AAAAo3RSTlMAhB769vsb/v0CAb8VMgsM/A7pdOIx6s5g8ddTaewtFscSyoAFJGXL9dYDxobUEO5z0NoZJSlWwPLciIp/5IkvoD3dIQfDOeGu+bAordE81fTgUqNoR+dCe7M2P7iSqY58CruFCbZ+sQiDOHjrT4wNWBomTXlZxJ2cp3EUb6T45dlAXCAr31cjTsy+PkFtNG4Eq0ssLhf3gmuvwmrtH+ZENRPTAbDLLwAAAjFJREFUGBl9wQVDGgEAhuGPPEDA7u6csdSVXetQN113d3d3d+f7R3eHggcDn0dxasc212e5M0ob12yd8iuFgboqbIY/lSuJQMEKEjQsDSuRNw2TUeHY1O30rh7PnnRj2vhM8XrzgM6V/YrJLOkDPFdl99YNRk9QcWqyG4AWzep1Q2Gx/pM7DBxTlDcPskJKItgMxjlNC6RBYUhJVc6H0gWKKACjWCmcbYMbsgysgB6ldAGMkEx10BlUakvgjUxVsFJzeA6uoFQLRr9MRwpPKk7L8eWyFME3aQwqZPJ7YJdsloLHL1M1jEibwSHLTsChmIPAiCzrIE+qh02yHN4LnNeMdiBtvyzpPqhUFrxXxJ5B4LoiSgyoSNe0CcjVR3BqWmYVGHUyFfggv1Uz1sM2ucCrGZUd4LsrPcyAedcU9Rd+6TusVlR5EXiKH7tg/gLFbITfaoRxxXi7YPQmPHAqpsYFP/QFsjXrXg6mW480qww2BLQVJmWzcAKyFsnmBQxKQ+DOlM39213dskuD5ZI/B0o0h4U+KJPkgL7XSu0y1Mv0wQ3ZSik3AxbLsgw2LFIKp+ZBh1+W9BxY36qkAqvAd1TT7mTAxUwl4d8B7FNUO5Dv1H/SDwHbmxSzDCg9rQShtUBzWDa7DWDJFtnUXvIAB8KKc6INU1H1urBMNWWvnvoAn6NJCc5cMbAYPxvX5owSkT+kJF6ucWH3ZLFfyZV/XpVHRMPX6nea05/cbVumnAEl+AcVNeYU6LJ/mQAAAABJRU5ErkJggg==">
            </image>
            <image v-show="isshowright" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAMAAAC7faEHAAAB6VBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+oS8NlAAAAonRSTlMAhB769vsb/v0CAb8VMgsM/A7pdOIx6s5g8ddT7GktEscWyoAk4GUFy/XWA4YQxu7U0NpzGcApViXyiNyKf6CJL+TdPSEHwznh+a6wrSg81dH0Ukdoo+dCs3s2P0+Muwp5hZKDtusIsXgJuHypfjiODVkaTZ2cJhRvxFhxp6Qg5U5X+Fwj2UArbT7MvkE0BG5LLKsuF/eCa6/Cau01RObTHxPZei8IAAACMklEQVQYGX3BBUMaAQCG4Y88UhGxu2ubrufKhbHQ9ax1d3d3d3e9v3R3IHgg+DxK07hte2vUHalsHxwb9yuHvuZ6bNZ8rlMWgdKVZGhbnKdM3iAmo9axZYXTO7S1cNSNqemZ0q0uBrp7epVSULUK8NyQ3Vs3GMtDStNS2AbM0KTVbiir0BRFa4CjSvIWQzSsLEKzwLighEAQysLKqmYOVM5TXCkYFcrhcifckqVvJSxXTufACMvUDN0h5TYf3stUDz2axktwhaRGMHpl8+TRkhWyK4fv0jaolc2iYYgukE0DrJO2g0OTbscw3XmoSRugWGqFLUrxLoG196HJqZR8H9QoCh+UVFcOnoq7LpgzTynDUKRP4NSEmtngeyDdi0DXFSVthB1ygVcJBfVgNMtU6oOSmZrwB37pBwwpbk8/cFVxVQbU5iuhCX6qHbbKcng3sFcT5gLBY7K0uOCvvkKhLCcBh1JOAetkqYbNAY3BqEx+D5yRzWLw+GV6Cv3SALgLZDpQtktpZhxaJksQlkn+GFRpGot8UC3JAateK7dL0CrTRzcUKqeiCCyUZSlsXqAcznbBbL8s+THYOFNZBdaD77QSHkfgWoGy8O8H9ilpLlDi1BT5R4DjHUpZClReV4bwJmBWnmxOGMD8Edk0XvQAB/OUZmcnpvKGDXkytVS/eeEDfI4OZTh/08Bi/G7fFFtLXMmAsng16MLu+UK/sqv7sr6YuLZvDe80rX9FO0bGnQFl+A+swOSlXIZbNQAAAABJRU5ErkJggg=="></image>
          </view>
        </view>
        <u-transition :show="isshowright" :customStyle="{'position':'fixed','top':'110rpx','right': '30rpx'}" mode="fade">
          <view class="right-icon">
            <view class="switch span1" @click="switchGame">
              <image src="../../static/image/icon/qiegame.png"></image>
            </view>
            <view class="customer span1" @click="customerTo">
              <image src="../../static/image/icon/customer.png"></image>
            </view>
            <view class="openResult span1" @click="siteTo">
              <image src="../../static/image/icon/kjw.png"></image>
            </view>
            <view v-if="utype == 0" class="span1" @click="swiperCurrent = 1">
              <image  src="/static/image/icon/pan.png" class="beticon"></image>
            </view>
          </view>
        </u-transition>
        <view class="icon-to-bottom" @click="toBottom()" v-show="emojiType !== 'keyboard' && !isAtBottom">
          <view v-if="unreadCount > 0 && unreadCount < 99" class="unread-message">{{ unreadCount }}</view>
          <view v-if="unreadCount > 99" class="unread-message">99+</view>
        </view>
      </swiper-item>
      <swiper-item v-if="utype == 0">
        <view class="bet-content">
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
              <view class="chat-list chat-list-wrap">
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
                              <view v-if="pitem.isn === 1 && template == 'SSC'" class="oddimg"><view> <view class="ball" :class="'ball-'+pitem.name">{{ pitem.name }}</view></view></view>
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
                    <uni-collapse>
                      <uni-collapse-item :show-animation="false" :title="it.name" :align="'center'" :open="true" v-for="(it,i) in item['list']">
                        <view style="border-top: 0.5px solid #ddd;" class="oddsgroup two">
                          <view :class="{ 'checked': selectedPlays.includes(it.f+'-'+pitem.f),'lockedStatus':curtime.fp == 1}" @tap="togglePlay(it.f+'-'+pitem.f)" class="odds" v-for="(pitem,pindex) in it['plist']">
                            <view v-if="pitem.isn === 0" class="oddname"><view class="span1">{{ pitem.name }}</view></view>
                            <view v-if="pitem.isn === 1 && template == 'PK10'" class="oddimg"><view> <view class="ball" :class="'ball-'+pitem.name"></view></view></view>
                            <view v-if="pitem.isn === 1 && template == 'SSC'" class="oddimg"><view> <view class="ball" :class="'ball-'+pitem.name">{{ pitem.name }}</view></view></view>
                            <view v-if="curtime.fp == 0" class="odd"><view>{{ pitem.odds }}</view></view>
                            <view v-if="curtime.fp == 1" class="lockedodd">--</view>
                            <view v-if="curtime.fp == 0" class="selected"></view>
                          </view>
                        </view>
                      </uni-collapse-item>
                    </uni-collapse>
                  </view>
                </template>
              </view>
            </view>
          </view>
          <view class="bet-footer">
            <view class="footer-btns">
              <button @click="selectMoney(item)" v-for="item in moneyList" size="mini">{{ item }}</button>
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
        </view>
      </swiper-item>
    </swiper>
    <u-transition :show="topPanelShow" :customStyle="{'position':'fixed','width':'100%','top':heightArr.topHeight+'px'}" mode="fade">
      <view v-show="isshowpredict" class="predict-box">
        <view class="vanTop van-row">
          <view class="right-border van-col van-col--6">名次</view>
          <view class="van-col van-col--6">本群预测</view>
          <view class="van-col van-col--6"></view>
          <view class="van-col van-col--6"></view>
        </view>
        <view class="longDetail">
          <view class="van-row" v-for="item in predictInfoList">
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
            <view class="van-row" v-for="(item,index) in cllist">
              <view class="van-col van-col--6">{{ index+1 }}</view>
              <view class="van-col van-col--6">{{ item.position }}</view>
              <view class="van-col van-col--6">{{ item.betItem }}</view>
              <view class="van-col van-col--6" style="color: rgb(254, 1, 1);">{{ item.times }}</view>
            </view>
          </view>
        </view>
      </view>
      <open-num-list :isShow="isShowOpenList" class="oepnListHeight" :template="template" :list="openresultlist"></open-num-list>
    </u-transition>
    <u-popup :show="isShowSwitchPannel" mode="right" :closeOnClickOverlay="true" @close="isShowSwitchPannel = !isShowSwitchPannel" :safeAreaInsetTop="true">
      <view>
        <view @click="gotoSwitchGame(item)" class="game-switch-item" v-for="(item,index) in gTimeList">
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
    <u-popup :show="msgOrderDetailShow" mode="center" round="8" :customStyle="{'width':'90%'}" :closeOnClickOverlay="true" @close="msgOrderDetailShow = !msgOrderDetailShow">
      <view class="msgOrderDetailTitle">注单详情</view>
      <scroll-view style="height: 600rpx" scroll-y="true">
        <l-table border="1">
          <l-tr>
            <l-th bg-color="#E3E5F1" height="55">位置</l-th>
            <l-th bg-color="#E3E5F1" height="55">号码</l-th>
            <l-th bg-color="#E3E5F1" height="55">金额</l-th>
            <l-th bg-color="#E3E5F1" height="55" v-show="orderShowTtype == 'orderresult'">盈亏</l-th>
          </l-tr>
          <l-tr v-for="it in msgOrderList">
            <l-td color="#323233" height="55">{{ it.b }}</l-td>
            <l-td color="#323233" height="55">{{ it.p }}</l-td>
            <l-td color="#323233" height="55">{{ it.a }}</l-td>
            <l-td color="#323233" height="55" v-show="orderShowTtype == 'orderresult'">
              <text v-if="it.y > 0" style="color: green;">+{{ it.y }}</text>
              <text v-if="it.y < 0" style="color: red;">{{ it.y }}</text>
              <text v-if="it.y == 0">{{ it.y }}</text>
            </l-td>
          </l-tr>
        </l-table>
      </scroll-view>
    </u-popup>
    <block v-if="utype == 0">
      <u-popup :show="betRecordShow" mode="center" round="8" :customStyle="{'width':'90%'}" :closeOnClickOverlay="true" @close="betRecordShow = !betRecordShow">
        <scroll-view style="height: 600rpx;" scroll-y="true" :show-arrow="false">
          <uni-collapse class="bet-history-box" :accordion="true" @change="betRecordTabChange">
            <uni-collapse-item v-for="item in periodOrderList">
              <template v-slot:title>
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
              </template>
              <view class="bet-detail" v-for="order in item.orders">
                <view class="bet-item">
                  <view class="left">{{ order.playGroupName }}[{{ order.playDetailName }}/{{ order.je }}]</view>
                  <view class="time">{{ order.time }}</view>
                  <view v-if="order.isSettle" class="text" :class="order.winLose > 0 ? 'green' : (order.winLose < 0 ? 'red' : '')">{{ order.winLose > 0 ? "+"+order.winLose : order.winLose }}</view>
                  <view v-if="!order.isSettle" class="text blue">未结算</view>
                </view>
              </view>
            </uni-collapse-item>
          </uni-collapse>
        </scroll-view>
      </u-popup>
    </block>
  </z-paging-swiper>
</template>

<script>
import {IMAGE_REQUEST_URL} from "@/common/config";
//import ZPMixin from '@/uni_modules/z-paging/components/z-paging/js/z-paging-mixin';

export default {
  //mixins: [ZPMixin],
  data() {
    return {
      chatList: [],gid:0,uid:0,
      showShade:false,//显示长按复制粘贴面板
      showPop: false,
      popButton: ["复制", "跟投"],
      popStyle: "",
      longpressItem:[],
      bottomTarget: "",
      tabclassIndex: 0,
      isShowSwitchPannel: false,
      isshowright: false,
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
      roomConfig:[],
      imgurl:IMAGE_REQUEST_URL,
      msgOrderDetailShow:false,//订单详情弹窗
      msgOrderList:[],//当前要显示的订单列表
      balanceInfo:[],//余额信息
      unreadCount: 0,//未读数量
      isAtBottom: true,//是否已经滚动到底部
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
      heightArr:{kbHeight:0,btnsHeight:0,topHeight:0},
      swiperCurrent:0,
      popupStatus:false,
      previewImageFlag:false,
      keyHeight:0,
      periodOrderList:[],
      avatar: uni.getStorageSync('avatar'),
      tmp:{},
      topPanelShow:false,//顶部通用面板
      emojiType:'',
      keyboardHeight:0,
      headImageDomain:'',
      openImageDomain:'',
      utype:0,
    }
  },
  onReady() {
    this.initTopHeight();
  },
  onShow(){
    console.log("chatGame onShow")
    if(this.previewImageFlag){
      this.previewImageFlag = false;
      return;
    }
    if(!this.periodtimer){
      this.getperiod();
      this.getRoomConfig();
      this.utype == 0 && this.quickPlayDetail();
      this.periodtimer = setInterval(() => {this.timerCheck();this.gitemTimeCheck();},1000);
    }
    if(!this.balancetimer){
      this.balancetimer = setInterval(() => {
        if(uni.$socketUtils.isOpenSocket){
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
          uni.$socketUtils.send({eventType:"periodListOrSingle"});
          this.getRoomConfig();
        }
      },8000);
    }
  },
  onHide(){
    console.log("chatGame onHide")
    clearInterval(this.periodtimer);this.periodtimer = null;
    clearInterval(this.balancetimer);this.balancetimer = null;
  },
  beforeDestroy(){
    console.log("chatGame beforeDestroy")
    clearInterval(this.periodtimer);this.periodtimer = null;
    clearInterval(this.balancetimer);this.balancetimer = null;
  },
  onLoad(){
    this.headImageDomain = uni.getStorageSync('headImageDomain');
    this.openImageDomain = uni.getStorageSync('openImageDomain');
    let that = this;
    let userInfo = uni.getStorageSync('userInfo');
    this.uid = userInfo.userid;
    this.utype = userInfo.type;
    this.gid = uni.getStorageSync('cgid');
    this.template = uni.getStorageSync('ctemplate');
    //清理监听器
    uni.$off('websocketopen');
    uni.$off('openResult'+this.gid);
    uni.$off('gamechat'+this.gid);
    uni.$off('getBalanceInfo');
    //初始化远程数据
    this.getperiod();
    this.getRoomConfig();
    this.utype == 0 && this.quickPlayDetail();

    //预先初始化一次
    this.$u.api.member.longdragon({gid:this.gid}).then(res => {this.cllist = res.data;});
    this.$u.api.member.lotteryPredictInfo({gid:this.gid}).then(res => {this.predictInfoList = res.data;});
    this.$u.api.common.resultByDate({gid:this.gid}).then(res => {this.openresultlist = res.data.records;});

    //连接成功发送查询单期开奖结果
    if(!uni.$socketUtils.isOpenSocket){
      uni.$on('websocketopen', function(res) {//websocket连接成功发送查询单期开奖结果
        uni.$socketUtils.send({eventType:"openResult",gid:that.gid});
        uni.$socketUtils.send({eventType:"getBalanceInfo"});
        uni.$socketUtils.send({eventType:"periodListOrSingle"});
      });
    }else{
      uni.$socketUtils.send({eventType:"openResult",gid:that.gid});
      uni.$socketUtils.send({eventType:"getBalanceInfo"});
      uni.$socketUtils.send({eventType:"periodListOrSingle"});
    }
    if(!uni.$socketUtils.isOpenSocket){uni.$socketUtils.initConnection();}
    if(this.template == 'SSC'){
      this.keyboardHeight = 290;
      this.isshowssckey = true;
    }else{
      this.isshowssckey = false;
      this.keyboardHeight = 210;
    }
    that.chatList = [];
    //当期开奖结果
    uni.$on('openResult'+this.gid, function(data) {
      that.openResult = data.data;
    });
    //监听聊天消息
    uni.$on('gamechat'+this.gid, function(data) {
      //检测聊天记录是否超过多少条自动清理
      /*if(that.chatList.length > 51){
        //console.log("已经超标了："+that.chatList.length)
        //that.chatList[0].time = (new Date()).getMilliseconds()/1000;
        that.$nextTick(function () {that.chatList = that.chatList.slice(0,50);});
        //console.log("超标后的数量："+that.chatList.length);
      }*/
      //console.log("gamechat"+that.gid,data);
      let msg = data.data;
      let isBottom = false;
      if (!that.isAtBottom) {
        if(Array.isArray(msg)){
          that.unreadCount += msg.length;
        }else{
          that.unreadCount += 1;
        }
        if(that.tmpToButomFlag){
          isBottom = true;
        }
      }
      if(Array.isArray(msg)){
        this.$nextTick(function (){that.$refs.paging.addChatRecordData(msg,false,false);that.tmpToButomFlag = false;});
      }else{
        if(data.other.msgid && msg.sender == that.uid){
          //let i = that.tmp[data.other.msgid];
          for (let i = 0; i < that.chatList.length; i++) {
            let oitem = that.chatList[i];
            if(data.other.msgid === oitem.msgid){
              that.chatList[i].nickname = msg.nickname;
              break;
            }
          }
          uni.setStorageSync('sendmsg',that.sendmsg);
          that.sendmsg = "";
          !data.other.openResult && uni.$socketUtils.send({eventType:"getBalanceInfo"});
        }else{
          this.$nextTick(function (){that.$refs.paging.addChatRecordData(msg,false,false);that.tmpToButomFlag = false;});
        }
      }
      if(isBottom){
        that.toBottom();
      }
      if(data.other.openResult && data.other.openResult == 1){
        uni.$socketUtils.send({eventType:"openResult",gid:that.gid});
        setTimeout(function (){
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
        },1000);
      }
    });
    //获取余额信息
    uni.$on('getBalanceInfo', function(data) {
      that.balanceInfo = data.data;
    });
    //监听所有彩种时间
    uni.$on('periodListOrSingle', function(res) {
      let gid = res.gid;
      if (gid && gid > 0) {
        for (let i = 0; i < that.gTimeList.length; i++) {
          if (that.gTimeList[i].gid == gid) {
            let cgame = that.gTimeList[i];
            let ngame = res.data[0];
            that.$set(that.gTimeList[i],'stopstatus', ngame.stopstatus);
            if(cgame.period !== ngame.period){
              that.$set(that.gTimeList[i],'period', ngame.period);
              that.$set(that.gTimeList[i],'djs', ngame.djs);
              that.$set(that.gTimeList[i],'fp', ngame.fp);
              that.$set(that.gTimeList[i],'nowSaleTime', ngame.nowSaleTime);
              that.$set(that.gTimeList[i],'nowSealTime', ngame.nowSealTime);
              that.$set(that.gTimeList[i],'nowOpenTime', ngame.nowOpenTime);
            }
            break;
          }
        }
      } else {
        if(that.gTimeList.length <= 0 || that.gTimeList.length !== res.data.length){
          that.$set(that, 'gTimeList', res.data);
          return;
        }
        for (let i = 0; i < that.gTimeList.length; i++) {
          let cgame = that.gTimeList[i];
          let ngame = res.data[i];
          that.$set(that.gTimeList[i],'stopstatus', ngame.stopstatus);
          if(cgame.period !== ngame.period){
            that.$set(that.gTimeList[i],'period', ngame.period);
            that.$set(that.gTimeList[i],'djs', ngame.djs);
            that.$set(that.gTimeList[i],'fp', ngame.fp);
            that.$set(that.gTimeList[i],'nowSaleTime', ngame.nowSaleTime);
            that.$set(that.gTimeList[i],'nowSealTime', ngame.nowSealTime);
            that.$set(that.gTimeList[i],'nowOpenTime', ngame.nowOpenTime);
          }
        }
      }
    });
  },
  computed: {
    windowObj() {
      return this.$u.sys();
    }
  },
  watch: {
    sendmsg(newVal, oldVal) {
      if(newVal.lenght > 0){
        this.cursorPosition = this.sendmsg.length;
      }
    },
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
  },
  methods: {
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
      let str = "";
      if(this.tabclassIndex === 0){
        if(this.selectedButtons.length <= 0 || this.selectedPlays.length <= 0){
          uni.$utils.showToast('请选择玩法');
          return;
        }
        this.selectedButtons.sort((a, b) => a - b);
        let arr1 = this.selectedButtons.map(item => item + 1);
        let str1 = arr1.join('');
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
        console.log(str);
      }
      //下注金额判断betMoney
      if(isNaN(this.betMoney) || this.betMoney <= 0){
        uni.$utils.showToast('请输入正确的下注金额');
        return;
      }
      this.tmpToButomFlag = true;
      uni.$socketUtils.send({eventType:"gamechat",gid:this.gid,content:str});
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
    },
    tabsel(index) {
      if(index !== this.tabclassIndex){
        this.selectedButtons = [];
        this.selectedPlays = [];
      }
      this.tabclassIndex = index;
    },
    scroll(e){
      const { scrollTop,scrollHeight} = e.detail;
      this.isAtBottom = scrollTop <= 50;
      if (this.isAtBottom) {
        this.unreadCount = 0;
      }
    },
    gotoSwitchGame(item){
      uni.setStorageSync('cgid', item.gid);
      uni.setStorageSync('ctemplate', item.template);
      uni.$utils.jump('copage/chat',"redirectTo");
    },
    myonkey(name,iswy){
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
        if(this.roomConfig.banChat == 1){
          uni.showToast({title: "暂未开放闲聊，请联系管理员",icon: 'none'});
          return;
        }
        this.$nextTick(() => {
          this.ismsgfocus = true;
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
      if (this.emojiType === 'keyboard') {
        // 点击了键盘，展示键盘
        //this.ismsgfocus = true;
        this[field] = false;
        this[nfield] = false;
      } else {
        this.ismsgfocus = false;//点击了切换表情面板
        uni.hideKeyboard();// 隐藏键盘
        this[field] = true;
        this[nfield] = false;
      }
      this.emojiType = (!this.emojiType || this.emojiType === 'emoji') ? 'keyboard': 'emoji';
      this.$refs.paging.scrollToBottom();
    },
    toBottom(){
      let that = this;
      let c = this.$refs.paging;
      setTimeout(function (){
        that.$refs.paging.scrollToBottom(true);
      },200);
    },
    initTopHeight() {
      this.$u.getRect('.top-height').then(res => {
        this.heightArr.topHeight = res.height;
      })
    },
    timerCheck(){
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
      this.$u.api.member.getperiod({gid:this.gid}).then(res => {that.curtime = res.data;}).catch(err => {});
    },
    getRoomConfig(){
      let that = this;
      this.$u.api.common.getRoomConfig().then(res => {that.roomConfig = res.data;});
    },
    quickPlayDetail(){
      let that = this;
      this.$u.api.member.quickPlayDetail({gid:this.gid}).then(res => {that.quickPlayDetailData = res.data;}).catch(err => {});
    },
    queryList(pageNo, pageSize) {
      // 组件加载时会自动触发此方法，因此默认页面加载时会自动触发，无需手动调用
      // 这里的pageNo和pageSize会自动计算好，直接传给服务器即可
      // 模拟请求服务器获取分页数据，请替换成自己的网络请求
      const params = {page: pageNo,pageSize: 50};
      params.gid = this.gid;
      this.$u.api.common.chatRecords(params).then(res => {
        // 将请求的结果数组传递给z-paging
        this.$refs.paging.complete(res.data.list);
      }).catch(res => {
        console.log("我错了")
        // 如果请求失败写this.$refs.paging.complete(false);
        // 注意，每次都需要在catch中写这句话很麻烦，z-paging提供了方案可以全局统一处理
        // 在底层的网络请求抛出异常时，写uni.$emit('z-paging-error-emit');即可
        this.$refs.paging.complete(false);
      })
    },
    keyboardHeightChange(res) {
      if (res.height > 0) {
        this.emojiType = 'emoji';// 键盘展开，将emojiType设置为emoji
      }
    },
    hidedKeyboard() {
      if (this.emojiType === 'keyboard') {
        this.emojiType = '';
      }
    },
    sendevent() {
      if(this.sendmsg.length <= 0){
        this.$u.toast('消息不能为空');
        return;
      }
      this.tmpToButomFlag = true;let msgid = this.$u.guid(20);
      let msgitem = {avatar:this.avatar,chatType:'text',content:this.sendmsg,nickname:'发送中',sender:this.uid,msgid:msgid};
      this.$refs.paging.addChatRecordData(msgitem);
      uni.$socketUtils.send({eventType:"gamechat",gid:this.gid,content:this.sendmsg,msgid:msgid});
      /*setTimeout(function (){
        this.tmpToButomFlag = false;
      },3000);*/
    },
    backTo() {
      //#ifdef H5
      uni.$utils.jump('pages/gamehall/gamehall');
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
          this.periodOrderList = res.data;
          this.betRecordShow = !this.betRecordShow;
        }
      }).catch(err => {});
    },
    betRecordTabChange(index){
      if(index){
        uni.showLoading({title: '加载中'});
        let item = this.periodOrderList[index];
        this.$u.api.member.getLotterySettledList({gid:this.gid,period:item.period}).then(res => {
          this.periodOrderList[index].orders = res.data;
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
        this.$u.api.member.longdragon({gid:this.gid}).then(res => {this.cllist = res.data;});
      }
    },
    predictTop() {
      this.isclshow = false;
      this.isShowOpenList = false;
      this.isshowpredict = !this.isshowpredict;
      this.topPanelShow = this.isshowpredict;
      if(this.isshowpredict){
        this.$u.api.member.lotteryPredictInfo({gid:this.gid}).then(res => {this.predictInfoList = res.data;});
      }
    },
    showOpenListClick() {
      this.isshowpredict = false;
      this.isclshow = false;
      this.isShowOpenList = !this.isShowOpenList;
      this.topPanelShow = this.isShowOpenList;
      if(this.isShowOpenList){
        this.$u.api.common.resultByDate({gid:this.gid}).then(res => {this.openresultlist = res.data.records;});
      }
    },
    siteTo() {
      //#ifdef H5
      window.open('https://www.www-163kai.vip/')
      //#endif
      //#ifdef APP-PLUS
      plus.runtime.openURL('https://www.www-163kai.vip/')
      //#endif
    },
    customerTo() {
      uni.navigateTo({
        url: '/pages/customer/customer'
      })
    },
    switchGame() {
      this.isShowSwitchPannel = !this.isShowSwitchPannel
    },
    msgOrderDetail(item,orderShowTtype){
      this.orderShowTtype = orderShowTtype;
      this.msgOrderDetailShow = true;
      this.msgOrderList = item;
    },
  }
}
</script>

<style lang="scss" scoped>

/* 第二个sipwer */
.bet-content {
  position: relative;
  z-index: 101;
  flex-direction: column;
  display: flex;
  overflow: hidden;
  height: 100%;
  .bet-box {
    overflow: hidden;
    position: relative;
    z-index: 100;
    height: 100%;
    .odds-box {
      height: 100%;
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
        overflow-y: auto;
        .right-content {
          flex: 1;
          overflow: hidden;
          background-color: #ededed;
          padding-bottom: 10rpx;
          .odds-group-box {
            width: 100%;
            height: 100%;
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
              background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABmFBMVEVHcEwAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QEm80BmMlSwORIv+MAh7QAh7T7+/sAj74AkL/x+fsElcQKmsj6+/v4+vsCksGP2O/m9vsAj78Hl8ae3vIBkcDU8fvX8vsDk8INnMt60Ov1+vsZpNEBkL8ToM7f9ftgxeZ90eyX2/FSwOMElMOd3vJOvuIQnsyg3/Jexea76ffw+ftWweSo4fTK7vm05vbY8/tjx+eq4/RMveEsrtiO2O9qyuje9fs/t97F7Pkmq9YOncsnrNYiqdUapNEMm8lZw+QxsdoGlsU3tNvs+PsVoc/V8fsrrthHu+Aqrden4fQYo9AXo9ALm8mR2fC+6fe/vVYBAAAAPnRSTlMAt6+sBgoBVVoDCwenwAIJubarsQQIqp+dnMIMw8QOvri8ta2iu7qpvQW0pMGepbOjoZqZlhaYDS12b8K8HluN5CkAAAHtSURBVEjHndRnc9NAEIdxA5KwCIQaCCQBQu+9l31OrrFNGkkIvffeewn9a+eFZSex7zT27jvN7G9Oc/ffTaVUtf6E0vWlVe54n6hgT6+oYE+vqOCidaKCVdc+9PeICvpLRAXrrk3obxAV9HeICvr9ooL+VlFBf5uo4NJlooKNrlXYtVFUsGueqGBHs2sJdiwXFfRsrgXobRIV9HaJCnr7RQW9laKCbpcMvfmigkkuCXqbXWji95+yG3oLXK74C/6dcrmdThcNAJxxuFUrXM6cB+B02+4jAP9PWl242ummAJispJNcuVJudJ/yAKW/xgbD7dWu3DBDubnuXQEgc8HY3jFcHLcNAEMjs914BmBs3NgCUHdyG+ByNONGvwIUfhpbcsJ99cYnANw1te9cCYAvxha5cPfMnw3eA8i/jeXn7wBcN7ashgdm30X2BUDmjYiIjLwC4LmxhTzcMvcSb2QAHmZFpPgYgEuRbTrCg43P9hSAm1EcUM4N2sYqXNMclFsAXIwD+qBom0eLE4muVU8C4H7WNside63hvDpMrSYrtg3Q2e2I9eid2JU+GAsMup3z8DpPLaDNMFjrXkvmCsDYe2NZVklOJHoGhR/GsuWCQ5JYEy8ffTOW9RgclvYrnUoFx0QFgyOig0cXqursNHwUdHG6t/mpAAAAAElFTkSuQmCC);
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
  .bet-footer {
    z-index: 100;
    width: 100%;
    background-color: #fff;
    padding: 16rpx 10rpx;
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
}

/* 底部 */
.chat-input-bar-container{
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

/* 注单详情 */
.msgOrderDetailTitle{
  height: 84rpx;
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  font-size: 34rpx;
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

.swiper {height: 100%;background-color: #ededed !important;}
.hearder-status{
  background: linear-gradient(270deg, #08bbc2, #144988);
  height:var(--status-bar-height);
}
/**头部css**/
.header-bar {
  background: linear-gradient(270deg, #08bbc2, #144988);
  display: flex;
  position: relative;
  height: 100rpx;
  font-size: 48rpx;
  align-items: center;
  .header-bar-left {
    padding: 0 16rpx;
    display: flex;
    align-items: center;
    .header-bar-title {
      max-width: none;
      margin-right: 16rpx;
      display: flex;
      align-items: center;
      color: #fff;
      font-weight: 500;
      font-size: 38rpx;
      transition: all .3s ease-in
    }
  }
  .header-bar-right {
    display: flex;
    align-items: center;
    font-size: 28rpx;
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
  font-size: 28rpx;
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
      min-height: 84rpx;
      border-bottom: 2rpx solid #e6e6e6;
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
          line-height: 32rpx;
          text-align: right;
          font-size: 24rpx;
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
        .red {color: #fe0101;}
        .blue {color: #0087b4;}
        .green {color: #00d123;}
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
    }
  }
}
/* 注单列表 */
.bet-history-box{
  .text.red{color: #fe0101;}
  .text.green{color: #00d123;}
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
  z-index: 80;
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
  background-image: url(data:image/png;base64,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);
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

</style>
