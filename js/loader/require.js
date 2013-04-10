/**
 * require
 */
define('require', ['util', 'log', 'event/loader', 'module', 'loader'], 

function(util, Log, event, module, loader) {

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
			count >= n && callback &&
				callback.apply(null, list);
		},
		
		load = function(index) {
			var depend = depends[index];
			loadModule(config, depend, {
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
	if (id === 'require') {
		options.success(config.require);
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
	
	// require other namespace module
	pos = id.indexOf(':');
	if (pos !== -1 && 
			(otherConfig = module.cache[id.substr(0, pos)])) {
		return loadModule(otherConfig, id.substr(pos + 1), options);
	}

	o = config.modules[id];
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
		log.info(longId, 'is loaded [', o.load , ']');
		options.success(o.data);
		return;
	}
	
	o.loadList = o.loadList || [];
	o.loadList.push(options.success);
	if (o.loadList.length > 1) {
		return;
	}

	var depends = o.depends || [];
	require(config, depends, function() {
		var factory = o.factory,
			loadList = o.loadList; 

		if (typeof factory === 'function') {
			factory = factory.apply(o, arguments);
			log.info('initialize', longId, 'complete!');
		}
		o.data = factory;
		log.info(longId, 'is loaded');

		for (var i = 0, c = loadList.length; i < c; i++) {
			loadList[i](factory);
		}
		
		o.load = loadList.length;
		o.loadList = null;
	});	
};
//~


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

	log.info('load module', longId, ' from:', path);
	request.module(path, {
		namespace: config.id,
		id: id,

		success: function() {
			delete loadList[id];
			
			if (!config.modules[id]) {
				define(config, id);
			}

			var o = config.modules[id];
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

