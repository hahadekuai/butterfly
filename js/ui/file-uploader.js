/**
 * �ļ��ϴ�
 * @author qijun.weiqj
 */
define('ui.FileUploader', 
		['jQuery', 'Log', 'Class'], 
		function($, Log, Class) {

var log = new Log('ui.FileUploader');


var Uploader =  new Class({
	
	/**
	 * @param {object} options
	 *  - url
	 *  - config
	 *  - data
	 *	- filter
	 *	- before
	 *	- success
	 *	- error
	 *
	 */	
	init: function(div, options) {
		this.div = $(div).eq(0);
		this.options = options || {};
		$.use('ui-flash-uploader2', $.proxy(this, '_init'));
	},

	_init: function() {
		var config = $.extend({ module: 'uploader2' }, this.options.config);
		this.div.flash(config);
		this._bindReady();
		this._bindSelect();
		this._bindComplete();
	},

	_bindReady: function() {
		var self = this,
			div = this.div,
			options = this.options,
			filter = options.filter;

		div.bind('swfReady.flash', function(e, o) {
			div.flash('disableMultiple');
			div.flash('setFileCountLimit', 1);
		
			if (filter) {	
				filter = typeof filter === 'string' ? self._filter[filter] : filter;
				div.flash('setBrowseFilter', filter);
			}
		});
	},

	_bindSelect: function() {
		var div = this.div,
			options = this.options,
			url = options.url;

		if (!url) {
			log.error('please specify url for upload');
			return;
		}

		div.bind('fileSelect.flash', function(e, o) {
			log.info('select file');

			if (options.before && options.before(o) === false) {
				log.info('prevent default');
				return;
			}
			div.flash('uploadAll', url, options.data || {}, 'imgFile', 'fname');
		});
	},

	_bindComplete: function() {
		var self = this,
			div = this.div,
			options = this.options;

		div.bind('transferCompleteData.flash', function(e, o) {
			var file = o.file;

			if (file.status === 'done') {
				var data = Uploader.Handler[options.handler || 'default'](file.msg);
				if (data.success) {
					log.info('upload success: ' + data.url);
					options.success && options.success(data.url);
				} else {
					log.warn('upload error: ' + data.message);
					options.error && options.error(data.message);
				}
			}

			div.flash('clear');
		});
		
	},

	_filter: {
		image: [{
			description: 'ͼƬ�ļ���jpg,jpeg,gif,png��',
			extensions: '*.jpg;*.jpeg;*.gif;*.png'
		}]
	}
	
});
//~


Uploader.Handler = {
	'default': function(data) {
		var data = window.eval('(' + data + ')'),
			success = data && data.result === 'success';

		var msg = {
			imgRequired: 'ϵͳ����û�л�ȡ��ͼƬ',
			imgTooBig: '��Ǹ�����ϴ���ͼƬ����',
			imgTypeErr: 'ϵͳ����ͼƬ��ʽ��֧��'
		};

		return success ? { success: true, url: data.imgUrls[0] } :
				{ success: false, message: msg[data.errMsg] || '��Ǹ���������������ԭ���ϴ�ʧ��' };
	}

};
//~ Handler

return Uploader;

	
});
