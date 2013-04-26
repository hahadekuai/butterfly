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
		config.get(mod.namespace).require([mod.id]);
	}
});

window.define = globaldefine;

// default config
config.config({ id: 'butterfly' });
config.push('butterfly');

// butterfly(o) -> config.config(o)
// butterfly.config(o) -> config.config(o)
// butterfly.config.push()
butterfly.handler = butterfly.config = config;

// butterfly.define
// butterfly.require
// butterfly.isDefine
util.extend(butterfly, config.get('butterfly'));

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

});
