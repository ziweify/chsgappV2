<template>
  <view class="layout skin_blue">
    <view class="fiexheight">
      <view class="hearder-bar-bg" :style="{'height':windowObj.statusBarHeight+'px'}"></view>
      <view class="header-bar hearder-bar-bg">
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
                <button @click="zd">注单</button>
                <button @click="cl">长龙</button>
                <button v-show="roomConfig.showPrediction == 1" @click="pre"> 预测</button>
              </view>
            </view>
          </view>
          <view class="drop-down-list-item">
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
                  <view v-for="(it) in openResult.openNum" class="drop-down-list-item-ul-li" :class="'ball-'+it">{{it}}</view>
                </view>
                <view class="sscSum">
                  <view class="red">{{ openResult.property.sumBigSmall }}</view>
                  <view class="red">{{ openResult.property.sumSingleDouble }}</view>
                  <view class="green">{{ openResult.property.dragonTiger }}</view>
                </view>
              </view>
            </view>
            <view class="drop-down-arrow" @click="ShowOpenListClick">
              <u-icon style="margin-right: 10rpx;" size="24" color="#e6e6e6" name="arrow-down-fill"></u-icon>
            </view>
          </view>
        </view>
      </view>
    </view>
    <swiper :skip-hidden-item-layout="true" style="height: 100%;" :current="swiperCurrent" @change="onSwiperChange">
      <swiper-item>
        <scroll-view class="chat-scroll" :style="{'height':scrollHeight-keyHeight+'px'}" style="flex:1;" scroll-y="true"
                      :scroll-into-view="bottomTarget"
                     :scroll-with-animation="true" @scroll="scroll">
          <view class="scroll-view" style="padding: 6rpx 12rpx;">
            <view :class="item.sender == uid ? 'right' : 'left'" class="msg-item" v-for="(item,index) in chatList">
              <view class="avatar">
                <image v-if="!item.avatar" src="/static/img/room_bg.2c58cefc.png" lazy="loaded"></image>
                <image v-if="item.avatar" :src="item.avatar" lazy="loaded"></image>
              </view>
              <view class="message-content">
                <view class="username">
                  <view>{{ item.nickname }}</view>
                </view>
                <view class="msg-cont nomar">
                  <view v-if="item.sender != uid" class="arrow"></view>
                  <view class="img" v-if="item.chatType == 'image'">
                    <image width="220" height="150.69" class="imgCon" :data-src="imgurl+item.content" @click="clickImg" :src="imgurl+item.content" lazy="loaded"></image>
                  </view>
                  <view class="text" v-if="item.chatType == 'text'"  @longpress="onLongPress($event,item)">
                    <text v-if="item.isA" class="name">@{{ item.isA }}</text>
                    <rich-text v-if="!item.mtype || item.mtype == 0" :nodes="item.content"></rich-text>
                    <view v-if="item.mtype && item.mtype == 1">
                      <template v-for="(cc) in item.content">
                        <rich-text v-if="cc.t == 'text'" :nodes="cc.con"></rich-text>
                        <view v-if="cc.t == 'order'">
                          <text @click="msgOrderDetail(item.other[cc.uid])" class="blue">注单详情</text>
                        </view>
                        <view v-if="cc.t == 'orderlist'" style="display: flex;">
                          <rich-text :nodes="cc.con"></rich-text><text style="margin-left: 10rpx;" @click="msgOrderDetail(item.other[cc.uid],cc.t)" class="blue">注单详情</text>
                        </view>
                        <view v-if="cc.t == 'orderresult'" style="display: flex;align-items: center;position: relative">
                          <rich-text :nodes="cc.con"></rich-text>
                          <view style="margin-left: 20rpx;position: absolute;bottom: 0px;right: 2rpx;"><text @click="msgOrderDetail(item.other[cc.uid],cc.t)" class="blue">注单详情</text></view>
                        </view>
                      </template>
                    </view>
                  </view>
                  <view v-if="item.sender == uid" class="arrow"></view>
                </view>
              </view>
              <view :id="`chat-${index}`"></view>
            </view>
          </view>
        </scroll-view>
        <view class="chat-form-wrap fiexheight">
          <view class="chat-form">
            <view class="key-board" @click="keyshow">
              <image src="../../static/image/icon/keybtn.png"></image>
            </view>
            <view class="form">
              <input :adjust-position="false" :always-system="true" :focus="ismsgfocus" @blur="ismsgfocus = false" :disabled="roomConfig.banChat == 1" v-model="sendmsg" class="textarea">
            </view>
            <view class="add-btn">
              <image @click="btnshow" v-show="sendmsg.length <= 0" src="/static/img/more.png"></image>
              <image @click="sendevent" v-show="sendmsg.length > 0" src="/static/img/send.png"></image>
            </view>
          </view>
          <view class="chat-form-buttons show btnsHeight" v-show="isbuttonsshow">
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
          <view class="key-board kbHeight" v-show="iskeyshow">
            <view class="nav_1">
              <view class="key-board-ul-li" @tap="myonkey('梭哈',0)">梭哈</view>
              <view class="key-board-ul-li" @tap="myonkey('取消',1)">取消</view>
              <view class="key-board-ul-li" @tap="myonkey('上分',1)">上分</view>
              <view class="key-board-ul-li" @tap="myonkey('查',1)">查</view>
              <view class="key-board-ul-li" @tap="myonkey('下分',1)">下分</view>
              <view class="key-board-ul-li" @tap="myonkey('重复',1)">重复</view>
            </view>
            <view class="nav_2" v-show="isshowssckey">
              <view class="key-board-ul-li" @tap="myonkey('前三',0)">前三</view>
              <view class="key-board-ul-li" @tap="myonkey('中三',0)">中三</view>
              <view class="key-board-ul-li" @tap="myonkey('后三',0)">后三</view>
              <view class="key-board-ul-li" @tap="myonkey('总和',0)">总和</view>
              <view class="key-board-ul-li" @tap="myonkey('豹子',0)">豹子</view>
              <view class="key-board-ul-li" @tap="myonkey('对子',0)">对子</view>
              <view class="key-board-ul-li" @tap="myonkey('顺子',0)">顺子</view>
              <view class="key-board-ul-li" @tap="myonkey('半顺',0)">半顺</view>
              <view class="key-board-ul-li" @tap="myonkey('杂六',0)">杂六</view>
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
                <view class="key-board-ul-li" @tap="myonkey('大',0)">大</view>
                <view class="key-board-ul-li" @tap="myonkey('小',0)">小</view>
                <view class="key-board-ul-li" @tap="myonkey('单',0)">单</view>
                <view class="key-board-ul-li" @tap="myonkey('双',0)">双</view>
              </view>
              <view class="nav_4">
                <view class="key-board-ul-li" @tap="myonkey('1',0)">1</view>
                <view class="key-board-ul-li" @tap="myonkey('2',0)">2</view>
                <view class="key-board-ul-li" @tap="myonkey('3',0)">3</view>
                <view @longpress="longpressDel" class="key-board-ul-li drop-down-arrow1" style="color: #fe0101" @tap="myonkey('删',0)">删</view>
                <view class="key-board-ul-li" @tap="myonkey('4',0)">4</view>
                <view class="key-board-ul-li" @tap="myonkey('5',0)">5</view>
                <view class="key-board-ul-li" @tap="myonkey('6',0)">6</view>
                <view class="key-board-ul-li" @tap="myonkey('龙',0)">龙</view>
                <view class="key-board-ul-li" @tap="myonkey('7',0)">7</view>
                <view class="key-board-ul-li" @tap="myonkey('8',0)">8</view>
                <view class="key-board-ul-li" @tap="myonkey('9',0)">9</view>
                <view class="key-board-ul-li" @tap="myonkey('冠亚',0)">冠亚</view>
                <view class="key-board-ul-li" @tap="myonkey('/#',0)">/&nbsp;&nbsp;#</view>
                <view class="key-board-ul-li" @tap="myonkey('0',0)">0</view>
                <view class="key-board-ul-li" @tap="myonkey('闲聊',0)">闲聊</view>
                <view class="key-board-ul-li" @tap="myonkey('虎',0)">虎</view>
              </view>
            </view>
          </view>
        </view>

        <view class="icon-to-bottom bottom80" @click="toBottom()">
          <view v-if="unreadCount > 0 && unreadCount < 99" class="unread-message">{{ unreadCount }}</view>
          <view v-if="unreadCount > 99" class="unread-message">99+</view>
        </view>
        <view :style="{'top':'20rpx'}" class="coIcon" v-show="coicon1" @click="setshowright">
          <view class="span1">
            <image v-show="!isshowright" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAMAAAC7faEHAAAB7FBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+wOur2AAAAo3RSTlMAhB769vsb/v0CAb8VMgsM/A7pdOIx6s5g8ddTaewtFscSyoAFJGXL9dYDxobUEO5z0NoZJSlWwPLciIp/5IkvoD3dIQfDOeGu+bAordE81fTgUqNoR+dCe7M2P7iSqY58CruFCbZ+sQiDOHjrT4wNWBomTXlZxJ2cp3EUb6T45dlAXCAr31cjTsy+PkFtNG4Eq0ssLhf3gmuvwmrtH+ZENRPTAbDLLwAAAjFJREFUGBl9wQVDGgEAhuGPPEDA7u6csdSVXetQN113d3d3d+f7R3eHggcDn0dxasc212e5M0ob12yd8iuFgboqbIY/lSuJQMEKEjQsDSuRNw2TUeHY1O30rh7PnnRj2vhM8XrzgM6V/YrJLOkDPFdl99YNRk9QcWqyG4AWzep1Q2Gx/pM7DBxTlDcPskJKItgMxjlNC6RBYUhJVc6H0gWKKACjWCmcbYMbsgysgB6ldAGMkEx10BlUakvgjUxVsFJzeA6uoFQLRr9MRwpPKk7L8eWyFME3aQwqZPJ7YJdsloLHL1M1jEibwSHLTsChmIPAiCzrIE+qh02yHN4LnNeMdiBtvyzpPqhUFrxXxJ5B4LoiSgyoSNe0CcjVR3BqWmYVGHUyFfggv1Uz1sM2ucCrGZUd4LsrPcyAedcU9Rd+6TusVlR5EXiKH7tg/gLFbITfaoRxxXi7YPQmPHAqpsYFP/QFsjXrXg6mW480qww2BLQVJmWzcAKyFsnmBQxKQ+DOlM39213dskuD5ZI/B0o0h4U+KJPkgL7XSu0y1Mv0wQ3ZSik3AxbLsgw2LFIKp+ZBh1+W9BxY36qkAqvAd1TT7mTAxUwl4d8B7FNUO5Dv1H/SDwHbmxSzDCg9rQShtUBzWDa7DWDJFtnUXvIAB8KKc6INU1H1urBMNWWvnvoAn6NJCc5cMbAYPxvX5owSkT+kJF6ucWH3ZLFfyZV/XpVHRMPX6nea05/cbVumnAEl+AcVNeYU6LJ/mQAAAABJRU5ErkJggg==">
            </image>
            <image v-show="isshowright" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAnCAMAAAC7faEHAAAB6VBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+oS8NlAAAAonRSTlMAhB769vsb/v0CAb8VMgsM/A7pdOIx6s5g8ddT7GktEscWyoAk4GUFy/XWA4YQxu7U0NpzGcApViXyiNyKf6CJL+TdPSEHwznh+a6wrSg81dH0Ukdoo+dCs3s2P0+Muwp5hZKDtusIsXgJuHypfjiODVkaTZ2cJhRvxFhxp6Qg5U5X+Fwj2UArbT7MvkE0BG5LLKsuF/eCa6/Cau01RObTHxPZei8IAAACMklEQVQYGX3BBUMaAQCG4Y88UhGxu2ubrufKhbHQ9ax1d3d3d3e9v3R3IHgg+DxK07hte2vUHalsHxwb9yuHvuZ6bNZ8rlMWgdKVZGhbnKdM3iAmo9axZYXTO7S1cNSNqemZ0q0uBrp7epVSULUK8NyQ3Vs3GMtDStNS2AbM0KTVbiir0BRFa4CjSvIWQzSsLEKzwLighEAQysLKqmYOVM5TXCkYFcrhcifckqVvJSxXTufACMvUDN0h5TYf3stUDz2axktwhaRGMHpl8+TRkhWyK4fv0jaolc2iYYgukE0DrJO2g0OTbscw3XmoSRugWGqFLUrxLoG196HJqZR8H9QoCh+UVFcOnoq7LpgzTynDUKRP4NSEmtngeyDdi0DXFSVthB1ygVcJBfVgNMtU6oOSmZrwB37pBwwpbk8/cFVxVQbU5iuhCX6qHbbKcng3sFcT5gLBY7K0uOCvvkKhLCcBh1JOAetkqYbNAY3BqEx+D5yRzWLw+GV6Cv3SALgLZDpQtktpZhxaJksQlkn+GFRpGot8UC3JAateK7dL0CrTRzcUKqeiCCyUZSlsXqAcznbBbL8s+THYOFNZBdaD77QSHkfgWoGy8O8H9ilpLlDi1BT5R4DjHUpZClReV4bwJmBWnmxOGMD8Edk0XvQAB/OUZmcnpvKGDXkytVS/eeEDfI4OZTh/08Bi/G7fFFtLXMmAsng16MLu+UK/sqv7sr6YuLZvDe80rX9FO0bGnQFl+A+swOSlXIZbNQAAAABJRU5ErkJggg=="></image>
          </view>
        </view>
        <view :style="{'top':'100rpx'}" class="right-icon sm" v-show="isshowright">
          <view class="switch span1" @click="switchGame">
            <image src="../../static/image/icon/qiegame.png"></image>
          </view>
          <view class="customer span1" @click="customerTo">
            <image src="../../static/image/icon/customer.png"></image>
          </view>
          <view class="openResult span1" @click="siteTo">
            <image src="../../static/image/icon/kjw.png"></image>
          </view>
          <view class="span1" @click="swiperCurrent = 1">
            <image  src="../../static/image/icon/pan.png" class="beticon"></image>
          </view>
        </view>
      </swiper-item>
      <swiper-item>
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
                  <image src="../../static/image/icon/qunliaobtn.png" lazy="loaded"></image>
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
              <button @click="bet()" class="betbtn van-button van-button--info van-button--normal">
                <view class="van-button__content">
                  <view class="van-button__text">下注</view>
                </view>
              </button>
              <button @click="betReset()" class="reset van-button van-button--danger van-button--normal">
                <view class="van-button__content"><view class="van-button__text">重置</view></view>
              </button>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view class="shade" v-show="showShade" @tap="hidePop">
      <view class="pop" :style="popStyle" :class="{'show':showPop}">
        <view v-for="(item,index) in popButton" :key="index" @tap="pickerMenu" :data-index="index">{{item}}</view>
      </view>
    </view>
    <uni-popup :style="{'top':heightArr.topHeight+'px'}" :masktop="heightArr.topHeight" ref="popup" :dura="100" :isShowMask="false" type="bottom">
      <view v-show="isshowpredict" style="overflow: hidden;background: #fff;" class="predict-no-detail">
        <view class="vanTop van-row">
          <view class="right-border van-col van-col--6">名次</view>
          <view class="van-col van-col--6">本群预测</view>
          <view class="van-col van-col--6"></view>
          <view class="van-col van-col--6"></view>
        </view>
        <view class="longDetail">
          <view class="van-row" v-for="(item) in predictInfoList">
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
      <view v-show="isclshow" class="chang-long-box" style="overflow: hidden;background: #fff;">
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
    </uni-popup>
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
    <u-popup :show="yjshow" mode="center" round="8" :customStyle="{'width':'90%'}" :closeOnClickOverlay="true" @close="yjshow = !yjshow">
      <scroll-view style="height: 600rpx;" scroll-y="true" :show-arrow="false">
        <uni-collapse class="bet-history-box" :accordion="true" @change="orderTabChange">
          <uni-collapse-item v-for="(item,index) in periodOrderList">
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
            <view class="bet-detail" v-for="(order,i) in item.orders">
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
<!--    <zero-loading v-show="showLoading" :maskOpacity="0.4" :mask="true" type="atom" position="fixed"></zero-loading>-->
  </view>
</template>

<script>
import {IMAGE_REQUEST_URL} from '@/common/config.js';
import { previewImageWithSwipe } from '@/common/imagePreviewUtils.js';

export default {
  data() {
    return {
      showShade:false,
      showPop: false,
      popButton: ["复制", "跟投"],
      popStyle: "",
      longpressItem:[],
      sheight:0,
      cheight:0,
      scrollHeight: 0,
      bottomTarget: "",
      tabclassIndex: 0,
      isShowSwitchPannel: false,
      isshowright: false,
      isshowpredict: false,
      isclshow: false,
      wjshow: false,
      isShowOpenList: false,
      iskeyshow: false,
      isbuttonsshow: false,
      coicon1: true,
      yjshow: false,
      ismsgfocus:false,
      cursorPosition:0,
      gid:0,
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
      chatList:[],//聊天消息
      imgurl:IMAGE_REQUEST_URL,
      uid:0,
      msgOrderDetailShow:false,//订单详情弹窗
      msgOrderList:[],//当前要显示的订单列表
      balanceInfo:[],//余额信息
      baseHeight:667,
      baseWidth:375,
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
      oldScrollHeight:0,
      popupStatus:false,
      previewImageFlag:false,
      keyHeight:0,
      periodOrderList:[],
      avatar: uni.getStorageSync('avatar'),
      tmp:{}
    };
  },
  computed: {
    windowObj() {
      return this.$u.sys();
    }
  },
  onReady(){
    this.initScrollh()
  },
  onShow(){
    console.log("chatGame onShow")
    if(this.previewImageFlag){
      this.previewImageFlag = false;
      return;
    }
    /*if(uni.$socketUtils.isOpenSocket){
      console.log("isOpenSocket:"+uni.$socketUtils.isOpenSocket)
      uni.$socketUtils.send({eventType:"openResult",gid:this.gid});
      uni.$socketUtils.send({eventType:"chatList",gid:this.gid});
      uni.$socketUtils.send({eventType:"getBalanceInfo"});
      uni.$socketUtils.send({eventType:"periodListOrSingle"});
    }*/
    //if(!uni.$socketUtils.isOpenSocket){uni.$socketUtils.initConnection();}
    if(!this.periodtimer){
      this.getperiod();
      this.getRoomConfig();
      this.quickPlayDetail();
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
   /*uni.$off('websocketopen');
   uni.$off('openResult'+this.gid);
   uni.$off('gamechat'+this.gid);
   uni.$off('chatList'+this.gid);
   uni.$off('getBalanceInfo');*/
   clearInterval(this.periodtimer);this.periodtimer = null;
   clearInterval(this.balancetimer);this.balancetimer = null;
  },
  beforeDestroy(){
    console.log("chatGame beforeDestroy")
    /*uni.$off('websocketopen');
    uni.$off('openResult'+this.gid);
    uni.$off('gamechat'+this.gid);
    uni.$off('chatList'+this.gid);
    uni.$off('getBalanceInfo');*/
    clearInterval(this.periodtimer);this.periodtimer = null;
    clearInterval(this.balancetimer);this.balancetimer = null;
  },
  onLoad(options) {
    let that = this;
    let userInfo = uni.getStorageSync('userInfo');
    this.uid = userInfo.userid;
    this.gid = uni.getStorageSync('cgid');
    this.template = uni.getStorageSync('ctemplate');
    //清理监听器
    uni.$off('websocketopen');
    uni.$off('openResult'+this.gid);
    uni.$off('gamechat'+this.gid);
    uni.$off('chatList'+this.gid);
    uni.$off('getBalanceInfo');
    //初始化远程数据
    this.getperiod();
    this.getRoomConfig();
    this.quickPlayDetail();

    //预先初始化一次
    this.$u.api.member.longdragon({gid:this.gid}).then(res => {this.cllist = res.data;});
    this.$u.api.member.lotteryPredictInfo({gid:this.gid}).then(res => {this.predictInfoList = res.data;});
    this.$u.api.common.resultByDate({gid:this.gid}).then(res => {this.openresultlist = res.data.records;});

    //连接成功发送查询单期开奖结果
    if(!uni.$socketUtils.isOpenSocket){
      uni.$on('websocketopen', function(res) {//websocket连接成功发送查询单期开奖结果
        uni.$socketUtils.send({eventType:"openResult",gid:that.gid});
        uni.$socketUtils.send({eventType:"chatList",gid:that.gid});
        uni.$socketUtils.send({eventType:"getBalanceInfo"});
        uni.$socketUtils.send({eventType:"periodListOrSingle"});
      });
    }else{
      uni.$socketUtils.send({eventType:"openResult",gid:that.gid});
      uni.$socketUtils.send({eventType:"chatList",gid:that.gid});
      uni.$socketUtils.send({eventType:"getBalanceInfo"});
      uni.$socketUtils.send({eventType:"periodListOrSingle"});
    }
    if(!uni.$socketUtils.isOpenSocket){uni.$socketUtils.initConnection();}
    if(this.template == 'SSC'){
      this.isshowssckey = true;
    }else{
      this.isshowssckey = false;
    }
    that.chatList = [];
    //当期开奖结果
    uni.$on('openResult'+this.gid, function(data) {
      that.openResult = data.data;
    });
    //监听聊天消息
    uni.$on('gamechat'+this.gid, function(data) {
      //console.log("gamechat"+that.gid,data);
      let msg = data.data;
      if(Array.isArray(msg)){
        that.chatList = [...that.chatList,...msg];
      }else{
        if(data.other.msgid && that.tmp[data.other.msgid]){
          let i = that.tmp[data.other.msgid];
          that.chatList[i].nickname = msg.nickname;
          uni.setStorage('sendmsg',that.sendmsg);
          that.sendmsg = "";
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
        }else{
          that.chatList = [...that.chatList,msg];
        }
      }
      if (!that.isAtBottom) {
        if(Array.isArray(msg)){
          that.unreadCount += msg.length;
        }else{
          that.unreadCount += 1;
        }
        if(that.tmpToButomFlag){
          //that.tmpToButomFlag = false;
          that.toBottom();
        }
      }else{
        that.toBottom();
      }
      if(data.other.openResult && data.other.openResult == 1){
        uni.$socketUtils.send({eventType:"openResult",gid:that.gid});
        setTimeout(function (){
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
        },1000);
      }
    });
    //监听获取最近聊天记录消息列表
    uni.$on('chatList'+this.gid, function(data) {
      //console.log("接收消息列表:"+ new Date().toLocaleString())
      let list = data.data;
      that.chatList = that.chatList.concat(list)
      that.toBottom();
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
    //键盘高度监听
    uni.offKeyboardHeightChange(this.keyboardHeightChange);
    uni.onKeyboardHeightChange(this.keyboardHeightChange);
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
    }
  },
  methods: {
    orderTabChange(index){
      if(index){
        uni.showLoading({title: '加载中'});
        let item = this.periodOrderList[index];
        this.$u.api.member.getLotterySettledList({gid:this.gid,period:item.period}).then(res => {
          this.periodOrderList[index].orders = res.data;
          uni.hideLoading();
        }).catch(err => { uni.hideLoading();});
      }
    },
    pickerMenu(e) {
      let index = Number(e.currentTarget.dataset.index);
      let content = "";
      if(typeof this.longpressItem.content === 'string'){
        content = this.longpressItem.content;
      }else{
        for(let c in this.longpressItem.content){
          content += this.longpressItem.content[c].con;
        }
      }
      content = content.replace(/<br\s*\/?>/g, '');
      if(index == 0){//复制
        if (content) {
          uni.setClipboardData({
            data: content,
            success: () => {
              uni.showToast({ title: '复制成功', duration: 2000 });
            },
            fail: () => {
              uni.showToast({ title: '复制失败', icon: 'none', duration: 2000 });
            }
          });
        }
      }else if(index === 1){
        if(content){
          this.tmpToButomFlag = true;
          uni.$socketUtils.send({eventType:"gamechat",gid:this.gid,content:content});
          uni.setStorage('sendmsg',content);
          uni.$socketUtils.send({eventType:"getBalanceInfo"});
        }
      }
      this.hidePop();
    },
    onLongPress(e,item) {
      this.longpressItem = item;
      let [touches, style, index] = [e.touches[0], "", e.currentTarget.dataset.index];
      /* 因 非H5端不兼容 style 属性绑定 Object ，所以拼接字符 */
      if (touches.clientY > (this.windowObj.height / 2)) {
        style = `bottom:${this.windowObj.height-touches.clientY}px;`;
      } else {
        style = `top:${touches.clientY}px;`;
      }
      if (touches.clientX > (this.windowObj.witdh / 2)) {
        style += `right:${this.windowObj.witdh-touches.clientX}px`;
      } else {
        style += `left:${touches.clientX}px`;
      }
      this.popStyle = style;
      this.showShade = true;
      this.$nextTick(() => {
        setTimeout(() => {
          this.showPop = true;
        }, 10);
      });
    },
    hidePop() {
      this.showPop = false;
      setTimeout(() => {
        this.showShade = false;
      }, 250);
    },
    longpressDel(){
      this.sendmsg = "";
    },
    keyboardHeightChange(res){
      this.keyHeight = res.height;
    },
    onSwiperChange(e) {
      this.swiperCurrent = e.detail.current;
    },
    switchSwiper(){
      this.swiperCurrent = 0;
    },
    initScrollh() {
      this.$u.getRect('.fiexheight',true).then(res => {
        for(let key in res){
          let rect = res[key];
          this.scrollHeight += rect.height;
          if(key == 0){
            this.heightArr.topHeight = rect.height;
          }
        }
        this.scrollHeight = this.windowObj.windowHeight-this.scrollHeight;
        this.oldScrollHeight = this.scrollHeight;
      })
    },
    updateScrollHeight(name,bool) {
      if(bool){
        this.$nextTick(() => {
          this.$u.getRect('.'+name).then(res => {
            this.heightArr[name] = res.height;
            this.scrollHeight = this.oldScrollHeight-this.heightArr[name];
            this.toBottom();
          })
        });
      }else{
        this.scrollHeight = this.oldScrollHeight;
        this.heightArr[name] = 0;//
        this.toBottom();
      }
    },
    updateScrollHeight2(name,bool) {
      if(bool){
        this.$nextTick(() => {
          this.$u.getRect('.'+name).then(res => {
            this.heightArr[name] = res.height;
            this.scrollHeight = this.scrollHeight-this.heightArr[name];
          })
        });
      }else{
        this.scrollHeight = this.scrollHeight+this.heightArr[name];
        this.heightArr[name] = 0;//
      }
    },
    gotoSwitchGame(item){
      uni.setStorageSync('cgid', item.gid);
      uni.setStorageSync('ctemplate', item.template);
      let url = 'pages/gamehall/chatGame';
      uni.$utils.jump(url,"redirectTo");
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
      console.log(this.timer);
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
          /*if(garr.indexOf(gname) == -1){
            garr.push(gname);
          }*/
          //let gindex = garr.indexOf(gname);
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
      uni.$socketUtils.send({eventType:"getBalanceInfo"});
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
    quickPlayDetail(){
      let that = this;
      this.$u.api.member.quickPlayDetail({gid:this.gid}).then(res => {that.quickPlayDetailData = res.data;}).catch(err => {});
    },
    scroll(e){
      const { scrollTop,scrollHeight} = e.detail;//
      this.isAtBottom = scrollTop + this.scrollHeight + 50 >= scrollHeight;
      if (this.isAtBottom) {
        this.unreadCount = 0;
      }
    },
    msgOrderDetail(item,orderShowTtype){
      this.orderShowTtype = orderShowTtype;
      this.msgOrderDetailShow = true;
      this.msgOrderList = item;
    },
    setScrollHeight(fiexd,type = 1){
      let screenHeight = this.windowObj.windowHeight; // 获取屏幕高度
      let screenWidth = this.windowObj.windowWidth; // 获取屏幕宽度
      let statusBarHeight = this.windowObj.statusBarHeight || 0; // 状态栏高度，部分设备可能没有
      let baseHeaderHeight = fiexd; // 基准设备上固定元素的高度
      let currentAspectRatio = screenHeight/screenWidth;
      let baseAspectRatio = this.baseHeight/this.baseWidth;
      let headerHeight = 0;
      if (currentAspectRatio > baseAspectRatio) {
        headerHeight = baseHeaderHeight * (screenWidth/this.baseWidth);
      } else {
        headerHeight = baseHeaderHeight * (screenHeight/this.baseHeight);
      }
      if(type === 1){
        this.sheight = screenHeight-headerHeight-statusBarHeight;
      }else if(type === 3){
        this.cheight = screenHeight-headerHeight-statusBarHeight;
      }else{
        return headerHeight;
      }
    },
    toBottom(type = 1) {
      this.bottomTarget = ''; // 先重置 toView
      if(type === 1){
        this.$nextTick(() => {
          this.bottomTarget = `chat-${this.chatList.length - 1}`; // 再设置为目标元素的 id
        });
      }else{
        let that = this;
        setTimeout(function (){
          that.$nextTick(() => {
            that.bottomTarget = `chat-${that.chatList.length - 1}`; // 再设置为目标元素的 id
          });
        },500);
      }
    },
    sendevent(){//发送消息
      if(this.sendmsg.length <= 0){
        uni.$utils.showToast('消息不能为空');
        return;
      }
      this.tmpToButomFlag = true;let msgid = uni.$u.guid(20);
      let msgitem = {avatar:this.avatar,chatType:'text',content:this.sendmsg,nickname:'发送中',sender:this.uid,msgid:msgid};
      this.tmp[msgid] = this.chatList.push(msgitem) - 1;
      this.toBottom();//滚动到最底部
      uni.$socketUtils.send({eventType:"gamechat",gid:this.gid,content:this.sendmsg,msgid:msgid});
      setTimeout(function (){
        this.tmpToButomFlag = false;
      },3000);
    },
    myonkey(name,iswy){
      if(iswy == 1){
        this.sendmsg = "";
      }
      if(name == "删"){
        this.sendmsg = this.sendmsg.substring(0,this.sendmsg.length-1);
        return;
      }
      if(name == "重复"){
        this.sendmsg = uni.getStorageSync('sendmsg','');
        return;
      }
      if(name == "闲聊"){
        if(this.roomConfig.banChat == 1){
          uni.showToast({title: "暂未开放闲聊，请联系管理员",icon: 'none'});
          return;
        }
        this.$nextTick(() => {
          this.ismsgfocus = true;
          this.iskeyshow = false;
          this.scrollHeight = this.oldScrollHeight;
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
    getperiod(){
      let that = this;
      this.$u.api.member.getperiod({gid:this.gid}).then(res => {that.curtime = res.data;}).catch(err => {});
    },
    getRoomConfig(){
      let that = this;
      this.$u.api.common.getRoomConfig().then(res => {that.roomConfig = res.data;});
    },
    clickImg(e) {
      this.previewImageFlag = true;
      var current = e.target.dataset.src;
      
      // 使用工具函数进行图片预览，支持左右滑动
      previewImageWithSwipe(current, this.chatList);
    },
    siteTo() {
      //#ifdef H5
      window.open('https://www.www-163kai.vip/')
      //#endif
      //#ifdef APP-PLUS
      plus.runtime.openURL('https://www.www-163kai.vip/')
      //#endif
    },
    switchGame() {
      this.isShowSwitchPannel = !this.isShowSwitchPannel
    },
    customerTo() {
      uni.navigateTo({
        url: '/pages/customer/customer'
      })
    },
    setshowright() {
      this.isshowright = !this.isshowright;
    },
    ShowOpenListClick() {
      this.isshowpredict = false;
      this.isclshow = false;
      this.isShowOpenList = !this.isShowOpenList;
      if(this.isShowOpenList){
        this.$u.api.common.resultByDate({gid:this.gid}).then(res => {this.openresultlist = res.data.records;});
        if(!this.$refs.popup.showPopup){
          this.$refs.popup.open();
        }
      }else{
        if(this.$refs.popup.showPopup){
          this.$refs.popup.close();
        }
      }
    },
    backTo() {
      //#ifdef H5
      uni.$utils.jump('pages/gamehall/gamehall');
      //#endif
      //#ifdef APP-PLUS
      uni.$utils.jump(1,"navigateBack");
      //#endif
    },
    keyshow() {
      this.iskeyshow = !this.iskeyshow;
      this.isbuttonsshow = false;
      console.log("iskeyshow",this.iskeyshow)
      this.updateScrollHeight("kbHeight",this.iskeyshow);
    },
    btnshow() {
      this.isbuttonsshow = !this.isbuttonsshow;
      this.iskeyshow = false;
      uni.hideKeyboard();
      this.updateScrollHeight("btnsHeight",this.isbuttonsshow);
    },
    zd() {
      this.$u.api.member.getBetsSumByLotteryId({gid:this.gid}).then(res => {
        if(res.data.length <= 0){
          this.$u.toast("暂无数据");
        }else{
          this.periodOrderList = res.data;
          this.yjshow = !this.yjshow;
        }
      }).catch(err => {});
    },
    cl() {
      this.isshowpredict = false;
      this.isShowOpenList = false;
      this.isclshow = !this.isclshow;
      if(this.isclshow){
        this.$u.api.member.longdragon({gid:this.gid}).then(res => {this.cllist = res.data;});
        if(!this.$refs.popup.showPopup){
          this.$refs.popup.open();
        }
      }else{
        if(this.$refs.popup.showPopup){
          this.$refs.popup.close();
        }
      }
    },
    pre() {
      this.isclshow = false;
      this.isShowOpenList = false;
      this.isshowpredict = !this.isshowpredict;
      if(this.isshowpredict){
        this.$u.api.member.lotteryPredictInfo({gid:this.gid}).then(res => {this.predictInfoList = res.data;});
        if(!this.$refs.popup.showPopup){
          this.$refs.popup.open();
        }
      }else{
        if(this.$refs.popup.showPopup){
          this.$refs.popup.close();
        }
      }
    },
    tabsel(index) {
      if(index !== this.tabclassIndex){
        this.selectedButtons = [];
        this.selectedPlays = [];
      }
      this.tabclassIndex = index;
    }
  }
}
</script>

<style lang="scss" scoped>
.msgOrderDetailTitle{
  height: 84rpx;
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  font-size: 34rpx;
}
.layout {
  width: 100%;
  height: 100%;
  background-color: #f1f1f1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
/**头部css**/
.hearder-bar-bg{
  background: linear-gradient(270deg, #08bbc2, #144988);
}
.header-bar {
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
  .drop-down-list {
    .drop-down-list-item {
      display: flex;
      min-height: 84rpx;
      border-bottom: 2rpx solid #e6e6e6;
      align-items: center;
      justify-content: flex-start;
      font-size: 28rpx;
      .drop-down-list-item-ul-li:last-child {
        margin-right: 0
      }
      .period {
        text-align: center;
        display: inline-block;
        color: #646464;
        width: 92rpx;
        font-size: 26rpx;
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
          font-size: 28rpx;
          > view{
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 20rpx;
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
    }
  }
}

/**底部部分css**/
.chat-form-wrap {
  width: 100%;
  z-index: 999;
  position: fixed;
  .chat-form {
    min-height: 90rpx;
    position: relative;
    background: #f6f6f6;
    display: flex;
    align-items: center;
    .add-btn{
      display: flex;
      align-items: center;
      height: 90rpx;
      padding: 0 32rpx;
      image{
        width: 54rpx;
        height: 54rpx;
        display: block;
      }
    }
    .key-board{
      display: flex;
      align-items: center;
      height: 90rpx;
      padding: 0 32rpx;
      image{
        width: 60rpx;
        height: 60rpx;
        display: block;
      }
    }
    .form {
      flex: 1;
      display: flex;
      align-items: center;
      .textarea{
        color: #333 !important;
        opacity: 1 !important;
        background-color: #fff !important;
      }
    }
  }
  .chat-form-buttons{
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    height: 400rpx !important;
    background: #f6f6f6;
    overflow-y: auto !important;
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
  .key-board{
    position: relative;
    font-size: 30rpx;
    padding: 8rpx 8rpx 8rpx 8rpx;
    background-color: #f0f2f8;
    z-index: 9999;
    .nav_1 {
      justify-content: space-between;
      height: 90rpx;
      background-color: #fff;
      margin-bottom: 4rpx;
      display: flex;
      align-items: center;
      margin-bottom: 8rpx;
      .key-board-ul-li{
        border-right: 2rpx solid #eee;
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
        padding: 16rpx 0;
        background-color: #fff;
        border-right: 8rpx solid #f0f2f8;
        box-sizing: border-box;
        border-bottom: 8rpx solid #f0f2f8;
        border-radius: 20rpx;
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
          border-right: 8rpx solid #f0f2f8;
          box-sizing: border-box;
          border-bottom: 8rpx solid #f0f2f8;
          border-radius: 20rpx;
          height: 100rpx;
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
          border-right: 8rpx solid #f0f2f8;
          box-sizing: border-box;
          border-bottom: 8rpx solid #f0f2f8;
          border-radius: 16rpx;
          height: 100rpx;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          .span1 {display: block;height: 100%}
        }
      }
    }
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


/* 长按菜单 */
.shade {
  position: fixed;
  z-index: 100;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  -webkit-touch-callout: none;
  .pop {
    position: fixed;
    z-index: 101;
    width: 100upx;
    box-sizing: border-box;
    font-size: 30upx;
    text-align: left;
    color: #333;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    line-height: 80upx;
    transition: transform 0.15s ease-in-out 0s;
    user-select: none;
    -webkit-touch-callout: none;
    transform: scale(0, 0);
    border-radius: 10rpx;
    &.show {
      transform: scale(1, 1);
    }
    &>view {
      padding: 0 20upx;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
      -webkit-touch-callout: none;
      &:active {
        background-color: #f3f3f3;
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

.drop-down-arrow1 {
  background-color: transparent;
  width: 60rpx;
  border: none;
  display: flex;
  justify-content: center;
}

.drop-down-arrow1 text {
  transform: rotate(90deg);
  font-size: 32rpx;
}

.msg-item {
  display: flex;
  margin-bottom: 24rpx;
  user-select: none;
}

.msg-item .sendErr {
  width: 40rpx !important;
  height: 40rpx;
  margin-right: 10rpx;
}

.msg-item .blue {
  color: #0087b4;
}

.msg-item:first-child {
  padding-top: 20rpx;
}

.msg-item.mymsg {
  flex-direction: row-reverse;
}

.msg-item.mymsg .message-content {
  margin-left: 0;
  margin-right: 24rpx;
  text-align: right;
  user-select: none;
}

.msg-item.mymsg .message-content .username {
  text-align: right;
}

.msg-item.mymsg .message-content .msg-cont {
  background-color: #2da0f5;
  color: #fff;
  display: inline-block;
  user-select: none;
}

.msg-item.mymsg .message-content .msg-cont:before {
  left: 100%;
  transform: rotate(180deg);
  border-right: 12rpx solid #2da0f5;
}

.msg-item.right {
  flex-direction: row-reverse;
}

.msg-item.right .message-content {
  margin-left: 0;
  margin-right: 20rpx;
}

.msg-item.right .message-content .msg-cont, .msg-item.right .message-content .username {
  justify-content: flex-end;
}

.msg-item.right .message-content .msg-cont {
  margin-left: 0;
  margin-right: -8rpx;
  color: #fff;
  align-items: center;
}

.msg-item.right .message-content .msg-cont .text {
  background-color: #0087b4;
}

.msg-item.right .message-content .msg-cont.nomar .img {
  padding: 0;
  border: 6rpx solid #0087b4;
  background-color: #fff;
}

.msg-item.right .message-content .msg-cont .arrow {
  border-right: 0;
  border-left: 12rpx solid #0087b4;
}

.msg-item .avatar {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.msg-item .avatar image {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
}

.msg-item .message-content {
  margin-left: 24rpx;
}

.msg-item .message-content .username {
  display: flex;
  font-size: 26rpx;
  /*line-height: 30rpx;*/
  color: #737373;
}

.msg-item .message-content .username span:first-child {
  display: inline-block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap
}

.msg-item .message-content .username .clock {
 display: flex;
 align-items: center;
 margin-right: 8rpx;
}

.msg-item .message-content .msg-cont {
  margin-top: 12rpx;
  font-size: 30rpx;
  color: #000;
  margin-left: -24rpx;
  display: flex;
  position: relative;
}

.msg-item .message-content .msg-cont .btnCon {
  position: absolute;
  background-color: #fff;
  left: 22rpx;
  top: 102%;
  border-radius: 16rpx;
  width: 10em;
  text-align: center;
  z-index: 1000;
  box-shadow: 0 0 8rpx 0 #bebebe;
}

.msg-item .message-content .msg-cont .btnCon p {
  padding: 20rpx 0;
  color: #333;
}

.msg-item .message-content .msg-cont .btnCon.bottom {
  top: auto;
  bottom: 102%;
}

.msg-item .message-content .msg-cont .btnCon p:first-child {
  border-bottom: 2rpx solid #e1e1e1;
}

.msg-item .message-content .msg-cont .text {
  max-width: 500rpx;
  word-break: break-all;
  background-color: #fff;
  border-radius: 8rpx;
  padding: 18rpx;
}

.msg-item .message-content .msg-cont .text .name {
  color: #0087b4;
}

.msg-item .message-content .msg-cont.nomar .img {
  padding: 4rpx;
  max-width: 480rpx;
  word-break: break-all;
  background-color: #fff;
  border-radius: 8rpx;
}

.msg-item .message-content .msg-cont.nomar image {
  -o-object-fit: contain;
  object-fit: contain;
  width: 440rpx;
  height: 302rpx;
}

.msg-item .message-content .msg-cont .van-image {
  background-color: #000;
}

.msg-item .message-content .msg-cont .arrow {
  height: 0;
  display: block;
  margin-top: 20rpx;
  border: 12rpx solid transparent;
  border-right: 12rpx solid #fff;
}

.msg-item .img-box {
  width: 440rpx;
  height: 302rpx;
}

.chat-content {
  z-index: auto
}

.icon-to-bottom {
  position: fixed;
  z-index: 100;
  width: 80rpx;
  height: 80rpx;
  right: 30rpx;
  border-radius: 50%;
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAMAAAC8EZcfAAABqlBMVEVHcEw2Njb5+fkwMDA7Ozv4+Pj6+vr19fVCQkL39/cuLi78/PwvLy8xMTE1NTX8/PwvLy8wMDDf39+9vb2pqanU1NTv7++zs7MuLi4xMTErKystLS0uLi4xMTEsLCz6+vr6+vr29vb9/f38/Pzs7Oz8/Pzw8PDc3NyGhoZubm55eXnz8/P6+vrY2NjCwsLY2Njz8/Pz8/Ph4eH09PTt7e3r6+vPz8/5+fmBgYFPT0+5ubnw8PD4+Pi8vLzv7+/y8vL6+vrb29v19fX29vafn5/7+/u4uLj8/Pzs7Ozs7Ozn5+eRkZH19fW/v7/j4+Pp6enm5ubz8/Pk5OSurq6bm5vKyspfX1/X19f39/fp6enQ0NBVVVXo6OjGxsadnZ2xsbG/v7/U1NT6+vrd3d319fU+Pj76+vqnp6f4+Pj4+Pj19fXt7e2tra3o6Oj09PRcXFzf39/MzMyvr6/Ozs6/v7/y8vLQ0NDu7u7w8PDX19fv7+/l5eXu7u7z8/Ph4eHf399QUFCioqLi4uKsrKz4+Pjq6urp6en39/ft7e3v7++EhIT39/f8/PympqZRj4lKAAAAjXRSTlMACdMMBtPR1QPUGM4SFA7PEB/f8f3l2PcbGh0hJCcjzqHRy8isv5aCOC8KwsMrH+PHnY2mdZ5OuRgtV1KOWqm4ln9vzkGwFrpE2txCsC2VpJyJfEI3JCNCyy1hFZBnRlRLMpAlxSN9DoVxyD9NP3IMOOn56PC/d7a6R6BqhoBteSBJVzS8iJi0Oao0Yar1uaHpAAAJ+0lEQVR42uXd93vTRhgH8DiOa6pYxoaGRo6DPLMTMkhCM8gmtMxSoJRdoOzVvfce/p97956kOw3bNyQ5fXq/EfrA5/m+dyfprXR0df1Pxj7f2MO0vcNkID2+0XElQxu7e/Lv+yvrpX8W65VKffGf0vrK/b9P3h1jmJ3RIcCDJ4/u7FT2B47Kzp1HTx44yvh1Y39slhxbr2c4ytLmH2NxGm3dg+X1Kit7xTNYZ3V9+UFMRruyzx5WHdwrLYaDrD58Ztc6et6lR7uWjrV0u4ZHif/73UeXoiVavLsPK26dbUoxw+skxsrDu9ERLd57K72szidzDxYJxt6V9yIiWrw7bHjU9mrgoEo2xjsWMQLeifuQnlvHgNLO8CoZI/oT7p8Im0h8y3WHZ+l8MO9gkLYRE+vLoQoJb7LE8Kgu3XawRodYmgyPCL6xzYqLx6vzGCmxsjkWjpDEN+XER3lpoeEmQohTYYRIfE/qXl5aYniJ9SfqQnJP8BzFp8zzE/fvf07uIhR9J0pMfCo8SnRCLJ1QEpLpt0N8YfA8RCTcmVIQkt1l1yovqW46hGHVmZR5d1JaCL6XE2x86ZAGG+LES0kh9iVOVqPwuYXVkwkZIfFViC9kHiWCsCIjBN/LamQ+l7D6UlgIvkmYf93R+Jgyo3k4KSgE39QunX7pSAadiLtTQkKyP+/Q/NLpaIW9vTsiOzb4XpSi97HC0gtuIfgSz+PwscLnCV4h+J7F42OFz0DIu0Dqzv6STscgxAulzrdQwIcmYFw+Rlh6wSOEAm/G6GOEmxxFJju02RujzxH2mu33a/AlS2SBxOUDISyUUrKdEAq8HGuBXUVeblNkCPBYPW4fFdaPtYyQFPjb3th9dBp+27LIUOD3TQgwXh+ZhugvNt9vUWQS4HonAqQRrreIkAQY9wr2ruTmEZIAVzpSYKbIK00jhADPmB0pMFNk80yTCEmAb3csQCfCt5tECAFe6lyANMJLwRFCgEc7GKAT4VGIMDDA7C8dDNCJ8JdsUIQQ4LsdDdCJ8N2ACCFAvER4AnzzyAE5wJEjh3gixMvEK4QAj1W5AnzrtUbjoATv0OuNxkeHOCKsHvNHCMCf+AI82GjICLGv0fiYJ8KffECyRGb4ZiAAhYXE1/iQZxbO+JYJBHiNr8LpAw0JoeV77U0eYPWaN0J7DfPtMX3iQtt3gG+n8a5jUuGj3HuMsJDXZ0d41FNjCDA3x78JCgr5fRZwLueOkGwypsBVREgo4LNqbLo3GlLhL4WuIgJCEZ8d4ZeuGkOAAlNQTCjmcyYhGyGZgkOC9wmcQkGfVeOhnA+Y+R2AAlsHl1DUh4QY+HvGC8xeM4VvZDiE4j5SY/NalgLxGklmz0jcabUVSvisSXgmm3RWCZmCCzJPm22EMj7r+XOBmYQE+LXUvXRLoZTPWiVfe4GZb0TXSFuhnM9aJd9kvMAhyZv9pkJZH5mEQx5gNjMj+zTSRCjtI8CZjLOMyYUuMyf9uBQolPcR4FzGudiRXUY/Lf88FyBU8BHgad3ZZ8iVWF9U6Gn5hCo+ss8s6s7VmOwy+oTKE7tHqOQj+8yEnvMATaldJlCo5iP7jBkykBWq+poAJ9SAVKjsSweXeFER6AiVfQBc9AFPqwJtobIPgKd9wDllICNU8gFwzgec4Qc27W71tfG1624xwBkfcIgb2KK71dfKx9HdosAhH/BXbmCr7lZfa1+77hYF/uoDficGbCY8cPCTtxS6Ww7wOx9wgftSF2V3y7nULXiAWf1n/puFCLtbzs3Cz66bBXS7lTFM/ruZCLtbFtA0MuztFr5h1dai6czIdWfWNHrDat3ya0ORdGYkuzNDGr3ltx6atAvdEXRmJLsz3Rc031OdtiB2rYuqu0V2mQUfMKdfNsVuqSPqbsEuY17WfZ0FXTsu+FASVXcLVfi45gHifUb7fu90t77XMkzzyF7Gt/dOd+s2u4idVfKDKXxHGEl3C03BH7SMvwWsG1+lwu2/yXbfUl8Zur8FnNW1q92h9t+ku2/dVzXd20SHSXj5isSje9jdLQS8cpm90DGT0LieCk8o70tdN9xTkO6Et6XaM6F2t8ga1v3/KwxqXBgPq4ep0r0cL3grTGt8IRWOUMWXuuCrMK3xRTOULqtSd9W86KswrXH/9TC6rGrd1ev9/grbNdaNiyl1oZovddHQM03e+kB7deE35T6wYvf3t4Jnl2Zf7EE1fielKlTzpd7phyUS9OoRLJPCvGqnWq07PV8IWCKuZSIfoXJ3yw4w8OUyGuGsci9doXs+2yxAJsLRe6pCed+90aYBWq+I4givKryg16fQvUTAq06A+7qaR5j/U0HYtLvF4/sz3zxANsJtszNvAZvbrQKkERr5jc686L2RN1oEaEeIi/zB8U68Kn/8A1zgVl8bWJcTVOS/7sUPvPcXKnDgRSQgwvxS/J9rLOXbBcisk/78cNwfvAwjX6sV4i1yrNMQJmDbAruKbORH1+IEro3CCk5yfhYG03BkPL7P1sZHOCYgW2SYhtuP4/rw7/G2PQF7OL5MRBGi7RpNw/zTrXg+ndx6mscTMJvg/7gTpmFhYLUcx8en5dWBgsFZYFpkWCgDq1vRf767tTpgL5Aezu+LGeHTx1F/AP34KesT+EQ7mQPh9ni0n5CPb4MvJ+Bjhf35gZG1KD/CXxsZwBuMmM9eynizQRmO1qI7xqA2ivPDG4zMQQt2lQeHozoIYnjQrq/cURVEWMgfXpqO4iiN6aXD+YKkzyscqYV/GEltRMXnCNFug5dKcaMc7nEu5Y0iXh6wvyTkD5yB/VAH4c1amAfi1G6CTxfa/1oIcZmLN6bDOlJo+kYRyqvmo8KcVebR2XAOZZodtcqbU/PZQqvMBUT8cV79WKv5HxGvYJU3EcbBW5YQh3i4ePO82sFg528WD0N8ofjso9USSbTfwExExFNny7JHq5XPnsI8mH25pFXeUA5/gxDxTMR1Lo4Mj8scTjc+PFIk1dUyNL6wzs9DIZI6Q4qDt85eETve78rZW4OQnlXdZCLkAwghxBxDfOPGuS3eAxK3zt14g+HlQoyvGZEYb23Uyu2OmCzXNm4RXWQ8R0iJhmVEyKXh+S/KwYd0lr+YH15COEtnMLyozhGFqZjLuIzFwcHBU6ufzZ4/V/v80+lyefrTz2vnzs9+tnoK/UbRpcO8ZCQ85hTgBCwXTCTG/AAoMdM1imBDOKLDPKxL9ER+li0hkhjRfAQkUiInHkiFB/51HnD9mkbDS/TEchowItpGQBoGYoKTjgKiGQbgHF0ivvOUbSNGWkqA2sP6AbYhnKPrie1EamrESKxETPfAP8sBzqWL9VBvMGIkZmIoHfjX8BuJ2HVeI1FaTmaQn7In4HfFPLwn8idcw3s6f1dHxt7+hwMClPv+U/9CRNf/ZPwL+6IcPUObdoIAAAAASUVORK5CYII=);
  background-size: contain;
  transition: all .3s
}

.icon-to-bottom.has-new-message {
  background-color: #2da0f5
}

.icon-to-bottom.bottom80 {
  bottom: 120rpx;
}

.icon-to-bottom.bottom250 {
  bottom: 500rpx;
}

.icon-to-bottom.bottom330 {
  bottom: 640rpx;
}

.icon-to-bottom.bottom260 {
  bottom: 520rpx;
}

.icon-to-bottom .unread-message {
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

.coIcon {
  position: fixed;
  z-index: 80;
  right: 30rpx;
}

.coIcon.haxi {
  top: 386rpx;
}

.coIcon .span1 {
  width: 70rpx;
  height: 70rpx;
  background: #0087b4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  position: relative;
}

.coIcon image {
  width: 40rpx;
  height: 40rpx;
}

.chat-list {
  position: relative;
  font-size: 28rpx;
  scroll-behavior: smooth;
}

.chat-list-wrap {
  flex: 1;
  padding-top: 5rpx;
  overflow-y: auto;
}

.open-no-detail .van-col {
  text-align: center;
  height: 80rpx;
  line-height: 80rpx;
  box-sizing: border-box;
  border-bottom: 0.42667rpx solid #e6e6e6;
}

.open-no-detail .longDetail {
  max-height: 440rpx;
  overflow-y: auto;
  width: 100%;
}

.van-col {
  float: left;
  min-height: 0.026667rpx;
}


.van-col--1 {
  width: 4.16666667%
}

.van-col--offset-1 {
  margin-left: 4.16666667%
}

.van-col--2 {
  width: 8.33333333%
}

.van-col--offset-2 {
  margin-left: 8.33333333%
}

.van-col--3 {
  width: 12.5%
}

.van-col--offset-3 {
  margin-left: 12.5%
}

.van-col--4 {
  width: 16.66666667%
}

.van-col--offset-4 {
  margin-left: 16.66666667%
}

.van-col--5 {
  width: 20.83333333%
}

.van-col--offset-5 {
  margin-left: 20.83333333%
}

.van-col--6 {
  width: 25%
}

.van-col--offset-6 {
  margin-left: 25%
}

.van-col--7 {
  width: 29.16666667%
}

.van-col--offset-7 {
  margin-left: 29.16666667%
}

.van-col--8 {
  width: 33.33333333%
}

.van-col--offset-8 {
  margin-left: 33.33333333%
}

.van-col--9 {
  width: 37.5%
}

.van-col--offset-9 {
  margin-left: 37.5%
}

.van-col--10 {
  width: 41.66666667%
}

.van-col--offset-10 {
  margin-left: 41.66666667%
}

.van-col--11 {
  width: 45.83333333%
}

.van-col--offset-11 {
  margin-left: 45.83333333%
}

.van-col--12 {
  width: 50%
}

.van-col--offset-12 {
  margin-left: 50%
}

.van-col--13 {
  width: 54.16666667%
}

.van-col--offset-13 {
  margin-left: 54.16666667%
}

.van-col--14 {
  width: 58.33333333%
}

.van-col--offset-14 {
  margin-left: 58.33333333%
}

.van-col--15 {
  width: 62.5%
}

.van-col--offset-15 {
  margin-left: 62.5%
}

.van-col--16 {
  width: 66.66666667%
}

.van-col--offset-16 {
  margin-left: 66.66666667%
}

.van-col--17 {
  width: 70.83333333%
}

.van-col--offset-17 {
  margin-left: 70.83333333%
}

.van-col--18 {
  width: 75%
}

.van-col--offset-18 {
  margin-left: 75%
}

.van-col--19 {
  width: 79.16666667%
}

.van-col--offset-19 {
  margin-left: 79.16666667%
}

.van-col--20 {
  width: 83.33333333%
}

.van-col--offset-20 {
  margin-left: 83.33333333%
}

.van-col--21 {
  width: 87.5%
}

.van-col--offset-21 {
  margin-left: 87.5%
}

.van-col--22 {
  width: 91.66666667%
}

.van-col--offset-22 {
  margin-left: 91.66666667%
}

.van-col--23 {
  width: 95.83333333%
}

.van-col--offset-23 {
  margin-left: 95.83333333%
}

.van-col--24 {
  width: 100%
}

.van-col--offset-24 {
  margin-left: 100%
}

.van-count-down {
  color: #323233;
  font-size: 14.01335rpx;
  line-height: 20.00005rpx;
}

.predict-no-detail .van-col {
  font-size: 28rpx;
  text-align: center;
  height: 56rpx;
  line-height: 56rpx;
  box-sizing: border-box;
  border-bottom: 1rpx solid #e6e6e6;
}

.predict-no-detail .van-col.right-border {
  border-right: 1rpx solid #e6e6e6;
}

.predict-no-detail .longDetail {
  max-height: 380rpx;
  width: 100%;
  overflow-y: auto;
}

.pk10 .bg-orange {
  background-color: #ff9b00
}

.pk10 .bg-blue {
  background-color: #0087fe
}

.pk10 .bs-red {
  color: #fe0101
}

.pk10 .bs-green {
  color: #92d17f
}

.pk10 .bs-blue {
  color: #0280fe
}

.pk10 .big-single {
  border-radius: 4rpx;
  height: 32rpx;
  line-height: 32rpx;
  width: 32rpx;
  font-size: 14.01335rpx;
  margin-right: 4.00005rpx;
  text-align: center;
  font-weight: 700;
  display: inline-block;
  color: #fff;
}

.word1 {
  text-decoration: none;
  font-style: normal;
  color: red;
}

.word2 {
  color: #0087b4;
}

.right-icon .span1 image {
  width: 46rpx;
  height: 46rpx;
}

.right-icon .span1 {
  width: 76rpx;
  height: 76rpx;
  background: #0087b4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8.01335rpx;
  position: relative;
}

.right-icon {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 80;
  right: 30rpx;
}

.game-switch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999
}

.game-switch .game-switch-main {
  width: 100%;
  height: 100%;
}

.game-switch.animated .game-switch-bg {
  animation: fadeIn2-05381536 .3s ease-in forwards;
}

.game-switch .game-switch-bg {
  height: 100%;
}

.game-switch.animated .game-switch-content {
  animation: slideRight2-05381536 .3s ease-in forwards;
}

.game-switch .game-switch-content {
  width: 480rpx;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  background-color: #ededed;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.game-switch .game-switch-bg {
  height: 100%;
  background: rgba(0, 0, 0, .5);
}

.game-switch .game-switch-main {
  width: 100%;
  height: 100%;
}

.bet-footer {
  z-index: 100;
  width: 100%;
  background-color: #fff;
  padding: 16rpx 10rpx;
}

.bet-footer .footer-btns {
  display: flex;
  justify-content: space-around;
}

.bet-footer .footer-text .red-text{
  color: red;
}

.bet-footer .footer-text .span{
  margin-left: 48rpx;
}

.bet-footer .footer-text {
  display: flex;
  font-size: 28rpx;
  margin: 12rpx;
}

.bet-footer .footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

//todo
.bet-content {
  position: relative;
  z-index: 101;
  flex-direction: column;
  display: flex;
  overflow: hidden;
  height: 100%;
}

.odds-box {
  height: 100%;
  display: flex;
  justify-content: space-between;
  border-top: 1rpx solid #ddd;
}

.odds-box .left-tab {
  background-color: #ededed;
  border-right: 1rpx solid #ddd;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.van-sidebar {
  width: 162rpx;
  overflow-y: auto;
  flex: 1;
}

.odds-box .left-tab .van-sidebar .van-sidebar-item--select {
  background-color: #0087b4;
  color: #fff;
}

.odds-box .left-tab .van-sidebar .van-sidebar-item {
  padding: 0;
  background-color: #ededed;
  height: 94rpx;
  line-height: 94rpx;
  text-align: center;
  border-bottom: 1rpx solid #ddd;
}

.van-sidebar-item--select, .van-sidebar-item--select:active {
  background-color: #fff;
}

.van-sidebar-item--select {
  color: #323233;
  font-weight: 500;
}


.van-sidebar-item__text {
  position: relative;
  display: inline-block;
  word-break: break-all;
}

.odds-box .left-tab .van-sidebar .van-sidebar-item--select {
  background-color: #0087b4;
  color: #fff;
}

.van-sidebar-item--select {
  color: #323233;
  font-weight: 500;
}

.van-sidebar-item {
  position: relative;
  display: block;
  box-sizing: border-box;
  padding: 20rpx 12.8rpx;
  overflow: hidden;
  color: #323233;
  font-size: 28rpx;
  line-height: 20rpx;
  background-color: #f7f8fa;
  cursor: pointer;
  user-select: none;
}

.odds-box .right-content {
  flex: 1;
  overflow: hidden;
  background-color: #ededed;
  padding-bottom: 10rpx;
}

.odds-group-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.odds-group-box .quick {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.bet-footer {
  background-color: #fff;
  padding: 16rpx 10.00005rpx;
}

.bet-footer .footer-btns {
  display: flex;
  justify-content: space-around;
}

.bet-footer .footer-btns button {
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

.bet-footer .footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bet-footer .footer-content .van-field {
  background-color: #ededed;
  flex: 1;
  height: 80rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
}

.bet-footer .footer-content .betbtn {
  width: 156rpx;
  margin: 0 18rpx;
  background-color: #0087b4;
}

.van-button--normal {
  padding: 0 16rpx;
  font-size: 14.01335rpx;
}

.van-button-is-hover {
  color: rgba(255, 255, 255, 0.6);
  background-color: #179b16;
  border-color: #179b16;
}

.van-button--info {
  color: #fff;
  background-color: #1989fa;
  border: 1rpx solid #1989fa;
}

.van-button {
  position: relative;
  display: inline-block;
  box-sizing: border-box;
  height: 90rpx;
  margin: 0;
  padding: 0;
  font-size: 28rpx;
  line-height: 90rpx;
  text-align: center;
  border-radius: 16rpx;
  cursor: pointer;
  transition: opacity .2s;
}

.bet-footer .footer-content .reset {
  width: 156rpx;
  background-color: #f93333;
  color: #fff;
}

.odds-box .left-tab .van-sidebar .van-sidebar-item--select {
  background-color: #0087b4;
  color: #fff;
}

.odds-group-box .quick-header button {
  margin-left: 1%;
  flex: 0 0 19%;
  font-size: 24rpx;
  color: #323233;
  /*background-color: #fff;*/
  border: 1rpx solid #ebedf0;
  height: 60rpx;
  padding: 0 6rpx;
  line-height: 2.3;
  margin-top: 10rpx;
}

.van-button:before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background-color: #000;
  border: inherit;
  border-color: #000;
  border-radius: inherit;
  transform: translate(-50%, -50%);
  opacity: 0;
  content: " ";
}

.van-button--small {
  height: 60rpx;
  padding: 0 6rpx;
  font-size: 26rpx;
}

.van-button--default {
  color: #323233;
  background-color: #fff;
  border: 1rpx solid #ebedf0;
}

.van-button__content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.van-button__content:before {
  content: " ";
}

.odds-group-box .quick-header {
  padding: 0 0 10rpx 0;
  background-color: #fff;
  border-bottom: 1rpx solid #ddd;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding-right: 10.00005rpx;
}

.oddsgroup {
  background-color: #fff;
  display: flex;
  flex-wrap: wrap;
}

.oddsgroup.two .odds:nth-child(2n-1) {
  border-right: 1rpx solid #ddd;
}

.oddsgroup.two .odds {
  width: 50%;
}

.oddsgroup .odds {
  width: 100%;
  box-sizing: border-box;
}

.odds {
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
}

.odds .odd {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.odds .odd {
  color: red;
}

.odds .oddname {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-weight: 500;
  color: #000;
}

.odds .oddname .span1 {
  font-size: 28rpx;
  margin-right: 8rpx;
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

.returnicon {
  display: flex;
  justify-content: center;
  margin-bottom: 10rpx;
}

.returnicon image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 100rpx;
}

.bet-box {
  overflow: hidden;
  position: relative;
  z-index: 100;
  height: 100%;
}

.main-content {
  display: flex;
  flex-direction: column;
  position: relative;
  justify-content: space-between;
  height: 100%;
  overflow: hidden;
  flex: 1;
}

.van-field__control, .van-field__body, .van-cell__value {
  height: 100%;
}

.van-field__body {
  padding-left: 20px;
}


.text.green {
  color: #00d123;
}

.text {
  font-size: 30rpx;
  font-weight: 500;
}

.odds-group-box .van-collapse .van-cell {
  padding: 4.00005rpx;
  background-color: #f9f9f9;
  border-bottom: 0.53335rpx solid #eee;
  justify-content: space-between;
  padding-left: 50%;
}

.van-cell--clickable {
  cursor: pointer;
}

.van-cell, .van-cell:after {
  box-sizing: border-box;
}

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

.skin_yuan .open-num.min .drop-down-list-item-ul-li {
  width: 52rpx;
  height: 52rpx;
  font-size: 30rpx;
  border-radius: 50%;
  font-weight: 700;
  justify-content: center;
  display: flex;
  align-items: center;
}

.skin_yuan .open-num .ball-9 {
  border-color: #05a3da;
}

.skin_yuan .open-num .drop-down-list-item-ul-li {
  display: block;
  width: 17.86665rpx;
  height: 17.86665rpx;
  margin-right: 12rpx;
  text-align: center;
  line-height: 17.86665rpx;
  border-radius: 50%;
  border: 6rpx solid;
  color: #222;
  font-weight: 700;
  background: #fff;
  font-size: 14.01335rpx;
}

.skin_yuan .open-num {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 12rpx 0 0;
}

.skin_yuan .open-num-list .open-num-item {
  display: flex;
  padding: 0.85335rpx 0;
  align-items: center;
  border-bottom: 2.13335rpx solid #e6e6e6;
}

.skin_yuan .open-num-ul-li {
  width: 15.19995rpx;
  height: 15.19995rpx;
  font-size: 8.5334rpx;
  line-height: 10.6667rpx;
  box-sizing: border-box;
  margin-right: 7.99995rpx;
  text-align: center;
  line-height: 17.86665rpx;
  border-radius: 50%;
  border: 2.13335rpx solid;
}


.skin_yuan .sscSum{
  /*width: 93.75rpx;*/
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-left: 20rpx;
  font-size: 28rpx;
}

//预测
.skin_blue .big-single {
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
//输入框
.chat-form .form .textarea{
  width: 100%;
  color: #333;
  border: none;
  resize: none;
  border-radius: 10rpx;
  font-size: 30rpx;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: 100%;
  padding: 16rpx 20rpx;
  direction: ltr;
  font-weight: 600;
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
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAABmFBMVEVHcEwAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7QAh7