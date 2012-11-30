/**
 * 文件上传
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
			description: '图片文件（jpg,jpeg,gif,png）',
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
			imgRequired: '系统错误：没有获取到图片',
			imgTooBig: '抱歉，您上传的图片过大',
			imgTypeErr: '系统错误：图片格式不支持'
		};

		return success ? { success: true, url: data.imgUrls[0] } :
				{ success: false, message: msg[data.errMsg] || '抱歉，由于网络或其它原因，上传失败' };
	}

};
//~ Handler

return Uploader;

	
});
