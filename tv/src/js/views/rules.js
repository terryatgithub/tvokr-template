import ccView from './view.js'
import ccEvent from '../handler/index.js'
import router from '../router/index.js'
import '../../css/rules.scss'

class RulePage extends ccView {
    constructor(selector) {
        super(selector)
        this.name = 'rule page'
        this.data = {
        }
    }


    getBtns() {
        return $(`${this.id} .coocaa_btn`)
    }
    async eventHandler() {
        console.log(`rulesPage eventHandler event target: ${event.target.id}`)
        router.push('home')
    }
    bindKeys() {
        let btns = this.getBtns()
        ccMap.init(btns, btns[0], "btn-focus")
        ccEvent.bindClick(btns, this.eventHandler.bind(this))
    }
	async created() {
        console.log('--rulesPage created')
        ccData.submitLogShow({
            page_name: '活动规则页',
        })
        $(this.id).show()
        this.bindKeys()
	}
	destroyed() {
		console.log('--rulesPage destroyed')
		$(this.id).hide()
	}
}

const rulePage = new RulePage('#rulesPage')
export default rulePage
