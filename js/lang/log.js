/**
 * ����־ģ��
 *
 * ����Ҫʵ����IE�¿��Ը��ӷ����Ѻõ���ʾ��־�����ҷ������
 * �ṩ�����ݵķ�ʽ��������־
 *
 * ��Ȼ����ܺͺ�̨��ϣ��ѳ�����Ϣ��¼����̨���Է���ǰ���쳣�ļ��
 *
 * @author qijun.weiqj
 */
define('Log', ['jQuery', 'Class'], 

function($, Class) {

var Log = new Class({
	
	init: function(name) {
		this.name = name;
	},

	error: function(message) {
		this.log(message, 'error');
	},

	warn: function(message) {
		this.log(message, 'warn');
	},

	info: function(message) {
		this.log(message, 'info');
	},

	log: function(message, level) {
		simpleLog(message, level, this.name);
	},

	isEnabled: may.log.isEnabled
  
});
//~ Log

var body = null,
	list = [],
	search = window.location.search,
	logConsole = /\bdebug-console=true\b/.test(search),
	filter = (/\bdebug-log-filter=([^&]+)/.exec(search) || {})[1];


var prepare = function() {
	var container = $('<div class="debug-container"></div>').appendTo('body'),
		clear = $('<button class="clear">clear</button>').appendTo(container),
		wrap = $('<p><textarea class="editor"></textarea><button class="go">Go</button></p>').appendTo(container),
		
		editor = $('textarea.editor', wrap),
		go = $('button.go', wrap);


	body = $('<div class="body"></div>').appendTo(container);

	clear.on('click', function(e) {
		body.empty();	
	});

	go.on('click', function() {
		var value = $.trim(editor.val());
		value && $.globalEval(value);
	});

	$.each(list, function(index, message) {
		body.append(message);
	});
};

logConsole && $(function() {
	prepare();	
});


var oriLog = may.log.handler;
var simpleLog = function(message, level, name) {
	level = level || 'info'

	if (!may.log.isEnabled(level)) {
		return;
	}
	
	if (filter && !checkFilter(message, level, name)) {
		return;
	}

	if (logConsole) {
		var node = $('<p class="debug debug-' + level + '"></p>');
		node.text((name ? '[' + name + '] ' : '') + message);
		
		if (body) {
			body.append(node);
		} else {
			list.push(node);
		}

	} else {
		oriLog(message, level, name);
	}

};

var checkFilter = function(message, level, name) {
	if (name && name.indexOf(filter) !== -1 ||
			level === filter ||
			message && message.indexOf(filter) !== -1) {
		return true;
	}
	return false;
};


may.log.handler = simpleLog;


return Log;
		

});


