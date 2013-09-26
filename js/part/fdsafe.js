/**
 * fdsafe��ص�֧��
 */
define('part.Fdsafe', ['jQuery', 'Class'], function($, Class) {


/**
 * ʹ��Fdsafe���Զ�ҳ��Ĺ��ܽ��м��
 * ��ӿں�Logһ��
 *
 * @usage
 *	var log = new Fdsafe(appkey, 'demo.Module');
 *	log.info(error);
 *	log.warn(message, ...)
 *	log.error(message, ...)  error�����ϵĻ���ɱ���
 *	log.fatal(message, ...)
 */
return Class({
	/**
	 * ����һ��Fdsafe�Ի����ڼ��ָ��ģ��
	 * @param {string} appkey 
	 * @param {string} name ģ������
	 */
	init: function(appkey, name) {
		if (!appkey) {
			throw 'please specify appkey for fdsafe';
		}

		this.appkey = appkey;
		this.name = name || 'Anonymous';

		var self = this;
		$.each(['info', 'notice', 'warn', 'error', 'fatal'], function(index, level) {
			self[level] = function() {
				// ���Լ�¼�쳣ʱ�׳����쳣
				try {
					var msg = self._toMsg(arguments);
					self.log(msg, level);
				} catch(e) {}
			};
		});
	},


	log: function(msg, level) {
		var url = 'http://110.75.196.102/page/logError?',
			o = {
				appkey: this.appkey,
				browser: window.navigator.userAgent,
				erroruri: window.location.href,
				level: this._level[level],
				msg: msg,
				module: this.name,
				t: new Date().getTime()
			},
			qs = [];

		for (var k in o) {
			qs.push(k + '=' + encodeURIComponent(o[k]));
		}

		url += qs.join('&');

		var img = new Image();
		img.src = url;
	},


	_toMsg: function(args) {
		var parts = [];

		$.each(args, function(index, item) {
			if (!item) {
				return;
			}

			var part = item.toString();
			if (item.stack) {
				part += '\n' + item.stack.substr(0, 500);
			}
			parts.push(part);
		});

		return parts.join(' | ');
	},


	_level: {
		info: 0,
		notice: 1,
		warn: 2,
		error: 3,
		fatal: 4
	}

});
	
	

});
