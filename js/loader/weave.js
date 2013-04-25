/**
 * weave
 */
define('weave', 
		['util', 'log', 'event/loader', 'module', 'config', 'globaldefine', 
		'oldbutterfly', 'olddefine', 'loader'], 
function(util, Log, event, module, config, 
		globaldefine, oldbutterfly, olddefine, loader) {

var log = new Log('weave');

// require anonymous module immediately
event.on('define', function(mod) {
	if (mod.anonymous || mod.id.indexOf('!') === 0) {
		log.info('require anonymous module immediately: ' + mod.namespace, ':', mod.id)
		var config = module.cache[mod.namespace];
		config.require([mod.id]);
	}
});

window.define = globaldefine;
config({ id: 'butterfly' });
config.push('butterfly');

butterfly.handler = butterfly.config = config;
util.extend(butterfly, config('butterfly'));

var _butterfly = butterfly;
butterfly.noConflict = function(deep) {
	window.define = olddefine;
	if (deep) {
		window.butterfly = oldbutterfly;
	}
	return _butterfly;
};

define('loader', loader);

});
