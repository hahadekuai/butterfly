/**
 * weave
 */
define('weave', 
		['util', 'log', 'loaderEvent', 'config', 'globaldefine', 
		'oldbutterfly', 'olddefine', 'loader'], 
function(util, Log, loaderEvent, config, globaldefine, 
		oldbutterfly, olddefine, loader) {

var log = new Log('weave');

// require anonymous module immediately
loaderEvent.on('define', function(mod) {
	if (mod.anonymous || mod.id.indexOf('!') === 0) {
		log.info('require anonymous module immediately: ' + mod.namespace, ':', mod.id)
		config(mod.namespace).require([mod.id]);
	}
});

window.define = globaldefine;
config({ id: 'butterfly' });
config.push('butterfly');

// butterfly(o) -> config(o)
// butterfly.config(o) -> config(o)
butterfly.handler = butterfly.config = config;

// butterfly.define
// butterfly.require
// butterfly.isDefine
util.extend(butterfly, config('butterfly'));

var _butterfly = butterfly;
butterfly.noConflict = function(deep) {
	window.define = olddefine;
	if (deep) {
		window.butterfly = oldbutterfly;
	}
	return _butterfly;
};


// export loader module
butterfly.define('loader', loader);
util.each(['util', 'log', 'event', 'loaderEvent', 'config'], 
function(index, name) {
	butterfly.define('loader/' + name, function() {
		return loader.require(name);
	});
});


});
