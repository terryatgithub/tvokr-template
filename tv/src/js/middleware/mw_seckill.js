/**
 * 秒杀商品模块-中间件层
 * 封装跟业务逻辑相关的处理
 */
import common from './mw_common.js'

class SeckillMiddleware {
     constructor() {
          this.seckillGoodsInfo = null  //秒杀商品详情列表
          this.seckillDayNum = 0 //获取哪天的秒杀商品 0 今天 1 明天 -1 昨天
          this.seckillRoundNum = 0 //当前活动是当天第几轮
          this.seckillTimer = null //秒杀商品倒计时timer
     }

     /**
      * 秒杀商品初始化
      * @param {Number} day 0：获取当天商品 1获取明天 -1获取昨天 ...
      */
     async initSeckillItems(day=0) {
          console.log('startdaynum: ' + ccStore.state.luckDrawInfo.startDayNum)
          if(ccStore.state.luckDrawInfo.startDayNum > 10) {
               day = 10 - ccStore.state.luckDrawInfo.startDayNum
          }
          this.seckillDayNum = day
          let res = await ccApi.backend.shopping.getSeckillGoodsList({
               source: ccStore.state.source,
               day
          })
          console.log( 'day: ' + day + '; 秒杀商品列表: ' + JSON.stringify(res))
          res = JSON.parse(res)
          if(res.returnCode != '200' || res.data.length === 0) {
               console.error('提示<br>秒杀商品获取失败或为空')    
               return false
          }
          let list = res.data,
               arrIndex = this._seckillGetCurrentRoundGoods(res.data),
               products = arrIndex.reduce((prev, cur) => { //获取本轮商品
                    prev.push(list[cur])
                    return prev
               }, [])
          this._seckillItemsUpdate(products)
          this.seckillGoodsInfo = products
          this.disableCountdownTimer()
          this._seckillItemsCountdown()
          return true
      }

      
    /**
     * 获取我的秒杀商品列表
     */
     async getMySecKillList() {
          let res = await ccApi.backend.shopping.getSecKillMyList()
          console.log('我的秒杀：' + res)
          res = JSON.parse(res)
          if(!(res.returnCode === '200' || res.returnCode === '300001')) {
               ccToast.show('提示<br>网络异常请重新进入')
               return false
          }
          ccData.submitLogShow({
               page_name: '我的秒杀页',
               page_state: res.data && res.data.length ? '已有秒杀订单' : '未有秒杀订单',
               activity_stage: ccData.activity_stage
          })   
          return true
     }

      /**
       * 获取当前轮次的商品信息
       * @param {Array[Object]} list 后台返回的秒杀商品列表
       * @returns {Array{Object} 返回当前轮次的商品信息(5个)
       */
      _seckillGetCurrentRoundGoods(list) { 
          let now = ccUtil.getNowTimeSecond() * 1000, 
              halfHour = 1800000, 
              round = 0, 
              len = list.length, 
              ret = [],
              start, 
              normalNum, 
              curRoundIndex;
          //先判断有几个特殊商品，418最多2个
          if(list[0].sortOrder === 17) { //特殊商品1
              ret.push(0)
          }
          if(list[1].sortOrder === 16) { //特殊商品2
              ret.push(1)
          }
          //根据特殊商品个数，判断普通商品个数及当前轮次
          start = ret.length
          normalNum = 5 - start
          if(now < list[start].activity_end_time + halfHour) {
              round = 0
          } else if(now < list[5].activity_end_time + halfHour) {
              round = 1
          } else if(len > 10) {
              round = 2
          }
          this.seckillRoundNum = round
          //获取普通商品在数组里对应的index
          curRoundIndex = [...list.keys()].slice(start + round * normalNum, start + (round+1) * normalNum)       
          ret.push.apply(ret, curRoundIndex)
          console.log('seckill list: ' + JSON.stringify(ret))
          //反序排列
          return ret.reverse()
      }

      /**
       * 更新本轮秒杀商品信息到页面
       * @param {Array[Object]} data 本轮商品信息(5个)
       */
      _seckillItemsUpdate(data) {
          let  all = '', 
               ul = $('#homeSeckillItemList'), 
               goodsId = [],
               upTarget = this.seckillDayNum ? '#seckillShowTmrItems' : '#seckillShowTodayItems';
          data.forEach((item, index) => {
              goodsId.push(item.activity_id)
              let img = item.activity_poster_img,
                  oldPrice = item.commodityInfo.commodity_original_price,
                  newPrie = item.activity_price,
                  soldPercent = ((1 - (item.activity_number/item.all_stock).toFixed(2))*100).toFixed(0),
                  start = item.activity_start_time,
                  end = item.activity_end_time,
                  stock = item.activity_number,
                  allstock = item.all_stock,
                  rightTarget = (index == 4) ? '#' : '';
              all += `<li class="coocaa_btn" upTarget="${upTarget}" rightTarget="${rightTarget}" data-actid="${item.activity_id}" data-start="${start}" data-end="${end}" data-stock="${stock}" data-allstock="${allstock}"  data-type="seckillitem" data-id=${index}>
                      <img class="product" src="${img}"/>
                      <div class="countdown">
                          <span></span><span></span>								
                      </div>
                      <div class="prize-zone">
                          <div>原价￥${oldPrice}</div>
                          <div>￥${newPrie}</div>
                          <div><div class="progress"></div></div>
                          <div>已售<span class="progresspercent">${soldPercent}</span>%</div>
                      </div>
                      <div class="btn_seckill"></div>
                      <img class="focusbg" src="${require('../../images/home/4framefocus.png')}"/>
                  </li>`
          })
          ccStore.state.seckillGoodsInfo.seckillGoodsId = goodsId.join()
          ul.empty().html(all)
      }

      /**
       * 刷新秒杀商品倒计时信息，每1s刷新一次
       */
      _seckillItemsCountdown() {
          let ctx = this,
              ul = $('#homeSeckillItemList'),
              now = +new Date(), 
              halfHour = 1800000,// 30*60*1000
              start, 
              end, 
              stock,
              allstock,
              state, 
              countdown,
              soldPercent,
              actEnd = ccStore.state.actStates === 'end';
          Array.prototype.forEach.call(ul.children(), function(item, index){
              item = $(item)
              start = item.attr('data-start')
              end = item.attr('data-end')       
              stock = item.attr('data-stock')     
              allstock = item.attr('data-allstock')  
              item.removeClass('ended willstart')
              if(actEnd) { //case: 活动已结束
                  state = '已结束'
                  countdown = '00:00:00'
                  item.addClass('ended')
                  item.children('.btn_seckill').text('已结束')
                  soldPercent = 100
              } else { //case 活动进行中
                  soldPercent = ((1 - (stock/allstock).toFixed(2))*100).toFixed(0)
                  switch(true) {
                      case (start - now) > halfHour || ((now - end) > halfHour && ctx.seckillRoundNum != 2): // 未开始
                          state = '未开始'
                          countdown = ccUtil.getcountdown(start)
                          item.addClass('willstart')
                          item.children('.btn_seckill').text('敬请期待')
                          break;
                      case (start - now) > 0 && (start - now) <= halfHour: //即将开始
                          state = '即将开始'
                          countdown = ccUtil.getcountdown(start)
                          item.addClass('willstart')
                          item.children('.btn_seckill').text('即将开始')
                          break;
                      case (end - now) > 0 && (end - now) <= halfHour: //即将结束
                          if(stock>0) {
                              state = '即将结束'
                              countdown = ccUtil.getcountdown(end)
                              item.children('.btn_seckill').text('立即秒杀')
                          }else {
                              state = '已秒光'
                              item.addClass('ended')
                              countdown = '00:00:00'
                              soldPercent = 100
                              item.children('.btn_seckill').text('已秒光')
                          }
                          break;
                      case (now - end)> 0 && ((now - end) <= halfHour || ctx.seckillRoundNum == 2): //已结束
                          state = '已结束'
                          countdown = '00:00:00'
                          soldPercent = 100
                          item.addClass('ended')
                          item.children('.btn_seckill').text('已结束')
                          break;
                      default: //秒杀中
                          if(stock>0) {
                              state = '秒杀中'
                              countdown = ccUtil.getcountdown(end)
                              item.children('.btn_seckill').text('立即秒杀')
                          } else {
                              state = '已秒光'
                              item.addClass('ended')
                              countdown = '00:00:00'
                              soldPercent = 100
                              item.children('.btn_seckill').text('已秒光')
                          }
                          break;
                  }
              }
              //更新UI: 商品状态，倒计时，销售百分比，进度条
              item.children('.countdown').children().first().text(state)
              item.children('.countdown').children().last().text(countdown)
              item.find('.progress').css('width', soldPercent+'%')
              item.find('.progresspercent').text(soldPercent)
          })
          if(!actEnd) { //每秒更新一次页面倒计时
              this.seckillTimer = setTimeout(this._seckillItemsCountdown.bind(this), 1000)
          }
      }

     /**
      * 进入秒杀商品详情页
      * @param {JQuery Object} el 点击的商品JQuery对象
      */
     async goSeckillPage(el) {
        let index = el.attr('data-id'),
            actId = el.attr('data-actid'),
            productId = (this.seckillGoodsInfo[index]['commodity_id']).toString(),
            round = this.seckillRoundNum;
        console.log('goSeckillPage: ' + index + 'actId: ' + actId)
        if(ccStore.state.actStates === 'end') {
            ccToast.show('提示<br>本次活动已结束，谢谢参与!')
            ccData.submitLogClick({
                page_name: '活动主页面',
                activity_stage: ccData.activity_stage,
                button_name: '立即秒杀' + productId,
                button_state: `第${round+1}场-` + el.children('.btn_seckill').text(),
            }) 
            return
        }
        if(!ccStore.state.hasLogin) {
            common.goLogin()
            return 
        }
        if(!ccStore.state.luckDrawInfo.isVip) {
            ccToast.show('抱歉~<br>VIP会员才可参与秒杀~您还不是VIP会员')
            return
        }
        ccData.submitLogClick({
            page_name: '活动主页面',
            activity_stage: ccData.activity_stage,
            button_name: '立即秒杀' + productId,
            button_state: `第${round+1}场-` + el.children('.btn_seckill').text(),
        })            
        let res = await ccApi.backend.shopping.getSeckillState()
        console.log('检查秒杀状态: ' + res)
        res = JSON.parse(res)
        //进入时判断是否有权限
        if(!(res.returnCode === '200' || res.returnCode === '300001')) { 
            //判断用户当前点击商品是否 1.是已秒杀商品 2.是否已付款
            res = await ccApi.backend.shopping.findOrderByAct(actId) 
            console.log('检查当前商品状态: ' + res)
            res = JSON.parse(res);
            if(!(res.returnCode === '200' || res.returnCode === '300001')) {
                ccToast.show('提示<br>您已参与过本场活动，请下一场再来噢~')
                return
            } else if(res.returnCode == '200' && res.data) {
                if(res.data.payStatus == 2) {
                    ccToast.show('提示<br>您已参与过本场活动，请下一场再来噢~')
                    return
                } else { //商品订单详情页
                    ccApi.tv.startMallOrderDetail({
                        orderId: res.data.orderSn //todo
                    }) 
                    return
                }
            } 
        }        
        if(el.hasClass('willstart')) {
            ccToast.show('提示<br>秒杀还未开始，请稍后再来~')
            return
        } else if(el.hasClass('ended')) {
            ccToast.show('哎呀来晚了~<br>该商品已被秒完啦~看看其它商品吧!')
            return
        }
        
        ccStore.state.seckillGoodsInfo.start = true
        ccApi.tv.startMallDetail({
            type: 'text', 
            id: productId
        }) 
    }

     /**
      * 停止秒杀商品倒计时刷新
      */
     disableCountdownTimer() {
          this.seckillTimer && clearTimeout(this.seckillTimer)
     }

     /**
      * 获取用户参与活动状态,并弹窗提示
      * 用于用户从秒杀商品页，返回到宿主页面(首页)时的弹窗提示
      * @param {Object} ctx 秒杀活动的宿主页面（418OKR为首页）
      */
     async getUserParticipationState(ctx) {
        let res = await ccApi.backend.shopping.getSeckillState()
        console.log('获取秒杀状态: ' + res)
        res = JSON.parse(res)
        if(res.returnCode === '200' || res.returnCode === '300001') { //没有参与过，可继续参与
            return 
        } else if(res.returnCode === '200093') { //参与成功
            ccData.submitLogShow({
                page_name: '秒杀状态弹窗-秒杀成功',
                page_type: 'inactivityWindows'
            })
            res = await ccDialog.show({
                title: '恭喜成功参与秒杀活动',
                icon: require('../../images/dialog/iconok.png'),
                tip: '*奖品已放入【我的秒杀】，按【返回】键关闭弹窗提示!',
                btnOK: '知道了',
                onOK: function() { 
                    console.log('ok') 
                    ccData.submitLogClick({
                        page_name: '秒杀状态弹窗-秒杀成功',
                        page_type: 'inactivityWindows',
                        button_name: '知道了-秒杀成功',
                    })
                },
                onCancel: function() {
                    console.log('cancel')
                },
                onComplete: function() { 
                    console.log('complete')
                    ctx.bindKeys()
                }
            })
        } else { //参与失败
            ccData.submitLogShow({
                page_name: '秒杀状态弹窗-秒杀失败',
                page_type: 'inactivityWindows'
            })
            res = await ccDialog.show({
                title: '抱歉，秒杀失败，只差一点点了~',
                icon: require('../../images/dialog/iconfail.png'),
                tip: ' ',
                btnOK: '知道了',
                onOK: function() { 
                    console.log('ok') 
                    ccData.submitLogClick({
                        page_name: '秒杀状态弹窗-秒杀失败',
                        page_type: 'inactivityWindows',
                        button_name: '知道了-秒杀失败',
                    })
                },
                onCancel: function() {
                    console.log('cancel')
                },
                onComplete: function() { 
                    console.log('complete')
                    ctx.bindKeys()
                }
            }) 
       }
     }

}

const seckill = new SeckillMiddleware() 
export default seckill