/**
 * 定义一种统一的方式来书写js 
 * 使用统一的方式管理模块的依赖，
 * 并提供异步加载机制
 * 类似于amd loader api，但提供更加实用的特性：如匿名模块马上进行初始化
 *
 * @author qijun.weiqj
 */
(function(window) {

var may = {
	version: '1.0'
};


// utility
var noop = function() {},
	toString = Object.prototype.toString,
	isArray = function(o) {
		return toString.apply(o) === '[object Array]'; 
	},
	extend = function(des, src) {
		for (var k in src) {
			var v = src[k];
			if (v !== null && v !== undefined) {
				des[k] = v;
			}
		}
		return des;
	};


/**
 * simple log support
 * may.log.handler can be overwrite by other module
 */
var logLevel = { none: 0, error: 1, warn: 2, info: 3, debug: 4 },
	isLogEnabled = function(level) {
		return logLevel[level] <= may.log.level;	
	};


may.log = function(msg, level, type) {
	return may.log.handler(msg, level, type);
};

may.log.handler =  window.console ? function(msg, level, type) {
	level = level || 'info';
	if (isLogEnabled(level)) {
		msg = (type ? '[' + type + '] ' : '') + msg;
		if (console[level]) {
			console[level](msg);
		} else if (console.log) {
			console.log(msg);
		}
	}
} : noop;

/**
 * log level
 *	support set log level in query string, 
 *	exp: '?debug=true' or '?may-log-level=error'
 */
var getLevel = function() {
	var search = window.location.search,
		level = /\bdebug=true\b/.test(search) ? 'debug' : false;
	level = level || (/debug-log-level=(\w+)\b/.exec(search) || {})[1] || 'error';
	return logLevel[level];
};

may.log.isEnabled = isLogEnabled;
may.log.level = getLevel();
may.isDebug = may.log.level === logLevel['debug'];


/**
 * error handler, can be overwrite by other module
 */
may.error = function(e) {
	e = typeof e === 'string' ? new Error(e) : e;
	throw e;
};

//~ log supplort


// used for loader
var log = function(msg, level) {
	return may.log.handler(msg, level, 'may:Loader');
};

var assert = function(bool, message) {
	bool || may.error(message);
};


// module start
var cache = {},		// module cache
	EMPTY_DEPENDS = [],
	FAIL = {};

may._guid = 1;

/**
 * define a module
 * unlike amd loader, anonymous module will require immediately
 */
var define = function(config, id, depends, factory) {
	var args = regularArgs(id, depends, factory),
		id = args.id,
		mods = config.modules;	

	if (mods[id]) {
		log(getId(config, id) + ' already configured, ignore', 'warn');
		return;
	} else {
		mods[id] = args;
	}

	// require anonymous module immediately
	if (id.indexOf('!') === 0) {
		require(config, [id]);
	}

	return args;
};


/**
 * define(id, depends, factory)
 * define(id, factory{not array})
 * define(id, depends{array})
 * define(depends{array}, factory)
 * define(factory{function})
 */
var regularArgs = function(id, depends, factory) {
	// define(a, b) -> define(a, [], b)
	if (factory === undefined && !isArray(depends)) {
		factory = depends;
		depends = EMPTY_DEPENDS;
	}

	if (typeof id === 'function') {
		factory = id;
		depends = EMPTY_DEPENDS;
		id = null;
	} else if (isArray(id)) {
		depends = id;
		id = null;
	}

	assert(isArray(depends), 'arguments error, depends should be an array');

	id = id || '!anonymous' + may._guid++; 

	return { id: id, depends: depends, factory: factory };
};

//~ define


var EMPTY = {}; // for uninitialize module
var require = function(config, depends, callback) {
	depends = depends ? 
			isArray(depends) ? depends : [depends] :
			[];

	var list = [],
		count = 0,
		n = depends.length,
		
		check = function() {
			count >= n && callback &&
				callback.apply(null, list);
		},
		
		load = function(index) {
			var depend = depends[index];
			loadModule(config, depend, function(o) {
				assert(o !== FAIL, 'load ' + getId(config, depend) + ' error');
				list[index] = o;
				count++;
				check();
			});
		};

	check();
	for (var i = 0; i < n; i++) {
		load(i);
	}

	return list[0];		
};
//~ require


var loadModule = function(config, id, callback) {
	if (id === 'require') {
		callback(config.require);
		return;
	}

	var alias = null,
		pos = null,
		o = null,
		otherConfig = null;

	if (config.alias && 
			(alias = config.alias[id])) {
		id = alias;
	}
	
	// may be require other project, exp may:class, offer:widget.Tabs
	// this feature can shorten module id
	pos = id.indexOf(':');
	if (pos !== -1 && 
			(otherConfig = cache[id.substr(0, pos)])) {
		return loadModule(otherConfig, id.substr(pos + 1), callback);
	}

	o = config.modules[id];
	if (o) {
		loadModuleFromDef(config, o, callback);
	} else {
		loadModuleFromScript(config, id, callback);
	}
};


var loadModuleFromDef = function(config, o, callback) {
	var id = o.id,
		longId = getId(config, id);

	if (o.load) {
		o.load++;
		log(longId + ' is loaded [' + o.load + ']');
		callback(o.data);
		return;
	}
	
	o.loadList = o.loadList || [];
	o.loadList.push(callback);
	if (o.loadList.length > 1) {
		return;
	}

	var depends = o.depends || [];

	require(config, depends, function() {
		var factory = o.factory,
			loadList = o.loadList; 

		if (typeof factory === 'function') {
			factory = factory.apply(o, arguments);
			log('initialize ' + longId + ' complete!');
		}
		o.data = factory;
		log(longId + ' is loaded');

		for (var i = 0, c = loadList.length; i < c; i++) {
			loadList[i](factory);
		}
		
		o.load = loadList.length;
		o.loadList = null;
	});	
};

var getId = function(config, id) {
	return config.id + ':' + id; 	
};

//~ require


/**
 * get or config an loader
 * @param {object|string} cfg
 *
 * {object}
 *	- id {string}		loader id, required
 *	- alias {object}
 *	- resolve {function} for async module loader, resolve path from id
 *
 * {string}
 */
var stack = [];
var config = function(cfg) {
	// get exist config
	if (typeof cfg === 'string') {
		assert(cache[cfg], 'config for ' + cfg + ' is not exist');
		return facade(cache[cfg]);
	}
	
	var id = cfg.id || 'may',
		o = cache[id];

	log('config loader ' + id);
	
	o = o || {
		id: id,

		require: function(depends, callback) {
			if (typeof depends === 'function') {
				callback = depends;
				depends = [];
			}
			return require(o, depends, callback);
		},

		define: function(id, depends, factory) {
			return define(o, id, depends, factory);
		},

		modules: {},

		isDefine: function(id) {
			return !!o.modules[id];
		}
	};
	
	cache[cfg.id] = o;
	cfg = extend({}, cfg);
	delete cfg.id;
	extend(o, cfg);

	return facade(o);
};

var facade = function(cfg) {
	return { define: cfg.define, require: cfg.require, isDefine: cfg.isDefine };
};


var pushStack = function(name) {
	log('push loader to stack: ' + name);

	var config = cache[name];
	assert(config, 'config for ' + name + ' is not exist');

	stack.push(config);

	return config.facade;	
};

var popStack = function() {
	assert(stack.length > 0, 'config stack empty');
	return stack.pop();
};

//~ config


// load async module
var rAbs = /^https?:\/\//,
	loadList = {},
	postLoadResource = null;

var loadModuleFromScript = function(config, id, callback) {
	var list = loadList[id] = loadList[id] || [],
		path = null,
		isAbsPath = false;

	list.push(callback);
	if (list.length > 1) {
		return;
	}
	
	if (rAbs.test(id)) {
		path = id;
		isAbsPath = true;
	} else {
		path = config.resolve ? config.resolve(id) : defaultResolve(config, id);
	}

	log('load module from : ' + path);
	loadResource(path, {
		config: config,

		success: function() {
			// if id is AbsPath, we define an module manually
			if (isAbsPath) {
				define(config, id, EMPTY_DEPENDS);
			}

			var o = config.modules[id];
			if (!o) {
				log('load module error ' + getId(config, id));
				return;
			}

			o.async = true; 
			loadModuleFromDef(config, o, function(factory) {
				for (var i = 0, c = list.length; i < c; i++) {
					list[i](factory);
				}
			});
			delete loadList[id];
		}
	});

};
//~ 

var defaultResolve = function(config, id) {
	id = id.replace(/\./g, '/')
		.replace(/([a-z])([A-Z])/g, function(s, m1, m2) {
			return m1 + '-'	+ m2;
		}).toLowerCase();
	
	var path = config.path,
		root = config.root;

	if (path) {
		for (var k in path) {
			if (id.indexOf(k) === 0) {
				id = id.replace(k, path[k]);
				break;
			}
		}
	}

	id = id + '.js';
	if (root && !/^\w+:\/\//.test(id)) {
		id = root.replace(/\/$/) + '/' + id;
	}
	return id;
};


// global define
var isOpera = navigator.userAgent.indexOf('Opera') !== -1;

var globalDefine = function(id, depends, factory) {
	assert(stack.length > 0, 'current config not exist');

	var config = stack[stack.length - 1],
		mod = config.define(id, depends, factory);

	postLoadResource = function(newConfig) {
		if (config !== newConfig) {
			log('postLoadResource for ' + getId(newConfig, mod.id));
			newConfig.define(id, depends, factory);	
			delete config.modules[mod.id];
		}
		postLoadResource = null;
	};
	
	if (document.attachEvent && !isOpera) {
		processIeDefine();
	}
};

// ie
var processIeDefine = function() {
	var script = getCurrentScript(),
		id = null,
		config = null;

	if (script && 
			(id = script.getAttribute('data-async'))) {
		config = cache[id];
		assert(config, 'config not exist: ' + config);
		postLoadResource(config);
	}
};
//~


// load resource
var rCss = /\.css(\?|$)/;
var loadResource = function(url, options) {
	if (rCss.test(url)) {
		loadCss(url, options);
	} else {
		loadScript(url, options);
	}
};

var head = document.head ||
		document.getElementsByTagName('head')[0] ||
		document.documentElement;

var currentlyAddingScript = null,
	interactiveScript = null;

var loadScript = function(url, options) {
    var node = document.createElement('script');

	assetOnLoad(url, node, scriptOnload, {
		success: function() {
			postLoadResource && postLoadResource(options.config);
			options.success();
		},
		error: options.error
	});

	node.async = 'async';
	node.src = url;
	node.setAttribute('data-async', options.config.id);
	node.setAttribute('charset', options.config.charset || 'gbk');

	currentlyAddingScript = node;
	head.insertBefore(node, head.firstChild);
	currentlyAddingScript = null;
};
//~ loadScript


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


var assetOnLoad = function(url, node, handler, options) {
	var flag = false,
		timer = null,
		cb = function() {
			if (flag) {
				return;
			}
			clearTimeout(timer);
			log('load success: ' + url);
			options.success && options.success();
		};
	
	timer = setTimeout(function() {
		flag = true;	
		log('load error: ' + url, 'warn');
		options.error && options.error();
	}, 10000);

	handler(node, cb);
};


var scriptOnload = function(node, callback) {
	node.onload = node.onerror = 
	node.onreadystatechange = function() {
		if (/loaded|complete|undefined/.test(node.readyState)) {
			// Ensure only run once
			node.onload = node.onerror = node.onreadystatechange = null;

			// Reduce memory leak
			if (node.parentNode) {
				try {
					if (node.clearAttributes) {
						node.clearAttributes();
					} else {
						for (var p in node) {
							delete node[p];
						}
					}
				} catch (e) {}

              // Remove the script
              head.removeChild(node);
            }

            // Dereference the node
            node = undefined;
            callback();
        }
    };
};


var loadCss = function(url, options) {
	var link = document.createElement('link'),
		timeout = false,
		timer = null,
		img = null,
		onload = null;

	link.type = 'text/css';
    link.rel = 'stylesheet';
	link.media = 'screen';
    link.href = url;

	assetOnLoad(url, link, function(node, callback) {
		// for ie
		if (node.attachEvent) {
			node.attachEvent('onload', callback);
			head.appendChild(node);
		} else {
			head.appendChild(node);
			var img = document.createElement('img');
			img.onerror = callback;
			img.src = url;
		}	
	}, options);

	return link;
};
//~ load resource


// packing
var _may = window.may,
	_define = window.define;

// for debug
may._cache = cache;
may._stack = stack;

may.config = config;
may.pushStack = pushStack;
may.popStack = popStack;

may.noConflict = function(deep) {
	if (deep) {
		window.define = _define;
	}
	window.may = _may;
	return may;
};


window.may = may;
window.define = globalDefine;

//~ end


// config system loader
config({ id: 'may' });
may.pushStack('may');

// define an css loader
window.define('CssLoader', function() {
	return { load: loadCss };
});

})(window);
