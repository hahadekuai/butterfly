/**
 * 简单日志模块
 *
 * @author qijun.weiqj
 */
define('lang.Log', ['loader', 'jQuery', 'lang.Class'], 

function(loader, $, Class) {

var Log = loader.require('log');

var body = null,
	list = [],
	search = window.location.search,
	logConsole = /\bdebug-console=true\b/.test(search),
	filter = (/\bdebug-log-filter=([^&]+)/.exec(search) || {})[1];

// prepare for debug-console
logConsole && 
(function() {
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
})();


var oriHandler = Log.handler;
var handler = function(message, level, name) {
	level = level || 'info'

	if (!Log.isEnabled(level)) {
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
		oriHandler(message, level, name);
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


Log.handler = handler;


return Log;

});


define('Log', ['lang.Log'], function(Log) {
	return Log;	
});
