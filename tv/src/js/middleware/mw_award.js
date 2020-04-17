/**
 * 我的奖品相关接口-中间件层，
 * 在后台api基础上，封装页面共同的业务逻辑层
 */
import _url from '../api/backend/url.js'
import common from './mw_common'
import {animate} from '../util/index.js'

class DrawLuck {
     constructor() {
          this.isDrawingNow = false //正在抽奖中
          this.awardsTypeIdObj = { //奖品类型
               //id  名称 键值和名称都不能重复
              '1': ['vip', 'vip'],  //1 影视会员直通车
              '2': ['entity', '实物'], //2 实体奖 需要填写 手机号码和收货地址
              '3': ['card', '卡密'], //3 卡密奖
              '4': ['virtual', '虚拟将'], //4 虚拟奖
              '5': ['coupon', '优惠券'], //5 优惠券
              '6': ['fuka', 'fuka'], //6 福卡/周年碎片
              '7': ['wxredbag', '现金红包'], //7 微信红包 需要调用接口拿到微信二维码
              '8': ['phonebill', '流量话费'], //8 话费流量
              '13': ['vipgoods', 'vipgoods'], //13 特权购买奖品
              '14': ['consolation', 'consolation'], //14 安慰奖
              '15': ['largeredbag', 'largeredbag'], //15 大金额红包
              '17': ['allowance', '津贴'], //17 津贴
              '18': ['speedup', 'speedup'], //18 加速奖品
              '19': ['ccCoin', '金币'], //19 金币
              '22': ['3rdpartycoupon', '第三方优惠券'], //22 第三方优惠券
          }
     }
 
      /**
       * 初始化抽奖活动
       */
      async initDrawTask() { 
          let res = await ccApi.backend.act.initDrawTask()
          console.log('转盘活动初始化: ' + JSON.stringify(res))
          if(res.code == '50003' || res.code === '50042') {
               ccStore.state.actStates = 'end'
          } else if(res.code != '50100') {
               console.error(res.code + res.msg)
               return {resMsg: false}
          } 
          let {isVip, vipType, overNum, belongVip, startDayNum} = res.data,
               info = ccStore.state.luckDrawInfo;
          info.isVip = isVip
          info.vipType = vipType
          info.overNum = overNum
          info.belongVip = belongVip
          info.startDayNum = startDayNum
          return {resMsg: true, overNum}
      }
      /**
       * 根据奖品英文类型获取对应的中文名称（我的奖品页面需要显示奖品类型）
       * @param {String} type 
       */
      getChineseNameByType(type) {
           let o = this.awardsTypeIdObj
           for(let key in o) {
                if(o[key][0] === type) {
                     return o[key][1]
                }
           }
      }
     /**
      * 获取我的奖品列表
      * @returns Map 返回按要求排序的我的奖品Map
      */
      async getMyReward() {
          let p1 = ccApi.backend.act.getMyReward(), //瓜分活动
              p2 = ccApi.backend.act.getMyReward(1); //抽奖活动
          let [res1, res2] = await Promise.all([p1, p2])
          if(res1.code !== '50100' || res2.code !== '50100') {
               ccToast.show('提示<br>网络异常，请重新进入')
               return false
          }
          //res2 只保留瓜分权益，删除自动发放领取的优惠券
          res2 = res2.data.filter(item => item.awardTypeId === '1')
          let res = res1.data.concat(res2)
          console.log('我的奖品: ' + JSON.stringify(res))          
          let allAwards = res, m = new Map()
          allAwards.length && allAwards.forEach(item => {
               if(item.awardTypeId === '14') return; //过滤谢谢参与奖
               let type = this.awardsTypeIdObj[item.awardTypeId][0]
               !m.has(type) && m.set(type, [])
               if(item.awardTypeId === '19') { //合并金币（分未领取 已领取)
                    let value = m.get(type),
                        idx = value.findIndex(k => k.awardExchangeFlag === item.awardExchangeFlag)
                    if(idx != -1) {
                         let infoSrc = JSON.parse(item.awardInfo),
                             infoTarget = JSON.parse(value[idx].awardInfo);
                         infoTarget.coinNum = parseInt(infoSrc.coinNum) + parseInt(infoTarget.coinNum)
                         value[idx].awardInfo = JSON.stringify({coinNum: infoTarget.coinNum})
                         value[idx].awardName = `金币${infoTarget.coinNum}个`
                         return 
                    }
               }    
               m.get(type).push(item)
          })
          m = this._sortMyReward(m)
          return m
      }
      /**
       * 给我的奖品排序
       * @param {*} m 我的奖品Map
       */
      _sortMyReward(m) {
          m = [...m]
          //获取指定奖品对应的奖品id
          let getId = (v) => {
               for(let [key, value] of Object.entries(this.awardsTypeIdObj)) {
                    if(value[0] === v[0]) {
                         return key
                    }
               }     
          }
          //奖品种类排序内容，418 OKR要求：现金红包>金币>优惠券>实物>卡密
          let order = { //7>19>5>2>3     
               7: 1,
               19: 2,
               5: 3,
               2: 4,
               3: 5
          }
          m.sort((a,b) => order[getId(a)] - order[getId(b)])
          m = new Map(m)
          return m
      }
     /**
      * 领取奖励接口
      * 封装了各种奖品的判断领取逻辑
      * @param {object} info 
      */
     async receiveReward(info) {
        let 
          {
               activeId, 
               awardId,
               lotteryAwardRememberId : rememberId,
               userKeyId,
               awardTypeId
          } = info,
          param = {
               activeId, 
               awardId,
               rememberId,
               userKeyId,
               awardTypeId
          },
          res =await ccApi.backend.act.receiveMyReward(param);
        console.log('领奖:' + JSON.stringify(res))
        return res
     }
     /**
      * 显示奖品弹窗，如果有多个，会依次显示
      * @param {Object | Array[Object]} awards 后台返回的奖品列表，可以是Object（单个奖品）或Array[Object]（多个奖品）
      * @param {this} ctx 调用此接口的上下文this,用于页面焦点处理、恢复等
      * @param {boolean} dialog true:显示弹窗  false: 不显示弹窗，自动静默领取
      */
     async showRewardDialog(awards, ctx, dialog=true) {
          let list = [], res
          if(!(awards instanceof Array)) {
               list.push(awards)
          } else {
               list = awards
          }
          if(!list.length) return;
          for (let item of list) {
               res = await this._showSpecificRewardDlg(item, ctx, dialog)
          }
          return res
     }
     /**
      * 显示用户点击奖品时的弹窗
      */ 
     async _showSpecificRewardDlg(item, ctx, dialog=true) {
          let res
          if(await this._isCollected(item, ctx)) {return}
          if(item.seq === 0 && item.awardTypeId !== '1') { //谢谢参与
               await this._collectNoAward(ctx, dialog)
               return 
          }
          switch (parseInt(item.awardTypeId, 10)) { // 奖品类型说明
               case 1: //影视会员直通车（瓜分天数）
                    res = await this._collectVip(item, ctx)   
                    break
               case 2: //实体奖 需要填写 手机号码和收货地址 
                    res = await this._colletEntityAward(item, ctx)
                    break
               case 3: //卡密奖 
                    res = await this._collectKami(item, ctx)
                    break
               case 4: //虚拟奖 
                    break
               case 5: //优惠券 
                    res = await this._collectCoupon(item,ctx, dialog)
                    break
               case 6: //福卡/周年碎片 
                    break
               case 7: //微信红包 需要调用接口拿到微信二维码 
                    res = await this._collectRedBag(item, ctx)
                    break
               case 8: //话费流量 
                    break
               case 13: //特权购买奖品 
                    break
               case 14: //安慰奖 
                    break
               case 15: //大金额红包 
                    break
               case 17: //津贴 
                    break
               case 18: //加速奖品
                    break
               case 19: //金币 
                    res = await this._collectCoin(item, ctx)
                    break
               case 22: //第三方优惠券 
                    break
           }
           return res
     }
     /**
      * 显示用户点击’已领取‘商品时的弹窗
      * @param {Object} item 奖品信息
      *        {Object} ctx 调用接口的上下文this
      * @returns true: 已领取 
      */
     async _isCollected(item, ctx) {
          if(!item.awardExchangeFlag) { //未领取
               return false
          }
          switch (parseInt(item.awardTypeId, 10)) { // 奖品类型说明
               case 1: //影视会员直通车（瓜分天数）
                    await this._collectVip(item, ctx)   
                    return true
               case 2: //实体奖 需要填写 手机号码和收货地址 
                    await this._showCollectedEntityAward(item, ctx)
                    return true
               case 3: //卡密奖 
                    await this._collectKami(item, ctx)
                    return true
               case 4: //虚拟奖 
                    break
               case 5: //优惠券 
                    if(item.awardExchangeFlag == 2) {
                         ccToast.show('提示<br>奖品已使用')
                    } else if(item.awardExchangeFlag == 3) {
                         ccToast.show('提示<br>奖品已过期')
                    } else {
                         await this._collectCoupon(item,ctx)
                    }
                    return true
               case 6: //福卡/周年碎片 
                    break
               case 7: //微信红包 需要调用接口拿到微信二维码 
                    // await this._collectRedBag(item, ctx)
                    // return true
                    break;
               case 8: //话费流量 
                    break
               case 13: //特权购买奖品 
                    break
               case 14: //安慰奖 
                    return false //谢谢参与不显示‘已领取’
               case 15: //大金额红包 
                    break
               case 17: //津贴 
                    break
               case 18: //加速奖品
                    break
               case 19: //金币 
                    await this._collectCoin(item, ctx, true)
                    return true
               case 22: //第三方优惠券 
                    break
          }
          //未特殊处理的显示toast
          ccToast.show('提示<br>奖品已领取') 
          return true
     }
     /**
      * 谢谢参与
      */
     async _collectNoAward(ctx, dialog=true) {
          if(!dialog) return;
          await ccDialog.show({
               title: '您与奖励擦肩而过~<br>再来一次吧!',
               icon: require('../../images/dialog/iconthx.png'),
               tip: '',
               btnOK: '再来一次',
               onOK: function() { 
                    console.log('ok') 
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
     /**
      * 领取金币
      * @param {} item 
      */
     async _collectCoin(item, ctx, collected=false) {
          let ret;
          if(!collected) {
               let res,
                    page_name = '获得抽奖奖励弹窗-金币',
                    page_type = 'inactivityWindows';
               ccData.submitLogShow({
                    page_name,
                    page_type
               })
               res = await this.receiveReward(item)
               if(res.code !== '50100') {
                    ccToast.show('提示<br>网络异常，请在"我的奖品"页面领取')
                    return 
               }
               ret = true
               res = await ccDialog.show({
                    title: '恭喜获得' + item.awardName,
                    icon: item.awardUrl,
                    tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
                    btnOK: '去使用',
                    onOK: function() { 
                         console.log('ok') 
                         ccData.submitLogClick({
                              page_name,
                              page_type,
                              button_name: '去使用-金币',
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
               if(res.cancel) { return }
          }
          let url = ccUtil.isProdMode() ? 
                    'https://goldshop.coocaa.com' : 
                    'https://beta-goldshop.coocaa.com';
          ccApp.startCommonPage({
               type: 'action',
               packageName: 'com.coocaa.app_browser',
               actionName: 'coocaa.intent.action.browser.no_trans',
               params: [{'url': url}]
          })
          return ret
     }
     /**
      * 领取红包
      */
     async _collectRedBag(item, ctx) {
          let res, qrUrl,
               page_name = '获得抽奖奖励弹窗-现金红包',
               page_type = 'inactivityWindows' ;
          ccData.submitLogShow({
               page_name,
               page_type
          })
          res = await ccDialog.show({
               title: '恭喜获得' + item.awardName,
               icon: item.awardUrl,
               tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
               btnOK: '立即领取',
               onOK: function() { 
                    console.log('ok') 
                    ccData.submitLogClick({
                         page_name,
                         page_type,
                         button_name: '立即领取-现金红包',
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
          if(res.cancel) {return false}
          res = await this.receiveReward(item)
          if(res.code != '50100') { //todo 是否能在某处统一处理异常？
               ccToast.show('提示<br>网络异常，请在"我的奖品"页面领取')
               return 
          }
          qrUrl = res.data.data
          qrUrl =await ccUtil.showQrCode({ url: qrUrl, urlOnly: true })
          let detail = `微信扫一扫 马上领取<br>红包金额: <span>${JSON.parse(item.awardInfo).bonus}</span>元`
          qrUrl = await ccQrCode.show({
               title: '恭喜获得' + item.awardName,
               icon: qrUrl,
               tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
               detail: detail,
               btnOK: '知道了',
               onOK: function() { 
                    console.log('ok') 
                    ccData.submitLogClick({
                         page_name,
                         page_type,
                         button_name: '知道了-现金红包',
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
          return true
     }
     /**
      * 领取vip天数
      * @param {*} item 
      */
     async _collectVip(item, ctx) {
          let res, 
              title = '您已成功瓜分' + item.awardName,
              icon = require('../../images/dialog/iconvip.png'),
              tip = '*权益领取后直接生效-可前往【奖品】查看!',
              btnOK = '知道了',
              state = '瓜分成功',
              func = ()=>{},
              isRebind = true,
              page_name = '瓜分VIP会员弹窗-' + state,
              page_type = 'inactivityWindows',
              ret = true;
          if(!item.awardExchangeFlag) {
               res = await this.receiveReward(item)
               if(res.code === '50004') {
                    title = '来晚了~<br>今日的影视VIP奖池已被瓜分完啦'
                    icon = require('../../images/dialog/iconfail.png')
                    state = '已瓜分完'
               } else if(res.code !== '50100') {
                    title = '哎呀，您的网络好像断了<br>刷新试试吧'
                    icon = require('../../images/dialog/iconerror.png')
                    tip = ''
                    btnOK = '刷新'
                    func = this._collectVip.bind(this, item, ctx)
                    isRebind = false
                    state = '瓜分失败'
                    ret = false
               }
               page_name = '瓜分VIP会员弹窗-' + state
          }
          ccData.submitLogShow({
               page_name,
               page_type
          })
          res = await ccDialog.show({
                    title,
                    icon,
                    tip,
                    btnOK,
                    onOK: function() { 
                         console.log('ok') 
                         func()
                         ccData.submitLogClick({
                              page_name,
                              page_type,
                              button_name: btnOK + '-' + state,
                          })
                    },
                    onCancel: function() {
                         console.log('cancel')
                    },
                    onComplete: function() { 
                         console.log('complete')
                         isRebind && ctx.bindKeys()
                    }
               }) 
          return ret
     }
     /**
      * 领取优惠券
      * @param {*} item 
      * @param {*} ctx 
      * @param {boolean} dialog 是否静默领取 默认显示弹窗
      */
     async _collectCoupon(item, ctx, dialog=true) {
          let res, info, onclickData,
               page_name = '获得抽奖奖励弹窗-优惠券',
               page_type = 'inactivityWindows';
          //静默已领取时，直接返回
          if(item.awardExchangeFlag !== 0 && !dialog) {
               return true
          }
          if(item.awardExchangeFlag === 0) {
               ccData.submitLogShow({
                    page_name,
                    page_type
               })
               info = await this.receiveReward(item)
               if(info.code !== '50100') {
                    dialog && ccToast.show('提示<br>网络异常，请在"我的奖品"页面领取')
                    return false
               } else if(!dialog) {
                    return true
               }
               res = await ccDialog.show({
                    title: '恭喜获得' + item.awardName,
                    icon: item.awardUrl,
                    tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
                    btnOK: '立即使用',
                    onOK: function() { 
                         console.log('ok') 
                         ccData.submitLogClick({
                              page_name,
                              page_type,
                              button_name: '立即使用-优惠券',
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
               if(res.cancel) {return true}  
               res = true
               onclickData = JSON.parse(info.data.couponInfo.onclickData)
          } else {
               onclickData = JSON.parse(item.awardInfo).onclickData
               onclickData = JSON.parse(onclickData)
          }
         
          ccApi.tv.startCommonPage({
               type: 'action',
               packageName: onclickData.packageName,
               actionName: onclickData.byvalue,
               params: [onclickData.param]
          })
          return res
     }
     /**
      * 领取实体奖
      */
     async _colletEntityAward(item, ctx) {
          let res,qrUrl,
               page_name = '获得抽奖奖励弹窗-实物',
               page_type = 'inactivityWindows';
          ccData.submitLogShow({
               page_name,
               page_type
          })
          res = await ccDialog.show({
                    title: '恭喜获得' + item.awardName,
                    icon: item.awardUrl,
                    tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
                    btnOK: '立即领取',
                    onOK: function() { 
                         console.log('ok') 
                         ccData.submitLogClick({
                              page_name,
                              page_type,
                              button_name: '立即领取-实物',
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
          if(res.cancel) {return false}
          qrUrl = `${_url.mobFillUserInfoPageUrl}?activeId=${item.activeId}&rememberId=${item.lotteryAwardRememberId}&userKeyId=${item.userKeyId}&open_id=${item.userOpenId}&type=2&from=userDay`
          qrUrl =await ccUtil.showQrCode({ url: qrUrl, urlOnly: true })
          res = await ccQrCode.show({
               title: '恭喜获得' + item.awardName,
               icon: qrUrl,
               tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
               btnOK: '知道了',
               onOK: function() { 
                    console.log('ok') 
                    ccData.submitLogClick({
                         page_name,
                         page_type,
                         button_name: '知道了-实物',
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
          return true 
     }
     /**
      * 显示已领取实体奖
      * @param {*} item 
      */
     async _showCollectedEntityAward(item, ctx) {
          let res, addr = item.awardAddressEntity,
              detail = `收货人: ${addr.receiveName}<br>手机: ${addr.userPhone}<br>收货地址: ${addr.userProvince+addr.userCity+addr.userArea+addr.userAddress}`,
              page_name = '获得抽奖奖励弹窗-实物',
              page_type = 'inactivityWindows';
         ccData.submitLogShow({
              page_name,
              page_type
         })              
          res = await ccEntityCollected.show({
                    title: '恭喜获得' + item.awardName,
                    icon: item.awardUrl,
                    tip: '*奖品已放入【我的奖品】，按【返回】键关闭弹窗提示!',
                    detail,
                    btnOK: '已领取',
                    onOK: function() { 
                         console.log('ok') 
                         ccData.submitLogClick({
                              page_name,
                              page_type,
                              button_name: '已领取-实物',
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
     /**
      * 领取卡密 
      * */ 
     async _collectKami(item, ctx) {
          let res, collected = item.awardExchangeFlag,
               page_name = '获得抽奖奖励弹窗-卡密',
               page_type = 'inactivityWindows',
               ret = false;
          ccData.submitLogShow({
               page_name,
               page_type
          })
          if(!collected) {
               res = await this.receiveReward(item)
               if(res.code !== '50100') {
                    ccToast.show('提示<br>网络异常，请在"我的奖品"页面领取')
                    return 
               }     
               ret = true
          }
          let kami = JSON.parse(item.awardInfo),
               apkId = ccUtil.isArray(kami) ? kami[0].apkId : kami.apkId,
               onSuccessFunc = ()=>{}, 
               btnOK = '去使用';
          console.log(apkId);
          let apkList = { //需要跳转第三方app的卡密
              "21210":{
                  "packagename":"cn.jmake.karaoke.box.ott",
                  "actionname":"金麦客",
                  "bywhat":"package",
                  "byvalue":"",
                  "params":{}
              },
              "30001":{
                  "packagename":"com.an.tv",
                  "actionname":"糖豆广场舞",
                  "bywhat":"package",
                  "byvalue":"",
                  "params":{}
              },
              "21132":{
                  "packagename":"com.edufound.ott",
                  "actionname":"义方快乐学堂",
                  "bywhat":"package",
                  "byvalue":"",
                  "params":{"url":"http://ottweb.ai160.com/stage/index/index.html?"}//fittime://com.fittime.tv/exchangeCode
              }
          };
          let checkApkInstalled = async () => {
               if(apkList[apkId]) { 
                    let pkg = apkList[apkId]['packagename']
                    let app = await ccApi.tv.getAppInfo(pkg)
                    if(app[pkg].status == '-1') {
                         console.log('apk未安装')
                         ccToast.show('请先安装' + apkList[apkId]['actionname'])
                         await ccApi.tv.startAppStoreDetail({id:pkg})
                         return
                    }
                    let param = {
                         type: apkList[apkId]['bywhat'],
                         // actionName: apkList[apkId]['bywhat'],
                         packageName: apkList[apkId]['packagename'],
                         // className: apkList[apkId]['bywhat'],
                         // uri,
                         // params,
                         // extra
                    }
                    onSuccessFunc = ccApi.tv.startCommonPage.bind(null, param)
               }
          }
          let cardid,cardpw;
          if(collected) {
               let info = JSON.parse(item.awardInfo)[0]
               cardid = `卡号: ${info.cardNo}`
               cardpw = `密码: ${info.password}`
          } else {
               cardid = `卡号: ${res.data.cardInfo[0].cardNo}`
               cardpw = `密码: ${res.data.cardInfo[0].password}`               
          }
          res = await ccCoupon.show({
               title: '恭喜您获得' + item.awardName,
               cardid,
               cardpw,
               tip: '*请拍照保存并前往APP【我的】-【激活码充值】激活~',
               btnOK,
               onOK: async function() { 
                    console.log('ok') 
               },
               onCancel: function() {
                    console.log('cancel')
               },
               onComplete: function() { 
                    console.log('complete')
               }
          })   
          if(res.confirm) {
               ccData.submitLogClick({
                    page_name,
                    page_type,
                    button_name: '去使用-卡密',
                })
               await checkApkInstalled()
               onSuccessFunc()
          }
          ctx.bindKeys()
          return ret
     }
     /**
      * 获取中奖消息，并插入到ul元素里，自动滚动
      * @param {JQuery Object} ul 中奖消息滚动的父元素ul
      */
     async showLuckyNews(ul) {
          let res = await ccApi.backend.act.getLuckyNews()
          console.log('中奖消息: ' + JSON.stringify(res))
          if(res.code !== '50100') {
              return
          }
          let news = res.data,
              li = '',
              list = news.fakeNews.map(item => {
                  let name = item.nickName, 
                      nameLen = name.length,
                      award = item.awardName;
                  name = nameLen > 5 ? name.charAt(0)+'****'+name.charAt(nameLen-1) : name
                  // award = award.length > 3 ? award.slice(0,3).concat('...') : award
                  return `恭喜 ${name} 抽中 ${award}`
              })
          list.forEach(item => {
              li += `<li>${item}</li>`
          })
          ul.empty().html(li)
          animate.autoScrollUp(ul)
      }
      /**
       * 点击抽奖
       * @param {Object} ctx 调用抽奖的上下文this
       * @returns {Object} state: false 抽奖失败 true 抽奖成功
       */      
      async clickLuckDraw(ctx) {
          let ret = {
               state: false
         };
          if(this.isDrawingNow) {return ret}
          this.isDrawingNow = true
          let info = ccStore.state.luckDrawInfo, //todo 抽奖信息需要放在抽奖class中，不放store
              res;
          switch(true) {
               case (ccStore.state.actStates === 'end'):
                    ccToast.show('提示<br>本次活动已结束，谢谢参与!');
                    break;
               case (!ccStore.state.hasLogin):
                    common.goLogin()
                    break;
               case (!ccStore.state.luckDrawInfo.isVip):
                    ccToast.show('提示<br>抱歉~您还不是VIP会员~')
                    break;
               case  (info.overNum < 1):
                    ccToast.show('抱歉，您今日抽奖次数已用完啦<br>购买VIP赢继续抽奖机会~')
                    break;
               default:
                    ccData.submitLogClick({
                         page_name: '活动主页面',
                         activity_stage: ccData.activity_stage,
                         button_name: '立即抽奖',
                         button_state: ccStore.state.luckDrawInfo.belongVip 
                     })
                     res = await ccApi.backend.act.doLuckDraw()
                     console.log('抽奖: ' + JSON.stringify(res))
                     if(res.code === '50004') { //移动端用完抽奖机会
                         info.overNum = 0
                         ret = {
                              state: true,
                              overNum: 0
                         }
                         ccToast.show('抱歉，您今日抽奖次数已用完啦<br>购买VIP赢继续抽奖机会~')
                         return 
                     } else if(res.code !== '50100') {
                         ccToast.show('提示<br>网络异常请重试~')
                         return 
                     } else {
                         ret = {
                              state: true,
                              overNum: --info.overNum
                         }
                         await this.drawLuckAnimate('homeGoLuckDraw', res.data.seq)
                         await this.showRewardDialog(res.data, ctx)
                    }
                    break;
          }
          this.isDrawingNow = false
          return ret          
      }
     /**
      * 转盘抽奖动画
      */
     async drawLuckAnimate(elements, seq) {
          let els = $(`#${elements}`).siblings(),
              arr = Array.from(els), 
              len = arr.length, 
              sort = [
                   [0,1,2,4,7,6,5,3], //0-7为抽奖按钮的兄弟节点的排序；转动顺序为从左上角顺时针旋转
                   [4,1,2,3,8,7,6,5,5] //奖品对转动顺序的map，比如谢谢参与seq为0，在第二排最右边，要转4下，所以最后一圈沿顺时针转到4
              ],
              round =async (time, total = len) => {
                    let i = 0
                    while(i < total) { 
                         await new Promise((resolve) => {
                              setTimeout(()=>{
                                   els.removeClass('highlight')
                                   $(els[sort[0][i]]).addClass('highlight')
                                   i++
                                   resolve()
                              }, time)
                         })
                    }
               },
               period = 300;
          await round(period)
          // await round(period)
          // await round(period)
          // await round(period*1.618)
          // await round(period*1.618*1.618)
          // await round(period*1.618*1.618*1.618)
          await round(period*1.618*1.618, sort[1][seq])
          await ccUtil.sleep(1000)
          els.removeClass('highlight')
     }
 }

 const drawLuck = new DrawLuck()
 export default drawLuck