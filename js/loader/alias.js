/**
 * alias support
 */
define('alias', ['util', 'log'], function(util, Log) {

var log = new Log('alias');
	
return {
	get: function(config, id) {
		var alias = this._cache[id] || (config.alias && config.alias[id]);
		alias && log.debug(id, ' -> ', alias);
		return alias || id;
	},

	push: function(o) {
		util.extend(this._cache, o);	
	},

	_cache: {}
};

});
