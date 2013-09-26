/**
 * Aspect
 * @author qijun.weiqj
 */
define('lang.Aspect', ['lang.Lang'], function(_) {

var Aspect = function() {
	this._list = [];
	this.isAttached = true;
};
Aspect.prototype = {

	before: function(target, pointcut, advice) {
		intercept(this, target, pointcut, function(o) {
			var ret = advice(o),
				args = _.isArray(ret) ? ret : args;

			return o.method.apply(o.target, args);
		});
		return this;
	},

	after: function(target, pointcut, advice) {
		intercept(this, target, pointcut, function(o) {
			o.result = o.method.apply(o.target, o.args);
			var result = advice(o);
			return result === undefined ? o.result : result;
		});
		return this;
	},

	around: function(target, pointcut, advice) {
		intercept(this, target, pointcut, function(o) {
			return advice(o);
		});
		return this;
	},

	attach: function(detach) {
		var list = this._list;
		for (var i = 0, c = list.length; i < c; i++) {
			var o = list[i];
			o.target[o.name] = o.method;
		}

		this.isAttached = true;
		return this;
	},

	detach: function() {
		var list = this._list,
			i = list.length;

		while (i--) {
			var o = list[i];
			o.target[o.name] = o.original;
		}

		this.isAttached = false;
		return this;
	}
};
//~ Aspect


// private
var intercept = function(self, target, pointcut, callback) {
	target = target || window;

	if (typeof pointcut === 'string') {
		pointcut = [pointcut];
	}

	if (_.isArray(pointcut)) {
		for (var i = 0, c = pointcut.length; i < c; i++) {
			interceptItem(self, target, pointcut[i], callback);
		}
	} else if (pointcut.test) {
		for (var k in target) {
			if (pointcut.test(k) && typeof target[k] === 'function') {
				interceptItem(self, target, k, callback);
			}
		}
	}
	
};

var interceptItem = function(self, target, name, callback) {
	var original = target[name];
	if (typeof original !== 'function') {
		throw new Error('target method not exist: ' + name);
	}

	var method = function() {
		var args = [].slice.call(arguments, 0);
		return callback({
			target: target,
			name: name,
			args: args,
			method: original
		});
	};

	self._list.push({
		target: target,
		name: name,
		original: original,
		method: method
	});

	if (self.isAttached) {
		target[name] = method;
	}
};


// static
(function() {

var create = function(method) {
	Aspect[method] = function(target, pointcut, advice) {
		var o = new this();
		return o[method](target, pointcut, advice);
	};
};

var methods = ['before', 'after', 'around'];
for (var i = 0, c = methods.length; i < c; i++) {
	create(methods[i]);
}

	
})();
//~

return Aspect;


});
