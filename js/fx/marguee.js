/**
 * Marguee
 * @author qijun.weiqj
 */
define('fx.Marguee', ['jQuery', 'Class', 'ui.Widget'], 

function($, Class, Widget) {

var Marguee = Widget({

	/**
	 * body: 滚动元素选择器
	 * effect: 滚动效果
	 * step: 每轮滚动象素
	 * speed: 滚动速度
	 * delay: 每轮滚动后停止的时间
	 */
	defaultOptions: {
		body: '.fx-body',
		effect: 'left',
		stopOnHover: true,
		step: 4,
		speed: 80,
		delay: 1000
	},
	
	init: function() {
		this.body = $(this.options.body, this.element);

		this.active = true;
		this.pos = 0;

		this.effect = new Effect[this.options.effect](this);

		this._prepare();
		this.options.stopOnHover && this._handle();
		this._run();
	},

	_prepare: function() {
		this.element.css('overflow', 'hidden');
		this.body.css('position', 'relative');
	},

	_handle: function() {
		var self = this;
		this.element.on('mouseenter', function() {
			self.active = false;	
		});
		this.element.on('mouseleave', function() {
			self.active = true;	
		});
	},

	_run: function() {
		var self = this,
			effect = this.effect,
			speed = this.options.speed,
			delay = this.options.delay;

		var fn = function() {
			if (!self.active) {
				setTimeout(fn, 100);
				return;
			}
			if (effect.check()) {
				effect.step();
				setTimeout(fn, speed);
			} else {
				effect.setup();
				setTimeout(fn, delay);
			}
		};
		fn();
	}

	
});
// Marguee


/**
 * Effect
 */
var Effect = {};

/**
 * left
 */
Effect.left = new Class({
	init: function(ui) {
		this.ui = ui;
	},

	setup: function() {
		var ui = this.ui;	
		ui.pos = ui.element.outerWidth();
		ui.body.css('left', ui.pos + 'px');
	},

	step: function() {
		var ui = this.ui;
		ui.pos = ui.pos - ui.options.step;
		ui.body.css('left', ui.pos + 'px');
	},

	check: function() {
		var ui = this.ui,
			width = ui.body.outerWidth();
		return ui.pos > -width;
	}
	
});
//~ left

/**
 * right
 */
Effect.right = new Class({
	init: function(ui) {
		this.ui = ui;	
	},

	setup: function() {
		var ui = this.ui
			width = ui.body.outerWidth();	
		ui.pos = -width;
		ui.body.css('left', ui.pos + 'px');
	},

	step: function() {
		var ui = this.ui;
		ui.pos = ui.pos + ui.options.step;
		ui.body.css('left', ui.pos + 'px');
	},

	check: function() {
		var ui = this.ui,
			width = ui.element.outerWidth();	
		return ui.pos < width;
	}
});
//~ right

/**
 * up
 */
Effect.up = new Class({
	init: function(ui) {
		this.ui = ui;
		this.setup(); // 一开始移到下面效果较好
	},

	setup: function() {
		var ui = this.ui,
			height = ui.element.outerHeight();
		ui.pos = height;
		ui.body.css('top', ui.pos + 'px');
	},

	step: function() {
		var ui = this.ui;
		ui.pos = ui.pos - ui.options.step;
		ui.body.css('top', ui.pos + 'px');
	},

	check: function() {
		var ui = this.ui,
			height = ui.body.outerHeight();
		return ui.pos > -height;
	}
});
//~

/**
 * leftright
 */
Effect.leftright = new Class({
	init: function(ui) {
		this.ui = ui;
		this.direction = 1;
	},

	setup: function() {
		var ui = this.ui;
		if (ui.pos <= 0) {
			ui.pos = 0;
			this.direction = 1;
		} else {
			var eWidth = ui.element.width(),
				bWidth = ui.body.outerWidth();
			ui.pos = eWidth - bWidth;
			this.direction = -1;
		}
	},

	step: function() {
		var ui = this.ui;
		ui.pos = ui.pos + ui.options.step * this.direction;
		ui.body.css('left', ui.pos + 'px');
	},

	check: function() {
		var ui = this.ui,
			eWidth = ui.element.width(),
			bWidth = ui.body.outerWidth();
		return ui.pos >= 0 && ui.pos <= eWidth - bWidth;
	}
});
//~


return Marguee;
		
});
