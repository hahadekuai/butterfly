/**
 * module base struct
 * for require, define, config...
 */
define('module', {
	cache: {},
	guid: 1,
	
	// just for log
	getId: function(config, id) {
		return config.id + ':' + id;
	}
});
