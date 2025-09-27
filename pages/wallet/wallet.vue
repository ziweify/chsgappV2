<template>
  <view class="layout">
    <TsCustom :backUrl="backUrl" :isBack="true" title="钱包中心"></TsCustom>
    <view class="flex-layout main-container">
      <view class="flex-content">
        <view class="mysection">
          <view class="section-div bord">
            <view class="section-div-1">
              <view class="section-div-2">
                <view class="section-div-3">
                  <text class="section-div-3-1">总资产</text>
                  <text class="section-div-3-2">今日统计</text>
                </view>
                <view class="section-div-3-3">{{ balanceInfo.kmoney }}</view>
              </view>
              <view class="section-line"></view>
              <view class="section-div-4">
                <view class="section-div-4-1">流水：
                  <text>{{ balanceInfo.jetotal }}</text>
                </view>
                <view class="section-div-4-1">回水：
                  <text>{{ balanceInfo.backWater }}</text>
                </view>
                <view class="section-div-4-1">盈亏：
                  <text :class="{ 'm-red': balanceInfo.sy < 0, 'm-green': balanceInfo.sy >= 0 }">{{ balanceInfo.sy }}</text>
                </view>
              </view>
            </view>
            <view class="van-grid van-hairline--top">
              <view @click="goto('')" class="van-grid-item" border="none" style="flex-basis: 33.3333%;" url="/pages/uppoint/uppoint">
                <view role="button" tabindex="0"
                      class="van-grid-item__content van-grid-item__content--center van-grid-item__content--clickable van-hairline">
                  <view class="des-img van-image">
                    <image
                        src="data:image/png;base64,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"
                        class="van-image__img"></image>
                  </view>
                  <view class="des-p">申请上分</view>
                </view>
              </view>
              <view @click="goto('')" class="van-grid-item" border="none" style="flex-basis: 33.3333%;"
                         url="/pages/downpoint/downpoint">
                <view role="button" tabindex="0"
                      class="van-grid-item__content van-grid-item__content--center van-grid-item__content--clickable van-hairline">
                  <view class="des-img van-image">
                    <image
                        src="data:image/png;base64,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"
                        class="van-image__img"></image>
                  </view>
                  <view class="des-p">申请下分</view>
                </view>
              </view>
              <view @click="goto('')" class="van-grid-item" border="none" style="flex-basis: 33.3333%;"
                         url="/pages/collectiontype/collectiontype">
                <view role="button" tabindex="0"
                      class="van-grid-item__content van-grid-item__content--center van-grid-item__content--clickable van-hairline">
                  <view class="des-img van-image">
                    <image
                        src="data:image/png;base64,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"
                        class="van-image__img"></image>
                  </view>
                  <view class="des-p">收款方式</view>
                </view>
              </view>
            </view>
          </view>
          <view class="section-div bord-all">
            <view class="bord-all-box">
              <view class="van-grid van-hairline--top">
                <view @click="goto('pages/wallet/walletApply',1)" class="van-grid-item" style="flex-basis: 33.3333%;">
                  <view class="van-grid-item__content van-grid-item__content--center van-hairline">
                    <view class="des-list van-image">
                      <image
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAA0CAMAAADypuvZAAACjlBMVEVHcEyFx92a0eNqu9Zv4PWBxNyg0+QAibgAjLMAi7m13esAi7fO6PJOrc4AibsAirgAibkAjqoAibgAibkAirkPlsEAibgAgKoAhLMAibkAirYAirkAi7oAirn///8pnMR1v9n9/v4AiblFqsw4o8cAibcPlsEAh7QKkb4AibgAibgAiLkAi7kAibYAirgAhrUAibkAgL8AibkAibgAibgAi7kAibp9w9sAibEAiLkalr8/p8oEi7qRzOAhmMIMj7tbs9Eun8YWlL9svNas2eiy3OqIyN0Ahrbv9/rq9fkpnMM1ocfz+fw1osdWsdBBp8rG5O/U6/MtncT8/f6Z0OOEx9wblr9httQXlL7j8/hxvddit9RmudX4/P0tn8aSzOFMrM5Tr9AAgIAAhryr2Ohzv9kAi7l2v9kAirkIjroAibgAibh4wdoAibgUk75w4fUAmZkAibn2+/wAibgJkb0Airhw4vUAjL/e8PZxvtgJkL0Aibhx4vYAibkAibgAirkan8Zw4PVx4PUOkLwAibhx4vf///8AiLhx4/Zx4/YAibgOlMAAiLgAf7YAirhw4fYAibjr9vqZ0OMonMMAiLgAibmRzOEPlcEAibkAirgAjrMAibkAirkAibkAiLcAirkAirkAiLgAirkAirgAjLkAibkAmcwAirgAibgAibkAirUAjL0AirkAiLcAirkAjsYAirgAj78AibkAibQAgL8AirgAiroAibgAiroAi7kAiroAhbEAibgAgP8AiboAiroAi7gAirgAiLkAirkAir8A//8AibgAibgAirgAh7gAibgAhrwAibYAi7kAirgAibgAjLUAirkAibYAibcAirkAh7z///8QlsFw4PUbn8ftCOHRAAAA1nRSTlMA6+7nx+rv2RQW8i724ym/0gnCkbL9zgYbyyPEcqP+3uj+weHgJ/wR7snDgwscUyaaBNaCc02T6g1J3OHZ7d3a5N7b5/Hx6xX8+97f/N/k4fX33v7u69zl3Pno5eb93u3j4wIT8eg36MvaNq3pqdu4BbX90OyBthT55+2iWK+Tjvzc59rYYQGUUWy++50On/W8++3eK8/s/b5eG3/aio6+rlqwZDOgCte4gBgfbUe1CdEQUCkMelmea6A/F3ACXTBE1XTGGAHRXX5EsyY4LNjNH8BUq8wi0CDNTQAAAjFJREFUSMft1sVTXEEQwOEm9iN5BGK4BA0SCB53d3d3d3d3d3d3d3d36bf8Nzns5rGVhApzSBUH+tRT3d9cZmp6RJwYO2X0jExPHjYhaOEGTz4rI2hemvw9gpOBPZ7FAmCfJ18EbCwApQMc9GywHDjsKewGdhSA/AEqu/OKAFU8hUpAhd+7U7dblpXooGvWWQf9sD47aK9lWQmTPabONIAaDgonwkGR1HRQdYDYBBERGRqKAWK9iIi0AoAjEgKQLRLKDXnwEogU+UaGyFsgReQAAGtFRKSsG50RuQVPHslzuCPyGj7mSuZ3voi8As6LHAUgwBuFXpHgm/f9RZ5CVrq8yI14L/IVeCNyN+eCyHF3X8BKL8SJSyIi8jgLuOgrIiIfPgHPwkREJOTQ/qRdtm3nuZauyUecvnrvupV9CoDwh2mp73IuAxB0O+zkuWPJJNm2bdt5Lpdrfj76V1Rz0KTCI9tBpYqRARoTv8wYTZytW7aZojmqutMUlVbVMkUP1W/g52OMmqlqR1PUXVV7mKISqurzf1G7/nWN0ZAYbdPUFA1X1V6mqJyqlix6qGqX9i2NUQvVqIGmyE9Vyxcj6KyqcUBzVe0HDFLVWsB4Vd3qPWpmeqFRqn0aAY2jtHVPoF43HdAEaDtVY+JgroNWe9+IwX17A9BpREMAOkR3dZ96dDzA9HWBgYGLNy1ZIYV/y/lzupuhYWZos/tvlGKEVrnRyFgDMy7k198t0bewUdsNfgJXoUbg404/yAAAAABJRU5ErkJggg=="
                          class="van-image__img"></image>
                    </view>
                    <view class="des-p">申请记录</view>
                  </view>
                </view>
                <view @click="goto('pages/wallet/wjsBetrecord',1)" class="van-grid-item" style="flex-basis: 33.3333%;">
                  <view class="van-grid-item__content van-grid-item__content--center van-hairline">
                    <view class="des-list van-image">
                      <image
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADsAAAAsCAMAAADsKDCiAAAClFBMVEVHcEwAibdx4/9v4PVsvNaEx9x2wNkAibcAjqqPy+Bw4fUAirgJkL0Ah7QAi7kAirhQrs4AibEEi7gAgL8AhrYAgLNv4PUAircAgKr5/P3+//9xvdcNkLsAirdw4PUzocae0uP///9w4PX7/f4AircAircAiLcMk78AirgAf7YOlMAPlsAAh7cAibYAiLtDqctSr89etNE4o8cAircAircAirYBibcAirYAircAircAirgAhrwAircnm8IAjrh5wtoAibcAiLgAgL/t9/o8pcgAibEAibgAirgAirY3o8YAirfC4+4AibgAjLMAibcAibYAibcAircCi7cAirgAi7kAirjn9Pjy+fwAibgAibgAjrgAirYAiLcAlLwAircAgK8AibZHqcsAibkAjLcAirYAj78EjLgAiLYAi7cAi7gAircGjLgAi7YAirc1ocYfmMAHjLmi1ORqudUnnMMrncORzODB4+0OkLsAibn9/v4Jjrrw+PsAircAirn0+vz1+vwYlb8Ci7ghmMEA//8AkrYAibcAirfg8feg0+QAkrYAibdsu9X+/v8Tkr18w9r5/P36/f0AircAhbFFqMocl7/6/P0Airfp9PgAibggo8olpswalL4AiLUAibgVk70AVaoAh7cAibcAqqoAircAiLYAirgAi7gAh7QAi7kAirYAgJ8AiLYAmcwAgP8AibcAirYAibgAgIAjmcEAj7gAiLYAibgAirYAhbQalr4sncMAircAZpkAibgAjLkAhrUAiLcgmMAAjsYonMIXlL7H5e8un8TA4u0AirgAircAibYAibcAirau2ugblr+23esQlsBw4PX///8mp8xc0Ole0usSl8EoqM1Au9oYnMRCvdsRl8EZncV2sunIAAAAz3RSTlMAuAnc5+vp2QnsgNrrEQuh4w3ZBBUK/LAG/v7o2rn53+7+xv5xZmf2rA75/iCzD+Hj5eCq15DZs7G1txPV3hLprSsM++AaNpas4I70qRTFqKZ82UgWyfr8tIQkP0cTvxBU4l81hRDZrFG2pNlCxN/c2u/n3d7s9NpU/tr80YP8/dvZ3QEOka757wer5/7b6f3+gxfi3P6S+6/089w+mtsDNcsDzMjTfSIhIwh0BQLOob4C3RlJ1r0s3N7KBY9UN3LdCd7c9d70PXhb0Jbx3PI3VCM2AAACZklEQVRIx52VZXfUQBSGb3eBoWvdLXUqVKi30OJOcXd3d3cvUtzd3d3d3ekOLn+GzMQmS2TI82HP+07uc5Izm5wBUHG4nDFBE2KcLgfo40gLWpJmILuCHLj0XSeP69R3k7/++v7nW7khv39+/vElWVc9sq+cg70H/jXXLkYeHteDVvpCVG8sQu4sazXLjVBSa40anY0E3J7cPDMxL9fjJnMNvaxbB0l8LC5+jvQ5NFWJEYw6UFmtiHElfbVqOp6ulHGqG2btRpZijKfIrUsVWR2JrN1lSwQ3RamDZHcUh4vWx6dWU1tb2S2wcqctEH7mLiWPniiuTJbUuMakPalA+ITxBxrusNu0eecmMfkXblgjpsGiO4CWmlhDDVVN3ILx/P00rhaubKepjehOsnA3Jgh9OY27heSnaZjojqDlbjjhBcavaLjGPPPsVCxt04x0PGcMTRmi2x1Z7dXMWXLakVJXDB1E9yDi+Y/8ffo2Y2q70LfKzG2JcUITtfam6tWTPO7EeGGbWjELAeJeR1z3Dce4Yw+mlxD3ETvxsqjomcE32H54JFt7EvchskV14j62524l7gN77mXiZttzrxD3nj335n2AHGSTfIDbdt3XADfsum8BMkOWYqMq6zJ0QsjgG4D+2pX6ow1Odojupp18DxChWajnBUN8XTWjBQBD2N6vKZjg68TOvgOozdQGjcCUFrVYuRAWqWV8Z7AgMJZxn8I6JYdFgSU5zZXxWwDz5JzUCzgo28N8hCt2SXfdBlwUrpLOYHIUHs48gdClUwHg5Nz5owgdz4gT28X8sxfgPzh25jQ9f/8CW/i0FvV/sdIAAAAASUVORK5CYII="
                          class="van-image__img"></image>
                    </view>
                    <view class="des-p">未结记录</view>
                  </view>
                </view>
                <view @click="goto('pages/wallet/report',1)" class="van-grid-item" style="flex-basis: 33.3333%;">
                  <view class="van-grid-item__content van-grid-item__content--center van-hairline">
                    <view class="des-list van-image">
                      <image
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC8AAAAyCAMAAAD7sXLbAAACJVBMVEVHcEzH5e/N6PIEjroCjLnA4u3U6/MAibcAiblw4fb///8OlL8GjLo1ocYJjrr1+vwBibcCi7f4/P0Uk71Nrc0Rkr2SzOBIqsv2+/z0+vx2v9lJqswPkLvS6vNbs9CLyt4blr+e0uPR6vNkt9NFqssBi7jV6/Se0uRFqcu/4u2m1uUrncMhmMHZ7vTO6PL9/v5UsM8un8SSzOHt9/pUsM/3+/2Z0OLL5/D5/P38/v79/v+b0eO43uyf0+RXstAMj7pEqcv7/f6/4ewIjLlsvNb6/f08pchv4Pa03OpRrs6Y0OL5/P684Oz5/f6g0+RgttIOkLs9psh9w9vE5O7n9PiQzOAAiLsGjrsAirVw3/cHjrsCi7j+/v84pMiHyN2UzuGPy+B+w9oAibeXz+IPlb8Mkr6Yz+J3wNmNy+Bw5PZx3/UtncMLk75Vqv8CjLhw4fZv4PQAibgAibcMk74AibFw4PVw4fYAgIAAjLlw4fZx4fhw4fWA//9x4/gAibdx4vUAirlu4fUA//8AibYAibcAh7gAjLMOlcAAiLcAiLc+utofosoAiLgAirYAibcAgL8QlsAAh7YAibcAi7gHjbpZs9AFjLil1ucVlL6Wz+Gh0+ROrczy+fvL5/DT6vOUzuGr2ej0+vxTsM+/4u223evD5O4Ah7YAirgAircAibgAi7cAibhw4PX///8QlsBBu9vD5O91wtp3w9sbm8MXmcF/x916xNufqLYwAAAArHRSTlMA9fbj3vT32VRU/vvZ39r92dn92+Lb7eL9/eji2/bl69zu9ubh2/fu4fTw3t349v7j3uz75P3u9f7+/u7y7uTa4f702uf+4FPy4+398/3v5drg6fT67A/kSCDn3v7k6+3s6s3t/PPt6PA5T97wA9/8jITJ9g3PywI+5CLLAkhqamkzAajLRBT6Z1jvlHaWxwj+MVLb2eTZ8tvt7+P89vfw8Pzj8/L0QrPXtkDW3gYb+wAAAdBJREFUSMfd1VdTU1EUhuFg1KUJvWNBBcWGiL2LFWmigg2xY+8K9kazggVRbFixQt5j9/d5sQkJ4eyT7Q0z+t19M8+ZWXudi+Vyffj8ScJm98kal0qnmKXhrPIfDb1cU77L1N9U3pTLFWO/qfqG1+u9ff701XoTv8WyLMuyvvh8vhMmfk/AH68I7yutgPcd6uMTi/J79cPbgv3QUJ85lZjJQX3/Vr47+DXzgIzInr7LA1/1Pn0pANP9fTvAN61fvBIA5qeovhPggHb+3LlA1ihgfYKISBXAhoE6X7gaGJkQuwwoEIldBJAsOp8YD+QkiYyeAayImwSwQ3R++CxgzggRkZkeiFkIsE90fkIqELFWlTHq2cwWnZ+WBpTndX8cPQWABaL1ZcDE6J63RBUD40Xvo+IpWR602mEeSsXBS/aSuF5/et1YcfT6/J/+7fsBoXn9RO8j0+ibpw7+jY1PdpjneUdEaJ4l/UP7THk3SJNXP218Wzva/LbxD1P1/pfdPI9eDLbPy8c/+nE/q8L71vtB/qDBPToS8GeOGvhxe/3+4gWz+3vM7Xa7my7XXfqbe12r7vVdU39L+WZD3nhd+Xt3jPipcy5/Wh4MCZvNG7vxH1SHCgm0cWPvAAAAAElFTkSuQmCC"
                          class="van-image__img"></image>
                    </view>
                    <view class="des-p">两周报表</view>
                  </view>
                </view>
                <view @click="goto('pages/wallet/moneyLog',1)" class="van-grid-item" style="flex-basis: 33.3333%;">
                  <view class="van-grid-item__content van-grid-item__content--center van-hairline">
                    <view class="des-list van-image">
                      <image
                          src="data:image/png;base64,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"
                          class="van-image__img"></image>
                    </view>
                    <view class="des-p">积分账变</view>
                  </view>
                </view>
<!--                <navigator class="van-grid-item" style="flex-basis: 33.3333%;" url="/pages/awardReport/awardReport">
                  <view class="van-grid-item__content van-grid-item__content&#45;&#45;center van-hairline">
                    <view class="des-list van-image">
                      <image
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAyCAMAAADC1sOAAAACAVBMVEVHcEwAi7dYsdBftdMAibcEjbpYs9AAibdgttJqutRoudUAibcHjru74ewOlcAAibcAircAibcAkrYAgL8AircAiLUAi7kAgIAAircAirgAiLUAibgAibgAibcAibcAircAirgAgKoAibcAh7YAibgAirgAmZkAhbEAirYAh7cAibgAibcAirgAibcDjLgBi7gEjroAirgLk74AircGjroAircPlcAJkb0GjrsAirgAibcAibYAirZCqMk7pckAibVw4fYAgLMNlL4PlsABi7gAjL9Wy+hw4PZg3/9w4PVs4PcAhrwAirdw4PVv4PUancZx4fZv4fUAi7cAhrZx4PUAirgAirec0eSj1OUAircAirgAkLwAibcAiroAiroAirUAirUAibgAiLcAibcAAP8AibgAircAgP8AgKoAirgAh7cAirYAircAirgAibgAj7wAjLQAiLgFjboAh7cAiLcAibgAibYAircAj7gAlb8AirkAibYAibYAh7RatdMAibgAh7cAibcAibkAibgAqqoAi7gAibQAi7cAirgAgJ8AiLgAircAirgAirgAibcAmcwAkrYAirYAhq4AirkAi7YAi7gAirgAVaoAjLkAibYAibgAibcAircAi7gAibYAibcAirYAibYAibb///8QlsBw4PUcn8ddu9dn2fB84vVs2/ERdFtVAAAAo3RSTlMAisjPqeTI2c3LzdLn2/rUrssOCMAtCwLXhVrPNrekzcwMzjHFgQUXP1G6Q82i4Nzj2vTM5pv97uSJanCJzM9h/gr5/NsUWdgI+SETveW3929lchXOt5jMy4tkF9AlPzAYmmemAdbYAgbPNTu105MiM0/iYDy0VHwZDGmXszPXbCC0X9QDT0E5nQiB1aGboAUHfhN4TXe6A0mPQcCjRIxfRs+6JW2znQAAAcdJREFUSMdjYICBBbo6C+XmCzGggOlzZ85W0po6iQETqM1jBwOd+gwkUY1pEFHBdkwdXezsizS1Jyuws+fkw8T6VYGK58yYNbGbnVsUXUMtO7usIpAWAiqSl4GICfews6tMAbHaJNhLxdF05LGzK0NYhdzsmVkgRmcfO7uAOkRQkp29BE2HAnsNjFkgzS4N1N3Swc7eKwwV02Znr0LVIJ7KzgLnZOeyqyQwlLOz606ACbWyszeh2ZHMnpaUAuNoAp0jxc7eKAYTaNBi565A0xHPD/R6lKgjmJMeCQpRbplKNWGx4FiN4upmdnYpjNCNEwQHvLGIj4igBDs6kC/DEoXRktzsOAA/ozqySiErG0YICFOCKbHjBQJbGC8mEarA0toVpMMUi6HMi4GAC4uEAEgHNyk62EHpgp0kHd7E69A34QEBNw9idViYLQGDFe5exOlwcV4C1bHUjzgdRUvgOjyJ08GK0LGULjqY4IANDsJBOiIQfKa65VCwCqhjMUlgJVk6WLD4gwMkyYnFH8uWjuoY1TGqY2joMEDocCBOhx5Chy9xOtiN4DoCiNRhaO7EBwT+IYEMDHJE6YCCUFA9aM9NvA7+IKAGAHNpvWAQ3mhuAAAAAElFTkSuQmCC"
                          class="van-image__img">
                      </image>
                    </view>
                    <view class="des-p">福利报表</view>
                  </view>
                </navigator>
                <navigator class="van-grid-item" style="flex-basis: 33.3333%;" url="/pages/redReport/redReport">
                  <view class="van-grid-item__content van-grid-item__content&#45;&#45;center van-hairline">
                    <view class="des-list van-image">
                      <image
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAwCAMAAACPHmKLAAACTFBMVEVHcEwAi7gAgL8AirgAirkAirkAi7kAi7hv4PUAiroAi7gAjLkAiroAi7kDjboAi7gAkrYAi7kAirkAjrgAjLkAirkAVaoAi7kAi7kAi7gAiroAi7gAAAAAi7kAi7kAibgAh7QQl8EAi7kAjboAi7kAj78Ai7kAi7gAmcwAibkAi7n///8Ai7kAj7gAirkAi7gAirkAi7kAi7kAgL8Ai7gAqqoAirYAi7kAirgAi7kAi7kAi7kAirkAi7kAgIAOlsAAiroAjLsAjLkAjLoAi7kAj7wAirkAibcNlb8QmMIAirkAjbcAj68Ej7wEjrsAi7kAi7kAibkAircAi7kNlcAAjrMAgL8Ai7oPl8EHkLwIkb1x4Pdx4vVx4fYAi7mA//9v4fQPl8Jw4fYAjLlm5v8AircAh7R37v8Ai7lw4fYAi7lx4PVx4PUCjbpw4fUAj7tv5fgAirgAirkFj7xw3/cAi7cMkbwAi7kAi7kAjbkAi7jE5O/7/v4AiLsAi7cAirgAh7gAgNUAibYAgK8Ajr0AjLkAjLUAibEAi7gAi7kAi7gAirkAj7oAirgAgP8AirgAiroAirYAjrgAi7oAirUAirgAircAirkAjbYAirgA//8Ai7gAhrYAirgAi7oAi7gAgLMAi7kAjLkAjb0Ql8Fw4PX///9z4PVuwdrf8vdpv9i54+/B5vE7rM4UmcJGsNHl9flx4PUTmMIXm8R9yN9y4PXc8PYTmcOr3OsUmsMWmsMtpcoRl8GV0uXo9fn9/v5/yd8anMRyw9vx+fyTVBxQAAAApHRSTlMA0ATY1tLX2Xw71yhGIeBwB6vHK4O+A67Tu4y/AYuEaBH+xVXWEJVhBVucu9EZrkuDbpoMbAM/kdELN5asfwL6PzxqlEIinWr4/plDEOPkp7CAmc34Gwhc/ujrek94hgJc/du6CqQiD9rKoPDF35spJ2SSxiBAz6OyOpOtvA+ghSQGHBAbPh8NmphWszuzAr6FIyRRGKxgqDGbAcoV03KtCs+SOhDSztoAAAJfSURBVEjH7dZVd5xgEIDhd3VWs3F3T9rGPXV3d3d3d3d39wJN3d3bP9aLNU6Ss0vuMzcchnmAbwYOQGzJtnybRAtb/pKSWAAojROjEVcKQJkYjzIAyrsgygFI6oJIAsBkpHTs5DxFUZRPq9YuA5cBMGaE4g9VXT2Pzirs8Yvi7br94UpIqLM7itT0hlqgtiE9NZiarhNzaD+OmsME42BNIBeof/f+g6o6YPB4Xb2lDn3UWcLiZdtr7bGqOoDMUb1Doprk4ykpF4DmaxUnkqkOirdPn2haUAADhvpPthc4KXIeuCpyCVgpIqJ8bfuoaUEReLyGTJgk4vICZ8/IndvUJ8mVm4DXJbL1909N0zRNe/5GVR3EDxztN1MrJw4C4LTIXSrFch2AnY1bdvvrn71SVFV1IGLq4w0sNNO/uSG37t+T9ND6e2ia9uvzC393HYiI2Ef276vr0EWrNIrpsk78+/EtOA9HcIIZw6YEjh/1+c6JyCmf71ggs+vvn/AEHeGZW8ZNSwZwhjK9AOo3bA9OsL0QES/AIafziEiq0+k8ALA0PPNOhAeg2e1OELG53W4zgCeiyOrkrrIiClMusL+qap+INTExcQ+Qa4ooJNvfHLNIz0CfsiWysHvaCY89ihCbE4CEhHUAOG0STYg1xxyatTnHKtGFSFpBEQBFBWkihoRIYUXx3OKUwnAiqugQ3aJbRI88nZhlSPTTiflYDYgZAfBdVRcu5oGRi8xcoCiKonxRV6yHNENf8uVrYmJiYjZtBnjYhT+AjQC0uAwDV4v//X/UmtEUffnWpozWHQD8B9WLg+SXVYFgAAAAAElFTkSuQmCC"
                          class="van-image__img"></image>
                    </view>
                    <view class="des-p">红包报表</view>
                  </view>
                </navigator>

                <navigator class="van-grid-item" style="flex-basis: 33.3333%;" url="/pages/agentReport/agentReport">
                  <view class="van-grid-item__content van-grid-item__content&#45;&#45;center van-hairline">
                    <view class="des-list van-image">
                      <image
                          src="data:image/png;base64,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"
                          class="van-image__img"></image>
                    </view>
                    <view class="des-p">代理报表</view>
                  </view>
                </navigator>-->
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      backUrl:"pages/gamehall/gamehall",
      balanceInfo:[]
    };
  },
  onShow(){
    this.getBalanceInfo();
  },
  methods: {
    goto(url,type = 0){
      if(!url){
        this.$u.toast('暂未开放');
        return;
      }
      if(type == 1){
        uni.setStorageSync('backUrl','pages/wallet/wallet');
      }
      uni.$utils.jump(url);
    },
    getBalanceInfo(){
      let that = this;
      this.$u.api.member.getBalanceInfo().then(res => {
        that.balanceInfo = res.data;
      }).catch(err => {
        uni.$utils.showToast(err);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.layout{
  width: 100%;
  height: 100%;
  background-color: #f1f1f1;
}
.flex-content {
  display: flex !important;
  flex-direction: column
}

.flex-content .van-empty__image {
  height: 202.67rpx !important
}

.mysection {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between
}

.mysection .bord-all {
  flex: 1
}

.mysection .bord-all .bord-all-box {
  height: calc(100% - 30.4rpx);
  margin: 0 30.4rpx;
  background-color: #fff;
  border-radius: 20.27rpx;
  overflow-y: auto
}

.mysection .bord-all .van-grid {
  margin: 0 !important;
  border-radius: 20.27rpx;
  padding: 20rpx 0 0 0;
}

.mysection .bord {
  margin-top: 30.4rpx
}

.mysection .bord .van-grid {
  border-radius: 0 0 20.27rpx 20.27rpx
}

.mysection .section-div .van-grid {
  margin: 0 30.4rpx 30.4rpx;
  background: #fff
}

.mysection .section-div .van-grid .van-grid-item__content {
  background: transparent !important;
  padding: 24.32rpx !important
}

.mysection .section-div .section-div-1 {
  background: linear-gradient(270deg, #1155a5, #09b4c3);
  margin: 0 30.4rpx;
  border-radius: 20.27rpx 20.27rpx 0 0
}

.mysection .section-div .section-div-1 .section-line {
  height: 4rpx;
  width: calc(100% - 60.8rpx);
  margin-left: 30.4rpx;
  background-color: #6fc2ff
}

.mysection .section-div .section-div-1 .section-div-2 {
  padding: 20.27rpx 0 10.13rpx 30.4rpx
}

.mysection .section-div .section-div-1 .section-div-2 .section-div-3-3 {
  color: #fff;
  font-size: 52.67rpx;
  font-weight: 600
}

.mysection .section-div .section-div-1 .section-div-2 .section-div-3 {
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  margin-top: 0
}

.mysection .section-div .section-div-1 .section-div-2 .section-div-3 .section-div-3-1 {
  width: 182.4rpx;
  display: inline-block;
  height: 60.8rpx;
  font-size: 28.27rpx;
  font-weight: 500;
  color: #d0ebff;
  line-height: 60.8rpx
}

.mysection .section-div .section-div-1 .section-div-2 .section-div-3 .section-div-3-2 {
  background: #008ab8;
  text-align: center;
  color: #fff;
  width: 152rpx;
  display: inline-block;
  height: 50.67rpx;
  border-radius: 101.33rpx 0 0 101.33rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #d0ebff;
  line-height: 50.67rpx
}

.mysection .section-div .section-div-1 .section-div-4 {
  display: flex;
  align-items: center;
  padding: 20.27rpx;
  justify-content: space-between
}

.mysection .section-div .section-div-1 .section-div-4 .section-div-4-1 {
  display: inline-block;
  font-size: 28rpx;
  font-weight: 500;
  color: #d0ebff
}

.mysection .section-div .section-div-1 .section-div-4 .section-div-4-1 text {
  display: block;
  color: #fff;
  font-size: 29rpx;
  font-weight: 700
}

.mysection .des-p {
  color: #8e919a;
  font-size: 28rpx
}

.mysection .des-list {
  width: 52.67rpx;
  height: 52.67rpx;
  margin-bottom: 12.16rpx
}

.mysection .des-img {
  width: 81.07rpx;
  height: 81.07rpx;
  margin-bottom: 12.16rpx
}


.header-bar {
  position: relative;
  height: 89.07rpx;
  font-size: 20.27rpx;
  display: flex;
  align-items: center;
  background: linear-gradient(270deg, #08bbc2, #144988)
}

.header-bar.left {
  height: 101.33rpx;
  display: flex
}

.header-bar.left .header-bar-left {
  position: relative
}

.header-bar.left .header-bar-title {
  margin: 0;
  max-width: none;
  margin-right: 20.27rpx
}

.header-bar .header-bar-left {
  position: absolute;
  top: 0;
  bottom: 0;
  padding: 0 16.27rpx;
  display: flex;
  align-items: center
}

.header-bar .header-bar-left .tn-icon-left {
  font-size: 48.64rpx;
  color: #fff
}

.header-bar .header-bar-title {
  display: flex;
  align-items: center;
  max-width: 60%;
  margin: 0 auto;
  color: #fff;
  font-weight: 500;
  font-size: 32.27rpx;
  transition: all .3s ease-in
}

.header-bar .header-bar-title .titicon {
  width: 40.53rpx;
  height: 40.53rpx;
  margin-right: 16.27rpx;
  background-size: 100% 100% !important
}

.header-bar .header-bar-right {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center
}

.header-bar .header-bar-right-select {
  min-width: 121.6rpx;
  margin: 0 16rpx;
  color: #fff;
  font-weight: 500;
  font-size: 30.4rpx;
  transition: all .3s ease-in
}

.header-bar .rotate {
  animation: rotate180deg-62b4ca20 .3s ease-in forwards
}

.header-bar .rotate-back {
  animation: rotate360deg-62b4ca20 .3s ease-in forwards
}

.van-grid {
  display: flex;
  flex-wrap: wrap
}

.van-image__error, .van-image__img, .van-image__loading {
  display: block;
  width: 100%;
  height: 100%
}


.van-grid-item__content {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  padding: 32.53rpx 16.27rpx;
  background-color: #fff
}


.van-grid-item__content--center {
  align-items: center;
  justify-content: center
}

.van-grid-item__content--horizontal {
  flex-direction: row
}


[class*=van-hairline]:after {
  position: absolute;
  box-sizing: border-box;
  content: " ";
  pointer-events: none;
  top: -50%;
  right: -50%;
  bottom: -50%;
  left: -50%;
  border: 0 solid #ebedf0;
  transform: scale(.5)
}

.van-grid-item__content:after {
  z-index: 1;
  border-width: 0 6rpx 6rpx 0
}


.van-hairline, .van-hairline--bottom, .van-hairline--left, .van-hairline--right, .van-hairline--surround, .van-hairline--top, .van-hairline--top-bottom {
  position: relative
}

.van-hairline--top:after {
  border-top-width: 6rpx
}

.van-hairline--left:after {
  border-left-width: 6rpx
}

.van-hairline--right:after {
  border-right-width: 6rpx
}

.van-hairline--bottom:after {
  border-bottom-width: 6rpx
}

.van-hairline--top-bottom:after, .van-hairline-unset--top-bottom:after {
  border-width: 6rpx 0
}

.van-hairline--surround:after {
  border-width: 6rpx
}

</style>

