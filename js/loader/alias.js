/**
 * alias support
 */
define('alias', ['log', 'util'], function(Log, util) {
	
var log = new Log('alias');

var map = {}

return {
	get: function(config, id) {
		var alias = map[id] || (config.alias && config.alias[id]);
		alias && log.info('alias ', id, ' -> ', alias);
		return alias || id;
	},

	push: function(o) {
		util.extend(map, o);	
	}
};

});
