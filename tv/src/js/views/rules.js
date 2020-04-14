import ccView from './view.js'
import ccEvent from '../handler/index.js'
import router from '../router/route.js'
import '../../css/rules.scss'

var rulesPage = new ccView({
	name: 'rules',
	id: '#rulesPage',
	data: {
        title: 'rulesPage title',
        tips: 'this is some text used to placeholding............'
    },
    getBtns() {
        return $(`${this.id} .coocaa_btn`)
    },
    async eventHandler() {
        console.log(`rulesPage eventHandler event target: ${event.target.id}`)
        router.push('home')
    },
    bindKeys() {
        let btns = this.getBtns()
        ccMap.init(btns, btns[0], "btn-focus")
        ccEvent.bindClick(btns, this.eventHandler.bind(this))
    },
	async created() {
        console.log('--rulesPage created')
        ccData.submitLogShow({
            page_name: '活动规则页',
        })
        $(this.id).show()
        this.bindKeys()
	},
	destroyed() {
		console.log('--rulesPage destroyed')
		$(this.id).hide()
	}
})

export default rulesPage