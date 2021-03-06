/**
 * global define
 */
define('globaldefine', 
		['util', 'log', 'module', 'config', 'request'], 
		function(util, Log, module, Config, request) {

var assert = util.assert,
	log = new Log('globaldefine');

var stack = [];

util.extend(Config, {
	push: function(name) {
		log.debug('push loader to stack:', name);
		var config = module.cache[name];
		assert(config, 'config for ' + name + ' is not exist');
		stack.push(config);
		return config.facade;
	},

	pop: function() {
		log.debug('pop');
		assert(stack.length > 0, 'empty config stack');
		var o = stack.pop();
		return o.facade;
	},

	_stack: stack	// for debug
});


var globaldefine = function(id) {
	var config = null;
	for (var i = stack.length - 1; i >= 0; i--) {
		config = stack[i];
		if (typeof id !== 'string' || !config.modules[id]) {
			break;
		}
	}
	assert(config, 'not config for global define');
	var mod = config.define.apply(config, arguments);
	request.script.onpost(function(options) {
		postLoadScript(config, mod, options);
	});
};


// absolute path | relative path | js/css file
var rPath = /(^\w*:\/\/)|(^[.\/])|(\.(js|css)(\?|$))/;

var postLoadScript = function(config, mod, options) {
	if (rPath.test(options.id)) {
		return;
	}

	var namespace = options.namespace;

	// fix async anonymous module
	if (mod.anonymous) {
		log.debug('fix anonymous module id for ', namespace, ':', options.id);
		delete config.modules[mod.id];
		mod.id = options.id;
		config.modules[mod.id] = mod;
	}

	if (config.id ===  namespace || mod.id !== options.id) {
		return;
	}

	log.debug('fix module namespace for ', namespace, ':', mod.id);
	mod.namespace = namespace;
	module.cache[namespace].modules[mod.id] = mod;
	delete config.modules[mod.id];
};

return globaldefine;


});
