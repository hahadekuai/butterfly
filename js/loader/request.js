/**
 * load a module from file
 */
define('request', ['log'], function(Log) {

var log = new Log('request'),
	isDebug = log.isEnabled('debug');


var rJs = /\.js(\?|$)/,
	rCss = /\.css(\?|$)/;


var request = {};

// request module
request.module = function(url, options) {
	if (rJs.test(url)) {
		request.script(url, options);
	} else if (rCss.test(url)) {
		request.css(url, options);
	} else {
		log.error('can not load module [', options.id, '] from: ', url);
	}
};


var doc = document,
	head = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement,
	baseElement = doc.getElementsByTagName('base')[0],
	isOpera = navigator.userAgent.indexOf('Opera') !== -1,
	isIE = doc.attachEvent && !isOpera,
	isOldWebKit = (window.navigator.userAgent.replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) * 1 < 536,
	rReadyStates = /loaded|complete|undefined/;

var postLoadScript = null,
	currentlyAddingScript = null,
	interactiveScript = null;

request.script = function(url, options) {
	log.debug('request script:', url);

	var node = doc.createElement('script');

	onLoadScript(url, node, options);

	node.async = 'async';
	node.src = url;
	if (options.charset) {
		node.charset = options.charset;
	}
	node.setAttribute('data-module-id', options.id);
	node.setAttribute('data-module-namespace', options.namespace);

	currentlyAddingScript = node;
	append(node);
	currentlyAddingScript = null;
};

var onLoadScript = function(url, node, options) {
	node.onload = node.onreadystatechange = function(event) {
		event = event || window.event;
		if (event.type === 'load' || rReadyStates.test('' + node.readyState)) {
			node.onload = node.onreadystatechange = node.onerror = null;
			isDebug || head.removeChild(node);
			node = undefined;

			postLoadScript && postLoadScript(options);
			log.debug('request script success:', url);
			options.success();
		}
	};

	node.onerror = function() {
		node.onload = node.onreadystatechange = node.onerror = null;
		node = undefined;
		options.error();
	};
};

request.script.onpost = function(fn) {
	postLoadScript = function() {
		fn.apply(this, arguments);
		postLoadScript = null;	
	};
	isIE && processIeDefine();
};

var processIeDefine = function() {
	var script = getCurrentScript();
	if (!script) {
		return;
	}

	var namespace = script.getAttribute('data-module-namespace'),
		id = script.getAttribute('data-module-id');

	if (namespace && id) {
		postLoadScript({
			id: id,
			namespace: namespace	
		});
	}
};

var getCurrentScript = function() {
	if (currentlyAddingScript) {
		return currentlyAddingScript;
	}
	if (interactiveScript &&
			interactiveScript.readyState === 'interactive') {
		return interactiveScript;
    }

    var scripts = head.getElementsByTagName('script');
    for (var i = 0, c = scripts.length; i < c; i++) {
		var script = scripts[i];
		if (script.readyState === 'interactive') {
			interactiveScript = script;
			return script;
		}
    }
};

// request css
request.css = function(url, options) {
	log.debug('request css:', url);

	var node = doc.createElement('link');

    node.rel = 'stylesheet';
    node.href = url;
	if (options.charset) {
		node.charset = options.charset;
	}

	if (isOldWebKit || !('onload' in node)) {
		log.debug('request css use image proxy');
		var img = doc.createElement('img');
		img.onerror = function() {
			log.debug('request css success with image proxy:', url);
			options.success();
			img.onerror = null;
			img = undefined;
		};
		img.src = url;
	} else {
		node.onload = node.onreadystatechange = node.onerror = function() {
			if (rReadyStates.test(node.readyState)) {
				log.debug('request css success:', url);
				options.success();
			} else {
				log.warn('request css error:', url);
				options.error();
			}

			node.onload = node.onreadystatechange = node.onerror = null;
			node = undefined;
		};
	}

	append(node);
};

var append = function(node) {
	baseElement ?  
			head.insertBefore(node, baseElement) : 
			head.appendChild(node);
};


return request;

});
