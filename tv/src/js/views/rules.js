import ccView from './view.js'
import ccEvent from '../handler/index.js'
import '../../css/rules.scss'

class RulePage extends ccView {
    constructor(selector) {
        super(selector)
        this.name = 'rule page'
        this.data = {
        }
    }

    /**
     * 生命周期函数 created 
     * 首次进入页面调用
     */
    async created() {
        console.log('--rulesPage created')
        ccData.submitLogShow({
            page_name: '活动规则页',
        })
        $(this.id).show()
        this.bindKeys()
    }
    
    /**
     * 生命周期函数 destroyed 
     * 退出页面时调用
     */
    destroyed() {
		console.log('--rulesPage destroyed')
		$(this.id).hide()
    }

    /**
     * 点击事件回调函数
     * @param {Event} e 
     */
    async onClick(e) {
        console.log(`rulesPage onClick event target: ${e.target.id}`)
        // router.push('home')
    }

    /**
     * 绑定当前页面按钮
    */
    bindKeys() {
        let btns = $(this.coocaaBtns)
        ccMap.init(btns, btns[0], "btn-focus")
        ccEvent.bindClick(btns, {ctx:this}, this.onClick)
    }

}

const rulePage = new RulePage('#rulesPage')
export default rulePage
