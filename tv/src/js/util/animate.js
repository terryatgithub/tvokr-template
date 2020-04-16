/**
 * 动画效果类
 */

class Animate {
	constructor() {

	}

	/**
	 * 向上滚动
	 * 比如显示中奖消息列表，中奖消息定时往上滚动
	 * @param {JQuery Object} ul 滚动列表的父元素ul
	 * 		  {Number} delay 动画间隔，默认2s
	 */
	autoScrollUp(ul, delay=2000) {
		function _scrollUp(ul) {
			let $first = ul.find('li:first'), 
				h = $first.height();
			$first.animate({marginTop: `${-h}px` }, 500, function(){
				$first.css('marginTop', 0).appendTo(ul)
			})
		}
		setInterval(_scrollUp, delay, ul)
	}

}

const anim = new Animate()
export default anim