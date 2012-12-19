/**
 * 手风琴
 * @author yefei.niuyf
 */
define('fx.Accordion', ['jQuery', 'Class', 'Log'], function($, Class, Log) {

var log = new Log('fx.Accordion');

return new Class({
	
	/**
	 * 构造一个Accordion
	 * @param {jquery} div 
	 * @param options
	 *	- effect      默认为'updown' ,还可以使用'leftright'
	 *	- duration		默认为 500, 即延迟.5秒轮播
	 */
	init: function(div, options) {
		this.div = $(div);
		this.options = $.extend({
			nav: '.fx-accordion-header',
			pane: '.fx-accordion-content',
			navHoverClass:'fx-accordion-hhover',
			navActiveClass:'fx-accordion-hactive',
			effect:'updown',
			event:'mouseenter',
			duration: 500,
			index:0
		}, options);

		this.navSelector = $(this.options.nav,this.div);

		if(this.navSelector.length < 2){
		    log.warn('accordion less than one');
			return ;
		}
		if(this.navSelector.length - 1 < this.options.index){
			this.options.index = 0;
		}
		this.navSelector.filter(':eq(' + this.options.index + ')').addClass(this.options.navActiveClass);
		this.paneSelector = $(this.options.pane,this.div);
		this.paneSelector.hide();
		this.paneSelector.filter(':eq(' + this.options.index + ')').show();
		this._handleEvent();

	},

	_handleEvent:function(){
		var self = this;

		this.paneSelector.each(function(){
			$(this).data('width',$(this).width());
		});

		this.navSelector.on('hover',function(){
			$(this).toggleClass(self.options.navHoverClass);
		});

		this.navSelector.on(this.options.event,function(){
			if($(this).hasClass(self.options.navActiveClass)){
				return ;
			}
			self.navSelector.removeClass(self.options.navActiveClass);
			$(this).addClass(self.options.navActiveClass);

			if(self.options.effect === 'updown'){
				self._upDownAnimate($(this));
			}else if(self.options.effect === 'leftright'){
				self._leftRightAnimate($(this));
			}
			
		});
	},

	_leftRightAnimate:function(item){
		this.paneSelector.animate({
			width:0,
			opacity:'hide'
		}, this.options.duration);

		var itemNext = item.next();
		itemNext.width(0).show();
		itemNext.animate({
			width:itemNext.data('width') + 3
		}, this.options.duration);
	},

	_upDownAnimate:function(item){
		this.paneSelector.slideUp(this.options.duration);
		$(item).next().slideDown(this.options.duration);
	}
});

		
});
