/**
 * require
 */
define('require', 
		['util', 'log', 'loaderEvent', 'module', 'define', 
		'alias', 'loader'], 

function(util, Log, loaderEvent, module, moduleDefine, 
		alias, loader) {

var isArray = util.isArray,
	assert = util.assert,
	log = new Log('require');


var require = function(config, depends, callback) {
	depends = depends ? 
			isArray(depends) ? depends : [depends] :
			[];

	var list = [],
		count = 0,
		n = depends.length,
		check = function() {
			count >= n && callback && callback.apply(null, list);
		},
		
		load = function(index) {
			var id = depends[index];
			loadModule(config, id, {
				success: function(o) {
					list[index] = o;
					count++;
					check();
				},
				error: function() {
					log.error('load', depend, 'error');
				}
			});
		};

	check();
	for (var i = 0; i < n; i++) {
		load(i);
	}

	return list[0];		
};		
//~


var loadModule = function(config, id, options) {
	var pos = id.indexOf(':');
	if (pos !== -1) {
		// require other namespace module
		var other = module.cache[id.substr(0, pos)];
		if (other && other !== config) {
			return loadModule(other, id.substr(pos + 1), options);
		}
	}

	id = alias.get(config, id);

	if (id === 'require') {
		options.success(config.require);
		return;
	}
	if (id === 'exports' || id === 'module') {
		options.success();
		return;
	}

	var o = config.modules[id];
	if (o) {
		loadModuleFromDef(config, o, options);
	} else {
		loadModuleFromScript(config, id, options);
	}
};
//~


var loadModuleFromDef = function(config, o, options) {
	var id = o.id,
		longId = module.getId(config, id);

	if (o.load) {
		o.load++;
		log.debug(longId, 'is loaded [', o.load , ']');
		options.success(o.exports);
		return;
	}
	
	o.loadList = o.loadList || [];
	o.loadList.push(options.success);
	if (o.loadList.length > 1) {
		return;
	}

	loaderEvent.trigger('beforecompile', config, o);

	var depends = o.depends || [];
	require(config, depends, function() {
		compile(config, o, arguments);
		log.debug(longId, 'is loaded');

		var loadList = o.loadList;
		for (var i = 0, c = loadList.length; i < c; i++) {
			loadList[i](o.exports);
		}
		
		o.load = loadList.length;
		o.loadList = null;
	});	
};
//~

var compile = function(config, o, args) {
	o.exports = {};
	var factory = o.factory;
	if (typeof factory === 'function') {
		for (var i = 0, c = o.depends; i < c; i++) {
			var depend = o.depends[i];
			if (depend === 'exports') {
				args[i] = o.exports;
			} else if (depend === 'module') {
				args[i] = o;
			}
		}
		try {
			log.debug('compile', module.getId(config, o.id));
			factory = factory.apply(o, args);
		} catch (e) {
			log.error(e);
			loaderEvent.trigger('compilefail', e, o);
		}
	}

	if (factory !== undefined && factory !== null) {
		o.exports = factory;
	}
};


// load async module
// depend 'resolve' and 'request'
var loadList = {};
var loadModuleFromScript = function(config, id, options) {
	var resolve = loader.require('resolve'),
		request = loader.require('request');

	var path = resolve(config, id),
		longId = module.getId(config, id);

	if (!path) {
		log.error('can not resove for:', longId);
		return;
	}

	var list = loadList[path] = loadList[path] || [];
	list.push(options);
	if (list.length > 1) {
		return;
	}

	log.debug('load module', longId, ' from:', path);
	request.module(path, {
		namespace: config.id,
		id: id,
		charset: config.charset,

		success: function() {
			delete loadList[id];
			
			if (!config.modules[id] && path === id) {
				moduleDefine(config, id);
			}
			var o = config.modules[id];
			if (!o) {
				log.error('module not exist: ' + longId);
				return;
			}

			o.async = true;
			loadModuleFromDef(config, o, {
				success: function(factory) {
					callList(list, 'success', factory);
				}
			});
		},

		error: function() {
			callList(list, 'error');
			delete loadList[id];
		}
	});

};
//~ 

var callList = function(list, name, arg) {
	for (var i = 0, c = list.length; i < c; i++) {
		list[i][name](arg);
	}
};


return require;


});

