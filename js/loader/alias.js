/**
 * alias support
 */
define('alias', ['util'], function(util) {
	
var Alias = {
	get: function(config, id) {
		var alias = this._cache[id] || (config.alias && config.alias[id]);
		return alias || id;
	},

	push: function(o) {
		util.extend(this._cache, o);	
	},

	_cache: {}
};

return Alias;

});