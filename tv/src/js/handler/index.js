var ccEvent = {
	bindClick(el, data, handler) {
        let h = handler, d = data
        if (typeof data == 'function') {
            h = data
            d = {}
        }
        el = el instanceof jQuery ? el : $(el)
		el.unbind("itemClick").bind("itemClick", d, h)	
	},
	unbindClick(el, handler) {
        el = el instanceof jQuery ? el : $(el)
		el.off('itemClick', handler)	
    },
    unbindAllKeys(el) {
        el = el instanceof jQuery ? el : $(el)
		el.off('itemClick').off('itemFocus')	
    },
    bindFocus(el, data, handler) {
        let h = handler, d = data
        if (typeof data == 'function') {
            h = data
            d = {}
        }
        let base = $('#deviceready').children('.page');
        base = base.filter(function(index){
            if($(this).css('display') !== 'none') {
                return true
            }
        })
        base = base.children('.scroll-wrapper')
        el = el instanceof jQuery ? el : $(el)
        el.unbind("itemFocus")
            .bind('itemFocus', {base}, this._scroll)	
            .bind("itemFocus", d, h)
    },
    _scroll(e) { //获得焦点时相应元素居中显示
        let base = e.data.base,
            bH = base.height(), //窗口高度
            top = this.getBoundingClientRect().top, //当前元素相对视口的top
            elH = $(this).height(), //当前元素高度
            delta = top - (bH - elH) / 2;   //垂直居中显示
        // console.log(`el top: ${top}, elH: ${elH}, delta: ${delta}, base.scrollTop(): ${base.scrollTop()}`)
        if(delta) base[0].scrollTop += delta
        //delta && base.animate({scrollTop: `${base.scrollTop() + delta}`}) //异步的，会影响我的奖品页面对scrollTop的同步使用
        // console.log(`el ${JSON.stringify(this.getBoundingClientRect())}, base.scrollTop(): ${base.scrollTop()}`)
    },
}

export default ccEvent