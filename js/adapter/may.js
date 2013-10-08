/**
 * bridge butterfly to may
 */
(function() {

var loader = butterfly.require('loader'),
	util = loader.require('util'),
	log = loader.require('log'),
	request = loader.require('request');

var may = {
	config: butterfly.config,
	pushStack: butterfly.config.push,
	popStack: butterfly.config.pop,

	error: util.error,
	isDebug: log.isEnabled('debug')
};

may.log = log;
window.may = may;

butterfly.config({ id: 'may' });
butterfly.config.push('may');

define('loader', loader);
define('CssLoader', {
	load: util.proxy(request, 'css')
});

})();
