may.config({
	id: 'may',
	resolve: function(id) {
		id = id.replace(/\./g, '/')
				.replace(/([a-z])([A-Z])/g, function(s, m1, m2) {
					return m1 + '-'	+ m2;
				}).toLowerCase();

		var prefix = 'js/',
			map = {
				util: 'http://wpstatic.china.alibaba.com/js/',
				ui: 'http://wpstatic.china.alibaba.com/js/',
				fx: 'http://wpstatic.china.alibaba.com/js/',
				vendor: ''
			};

		for (var k in map) {
			if (id.indexOf(k) === 0) {
				prefix = map[k];
				break;
			}
		}

		return prefix + id + '.js';
	}
});

define('PageContext', ['jQuery', 'Log', 'Context', 'Executor'], 
		function($, Log, Context, Executor) {

	var log = new Log('PageContext'),
		executor = new Executor();

	return new Context('PageContext', {
		bind: function(name, type, module) {
			log.info(name + ' initializing...');	
			executor.execute(module);	
		}
	});
});

define(['jQuery', 'PageContext'], function($, PageContext) {
	$(function() {
		PageContext.start();	
	});
});
