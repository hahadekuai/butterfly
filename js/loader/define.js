/**
 * define
 */
define('define', ['util', 'log', 'loaderEvent', 'module'], 

function(util, Log, loaderEvent, module) {

var isArray = util.isArray,
	assert = util.assert,
	log = new Log('define');

/**
 * define a module
 */
var define = function(config, id, depends, factory) {
	var args = regularArgs(id, depends, factory),
		id = args.id,
		mods = config.modules;

	args.namespace = config.id;

	if (mods[id]) {
		log.warn(module.getId(config, id), ' already defined, ignore it');
		return;
	} else {
		log.info('define module:', module.getId(config, id));
		mods[id] = args;
	}

	config.trigger && config.trigger('define', args);
	loaderEvent.trigger('define', config, args);
	
	return args;
};

/**
 * define(id, depends, factory)
 * define(id, factory{not array})
 * define(id, depends{array})
 * define(depends{array}, factory)
 * define(factory{function})
 */
var EMPTY_DEPENDS = [];
var regularArgs = function(id, depends, factory) {
	// define(a) -> define(a, [], undefined)
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
	
	var anonymous = !id;
	id = id || '!anonymous' + module.guid++;

	return { id: id, depends: depends, factory: factory, anonymous: anonymous }; 
};
//~

return define;


});
