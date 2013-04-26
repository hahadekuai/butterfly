/**
 * config(config)  config a loader
 *	- id {string}
 *	- alias {object}
 *
 *	- resolve {function} @see resolve
 *	- root {string} 
 *	- path {object}
 *
 * config(name) get a loader config
 */
define('config', ['util', 'log', 'event', 'module', 'require', 'define'], 

function(util, Log, Event, module, require, define) {

var assert = util.assert,
	cache = module.cache,
	log = new Log('config');


var config = function(cfg) {
	// get exist config
	if (typeof cfg === 'string') {
		assert(cache[cfg], 'config for ' + cfg + ' is not exist');
		return cache[cfg].facade;
	}
	
	// set config
	var id = cfg.id || 'butterfly',
		o = cache[id];

	if (o) {
		log.info('config loader', id);
	} else {
		log.info('config new loader', id);
		o = cache[id] = create(id);
	}

	cfg = util.extend({}, cfg);
	delete cfg.id;
	util.extend(o, cfg);
	
	return o.facade;		
}
//~

var create = function(id) {
	var o = {
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
	
	var event = new Event('config/' + id);
	o.on = util.proxy(event, 'on');
	o.off = util.proxy(event, 'off');
	o.trigger = util.proxy(event, 'trigger');

	o.facade = { 
		id: o.id,
		define: o.define, 
		require: o.require, 
		isDefine: o.isDefine 
	};

	return o;
}
//~

return config;


});
