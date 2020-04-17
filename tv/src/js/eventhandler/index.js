/**
 * 注册按钮事件类
 */
class ccEvent {
    constructor() {
    }
 
    /**
     * 绑定点击事件
     * @param {Object|String} el 被绑定的元素
     * @param {Object} data 要传给事件回调函数的数据
     * @param {Function} handler 点击事件回调函数
     */
	bindClick(el, data, handler) {
        let h = handler, 
            d = data;
        if (typeof data == 'function') { //no data
            h = data
            d = {}
        }
        el = el instanceof jQuery ? el : $(el)
		el.off("itemClick").on("itemClick", d, h)	
    }

    /**
     * 解绑点击事件
     * @param {Object|String} el 被绑定的元素
     * @param {Function} handler 点击事件回调函数
     */
	unbindClick(el, handler) {
        el = el instanceof jQuery ? el : $(el)
		el.off('itemClick', handler)	
    }

    /**
     * 解绑所有事件，包括'点击''获得焦点'
     * @param {Object|String} el 被绑定的元素
     */
    unbindAllKeys(el) {
        el = el instanceof jQuery ? el : $(el)
		el.off('itemClick').off('itemFocus')	
    }

    /**
     * 绑定‘获得焦点’事件, 取得焦点的元素自动垂直居中
     * @param {Object|String} el 被绑定的元素
     * @param {Object} data 要传给事件回调函数的数据
     * @param {Function} handler 点击事件回调函数
     */
    bindFocus(el, data, handler) {
        let h = handler, 
            d = data;
        if (typeof data == 'function') { //no data
            h = data
            d = {}
        }
        //todo 这里依赖页面结构，看如何提取完善
        let pages = $('#deviceready').children('.page'),
            curPage = pages.filter(function(){
                return $(this).css('display') !== 'none'
            }),
            container = curPage.children('.scroll-wrapper');
        el = el instanceof jQuery ? el : $(el)
        el.off("itemFocus")
            .on('itemFocus', {container}, this._scrollIntoView)	
            .on("itemFocus", d, h)
    }

    /**
     * 获得焦点的元素居中显示
     * @param {Event} e 
     */
    _scrollIntoView(e) {
        let container = e.data.container,
            bH = container.height(), //窗口高度
            top = this.getBoundingClientRect().top, //当前元素相对视口的top
            elH = $(this).height(), //当前元素高度
            delta = top - (bH - elH) / 2;   //垂直居中显示
        // console.log(`el top: ${top}, elH: ${elH}, delta: ${delta}, container.scrollTop(): ${container.scrollTop()}`)
        if(delta) container[0].scrollTop += delta
        //异步的带过渡效果，但会影响我的奖品页面对scrollTop的同步使用
        //delta && container.animate({scrollTop: `${container.scrollTop() + delta}`}) 
        // console.log(`el ${JSON.stringify(this.getBoundingClientRect())}, container.scrollTop(): ${container.scrollTop()}`)
    }
}

const evt = new ccEvent() 
export default evt
