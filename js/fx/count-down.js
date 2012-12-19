/**
 * 手风琴
 * @author yefei.niuyf
 */
define('fx.CountDown', ['jQuery', 'Class', 'Log'], function($, Class, Log) {

var log = new Log('fx.CountDown');

return new Class({
	
	/**
	 * 构造一个CountDown
	 * @param {jquery} div 
	 * @param options
	 *	- beforeShow      默认为'fx-countdown-unstart'
	 *	- inProcessShow   默认为'fx-countdown-inprocess'
	 *	- finishShow      默认为'fx-countdown-finish'
	 *	- startTime       开始时间，例如：'2012-12-12 09:01:00'
	 *	- endTime 		  结束时间，例如：'2012-12-12 09:11:00'
	 */
	init: function(div, options) {
		this.div = $(div);
		this.options = $.extend({
			beforeShow:'.fx-countdown-unstart',
			inProcessShow: '.fx-countdown-inprocess',
			finishShow:'.fx-countdown-finish',
			secondSelector:'.fx-countdown-second',
			minuteSelector:'.fx-countdown-minute',
			hourSelector:'.fx-countdown-hour',
			daySelector:'.fx-countdown-day'
		}, options);

		var currentClientTime = new Date().valueOf();

		this.options.endTime = this._processTime(this.options.endTime);
		this.options.startTime = this._processTime(this.options.startTime);
		this.options.currentTime = this._processTime(this.options.currentTime);

		if(!this.options.endTime || this.options.startTime > this.options.endTime){
			return ;
		}
		
		this.makeCorrect =  currentClientTime - this.options.currentTime;
		this.beforeShowSelector = $(this.options.beforeShow,this.div);
		this.inProcessShowSelector = $(this.options.inProcessShow,this.div);
		this.finishShowSelector =  $(this.options.finishShow,this.div);

		!this.isStart() ? this._handleStart() : this._handlePreocess();
	},

	start: function(){
		var options = this.options;
		this.beforeShowSelector.hide();
		this.inProcessShowSelector.show();

		options.start && options.start();
	},

	finish: function(){
		var options = this.options;
		this.inProcessShowSelector.hide();
		this.finishShowSelector.show();

		options.finish && options.finish();
	},

	_processTime: function(time){
		if(typeof(time) !== 'string'){
			if(time instanceof Date){
				return time.valueOf();
			}
			return time;
		}

		var timeFormatArray = /(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)/.exec(time);
		if(timeFormatArray === null){
			return time;
		}

		var time = new Date();
		time.setYear(timeFormatArray[1]);
		time.setMonth(timeFormatArray[2] -1);
		time.setDate(timeFormatArray[3]);
		time.setHours(timeFormatArray[4]);
		time.setMinutes(timeFormatArray[5]);
		time.setSeconds(timeFormatArray[6])

		return time.valueOf();
	},

	_handleStart: function(){
		this.beforeShowSelector.show();
		this.startFlag = setInterval($.proxy(this,'countStart'),200);
	},

	countStart: function(){
		if(!this.isStart()){
			var timeToEnd = -(new Date().valueOf() - this.options.startTime - this.makeCorrect);
			this.countTime(timeToEnd, this.beforeShowSelector);
			return ;
		}
		clearInterval(this.startFlag);
		this.start();
		this._handlePreocess();
	},

	isStart: function(){
		return new Date().valueOf() - this.options.startTime - this.makeCorrect > 0
	},

	_handlePreocess: function(){
		this.inProcessShowSelector.show();
		this.countFlag = setInterval($.proxy(this,'countProcess'),100);
	},

	countTime: function(timeToEnd, selector){
		var second = Math.floor(timeToEnd / 1000 % 60),
			minute = Math.floor(timeToEnd / 1000 / 60 % 60),
			hour = Math.floor(timeToEnd / 1000 / 60 / 60 % 60),
			day = Math.floor(timeToEnd / 1000 / 60 / 60 / 24 % 60);
		this.setTime(second, minute, hour, day, selector);
	},

	countProcess: function(){
		var timeToEnd = this.options.endTime - new Date().valueOf()  + this.makeCorrect;
		if(timeToEnd > 0){
			this.countTime(timeToEnd, this.inProcessShowSelector);
		}else{
			clearInterval(this.countFlag);
			this.finish();
		}
	},

	setTime: function(second, minute, hour, day, selector){
		$(this.options.secondSelector, selector).html(second);
		$(this.options.minuteSelector, selector).html(minute);
		$(this.options.hourSelector, selector).html(hour);
		$(this.options.daySelector, selector).html(day);
	}
});

		
});
