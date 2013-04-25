/**
 * alias support
 */
define('alias', ['util'], function(util) {
	
var map = {}

return {
	get: function(config, id) {
		var alias = map[id] || (config.alias && config.alias[id]);
		return alias || id;
	},

	push: function(o) {
		util.extend(map, o);	
	}
};

});
