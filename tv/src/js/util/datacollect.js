/**
 * 数据采集类，
 * 在原子api基础上，封装页面共同的业务逻辑层
 */
import common from './common.js'
// function submitLog({ category = '', action = '', label = '' } = {}) {
//      window._czc.push(['_trackEvent', category, action, label, '', ''])
//      window._cooc.push(['_trackEvent', 'okr_20200418_会员日TV', '', {
//           page_name: category,
//           page_action: action,
//           page_data: label
//      }])
// }

class MyData {
     static getInst() {
          if(!this.inst) {
               this.inst = new MyData()
          }
          return this.inst
     }

     constructor() {
          this.init()
     }

     init() {
          this.timePageStart = common.getNowTimeSecond()
          console.log('data init, start time: ' + this.timePageStart)
          this.activity_name = '418会员日电视端'
          this.activity_type = 'OKR活动'
          this.page_state = '加载成功'
          this.activity_stage = '活动期间'
     }

     setActState({page_state, activity_stage}) {
          this.page_state = page_state
          this.activity_stage = activity_stage
     }

     /**
      * 曝光
      * @param {*} param 
      */
     submitLogShow(param) {
          console.log('submitLogShow...')
          let that = this,
              info = ccStore.getters.commonParam(),
              eventParams = Object.assign(param, {
                    activity_name: that.activity_name,
                    activity_type: that.activity_type,
                    activity_id: info.id,
                    open_id: info.cOpenId,
               });
          ccMw.tv.logDataCollection({
               eventName: 'web_page_show_new',
               eventParams
          })
     }

     /**
      * 点击
      * @param {*} param 
      */
     submitLogClick(param) {
          console.log('submitlogclick...')
          let that = this,
              info = ccStore.getters.commonParam(),
              eventParams = Object.assign(param, {
                    activity_name: that.activity_name,
                    activity_type: that.activity_type,
                    activity_id: info.id,
                    open_id: info.cOpenId,
               });
               ccMw.tv.logDataCollection({
                    eventName: 'web_button_clicked_new',
                    eventParams
               })
     }

     /**
      * 结果
      * @param {*} param 
      */
     submitLogResult(param) {
          console.log('submitLogResult...')
          let that = this,
              info = ccStore.getters.commonParam(),
              eventParams = Object.assign(param, {
                    activity_name: that.activity_name,
                    activity_type: that.activity_type,
                    activity_id: info.id,
                    open_id: info.cOpenId,
               });
          ccMw.tv.logDataCollection({
               eventName: 'result_event_new',
               eventParams
          })
     }

     /**
      * 曝光-登录弹窗 字段与上面不同
      * @param {*} param 
      */
     submitLogShowLogin(param) {
          console.log('submitLogShowLogin...')
          let that = this,
              info = ccStore.getters.commonParam(),
              eventParams = Object.assign(param, {
                    activity_name: that.activity_name,
                    activity_type: that.activity_type,
                    activity_id: info.id,
                    open_id: info.cOpenId,
               });
          ccMw.tv.logDataCollection({
               eventName: 'okr_web_page_show',
               eventParams
          })
     }

     /**
      * 结果-登录弹窗 字段与上面不同
      * @param {*} param 
      */
     submitLogResultLogin(param) {
          console.log('submitLogResultLogin...')
          let that = this,
              info = ccStore.getters.commonParam(),
              eventParams = Object.assign(param, {
                    activity_name: that.activity_name,
                    activity_type: that.activity_type,
                    activity_id: info.id,
                    open_id: info.cOpenId,
               });
               ccMw.tv.logDataCollection({
                    eventName: 'okr_web_clicked_result',
                    eventParams
               })
     }
}

const mydata = MyData.getInst()

export default mydata 