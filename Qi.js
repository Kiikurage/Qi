
(function() {
var define, requireModule, require, requirejs;

(function() {
  var registry = {}, seen = {};

  define = function(name, deps, callback) {
    registry[name] = { deps: deps, callback: callback };
  };

  requirejs = require = requireModule = function(name) {
  requirejs._eak_seen = registry;

    if (seen[name]) { return seen[name]; }
    seen[name] = {};

    if (!registry[name]) {
      throw new Error("Could not find module " + name);
    }

    var mod = registry[name],
        deps = mod.deps,
        callback = mod.callback,
        reified = [],
        exports;

    for (var i=0, l=deps.length; i<l; i++) {
      if (deps[i] === 'exports') {
        reified.push(exports = {});
      } else {
        reified.push(requireModule(resolve(deps[i])));
      }
    }

    var value = callback.apply(this, reified);
    return seen[name] = exports || value;

    function resolve(child) {
      if (child.charAt(0) !== '.') { return child; }
      var parts = child.split("/");
      var parentBase = name.split("/").slice(0, -1);

      for (var i=0, l=parts.length; i<l; i++) {
        var part = parts[i];

        if (part === '..') { parentBase.pop(); }
        else if (part === '.') { continue; }
        else { parentBase.push(part); }
      }

      return parentBase.join("/");
    }
  };
})();

define("promise/all", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */

    var isArray = __dependency1__.isArray;
    var isFunction = __dependency1__.isFunction;

    /**
      Returns a promise that is fulfilled when all the given promises have been
      fulfilled, or rejected if any of them become rejected. The return promise
      is fulfilled with an array that gives all the values in the order they were
      passed in the `promises` array argument.

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.resolve(2);
      var promise3 = RSVP.resolve(3);
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```

      If any of the `promises` given to `RSVP.all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:

      Example:

      ```javascript
      var promise1 = RSVP.resolve(1);
      var promise2 = RSVP.reject(new Error("2"));
      var promise3 = RSVP.reject(new Error("3"));
      var promises = [ promise1, promise2, promise3 ];

      RSVP.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```

      @method all
      @for RSVP
      @param {Array} promises
      @param {String} label
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
    */
    function all(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to all.');
      }

      return new Promise(function(resolve, reject) {
        var results = [], remaining = promises.length,
        promise;

        if (remaining === 0) {
          resolve([]);
        }

        function resolver(index) {
          return function(value) {
            resolveAll(index, value);
          };
        }

        function resolveAll(index, value) {
          results[index] = value;
          if (--remaining === 0) {
            resolve(results);
          }
        }

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && isFunction(promise.then)) {
            promise.then(resolver(i), reject);
          } else {
            resolveAll(i, promise);
          }
        }
      });
    }

    __exports__.all = all;
  });
define("promise/asap", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var browserGlobal = (typeof window !== 'undefined') ? window : {};
    var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
    var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

    // node
    function useNextTick() {
      return function() {
        process.nextTick(flush);
      };
    }

    function useMutationObserver() {
      var iterations = 0;
      var observer = new BrowserMutationObserver(flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    function useSetTimeout() {
      return function() {
        local.setTimeout(flush, 1);
      };
    }

    var queue = [];
    function flush() {
      for (var i = 0; i < queue.length; i++) {
        var tuple = queue[i];
        var callback = tuple[0], arg = tuple[1];
        callback(arg);
      }
      queue = [];
    }

    var scheduleFlush;

    // Decide what async method to use to triggering processing of queued callbacks:
    if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleFlush = useNextTick();
    } else if (BrowserMutationObserver) {
      scheduleFlush = useMutationObserver();
    } else {
      scheduleFlush = useSetTimeout();
    }

    function asap(callback, arg) {
      var length = queue.push([callback, arg]);
      if (length === 1) {
        // If length is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        scheduleFlush();
      }
    }

    __exports__.asap = asap;
  });
define("promise/config", 
  ["exports"],
  function(__exports__) {
    "use strict";
    var config = {
      instrument: false
    };

    function configure(name, value) {
      if (arguments.length === 2) {
        config[name] = value;
      } else {
        return config[name];
      }
    }

    __exports__.config = config;
    __exports__.configure = configure;
  });
define("promise/polyfill", 
  ["./promise","./utils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    /*global self*/
    var RSVPPromise = __dependency1__.Promise;
    var isFunction = __dependency2__.isFunction;

    function polyfill() {
      var local;

      if (typeof global !== 'undefined') {
        local = global;
      } else if (typeof window !== 'undefined' && window.document) {
        local = window;
      } else {
        local = self;
      }

      var es6PromiseSupport = 
        "Promise" in local &&
        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        "resolve" in local.Promise &&
        "reject" in local.Promise &&
        "all" in local.Promise &&
        "race" in local.Promise &&
        // Older version of the spec had a resolver object
        // as the arg rather than a function
        (function() {
          var resolve;
          new local.Promise(function(r) { resolve = r; });
          return isFunction(resolve);
        }());

      if (!es6PromiseSupport) {
        local.Promise = RSVPPromise;
      }
    }

    __exports__.polyfill = polyfill;
  });
define("promise/promise", 
  ["./config","./utils","./all","./race","./resolve","./reject","./asap","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    "use strict";
    var config = __dependency1__.config;
    var configure = __dependency1__.configure;
    var objectOrFunction = __dependency2__.objectOrFunction;
    var isFunction = __dependency2__.isFunction;
    var now = __dependency2__.now;
    var all = __dependency3__.all;
    var race = __dependency4__.race;
    var staticResolve = __dependency5__.resolve;
    var staticReject = __dependency6__.reject;
    var asap = __dependency7__.asap;

    var counter = 0;

    config.async = asap; // default async is asap;

    function Promise(resolver) {
      if (!isFunction(resolver)) {
        throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
      }

      if (!(this instanceof Promise)) {
        throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
      }

      this._subscribers = [];

      invokeResolver(resolver, this);
    }

    function invokeResolver(resolver, promise) {
      function resolvePromise(value) {
        resolve(promise, value);
      }

      function rejectPromise(reason) {
        reject(promise, reason);
      }

      try {
        resolver(resolvePromise, rejectPromise);
      } catch(e) {
        rejectPromise(e);
      }
    }

    function invokeCallback(settled, promise, callback, detail) {
      var hasCallback = isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        try {
          value = callback(detail);
          succeeded = true;
        } catch(e) {
          failed = true;
          error = e;
        }
      } else {
        value = detail;
        succeeded = true;
      }

      if (handleThenable(promise, value)) {
        return;
      } else if (hasCallback && succeeded) {
        resolve(promise, value);
      } else if (failed) {
        reject(promise, error);
      } else if (settled === FULFILLED) {
        resolve(promise, value);
      } else if (settled === REJECTED) {
        reject(promise, value);
      }
    }

    var PENDING   = void 0;
    var SEALED    = 0;
    var FULFILLED = 1;
    var REJECTED  = 2;

    function subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      subscribers[length] = child;
      subscribers[length + FULFILLED] = onFulfillment;
      subscribers[length + REJECTED]  = onRejection;
    }

    function publish(promise, settled) {
      var child, callback, subscribers = promise._subscribers, detail = promise._detail;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        invokeCallback(settled, child, callback, detail);
      }

      promise._subscribers = null;
    }

    Promise.prototype = {
      constructor: Promise,

      _state: undefined,
      _detail: undefined,
      _subscribers: undefined,

      then: function(onFulfillment, onRejection) {
        var promise = this;

        var thenPromise = new this.constructor(function() {});

        if (this._state) {
          var callbacks = arguments;
          config.async(function invokePromiseCallback() {
            invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
          });
        } else {
          subscribe(this, thenPromise, onFulfillment, onRejection);
        }

        return thenPromise;
      },

      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };

    Promise.all = all;
    Promise.race = race;
    Promise.resolve = staticResolve;
    Promise.reject = staticReject;

    function handleThenable(promise, value) {
      var then = null,
      resolved;

      try {
        if (promise === value) {
          throw new TypeError("A promises callback cannot return that same promise.");
        }

        if (objectOrFunction(value)) {
          then = value.then;

          if (isFunction(then)) {
            then.call(value, function(val) {
              if (resolved) { return true; }
              resolved = true;

              if (value !== val) {
                resolve(promise, val);
              } else {
                fulfill(promise, val);
              }
            }, function(val) {
              if (resolved) { return true; }
              resolved = true;

              reject(promise, val);
            });

            return true;
          }
        }
      } catch (error) {
        if (resolved) { return true; }
        reject(promise, error);
        return true;
      }

      return false;
    }

    function resolve(promise, value) {
      if (promise === value) {
        fulfill(promise, value);
      } else if (!handleThenable(promise, value)) {
        fulfill(promise, value);
      }
    }

    function fulfill(promise, value) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = value;

      config.async(publishFulfillment, promise);
    }

    function reject(promise, reason) {
      if (promise._state !== PENDING) { return; }
      promise._state = SEALED;
      promise._detail = reason;

      config.async(publishRejection, promise);
    }

    function publishFulfillment(promise) {
      publish(promise, promise._state = FULFILLED);
    }

    function publishRejection(promise) {
      publish(promise, promise._state = REJECTED);
    }

    __exports__.Promise = Promise;
  });
define("promise/race", 
  ["./utils","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    /* global toString */
    var isArray = __dependency1__.isArray;

    /**
      `RSVP.race` allows you to watch a series of promises and act as soon as the
      first promise given to the `promises` argument fulfills or rejects.

      Example:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 2");
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // result === "promise 2" because it was resolved before promise1
        // was resolved.
      });
      ```

      `RSVP.race` is deterministic in that only the state of the first completed
      promise matters. For example, even if other promises given to the `promises`
      array argument are resolved, but the first completed promise has become
      rejected before the other promises became fulfilled, the returned promise
      will become rejected:

      ```javascript
      var promise1 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          resolve("promise 1");
        }, 200);
      });

      var promise2 = new RSVP.Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error("promise 2"));
        }, 100);
      });

      RSVP.race([promise1, promise2]).then(function(result){
        // Code here never runs because there are rejected promises!
      }, function(reason){
        // reason.message === "promise2" because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```

      @method race
      @for RSVP
      @param {Array} promises array of promises to observe
      @param {String} label optional string for describing the promise returned.
      Useful for tooling.
      @return {Promise} a promise that becomes fulfilled with the value the first
      completed promises is resolved with if the first completed promise was
      fulfilled, or rejected with the reason that the first completed promise
      was rejected with.
    */
    function race(promises) {
      /*jshint validthis:true */
      var Promise = this;

      if (!isArray(promises)) {
        throw new TypeError('You must pass an array to race.');
      }
      return new Promise(function(resolve, reject) {
        var results = [], promise;

        for (var i = 0; i < promises.length; i++) {
          promise = promises[i];

          if (promise && typeof promise.then === 'function') {
            promise.then(resolve, reject);
          } else {
            resolve(promise);
          }
        }
      });
    }

    __exports__.race = race;
  });
define("promise/reject", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
      `RSVP.reject` returns a promise that will become rejected with the passed
      `reason`. `RSVP.reject` is essentially shorthand for the following:

      ```javascript
      var promise = new RSVP.Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      Instead of writing the above, your code now simply becomes the following:

      ```javascript
      var promise = RSVP.reject(new Error('WHOOPS'));

      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```

      @method reject
      @for RSVP
      @param {Any} reason value that the returned promise will be rejected with.
      @param {String} label optional string for identifying the returned promise.
      Useful for tooling.
      @return {Promise} a promise that will become rejected with the given
      `reason`.
    */
    function reject(reason) {
      /*jshint validthis:true */
      var Promise = this;

      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }

    __exports__.reject = reject;
  });
define("promise/resolve", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function resolve(value) {
      /*jshint validthis:true */
      if (value && typeof value === 'object' && value.constructor === this) {
        return value;
      }

      var Promise = this;

      return new Promise(function(resolve) {
        resolve(value);
      });
    }

    __exports__.resolve = resolve;
  });
define("promise/utils", 
  ["exports"],
  function(__exports__) {
    "use strict";
    function objectOrFunction(x) {
      return isFunction(x) || (typeof x === "object" && x !== null);
    }

    function isFunction(x) {
      return typeof x === "function";
    }

    function isArray(x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    }

    // Date.now is not available in browsers < IE9
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
    var now = Date.now || function() { return new Date().getTime(); };


    __exports__.objectOrFunction = objectOrFunction;
    __exports__.isFunction = isFunction;
    __exports__.isArray = isArray;
    __exports__.now = now;
  });
requireModule('promise/polyfill').polyfill();
}());

(function() {
    'use strict';

    if (window.fetch) {
        return
    }

    function Headers(headers) {
        this.map = {}

        var self = this
        if (headers instanceof Headers) {
            headers.forEach(function(name, values) {
                values.forEach(function(value) {
                    self.append(name, value)
                })
            })

        } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
                self.append(name, headers[name])
            })
        }
    }

    Headers.prototype.append = function(name, value) {
        var list = this.map[name]
        if (!list) {
            list = []
            this.map[name] = list
        }
        list.push(value)
    }

    Headers.prototype.delete = function(name) {
        delete this.map[name]
    }

    Headers.prototype.get = function(name) {
        var values = this.map[name]
        return values ? values[0] : null
    }

    Headers.prototype.getAll = function(name) {
        return this.map[name] || []
    }

    Headers.prototype.has = function(name) {
        return this.map.hasOwnProperty(name)
    }

    Headers.prototype.set = function(name, value) {
        this.map[name] = [value]
    }

    // Instead of iterable for now.
    Headers.prototype.forEach = function(callback) {
        var self = this
        Object.getOwnPropertyNames(this.map).forEach(function(name) {
            callback(name, self.map[name])
        })
    }

    function consumed(body) {
        if (body.bodyUsed) {
            return Promise.reject(new TypeError('Body already consumed'))
        }
        body.bodyUsed = true
    }

    function Body() {
        this.body = null
        this.bodyUsed = false

        this.arrayBuffer = function() {
            throw new Error('Not implemented yet')
        }

        this.blob = function() {
            var rejected = consumed(this)
            return rejected ? rejected : Promise.resolve(new Blob([this.body]))
        }

        this.formData = function() {
            return Promise.resolve(decode(this.body))
        }

        this.json = function() {
            var rejected = consumed(this)
            if (rejected) {
                return rejected
            }

            var body = this.body
            return new Promise(function(resolve, reject) {
                try {
                    resolve(JSON.parse(body))
                } catch (ex) {
                    reject(ex)
                }
            })
        }

        this.text = function() {
            var rejected = consumed(this)
            return rejected ? rejected : Promise.resolve(this.body)
        }

        return this
    }

    function Request(url, options) {
        options = options || {}
        this.url = url
        this.body = options.body
        this.credentials = options.credentials || null
        this.headers = new Headers(options.headers)
        this.method = options.method || 'GET'
        this.mode = options.mode || null
        this.referrer = null
    }

    function encode(params) {
        return Object.getOwnPropertyNames(params).filter(function(name) {
            return params[name] !== undefined
        }).map(function(name) {
            var value = (params[name] === null) ? '' : params[name]
            return encodeURIComponent(name) + '=' + encodeURIComponent(value)
        }).join('&').replace(/%20/g, '+')
    }

    function decode(body) {
        var form = new FormData()
        body.trim().split('&').forEach(function(bytes) {
            if (bytes) {
                var split = bytes.split('=')
                var name = split.shift().replace(/\+/g, ' ')
                var value = split.join('=').replace(/\+/g, ' ')
                form.append(decodeURIComponent(name), decodeURIComponent(value))
            }
        })
        return form
    }

    function isObject(value) {
        try {
            return Object.getPrototypeOf(value) === Object.prototype
        } catch (ex) {
            // Probably a string literal.
            return false
        }
    }

    function headers(xhr) {
        var head = new Headers()
        var pairs = xhr.getAllResponseHeaders().trim().split('\n')
        pairs.forEach(function(header) {
            var split = header.trim().split(':')
            var key = split.shift().trim()
            var value = split.join(':').trim()
            head.append(key, value)
        })
        return head
    }

    Request.prototype.fetch = function() {
        var self = this

        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest()

            xhr.onload = function() {
                var options = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: headers(xhr)
                }
                resolve(new Response(xhr.responseText, options))
            }

            xhr.onerror = function() {
                reject()
            }

            xhr.open(self.method, self.url)

            self.headers.forEach(function(name, values) {
                values.forEach(function(value) {
                    xhr.setRequestHeader(name, value)
                })
            })

            var body = self.body
            if (isObject(self.body)) {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                body = encode(self.body)
            }
            xhr.send(body)
        })
    }

    Body.call(Request.prototype)

    function Response(body, options) {
        this.body = body
        this.type = 'default'
        this.url = null
        this.status = options.status
        this.statusText = options.statusText
        this.headers = options.headers
    }

    Body.call(Response.prototype)

    window.fetch = function(url, options) {
        return new Request(url, options).fetch()
    }
})();
(function(exports) {
var HOST = 'https://qiita.com/api/v1';

var LOCALSTORAGE_KEY = '_Qi__access_token__'

var Param = {
    USERNAME: '{{username}}',
    TAGNAME: '{{tagname}}',
    UUID: '{{uuid}}'
};

var Url = {
    AUTH: HOST + '/auth',

    USER: HOST + '/user',
    USERS: HOST + '/users/' + Param.USERNAME,
    USERS_ITEM: HOST + '/users/' + Param.USERNAME + '/items',
    USERS_STOCK: HOST + '/users/' + Param.USERNAME + '/stocks',
    USERS_FOLLOWING_USERS: HOST + '/users/' + Param.USERNAME + '/following_users',
    USERS_FOLLOWING_TAGS: HOST + '/users/' + Param.USERNAME + '/following_tags',

    TAGS: HOST + '/tags',
    TAGS_ITEMS: HOST + '/tags/' + Param.TAGNAME + '/items',

    SEARCH: HOST + '/search',

    ITEMS: HOST + '/items',
    ITEMS_BYID: HOST + '/items/' + Param.UUID,
    ITEMS_STOCK: HOST + '/items/' + Param.UUID + '/stock',

    STOCKS: HOST + '/stocks'
};

var Status = {
    NOT_AUTHORIZED: 1,
    PENDING: 2,
    AUTHORIZED: 3
};

var
        Qi = {}, //public object
        _ = {}; //protexted object
/**
 *	extend object property (shallo copy only)
 *	@param {Object} to copy target
 *	@param {...Object} opt_srces copy sources
 *	@return copy target
 */
function extend(to, opt_srces) {
    var srces = Array.prototype.slice.call(arguments, 1),
        src, key;

    while (srces.length) {
        src = srces.shift();
        if (!src) {
            continue
        }

        for (key in src) {
            to[key] = src[key];
        }
    }

    return to
}

function encodeURLParams(params) {
    return Object.getOwnPropertyNames(params).filter(function(name) {
        return params[name] !== undefined
    }).map(function(name) {
        var value = (params[name] === null) ? '' : params[name]
        return encodeURIComponent(name) + '=' + encodeURIComponent(value)
    }).join('&').replace(/%20/g, '+')
}

function dayFormat(d) {
    var Y = d.getFullYear(),
        M = d.getMonth() + 1,
        D = d.getDate(),
        h = d.getHours(),
        m = d.getMinutes();

    return padding(Y, 4, 0) + '/' +
        padding(M, 2, 0) + ':' +
        padding(D, 2, 0) + ' ' +
        padding(h, 2, 0) + ':' +
        padding(m, 2, 0)
}

function padding(num, digit, c) {
    return ((new Array(digit)).join(arguments.length === 3 ? c : " ") + num).substr(-digit)
}

(function() {
    var token = null,
        authorizingPromise = null,
        status = Status.NOT_AUTHORIZED;

    Qi.auth = function(userName, password) {
        if (status === Status.PENDING) {
            return authorizingPromise;
        }

        status = Status.PENDING;

        authorizingPromise =
            fetch(Url.AUTH, {
                method: 'post',
                body: {
                    url_name: userName,
                    password: password
                }
            })
            .then(function(res) {
                return res.json();
            })
            .then(function(json) {
                token = json.token;
                status = Status.AUTHORIZED;
                authorizingPromise = null;
            });

        return authorizingPromise
    };

    Qi.getState = function() {
        var text;
        switch (status) {
            case Status.NOT_AUTHORIZED:
                text = 'NOT_AUTHORIZED';
                break;

            case Status.PENDING:
                text = 'PENDING';
                break;

            case Status.AUTHORIZED:
                text = 'AUTHORIZED';
                break;
        }

        return {
            status: status,
            text: text
        }
    };

    Qi.initWithToken = function(authToken) {
        token = authToken;
        status = Status.AUTHORIZED;
    };

    Qi.saveToken = function() {
        if (status !== Status.AUTHORIZED) {
            throw new Error('Not authorized.');
            return false
        }

        localStorage.setItem(LOCALSTORAGE_KEY, token);
    };

    Qi.initWithLocalStorage = function() {
        token = localStorage.getItem(LOCALSTORAGE_KEY);
        if (token) {
            status = Status.AUTHORIZED
        } else {
            status = Status.NOT_AUTHORIZED
        }

        return status === Status.AUTHORIZED
    };

    _.getToken = function() {
        return token;
    };
}());


(function() {
    _.fetch = function(url, option) {
        var status = Qi.getState();
        option = option || {}

        if (status.status === Status.AUTHORIZED) {
            option.urlParams = extend({}, option.urlParams, {
                token: _.getToken()
            });
        }

        return fetchCore(url, option)
    };

    _.fetchWithToken = function(url, option) {
        var status = Qi.getState();

        option = option || {};

        if (status.status !== Status.AUTHORIZED) {
            throw new Error('not authorized.')
        }

        option.urlParams = extend({}, option.urlParams, {
            token: _.getToken()
        });

        return fetchCore(url, option);
    };

    _.fetchWithoutToken = function(url, option) {
        return fetchCore(url, option || {});
    };

    function fetchCore(url, option) {
        if (option.urlParams) {
            url = url + '?' + encodeURLParams(option.urlParams);
        }

        // option = extend(option, {
        // });

        return fetch(url, option)
    }
}());


function User(data) {
    if (!(this instanceof User)) {
        return new User(data)
    }

    data = data || {};

    this.name = data.name || '';
    this.urlName = data.url_name || '';
    this.profileImageUrl = data.profile_image_url || '';
    this.description = data.description || '';
    this.websiteUrl = data.website_url || '';
    this.organization = data.organization || '';
    this.location = data.location || '';
    this.facebook = data.facebook || '';
    this.linkedin = data.linkedin || '';
    this.twitter = data.twitter || '';
    this.github = data.github || '';
    this.followersCount = data.followers || 0;
    this.followingUsersCount = data.following_users || 0;
    this.items = data.items || 0;

    //TODO: implement
    /**
     *	data.teamsは配列
     *	オブジェクトなので値のディープコピーが必要
     */
    this.teams = [];
}

User.me = function() {
    return _
        .fetchWithToken(Url.USER)
        .then(function(res) {
            return res.json();
        })
        .then(function(json) {
            return new User(json);
        })
};

User.getByName = function(name) {
    return _
        .fetch(Url.USERS
            .replace(Param.USERNAME, name))
        .then(function(res) {
            return res.json();
        })
        .then(User)
};

User.prototype.getItems = function() {
    //TODO: next
    return _
        .fetch(
            Url.USERS_ITEM
            .replace(Param.USERNAME, this.urlName)
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })
};

User.prototype.getStocks = function() {
    //TODO: next
    return _
        .fetch(
            Url.USERS_STOCK
            .replace(Param.USERNAME, this.urlName)
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })
};

User.prototype.getFollowingUsers = function() {
    //TODO: next
    return _
        .fetch(
            Url.USERS_FOLLOWING_USERS
            .replace(Param.USERNAME, this.urlName)
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(User)
        })
};

User.prototype.getFollowingTags = function() {
    //TODO: next
    return _
        .fetch(
            Url.USERS_FOLLOWING_TAGS
            .replace(Param.USERNAME, this.urlName)
        )
        .then(function(res) {
            return res.json();
        })
};

Qi.User = User;

function Item(data) {
    if (!(this instanceof Item)) {
        return new Item(data)
    }

    if (!(data)) {
        throw new Error('Item constructor must be called with data object.');
    }

    var localItem = Item.localItems[data.uuid];
    if (localItem) {
        localItem.updateLocal(data);
        return localItem;
    }

    Item.localItems[data.uuid] = this;
    this.updateLocal(data);
}

Item.localItems = {};

Item.prototype.updateLocal = function(data) {
    this.id = data.id || 0;
    this.uuid = data.uuid || '';
    this.user = data.user ? new User(data.user) : null;
    this.title = data.title || '';
    this.body = data.body || '';
    this.created = {
        date: (data.created_at ? new Date(data.created_at) : null),
        word: (data.created_at_in_words || '')
    };
    this.updated = {
        date: (data.updated_at ? new Date(data.updated_at) : null),
        word: (data.updated_at_in_words || '')
    };
    this.tags = data.tags ? data.tags.slice(0) : [];
    this.stockCount = data.stock_count || 0;
    this.stockUsers = data.stock_users ? data.stock_users.slice(0) : [];
    this.commentCount = data.comment_count || 0;
    this.url = data.url || '';
    this.gistUrl = data.gist_url || '';
    this.tweet = data.tweet || false;
    this.private = data.private || false;
    this.stocked = data.stocked || false;
    this.comments = data.comments ? data.comments.map(Qi.Comment) : [];

    this.created.word2 = this.created.date ? dayFormat(this.created.date) : '';
    this.updated.word2 = this.updated.date ? dayFormat(this.updated.date) : '';
}
Qi.Item = Item;

Item.prototype.stock = function() {
    var self = this;

    this.stocked = true;
    this.stockCount++;

    return _
        .fetch(Url.ITEMS_STOCK
            .replace(Param.UUID, this.uuid), {
                method: 'PUT'
            })
        .catch(function(err) {
            self.stocked = false;
            self.stockCount--;
            throw err
        })
};

Item.prototype.unstock = function() {
    var self = this;

    this.stocked = false;
    this.stockCount--;

    return _
        .fetch(Url.ITEMS_STOCK
            .replace(Param.UUID, this.uuid), {
                method: 'DELETE'
            })
        .catch(function(err) {
            self.stocked = true;
            self.stockCount++;
            throw err
        })
};

Item.getMyStocks = function() {
    return _
        .fetchWithToken(Url.STOCKS)
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })

    //TODO:Next
};

Item.search = function(query) {
    return _
        .fetch(Url.SEARCH, {
            urlParams: {
                q: query
            }
        })
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })

    //TODO:Next
};

Item.new = function() {
    return _
        .fetchWithoutToken(Url.ITEMS)
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })

    //TODO:Next
};

Item.getByTag = function(tag) {
    if (!tag) {
        throw new Error('"Item.getByTag" must be passed one parameter');
    }

    return _
        .fetch(
            Url.TAGS_ITEMS
            .replace(Param.TAGNAME, tag)
        )
        .then(function(res) {
            return res.json();
        })
        .then(function(jsons) {
            return jsons.map(Item);
        })

    //TODO:Next
};

Item.getById = function(uuid) {
    if (!uuid) {
        throw new Error('"Item.getById" must be passed one parameter');
    }

    return _
        .fetch(Url.ITEMS_BYID
            .replace(Param.UUID, uuid))
        .then(function(res) {
            return res.json();
        })
        .then(function(json) {
            return new Item(json);
        })
};

Item.prototype.update = function() {
    var self = this;
    return Item
        .getById(this.uuid)
        .then(function(newItem) {
            extend(self, newItem);
            return self
        });
}


function Comment(data) {
    if (!(this instanceof Comment)) {
        return new Comment(data)
    }

    data = data || {};

    this.id = data.id || 0;
    this.uuid = data.uuid || '';
    this.user = new User(data.user);
    this.body = data.body || '';
}
Qi.Comment = Comment;
exports.Qi = Qi;

}(this));