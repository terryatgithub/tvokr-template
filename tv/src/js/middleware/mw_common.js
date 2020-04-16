/**
 * 业务模块-中间件层
 * 封装业务常用功能
 */
class commonMiddleware {
     /**
      * 登录
      */
     goLogin() {
          ccToast.show('提示<br>请先登录~~')
          ccStore.state.goLoginPage = true
          ccData.submitLogShowLogin({
              page_name: '418会员日活动电视端登录弹窗',
              page_type: 'inactivityWindows'
          }) 
          ccApi.tv.login()
      }
}

const common = new commonMiddleware()
export default common
 