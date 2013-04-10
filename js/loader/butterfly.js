/**
 * butterfly 1.1
 *
 * @author qijun.weiqj@alibaba-inc.com
 */
(function() {

var modules = {};

var require = function(name) {
	return modules[name];
};
var define = function(name, depends, o) {
	if (modules[name]) {
		throw 'module already exist: ' + name;
	}
	if (!o) {
		o = depends;
		depends = [];
	}
	if (typeof o === 'function') {
		var args = [];
		for (var i = 0, c = depends.length; i < c; i++) {
			args.push(require(depends[i]));
		}
		o = o.apply(null, args);
	}
	modules[name] = o;	
}

var butterfly = function() {
	return butterfly.handler && 
			butterfly.handler.apply(this, arguments);
};

butterfly._modules = modules;
butterfly.version = '1.1';

define('oldbutterfly', window.butterfly);
define('olddefine', window.define);
define('global', this);
define('loader', { define: define, require: require });

window.butterfly = butterfly;
window.define = define;

})();
