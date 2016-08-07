/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmory imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmory exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		Object.defineProperty(exports, name, {
/******/ 			configurable: false,
/******/ 			enumerable: true,
/******/ 			get: getter
/******/ 		});
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ },
/* 1 */
/***/ function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;
	var sourceMap = obj.sourceMap;

	if (media) {
		styleElement.setAttribute("media", media);
	}

	if (sourceMap) {
		// https://developer.chrome.com/devtools/docs/javascript-debugging
		// this makes source maps inside style tags work properly in Chrome
		css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__

/* styles */
__webpack_require__(18)

/* script */
__vue_exports__ = __webpack_require__(4)

/* template */
var __vue_template__ = __webpack_require__(13)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (typeof __vue_exports__.default === "object") {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {'use strict';

/**
 * Convert a value to a string that is actually rendered.
 */
function _toString(val) {
  return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber(val) {
  var n = parseFloat(val, 10);
  return n || n === 0 ? n : val;
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap(str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? function (val) {
    return map[val.toLowerCase()];
  } : function (val) {
    return map[val];
  };
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true);

/**
 * Remove an item from an array
 */
function remove(arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Check if value is primitive
 */
function isPrimitive(value) {
  return typeof value === 'string' || typeof value === 'number';
}

/**
 * Create a cached version of a pure function.
 */
function cached(fn) {
  var cache = Object.create(null);
  return function cachedFn(str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

/**
 * Camelize a hyphen-delmited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
});

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /([^-])([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '$1-$2').replace(hyphenateRE, '$1-$2').toLowerCase();
});

/**
 * Simple bind, faster than native
 */
function bind(fn, ctx) {
  function boundFn(a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  }
  // record original fn length
  boundFn._length = fn.length;
  return boundFn;
}

/**
 * Convert an Array-like object to a real Array.
 */
function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);
  while (i--) {
    ret[i] = list[i + start];
  }
  return ret;
}

/**
 * Mix properties into target object.
 */
function extend(to, _from) {
  for (var _key in _from) {
    to[_key] = _from[_key];
  }
  return to;
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject(arr) {
  var res = arr[0] || {};
  for (var i = 1; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }
  return res;
}

/**
 * Perform no operation.
 */
function noop() {}

/**
 * Always return false.
 */
var no = function no() {
  return false;
};

/**
 * Generate a static keys string from compiler modules.
 */
function genStaticKeys(modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || []);
  }, []).join(',');
}

var config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Whether to enable devtools
   */
  devtools: "production" !== 'production',

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: null,

  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * List of asset types that a component can own.
   */
  _assetTypes: ['component', 'directive', 'filter'],

  /**
   * List of lifecycle hooks.
   */
  _lifecycleHooks: ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'activated', 'deactivated'],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
  _maxUpdateCount: 100,

  /**
   * Server rendering?
   */
  _isServer: {"NODE_ENV":"production"}.VUE_ENV === 'server'
};

/**
 * Check if a string starts with $ or _
 */
function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

/**
 * Define a property.
 */
function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

/**
 * Parse simple path.
 */
var bailRE = /[^\w\.\$]/;
function parsePath(path) {
  if (bailRE.test(path)) {
    return;
  } else {
    var _ret = function () {
      var segments = path.split('.');
      return {
        v: function v(obj) {
          for (var i = 0; i < segments.length; i++) {
            if (!obj) return;
            obj = obj[segments[i]];
          }
          return obj;
        }
      };
    }();

    if (typeof _ret === "object") return _ret.v;
  }
}

/* global MutationObserver */
// can we use __proto__?
var hasProto = '__proto__' in {};

// Browser environment sniffing
var inBrowser = typeof window !== 'undefined' && Object.prototype.toString.call(window) !== '[object Object]';

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

// UA sniffing for working around browser-specific quirks
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIos = UA && /(iphone|ipad|ipod|ios)/i.test(UA);
var iosVersionMatch = UA && isIos && UA.match(/os ([\d_]+)/);
var iosVersion = iosVersionMatch && iosVersionMatch[1].split('_');

// MutationObserver is unreliable in iOS 9.3 UIWebView
// detecting it by checking presence of IndexedDB
// ref #3027
var hasMutationObserverBug = iosVersion && Number(iosVersion[0]) >= 9 && Number(iosVersion[1]) >= 3 && !window.indexedDB;

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */
var nextTick = function () {
  var callbacks = [];
  var pending = false;
  var timerFunc = void 0;
  function nextTickHandler() {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks = [];
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  /* istanbul ignore else */
  if (typeof MutationObserver !== 'undefined' && !hasMutationObserverBug) {
    (function () {
      var counter = 1;
      var observer = new MutationObserver(nextTickHandler);
      var textNode = document.createTextNode(String(counter));
      observer.observe(textNode, {
        characterData: true
      });
      timerFunc = function timerFunc() {
        counter = (counter + 1) % 2;
        textNode.data = String(counter);
      };
    })();
  } else {
    // webpack attempts to inject a shim for setImmediate
    // if it is used as a global, so we have to work around that to
    // avoid bundling unnecessary code.
    var context = inBrowser ? window : typeof global !== 'undefined' ? global : {};
    timerFunc = context.setImmediate || setTimeout;
  }
  return function (cb, ctx) {
    var func = ctx ? function () {
      cb.call(ctx);
    } : cb;
    callbacks.push(func);
    if (pending) return;
    pending = true;
    timerFunc(nextTickHandler, 0);
  };
}();

var _Set = void 0;
/* istanbul ignore if */
if (typeof Set !== 'undefined' && /native code/.test(Set.toString())) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = function () {
    function Set() {
      this.set = Object.create(null);
    }

    Set.prototype.has = function has(key) {
      return this.set[key] !== undefined;
    };

    Set.prototype.add = function add(key) {
      this.set[key] = 1;
    };

    Set.prototype.clear = function clear() {
      this.set = Object.create(null);
    };

    return Set;
  }();
}

var hasProxy = void 0;
var proxyHandlers = void 0;
var initProxy = void 0;
if (false) {
  (function () {
    var allowedGlobals = makeMap('Infinity,undefined,NaN,isFinite,isNaN,' + 'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' + 'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' + 'require,__webpack_require__' // for Webpack/Browserify
    );

    hasProxy = typeof Proxy !== 'undefined' && Proxy.toString().match(/native code/);

    proxyHandlers = {
      has: function has(target, key) {
        var has = key in target;
        var isAllowedGlobal = allowedGlobals(key);
        if (!has && !isAllowedGlobal) {
          warn('Trying to access non-existent property "' + key + '" while rendering. ' + 'Make sure to declare reactive data properties in the data option.', target);
        }
        return !isAllowedGlobal;
      }
    };

    initProxy = function initProxy(vm) {
      if (hasProxy) {
        vm._renderProxy = new Proxy(vm, proxyHandlers);
      } else {
        vm._renderProxy = vm;
      }
    };
  })();
}

var uid$2 = 0;

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */

var Dep = function () {
  function Dep() {
    this.id = uid$2++;
    this.subs = [];
  }

  Dep.prototype.addSub = function addSub(sub) {
    this.subs.push(sub);
  };

  Dep.prototype.removeSub = function removeSub(sub) {
    remove(this.subs, sub);
  };

  Dep.prototype.depend = function depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  };

  Dep.prototype.notify = function notify() {
    // stablize the subscriber list first
    var subs = this.subs.slice();
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  };

  return Dep;
}();

Dep.target = null;
var targetStack = [];

function pushTarget(_target) {
  if (Dep.target) targetStack.push(Dep.target);
  Dep.target = _target;
}

function popTarget() {
  Dep.target = targetStack.pop();
}

var queue = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState() {
  queue.length = 0;
  has = {};
  if (false) {
    circular = {};
  }
  waiting = flushing = false;
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue() {
  flushing = true;

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) {
    return a.id - b.id;
  });

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    var watcher = queue[index];
    var id = watcher.id;
    has[id] = null;
    watcher.run();
    // in dev build, check and stop circular updates.
    if (false) {
      circular[id] = (circular[id] || 0) + 1;
      if (circular[id] > config._maxUpdateCount) {
        warn('You may have an infinite update loop ' + (watcher.user ? 'in watcher with expression "' + watcher.expression + '"' : 'in a component render function.'), watcher.vm);
        break;
      }
    }
  }

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush');
  }

  resetSchedulerState();
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher(watcher) {
  var id = watcher.id;
  if (has[id] == null) {
    has[id] = true;
    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;
      while (i >= 0 && queue[i].id > watcher.id) {
        i--;
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher);
    }
    // queue the flush
    if (!waiting) {
      waiting = true;
      nextTick(flushSchedulerQueue);
    }
  }
}

var uid$1 = 0;

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */

var Watcher = function () {
  function Watcher(vm, expOrFn, cb) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    this.vm = vm;
    vm._watchers.push(this);
    // options
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.expression = expOrFn.toString();
    this.cb = cb;
    this.id = ++uid$1; // uid for batching
    this.active = true;
    this.dirty = this.lazy; // for lazy watchers
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = function () {};
        "production" !== 'production' && warn('Failed watching path: "' + expOrFn + '" ' + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
      }
    }
    this.value = this.lazy ? undefined : this.get();
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */


  Watcher.prototype.get = function get() {
    pushTarget(this);
    var value = this.getter.call(this.vm, this.vm);
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }
    popTarget();
    this.cleanupDeps();
    return value;
  };

  /**
   * Add a dependency to this directive.
   */


  Watcher.prototype.addDep = function addDep(dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };

  /**
   * Clean up for dependency collection.
   */


  Watcher.prototype.cleanupDeps = function cleanupDeps() {
    var i = this.deps.length;
    while (i--) {
      var dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */


  Watcher.prototype.update = function update() {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  };

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */


  Watcher.prototype.run = function run() {
    if (this.active) {
      var value = this.get();
      if (value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) || this.deep) {
        // set new value
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            "production" !== 'production' && warn('Error in watcher "' + this.expression + '"', this.vm);
            /* istanbul ignore else */
            if (config.errorHandler) {
              config.errorHandler.call(null, e, this.vm);
            } else {
              throw e;
            }
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };

  /**
   * Evaluate the value of the watcher.
   * This only gets called for lazy watchers.
   */


  Watcher.prototype.evaluate = function evaluate() {
    this.value = this.get();
    this.dirty = false;
  };

  /**
   * Depend on all deps collected by this watcher.
   */


  Watcher.prototype.depend = function depend() {
    var i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  };

  /**
   * Remove self from all dependencies' subcriber list.
   */


  Watcher.prototype.teardown = function teardown() {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed or is performing a v-for
      // re-render (the watcher list is then filtered by v-for).
      if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
        remove(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  };

  return Watcher;
}();

var seenObjects = new _Set();
function traverse(val, seen) {
  var i = void 0,
      keys = void 0;
  if (!seen) {
    seen = seenObjects;
    seen.clear();
  }
  var isA = Array.isArray(val);
  var isO = isObject(val);
  if ((isA || isO) && Object.isExtensible(val)) {
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return;
      } else {
        seen.add(depId);
      }
    }
    if (isA) {
      i = val.length;
      while (i--) {
        traverse(val[i], seen);
      }
    } else if (isO) {
      keys = Object.keys(val);
      i = keys.length;
      while (i--) {
        traverse(val[keys[i]], seen);
      }
    }
  }
}

var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */
;['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted = void 0;
    switch (method) {
      case 'push':
        inserted = args;
        break;
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true,
  isSettingProps: false
};

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
var Observer = function () {
  // number of vms that has this object as root $data

  function Observer(value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    if (Array.isArray(value)) {
      var augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */


  Observer.prototype.walk = function walk(obj) {
    var val = this.value;
    for (var key in obj) {
      defineReactive(val, key, obj[key]);
    }
  };

  /**
   * Observe a list of Array items.
   */


  Observer.prototype.observeArray = function observeArray(items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  };

  return Observer;
}();

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment(target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * istanbul ignore next
 */
function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe(value) {
  if (!isObject(value)) {
    return;
  }
  var ob = void 0;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (observerState.shouldConvert && !config._isServer && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }
  return ob;
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive(obj, key, val, customSetter) {
  var dep = new Dep();

  var property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get;
  var setter = property && property.set;

  var childOb = observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.dep.depend();
        }
        if (Array.isArray(value)) {
          for (var e, i = 0, l = value.length; i < l; i++) {
            e = value[i];
            e && e.__ob__ && e.__ob__.dep.depend();
          }
        }
      }
      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      if (newVal === value) {
        return;
      }
      if (false) {
        customSetter();
      }
      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }
      childOb = observe(newVal);
      dep.notify();
    }
  });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set(obj, key, val) {
  if (Array.isArray(obj)) {
    obj.splice(key, 1, val);
    return val;
  }
  if (hasOwn(obj, key)) {
    obj[key] = val;
    return;
  }
  var ob = obj.__ob__;
  if (obj._isVue || ob && ob.vmCount) {
    "production" !== 'production' && warn('Avoid adding reactive properties to a Vue instance or its root $data ' + 'at runtime - delcare it upfront in the data option.');
    return;
  }
  if (!ob) {
    obj[key] = val;
    return;
  }
  defineReactive(ob.value, key, val);
  ob.dep.notify();
  return val;
}

/**
 * Delete a property and trigger change if necessary.
 */
function del(obj, key) {
  var ob = obj.__ob__;
  if (obj._isVue || ob && ob.vmCount) {
    "production" !== 'production' && warn('Avoid deleting properties on a Vue instance or its root $data ' + '- just set it to null.');
    return;
  }
  if (!hasOwn(obj, key)) {
    return;
  }
  delete obj[key];
  if (!ob) {
    return;
  }
  ob.dep.notify();
}

function initState(vm) {
  vm._watchers = [];
  initProps(vm);
  initData(vm);
  initComputed(vm);
  initMethods(vm);
  initWatch(vm);
}

function initProps(vm) {
  var props = vm.$options.props;
  var propsData = vm.$options.propsData;
  if (props) {
    var keys = vm.$options._propKeys = Object.keys(props);
    var isRoot = !vm.$parent;
    // root instance props should be converted
    observerState.shouldConvert = isRoot;

    var _loop = function _loop(i) {
      var key = keys[i];
      /* istanbul ignore else */
      if (false) {
        defineReactive(vm, key, validateProp(key, props, propsData, vm), function () {
          if (vm.$parent && !observerState.isSettingProps) {
            warn('Avoid mutating a prop directly since the value will be ' + 'overwritten whenever the parent component re-renders. ' + 'Instead, use a data or computed property based on the prop\'s ' + ('value. Prop being mutated: "' + key + '"'), vm);
          }
        });
      } else {
        defineReactive(vm, key, validateProp(key, props, propsData, vm));
      }
    };

    for (var i = 0; i < keys.length; i++) {
      _loop(i);
    }
    observerState.shouldConvert = true;
  }
}

function initData(vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {};
  if (!isPlainObject(data)) {
    data = {};
    "production" !== 'production' && warn('data functions should return an object.', vm);
  }
  // proxy data on instance
  var keys = Object.keys(data);
  var props = vm.$options.props;
  var i = keys.length;
  while (i--) {
    if (props && hasOwn(props, keys[i])) {
      "production" !== 'production' && warn('The data property "' + keys[i] + '" is already declared as a prop. ' + 'Use prop default value instead.', vm);
    } else {
      proxy(vm, keys[i]);
    }
  }
  // observe data
  observe(data);
  data.__ob__ && data.__ob__.vmCount++;
}

var computedSharedDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function initComputed(vm) {
  var computed = vm.$options.computed;
  if (computed) {
    for (var _key in computed) {
      var userDef = computed[_key];
      if (typeof userDef === 'function') {
        computedSharedDefinition.get = makeComputedGetter(userDef, vm);
        computedSharedDefinition.set = noop;
      } else {
        computedSharedDefinition.get = userDef.get ? userDef.cache !== false ? makeComputedGetter(userDef.get, vm) : bind(userDef.get, vm) : noop;
        computedSharedDefinition.set = userDef.set ? bind(userDef.set, vm) : noop;
      }
      Object.defineProperty(vm, _key, computedSharedDefinition);
    }
  }
}

function makeComputedGetter(getter, owner) {
  var watcher = new Watcher(owner, getter, noop, {
    lazy: true
  });
  return function computedGetter() {
    if (watcher.dirty) {
      watcher.evaluate();
    }
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value;
  };
}

function initMethods(vm) {
  var methods = vm.$options.methods;
  if (methods) {
    for (var _key2 in methods) {
      vm[_key2] = bind(methods[_key2], vm);
    }
  }
}

function initWatch(vm) {
  var watch = vm.$options.watch;
  if (watch) {
    for (var _key3 in watch) {
      var handler = watch[_key3];
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, _key3, handler[i]);
        }
      } else {
        createWatcher(vm, _key3, handler);
      }
    }
  }
}

function createWatcher(vm, key, handler) {
  var options = void 0;
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  vm.$watch(key, handler, options);
}

function stateMixin(Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};
  dataDef.get = function () {
    return this._data;
  };
  if (false) {
    dataDef.set = function (newData) {
      warn('Avoid replacing instance root $data. ' + 'Use nested data properties instead.', this);
    };
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef);

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;
    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  };
}

function proxy(vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter() {
        return vm._data[key];
      },
      set: function proxySetter(val) {
        vm._data[key] = val;
      }
    });
  }
}

var VNode = // hoisted static node
// compoennt placeholder node
// rendered in this component's scope
function VNode(tag, data, children, text, elm, ns, context, componentOptions) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = ns;
  this.context = context;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.child = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  // apply construct hook.
  // this is applied during render, before patch happens.
  // unlike other hooks, this is applied on both client and server.
  var constructHook = data && data.hook && data.hook.construct;
  if (constructHook) {
    constructHook(this);
  }
} // necessary for enter transition check
// contains raw HTML
// component instance
;

var emptyVNode = function emptyVNode() {
  var node = new VNode();
  node.text = '';
  node.isComment = true;
  return node;
};

function normalizeChildren(children, ns) {
  if (isPrimitive(children)) {
    return [createTextVNode(children)];
  }
  if (Array.isArray(children)) {
    var res = [];
    for (var i = 0, l = children.length; i < l; i++) {
      var c = children[i];
      var last = res[res.length - 1];
      //  nested
      if (Array.isArray(c)) {
        res.push.apply(res, normalizeChildren(c, ns));
      } else if (isPrimitive(c)) {
        if (last && last.text) {
          last.text += String(c);
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode(c));
        }
      } else if (c instanceof VNode) {
        if (c.text && last && last.text) {
          last.text += c.text;
        } else {
          // inherit parent namespace
          if (ns) {
            applyNS(c, ns);
          }
          res.push(c);
        }
      }
    }
    return res;
  }
}

function createTextVNode(val) {
  return new VNode(undefined, undefined, undefined, String(val));
}

function applyNS(vnode, ns) {
  if (vnode.tag && !vnode.ns) {
    vnode.ns = ns;
    if (vnode.children) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        applyNS(vnode.children[i], ns);
      }
    }
  }
}

// in case the child is also an abstract component, e.g. <transition-control>
// we want to recrusively retrieve the real component to be rendered
function getRealChild(vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(compOptions.propsData && compOptions.propsData.child);
  } else {
    return vnode;
  }
}

function mergeVNodeHook(def, key, hook) {
  var oldHook = def[key];
  if (oldHook) {
    def[key] = function () {
      oldHook.apply(this, arguments);
      hook.apply(this, arguments);
    };
  } else {
    def[key] = hook;
  }
}

function updateListeners(on, oldOn, add, remove) {
  var name = void 0,
      cur = void 0,
      old = void 0,
      fn = void 0,
      event = void 0,
      capture = void 0;
  for (name in on) {
    cur = on[name];
    old = oldOn[name];
    if (!old) {
      capture = name.charAt(0) === '!';
      event = capture ? name.slice(1) : name;
      if (Array.isArray(cur)) {
        add(event, cur.invoker = arrInvoker(cur), capture);
      } else {
        fn = cur;
        cur = on[name] = {};
        cur.fn = fn;
        add(event, cur.invoker = fnInvoker(cur), capture);
      }
    } else if (Array.isArray(old)) {
      old.length = cur.length;
      for (var i = 0; i < old.length; i++) {
        old[i] = cur[i];
      }on[name] = old;
    } else {
      old.fn = cur;
      on[name] = old;
    }
  }
  for (name in oldOn) {
    if (!on[name]) {
      event = name.charAt(0) === '!' ? name.slice(1) : name;
      remove(event, oldOn[name].invoker);
    }
  }
}

function arrInvoker(arr) {
  return function (ev) {
    var single = arguments.length === 1;
    for (var i = 0; i < arr.length; i++) {
      single ? arr[i](ev) : arr[i].apply(null, arguments);
    }
  };
}

function fnInvoker(o) {
  return function (ev) {
    var single = arguments.length === 1;
    single ? o.fn(ev) : o.fn.apply(null, arguments);
  };
}

var activeInstance = null;

function initLifecycle(vm) {
  var options = vm.$options;

  // locate first non-abstract parent
  var parent = options.parent;
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }
    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;

  vm.$children = [];
  vm.$refs = {};

  vm._watcher = null;
  vm._inactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin(Vue) {
  Vue.prototype._mount = function (el, hydrating) {
    var vm = this;
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = emptyVNode;
      if (false) {
        /* istanbul ignore if */
        if (vm.$options.template) {
          warn('You are using the runtime-only build of Vue where the template ' + 'option is not available. Either pre-compile the templates into ' + 'render functions, or use the compiler-included build.', vm);
        } else {
          warn('Failed to mount component: template or render function not defined.', vm);
        }
      }
    }
    callHook(vm, 'beforeMount');
    vm._watcher = new Watcher(vm, function () {
      vm._update(vm._render(), hydrating);
    }, noop);
    hydrating = false;
    // root instance, call mounted on self
    // mounted is called for child components in its inserted hook
    if (vm.$root === vm) {
      vm._isMounted = true;
      callHook(vm, 'mounted');
    }
    return vm;
  };

  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate');
    }
    var prevEl = vm.$el;
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    if (!vm._vnode) {
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating);
    } else {
      vm.$el = vm.__patch__(vm._vnode, vnode);
    }
    activeInstance = prevActiveInstance;
    vm._vnode = vnode;
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    }
    if (vm._isMounted) {
      callHook(vm, 'updated');
    }
  };

  Vue.prototype._updateFromParent = function (propsData, listeners, parentVnode, renderChildren) {
    var vm = this;
    var hasChildren = !!(vm.$options._renderChildren || renderChildren);
    vm.$options._parentVnode = parentVnode;
    vm.$options._renderChildren = renderChildren;
    // update props
    if (propsData && vm.$options.props) {
      observerState.shouldConvert = false;
      if (false) {
        observerState.isSettingProps = true;
      }
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        vm[key] = validateProp(key, vm.$options.props, propsData, vm);
      }
      observerState.shouldConvert = true;
      if (false) {
        observerState.isSettingProps = false;
      }
    }
    // update listeners
    if (listeners) {
      var oldListeners = vm.$options._parentListeners;
      vm.$options._parentListeners = listeners;
      vm._updateListeners(listeners, oldListeners);
    }
    // force udpate if has children
    if (hasChildren) {
      vm.$forceUpdate();
    }
  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;
    if (vm._watcher) {
      vm._watcher.update();
    }
    if (vm._watchers.length) {
      for (var i = 0; i < vm._watchers.length; i++) {
        vm._watchers[i].update(true /* shallow */);
      }
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;
    if (vm._isBeingDestroyed) {
      return;
    }
    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true;
    // remove self from parent
    var parent = vm.$parent;
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown();
    }
    var i = vm._watchers.length;
    while (i--) {
      vm._watchers[i].teardown();
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    }
    // call the last hook...
    vm._isDestroyed = true;
    callHook(vm, 'destroyed');
    // turn off all instance listeners.
    vm.$off();
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null;
    }
  };
}

function callHook(vm, hook) {
  var handlers = vm.$options[hook];
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm);
    }
  }
  vm.$emit('hook:' + hook);
}

var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy };
var hooksToMerge = Object.keys(hooks);

function createComponent(Ctor, data, context, children, tag) {
  if (!Ctor) {
    return;
  }

  if (isObject(Ctor)) {
    Ctor = Vue.extend(Ctor);
  }

  if (typeof Ctor !== 'function') {
    if (false) {
      warn('Invalid Component definition: ' + Ctor, context);
    }
    return;
  }

  // async component
  if (!Ctor.cid) {
    if (Ctor.resolved) {
      Ctor = Ctor.resolved;
    } else {
      Ctor = resolveAsyncComponent(Ctor, function () {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered by the scheduler.
        context.$forceUpdate();
      });
      if (!Ctor) {
        // return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
        return;
      }
    }
  }

  data = data || {};

  // extract props
  var propsData = extractProps(data, Ctor);

  // functional component
  if (Ctor.options.functional) {
    var _ret = function () {
      var props = {};
      var propOptions = Ctor.options.props;
      if (propOptions) {
        Object.keys(propOptions).forEach(function (key) {
          props[key] = validateProp(key, propOptions, propsData);
        });
      }
      return {
        v: Ctor.options.render.call(null, context.$createElement, {
          props: props,
          data: data,
          parent: context,
          children: normalizeChildren(children),
          slots: function slots() {
            return resolveSlots(children);
          }
        })
      };
    }();

    if (typeof _ret === "object") return _ret.v;
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on;
  // replace with listeners with .native modifier
  data.on = data.nativeOn;

  if (Ctor.options.abstract) {
    // abstract components do not keep anything
    // other than props & listeners
    data = {};
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data);

  // return a placeholder vnode
  var name = Ctor.options.name || tag;
  var vnode = new VNode('vue-component-' + Ctor.cid + (name ? '-' + name : ''), data, undefined, undefined, undefined, undefined, context, { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children });
  return vnode;
}

function createComponentInstanceForVnode(vnode, // we know it's MountedComponentVNode but flow doesn't
parent // activeInstance in lifecycle state
) {
  var vnodeComponentOptions = vnode.componentOptions;
  var options = {
    _isComponent: true,
    parent: parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children
  };
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate;
  if (inlineTemplate) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }
  return new vnodeComponentOptions.Ctor(options);
}

function init(vnode, hydrating) {
  if (!vnode.child) {
    var child = vnode.child = createComponentInstanceForVnode(vnode, activeInstance);
    child.$mount(hydrating ? vnode.elm : undefined, hydrating);
  }
}

function prepatch(oldVnode, vnode) {
  var options = vnode.componentOptions;
  var child = vnode.child = oldVnode.child;
  child._updateFromParent(options.propsData, // updated props
  options.listeners, // updated listeners
  vnode, // new parent vnode
  options.children // new children
  );
}

function insert(vnode) {
  if (!vnode.child._isMounted) {
    vnode.child._isMounted = true;
    callHook(vnode.child, 'mounted');
  }
  if (vnode.data.keepAlive) {
    vnode.child._inactive = false;
    callHook(vnode.child, 'activated');
  }
}

function destroy(vnode) {
  if (!vnode.child._isDestroyed) {
    if (!vnode.data.keepAlive) {
      vnode.child.$destroy();
    } else {
      vnode.child._inactive = true;
      callHook(vnode.child, 'deactivated');
    }
  }
}

function resolveAsyncComponent(factory, cb) {
  if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb);
  } else {
    var _ret2 = function () {
      factory.requested = true;
      var cbs = factory.pendingCallbacks = [cb];
      var sync = true;
      factory(
      // resolve
      function (res) {
        if (isObject(res)) {
          res = Vue.extend(res);
        }
        // cache resolved
        factory.resolved = res;
        // invoke callbacks only if this is not a synchronous resolve
        // (async resolves are shimmed as synchronous during SSR)
        if (!sync) {
          for (var i = 0, l = cbs.length; i < l; i++) {
            cbs[i](res);
          }
        }
      },
      // reject
      function (reason) {
        "production" !== 'production' && warn('Failed to resolve async component: ' + factory + (reason ? '\nReason: ' + reason : ''));
      });
      sync = false;
      // return in case resolved synchronously
      return {
        v: factory.resolved
      };
    }();

    if (typeof _ret2 === "object") return _ret2.v;
  }
}

function extractProps(data, Ctor) {
  // we are only extrating raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;
  if (!propOptions) {
    return;
  }
  var res = {};
  var attrs = data.attrs;
  var props = data.props;
  var domProps = data.domProps;

  if (attrs || props || domProps) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);
      checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey) || checkProp(res, domProps, key, altKey);
    }
  }
  return res;
}

function checkProp(res, hash, key, altKey, preserve) {
  if (hash) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];
      if (!preserve) {
        delete hash[key];
      }
      return true;
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];
      if (!preserve) {
        delete hash[altKey];
      }
      return true;
    }
  }
  return false;
}

function mergeHooks(data) {
  if (!data.hook) {
    data.hook = {};
  }
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var fromParent = data.hook[key];
    var ours = hooks[key];
    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours;
  }
}

function mergeHook$1(a, b) {
  // since all hooks have at most two args, use fixed args
  // to avoid having to use fn.apply().
  return function (_, __) {
    a(_, __);
    b(_, __);
  };
}

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement(tag, data, children) {
  if (data && (Array.isArray(data) || typeof data !== 'object')) {
    children = data;
    data = undefined;
  }
  // make sure to use real instance instead of proxy as context
  return _createElement(this._self, tag, data, children);
}

function _createElement(context, tag, data, children) {
  if (data && data.__ob__) {
    "production" !== 'production' && warn('Avoid using observed data object as vnode data: ' + JSON.stringify(data) + '\n' + 'Always create fresh vnode data objects in each render!', context);
    return;
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode();
  }
  if (typeof tag === 'string') {
    var Ctor = void 0;
    var ns = config.getTagNamespace(tag);
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      return new VNode(tag, data, normalizeChildren(children, ns), undefined, undefined, ns, context);
    } else if (Ctor = resolveAsset(context.$options, 'components', tag)) {
      // component
      return createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      return new VNode(tag, data, normalizeChildren(children, ns), undefined, undefined, ns, context);
    }
  } else {
    // direct component options / constructor
    return createComponent(tag, data, context, children);
  }
}

function initRender(vm) {
  vm.$vnode = null; // the placeholder node in parent tree
  vm._vnode = null; // the root of the child tree
  vm._staticTrees = null;
  vm.$slots = {};
  // bind the public createElement fn to this instance
  // so that we get proper render context inside it.
  vm.$createElement = bind(createElement, vm);
  if (vm.$options.el) {
    vm.$mount(vm.$options.el);
  }
}

function renderMixin(Vue) {
  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this);
  };

  Vue.prototype._render = function () {
    var vm = this;
    var _vm$$options = vm.$options;
    var render = _vm$$options.render;
    var staticRenderFns = _vm$$options.staticRenderFns;
    var _renderChildren = _vm$$options._renderChildren;
    var _parentVnode = _vm$$options._parentVnode;


    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = [];
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode;
    // resolve slots. becaues slots are rendered in parent scope,
    // we set the activeInstance to parent.
    vm.$slots = resolveSlots(_renderChildren);
    // render self
    var vnode = void 0;
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      if (false) {
        warn('Error when rendering ' + formatComponentName(vm) + ':');
      }
      /* istanbul ignore else */
      if (config.errorHandler) {
        config.errorHandler.call(null, e, vm);
      } else {
        if (config._isServer) {
          throw e;
        } else {
          setTimeout(function () {
            throw e;
          }, 0);
        }
      }
      // return previous vnode to prevent render error causing blank component
      vnode = vm._vnode;
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (false) {
        warn('Multiple root nodes returned from render function. Render function ' + 'should return a single root node.', vm);
      }
      vnode = emptyVNode();
    }
    // set parent
    vnode.parent = _parentVnode;
    return vnode;
  };

  // shorthands used in render functions
  Vue.prototype._h = createElement;
  // toString for mustaches
  Vue.prototype._s = _toString;
  // number conversion
  Vue.prototype._n = toNumber;

  // render static tree by index
  Vue.prototype._m = function renderStatic(index) {
    var tree = this._staticTrees[index];
    if (!tree) {
      tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy);
      tree.isStatic = true;
    }
    return tree;
  };

  // filter resolution helper
  var identity = function identity(_) {
    return _;
  };
  Vue.prototype._f = function resolveFilter(id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity;
  };

  // render v-for
  Vue.prototype._l = function renderList(val, render) {
    var ret = void 0,
        i = void 0,
        l = void 0,
        keys = void 0,
        key = void 0;
    if (Array.isArray(val)) {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      keys = Object.keys(val);
      ret = new Array(keys.length);
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
    return ret;
  };

  // apply v-bind object
  Vue.prototype._b = function bindProps(vnode, value, asProp) {
    if (value) {
      if (!isObject(value)) {
        "production" !== 'production' && warn('v-bind without argument expects an Object or Array value', this);
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        var data = vnode.data;
        for (var key in value) {
          if (key === 'class' || key === 'style') {
            data[key] = value[key];
          } else {
            var hash = asProp || config.mustUseProp(key) ? data.domProps || (data.domProps = {}) : data.attrs || (data.attrs = {});
            hash[key] = value[key];
          }
        }
      }
    }
  };

  // expose v-on keyCodes
  Vue.prototype._k = function getKeyCodes(key) {
    return config.keyCodes[key];
  };
}

function resolveSlots(renderChildren) {
  var slots = {};
  if (!renderChildren) {
    return slots;
  }
  var children = normalizeChildren(renderChildren) || [];
  var defaultSlot = [];
  var name = void 0,
      child = void 0;
  for (var i = 0, l = children.length; i < l; i++) {
    child = children[i];
    if (child.data && (name = child.data.slot)) {
      delete child.data.slot;
      var slot = slots[name] || (slots[name] = []);
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children);
      } else {
        slot.push(child);
      }
    } else {
      defaultSlot.push(child);
    }
  }
  // ignore single whitespace
  if (defaultSlot.length && !(defaultSlot.length === 1 && defaultSlot[0].text === ' ')) {
    slots.default = defaultSlot;
  }
  return slots;
}

function initEvents(vm) {
  vm._events = Object.create(null);
  // init parent attached events
  var listeners = vm.$options._parentListeners;
  var on = bind(vm.$on, vm);
  var off = bind(vm.$off, vm);
  vm._updateListeners = function (listeners, oldListeners) {
    updateListeners(listeners, oldListeners || {}, on, off);
  };
  if (listeners) {
    vm._updateListeners(listeners);
  }
}

function eventsMixin(Vue) {
  Vue.prototype.$on = function (event, fn) {
    var vm = this;(vm._events[event] || (vm._events[event] = [])).push(fn);
    return vm;
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;
    function on() {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }
    on.fn = fn;
    vm.$on(event, on);
    return vm;
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this;
    // all
    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm;
    }
    // specific event
    var cbs = vm._events[event];
    if (!cbs) {
      return vm;
    }
    if (arguments.length === 1) {
      vm._events[event] = null;
      return vm;
    }
    // specific handler
    var cb = void 0;
    var i = cbs.length;
    while (i--) {
      cb = cbs[i];
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }
    return vm;
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;
    var cbs = vm._events[event];
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(vm, args);
      }
    }
    return vm;
  };
}

var uid = 0;

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    var vm = this;
    // a uid
    vm._uid = uid++;
    // a flag to avoid this being observed
    vm._isVue = true;
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(resolveConstructorOptions(vm), options || {}, vm);
    }
    /* istanbul ignore else */
    if (false) {
      initProxy(vm);
    } else {
      vm._renderProxy = vm;
    }
    // expose real self
    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    callHook(vm, 'beforeCreate');
    initState(vm);
    callHook(vm, 'created');
    initRender(vm);
  };

  function initInternalComponent(vm, options) {
    var opts = vm.$options = Object.create(resolveConstructorOptions(vm));
    // doing this because it's faster than dynamic enumeration.
    opts.parent = options.parent;
    opts.propsData = options.propsData;
    opts._parentVnode = options._parentVnode;
    opts._parentListeners = options._parentListeners;
    opts._renderChildren = options._renderChildren;
    opts._componentTag = options._componentTag;
    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  function resolveConstructorOptions(vm) {
    var Ctor = vm.constructor;
    var options = Ctor.options;
    if (Ctor.super) {
      var superOptions = Ctor.super.options;
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        // super option changed
        Ctor.superOptions = superOptions;
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
        if (options.name) {
          options.components[options.name] = Ctor;
        }
      }
    }
    return options;
  }
}

function Vue(options) {
  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);

var warn = void 0;
var formatComponentName = void 0;

if (false) {
  (function () {
    var hasConsole = typeof console !== 'undefined';

    warn = function warn(msg, vm) {
      if (hasConsole && !config.silent) {
        console.error('[Vue warn]: ' + msg + ' ' + (vm ? formatLocation(formatComponentName(vm)) : ''));
      }
    };

    formatComponentName = function formatComponentName(vm) {
      if (vm.$root === vm) {
        return 'root instance';
      }
      var name = vm._isVue ? vm.$options.name || vm.$options._componentTag : vm.name;
      return name ? 'component <' + name + '>' : 'anonymous component';
    };

    var formatLocation = function formatLocation(str) {
      if (str === 'anonymous component') {
        str += ' - use the "name" option for better debugging messages.)';
      }
      return '(found in ' + str + ')';
    };
  })();
}

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies;

/**
 * Options with restrictions
 */
if (false) {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn('option "' + key + '" can only be used during instance ' + 'creation with the `new` keyword.');
    }
    return defaultStrat(parent, child);
  };

  strats.name = function (parent, child, vm) {
    if (vm) {
      warn('options "name" can only be used as a component definition option, ' + 'not during instance creation.');
    }
    return defaultStrat(parent, child);
  };
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData(to, from) {
  var key = void 0,
      toVal = void 0,
      fromVal = void 0;
  for (key in from) {
    toVal = to[key];
    fromVal = from[key];
    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }
  return to;
}

/**
 * Data
 */
strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }
    if (typeof childVal !== 'function') {
      "production" !== 'production' && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
      return parentVal;
    }
    if (!parentVal) {
      return childVal;
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn() {
      return mergeData(childVal.call(this), parentVal.call(this));
    };
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm) : undefined;
      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
};

/**
 * Hooks and param attributes are merged as arrays.
 */
function mergeHook(parentVal, childVal) {
  return childVal ? parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal] : parentVal;
}

config._lifecycleHooks.forEach(function (hook) {
  strats[hook] = mergeHook;
});

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets(parentVal, childVal) {
  var res = Object.create(parentVal || null);
  return childVal ? extend(res, childVal) : res;
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal, childVal) {
  /* istanbul ignore if */
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = {};
  extend(ret, parentVal);
  for (var key in childVal) {
    var parent = ret[key];
    var child = childVal[key];
    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }
    ret[key] = parent ? parent.concat(child) : [child];
  }
  return ret;
};

/**
 * Other object hashes.
 */
strats.props = strats.methods = strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal;
  if (!parentVal) return childVal;
  var ret = Object.create(null);
  extend(ret, parentVal);
  extend(ret, childVal);
  return ret;
};

/**
 * Default strategy.
 */
var defaultStrat = function defaultStrat(parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};

/**
 * Make sure component options get converted to actual
 * constructors.
 */
function normalizeComponents(options) {
  if (options.components) {
    var components = options.components;
    var def = void 0;
    for (var key in components) {
      var lower = key.toLowerCase();
      if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
        "production" !== 'production' && warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + key);
        continue;
      }
      def = components[key];
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def);
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps(options) {
  var props = options.props;
  if (!props) return;
  var res = {};
  var i = void 0,
      val = void 0,
      name = void 0;
  if (Array.isArray(props)) {
    i = props.length;
    while (i--) {
      val = props[i];
      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = { type: null };
      } else if (false) {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val) ? val : { type: val };
    }
  }
  options.props = res;
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives(options) {
  var dirs = options.directives;
  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key];
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def };
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions(parent, child, vm) {
  normalizeComponents(child);
  normalizeProps(child);
  normalizeDirectives(child);
  var extendsFrom = child.extends;
  if (extendsFrom) {
    parent = typeof extendsFrom === 'function' ? mergeOptions(parent, extendsFrom.options, vm) : mergeOptions(parent, extendsFrom, vm);
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i];
      if (mixin.prototype instanceof Vue) {
        mixin = mixin.options;
      }
      parent = mergeOptions(parent, mixin, vm);
    }
  }
  var options = {};
  var key = void 0;
  for (key in parent) {
    mergeField(key);
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }
  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }
  return options;
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }
  var assets = options[type];
  var res = assets[id] ||
  // camelCase ID
  assets[camelize(id)] ||
  // Pascal Case ID
  assets[capitalize(camelize(id))];
  if (false) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }
  return res;
}

function validateProp(key, propOptions, propsData, vm) {
  /* istanbul ignore if */
  if (!propsData) return;
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key];
  // handle boolean props
  if (prop.type === Boolean) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      value = true;
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key);
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldConvert = observerState.shouldConvert;
    observerState.shouldConvert = true;
    observe(value);
    observerState.shouldConvert = prevShouldConvert;
  }
  if (false) {
    assertProp(prop, key, value, vm, absent);
  }
  return value;
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue(vm, prop, name) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined;
  }
  var def = prop.default;
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    "production" !== 'production' && warn('Invalid default value for prop "' + name + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  }
  // call factory function for non-Function types
  return typeof def === 'function' && prop.type !== Function ? def.call(vm) : def;
}

/**
 * Assert whether a prop is valid.
 */
function assertProp(prop, name, value, vm, absent) {
  if (prop.required && absent) {
    warn('Missing required prop: "' + name + '"', vm);
    return;
  }
  if (value == null && !prop.required) {
    return;
  }
  var type = prop.type;
  var valid = !type;
  var expectedTypes = [];
  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType);
      valid = assertedType.valid;
    }
  }
  if (!valid) {
    warn('Invalid prop: type check failed for prop "' + name + '".' + ' Expected ' + expectedTypes.map(capitalize).join(', ') + ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.', vm);
    return;
  }
  var validator = prop.validator;
  if (validator) {
    if (!validator(value)) {
      warn('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
    }
  }
}

/**
 * Assert the type of a value
 */
function assertType(value, type) {
  var valid = void 0;
  var expectedType = void 0;
  if (type === String) {
    expectedType = 'string';
    valid = typeof value === expectedType;
  } else if (type === Number) {
    expectedType = 'number';
    valid = typeof value === expectedType;
  } else if (type === Boolean) {
    expectedType = 'boolean';
    valid = typeof value === expectedType;
  } else if (type === Function) {
    expectedType = 'function';
    valid = typeof value === expectedType;
  } else if (type === Object) {
    expectedType = 'Object';
    valid = isPlainObject(value);
  } else if (type === Array) {
    expectedType = 'Array';
    valid = Array.isArray(value);
  } else {
    expectedType = type.name || type.toString();
    valid = value instanceof type;
  }
  return {
    valid: valid,
    expectedType: expectedType
  };
}



var util = Object.freeze({
	defineReactive: defineReactive,
	_toString: _toString,
	toNumber: toNumber,
	makeMap: makeMap,
	isBuiltInTag: isBuiltInTag,
	remove: remove,
	hasOwn: hasOwn,
	isPrimitive: isPrimitive,
	cached: cached,
	camelize: camelize,
	capitalize: capitalize,
	hyphenate: hyphenate,
	bind: bind,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	toObject: toObject,
	noop: noop,
	no: no,
	genStaticKeys: genStaticKeys,
	isReserved: isReserved,
	def: def,
	parsePath: parsePath,
	hasProto: hasProto,
	inBrowser: inBrowser,
	devtools: devtools,
	UA: UA,
	nextTick: nextTick,
	get _Set () { return _Set; },
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	get warn () { return warn; },
	get formatComponentName () { return formatComponentName; },
	validateProp: validateProp
});

function initUse(Vue) {
  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return;
    }
    // additional parameters
    var args = toArray(arguments, 1);
    args.unshift(this);
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else {
      plugin.apply(null, args);
    }
    plugin.installed = true;
    return this;
  };
}

function initMixin$1(Vue) {
  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin);
  };
}

function initExtend(Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var isFirstExtend = Super.cid === 0;
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor;
    }
    var name = extendOptions.name || Super.options.name;
    if (false) {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn('Invalid component name: "' + name + '". Component names ' + 'can only contain alphanumeric characaters and the hyphen.');
        name = null;
      }
    }
    var Sub = function VueComponent(options) {
      this._init(options);
    };
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super;
    // allow further extension
    Sub.extend = Super.extend;
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type];
    });
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub;
    }
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub;
    }
    return Sub;
  };
}

function initAssetRegisters(Vue) {
  /**
   * Create asset registration methods.
   */
  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if (false) {
          if (type === 'component' && config.isReservedTag(id)) {
            warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + id);
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = Vue.extend(definition);
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition };
        }
        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });
}

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,
  props: {
    child: Object
  },
  created: function created() {
    this.cache = Object.create(null);
  },
  render: function render() {
    var rawChild = this.child;
    var realChild = getRealChild(this.child);
    if (realChild && realChild.componentOptions) {
      var opts = realChild.componentOptions;
      // same constructor may get registered as different local components
      // so cid alone is not enough (#3269)
      var key = opts.Ctor.cid + '::' + opts.tag;
      if (this.cache[key]) {
        var child = realChild.child = this.cache[key].child;
        realChild.elm = this.$el = child.$el;
      } else {
        this.cache[key] = realChild;
      }
      realChild.data.keepAlive = true;
    }
    return rawChild;
  },
  destroyed: function destroyed() {
    for (var key in this.cache) {
      var vnode = this.cache[key];
      callHook(vnode.child, 'deactivated');
      vnode.child.$destroy();
    }
  }
};

var builtInComponents = {
  KeepAlive: KeepAlive
};

function initGlobalAPI(Vue) {
  // config
  var configDef = {};
  configDef.get = function () {
    return config;
  };
  if (false) {
    configDef.set = function () {
      warn('Do not replace the Vue.config object, set individual fields instead.');
    };
  }
  Object.defineProperty(Vue, 'config', configDef);
  Vue.util = util;
  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick;

  Vue.options = Object.create(null);
  config._assetTypes.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  });

  extend(Vue.options.components, builtInComponents);

  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);

Object.defineProperty(Vue.prototype, '$isServer', {
  get: function get() {
    return config._isServer;
  }
});

Vue.version = '2.0.0-beta.7';

// attributes that should be using props for binding
var mustUseProp = makeMap('value,selected,checked,muted');

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

var isBooleanAttr = makeMap('allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' + 'required,reversed,scoped,seamless,selected,sortable,translate,' + 'truespeed,typemustmatch,visible');

var isAttr = makeMap('accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' + 'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' + 'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,' + 'name,contenteditable,contextmenu,controls,coords,data,datetime,default,' + 'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,' + 'form,formaction,headers,<th>,height,hidden,high,href,hreflang,http-equiv,' + 'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' + 'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' + 'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' + 'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' + 'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' + 'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' + 'target,title,type,usemap,value,width,wrap');

var xlinkNS = 'http://www.w3.org/1999/xlink';

var isXlink = function isXlink(name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink';
};

var getXlinkProp = function getXlinkProp(name) {
  return isXlink(name) ? name.slice(6, name.length) : '';
};

var isFalsyAttrValue = function isFalsyAttrValue(val) {
  return val == null || val === false;
};

function genClassForVnode(vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;
  while (childNode.child) {
    childNode = childNode.child._vnode;
    if (childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }
  while (parentNode = parentNode.parent) {
    if (parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }
  return genClassFromData(data);
}

function mergeClassData(child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class ? [child.class, parent.class] : parent.class
  };
}

function genClassFromData(data) {
  var dynamicClass = data.class;
  var staticClass = data.staticClass;
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass));
  }
  /* istanbul ignore next */
  return '';
}

function concat(a, b) {
  return a ? b ? a + ' ' + b : a : b || '';
}

function stringifyClass(value) {
  var res = '';
  if (!value) {
    return res;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    var stringified = void 0;
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        if (stringified = stringifyClass(value[i])) {
          res += stringified + ' ';
        }
      }
    }
    return res.slice(0, -1);
  }
  if (isObject(value)) {
    for (var key in value) {
      if (value[key]) res += key + ' ';
    }
    return res.slice(0, -1);
  }
  /* istanbul ignore next */
  return res;
}

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
};

var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title,' + 'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template');

var isUnaryTag = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr', true);

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source', true);

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' + 'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' + 'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' + 'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' + 'title,tr,track', true);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font,' + 'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' + 'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true);

var isReservedTag = function isReservedTag(tag) {
  return isHTMLTag(tag) || isSVG(tag);
};

function getTagNamespace(tag) {
  if (isSVG(tag)) {
    return 'svg';
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math';
  }
}

var unknownElementCache = Object.create(null);
function isUnknownElement(tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true;
  }
  if (isReservedTag(tag)) {
    return false;
  }
  tag = tag.toLowerCase();
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag];
  }
  var el = document.createElement(tag);
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return unknownElementCache[tag] = el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement;
  } else {
    return unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString());
  }
}

var UA$1 = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA$1 && /msie|trident/.test(UA$1);
var isIE9 = UA$1 && UA$1.indexOf('msie 9.0') > 0;
var isAndroid = UA$1 && UA$1.indexOf('android') > 0;

// some browsers, e.g. PhantomJS, encodes angular brackets
// inside attribute values when retrieving innerHTML.
// this causes problems with the in-browser parser.
var shouldDecodeTags = inBrowser ? function () {
  var div = document.createElement('div');
  div.innerHTML = '<div a=">">';
  return div.innerHTML.indexOf('&gt;') > 0;
}() : false;

/**
 * Query an element selector if it's not an element already.
 */
function query(el) {
  if (typeof el === 'string') {
    var selector = el;
    el = document.querySelector(el);
    if (!el) {
      "production" !== 'production' && warn('Cannot find element: ' + selector);
      return document.createElement('div');
    }
  }
  return el;
}

function createElement$1(tagName) {
  return document.createElement(tagName);
}

function createElementNS(namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName);
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function createComment(text) {
  return document.createComment(text);
}

function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node, child) {
  node.removeChild(child);
}

function appendChild(node, child) {
  node.appendChild(child);
}

function parentNode(node) {
  return node.parentNode;
}

function nextSibling(node) {
  return node.nextSibling;
}

function tagName(node) {
  return node.tagName;
}

function setTextContent(node, text) {
  node.textContent = text;
}

function childNodes(node) {
  return node.childNodes;
}

function setAttribute(node, key, val) {
  node.setAttribute(key, val);
}

var nodeOps = Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  childNodes: childNodes,
  setAttribute: setAttribute
});

var emptyData = {};
var emptyNode = new VNode('', emptyData, []);
var hooks$1 = ['create', 'update', 'postpatch', 'remove', 'destroy'];

function isUndef(s) {
  return s == null;
}

function isDef(s) {
  return s != null;
}

function sameVnode(vnode1, vnode2) {
  if (vnode1.isStatic || vnode2.isStatic) {
    return vnode1 === vnode2;
  }
  return vnode1.key === vnode2.key && vnode1.tag === vnode2.tag && vnode1.isComment === vnode2.isComment && !vnode1.data === !vnode2.data;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i = void 0,
      key = void 0;
  var map = {};
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}

function createPatchFunction(backend) {
  var i = void 0,
      j = void 0;
  var cbs = {};

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;


  for (i = 0; i < hooks$1.length; ++i) {
    cbs[hooks$1[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks$1[i]] !== undefined) cbs[hooks$1[i]].push(modules[j][hooks$1[i]]);
    }
  }

  function emptyNodeAt(elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    function remove() {
      if (--remove.listeners === 0) {
        removeElement(childElm);
      }
    }
    remove.listeners = listeners;
    return remove;
  }

  function removeElement(el) {
    var parent = nodeOps.parentNode(el);
    nodeOps.removeChild(parent, el);
  }

  function createElm(vnode, insertedVnodeQueue, nested) {
    var i = void 0,
        elm = void 0;
    var data = vnode.data;
    vnode.isRootInsert = !nested;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode);
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(i = vnode.child)) {
        initComponent(vnode, insertedVnodeQueue);
        return vnode.elm;
      }
    }
    var children = vnode.children;
    var tag = vnode.tag;
    if (isDef(tag)) {
      if (false) {
        if (!vnode.ns && !(config.ignoredElements && config.ignoredElements.indexOf(tag) > -1) && config.isUnknownElement(tag)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.', vnode.context);
        }
      }
      elm = vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag);
      setScope(vnode);
      if (Array.isArray(children)) {
        for (i = 0; i < children.length; ++i) {
          nodeOps.appendChild(elm, createElm(children[i], insertedVnodeQueue, true));
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(elm, nodeOps.createTextNode(vnode.text));
      }
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
      }
    } else if (vnode.isComment) {
      elm = vnode.elm = nodeOps.createComment(vnode.text);
    } else {
      elm = vnode.elm = nodeOps.createTextNode(vnode.text);
    }
    return vnode.elm;
  }

  function invokeCreateHooks(vnode, insertedVnodeQueue) {
    for (var _i = 0; _i < cbs.create.length; ++_i) {
      cbs.create[_i](emptyNode, vnode);
    }
    i = vnode.data.hook; // Reuse variable
    if (isDef(i)) {
      if (i.create) i.create(emptyNode, vnode);
      if (i.insert) insertedVnodeQueue.push(vnode);
    }
  }

  function initComponent(vnode, insertedVnodeQueue) {
    if (vnode.data.pendingInsert) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
    }
    vnode.elm = vnode.child.$el;
    invokeCreateHooks(vnode, insertedVnodeQueue);
    setScope(vnode);
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope(vnode) {
    var i = void 0;
    if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '');
    }
    if (isDef(i = activeInstance) && i !== vnode.context && isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '');
    }
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      nodeOps.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
    }
  }

  function invokeDestroyHook(vnode) {
    var i = void 0,
        j = void 0;
    var data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) {
        cbs.destroy[i](vnode);
      }
    }
    if (isDef(i = vnode.child) && !data.keepAlive) {
      invokeDestroyHook(i._vnode);
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          invokeDestroyHook(ch);
          removeAndInvokeRemoveHook(ch);
        } else {
          // Text node
          nodeOps.removeChild(parentElm, ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook(vnode, rm) {
    if (rm || isDef(vnode.data)) {
      var listeners = cbs.remove.length + 1;
      if (!rm) {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      } else {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.child) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeElement(vnode.elm);
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx = void 0,
        idxInOld = void 0,
        elmToMove = void 0,
        before = void 0;

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : newStartVnode.isStatic ? oldCh.indexOf(newStartVnode) : null;
        if (isUndef(idxInOld) || idxInOld === -1) {
          // New element
          nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          /* istanbul ignore if */
          if (false) {
            warn('It seems there are duplicate keys that is causing an update error. ' + 'Make sure each v-for item has a unique key.');
          }
          if (elmToMove.tag !== newStartVnode.tag) {
            // same key but different element. treat as new element
            nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          } else {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm);
            newStartVnode = newCh[++newStartIdx];
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) return;
    var i = void 0,
        hook = void 0;
    var hasData = isDef(i = vnode.data);
    if (hasData && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    var elm = vnode.elm = oldVnode.elm;
    var oldCh = oldVnode.children;
    var ch = vnode.children;
    if (hasData) {
      for (i = 0; i < cbs.update.length; ++i) {
        cbs.update[i](oldVnode, vnode);
      }if (isDef(hook) && isDef(i = hook.update)) i(oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '');
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }
    if (hasData) {
      for (i = 0; i < cbs.postpatch.length; ++i) {
        cbs.postpatch[i](oldVnode, vnode);
      }if (isDef(hook) && isDef(i = hook.postpatch)) i(oldVnode, vnode);
    }
  }

  function invokeInsertHook(vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (initial && vnode.parent) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var _i2 = 0; _i2 < queue.length; ++_i2) {
        queue[_i2].data.hook.insert(queue[_i2]);
      }
    }
  }

  var bailed = false;
  function hydrate(elm, vnode, insertedVnodeQueue) {
    if (false) {
      if (!assertNodeMatch(elm, vnode)) {
        return false;
      }
    }
    vnode.elm = elm;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;

    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) i(vnode, true /* hydrating */);
      if (isDef(i = vnode.child)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true;
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        var childNodes = nodeOps.childNodes(elm);
        var childrenMatch = true;
        if (childNodes.length !== children.length) {
          childrenMatch = false;
        } else {
          for (var _i3 = 0; _i3 < children.length; _i3++) {
            if (!hydrate(childNodes[_i3], children[_i3], insertedVnodeQueue)) {
              childrenMatch = false;
              break;
            }
          }
        }
        if (!childrenMatch) {
          if (false) {
            bailed = true;
            console.warn('Parent: ', elm);
            console.warn('Mismatching childNodes vs. VNodes: ', childNodes, children);
          }
          return false;
        }
      }
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
      }
    }
    return true;
  }

  function assertNodeMatch(node, vnode) {
    if (vnode.tag) {
      return vnode.tag.indexOf('vue-component') === 0 || vnode.tag === nodeOps.tagName(node).toLowerCase();
    } else {
      return _toString(vnode.text) === node.data;
    }
  }

  return function patch(oldVnode, vnode, hydrating, removeOnly) {
    var elm = void 0,
        parent = void 0;
    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (!oldVnode) {
      // empty mount, create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute('server-rendered')) {
            oldVnode.removeAttribute('server-rendered');
            hydrating = true;
          }
          if (hydrating) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode;
            } else if (false) {
              warn('The client-side rendered virtual DOM tree is not matching ' + 'server-rendered content. This is likely caused by incorrect ' + 'HTML markup, for example nesting block-level elements inside ' + '<p>, or missing <tbody>. Bailing hydration and performing ' + 'full client-side render.');
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode);
        }
        elm = oldVnode.elm;
        parent = nodeOps.parentNode(elm);

        createElm(vnode, insertedVnodeQueue);

        // component root element replaced.
        // update parent placeholder node element.
        if (vnode.parent) {
          vnode.parent.elm = vnode.elm;
          for (var _i4 = 0; _i4 < cbs.create.length; ++_i4) {
            cbs.create[_i4](emptyNode, vnode.parent);
          }
        }

        if (parent !== null) {
          nodeOps.insertBefore(parent, vnode.elm, nodeOps.nextSibling(elm));
          removeVnodes(parent, [oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm;
  };
}

var directives = {
  create: function bindDirectives(oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'bind');
  },
  update: function updateDirectives(oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'update');
  },
  postpatch: function postupdateDirectives(oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'componentUpdated');
  },
  destroy: function unbindDirectives(vnode) {
    applyDirectives(vnode, vnode, 'unbind');
  }
};

var emptyModifiers = Object.create(null);

function applyDirectives(oldVnode, vnode, hook) {
  var dirs = vnode.data.directives;
  if (dirs) {
    var oldDirs = oldVnode.data.directives;
    var isUpdate = hook === 'update';
    for (var i = 0; i < dirs.length; i++) {
      var dir = dirs[i];
      var def = resolveAsset(vnode.context.$options, 'directives', dir.name, true);
      var fn = def && def[hook];
      if (fn) {
        if (isUpdate && oldDirs) {
          dir.oldValue = oldDirs[i].value;
        }
        if (!dir.modifiers) {
          dir.modifiers = emptyModifiers;
        }
        fn(vnode.elm, dir, vnode, oldVnode);
      }
    }
  }
}

var ref = {
  create: function create(_, vnode) {
    registerRef(vnode);
  },
  update: function update(oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy(vnode) {
    registerRef(vnode, true);
  }
};

function registerRef(vnode, isRemoval) {
  var key = vnode.data.ref;
  if (!key) return;

  var vm = vnode.context;
  var ref = vnode.child || vnode.elm;
  var refs = vm.$refs;
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (Array.isArray(refs[key])) {
        refs[key].push(ref);
      } else {
        refs[key] = [ref];
      }
    } else {
      refs[key] = ref;
    }
  }
}

var baseModules = [ref, directives];

function updateAttrs(oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {
    return;
  }
  var key = void 0,
      cur = void 0,
      old = void 0;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {};
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      setAttr(elm, key, cur);
    }
  }
  for (key in oldAttrs) {
    if (attrs[key] == null) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key);
      }
    }
  }
}

function setAttr(el, key, value) {
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, key);
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};

function updateClass(oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;
  if (!data.staticClass && !data.class && (!oldData || !oldData.staticClass && !oldData.class)) {
    return;
  }

  var cls = genClassForVnode(vnode);

  // handle transition classes
  var transitionClass = el._transitionClasses;
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass));
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var klass = {
  create: updateClass,
  update: updateClass
};

function updateDOMListeners(oldVnode, vnode) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return;
  }
  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  var add = vnode.elm._v_add || (vnode.elm._v_add = function (event, handler, capture) {
    vnode.elm.addEventListener(event, handler, capture);
  });
  var remove = vnode.elm._v_remove || (vnode.elm._v_remove = function (event, handler) {
    vnode.elm.removeEventListener(event, handler);
  });
  updateListeners(on, oldOn, add, remove);
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};

function updateDOMProps(oldVnode, vnode) {
  if (!oldVnode.data.domProps && !vnode.data.domProps) {
    return;
  }
  var key = void 0,
      cur = void 0;
  var elm = vnode.elm;
  var oldProps = oldVnode.data.domProps || {};
  var props = vnode.data.domProps || {};
  // clone observed objects, as the user probably wants to mutate it
  if (props.__ob__) {
    props = vnode.data.domProps = extend({}, props);
  }

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = undefined;
    }
  }
  for (key in props) {
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if ((key === 'textContent' || key === 'innerHTML') && vnode.children) {
      vnode.children.length = 0;
    }
    cur = props[key];
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur;
      // avoid resetting cursor position when value is the same
      var strCur = cur == null ? '' : String(cur);
      if (elm.value !== strCur) {
        elm.value = strCur;
      }
    } else {
      elm[key] = cur;
    }
  }
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
};

var prefixes = ['Webkit', 'Moz', 'ms'];

var testEl = void 0;
var normalize = cached(function (prop) {
  testEl = testEl || document.createElement('div');
  prop = camelize(prop);
  if (prop !== 'filter' && prop in testEl.style) {
    return prop;
  }
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1);
  for (var i = 0; i < prefixes.length; i++) {
    var prefixed = prefixes[i] + upper;
    if (prefixed in testEl.style) {
      return prefixed;
    }
  }
});

function updateStyle(oldVnode, vnode) {
  if ((!oldVnode.data || !oldVnode.data.style) && !vnode.data.style) {
    return;
  }
  var cur = void 0,
      name = void 0;
  var el = vnode.elm;
  var oldStyle = oldVnode.data.style || {};
  var style = vnode.data.style || {};

  // handle string
  if (typeof style === 'string') {
    el.style.cssText = style;
    return;
  }

  var needClone = style.__ob__;

  // handle array syntax
  if (Array.isArray(style)) {
    style = vnode.data.style = toObject(style);
  }

  // clone the style for future updates,
  // in case the user mutates the style object in-place.
  if (needClone) {
    style = vnode.data.style = extend({}, style);
  }

  for (name in oldStyle) {
    if (!style[name]) {
      el.style[normalize(name)] = '';
    }
  }
  for (name in style) {
    cur = style[name];
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      el.style[normalize(name)] = cur || '';
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
};

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass(el, cls) {
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) {
        return el.classList.add(c);
      });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' ';
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass(el, cls) {
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) {
        return el.classList.remove(c);
      });
    } else {
      el.classList.remove(cls);
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' ';
    var tar = ' ' + cls + ' ';
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }
    el.setAttribute('class', cur.trim());
  }
}

var hasTransition = inBrowser && !isIE9;
var TRANSITION = 'transition';
var ANIMATION = 'animation';

// Transition property/event sniffing
var transitionProp = 'transition';
var transitionEndEvent = 'transitionend';
var animationProp = 'animation';
var animationEndEvent = 'animationend';
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined && window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition';
    transitionEndEvent = 'webkitTransitionEnd';
  }
  if (window.onanimationend === undefined && window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation';
    animationEndEvent = 'webkitAnimationEnd';
  }
}

var raf = inBrowser && window.requestAnimationFrame || setTimeout;
function nextFrame(fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass(el, cls) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls);
  addClass(el, cls);
}

function removeTransitionClass(el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }
  removeClass(el, cls);
}

function whenTransitionEnds(el, expectedType, cb) {
  var _getTransitionInfo = getTransitionInfo(el, expectedType);

  var type = _getTransitionInfo.type;
  var timeout = _getTransitionInfo.timeout;
  var propCount = _getTransitionInfo.propCount;

  if (!type) return cb();
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
  var ended = 0;
  var end = function end() {
    el.removeEventListener(event, onEnd);
    cb();
  };
  var onEnd = function onEnd() {
    if (++ended >= propCount) {
      end();
    }
  };
  setTimeout(function () {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(event, onEnd);
}

var transformRE = /\b(transform|all)(,|$)/;

function getTransitionInfo(el, expectedType) {
  var styles = window.getComputedStyle(el);
  var transitioneDelays = styles[transitionProp + 'Delay'].split(', ');
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ');
  var transitionTimeout = getTimeout(transitioneDelays, transitionDurations);
  var animationDelays = styles[animationProp + 'Delay'].split(', ');
  var animationDurations = styles[animationProp + 'Duration'].split(', ');
  var animationTimeout = getTimeout(animationDelays, animationDurations);

  var type = void 0;
  var timeout = 0;
  var propCount = 0;
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  var hasTransform = type === TRANSITION && transformRE.test(styles[transitionProp + 'Property']);
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  };
}

function getTimeout(delays, durations) {
  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i]);
  }));
}

function toMs(s) {
  return Number(s.slice(0, -1)) * 1000;
}

function enter(vnode) {
  var el = vnode.elm;

  // call leave callback now
  if (el._leaveCb) {
    el._leaveCb.cancelled = true;
    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (!data) {
    return;
  }

  /* istanbul ignore if */
  if (el._enterCb) {
    return;
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.

  var transitionNode = activeInstance.$vnode;
  var context = transitionNode && transitionNode.parent ? transitionNode.parent.context : activeInstance;

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return;
  }

  var startClass = isAppear ? appearClass : enterClass;
  var activeClass = isAppear ? appearActiveClass : enterActiveClass;
  var beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
  var enterHook = isAppear ? typeof appear === 'function' ? appear : enter : enter;
  var afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
  var enterCancelledHook = isAppear ? appearCancelled || enterCancelled : enterCancelled;

  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = enterHook &&
  // enterHook may be a bound method which exposes
  // the length of original fn as _length
  (enterHook._length || enterHook.length) > 1;

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, activeClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }
      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }
    el._enterCb = null;
  });

  // remove pending leave element on enter by injecting an insert hook
  mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
    var parent = el.parentNode;
    var pendingNode = parent._pending && parent._pending[vnode.key];
    if (pendingNode && pendingNode.tag === vnode.tag && pendingNode.elm._leaveCb) {
      pendingNode.elm._leaveCb();
    }
    enterHook && enterHook(el, cb);
  });

  // start enter transition
  beforeEnterHook && beforeEnterHook(el);
  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);
      if (!cb.cancelled && !userWantsControl) {
        whenTransitionEnds(el, type, cb);
      }
    });
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave(vnode, rm) {
  var el = vnode.elm;

  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true;
    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);
  if (!data) {
    return rm();
  }

  /* istanbul ignore if */
  if (el._leaveCb) {
    return;
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;


  var expectsCSS = css !== false && !isIE9;
  var userWantsControl = leave &&
  // leave hook may be a bound method which exposes
  // the length of original fn as _length
  (leave._length || leave.length) > 1;

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveActiveClass);
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }
      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }
    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave() {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return;
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
    }
    beforeLeave && beforeLeave(el);
    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);
        if (!cb.cancelled && !userWantsControl) {
          whenTransitionEnds(el, type, cb);
        }
      });
    }
    leave && leave(el, cb);
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
}

function resolveTransition(def) {
  if (!def) {
    return;
  }
  /* istanbul ignore else */
  if (typeof def === 'object') {
    var res = {};
    if (def.css !== false) {
      extend(res, autoCssTransition(def.name || 'v'));
    }
    extend(res, def);
    return res;
  } else if (typeof def === 'string') {
    return autoCssTransition(def);
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: name + '-enter',
    leaveClass: name + '-leave',
    appearClass: name + '-enter',
    enterActiveClass: name + '-enter-active',
    leaveActiveClass: name + '-leave-active',
    appearActiveClass: name + '-enter-active'
  };
});

function once(fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn();
    }
  };
}

var transition = inBrowser ? {
  create: function create(_, vnode) {
    if (!vnode.data.show) {
      enter(vnode);
    }
  },
  remove: function remove(vnode, rm) {
    /* istanbul ignore else */
    if (!vnode.data.show) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
} : {};

var platformModules = [attrs, klass, events, domProps, style, transition];

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules);

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

var modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_\-]*)?$/;

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement;
    if (el && el.vmodel) {
      trigger(el, 'input');
    }
  });
}

var model = {
  bind: function bind(el, binding, vnode) {
    if (false) {
      if (!modelableTagRE.test(vnode.tag)) {
        warn('v-model is not supported on element type: <' + vnode.tag + '>. ' + 'If you are working with contenteditable, it\'s recommended to ' + 'wrap a library dedicated for that purpose inside a custom component.', vnode.context);
      }
    }
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
    } else {
      if (!isAndroid) {
        el.addEventListener('compositionstart', onCompositionStart);
        el.addEventListener('compositionend', onCompositionEnd);
      }
      /* istanbul ignore if */
      if (isIE9) {
        el.vmodel = true;
      }
    }
  },
  componentUpdated: function componentUpdated(el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context);
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matchig
      // option in the DOM.
      var needReset = el.multiple ? binding.value.some(function (v) {
        return hasNoMatchingOption(v, el.options);
      }) : hasNoMatchingOption(binding.value, el.options);
      if (needReset) {
        trigger(el, 'change');
      }
    }
  }
};

function setSelected(el, binding, vm) {
  var value = binding.value;
  var isMultiple = el.multiple;
  if (!isMultiple) {
    el.selectedIndex = -1;
  } else if (!Array.isArray(value)) {
    "production" !== 'production' && warn('<select multiple v-model="' + binding.expression + '"> ' + ('expects an Array value for its binding, but got ' + Object.prototype.toString.call(value).slice(8, -1)), vm);
    return;
  }
  for (var i = 0, l = el.options.length; i < l; i++) {
    var option = el.options[i];
    if (isMultiple) {
      option.selected = value.indexOf(getValue(option)) > -1;
    } else {
      if (getValue(option) === value) {
        el.selectedIndex = i;
        break;
      }
    }
  }
}

function hasNoMatchingOption(value, options) {
  for (var i = 0, l = options.length; i < l; i++) {
    if (getValue(options[i]) === value) {
      return false;
    }
  }
  return true;
}

function getValue(option) {
  return '_value' in option ? option._value : option.value || option.text;
}

function onCompositionStart(e) {
  e.target.composing = true;
}

function onCompositionEnd(e) {
  e.target.composing = false;
  trigger(e.target, 'input');
}

function trigger(el, type) {
  var e = document.createEvent('HTMLEvents');
  e.initEvent(type, true, true);
  el.dispatchEvent(e);
}

// recursively search for possible transition defined inside the component root
function locateNode(vnode) {
  return vnode.child && (!vnode.data || !vnode.data.transition) ? locateNode(vnode.child._vnode) : vnode;
}

var show = {
  bind: function bind(el, _ref, vnode) {
    var value = _ref.value;

    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    if (value && transition && transition.appear && !isIE9) {
      enter(vnode);
    }
    el.style.display = value ? '' : 'none';
  },
  update: function update(el, _ref2, vnode) {
    var value = _ref2.value;

    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    if (transition && !isIE9) {
      if (value) {
        enter(vnode);
        el.style.display = '';
      } else {
        leave(vnode, function () {
          el.style.display = 'none';
        });
      }
    } else {
      el.style.display = value ? '' : 'none';
    }
  }
};

var platformDirectives = {
  model: model,
  show: show
};

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String
};

function extractTransitionData(comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var _key in listeners) {
    data[camelize(_key)] = listeners[_key].fn;
  }
  return data;
}

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render: function render(h) {
    var _this = this;

    var children = this.$slots.default;
    if (!children) {
      return;
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) {
      return c.tag;
    });
    /* istanbul ignore if */
    if (!children.length) {
      return;
    }

    // warn multiple elements
    if (false) {
      warn('<transition> can only be used on a single element. Use ' + '<transition-group> for lists.', this.$parent);
    }

    var mode = this.mode;

    // warn invalid mode
    if (false) {
      warn('invalid <transition> mode: ' + mode, this.$parent);
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (this.$vnode.parent && this.$vnode.parent.data.transition) {
      return rawChild;
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);
    /* istanbul ignore if */
    if (!child) return;
    child.key = child.key || '__v' + (child.tag + this._uid) + '__';
    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);

    if (oldChild && oldChild.data && oldChild.key !== child.key) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data);

      // handle transition mode
      if (mode === 'out-in') {
        // return empty node and queue update when leave finishes
        mergeVNodeHook(oldData, 'afterLeave', function () {
          _this.$forceUpdate();
        });
        return (/\d-keep-alive$/.test(rawChild.tag) ? h('keep-alive') : null
        );
      } else if (mode === 'in-out') {
        (function () {
          var delayedLeave = void 0;
          var performLeave = function performLeave() {
            delayedLeave();
          };
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);
          mergeVNodeHook(oldData, 'delayLeave', function (leave) {
            delayedLeave = leave;
          });
        })();
      }
    }

    return rawChild;
  }
};

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps);

delete props.mode;

var TransitionGroup = {
  props: props,

  render: function render(h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var map = Object.create(null);
    var prevChildren = this.prevChildren = this.children;
    var rawChildren = this.$slots.default || [];
    var children = this.children = [];
    var transitionData = extractTransitionData(this);

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i];
      if (c.tag) {
        if (c.key != null) {
          children.push(c);
          map[c.key] = c;(c.data || (c.data = {})).transition = transitionData;
        } else if (false) {
          var opts = c.componentOptions;
          var name = opts ? opts.Ctor.options.name || opts.tag : c.tag;
          warn('<transition-group> children must be keyed: <' + name + '>');
        }
      }
    }

    if (prevChildren) {
      var kept = [];
      var removed = [];
      for (var _i = 0; _i < prevChildren.length; _i++) {
        var _c = prevChildren[_i];
        _c.data.transition = transitionData;
        _c.data.pos = _c.elm.getBoundingClientRect();
        if (map[_c.key]) {
          kept.push(_c);
        } else {
          removed.push(_c);
        }
      }
      this.kept = h(tag, null, kept);
      this.removed = removed;
    }

    return h(tag, null, children);
  },
  beforeUpdate: function beforeUpdate() {
    // force removing pass
    this.__patch__(this._vnode, this.kept, false, // hydrating
    true // removeOnly (!important, avoids unnecessary moves)
    );
    this._vnode = this.kept;
  },
  updated: function updated() {
    var children = this.prevChildren;
    var moveClass = this.moveClass || this.name + '-move';
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return;
    }

    children.forEach(function (c) {
      /* istanbul ignore if */
      if (c.elm._moveCb) {
        c.elm._moveCb();
      }
      /* istanbul ignore if */
      if (c.elm._enterCb) {
        c.elm._enterCb();
      }
      var oldPos = c.data.pos;
      var newPos = c.data.pos = c.elm.getBoundingClientRect();
      var dx = oldPos.left - newPos.left;
      var dy = oldPos.top - newPos.top;
      if (dx || dy) {
        c.data.moved = true;
        var s = c.elm.style;
        s.transform = s.WebkitTransform = 'translate(' + dx + 'px,' + dy + 'px)';
        s.transitionDuration = '0s';
      }
    });

    // force reflow to put everything in position
    var f = document.body.offsetHeight; // eslint-disable-line

    children.forEach(function (c) {
      if (c.data.moved) {
        (function () {
          var el = c.elm;
          var s = el.style;
          addTransitionClass(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el._moveDest = c.data.pos;
          el.addEventListener(transitionEndEvent, el._moveCb = function cb(e) {
            if (!e || /transform$/.test(e.propertyName)) {
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              removeTransitionClass(el, moveClass);
            }
          });
        })();
      }
    });
  },


  methods: {
    hasMove: function hasMove(el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false;
      }
      if (this._hasMove != null) {
        return this._hasMove;
      }
      addTransitionClass(el, moveClass);
      var info = getTransitionInfo(el);
      removeTransitionClass(el, moveClass);
      return this._hasMove = info.hasTransform;
    }
  }
};

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
};

// install platform specific utils
Vue.config.isUnknownElement = isUnknownElement;
Vue.config.isReservedTag = isReservedTag;
Vue.config.getTagNamespace = getTagNamespace;
Vue.config.mustUseProp = mustUseProp;

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);
extend(Vue.options.components, platformComponents);

// install platform patch function
Vue.prototype.__patch__ = config._isServer ? noop : patch;

// wrap mount
Vue.prototype.$mount = function (el, hydrating) {
  el = el && !config._isServer ? query(el) : undefined;
  return this._mount(el, hydrating);
};

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue);
    } else if (false) {
      console.log('Download the Vue Devtools for a better development experience:\n' + 'https://github.com/vuejs/vue-devtools');
    }
  }
}, 0);

module.exports = Vue;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__posts_logistic_article_md__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__posts_logistic_article_md___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__posts_logistic_article_md__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Nav_vue__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Nav_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__Nav_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__footer_vue__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__footer_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__footer_vue__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//





/* harmony default export */ exports["default"] = {
  components: {
    Markdown: __WEBPACK_IMPORTED_MODULE_0__posts_logistic_article_md___default.a,
    Navigation: __WEBPACK_IMPORTED_MODULE_1__Nav_vue___default.a,
    MyFooter: __WEBPACK_IMPORTED_MODULE_2__footer_vue___default.a
  },

  data() {
    return {
      msg: 'Hello Vue 2.0!'
    };
  }
};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function () {
    return {};
  },
  computed: {},
  ready: function () {},
  attached: function () {},
  methods: {},
  components: {}
};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ exports["default"] = {
  data: function () {
    return {};
  },
  computed: {},
  ready: function () {},
  attached: function () {},
  methods: {},
  components: {}
};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)();
// imports


// module
exports.push([module.i, "\nhtml, body, body div, span, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, abbr, address, cite, code, del, dfn, em, img, ins, kbd, q, samp, small, strong, sub, sup, var, b, i, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, figure, footer, header, menu, nav, section, time, mark, audio, video, details, summary {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font-weight: normal;\n  vertical-align: baseline;\n  background: transparent;\n}\narticle, aside, figure, footer, header, nav, section, details, summary {\n  display: block;\n}\nhtml {\n  box-sizing: border-box;\n}\n*,\n*:before,\n*:after {\n  box-sizing: inherit;\n}\nimg,\nobject,\nembed {\n  max-width: 100%;\n}\nhtml {\n  overflow-y: scroll;\n}\nul {\n  list-style: none;\n}\nblockquote, q {\n  quotes: none;\n}\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: '';\n  content: none;\n}\na {\n  margin: 0;\n  padding: 0;\n  font-size: 100%;\n  vertical-align: baseline;\n  background: transparent;\n}\ndel {\n  text-decoration: line-through;\n}\nabbr[title], dfn[title] {\n  border-bottom: 1px dotted #000;\n  cursor: help;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\nth {\n  font-weight: bold;\n  vertical-align: bottom;\n}\ntd {\n  font-weight: normal;\n  vertical-align: top;\n}\nhr {\n  display: block;\n  height: 1px;\n  border: 0;\n  border-top: 1px solid #ccc;\n  margin: 1em 0;\n  padding: 0;\n}\ninput, select {\n  vertical-align: middle;\n}\npre {\n  white-space: pre;\n  white-space: pre-wrap;\n  white-space: pre-line;\n  word-wrap: break-word;\n}\ninput[type=\"radio\"] {\n  vertical-align: text-bottom;\n}\ninput[type=\"checkbox\"] {\n  vertical-align: bottom;\n}\nselect, input, textarea {\n  font: 99% sans-serif;\n}\ntable {\n  font-size: inherit;\n  font: 100%;\n}\nsmall {\n  font-size: 85%;\n}\nstrong {\n  font-weight: bold;\n}\ntd, td img {\n  vertical-align: top;\n}\nsub, sup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n}\nsup {\n  top: -0.5em;\n}\nsub {\n  bottom: -0.25em;\n}\npre, code, kbd, samp {\n  font-family: monospace, sans-serif;\n}\nlabel,\ninput[type=button],\ninput[type=submit],\ninput[type=file],\nbutton {\n  cursor: pointer;\n}\nbutton, input, select, textarea {\n  margin: 0;\n}\nbutton,\ninput[type=button] {\n  width: auto;\n  overflow: visible;\n}\n@keyframes spin-around {\nfrom {\n    transform: rotate(0deg);\n}\nto {\n    transform: rotate(359deg);\n}\n}\nhtml {\n  background-color: #f5f7fa;\n  font-size: 14px;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  min-width: 300px;\n  overflow-x: hidden;\n  overflow-y: scroll;\n  text-rendering: optimizeLegibility;\n}\narticle,\naside,\nfigure,\nfooter,\nheader,\nhgroup,\nsection {\n  display: block;\n}\nbody,\nbutton,\ninput,\nselect,\ntextarea {\n  font-family: \"Helvetica Neue\", \"Helvetica\", \"Arial\", sans-serif;\n}\ncode,\npre {\n  -moz-osx-font-smoothing: auto;\n  -webkit-font-smoothing: auto;\n  font-family: \"Source Code Pro\", \"Monaco\", \"Inconsolata\", monospace;\n  line-height: 1.25;\n}\nbody {\n  color: #69707a;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.428571428571429;\n}\na {\n  color: #1fc8db;\n  cursor: pointer;\n  text-decoration: none;\n  transition: none 86ms ease-out;\n}\na:hover {\n    color: #222324;\n}\ncode {\n  background-color: #f5f7fa;\n  color: #ed6c63;\n  font-size: 12px;\n  font-weight: normal;\n  padding: 1px 2px 2px;\n}\nhr {\n  border-top-color: #d3d6db;\n  margin: 40px 0;\n}\nimg {\n  max-width: 100%;\n}\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  vertical-align: baseline;\n}\nsmall {\n  font-size: 11px;\n}\nspan {\n  font-style: inherit;\n  font-weight: inherit;\n}\nstrong {\n  color: #222324;\n  font-weight: 700;\n}\npre {\n  background-color: #f5f7fa;\n  color: #69707a;\n  white-space: pre;\n  word-wrap: normal;\n}\npre code {\n    background-color: #f5f7fa;\n    color: #69707a;\n    display: block;\n    overflow-x: auto;\n    padding: 16px 20px;\n}\ntable {\n  width: 100%;\n}\ntable td,\n  table th {\n    text-align: left;\n    vertical-align: top;\n}\ntable th {\n    color: #222324;\n}\n.block:not(:last-child), .box:not(:last-child), .content:not(:last-child), .notification:not(:last-child), .progress:not(:last-child), .title:not(:last-child),\n.subtitle:not(:last-child), .highlight:not(:last-child), .level:not(:last-child), .message:not(:last-child), .tabs:not(:last-child) {\n  margin-bottom: 20px;\n}\n.container {\n  position: relative;\n}\n@media screen and (min-width: 980px) {\n.container {\n      margin: 0 auto;\n      max-width: 960px;\n}\n.container.is-fluid {\n        margin: 0 20px;\n        max-width: none;\n}\n}\n@media screen and (min-width: 1180px) {\n.container {\n      max-width: 1200px;\n}\n}\n.fa {\n  font-size: 21px;\n  text-align: center;\n  vertical-align: top;\n}\n.is-block {\n  display: block;\n}\n@media screen and (max-width: 768px) {\n.is-block-mobile {\n    display: block !important;\n}\n}\n@media screen and (min-width: 769px) {\n.is-block-tablet {\n    display: block !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 979px) {\n.is-block-tablet-only {\n    display: block !important;\n}\n}\n@media screen and (max-width: 979px) {\n.is-block-touch {\n    display: block !important;\n}\n}\n@media screen and (min-width: 980px) {\n.is-block-desktop {\n    display: block !important;\n}\n}\n@media screen and (min-width: 980px) and (max-width: 1179px) {\n.is-block-desktop-only {\n    display: block !important;\n}\n}\n@media screen and (min-width: 1180px) {\n.is-block-widescreen {\n    display: block !important;\n}\n}\n.is-flex {\n  display: flex;\n}\n@media screen and (max-width: 768px) {\n.is-flex-mobile {\n    display: flex !important;\n}\n}\n@media screen and (min-width: 769px) {\n.is-flex-tablet {\n    display: flex !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 979px) {\n.is-flex-tablet-only {\n    display: flex !important;\n}\n}\n@media screen and (max-width: 979px) {\n.is-flex-touch {\n    display: flex !important;\n}\n}\n@media screen and (min-width: 980px) {\n.is-flex-desktop {\n    display: flex !important;\n}\n}\n@media screen and (min-width: 980px) and (max-width: 1179px) {\n.is-flex-desktop-only {\n    display: flex !important;\n}\n}\n@media screen and (min-width: 1180px) {\n.is-flex-widescreen {\n    display: flex !important;\n}\n}\n.is-inline {\n  display: inline;\n}\n@media screen and (max-width: 768px) {\n.is-inline-mobile {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 769px) {\n.is-inline-tablet {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 979px) {\n.is-inline-tablet-only {\n    display: inline !important;\n}\n}\n@media screen and (max-width: 979px) {\n.is-inline-touch {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 980px) {\n.is-inline-desktop {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 980px) and (max-width: 1179px) {\n.is-inline-desktop-only {\n    display: inline !important;\n}\n}\n@media screen and (min-width: 1180px) {\n.is-inline-widescreen {\n    display: inline !important;\n}\n}\n.is-inline-block {\n  display: inline-block;\n}\n@media screen and (max-width: 768px) {\n.is-inline-block-mobile {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 769px) {\n.is-inline-block-tablet {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 979px) {\n.is-inline-block-tablet-only {\n    display: inline-block !important;\n}\n}\n@media screen and (max-width: 979px) {\n.is-inline-block-touch {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 980px) {\n.is-inline-block-desktop {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 980px) and (max-width: 1179px) {\n.is-inline-block-desktop-only {\n    display: inline-block !important;\n}\n}\n@media screen and (min-width: 1180px) {\n.is-inline-block-widescreen {\n    display: inline-block !important;\n}\n}\n.is-inline-flex {\n  display: inline-flex;\n}\n@media screen and (max-width: 768px) {\n.is-inline-flex-mobile {\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 769px) {\n.is-inline-flex-tablet {\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 979px) {\n.is-inline-flex-tablet-only {\n    display: inline-flex !important;\n}\n}\n@media screen and (max-width: 979px) {\n.is-inline-flex-touch {\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 980px) {\n.is-inline-flex-desktop {\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 980px) and (max-width: 1179px) {\n.is-inline-flex-desktop-only {\n    display: inline-flex !important;\n}\n}\n@media screen and (min-width: 1180px) {\n.is-inline-flex-widescreen {\n    display: inline-flex !important;\n}\n}\n.is-clearfix:after {\n  clear: both;\n  content: \" \";\n  display: table;\n}\n.is-pulled-left {\n  float: left;\n}\n.is-pulled-right {\n  float: right;\n}\n.is-clipped {\n  overflow: hidden !important;\n}\n.is-overlay {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n.has-text-centered {\n  text-align: center;\n}\n.has-text-left {\n  text-align: left;\n}\n.has-text-right {\n  text-align: right;\n}\n.is-hidden {\n  display: none !important;\n}\n@media screen and (max-width: 768px) {\n.is-hidden-mobile {\n    display: none !important;\n}\n}\n@media screen and (min-width: 769px) {\n.is-hidden-tablet {\n    display: none !important;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 979px) {\n.is-hidden-tablet-only {\n    display: none !important;\n}\n}\n@media screen and (max-width: 979px) {\n.is-hidden-touch {\n    display: none !important;\n}\n}\n@media screen and (min-width: 980px) {\n.is-hidden-desktop {\n    display: none !important;\n}\n}\n@media screen and (min-width: 980px) and (max-width: 1179px) {\n.is-hidden-desktop-only {\n    display: none !important;\n}\n}\n@media screen and (min-width: 1180px) {\n.is-hidden-widescreen {\n    display: none !important;\n}\n}\n.is-disabled {\n  pointer-events: none;\n}\n.is-marginless {\n  margin: 0 !important;\n}\n.box {\n  background-color: #fff;\n  border-radius: 5px;\n  box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);\n  display: block;\n  padding: 20px;\n}\na.box:hover, a.box:focus {\n  box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px #1fc8db;\n}\na.box:active {\n  box-shadow: inset 0 1px 2px rgba(17, 17, 17, 0.2), 0 0 0 1px #1fc8db;\n}\n.button {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  align-items: center;\n  background-color: white;\n  border: 1px solid #d3d6db;\n  border-radius: 3px;\n  color: #222324;\n  display: inline-flex;\n  font-size: 14px;\n  height: 32px;\n  justify-content: flex-start;\n  line-height: 24px;\n  padding-left: 8px;\n  padding-right: 8px;\n  position: relative;\n  vertical-align: top;\n  justify-content: center;\n  padding-left: 10px;\n  padding-right: 10px;\n  text-align: center;\n  white-space: nowrap;\n}\n.button:hover {\n    border-color: #aeb1b5;\n}\n.button:active, .button:focus, .button.is-active {\n    border-color: #1fc8db;\n    outline: none;\n}\n.button[disabled], .button.is-disabled {\n    background-color: #f5f7fa;\n    border-color: #d3d6db;\n    cursor: not-allowed;\n    pointer-events: none;\n}\n.button[disabled]::-moz-placeholder, .button.is-disabled::-moz-placeholder {\n      color: rgba(34, 35, 36, 0.3);\n}\n.button[disabled]::-webkit-input-placeholder, .button.is-disabled::-webkit-input-placeholder {\n      color: rgba(34, 35, 36, 0.3);\n}\n.button[disabled]:-moz-placeholder, .button.is-disabled:-moz-placeholder {\n      color: rgba(34, 35, 36, 0.3);\n}\n.button[disabled]:-ms-input-placeholder, .button.is-disabled:-ms-input-placeholder {\n      color: rgba(34, 35, 36, 0.3);\n}\n.button strong {\n    color: inherit;\n}\n.button small {\n    display: block;\n    font-size: 11px;\n    line-height: 1;\n    margin-top: 5px;\n}\n.button .icon:first-child,\n  .button .tag:first-child {\n    margin-left: -2px;\n    margin-right: 4px;\n}\n.button .icon:last-child,\n  .button .tag:last-child {\n    margin-left: 4px;\n    margin-right: -2px;\n}\n.button:hover, .button:focus, .button.is-active {\n    color: #222324;\n}\n.button:active {\n    box-shadow: inset 0 1px 2px rgba(17, 17, 17, 0.2);\n}\n.button.is-white {\n    background-color: #fff;\n    border-color: transparent;\n    color: #111;\n}\n.button.is-white:hover, .button.is-white:focus, .button.is-white.is-active {\n      background-color: #e6e6e6;\n      border-color: transparent;\n      color: #111;\n}\n.button.is-white:active {\n      border-color: transparent;\n}\n.button.is-white.is-inverted {\n      background-color: #111;\n      color: #fff;\n}\n.button.is-white.is-inverted:hover {\n        background-color: #040404;\n}\n.button.is-white.is-loading:after {\n      border-color: transparent transparent #111 #111 !important;\n}\n.button.is-white.is-outlined {\n      background-color: transparent;\n      border-color: #fff;\n      color: #fff;\n}\n.button.is-white.is-outlined:hover, .button.is-white.is-outlined:focus {\n        background-color: #fff;\n        border-color: #fff;\n        color: #111;\n}\n.button.is-black {\n    background-color: #111;\n    border-color: transparent;\n    color: #fff;\n}\n.button.is-black:hover, .button.is-black:focus, .button.is-black.is-active {\n      background-color: black;\n      border-color: transparent;\n      color: #fff;\n}\n.button.is-black:active {\n      border-color: transparent;\n}\n.button.is-black.is-inverted {\n      background-color: #fff;\n      color: #111;\n}\n.button.is-black.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-black.is-loading:after {\n      border-color: transparent transparent #fff #fff !important;\n}\n.button.is-black.is-outlined {\n      background-color: transparent;\n      border-color: #111;\n      color: #111;\n}\n.button.is-black.is-outlined:hover, .button.is-black.is-outlined:focus {\n        background-color: #111;\n        border-color: #111;\n        color: #fff;\n}\n.button.is-light {\n    background-color: #f5f7fa;\n    border-color: transparent;\n    color: #69707a;\n}\n.button.is-light:hover, .button.is-light:focus, .button.is-light.is-active {\n      background-color: #d3dce9;\n      border-color: transparent;\n      color: #69707a;\n}\n.button.is-light:active {\n      border-color: transparent;\n}\n.button.is-light.is-inverted {\n      background-color: #69707a;\n      color: #f5f7fa;\n}\n.button.is-light.is-inverted:hover {\n        background-color: #5d636c;\n}\n.button.is-light.is-loading:after {\n      border-color: transparent transparent #69707a #69707a !important;\n}\n.button.is-light.is-outlined {\n      background-color: transparent;\n      border-color: #f5f7fa;\n      color: #f5f7fa;\n}\n.button.is-light.is-outlined:hover, .button.is-light.is-outlined:focus {\n        background-color: #f5f7fa;\n        border-color: #f5f7fa;\n        color: #69707a;\n}\n.button.is-dark {\n    background-color: #69707a;\n    border-color: transparent;\n    color: #f5f7fa;\n}\n.button.is-dark:hover, .button.is-dark:focus, .button.is-dark.is-active {\n      background-color: #51575f;\n      border-color: transparent;\n      color: #f5f7fa;\n}\n.button.is-dark:active {\n      border-color: transparent;\n}\n.button.is-dark.is-inverted {\n      background-color: #f5f7fa;\n      color: #69707a;\n}\n.button.is-dark.is-inverted:hover {\n        background-color: #e4e9f2;\n}\n.button.is-dark.is-loading:after {\n      border-color: transparent transparent #f5f7fa #f5f7fa !important;\n}\n.button.is-dark.is-outlined {\n      background-color: transparent;\n      border-color: #69707a;\n      color: #69707a;\n}\n.button.is-dark.is-outlined:hover, .button.is-dark.is-outlined:focus {\n        background-color: #69707a;\n        border-color: #69707a;\n        color: #f5f7fa;\n}\n.button.is-primary {\n    background-color: #1fc8db;\n    border-color: transparent;\n    color: white;\n}\n.button.is-primary:hover, .button.is-primary:focus, .button.is-primary.is-active {\n      background-color: #199fae;\n      border-color: transparent;\n      color: white;\n}\n.button.is-primary:active {\n      border-color: transparent;\n}\n.button.is-primary.is-inverted {\n      background-color: white;\n      color: #1fc8db;\n}\n.button.is-primary.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-primary.is-loading:after {\n      border-color: transparent transparent white white !important;\n}\n.button.is-primary.is-outlined {\n      background-color: transparent;\n      border-color: #1fc8db;\n      color: #1fc8db;\n}\n.button.is-primary.is-outlined:hover, .button.is-primary.is-outlined:focus {\n        background-color: #1fc8db;\n        border-color: #1fc8db;\n        color: white;\n}\n.button.is-info {\n    background-color: #42afe3;\n    border-color: transparent;\n    color: white;\n}\n.button.is-info:hover, .button.is-info:focus, .button.is-info.is-active {\n      background-color: #1f99d3;\n      border-color: transparent;\n      color: white;\n}\n.button.is-info:active {\n      border-color: transparent;\n}\n.button.is-info.is-inverted {\n      background-color: white;\n      color: #42afe3;\n}\n.button.is-info.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-info.is-loading:after {\n      border-color: transparent transparent white white !important;\n}\n.button.is-info.is-outlined {\n      background-color: transparent;\n      border-color: #42afe3;\n      color: #42afe3;\n}\n.button.is-info.is-outlined:hover, .button.is-info.is-outlined:focus {\n        background-color: #42afe3;\n        border-color: #42afe3;\n        color: white;\n}\n.button.is-success {\n    background-color: #97cd76;\n    border-color: transparent;\n    color: white;\n}\n.button.is-success:hover, .button.is-success:focus, .button.is-success.is-active {\n      background-color: #7bbf51;\n      border-color: transparent;\n      color: white;\n}\n.button.is-success:active {\n      border-color: transparent;\n}\n.button.is-success.is-inverted {\n      background-color: white;\n      color: #97cd76;\n}\n.button.is-success.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-success.is-loading:after {\n      border-color: transparent transparent white white !important;\n}\n.button.is-success.is-outlined {\n      background-color: transparent;\n      border-color: #97cd76;\n      color: #97cd76;\n}\n.button.is-success.is-outlined:hover, .button.is-success.is-outlined:focus {\n        background-color: #97cd76;\n        border-color: #97cd76;\n        color: white;\n}\n.button.is-warning {\n    background-color: #fce473;\n    border-color: transparent;\n    color: rgba(17, 17, 17, 0.5);\n}\n.button.is-warning:hover, .button.is-warning:focus, .button.is-warning.is-active {\n      background-color: #fbda41;\n      border-color: transparent;\n      color: rgba(17, 17, 17, 0.5);\n}\n.button.is-warning:active {\n      border-color: transparent;\n}\n.button.is-warning.is-inverted {\n      background-color: rgba(17, 17, 17, 0.5);\n      color: #fce473;\n}\n.button.is-warning.is-inverted:hover {\n        background-color: rgba(4, 4, 4, 0.5);\n}\n.button.is-warning.is-loading:after {\n      border-color: transparent transparent rgba(17, 17, 17, 0.5) rgba(17, 17, 17, 0.5) !important;\n}\n.button.is-warning.is-outlined {\n      background-color: transparent;\n      border-color: #fce473;\n      color: #fce473;\n}\n.button.is-warning.is-outlined:hover, .button.is-warning.is-outlined:focus {\n        background-color: #fce473;\n        border-color: #fce473;\n        color: rgba(17, 17, 17, 0.5);\n}\n.button.is-danger {\n    background-color: #ed6c63;\n    border-color: transparent;\n    color: white;\n}\n.button.is-danger:hover, .button.is-danger:focus, .button.is-danger.is-active {\n      background-color: #e84135;\n      border-color: transparent;\n      color: white;\n}\n.button.is-danger:active {\n      border-color: transparent;\n}\n.button.is-danger.is-inverted {\n      background-color: white;\n      color: #ed6c63;\n}\n.button.is-danger.is-inverted:hover {\n        background-color: #f2f2f2;\n}\n.button.is-danger.is-loading:after {\n      border-color: transparent transparent white white !important;\n}\n.button.is-danger.is-outlined {\n      background-color: transparent;\n      border-color: #ed6c63;\n      color: #ed6c63;\n}\n.button.is-danger.is-outlined:hover, .button.is-danger.is-outlined:focus {\n        background-color: #ed6c63;\n        border-color: #ed6c63;\n        color: white;\n}\n.button.is-link {\n    background-color: transparent;\n    border-color: transparent;\n    color: #69707a;\n    text-decoration: underline;\n}\n.button.is-link:hover, .button.is-link:focus {\n      background-color: #d3d6db;\n      color: #222324;\n}\n.button.is-small {\n    border-radius: 2px;\n    font-size: 11px;\n    height: 24px;\n    line-height: 16px;\n    padding-left: 6px;\n    padding-right: 6px;\n}\n.button.is-medium {\n    font-size: 18px;\n    height: 40px;\n    padding-left: 14px;\n    padding-right: 14px;\n}\n.button.is-large {\n    font-size: 22px;\n    height: 48px;\n    padding-left: 20px;\n    padding-right: 20px;\n}\n.button[disabled], .button.is-disabled {\n    opacity: 0.5;\n}\n.button.is-fullwidth {\n    display: flex;\n    width: 100%;\n}\n.button.is-loading {\n    color: transparent !important;\n    pointer-events: none;\n}\n.button.is-loading:after {\n      left: 50%;\n      margin-left: -8px;\n      margin-top: -8px;\n      position: absolute;\n      top: 50%;\n      position: absolute !important;\n}\n.content a:not(.button) {\n  border-bottom: 1px solid #d3d6db;\n}\n.content a:not(.button):visited {\n    color: #847bb9;\n}\n.content a:not(.button):hover {\n    border-bottom-color: #1fc8db;\n}\n.content li + li {\n  margin-top: 0.25em;\n}\n.content blockquote:not(:last-child),\n.content p:not(:last-child),\n.content ol:not(:last-child),\n.content ul:not(:last-child) {\n  margin-bottom: 1em;\n}\n.content h1,\n.content h2,\n.content h3,\n.content h4,\n.content h5,\n.content h6 {\n  color: #222324;\n  font-weight: 300;\n  line-height: 1.125;\n  margin-bottom: 20px;\n}\n.content h1:not(:first-child),\n.content h2:not(:first-child),\n.content h3:not(:first-child) {\n  margin-top: 40px;\n}\n.content blockquote {\n  background-color: #f5f7fa;\n  border-left: 5px solid #d3d6db;\n  padding: 1.5em;\n}\n.content h1 {\n  font-size: 2em;\n}\n.content h2 {\n  font-size: 1.75em;\n}\n.content h3 {\n  font-size: 1.5em;\n}\n.content h4 {\n  font-size: 1.25em;\n}\n.content h5 {\n  font-size: 1.125em;\n}\n.content h6 {\n  font-size: 1em;\n}\n.content ol {\n  list-style: decimal outside;\n  margin-left: 2em;\n  margin-right: 2em;\n  margin-top: 1em;\n}\n.content ul {\n  list-style: disc outside;\n  margin-left: 2em;\n  margin-right: 2em;\n  margin-top: 1em;\n}\n.content ul ul {\n    list-style-type: circle;\n    margin-top: 0.5em;\n}\n.content ul ul ul {\n      list-style-type: square;\n}\n.content.is-medium {\n  font-size: 18px;\n}\n.content.is-medium code {\n    font-size: 14px;\n}\n.content.is-large {\n  font-size: 24px;\n}\n.content.is-large code {\n    font-size: 18px;\n}\n.input, .textarea {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  align-items: center;\n  background-color: white;\n  border: 1px solid #d3d6db;\n  border-radius: 3px;\n  color: #222324;\n  display: inline-flex;\n  font-size: 14px;\n  height: 32px;\n  justify-content: flex-start;\n  line-height: 24px;\n  padding-left: 8px;\n  padding-right: 8px;\n  position: relative;\n  vertical-align: top;\n  box-shadow: inset 0 1px 2px rgba(17, 17, 17, 0.1);\n  max-width: 100%;\n  width: 100%;\n}\n.input:hover, .textarea:hover {\n    border-color: #aeb1b5;\n}\n.input:active, .textarea:active, .input:focus, .textarea:focus, .input.is-active, .is-active.textarea {\n    border-color: #1fc8db;\n    outline: none;\n}\n.input[disabled], [disabled].textarea, .input.is-disabled, .is-disabled.textarea {\n    background-color: #f5f7fa;\n    border-color: #d3d6db;\n    cursor: not-allowed;\n    pointer-events: none;\n}\n.input[disabled]::-moz-placeholder, [disabled].textarea::-moz-placeholder, .input.is-disabled::-moz-placeholder, .is-disabled.textarea::-moz-placeholder {\n      color: rgba(34, 35, 36, 0.3);\n}\n.input[disabled]::-webkit-input-placeholder, [disabled].textarea::-webkit-input-placeholder, .input.is-disabled::-webkit-input-placeholder, .is-disabled.textarea::-webkit-input-placeholder {\n      color: rgba(34, 35, 36, 0.3);\n}\n.input[disabled]:-moz-placeholder, [disabled].textarea:-moz-placeholder, .input.is-disabled:-moz-placeholder, .is-disabled.textarea:-moz-placeholder {\n      color: rgba(34, 35, 36, 0.3);\n}\n.input[disabled]:-ms-input-placeholder, [disabled].textarea:-ms-input-placeholder, .input.is-disabled:-ms-input-placeholder, .is-disabled.textarea:-ms-input-placeholder {\n      color: rgba(34, 35, 36, 0.3);\n}\n.input.is-white, .is-white.textarea {\n    border-color: #fff;\n}\n.input.is-black, .is-black.textarea {\n    border-color: #111;\n}\n.input.is-light, .is-light.textarea {\n    border-color: #f5f7fa;\n}\n.input.is-dark, .is-dark.textarea {\n    border-color: #69707a;\n}\n.input.is-primary, .is-primary.textarea {\n    border-color: #1fc8db;\n}\n.input.is-info, .is-info.textarea {\n    border-color: #42afe3;\n}\n.input.is-success, .is-success.textarea {\n    border-color: #97cd76;\n}\n.input.is-warning, .is-warning.textarea {\n    border-color: #fce473;\n}\n.input.is-danger, .is-danger.textarea {\n    border-color: #ed6c63;\n}\n.input[type=\"search\"], [type=\"search\"].textarea {\n    border-radius: 290486px;\n}\n.input.is-small, .is-small.textarea {\n    border-radius: 2px;\n    font-size: 11px;\n    height: 24px;\n    line-height: 16px;\n    padding-left: 6px;\n    padding-right: 6px;\n}\n.input.is-medium, .is-medium.textarea {\n    font-size: 18px;\n    height: 40px;\n    line-height: 32px;\n    padding-left: 10px;\n    padding-right: 10px;\n}\n.input.is-large, .is-large.textarea {\n    font-size: 24px;\n    height: 48px;\n    line-height: 40px;\n    padding-left: 12px;\n    padding-right: 12px;\n}\n.input.is-fullwidth, .is-fullwidth.textarea {\n    display: block;\n    width: 100%;\n}\n.input.is-inline, .is-inline.textarea {\n    display: inline;\n    width: auto;\n}\n.textarea {\n  display: block;\n  line-height: 1.2;\n  max-height: 600px;\n  max-width: 100%;\n  min-height: 120px;\n  min-width: 100%;\n  padding: 10px;\n  resize: vertical;\n}\n.checkbox, .radio {\n  cursor: pointer;\n  display: inline-block;\n  line-height: 16px;\n  position: relative;\n  vertical-align: top;\n}\n.checkbox input, .radio input {\n    cursor: pointer;\n}\n.checkbox:hover, .radio:hover {\n    color: #222324;\n}\n.is-disabled.checkbox, .is-disabled.radio {\n    color: #aeb1b5;\n    pointer-events: none;\n}\n.is-disabled.checkbox input, .is-disabled.radio input {\n      pointer-events: none;\n}\n.radio + .radio {\n  margin-left: 10px;\n}\n.select {\n  display: inline-block;\n  height: 32px;\n  position: relative;\n  vertical-align: top;\n}\n.select select {\n    -moz-appearance: none;\n    -webkit-appearance: none;\n    align-items: center;\n    background-color: white;\n    border: 1px solid #d3d6db;\n    border-radius: 3px;\n    color: #222324;\n    display: inline-flex;\n    font-size: 14px;\n    height: 32px;\n    justify-content: flex-start;\n    line-height: 24px;\n    padding-left: 8px;\n    padding-right: 8px;\n    position: relative;\n    vertical-align: top;\n    cursor: pointer;\n    display: block;\n    outline: none;\n    padding-right: 36px;\n}\n.select select:hover {\n      border-color: #aeb1b5;\n}\n.select select:active, .select select:focus, .select select.is-active {\n      border-color: #1fc8db;\n      outline: none;\n}\n.select select[disabled], .select select.is-disabled {\n      background-color: #f5f7fa;\n      border-color: #d3d6db;\n      cursor: not-allowed;\n      pointer-events: none;\n}\n.select select[disabled]::-moz-placeholder, .select select.is-disabled::-moz-placeholder {\n        color: rgba(34, 35, 36, 0.3);\n}\n.select select[disabled]::-webkit-input-placeholder, .select select.is-disabled::-webkit-input-placeholder {\n        color: rgba(34, 35, 36, 0.3);\n}\n.select select[disabled]:-moz-placeholder, .select select.is-disabled:-moz-placeholder {\n        color: rgba(34, 35, 36, 0.3);\n}\n.select select[disabled]:-ms-input-placeholder, .select select.is-disabled:-ms-input-placeholder {\n        color: rgba(34, 35, 36, 0.3);\n}\n.select select.is-white {\n      border-color: #fff;\n}\n.select select.is-black {\n      border-color: #111;\n}\n.select select.is-light {\n      border-color: #f5f7fa;\n}\n.select select.is-dark {\n      border-color: #69707a;\n}\n.select select.is-primary {\n      border-color: #1fc8db;\n}\n.select select.is-info {\n      border-color: #42afe3;\n}\n.select select.is-success {\n      border-color: #97cd76;\n}\n.select select.is-warning {\n      border-color: #fce473;\n}\n.select select.is-danger {\n      border-color: #ed6c63;\n}\n.select select:hover {\n      border-color: #aeb1b5;\n}\n.select select::ms-expand {\n      display: none;\n}\n.select.is-fullwidth {\n    width: 100%;\n}\n.select.is-fullwidth select {\n      width: 100%;\n}\n.select:after {\n    border: 1px solid #1fc8db;\n    border-right: 0;\n    border-top: 0;\n    content: \" \";\n    display: block;\n    height: 7px;\n    pointer-events: none;\n    position: absolute;\n    transform: rotate(-45deg);\n    width: 7px;\n    margin-top: -6px;\n    right: 16px;\n    top: 50%;\n}\n.select:hover:after {\n    border-color: #222324;\n}\n.select.is-small {\n    height: 24px;\n}\n.select.is-small select {\n      border-radius: 2px;\n      font-size: 11px;\n      height: 24px;\n      line-height: 16px;\n      padding-left: 6px;\n      padding-right: 6px;\n      padding-right: 28px;\n}\n.select.is-medium {\n    height: 40px;\n}\n.select.is-medium select {\n      font-size: 18px;\n      height: 40px;\n      line-height: 32px;\n      padding-left: 10px;\n      padding-right: 10px;\n      padding-right: 44px;\n}\n.select.is-large {\n    height: 48px;\n}\n.select.is-large select {\n      font-size: 24px;\n      height: 48px;\n      line-height: 40px;\n      padding-left: 12px;\n      padding-right: 12px;\n      padding-right: 52px;\n}\n.label {\n  color: #222324;\n  display: block;\n  font-weight: bold;\n}\n.label:not(:last-child) {\n    margin-bottom: 5px;\n}\n.help {\n  display: block;\n  font-size: 11px;\n  margin-top: 5px;\n}\n.help.is-white {\n    color: #fff;\n}\n.help.is-black {\n    color: #111;\n}\n.help.is-light {\n    color: #f5f7fa;\n}\n.help.is-dark {\n    color: #69707a;\n}\n.help.is-primary {\n    color: #1fc8db;\n}\n.help.is-info {\n    color: #42afe3;\n}\n.help.is-success {\n    color: #97cd76;\n}\n.help.is-warning {\n    color: #fce473;\n}\n.help.is-danger {\n    color: #ed6c63;\n}\n@media screen and (max-width: 768px) {\n.control-label {\n    margin-bottom: 5px;\n}\n}\n@media screen and (min-width: 769px) {\n.control-label {\n    flex-grow: 1;\n    margin-right: 20px;\n    padding-top: 7px;\n    text-align: right;\n}\n}\n.control {\n  position: relative;\n  text-align: left;\n}\n.control:not(:last-child) {\n    margin-bottom: 10px;\n}\n.control.has-addons {\n    display: flex;\n    justify-content: flex-start;\n}\n.control.has-addons .button,\n    .control.has-addons .input,\n    .control.has-addons .textarea,\n    .control.has-addons .select {\n      border-radius: 0;\n      margin-right: -1px;\n      width: auto;\n}\n.control.has-addons .button:hover,\n      .control.has-addons .input:hover,\n      .control.has-addons .textarea:hover,\n      .control.has-addons .select:hover {\n        z-index: 2;\n}\n.control.has-addons .button:active, .control.has-addons .button:focus,\n      .control.has-addons .input:active,\n      .control.has-addons .textarea:active,\n      .control.has-addons .input:focus,\n      .control.has-addons .textarea:focus,\n      .control.has-addons .select:active,\n      .control.has-addons .select:focus {\n        z-index: 3;\n}\n.control.has-addons .button:first-child,\n      .control.has-addons .input:first-child,\n      .control.has-addons .textarea:first-child,\n      .control.has-addons .select:first-child {\n        border-radius: 3px 0 0 3px;\n}\n.control.has-addons .button:first-child select,\n        .control.has-addons .input:first-child select,\n        .control.has-addons .textarea:first-child select,\n        .control.has-addons .select:first-child select {\n          border-radius: 3px 0 0 3px;\n}\n.control.has-addons .button:last-child,\n      .control.has-addons .input:last-child,\n      .control.has-addons .textarea:last-child,\n      .control.has-addons .select:last-child {\n        border-radius: 0 3px 3px 0;\n}\n.control.has-addons .button:last-child select,\n        .control.has-addons .input:last-child select,\n        .control.has-addons .textarea:last-child select,\n        .control.has-addons .select:last-child select {\n          border-radius: 0 3px 3px 0;\n}\n.control.has-addons .button.is-expanded,\n      .control.has-addons .input.is-expanded,\n      .control.has-addons .is-expanded.textarea,\n      .control.has-addons .select.is-expanded {\n        flex-grow: 1;\n}\n.control.has-addons.has-addons-centered {\n      justify-content: center;\n}\n.control.has-addons.has-addons-right {\n      justify-content: flex-end;\n}\n.control.has-addons.has-addons-fullwidth .button,\n    .control.has-addons.has-addons-fullwidth .input,\n    .control.has-addons.has-addons-fullwidth .textarea,\n    .control.has-addons.has-addons-fullwidth .select {\n      flex-grow: 1;\n}\n.control.has-icon > .fa {\n    display: inline-block;\n    font-size: 14px;\n    height: 24px;\n    line-height: 24px;\n    text-align: center;\n    vertical-align: top;\n    width: 24px;\n    color: #aeb1b5;\n    pointer-events: none;\n    position: absolute;\n    top: 4px;\n    z-index: 4;\n}\n.control.has-icon .input:focus + .fa, .control.has-icon .textarea:focus + .fa {\n    color: #222324;\n}\n.control.has-icon .input.is-small + .fa, .control.has-icon .is-small.textarea + .fa {\n    font-size: 10.5px;\n    top: 0;\n}\n.control.has-icon .input.is-medium + .fa, .control.has-icon .is-medium.textarea + .fa {\n    font-size: 21px;\n    top: 8px;\n}\n.control.has-icon .input.is-large + .fa, .control.has-icon .is-large.textarea + .fa {\n    font-size: 21px;\n    top: 12px;\n}\n.control.has-icon:not(.has-icon-right) > .fa {\n    left: 4px;\n}\n.control.has-icon:not(.has-icon-right) .input, .control.has-icon:not(.has-icon-right) .textarea {\n    padding-left: 32px;\n}\n.control.has-icon:not(.has-icon-right) .input.is-small, .control.has-icon:not(.has-icon-right) .is-small.textarea {\n      padding-left: 24px;\n}\n.control.has-icon:not(.has-icon-right) .input.is-small + .fa, .control.has-icon:not(.has-icon-right) .is-small.textarea + .fa {\n        left: 0;\n}\n.control.has-icon:not(.has-icon-right) .input.is-medium, .control.has-icon:not(.has-icon-right) .is-medium.textarea {\n      padding-left: 40px;\n}\n.control.has-icon:not(.has-icon-right) .input.is-medium + .fa, .control.has-icon:not(.has-icon-right) .is-medium.textarea + .fa {\n        left: 8px;\n}\n.control.has-icon:not(.has-icon-right) .input.is-large, .control.has-icon:not(.has-icon-right) .is-large.textarea {\n      padding-left: 48px;\n}\n.control.has-icon:not(.has-icon-right) .input.is-large + .fa, .control.has-icon:not(.has-icon-right) .is-large.textarea + .fa {\n        left: 12px;\n}\n.control.has-icon.has-icon-right > .fa {\n    right: 4px;\n}\n.control.has-icon.has-icon-right .input, .control.has-icon.has-icon-right .textarea {\n    padding-right: 32px;\n}\n.control.has-icon.has-icon-right .input.is-small, .control.has-icon.has-icon-right .is-small.textarea {\n      padding-right: 24px;\n}\n.control.has-icon.has-icon-right .input.is-small + .fa, .control.has-icon.has-icon-right .is-small.textarea + .fa {\n        right: 0;\n}\n.control.has-icon.has-icon-right .input.is-medium, .control.has-icon.has-icon-right .is-medium.textarea {\n      padding-right: 40px;\n}\n.control.has-icon.has-icon-right .input.is-medium + .fa, .control.has-icon.has-icon-right .is-medium.textarea + .fa {\n        right: 8px;\n}\n.control.has-icon.has-icon-right .input.is-large, .control.has-icon.has-icon-right .is-large.textarea {\n      padding-right: 48px;\n}\n.control.has-icon.has-icon-right .input.is-large + .fa, .control.has-icon.has-icon-right .is-large.textarea + .fa {\n        right: 12px;\n}\n.control.is-grouped {\n    display: flex;\n    justify-content: flex-start;\n}\n.control.is-grouped > .control:not(:last-child) {\n      margin-bottom: 0;\n      margin-right: 10px;\n}\n.control.is-grouped > .control.is-expanded {\n      flex-grow: 1;\n}\n.control.is-grouped.is-grouped-centered {\n      justify-content: center;\n}\n.control.is-grouped.is-grouped-right {\n      justify-content: flex-end;\n}\n@media screen and (min-width: 769px) {\n.control.is-horizontal {\n      display: flex;\n}\n.control.is-horizontal > .control {\n        display: flex;\n        flex-grow: 5;\n}\n}\n.control.is-loading:after {\n    position: absolute !important;\n    right: 8px;\n    top: 8px;\n}\n.image {\n  display: block;\n  position: relative;\n}\n.image img {\n    display: block;\n    height: auto;\n    width: 100%;\n}\n.image.is-square img, .image.is-1by1 img, .image.is-4by3 img, .image.is-3by2 img, .image.is-16by9 img, .image.is-2by1 img {\n    bottom: 0;\n    left: 0;\n    position: absolute;\n    right: 0;\n    top: 0;\n    height: 100%;\n    width: 100%;\n}\n.image.is-square, .image.is-1by1 {\n    padding-top: 100%;\n}\n.image.is-4by3 {\n    padding-top: 75%;\n}\n.image.is-3by2 {\n    padding-top: 66.6666%;\n}\n.image.is-16by9 {\n    padding-top: 56.25%;\n}\n.image.is-2by1 {\n    padding-top: 50%;\n}\n.image.is-16x16 {\n    height: 16px;\n    width: 16px;\n}\n.image.is-24x24 {\n    height: 24px;\n    width: 24px;\n}\n.image.is-32x32 {\n    height: 32px;\n    width: 32px;\n}\n.image.is-48x48 {\n    height: 48px;\n    width: 48px;\n}\n.image.is-64x64 {\n    height: 64px;\n    width: 64px;\n}\n.image.is-96x96 {\n    height: 96px;\n    width: 96px;\n}\n.image.is-128x128 {\n    height: 128px;\n    width: 128px;\n}\n.notification {\n  background-color: #f5f7fa;\n  border-radius: 3px;\n  padding: 16px 20px;\n  position: relative;\n}\n.notification:after {\n    clear: both;\n    content: \" \";\n    display: table;\n}\n.notification .delete, .notification .modal-close {\n    border-radius: 0 3px;\n    float: right;\n    margin: -16px -20px 0 20px;\n}\n.notification .subtitle,\n  .notification .title {\n    color: inherit;\n}\n.notification.is-white {\n    background-color: #fff;\n    color: #111;\n}\n.notification.is-black {\n    background-color: #111;\n    color: #fff;\n}\n.notification.is-light {\n    background-color: #f5f7fa;\n    color: #69707a;\n}\n.notification.is-dark {\n    background-color: #69707a;\n    color: #f5f7fa;\n}\n.notification.is-primary {\n    background-color: #1fc8db;\n    color: white;\n}\n.notification.is-info {\n    background-color: #42afe3;\n    color: white;\n}\n.notification.is-success {\n    background-color: #97cd76;\n    color: white;\n}\n.notification.is-warning {\n    background-color: #fce473;\n    color: rgba(17, 17, 17, 0.5);\n}\n.notification.is-danger {\n    background-color: #ed6c63;\n    color: white;\n}\n.progress {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  border: none;\n  border-radius: 290486px;\n  display: block;\n  height: 12px;\n  overflow: hidden;\n  padding: 0;\n  width: 100%;\n}\n.progress::-webkit-progress-bar {\n    background-color: #d3d6db;\n}\n.progress::-webkit-progress-value {\n    background-color: #69707a;\n}\n.progress::-moz-progress-bar {\n    background-color: #69707a;\n}\n.progress.is-white::-webkit-progress-value {\n    background-color: #fff;\n}\n.progress.is-white::-moz-progress-bar {\n    background-color: #fff;\n}\n.progress.is-black::-webkit-progress-value {\n    background-color: #111;\n}\n.progress.is-black::-moz-progress-bar {\n    background-color: #111;\n}\n.progress.is-light::-webkit-progress-value {\n    background-color: #f5f7fa;\n}\n.progress.is-light::-moz-progress-bar {\n    background-color: #f5f7fa;\n}\n.progress.is-dark::-webkit-progress-value {\n    background-color: #69707a;\n}\n.progress.is-dark::-moz-progress-bar {\n    background-color: #69707a;\n}\n.progress.is-primary::-webkit-progress-value {\n    background-color: #1fc8db;\n}\n.progress.is-primary::-moz-progress-bar {\n    background-color: #1fc8db;\n}\n.progress.is-info::-webkit-progress-value {\n    background-color: #42afe3;\n}\n.progress.is-info::-moz-progress-bar {\n    background-color: #42afe3;\n}\n.progress.is-success::-webkit-progress-value {\n    background-color: #97cd76;\n}\n.progress.is-success::-moz-progress-bar {\n    background-color: #97cd76;\n}\n.progress.is-warning::-webkit-progress-value {\n    background-color: #fce473;\n}\n.progress.is-warning::-moz-progress-bar {\n    background-color: #fce473;\n}\n.progress.is-danger::-webkit-progress-value {\n    background-color: #ed6c63;\n}\n.progress.is-danger::-moz-progress-bar {\n    background-color: #ed6c63;\n}\n.progress.is-small {\n    height: 8px;\n}\n.progress.is-medium {\n    height: 16px;\n}\n.progress.is-large {\n    height: 20px;\n}\n.table {\n  background-color: #fff;\n  color: #222324;\n  margin-bottom: 20px;\n  width: 100%;\n}\n.table td,\n  .table th {\n    border: 1px solid #d3d6db;\n    border-width: 0 0 1px;\n    padding: 8px 10px;\n    vertical-align: top;\n}\n.table td.is-icon,\n    .table th.is-icon {\n      padding: 5px;\n      text-align: center;\n      white-space: nowrap;\n      width: 1%;\n}\n.table td.is-icon .fa,\n      .table th.is-icon .fa {\n        display: inline-block;\n        font-size: 21px;\n        height: 24px;\n        line-height: 24px;\n        text-align: center;\n        vertical-align: top;\n        width: 24px;\n}\n.table td.is-icon.is-link,\n      .table th.is-icon.is-link {\n        padding: 0;\n}\n.table td.is-icon.is-link > a,\n        .table th.is-icon.is-link > a {\n          padding: 5px;\n}\n.table td.is-link,\n    .table th.is-link {\n      padding: 0;\n}\n.table td.is-link > a,\n      .table th.is-link > a {\n        display: block;\n        padding: 8px 10px;\n}\n.table td.is-link > a:hover,\n        .table th.is-link > a:hover {\n          background-color: #1fc8db;\n          color: white;\n}\n.table td.is-narrow,\n    .table th.is-narrow {\n      white-space: nowrap;\n      width: 1%;\n}\n.table th {\n    color: #222324;\n    text-align: left;\n}\n.table tr:hover {\n    background-color: #f5f7fa;\n    color: #222324;\n}\n.table thead td,\n  .table thead th {\n    border-width: 0 0 2px;\n    color: #aeb1b5;\n}\n.table tbody tr:last-child td,\n  .table tbody tr:last-child th {\n    border-bottom-width: 0;\n}\n.table tfoot td,\n  .table tfoot th {\n    border-width: 2px 0 0;\n    color: #aeb1b5;\n}\n.table.is-bordered td,\n  .table.is-bordered th {\n    border-width: 1px;\n}\n.table.is-bordered tr:last-child td,\n  .table.is-bordered tr:last-child th {\n    border-bottom-width: 1px;\n}\n.table.is-narrow td,\n  .table.is-narrow th {\n    padding: 5px 10px;\n}\n.table.is-narrow td.is-icon,\n    .table.is-narrow th.is-icon {\n      padding: 2px;\n}\n.table.is-narrow td.is-icon.is-link,\n      .table.is-narrow th.is-icon.is-link {\n        padding: 0;\n}\n.table.is-narrow td.is-icon.is-link > a,\n        .table.is-narrow th.is-icon.is-link > a {\n          padding: 2px;\n}\n.table.is-narrow td.is-link,\n    .table.is-narrow th.is-link {\n      padding: 0;\n}\n.table.is-narrow td.is-link > a,\n      .table.is-narrow th.is-link > a {\n        padding: 5px 10px;\n}\n.table.is-striped tbody tr:hover {\n    background-color: #eef2f7;\n}\n.table.is-striped tbody tr:nth-child(2n) {\n    background-color: #f5f7fa;\n}\n.table.is-striped tbody tr:nth-child(2n):hover {\n      background-color: #eef2f7;\n}\n.title,\n.subtitle {\n  font-weight: 300;\n  word-break: break-word;\n}\n.title em,\n  .title span,\n  .subtitle em,\n  .subtitle span {\n    font-weight: 300;\n}\n.title a:hover,\n  .subtitle a:hover {\n    border-bottom: 1px solid;\n}\n.title strong,\n  .subtitle strong {\n    font-weight: 500;\n}\n.title .tag,\n  .subtitle .tag {\n    vertical-align: bottom;\n}\n.title {\n  color: #222324;\n  font-size: 28px;\n  line-height: 1;\n}\n.title code {\n    display: inline-block;\n    font-size: 28px;\n}\n.title strong {\n    color: inherit;\n}\n.title + .highlight {\n    margin-top: -10px;\n}\n.title + .subtitle {\n    margin-top: -10px;\n}\n.title.is-1 {\n    font-size: 48px;\n}\n.title.is-1 code {\n      font-size: 40px;\n}\n.title.is-2 {\n    font-size: 40px;\n}\n.title.is-2 code {\n      font-size: 28px;\n}\n.title.is-3 {\n    font-size: 28px;\n}\n.title.is-3 code {\n      font-size: 24px;\n}\n.title.is-4 {\n    font-size: 24px;\n}\n.title.is-4 code {\n      font-size: 18px;\n}\n.title.is-5 {\n    font-size: 18px;\n}\n.title.is-5 code {\n      font-size: 14px;\n}\n.title.is-6 {\n    font-size: 14px;\n}\n.title.is-6 code {\n      font-size: 14px;\n}\n.title.is-normal {\n    font-weight: 400;\n}\n.title.is-normal strong {\n      font-weight: 700;\n}\n@media screen and (min-width: 769px) {\n.title + .subtitle {\n      margin-top: -15px;\n}\n}\n.subtitle {\n  color: #69707a;\n  font-size: 18px;\n  line-height: 1.125;\n}\n.subtitle code {\n    border-radius: 3px;\n    display: inline-block;\n    font-size: 14px;\n    padding: 2px 3px;\n    vertical-align: top;\n}\n.subtitle strong {\n    color: #222324;\n}\n.subtitle + .title {\n    margin-top: -20px;\n}\n.subtitle.is-1 {\n    font-size: 48px;\n}\n.subtitle.is-1 code {\n      font-size: 40px;\n}\n.subtitle.is-2 {\n    font-size: 40px;\n}\n.subtitle.is-2 code {\n      font-size: 28px;\n}\n.subtitle.is-3 {\n    font-size: 28px;\n}\n.subtitle.is-3 code {\n      font-size: 24px;\n}\n.subtitle.is-4 {\n    font-size: 24px;\n}\n.subtitle.is-4 code {\n      font-size: 18px;\n}\n.subtitle.is-5 {\n    font-size: 18px;\n}\n.subtitle.is-5 code {\n      font-size: 14px;\n}\n.subtitle.is-6 {\n    font-size: 14px;\n}\n.subtitle.is-6 code {\n      font-size: 14px;\n}\n.subtitle.is-normal {\n    font-weight: 400;\n}\n.subtitle.is-normal strong {\n      font-weight: 700;\n}\n.delete, .modal-close {\n  -moz-appearance: none;\n  -webkit-appearance: none;\n  background-color: rgba(17, 17, 17, 0.2);\n  border: none;\n  border-radius: 290486px;\n  cursor: pointer;\n  display: inline-block;\n  height: 24px;\n  position: relative;\n  vertical-align: top;\n  width: 24px;\n}\n.delete:before, .modal-close:before, .delete:after, .modal-close:after {\n    background-color: #fff;\n    content: \"\";\n    display: block;\n    height: 2px;\n    left: 50%;\n    margin-left: -25%;\n    margin-top: -1px;\n    position: absolute;\n    top: 50%;\n    width: 50%;\n}\n.delete:before, .modal-close:before {\n    transform: rotate(45deg);\n}\n.delete:after, .modal-close:after {\n    transform: rotate(-45deg);\n}\n.delete:hover, .modal-close:hover {\n    background-color: rgba(17, 17, 17, 0.5);\n}\n.delete.is-small, .tag:not(.is-large) .delete, .tag:not(.is-large) .modal-close, .is-small.modal-close {\n    height: 16px;\n    width: 16px;\n}\n.delete.is-medium, .is-medium.modal-close {\n    height: 32px;\n    width: 32px;\n}\n.delete.is-large, .is-large.modal-close {\n    height: 40px;\n    width: 40px;\n}\n.icon {\n  display: inline-block;\n  font-size: 21px;\n  height: 24px;\n  line-height: 24px;\n  text-align: center;\n  vertical-align: top;\n  width: 24px;\n}\n.icon .fa {\n    font-size: inherit;\n    line-height: inherit;\n}\n.icon.is-small {\n    display: inline-block;\n    font-size: 14px;\n    height: 16px;\n    line-height: 16px;\n    text-align: center;\n    vertical-align: top;\n    width: 16px;\n}\n.icon.is-medium {\n    display: inline-block;\n    font-size: 28px;\n    height: 32px;\n    line-height: 32px;\n    text-align: center;\n    vertical-align: top;\n    width: 32px;\n}\n.icon.is-large {\n    display: inline-block;\n    font-size: 42px;\n    height: 48px;\n    line-height: 48px;\n    text-align: center;\n    vertical-align: top;\n    width: 48px;\n}\n.hamburger, .nav-toggle {\n  cursor: pointer;\n  display: block;\n  height: 50px;\n  position: relative;\n  width: 50px;\n}\n.hamburger span, .nav-toggle span {\n    background-color: #69707a;\n    display: block;\n    height: 1px;\n    left: 50%;\n    margin-left: -7px;\n    position: absolute;\n    top: 50%;\n    transition: none 86ms ease-out;\n    transition-property: background, left, opacity, transform;\n    width: 15px;\n}\n.hamburger span:nth-child(1), .nav-toggle span:nth-child(1) {\n      margin-top: -6px;\n}\n.hamburger span:nth-child(2), .nav-toggle span:nth-child(2) {\n      margin-top: -1px;\n}\n.hamburger span:nth-child(3), .nav-toggle span:nth-child(3) {\n      margin-top: 4px;\n}\n.hamburger:hover, .nav-toggle:hover {\n    background-color: #f5f7fa;\n}\n.hamburger.is-active span, .is-active.nav-toggle span {\n    background-color: #1fc8db;\n}\n.hamburger.is-active span:nth-child(1), .is-active.nav-toggle span:nth-child(1) {\n      margin-left: -5px;\n      transform: rotate(45deg);\n      transform-origin: left top;\n}\n.hamburger.is-active span:nth-child(2), .is-active.nav-toggle span:nth-child(2) {\n      opacity: 0;\n}\n.hamburger.is-active span:nth-child(3), .is-active.nav-toggle span:nth-child(3) {\n      margin-left: -5px;\n      transform: rotate(-45deg);\n      transform-origin: left bottom;\n}\n.heading {\n  display: block;\n  font-size: 11px;\n  letter-spacing: 1px;\n  margin-bottom: 5px;\n  text-transform: uppercase;\n}\n.highlight {\n  font-size: 12px;\n  font-weight: normal;\n  max-width: 100%;\n  overflow: hidden;\n  padding: 0;\n}\n.highlight pre {\n    overflow: auto;\n    max-width: 100%;\n}\n.loader, .button.is-loading:after, .control.is-loading:after {\n  animation: spin-around 500ms infinite linear;\n  border: 2px solid #d3d6db;\n  border-radius: 290486px;\n  border-right-color: transparent;\n  border-top-color: transparent;\n  content: \"\";\n  display: block;\n  height: 16px;\n  position: relative;\n  width: 16px;\n}\n.number {\n  background-color: #f5f7fa;\n  border-radius: 290486px;\n  display: inline-block;\n  font-size: 18px;\n  vertical-align: top;\n}\n.tag {\n  align-items: center;\n  background-color: #f5f7fa;\n  border-radius: 290486px;\n  color: #69707a;\n  display: inline-flex;\n  font-size: 12px;\n  height: 24px;\n  justify-content: center;\n  line-height: 16px;\n  padding-left: 10px;\n  padding-right: 10px;\n  vertical-align: top;\n  white-space: nowrap;\n}\n.tag .delete, .tag .modal-close {\n    margin-left: 4px;\n    margin-right: -6px;\n}\n.tag.is-white {\n    background-color: #fff;\n    color: #111;\n}\n.tag.is-black {\n    background-color: #111;\n    color: #fff;\n}\n.tag.is-light {\n    background-color: #f5f7fa;\n    color: #69707a;\n}\n.tag.is-dark {\n    background-color: #69707a;\n    color: #f5f7fa;\n}\n.tag.is-primary {\n    background-color: #1fc8db;\n    color: white;\n}\n.tag.is-info {\n    background-color: #42afe3;\n    color: white;\n}\n.tag.is-success {\n    background-color: #97cd76;\n    color: white;\n}\n.tag.is-warning {\n    background-color: #fce473;\n    color: rgba(17, 17, 17, 0.5);\n}\n.tag.is-danger {\n    background-color: #ed6c63;\n    color: white;\n}\n.tag.is-small {\n    font-size: 11px;\n    height: 20px;\n    padding-left: 8px;\n    padding-right: 8px;\n}\n.tag.is-medium {\n    font-size: 14px;\n    height: 32px;\n    padding-left: 14px;\n    padding-right: 14px;\n}\n.tag.is-large {\n    font-size: 18px;\n    height: 40px;\n    line-height: 24px;\n    padding-left: 18px;\n    padding-right: 18px;\n}\n.tag.is-large .delete, .tag.is-large .modal-close {\n      margin-left: 4px;\n      margin-right: -8px;\n}\n.unselectable, .is-unselectable, .button, .delete, .modal-close, .tabs {\n  -webkit-touch-callout: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.card-header {\n  align-items: stretch;\n  box-shadow: 0 1px 2px rgba(17, 17, 17, 0.1);\n  display: flex;\n  min-height: 40px;\n}\n.card-header-title {\n  align-items: flex-start;\n  color: #222324;\n  display: flex;\n  flex-grow: 1;\n  font-weight: bold;\n  padding: 10px;\n}\n.card-header-icon {\n  align-items: center;\n  cursor: pointer;\n  display: flex;\n  justify-content: center;\n  width: 40px;\n}\n.card-image {\n  display: block;\n  position: relative;\n}\n.card-content {\n  padding: 20px;\n}\n.card-content .title + .subtitle {\n    margin-top: -20px;\n}\n.card-footer {\n  border-top: 1px solid #d3d6db;\n  align-items: stretch;\n  display: flex;\n}\n.card-footer-item {\n  align-items: center;\n  display: flex;\n  flex-grow: 1;\n  justify-content: center;\n  padding: 10px;\n}\n.card-footer-item:not(:last-child) {\n    border-right: 1px solid #d3d6db;\n}\n.card {\n  background-color: #fff;\n  box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1), 0 0 0 1px rgba(17, 17, 17, 0.1);\n  color: #69707a;\n  max-width: 100%;\n  position: relative;\n  width: 300px;\n}\n.card .media:not(:last-child) {\n    margin-bottom: 10px;\n}\n.card.is-fullwidth {\n    width: 100%;\n}\n.card.is-rounded {\n    border-radius: 5px;\n}\n.column {\n  flex-basis: 0;\n  flex-grow: 1;\n  flex-shrink: 1;\n  padding: 10px;\n}\n.columns.is-mobile > .column.is-narrow {\n    flex: none;\n}\n.columns.is-mobile > .column.is-full {\n    flex: none;\n    width: 100%;\n}\n.columns.is-mobile > .column.is-three-quarters {\n    flex: none;\n    width: 75%;\n}\n.columns.is-mobile > .column.is-two-thirds {\n    flex: none;\n    width: 66.6666%;\n}\n.columns.is-mobile > .column.is-half {\n    flex: none;\n    width: 50%;\n}\n.columns.is-mobile > .column.is-one-third {\n    flex: none;\n    width: 33.3333%;\n}\n.columns.is-mobile > .column.is-one-quarter {\n    flex: none;\n    width: 25%;\n}\n.columns.is-mobile > .column.is-offset-three-quarters {\n    margin-left: 75%;\n}\n.columns.is-mobile > .column.is-offset-two-thirds {\n    margin-left: 66.6666%;\n}\n.columns.is-mobile > .column.is-offset-half {\n    margin-left: 50%;\n}\n.columns.is-mobile > .column.is-offset-one-third {\n    margin-left: 33.3333%;\n}\n.columns.is-mobile > .column.is-offset-one-quarter {\n    margin-left: 25%;\n}\n.columns.is-mobile > .column.is-1 {\n    flex: none;\n    width: 8.33333%;\n}\n.columns.is-mobile > .column.is-offset-1 {\n    margin-left: 8.33333%;\n}\n.columns.is-mobile > .column.is-2 {\n    flex: none;\n    width: 16.66667%;\n}\n.columns.is-mobile > .column.is-offset-2 {\n    margin-left: 16.66667%;\n}\n.columns.is-mobile > .column.is-3 {\n    flex: none;\n    width: 25%;\n}\n.columns.is-mobile > .column.is-offset-3 {\n    margin-left: 25%;\n}\n.columns.is-mobile > .column.is-4 {\n    flex: none;\n    width: 33.33333%;\n}\n.columns.is-mobile > .column.is-offset-4 {\n    margin-left: 33.33333%;\n}\n.columns.is-mobile > .column.is-5 {\n    flex: none;\n    width: 41.66667%;\n}\n.columns.is-mobile > .column.is-offset-5 {\n    margin-left: 41.66667%;\n}\n.columns.is-mobile > .column.is-6 {\n    flex: none;\n    width: 50%;\n}\n.columns.is-mobile > .column.is-offset-6 {\n    margin-left: 50%;\n}\n.columns.is-mobile > .column.is-7 {\n    flex: none;\n    width: 58.33333%;\n}\n.columns.is-mobile > .column.is-offset-7 {\n    margin-left: 58.33333%;\n}\n.columns.is-mobile > .column.is-8 {\n    flex: none;\n    width: 66.66667%;\n}\n.columns.is-mobile > .column.is-offset-8 {\n    margin-left: 66.66667%;\n}\n.columns.is-mobile > .column.is-9 {\n    flex: none;\n    width: 75%;\n}\n.columns.is-mobile > .column.is-offset-9 {\n    margin-left: 75%;\n}\n.columns.is-mobile > .column.is-10 {\n    flex: none;\n    width: 83.33333%;\n}\n.columns.is-mobile > .column.is-offset-10 {\n    margin-left: 83.33333%;\n}\n.columns.is-mobile > .column.is-11 {\n    flex: none;\n    width: 91.66667%;\n}\n.columns.is-mobile > .column.is-offset-11 {\n    margin-left: 91.66667%;\n}\n.columns.is-mobile > .column.is-12 {\n    flex: none;\n    width: 100%;\n}\n.columns.is-mobile > .column.is-offset-12 {\n    margin-left: 100%;\n}\n@media screen and (max-width: 768px) {\n.column.is-narrow-mobile {\n      flex: none;\n}\n.column.is-full-mobile {\n      flex: none;\n      width: 100%;\n}\n.column.is-three-quarters-mobile {\n      flex: none;\n      width: 75%;\n}\n.column.is-two-thirds-mobile {\n      flex: none;\n      width: 66.6666%;\n}\n.column.is-half-mobile {\n      flex: none;\n      width: 50%;\n}\n.column.is-one-third-mobile {\n      flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter-mobile {\n      flex: none;\n      width: 25%;\n}\n.column.is-offset-three-quarters-mobile {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds-mobile {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half-mobile {\n      margin-left: 50%;\n}\n.column.is-offset-one-third-mobile {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter-mobile {\n      margin-left: 25%;\n}\n.column.is-1-mobile {\n      flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1-mobile {\n      margin-left: 8.33333%;\n}\n.column.is-2-mobile {\n      flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2-mobile {\n      margin-left: 16.66667%;\n}\n.column.is-3-mobile {\n      flex: none;\n      width: 25%;\n}\n.column.is-offset-3-mobile {\n      margin-left: 25%;\n}\n.column.is-4-mobile {\n      flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4-mobile {\n      margin-left: 33.33333%;\n}\n.column.is-5-mobile {\n      flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5-mobile {\n      margin-left: 41.66667%;\n}\n.column.is-6-mobile {\n      flex: none;\n      width: 50%;\n}\n.column.is-offset-6-mobile {\n      margin-left: 50%;\n}\n.column.is-7-mobile {\n      flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7-mobile {\n      margin-left: 58.33333%;\n}\n.column.is-8-mobile {\n      flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8-mobile {\n      margin-left: 66.66667%;\n}\n.column.is-9-mobile {\n      flex: none;\n      width: 75%;\n}\n.column.is-offset-9-mobile {\n      margin-left: 75%;\n}\n.column.is-10-mobile {\n      flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10-mobile {\n      margin-left: 83.33333%;\n}\n.column.is-11-mobile {\n      flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11-mobile {\n      margin-left: 91.66667%;\n}\n.column.is-12-mobile {\n      flex: none;\n      width: 100%;\n}\n.column.is-offset-12-mobile {\n      margin-left: 100%;\n}\n}\n@media screen and (min-width: 769px) {\n.column.is-narrow, .column.is-narrow-tablet {\n      flex: none;\n}\n.column.is-full, .column.is-full-tablet {\n      flex: none;\n      width: 100%;\n}\n.column.is-three-quarters, .column.is-three-quarters-tablet {\n      flex: none;\n      width: 75%;\n}\n.column.is-two-thirds, .column.is-two-thirds-tablet {\n      flex: none;\n      width: 66.6666%;\n}\n.column.is-half, .column.is-half-tablet {\n      flex: none;\n      width: 50%;\n}\n.column.is-one-third, .column.is-one-third-tablet {\n      flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter, .column.is-one-quarter-tablet {\n      flex: none;\n      width: 25%;\n}\n.column.is-offset-three-quarters, .column.is-offset-three-quarters-tablet {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds, .column.is-offset-two-thirds-tablet {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half, .column.is-offset-half-tablet {\n      margin-left: 50%;\n}\n.column.is-offset-one-third, .column.is-offset-one-third-tablet {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter, .column.is-offset-one-quarter-tablet {\n      margin-left: 25%;\n}\n.column.is-1, .column.is-1-tablet {\n      flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1, .column.is-offset-1-tablet {\n      margin-left: 8.33333%;\n}\n.column.is-2, .column.is-2-tablet {\n      flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2, .column.is-offset-2-tablet {\n      margin-left: 16.66667%;\n}\n.column.is-3, .column.is-3-tablet {\n      flex: none;\n      width: 25%;\n}\n.column.is-offset-3, .column.is-offset-3-tablet {\n      margin-left: 25%;\n}\n.column.is-4, .column.is-4-tablet {\n      flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4, .column.is-offset-4-tablet {\n      margin-left: 33.33333%;\n}\n.column.is-5, .column.is-5-tablet {\n      flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5, .column.is-offset-5-tablet {\n      margin-left: 41.66667%;\n}\n.column.is-6, .column.is-6-tablet {\n      flex: none;\n      width: 50%;\n}\n.column.is-offset-6, .column.is-offset-6-tablet {\n      margin-left: 50%;\n}\n.column.is-7, .column.is-7-tablet {\n      flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7, .column.is-offset-7-tablet {\n      margin-left: 58.33333%;\n}\n.column.is-8, .column.is-8-tablet {\n      flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8, .column.is-offset-8-tablet {\n      margin-left: 66.66667%;\n}\n.column.is-9, .column.is-9-tablet {\n      flex: none;\n      width: 75%;\n}\n.column.is-offset-9, .column.is-offset-9-tablet {\n      margin-left: 75%;\n}\n.column.is-10, .column.is-10-tablet {\n      flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10, .column.is-offset-10-tablet {\n      margin-left: 83.33333%;\n}\n.column.is-11, .column.is-11-tablet {\n      flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11, .column.is-offset-11-tablet {\n      margin-left: 91.66667%;\n}\n.column.is-12, .column.is-12-tablet {\n      flex: none;\n      width: 100%;\n}\n.column.is-offset-12, .column.is-offset-12-tablet {\n      margin-left: 100%;\n}\n}\n@media screen and (min-width: 980px) {\n.column.is-narrow-desktop {\n      flex: none;\n}\n.column.is-full-desktop {\n      flex: none;\n      width: 100%;\n}\n.column.is-three-quarters-desktop {\n      flex: none;\n      width: 75%;\n}\n.column.is-two-thirds-desktop {\n      flex: none;\n      width: 66.6666%;\n}\n.column.is-half-desktop {\n      flex: none;\n      width: 50%;\n}\n.column.is-one-third-desktop {\n      flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter-desktop {\n      flex: none;\n      width: 25%;\n}\n.column.is-offset-three-quarters-desktop {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds-desktop {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half-desktop {\n      margin-left: 50%;\n}\n.column.is-offset-one-third-desktop {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter-desktop {\n      margin-left: 25%;\n}\n.column.is-1-desktop {\n      flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1-desktop {\n      margin-left: 8.33333%;\n}\n.column.is-2-desktop {\n      flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2-desktop {\n      margin-left: 16.66667%;\n}\n.column.is-3-desktop {\n      flex: none;\n      width: 25%;\n}\n.column.is-offset-3-desktop {\n      margin-left: 25%;\n}\n.column.is-4-desktop {\n      flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4-desktop {\n      margin-left: 33.33333%;\n}\n.column.is-5-desktop {\n      flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5-desktop {\n      margin-left: 41.66667%;\n}\n.column.is-6-desktop {\n      flex: none;\n      width: 50%;\n}\n.column.is-offset-6-desktop {\n      margin-left: 50%;\n}\n.column.is-7-desktop {\n      flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7-desktop {\n      margin-left: 58.33333%;\n}\n.column.is-8-desktop {\n      flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8-desktop {\n      margin-left: 66.66667%;\n}\n.column.is-9-desktop {\n      flex: none;\n      width: 75%;\n}\n.column.is-offset-9-desktop {\n      margin-left: 75%;\n}\n.column.is-10-desktop {\n      flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10-desktop {\n      margin-left: 83.33333%;\n}\n.column.is-11-desktop {\n      flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11-desktop {\n      margin-left: 91.66667%;\n}\n.column.is-12-desktop {\n      flex: none;\n      width: 100%;\n}\n.column.is-offset-12-desktop {\n      margin-left: 100%;\n}\n}\n@media screen and (min-width: 1180px) {\n.column.is-narrow-widescreen {\n      flex: none;\n}\n.column.is-full-widescreen {\n      flex: none;\n      width: 100%;\n}\n.column.is-three-quarters-widescreen {\n      flex: none;\n      width: 75%;\n}\n.column.is-two-thirds-widescreen {\n      flex: none;\n      width: 66.6666%;\n}\n.column.is-half-widescreen {\n      flex: none;\n      width: 50%;\n}\n.column.is-one-third-widescreen {\n      flex: none;\n      width: 33.3333%;\n}\n.column.is-one-quarter-widescreen {\n      flex: none;\n      width: 25%;\n}\n.column.is-offset-three-quarters-widescreen {\n      margin-left: 75%;\n}\n.column.is-offset-two-thirds-widescreen {\n      margin-left: 66.6666%;\n}\n.column.is-offset-half-widescreen {\n      margin-left: 50%;\n}\n.column.is-offset-one-third-widescreen {\n      margin-left: 33.3333%;\n}\n.column.is-offset-one-quarter-widescreen {\n      margin-left: 25%;\n}\n.column.is-1-widescreen {\n      flex: none;\n      width: 8.33333%;\n}\n.column.is-offset-1-widescreen {\n      margin-left: 8.33333%;\n}\n.column.is-2-widescreen {\n      flex: none;\n      width: 16.66667%;\n}\n.column.is-offset-2-widescreen {\n      margin-left: 16.66667%;\n}\n.column.is-3-widescreen {\n      flex: none;\n      width: 25%;\n}\n.column.is-offset-3-widescreen {\n      margin-left: 25%;\n}\n.column.is-4-widescreen {\n      flex: none;\n      width: 33.33333%;\n}\n.column.is-offset-4-widescreen {\n      margin-left: 33.33333%;\n}\n.column.is-5-widescreen {\n      flex: none;\n      width: 41.66667%;\n}\n.column.is-offset-5-widescreen {\n      margin-left: 41.66667%;\n}\n.column.is-6-widescreen {\n      flex: none;\n      width: 50%;\n}\n.column.is-offset-6-widescreen {\n      margin-left: 50%;\n}\n.column.is-7-widescreen {\n      flex: none;\n      width: 58.33333%;\n}\n.column.is-offset-7-widescreen {\n      margin-left: 58.33333%;\n}\n.column.is-8-widescreen {\n      flex: none;\n      width: 66.66667%;\n}\n.column.is-offset-8-widescreen {\n      margin-left: 66.66667%;\n}\n.column.is-9-widescreen {\n      flex: none;\n      width: 75%;\n}\n.column.is-offset-9-widescreen {\n      margin-left: 75%;\n}\n.column.is-10-widescreen {\n      flex: none;\n      width: 83.33333%;\n}\n.column.is-offset-10-widescreen {\n      margin-left: 83.33333%;\n}\n.column.is-11-widescreen {\n      flex: none;\n      width: 91.66667%;\n}\n.column.is-offset-11-widescreen {\n      margin-left: 91.66667%;\n}\n.column.is-12-widescreen {\n      flex: none;\n      width: 100%;\n}\n.column.is-offset-12-widescreen {\n      margin-left: 100%;\n}\n}\n.columns {\n  margin-left: -10px;\n  margin-right: -10px;\n  margin-top: -10px;\n}\n.columns:last-child {\n    margin-bottom: -10px;\n}\n.columns:not(:last-child) {\n    margin-bottom: 10px;\n}\n.columns.is-centered {\n    justify-content: center;\n}\n.columns.is-gapless {\n    margin-left: 0;\n    margin-right: 0;\n    margin-top: 0;\n}\n.columns.is-gapless:last-child {\n      margin-bottom: 0;\n}\n.columns.is-gapless:not(:last-child) {\n      margin-bottom: 20px;\n}\n.columns.is-gapless > .column {\n      margin: 0;\n      padding: 0;\n}\n@media screen and (min-width: 769px) {\n.columns.is-grid {\n      flex-wrap: wrap;\n}\n.columns.is-grid > .column {\n        max-width: 33.3333%;\n        padding: 10px;\n        width: 33.3333%;\n}\n.columns.is-grid > .column + .column {\n          margin-left: 0;\n}\n}\n.columns.is-mobile {\n    display: flex;\n}\n.columns.is-multiline {\n    flex-wrap: wrap;\n}\n.columns.is-vcentered {\n    align-items: center;\n}\n@media screen and (min-width: 769px) {\n.columns:not(.is-desktop) {\n      display: flex;\n}\n}\n@media screen and (min-width: 980px) {\n.columns.is-desktop {\n      display: flex;\n}\n}\n.tile {\n  align-items: stretch;\n  flex-basis: auto;\n  flex-grow: 1;\n  flex-shrink: 1;\n  min-height: min-content;\n}\n.tile.is-ancestor {\n    margin-left: -10px;\n    margin-right: -10px;\n    margin-top: -10px;\n}\n.tile.is-ancestor:last-child {\n      margin-bottom: -10px;\n}\n.tile.is-ancestor:not(:last-child) {\n      margin-bottom: 10px;\n}\n.tile.is-child {\n    margin: 0 !important;\n}\n.tile.is-parent {\n    padding: 10px;\n}\n.tile.is-vertical {\n    flex-direction: column;\n}\n.tile.is-vertical > .tile.is-child:not(:last-child) {\n      margin-bottom: 20px !important;\n}\n@media screen and (min-width: 769px) {\n.tile:not(.is-child) {\n      display: flex;\n}\n.tile.is-1 {\n      flex: none;\n      width: 8.33333%;\n}\n.tile.is-2 {\n      flex: none;\n      width: 16.66667%;\n}\n.tile.is-3 {\n      flex: none;\n      width: 25%;\n}\n.tile.is-4 {\n      flex: none;\n      width: 33.33333%;\n}\n.tile.is-5 {\n      flex: none;\n      width: 41.66667%;\n}\n.tile.is-6 {\n      flex: none;\n      width: 50%;\n}\n.tile.is-7 {\n      flex: none;\n      width: 58.33333%;\n}\n.tile.is-8 {\n      flex: none;\n      width: 66.66667%;\n}\n.tile.is-9 {\n      flex: none;\n      width: 75%;\n}\n.tile.is-10 {\n      flex: none;\n      width: 83.33333%;\n}\n.tile.is-11 {\n      flex: none;\n      width: 91.66667%;\n}\n.tile.is-12 {\n      flex: none;\n      width: 100%;\n}\n}\n.highlight {\n  background-color: #fdf6e3;\n  color: #586e75;\n}\n.highlight .c {\n    color: #93a1a1;\n}\n.highlight .err,\n  .highlight .g {\n    color: #586e75;\n}\n.highlight .k {\n    color: #859900;\n}\n.highlight .l,\n  .highlight .n {\n    color: #586e75;\n}\n.highlight .o {\n    color: #859900;\n}\n.highlight .x {\n    color: #cb4b16;\n}\n.highlight .p {\n    color: #586e75;\n}\n.highlight .cm {\n    color: #93a1a1;\n}\n.highlight .cp {\n    color: #859900;\n}\n.highlight .c1 {\n    color: #93a1a1;\n}\n.highlight .cs {\n    color: #859900;\n}\n.highlight .gd {\n    color: #2aa198;\n}\n.highlight .ge {\n    color: #586e75;\n    font-style: italic;\n}\n.highlight .gr {\n    color: #dc322f;\n}\n.highlight .gh {\n    color: #cb4b16;\n}\n.highlight .gi {\n    color: #859900;\n}\n.highlight .go,\n  .highlight .gp {\n    color: #586e75;\n}\n.highlight .gs {\n    color: #586e75;\n    font-weight: bold;\n}\n.highlight .gu {\n    color: #cb4b16;\n}\n.highlight .gt {\n    color: #586e75;\n}\n.highlight .kc {\n    color: #cb4b16;\n}\n.highlight .kd {\n    color: #268bd2;\n}\n.highlight .kn,\n  .highlight .kp {\n    color: #859900;\n}\n.highlight .kr {\n    color: #268bd2;\n}\n.highlight .kt {\n    color: #dc322f;\n}\n.highlight .ld {\n    color: #586e75;\n}\n.highlight .m,\n  .highlight .s {\n    color: #2aa198;\n}\n.highlight .na {\n    color: #B58900;\n}\n.highlight .nb {\n    color: #586e75;\n}\n.highlight .nc {\n    color: #268bd2;\n}\n.highlight .no {\n    color: #cb4b16;\n}\n.highlight .nd {\n    color: #268bd2;\n}\n.highlight .ni,\n  .highlight .ne {\n    color: #cb4b16;\n}\n.highlight .nf {\n    color: #268bd2;\n}\n.highlight .nl,\n  .highlight .nn,\n  .highlight .nx,\n  .highlight .py {\n    color: #586e75;\n}\n.highlight .nt,\n  .highlight .nv {\n    color: #268bd2;\n}\n.highlight .ow {\n    color: #859900;\n}\n.highlight .w {\n    color: #586e75;\n}\n.highlight .mf,\n  .highlight .mh,\n  .highlight .mi,\n  .highlight .mo {\n    color: #2aa198;\n}\n.highlight .sb {\n    color: #93a1a1;\n}\n.highlight .sc {\n    color: #2aa198;\n}\n.highlight .sd {\n    color: #586e75;\n}\n.highlight .s2 {\n    color: #2aa198;\n}\n.highlight .se {\n    color: #cb4b16;\n}\n.highlight .sh {\n    color: #586e75;\n}\n.highlight .si,\n  .highlight .sx {\n    color: #2aa198;\n}\n.highlight .sr {\n    color: #dc322f;\n}\n.highlight .s1,\n  .highlight .ss {\n    color: #2aa198;\n}\n.highlight .bp,\n  .highlight .vc,\n  .highlight .vg,\n  .highlight .vi {\n    color: #268bd2;\n}\n.highlight .il {\n    color: #2aa198;\n}\n.level-item .title,\n.level-item .subtitle {\n  margin-bottom: 0;\n}\n@media screen and (max-width: 768px) {\n.level-item:not(:last-child) {\n    margin-bottom: 10px;\n}\n}\n.level-left .level-item:not(:last-child),\n.level-right .level-item:not(:last-child) {\n  margin-right: 10px;\n}\n.level-left .level-item.is-flexible,\n.level-right .level-item.is-flexible {\n  flex-grow: 1;\n}\n@media screen and (max-width: 768px) {\n.level-left + .level-right {\n    margin-top: 20px;\n}\n}\n@media screen and (min-width: 769px) {\n.level-left {\n    align-items: center;\n    display: flex;\n}\n}\n@media screen and (min-width: 769px) {\n.level-right {\n    align-items: center;\n    display: flex;\n    justify-content: flex-end;\n}\n}\n.level {\n  align-items: center;\n  justify-content: space-between;\n}\n.level code {\n    border-radius: 3px;\n}\n.level img {\n    display: inline-block;\n    vertical-align: top;\n}\n.level.is-mobile {\n    display: flex;\n}\n.level.is-mobile > .level-item:not(:last-child) {\n      margin-bottom: 0;\n}\n.level.is-mobile > .level-item:not(.is-narrow) {\n      flex-grow: 1;\n}\n@media screen and (min-width: 769px) {\n.level {\n      display: flex;\n}\n.level > .level-item:not(.is-narrow) {\n        flex-grow: 1;\n}\n}\n.media-number {\n  background-color: #f5f7fa;\n  border-radius: 290486px;\n  display: inline-block;\n  font-size: 18px;\n  height: 32px;\n  line-height: 24px;\n  min-width: 32px;\n  padding: 4px 8px;\n  text-align: center;\n  vertical-align: top;\n}\n@media screen and (max-width: 768px) {\n.media-number {\n      margin-bottom: 10px;\n}\n}\n@media screen and (min-width: 769px) {\n.media-number {\n      margin-right: 10px;\n}\n}\n.media-left {\n  margin-right: 10px;\n}\n.media-right {\n  margin-left: 10px;\n}\n.media-content {\n  flex-grow: 1;\n  text-align: left;\n}\n.media {\n  align-items: flex-start;\n  display: flex;\n  text-align: left;\n}\n.media .content:not(:last-child) {\n    margin-bottom: 10px;\n}\n.media .media {\n    border-top: 1px solid rgba(211, 214, 219, 0.5);\n    display: flex;\n    padding-top: 10px;\n}\n.media .media .content:not(:last-child),\n    .media .media .control:not(:last-child) {\n      margin-bottom: 5px;\n}\n.media .media .media {\n      padding-top: 5px;\n}\n.media .media .media + .media {\n        margin-top: 5px;\n}\n.media + .media {\n    border-top: 1px solid rgba(211, 214, 219, 0.5);\n    margin-top: 10px;\n    padding-top: 10px;\n}\n.media.is-large + .media {\n    margin-top: 20px;\n    padding-top: 20px;\n}\n@media screen and (min-width: 769px) {\n.media.is-large .media-number {\n      margin-right: 20px;\n}\n}\n.menu-nav a {\n  display: block;\n  padding: 5px 10px;\n}\n.menu-list a {\n  border-radius: 2px;\n  color: #69707a;\n  display: block;\n  padding: 5px 10px;\n}\n.menu-list a:hover {\n    background-color: #f5f7fa;\n    color: #1fc8db;\n}\n.menu-list a.is-active {\n    background-color: #1fc8db;\n    color: white;\n}\n.menu-list li ul {\n  border-left: 1px solid #d3d6db;\n  margin: 10px;\n  padding-left: 10px;\n}\n.menu-label {\n  color: #aeb1b5;\n  font-size: 11px;\n  letter-spacing: 1px;\n  margin-bottom: 5px;\n  text-transform: uppercase;\n}\n.menu-label:not(:first-child) {\n    margin-top: 20px;\n}\n.message-body {\n  border: 1px solid #d3d6db;\n  border-radius: 3px;\n  padding: 12px 15px;\n}\n.message-body strong {\n    color: inherit;\n}\n.message-header {\n  background-color: #69707a;\n  border-radius: 3px 3px 0 0;\n  color: white;\n  padding: 7px 10px;\n}\n.message-header strong {\n    color: inherit;\n}\n.message-header + .message-body {\n    border-radius: 0 0 3px 3px;\n    border-top: none;\n}\n.message {\n  background-color: #f5f7fa;\n  border-radius: 3px;\n}\n.message.is-white {\n    background-color: white;\n}\n.message.is-white .message-header {\n      background-color: #fff;\n      color: #111;\n}\n.message.is-white .message-body {\n      border-color: #fff;\n      color: #666666;\n}\n.message.is-black {\n    background-color: whitesmoke;\n}\n.message.is-black .message-header {\n      background-color: #111;\n      color: #fff;\n}\n.message.is-black .message-body {\n      border-color: #111;\n      color: gray;\n}\n.message.is-light {\n    background-color: #f5f7fa;\n}\n.message.is-light .message-header {\n      background-color: #f5f7fa;\n      color: #69707a;\n}\n.message.is-light .message-body {\n      border-color: #f5f7fa;\n      color: #666666;\n}\n.message.is-dark {\n    background-color: #f4f5f6;\n}\n.message.is-dark .message-header {\n      background-color: #69707a;\n      color: #f5f7fa;\n}\n.message.is-dark .message-body {\n      border-color: #69707a;\n      color: gray;\n}\n.message.is-primary {\n    background-color: #edfbfc;\n}\n.message.is-primary .message-header {\n      background-color: #1fc8db;\n      color: white;\n}\n.message.is-primary .message-body {\n      border-color: #1fc8db;\n      color: gray;\n}\n.message.is-info {\n    background-color: #edf7fc;\n}\n.message.is-info .message-header {\n      background-color: #42afe3;\n      color: white;\n}\n.message.is-info .message-body {\n      border-color: #42afe3;\n      color: gray;\n}\n.message.is-success {\n    background-color: #f4faf0;\n}\n.message.is-success .message-header {\n      background-color: #97cd76;\n      color: white;\n}\n.message.is-success .message-body {\n      border-color: #97cd76;\n      color: gray;\n}\n.message.is-warning {\n    background-color: #fffbeb;\n}\n.message.is-warning .message-header {\n      background-color: #fce473;\n      color: rgba(17, 17, 17, 0.5);\n}\n.message.is-warning .message-body {\n      border-color: #fce473;\n      color: #666666;\n}\n.message.is-danger {\n    background-color: #fdeeed;\n}\n.message.is-danger .message-header {\n      background-color: #ed6c63;\n      color: white;\n}\n.message.is-danger .message-body {\n      border-color: #ed6c63;\n      color: gray;\n}\n.modal-background {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  background-color: rgba(17, 17, 17, 0.86);\n}\n.modal-content, .modal-card {\n  margin: 0 20px;\n  max-height: calc(100vh - 160px);\n  overflow: auto;\n  position: relative;\n  width: 100%;\n}\n@media screen and (min-width: 769px) {\n.modal-content, .modal-card {\n      margin: 0 auto;\n      max-height: calc(100vh - 40px);\n      width: 640px;\n}\n}\n.modal-close {\n  background: none;\n  height: 40px;\n  position: fixed;\n  right: 20px;\n  top: 20px;\n  width: 40px;\n}\n.modal-card {\n  background-color: #fff;\n  border-radius: 5px;\n  display: flex;\n  flex-direction: column;\n  max-height: calc(100vh - 40px);\n  overflow: hidden;\n}\n.modal-card-head,\n.modal-card-foot {\n  align-items: center;\n  background-color: #f5f7fa;\n  display: flex;\n  flex-shrink: 0;\n  justify-content: flex-start;\n  padding: 20px;\n  position: relative;\n}\n.modal-card-head {\n  border-bottom: 1px solid #d3d6db;\n}\n.modal-card-title {\n  color: #222324;\n  flex-grow: 1;\n  font-size: 24px;\n  line-height: 1;\n}\n.modal-card-foot {\n  border-top: 1px solid #d3d6db;\n}\n.modal-card-foot .button:not(:last-child) {\n    margin-right: 10px;\n}\n.modal-card-body {\n  flex-grow: 1;\n  overflow: auto;\n  padding: 20px;\n}\n.modal {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  align-items: center;\n  display: none;\n  justify-content: center;\n  overflow: hidden;\n  position: fixed;\n  z-index: 1986;\n}\n.modal.is-active {\n    display: flex;\n}\n@media screen and (min-width: 769px) {\n.nav-toggle {\n    display: none;\n}\n}\n.nav-item {\n  align-items: center;\n  display: flex;\n  justify-content: center;\n  padding: 10px;\n}\n.nav-item a {\n    flex-grow: 1;\n}\n.nav-item img {\n    max-height: 24px;\n}\n.nav-item .button + .button {\n    margin-left: 10px;\n}\n.nav-item .tag:first-child {\n    margin-right: 5px;\n}\n.nav-item .tag:last-child {\n    margin-left: 5px;\n}\n@media screen and (max-width: 768px) {\n.nav-item {\n      justify-content: flex-start;\n}\n}\n.nav-item a,\na.nav-item {\n  color: #69707a;\n}\n.nav-item a:hover,\n  a.nav-item:hover {\n    color: #222324;\n}\n.nav-item a.is-active,\n  a.nav-item.is-active {\n    color: #222324;\n}\n.nav-item a.is-tab,\n  a.nav-item.is-tab {\n    border-bottom: 1px solid transparent;\n    border-top: 1px solid transparent;\n    padding-left: 12px;\n    padding-right: 12px;\n}\n.nav-item a.is-tab:hover,\n    a.nav-item.is-tab:hover {\n      border-bottom: 1px solid #1fc8db;\n      border-top: 1px solid transparent;\n}\n.nav-item a.is-tab.is-active,\n    a.nav-item.is-tab.is-active {\n      border-bottom: 3px solid #1fc8db;\n      border-top: 3px solid transparent;\n      color: #1fc8db;\n}\n@media screen and (max-width: 768px) {\n.nav-menu {\n    background-color: #fff;\n    box-shadow: 0 4px 7px rgba(17, 17, 17, 0.1);\n    left: 0;\n    display: none;\n    right: 0;\n    top: 100%;\n    position: absolute;\n}\n.nav-menu .nav-item {\n      border-top: 1px solid rgba(211, 214, 219, 0.5);\n      padding: 10px;\n}\n.nav-menu.is-active {\n      display: block;\n}\n}\n@media screen and (min-width: 769px) and (max-width: 979px) {\n.nav-menu {\n    padding-right: 20px;\n}\n}\n.nav-left {\n  align-items: stretch;\n  display: flex;\n  flex-basis: 0;\n  flex-grow: 1;\n  justify-content: flex-start;\n  overflow: hidden;\n  overflow-x: auto;\n  white-space: nowrap;\n}\n.nav-center {\n  align-items: stretch;\n  display: flex;\n  justify-content: center;\n  margin-left: auto;\n  margin-right: auto;\n}\n@media screen and (min-width: 769px) {\n.nav-right {\n    align-items: stretch;\n    display: flex;\n    flex-basis: 0;\n    flex-grow: 1;\n    justify-content: flex-end;\n}\n}\n.nav {\n  align-items: stretch;\n  background-color: #fff;\n  display: flex;\n  min-height: 50px;\n  position: relative;\n  text-align: center;\n  z-index: 2;\n}\n.nav > .container {\n    align-items: stretch;\n    display: flex;\n    min-height: 50px;\n    width: 100%;\n}\n.nav > .container > .nav-left > .nav-item:first-child:not(.is-tab) {\n      padding-left: 0;\n}\n.nav > .container > .nav-right > .nav-item:last-child:not(.is-tab) {\n      padding-right: 0;\n}\n.container > .nav > .nav-left > .nav-item:first-child:not(.is-tab) {\n    padding-left: 0;\n}\n.container > .nav > .nav-right > .nav-item:last-child:not(.is-tab) {\n    padding-right: 0;\n}\n.nav.has-shadow {\n    box-shadow: 0 2px 3px rgba(17, 17, 17, 0.1);\n}\n@media screen and (max-width: 979px) {\n.nav > .container > .nav-left > .nav-item.is-brand:first-child,\n    .container > .nav > .nav-left > .nav-item.is-brand:first-child {\n      padding-left: 20px;\n}\n}\n.pagination {\n  align-items: center;\n  display: flex;\n  justify-content: center;\n  text-align: center;\n}\n.pagination a {\n    display: block;\n    min-width: 32px;\n    padding: 3px 8px;\n}\n.pagination span {\n    color: #aeb1b5;\n    display: block;\n    margin: 0 4px;\n}\n.pagination li {\n    margin: 0 2px;\n}\n.pagination ul {\n    align-items: center;\n    display: flex;\n    flex-grow: 1;\n    justify-content: center;\n}\n@media screen and (max-width: 768px) {\n.pagination {\n      flex-wrap: wrap;\n}\n.pagination > a {\n        width: calc(50% - 5px);\n}\n.pagination > a:not(:first-child) {\n          margin-left: 10px;\n}\n.pagination li {\n        flex-grow: 1;\n}\n.pagination ul {\n        margin-top: 10px;\n}\n}\n@media screen and (min-width: 769px) {\n.pagination > a:not(:first-child) {\n      order: 1;\n}\n}\n.panel-icon {\n  display: inline-block;\n  font-size: 14px;\n  height: 16px;\n  line-height: 16px;\n  text-align: center;\n  vertical-align: top;\n  width: 16px;\n  color: #aeb1b5;\n  float: left;\n  margin: 0 4px 0 -2px;\n}\n.panel-icon .fa {\n    font-size: inherit;\n    line-height: inherit;\n}\n.panel-heading {\n  background-color: #f5f7fa;\n  border-bottom: 1px solid #d3d6db;\n  border-radius: 4px 4px 0 0;\n  color: #222324;\n  font-size: 18px;\n  font-weight: 300;\n  padding: 10px;\n}\n.panel-list a {\n  color: #69707a;\n}\n.panel-list a:hover {\n    color: #1fc8db;\n}\n.panel-tabs {\n  display: flex;\n  font-size: 11px;\n  padding: 5px 10px 0;\n  justify-content: center;\n}\n.panel-tabs a {\n    border-bottom: 1px solid #d3d6db;\n    margin-bottom: -1px;\n    padding: 5px;\n}\n.panel-tabs a.is-active {\n      border-bottom-color: #222324;\n      color: #222324;\n}\n.panel-tabs:not(:last-child) {\n    border-bottom: 1px solid #d3d6db;\n}\n.panel-block {\n  color: #222324;\n  display: block;\n  line-height: 16px;\n  padding: 10px;\n}\n.panel-block:not(:last-child) {\n    border-bottom: 1px solid #d3d6db;\n}\na.panel-block:hover {\n  background-color: #f5f7fa;\n}\n.panel {\n  border: 1px solid #d3d6db;\n  border-radius: 5px;\n}\n.panel:not(:last-child) {\n    margin-bottom: 20px;\n}\n.tabs {\n  align-items: stretch;\n  display: flex;\n  justify-content: space-between;\n  line-height: 24px;\n  overflow: hidden;\n  overflow-x: auto;\n  white-space: nowrap;\n}\n.tabs a {\n    align-items: center;\n    border-bottom: 1px solid #d3d6db;\n    color: #69707a;\n    display: flex;\n    justify-content: center;\n    margin-bottom: -1px;\n    padding: 6px 12px;\n    vertical-align: top;\n}\n.tabs a:hover {\n      border-bottom-color: #222324;\n      color: #222324;\n}\n.tabs li {\n    display: block;\n}\n.tabs li.is-active a {\n      border-bottom-color: #1fc8db;\n      color: #1fc8db;\n}\n.tabs ul {\n    align-items: center;\n    border-bottom: 1px solid #d3d6db;\n    display: flex;\n    flex-grow: 1;\n    justify-content: flex-start;\n}\n.tabs ul.is-left {\n      padding-right: 10px;\n}\n.tabs ul.is-center {\n      flex: none;\n      justify-content: center;\n      padding-left: 10px;\n      padding-right: 10px;\n}\n.tabs ul.is-right {\n      justify-content: flex-end;\n      padding-left: 10px;\n}\n.tabs .icon:first-child {\n    margin-right: 8px;\n}\n.tabs .icon:last-child {\n    margin-left: 8px;\n}\n.tabs.is-centered ul {\n    justify-content: center;\n}\n.tabs.is-right ul {\n    justify-content: flex-end;\n}\n.tabs.is-boxed a {\n    border: 1px solid transparent;\n    border-radius: 3px 3px 0 0;\n    padding-bottom: 5px;\n    padding-top: 5px;\n}\n.tabs.is-boxed a:hover {\n      background-color: #f5f7fa;\n      border-bottom-color: #d3d6db;\n}\n.tabs.is-boxed li.is-active a {\n    background-color: #fff;\n    border-color: #d3d6db;\n    border-bottom-color: transparent !important;\n}\n.tabs.is-fullwidth li {\n    flex-grow: 1;\n}\n.tabs.is-toggle a {\n    border: 1px solid #d3d6db;\n    margin-bottom: 0;\n    padding-bottom: 5px;\n    padding-top: 5px;\n    position: relative;\n}\n.tabs.is-toggle a:hover {\n      background-color: #f5f7fa;\n      border-color: #aeb1b5;\n      z-index: 2;\n}\n.tabs.is-toggle li + li {\n    margin-left: -1px;\n}\n.tabs.is-toggle li:first-child a {\n    border-radius: 3px 0 0 3px;\n}\n.tabs.is-toggle li:last-child a {\n    border-radius: 0 3px 3px 0;\n}\n.tabs.is-toggle li.is-active a {\n    background-color: #1fc8db;\n    border-color: #1fc8db;\n    color: white;\n    z-index: 1;\n}\n.tabs.is-toggle ul {\n    border-bottom: none;\n}\n.tabs.is-small {\n    font-size: 11px;\n}\n.tabs.is-small a {\n      padding: 2px 8px;\n}\n.tabs.is-small.is-boxed a, .tabs.is-small.is-toggle a {\n      padding-bottom: 1px;\n      padding-top: 1px;\n}\n.tabs.is-medium {\n    font-size: 18px;\n}\n.tabs.is-medium a {\n      padding: 10px 16px;\n}\n.tabs.is-medium.is-boxed a, .tabs.is-medium.is-toggle a {\n      padding-bottom: 9px;\n      padding-top: 9px;\n}\n.tabs.is-large {\n    font-size: 28px;\n}\n.tabs.is-large a {\n      padding: 14px 20px;\n}\n.tabs.is-large.is-boxed a, .tabs.is-large.is-toggle a {\n      padding-bottom: 13px;\n      padding-top: 13px;\n}\n.hero-video {\n  bottom: 0;\n  left: 0;\n  position: absolute;\n  right: 0;\n  top: 0;\n  overflow: hidden;\n}\n.hero-video video {\n    left: 50%;\n    min-height: 100%;\n    min-width: 100%;\n    position: absolute;\n    top: 50%;\n    transform: translate3d(-50%, -50%, 0);\n}\n.hero-video.is-transparent {\n    opacity: 0.3;\n}\n@media screen and (max-width: 768px) {\n.hero-video {\n      display: none;\n}\n}\n.hero-buttons {\n  margin-top: 20px;\n}\n@media screen and (max-width: 768px) {\n.hero-buttons .button {\n      display: flex;\n}\n.hero-buttons .button:not(:last-child) {\n        margin-bottom: 10px;\n}\n}\n@media screen and (min-width: 769px) {\n.hero-buttons {\n      display: flex;\n      justify-content: center;\n}\n.hero-buttons .button:not(:last-child) {\n        margin-right: 20px;\n}\n}\n.hero-head,\n.hero-foot {\n  flex-shrink: 0;\n}\n.hero-body {\n  flex-grow: 1;\n  padding: 40px 20px;\n}\n@media screen and (min-width: 980px) {\n.hero-body {\n      padding-left: 0;\n      padding-right: 0;\n}\n}\n.hero {\n  align-items: stretch;\n  background-color: #fff;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n}\n.hero .nav {\n    background: none;\n    box-shadow: 0 1px 0 rgba(211, 214, 219, 0.3);\n}\n.hero .tabs ul {\n    border-bottom: none;\n}\n.hero.is-white {\n    background-color: #fff;\n    color: #111;\n}\n.hero.is-white .title {\n      color: #111;\n}\n.hero.is-white .title a,\n      .hero.is-white .title strong {\n        color: inherit;\n}\n.hero.is-white .subtitle {\n      color: rgba(17, 17, 17, 0.7);\n}\n.hero.is-white .subtitle a,\n      .hero.is-white .subtitle strong {\n        color: #111;\n}\n.hero.is-white .nav {\n      box-shadow: 0 1px 0 rgba(17, 17, 17, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-white .nav-menu {\n        background-color: #fff;\n}\n}\n.hero.is-white a.nav-item,\n    .hero.is-white .nav-item a:not(.button) {\n      color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-white a.nav-item:hover, .hero.is-white a.nav-item.is-active,\n      .hero.is-white .nav-item a:not(.button):hover,\n      .hero.is-white .nav-item a:not(.button).is-active {\n        color: #111;\n}\n.hero.is-white .tabs a {\n      color: #111;\n      opacity: 0.5;\n}\n.hero.is-white .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-white .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-white .tabs.is-boxed a, .hero.is-white .tabs.is-toggle a {\n      color: #111;\n}\n.hero.is-white .tabs.is-boxed a:hover, .hero.is-white .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-white .tabs.is-boxed li.is-active a, .hero.is-white .tabs.is-boxed li.is-active a:hover, .hero.is-white .tabs.is-toggle li.is-active a, .hero.is-white .tabs.is-toggle li.is-active a:hover {\n      background-color: #111;\n      border-color: #111;\n      color: #fff;\n}\n.hero.is-white.is-bold {\n      background-image: linear-gradient(141deg, #e6e6e6 0%, #fff 71%, white 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-white .nav-toggle span {\n        background-color: #111;\n}\n.hero.is-white .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-white .nav-toggle.is-active span {\n        background-color: #111;\n}\n.hero.is-white .nav-menu .nav-item {\n        border-top-color: rgba(17, 17, 17, 0.2);\n}\n}\n.hero.is-black {\n    background-color: #111;\n    color: #fff;\n}\n.hero.is-black .title {\n      color: #fff;\n}\n.hero.is-black .title a,\n      .hero.is-black .title strong {\n        color: inherit;\n}\n.hero.is-black .subtitle {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-black .subtitle a,\n      .hero.is-black .subtitle strong {\n        color: #fff;\n}\n.hero.is-black .nav {\n      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-black .nav-menu {\n        background-color: #111;\n}\n}\n.hero.is-black a.nav-item,\n    .hero.is-black .nav-item a:not(.button) {\n      color: rgba(255, 255, 255, 0.5);\n}\n.hero.is-black a.nav-item:hover, .hero.is-black a.nav-item.is-active,\n      .hero.is-black .nav-item a:not(.button):hover,\n      .hero.is-black .nav-item a:not(.button).is-active {\n        color: #fff;\n}\n.hero.is-black .tabs a {\n      color: #fff;\n      opacity: 0.5;\n}\n.hero.is-black .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-black .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-black .tabs.is-boxed a, .hero.is-black .tabs.is-toggle a {\n      color: #fff;\n}\n.hero.is-black .tabs.is-boxed a:hover, .hero.is-black .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-black .tabs.is-boxed li.is-active a, .hero.is-black .tabs.is-boxed li.is-active a:hover, .hero.is-black .tabs.is-toggle li.is-active a, .hero.is-black .tabs.is-toggle li.is-active a:hover {\n      background-color: #fff;\n      border-color: #fff;\n      color: #111;\n}\n.hero.is-black.is-bold {\n      background-image: linear-gradient(141deg, black 0%, #111 71%, #1f1c1c 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-black .nav-toggle span {\n        background-color: #fff;\n}\n.hero.is-black .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-black .nav-toggle.is-active span {\n        background-color: #fff;\n}\n.hero.is-black .nav-menu .nav-item {\n        border-top-color: rgba(255, 255, 255, 0.2);\n}\n}\n.hero.is-light {\n    background-color: #f5f7fa;\n    color: #69707a;\n}\n.hero.is-light .title {\n      color: #69707a;\n}\n.hero.is-light .title a,\n      .hero.is-light .title strong {\n        color: inherit;\n}\n.hero.is-light .subtitle {\n      color: rgba(105, 112, 122, 0.7);\n}\n.hero.is-light .subtitle a,\n      .hero.is-light .subtitle strong {\n        color: #69707a;\n}\n.hero.is-light .nav {\n      box-shadow: 0 1px 0 rgba(105, 112, 122, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-light .nav-menu {\n        background-color: #f5f7fa;\n}\n}\n.hero.is-light a.nav-item,\n    .hero.is-light .nav-item a:not(.button) {\n      color: rgba(105, 112, 122, 0.5);\n}\n.hero.is-light a.nav-item:hover, .hero.is-light a.nav-item.is-active,\n      .hero.is-light .nav-item a:not(.button):hover,\n      .hero.is-light .nav-item a:not(.button).is-active {\n        color: #69707a;\n}\n.hero.is-light .tabs a {\n      color: #69707a;\n      opacity: 0.5;\n}\n.hero.is-light .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-light .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-light .tabs.is-boxed a, .hero.is-light .tabs.is-toggle a {\n      color: #69707a;\n}\n.hero.is-light .tabs.is-boxed a:hover, .hero.is-light .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-light .tabs.is-boxed li.is-active a, .hero.is-light .tabs.is-boxed li.is-active a:hover, .hero.is-light .tabs.is-toggle li.is-active a, .hero.is-light .tabs.is-toggle li.is-active a:hover {\n      background-color: #69707a;\n      border-color: #69707a;\n      color: #f5f7fa;\n}\n.hero.is-light.is-bold {\n      background-image: linear-gradient(141deg, #d0e0ec 0%, #f5f7fa 71%, white 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-light .nav-toggle span {\n        background-color: #69707a;\n}\n.hero.is-light .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-light .nav-toggle.is-active span {\n        background-color: #69707a;\n}\n.hero.is-light .nav-menu .nav-item {\n        border-top-color: rgba(105, 112, 122, 0.2);\n}\n}\n.hero.is-dark {\n    background-color: #69707a;\n    color: #f5f7fa;\n}\n.hero.is-dark .title {\n      color: #f5f7fa;\n}\n.hero.is-dark .title a,\n      .hero.is-dark .title strong {\n        color: inherit;\n}\n.hero.is-dark .subtitle {\n      color: rgba(245, 247, 250, 0.7);\n}\n.hero.is-dark .subtitle a,\n      .hero.is-dark .subtitle strong {\n        color: #f5f7fa;\n}\n.hero.is-dark .nav {\n      box-shadow: 0 1px 0 rgba(245, 247, 250, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-dark .nav-menu {\n        background-color: #69707a;\n}\n}\n.hero.is-dark a.nav-item,\n    .hero.is-dark .nav-item a:not(.button) {\n      color: rgba(245, 247, 250, 0.5);\n}\n.hero.is-dark a.nav-item:hover, .hero.is-dark a.nav-item.is-active,\n      .hero.is-dark .nav-item a:not(.button):hover,\n      .hero.is-dark .nav-item a:not(.button).is-active {\n        color: #f5f7fa;\n}\n.hero.is-dark .tabs a {\n      color: #f5f7fa;\n      opacity: 0.5;\n}\n.hero.is-dark .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-dark .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-dark .tabs.is-boxed a, .hero.is-dark .tabs.is-toggle a {\n      color: #f5f7fa;\n}\n.hero.is-dark .tabs.is-boxed a:hover, .hero.is-dark .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-dark .tabs.is-boxed li.is-active a, .hero.is-dark .tabs.is-boxed li.is-active a:hover, .hero.is-dark .tabs.is-toggle li.is-active a, .hero.is-dark .tabs.is-toggle li.is-active a:hover {\n      background-color: #f5f7fa;\n      border-color: #f5f7fa;\n      color: #69707a;\n}\n.hero.is-dark.is-bold {\n      background-image: linear-gradient(141deg, #495a67 0%, #69707a 71%, #6e768e 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-dark .nav-toggle span {\n        background-color: #f5f7fa;\n}\n.hero.is-dark .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-dark .nav-toggle.is-active span {\n        background-color: #f5f7fa;\n}\n.hero.is-dark .nav-menu .nav-item {\n        border-top-color: rgba(245, 247, 250, 0.2);\n}\n}\n.hero.is-primary {\n    background-color: #1fc8db;\n    color: white;\n}\n.hero.is-primary .title {\n      color: white;\n}\n.hero.is-primary .title a,\n      .hero.is-primary .title strong {\n        color: inherit;\n}\n.hero.is-primary .subtitle {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-primary .subtitle a,\n      .hero.is-primary .subtitle strong {\n        color: white;\n}\n.hero.is-primary .nav {\n      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-primary .nav-menu {\n        background-color: #1fc8db;\n}\n}\n.hero.is-primary a.nav-item,\n    .hero.is-primary .nav-item a:not(.button) {\n      color: rgba(255, 255, 255, 0.5);\n}\n.hero.is-primary a.nav-item:hover, .hero.is-primary a.nav-item.is-active,\n      .hero.is-primary .nav-item a:not(.button):hover,\n      .hero.is-primary .nav-item a:not(.button).is-active {\n        color: white;\n}\n.hero.is-primary .tabs a {\n      color: white;\n      opacity: 0.5;\n}\n.hero.is-primary .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-primary .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-primary .tabs.is-boxed a, .hero.is-primary .tabs.is-toggle a {\n      color: white;\n}\n.hero.is-primary .tabs.is-boxed a:hover, .hero.is-primary .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-primary .tabs.is-boxed li.is-active a, .hero.is-primary .tabs.is-boxed li.is-active a:hover, .hero.is-primary .tabs.is-toggle li.is-active a, .hero.is-primary .tabs.is-toggle li.is-active a:hover {\n      background-color: white;\n      border-color: white;\n      color: #1fc8db;\n}\n.hero.is-primary.is-bold {\n      background-image: linear-gradient(141deg, #0fb8ad 0%, #1fc8db 71%, #2cb5e8 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-primary .nav-toggle span {\n        background-color: white;\n}\n.hero.is-primary .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-primary .nav-toggle.is-active span {\n        background-color: white;\n}\n.hero.is-primary .nav-menu .nav-item {\n        border-top-color: rgba(255, 255, 255, 0.2);\n}\n}\n.hero.is-info {\n    background-color: #42afe3;\n    color: white;\n}\n.hero.is-info .title {\n      color: white;\n}\n.hero.is-info .title a,\n      .hero.is-info .title strong {\n        color: inherit;\n}\n.hero.is-info .subtitle {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-info .subtitle a,\n      .hero.is-info .subtitle strong {\n        color: white;\n}\n.hero.is-info .nav {\n      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-info .nav-menu {\n        background-color: #42afe3;\n}\n}\n.hero.is-info a.nav-item,\n    .hero.is-info .nav-item a:not(.button) {\n      color: rgba(255, 255, 255, 0.5);\n}\n.hero.is-info a.nav-item:hover, .hero.is-info a.nav-item.is-active,\n      .hero.is-info .nav-item a:not(.button):hover,\n      .hero.is-info .nav-item a:not(.button).is-active {\n        color: white;\n}\n.hero.is-info .tabs a {\n      color: white;\n      opacity: 0.5;\n}\n.hero.is-info .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-info .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-info .tabs.is-boxed a, .hero.is-info .tabs.is-toggle a {\n      color: white;\n}\n.hero.is-info .tabs.is-boxed a:hover, .hero.is-info .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-info .tabs.is-boxed li.is-active a, .hero.is-info .tabs.is-boxed li.is-active a:hover, .hero.is-info .tabs.is-toggle li.is-active a, .hero.is-info .tabs.is-toggle li.is-active a:hover {\n      background-color: white;\n      border-color: white;\n      color: #42afe3;\n}\n.hero.is-info.is-bold {\n      background-image: linear-gradient(141deg, #13bfdf 0%, #42afe3 71%, #53a1eb 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-info .nav-toggle span {\n        background-color: white;\n}\n.hero.is-info .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-info .nav-toggle.is-active span {\n        background-color: white;\n}\n.hero.is-info .nav-menu .nav-item {\n        border-top-color: rgba(255, 255, 255, 0.2);\n}\n}\n.hero.is-success {\n    background-color: #97cd76;\n    color: white;\n}\n.hero.is-success .title {\n      color: white;\n}\n.hero.is-success .title a,\n      .hero.is-success .title strong {\n        color: inherit;\n}\n.hero.is-success .subtitle {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-success .subtitle a,\n      .hero.is-success .subtitle strong {\n        color: white;\n}\n.hero.is-success .nav {\n      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-success .nav-menu {\n        background-color: #97cd76;\n}\n}\n.hero.is-success a.nav-item,\n    .hero.is-success .nav-item a:not(.button) {\n      color: rgba(255, 255, 255, 0.5);\n}\n.hero.is-success a.nav-item:hover, .hero.is-success a.nav-item.is-active,\n      .hero.is-success .nav-item a:not(.button):hover,\n      .hero.is-success .nav-item a:not(.button).is-active {\n        color: white;\n}\n.hero.is-success .tabs a {\n      color: white;\n      opacity: 0.5;\n}\n.hero.is-success .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-success .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-success .tabs.is-boxed a, .hero.is-success .tabs.is-toggle a {\n      color: white;\n}\n.hero.is-success .tabs.is-boxed a:hover, .hero.is-success .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-success .tabs.is-boxed li.is-active a, .hero.is-success .tabs.is-boxed li.is-active a:hover, .hero.is-success .tabs.is-toggle li.is-active a, .hero.is-success .tabs.is-toggle li.is-active a:hover {\n      background-color: white;\n      border-color: white;\n      color: #97cd76;\n}\n.hero.is-success.is-bold {\n      background-image: linear-gradient(141deg, #8ecb45 0%, #97cd76 71%, #96d885 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-success .nav-toggle span {\n        background-color: white;\n}\n.hero.is-success .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-success .nav-toggle.is-active span {\n        background-color: white;\n}\n.hero.is-success .nav-menu .nav-item {\n        border-top-color: rgba(255, 255, 255, 0.2);\n}\n}\n.hero.is-warning {\n    background-color: #fce473;\n    color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-warning .title {\n      color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-warning .title a,\n      .hero.is-warning .title strong {\n        color: inherit;\n}\n.hero.is-warning .subtitle {\n      color: rgba(17, 17, 17, 0.7);\n}\n.hero.is-warning .subtitle a,\n      .hero.is-warning .subtitle strong {\n        color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-warning .nav {\n      box-shadow: 0 1px 0 rgba(17, 17, 17, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-warning .nav-menu {\n        background-color: #fce473;\n}\n}\n.hero.is-warning a.nav-item,\n    .hero.is-warning .nav-item a:not(.button) {\n      color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-warning a.nav-item:hover, .hero.is-warning a.nav-item.is-active,\n      .hero.is-warning .nav-item a:not(.button):hover,\n      .hero.is-warning .nav-item a:not(.button).is-active {\n        color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-warning .tabs a {\n      color: rgba(17, 17, 17, 0.5);\n      opacity: 0.5;\n}\n.hero.is-warning .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-warning .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-warning .tabs.is-boxed a, .hero.is-warning .tabs.is-toggle a {\n      color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-warning .tabs.is-boxed a:hover, .hero.is-warning .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-warning .tabs.is-boxed li.is-active a, .hero.is-warning .tabs.is-boxed li.is-active a:hover, .hero.is-warning .tabs.is-toggle li.is-active a, .hero.is-warning .tabs.is-toggle li.is-active a:hover {\n      background-color: rgba(17, 17, 17, 0.5);\n      border-color: rgba(17, 17, 17, 0.5);\n      color: #fce473;\n}\n.hero.is-warning.is-bold {\n      background-image: linear-gradient(141deg, #ffbd3d 0%, #fce473 71%, #fffe8a 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-warning .nav-toggle span {\n        background-color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-warning .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-warning .nav-toggle.is-active span {\n        background-color: rgba(17, 17, 17, 0.5);\n}\n.hero.is-warning .nav-menu .nav-item {\n        border-top-color: rgba(17, 17, 17, 0.2);\n}\n}\n.hero.is-danger {\n    background-color: #ed6c63;\n    color: white;\n}\n.hero.is-danger .title {\n      color: white;\n}\n.hero.is-danger .title a,\n      .hero.is-danger .title strong {\n        color: inherit;\n}\n.hero.is-danger .subtitle {\n      color: rgba(255, 255, 255, 0.7);\n}\n.hero.is-danger .subtitle a,\n      .hero.is-danger .subtitle strong {\n        color: white;\n}\n.hero.is-danger .nav {\n      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.2);\n}\n@media screen and (max-width: 768px) {\n.hero.is-danger .nav-menu {\n        background-color: #ed6c63;\n}\n}\n.hero.is-danger a.nav-item,\n    .hero.is-danger .nav-item a:not(.button) {\n      color: rgba(255, 255, 255, 0.5);\n}\n.hero.is-danger a.nav-item:hover, .hero.is-danger a.nav-item.is-active,\n      .hero.is-danger .nav-item a:not(.button):hover,\n      .hero.is-danger .nav-item a:not(.button).is-active {\n        color: white;\n}\n.hero.is-danger .tabs a {\n      color: white;\n      opacity: 0.5;\n}\n.hero.is-danger .tabs a:hover {\n        opacity: 1;\n}\n.hero.is-danger .tabs li.is-active a {\n      opacity: 1;\n}\n.hero.is-danger .tabs.is-boxed a, .hero.is-danger .tabs.is-toggle a {\n      color: white;\n}\n.hero.is-danger .tabs.is-boxed a:hover, .hero.is-danger .tabs.is-toggle a:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-danger .tabs.is-boxed li.is-active a, .hero.is-danger .tabs.is-boxed li.is-active a:hover, .hero.is-danger .tabs.is-toggle li.is-active a, .hero.is-danger .tabs.is-toggle li.is-active a:hover {\n      background-color: white;\n      border-color: white;\n      color: #ed6c63;\n}\n.hero.is-danger.is-bold {\n      background-image: linear-gradient(141deg, #f32a3e 0%, #ed6c63 71%, #f39376 100%);\n}\n@media screen and (max-width: 768px) {\n.hero.is-danger .nav-toggle span {\n        background-color: white;\n}\n.hero.is-danger .nav-toggle:hover {\n        background-color: rgba(17, 17, 17, 0.1);\n}\n.hero.is-danger .nav-toggle.is-active span {\n        background-color: white;\n}\n.hero.is-danger .nav-menu .nav-item {\n        border-top-color: rgba(255, 255, 255, 0.2);\n}\n}\n@media screen and (min-width: 769px) {\n.hero.is-medium .hero-body {\n      padding-bottom: 120px;\n      padding-top: 120px;\n}\n}\n@media screen and (min-width: 769px) {\n.hero.is-large .hero-body {\n      padding-bottom: 240px;\n      padding-top: 240px;\n}\n}\n.hero.is-fullheight {\n    min-height: 100vh;\n}\n.hero.is-fullheight .hero-body {\n      align-items: center;\n      display: flex;\n}\n.hero.is-fullheight .hero-body > .container {\n        flex-grow: 1;\n}\n.section {\n  background-color: #fff;\n  padding: 40px 20px;\n}\n@media screen and (min-width: 980px) {\n.section.is-medium {\n      padding: 120px 20px;\n}\n.section.is-large {\n      padding: 240px 20px;\n}\n}\n.footer {\n  background-color: #f5f7fa;\n  padding: 40px 20px 80px;\n}\n.footer a, .footer a:visited {\n    color: #69707a;\n}\n.footer a:hover, .footer a:visited:hover {\n      color: #222324;\n}\n.footer a:not(.icon), .footer a:visited:not(.icon) {\n      border-bottom: 1px solid #d3d6db;\n}\n.footer a:not(.icon):hover, .footer a:visited:not(.icon):hover {\n        border-bottom-color: #1fc8db;\n}\n.container-small {\n  position: relative;\n  margin: 0 auto;\n  max-width: 50em;\n}\n", ""]);

// exports


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)();
// imports


// module
exports.push([module.i, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

// exports


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__

/* template */
var __vue_template__ = __webpack_require__(16)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (typeof __vue_exports__.default === "object") {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__

/* styles */
__webpack_require__(19)

/* script */
__vue_exports__ = __webpack_require__(5)

/* template */
var __vue_template__ = __webpack_require__(14)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (typeof __vue_exports__.default === "object") {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

var __vue_exports__, __vue_options__

/* styles */
__webpack_require__(20)

/* script */
__vue_exports__ = __webpack_require__(6)

/* template */
var __vue_template__ = __webpack_require__(15)
__vue_options__ = __vue_exports__ = __vue_exports__ || {}
if (typeof __vue_exports__.default === "object") {
__vue_options__ = __vue_exports__ = __vue_exports__.default
}
if (typeof __vue_options__ === "function") {
  __vue_options__ = __vue_options__.options
}
__vue_options__.render = __vue_template__.render
__vue_options__.staticRenderFns = __vue_template__.staticRenderFns

module.exports = __vue_exports__


/***/ },
/* 13 */
/***/ function(module, exports) {

module.exports={render:function(){with(this) {
  return _h('div', {
    attrs: {
      "id": "app"
    }
  }, [_h('navigation'), " ", " ", _h('section', {
    staticClass: "section"
  }, [_h('div', {
    staticClass: "container-small"
  }, [_h('div', {
    staticClass: "content"
  }, [_h('markdown')])])]), " ", " ", _h('myFooter')])
}},staticRenderFns: []}

/***/ },
/* 14 */
/***/ function(module, exports) {

module.exports={render:function(){with(this) {
  return _m(0)
}},staticRenderFns: [function(){with(this) {
  return _h('section', {
    staticClass: "hero is-info is-medium is-bold"
  }, [_h('div', {
    staticClass: "hero-head"
  }, [_h('header', {
    staticClass: "nav"
  }, [_h('div', {
    staticClass: "container"
  }, [_h('div', {
    staticClass: "nav-left"
  }, [_h('a', {
    staticClass: "nav-item",
    attrs: {
      "href": "http://alexsinfarosa.com"
    }
  }, [_h('span', ["alexsinfarosa.com"])])]), " ", _h('div', {
    staticClass: "nav-center"
  }, [_h('a', {
    staticClass: "nav-item",
    attrs: {
      "href": "https://github.com/alexsinfarosa"
    }
  }, [_h('span', {
    staticClass: "icon"
  }, [_h('i', {
    staticClass: "fa fa-github"
  })])]), " ", _h('a', {
    staticClass: "nav-item",
    attrs: {
      "href": "https://twitter.com/alex_sinfarosa"
    }
  }, [_h('span', {
    staticClass: "icon"
  }, [_h('i', {
    staticClass: "fa fa-twitter"
  })])])]), " ", _h('span', {
    staticClass: "nav-toggle"
  }, [_h('span'), " ", _h('span'), " ", _h('span')]), " ", _h('div', {
    staticClass: "nav-right nav-menu"
  }, [_h('a', {
    staticClass: "nav-item"
  }, ["\n            About\n          "]), " ", _h('a', {
    staticClass: "nav-item"
  }, ["\n            Posts\n          "]), " ", _h('a', {
    staticClass: "nav-item"
  }, ["\n            Projects\n          "])])])])]), " ", " ", _h('div', {
    staticClass: "hero-body"
  }, [_h('div', {
    staticClass: "container has-text-centered"
  }, [_h('h1', {
    staticClass: "title is-2"
  }, [_h('strong', ["Alex Sinfarosa"])]), " ", _h('h2', {
    staticClass: "subtitle"
  }, ["\n        Data Scientist - Developer\n      "]), " ", _h('p', ["\n        Site Under Development...\n      "])])])])
}}]}

/***/ },
/* 15 */
/***/ function(module, exports) {

module.exports={render:function(){with(this) {
  return _m(0)
}},staticRenderFns: [function(){with(this) {
  return _h('footer', {
    staticClass: "footer"
  }, [_h('div', {
    staticClass: "container"
  }, [_h('div', {
    staticClass: "content has-text-centered"
  }, [_h('p', ["\n        Alex Sinfarosa | Built with ", _h('a', {
    attrs: {
      "href": "https://vuejs.org"
    }
  }, ["VueJS"]), " and ", _h('a', {
    attrs: {
      "href": "http://bulma.io"
    }
  }, ["Bulma"])])])])])
}}]}

/***/ },
/* 16 */
/***/ function(module, exports) {

module.exports={render:function(){with(this) {
  return _m(0)
}},staticRenderFns: [function(){with(this) {
  return _h('section', [_h('h1', ["Logistic Regression Modeling of Real Estate Properties"]), " ", _h('p', [_h('img', {
    attrs: {
      "src": "src/assets/images/logistic_regression.png",
      "alt": "header image"
    }
  })]), " ", _h('p', ["I was recently tasked with discovering some additional information from a set of housing data in the upstate New York region that could help elucidate why some properties sell over others. Given two ", _h('code', ["csv"]), " files with data from active and sold properties, I immediately thought how cool it would be to build a predictive model using logistic regression! I built the whole thing in R, too, which gave me more experience with the software, and surprised me in its simplicity and power. I was limited by my dataset, as it was not as large as I would have hoped for, but nevertheless, I got right down to work."]), " ", _h('h3', ["Data Data Data..."]), " ", _h('p', ["Given the data for a particular region (where there is no need to filter the properties as the location variable is the same) I had a ", _h('code', ["csv"]), " of the properties that have sold and another one detailing the properties that remain active. The relevant characteristics of the properties were -- market price, address, days on market, square footage, acres of lot, year built, bedrooms, baths, and yearly property taxes."]), " ", _h('h3', ["Dimensionality Reduction"]), " ", _h('p', ["To build my model, it was vital to understand which variables (the characteristics of the properties listed above) contributed towards the likelihood of the property being sold (for example, is a property with higher taxes than another home close by, controlling for similarity in price and size less likely to sell?). Therefore, I did a prior examination of these relationships (essentially a dimensionality reduction, where the variables that were uncorrelated are determined as not being essential and thus omitted from the eventual model). R allows you to quickly do a scatter plot matrix of all pair-wise combinations of the variables. Having a horizontal or vertical slope was clear indication of this."]), " ", _h('p', [_h('img', {
    attrs: {
      "src": "src/assets/images/graph1.png",
      "alt": "first graph"
    }
  })]), " ", _h('p', [_h('em', ["Relation of variables of active properties: Horizontal and vertical slopes can be ruled out as having no effect on outcome, in preparation for our model."])]), " ", _h('p', ["Active Properties - The variables (in this case, market price, above ground square footage, acres, year built, bedrooms, bathrooms, and, total property taxes) can be found in a diagonal line from top left to bottom right. Each variable is then plotted against each other. For example, the first square in the second column next to the list price square, is an individual scatterplot of market price and above ground square footage, with price as the X-axis and above square footage as the Y-axis."]), " ", _h('p', ["In essence, the boxes on the upper right hand side of the whole scatterplot are mirror images of the plots on the lower left hand. In this scatterplot, we can see that there are correlations between price and taxes; year built and taxes; square footage and taxes; because the plot shows a slight slope of the lines. With a slope of zero, we have a horizontal line which indicates that there is no relationship between the variables. We see this with price and acres; square footage and acres; acres and year built; acres and taxes; bedroom count and price; square footage and bathroom count; and in in several other places as well. We also see some vertical lines, which are problematic as they indicate that there is no change in x. Thus our formula is undefined due to division by zero. Some will term this condition infinite slope, but be aware that we can’t tell if it is positive or negative infinity."]), " ", _h('p', ["Lastly, there are ambiguous or weak correlations between variables. In this case, it would be important to continue with further with additional statistical analyses and preferably a larger dataset to confirm or deny any relationships. In essence, we can remove acres, bedrooms and bath count from our logistic regression model. However I must make note that these results could also be as a result of discrete variables being visualized in a scatterplot, so as usual, further analysis is needed."]), " ", _h('p', ["Sold - Similarly as with active properties, examining the prior relationships between variables is vital, so we can rule out any potential extraneous variables in our model. Looking at the figure underneath, it is apparent that there is far more activity occurring with this dataset (which is expected as the dataset was larger). There also are interesting apparent correlations between price and square footage and taxes and square footage, relationships that were overlooked or not detectable with the active properties dataset. As previously, we see that discrete variables yield vertical slopes and horizontal slopes which are indicative of the absence of a relationship at the moment, but I should mention that there could be the possibility of lurking variables."]), " ", _h('p', [_h('img', {
    attrs: {
      "src": "src/assets/images/graph2.png",
      "alt": "second graph"
    }
  })]), " ", _h('p', [_h('em', ["Relationships between the variables of sold properties: We can rule out those variables that appear to have no effect, so we can know what variables will be more significant for the logistic model."])]), " ", _h('h3', ["The model"]), " ", _h('p', ["I tested the model for multiple predictors along with their interactions."]), " ", _h('p', ["Above Ground Square Footage + Price + Total Taxes: Testing these multiple predictors to see whether we can reject the null hypothesis (that there is no relationship between the variables) yielded a p-value of 0.00721, which indicates that this is statistically significant and unlikely to have happened purely by chance. For a few prices of the 100,000 range, a single unit change in property taxes increased the log odds of a property being sold by 3.180E-01. For homes where the log odds are sharp, it could be possible that the market price of the home does not coincide with its value. Higher priced properties had a higher log odds of being sold when there was a one unit change in square footage, which is logical."]), " ", _h('p', ["Another relationship is between taxes and square footage, increasing the log odds of a property being sold as they both change in one unit. The decreases in the log odds of properties being sold were seen with properties in the lower price range with a single unit change in taxes and square footage, -2.945E-04. This suggests that there is a boundary/threshold for square footage/property taxes that should not be crossed if a property is to be sold."]), " ", _h('p', ["Price + Year Built: For this combination, we see that the null deviance (which is the deviance when x = 0) is 181.944 whereas the residual deviance is 58.669 on 48 degrees of freedom (number of observations - number of predictor values). For every one unit change in the year the property was built, the log odds of the property being sold decreases by -9.907E -04, which signifies that as price and age increase, the odds of a property being sold decrease."]), " ", _h('p', ["Price + Total Taxes: For every one unit of change of yearly total taxes, the log odds of a property being sold increases by 6.092E-04, but it ultimately depends on the price, as there are wide variations even for similar prices, indicating that there could be some property taxes that surpass the value inferred by market price."]), " ", _h('p', ["Price + Days on Market: With one unit change in days on market (1 day); the log odds of a property being sold decreases by -4.078E-03. With a lower residual deviance than null, we can say that there is an effect of the days on the market on the property being sold, with those being on the market longer having the odds decrease. Across the board, when this occurred, it appears potential buyers are less likely to want to purchase because with a single unit change in price, there is predominantly a decrease in the odds of selling."]), " ", _h('h3', ["Predicting"]), " ", _h('p', ["The usefulness of logistic regression modeling is that it can serve as a predictor to gauge the odds that a property will sell given the predictor variables mentioned above. Given the limited nature of the data, I nevertheless decided to run the predictor function created in R: predict(mylogit, type=\"response\", newdata=newdata2) to determine whether it would correctly predict the selling of a property that was recently sold, but listed under the data as active."]), " ", _h('p', ["The result was 1, which predicts that the property does have a significant odd of being sold given the interacting predictor variables. More data would be useful in determining the accuracy of the test data used in the model."]), " ", _h('h3', ["Further work"]), " ", _h('p', ["Further work would require a larger dataset that would allow for more specific filtering the data, allowing for more precise and models with higher accuracy. The ideal method for this filtering would be the algorithm k-nearest neighbor classifier, a popular machine learning technique used for classification. Implemented beforehand with the current dataset, it yielded specific subgroups that shared similar characteristics (for example, data was classified by price and acre of property)."]), " ", _h('p', ["However, given the limited amount of data, certain groups were vastly small in size (approx. 1-2) and odd in dimensions (2 data points for unsold versus 4 data points for sold) which was indicative that the use of this algorithm would be inefficient and likely to yield incorrect results. Given the limited dataset, the method used for dimensionality reduction was not as sophisticated as it could have been, which is something that would be greatly improved with larger datasets. In addition, for greater efficiency of these machine learning algorithms, it is important to have a large training dataset for properties unsold and sold so predictions can be higher in accuracy when working with data of active properties, where one may wish to determine why a property has remained on the market for x period of time."]), " ", _h('p', ["This brings me to my last suggestion for another avenue for possible further work – having a spread-sheet of data of properties that were recently removed from being active; and to examine the model's accuracy with it's predictions. I am currently working on visualizing this data via the JavaScript library ", _h('a', {
    attrs: {
      "href": "https://d3js.org/"
    }
  }, ["d3.js."]), "."])])
}}]}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(10);

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(7);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(1)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-1!./../node_modules/sass-loader/index.js!./../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./App.vue", function() {
			var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-1!./../node_modules/sass-loader/index.js!./../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./App.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(1)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2!./../node_modules/sass-loader/index.js!./../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Nav.vue", function() {
			var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-2!./../node_modules/sass-loader/index.js!./../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Nav.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(1)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-3!./../node_modules/sass-loader/index.js!./../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./footer.vue", function() {
			var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/vue-loader/lib/style-rewriter.js?id=data-v-3!./../node_modules/sass-loader/index.js!./../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./footer.vue");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 21 */
/***/ function(module, exports) {

var g;

// This works in non-strict mode
g = (function() { return this; })();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__App_vue__);



new __WEBPACK_IMPORTED_MODULE_0_vue___default.a({
  el: '#app',
  render: h => h(__WEBPACK_IMPORTED_MODULE_1__App_vue___default.a)
});

/***/ }
/******/ ]);
//# sourceMappingURL=build.js.map