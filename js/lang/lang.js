/**
 * lang
 */
define('lang.Lang', function() {

'use strict'


var exports = {};

var toString = Object.prototype.toString;


exports.isArray = function(o) {
	return toString.apply(o) === '[object Array]'; 
};


exports.extend = function(des /*, src1, src2, ... */) {
	var objs = [].slice.call(arguments, 1);

	objs.forEach(function(obj) {
		if (obj) {
			for (var k in obj) {
				var v = obj[k];
				if (v !== undefined && v !== null) {
					des[k] = v;
				}
			}
		}
	});

	return des;
};


exports.each = function(iter, fn) {
	if (iter.length) {
		for (var i = 0, c = iter.length; i < c; i++) {
			if (fn(i, iter[i]) === false) {
				break;
			}
		}
	} else {
		for (var k in iter) {
			if (fn(k, iter[k]) === false) {
				break;
			}
		}
	}
};


exports.proxy = function(o, name) {
	var fn, params, n;
		if (typeof o === 'function') {
			fn = o;
			o = null;
			n = 1;
		} else {
			fn = o[name];
			n = 2;
		}
		params = arguments.length > n ? [].slice.call(arguments, n) : [];

		return function() {
			var args = arguments;
			if (params.length > 0) {
				args = params.slice(0);
				args.push.apply(args, arguments);
			}
			return fn.apply(o, args);
		};
};


return exports;

	
});

