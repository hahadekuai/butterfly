/**
 * weave
 */
define('weave', 
		['util', 'log', 'loaderEvent', 'config', 'globaldefine', 
		'oldbutterfly', 'olddefine', 'loader'], 
function(util, Log, loaderEvent, Config, globaldefine, 
		oldbutterfly, olddefine, loader) {

var log = new Log('weave');

// require anonymous module immediately
loaderEvent.on('define', function(config, mod) {
	if (mod.anonymous || mod.id.indexOf('!') === 0) {
		log.debug('require anonymous module immediately: ' + mod.namespace, ':', mod.id)
		config.require([mod.id]);
	}
});

window.define = globaldefine;

// default config
Config.config({ id: 'butterfly' });
Config.push('butterfly');

// butterfly(o) -> config.config(o)
// butterfly.config(o) -> config.config(o)
// butterfly.config.push()
butterfly.handler = butterfly.config = Config;

// butterfly.define
// butterfly.require
// butterfly.isDefine
util.extend(butterfly, Config.get('butterfly'));

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
