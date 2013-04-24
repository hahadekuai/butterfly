/**
 * resolve
 */
define('resolve', function() {

var rAbs = /^(?:(?:\w+:\/\/)|(?:[.\/]))/,
	rFile = /\.(js|css)(\?|$)/,
	rSlash = /\/$/;

var resolve = function(config, id) {
	if (rAbs.test(id)) {
		path = id;
	} else {
		path = config.resolve ? config.resolve(id) : resolve['default'](config, id);
	}
	return path;
};

resolve['default'] = function(config, id) {
	var root = config.root,
		path = config.path;

	if (!rFile.test(id)) {
		id = id.replace(/\./g, '/')
			.replace(/([a-z])([A-Z])/g, function(s, m1, m2) {
				return m1 + '-'	+ m2;
			}).toLowerCase();

		if (path) {
			for (var k in path) {
				var v = path[k];
				if (id.indexOf(k) === 0) {
					id = id.replace(k, v);
					break;
				}
			}
		}
	}
	
	if (!rFile.test(id)) {
		id = id + '.js';
	}
	
	if (root && !rAbs.test(id)) {
		id = root.replace(/\/$/, '') + '/' + id;
	}

	return id;		
};

return resolve;

});
