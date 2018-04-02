"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var restify = require("restify");
var es6_promise_1 = require("es6-promise");
function isString(x) {
    return typeof x === "string";
}
function isFunction(x) {
    return typeof x === "function";
}
function isArrayofString(x) {
    return x.filter != undefined &&
        !(x.filter(function (v) {
            return !isString(v);
        }).length);
}
/**
 *
 * Catnapify is a wrapper around restify. It implements some decorators to
 * modernify request handling.
 *
 * @namespace
 *
 */
var catnapify;
(function (catnapify) {
    var defaultSettings = {
        name: 'catnapify-server',
        host: '127.0.0.1',
        port: 3000
    };
    ;
    function isRoute(x) {
        return x.verb !== undefined && x.route !== undefined;
    }
    catnapify.isRoute = isRoute;
    function isBurrito(x) {
        return x.req !== undefined &&
            x.res !== undefined &&
            x.next !== undefined;
    }
    catnapify.isBurrito = isBurrito;
    function isHttpAnswer(ans) {
        return (ans.code !== undefined) && (ans.answer != undefined);
    }
    catnapify.isHttpAnswer = isHttpAnswer;
    ;
    function isHooks(x) {
        return x.priority !== undefined &&
            typeof x.priority == 'number' &&
            x.callback !== undefined && (typeof x.callback == 'function' ||
            typeof x == 'function');
    }
    catnapify.isHooks = isHooks;
    function isHooksTable(x) {
        var answer = true;
        for (var _i = 0, _a = ['before', 'after', 'beforeAll', 'afterAll']; _i < _a.length; _i++) {
            var field = _a[_i];
            answer = answer &&
                (x[field].filter) &&
                (!x[field].filter(function (el) {
                    return !isHooks(el);
                }).length);
        }
        return answer;
    }
    catnapify.isHooksTable = isHooksTable;
    var _defaultHooksTable = {
        before: [],
        after: [],
        beforeAll: [],
        afterAll: []
    };
    function route(first, second) {
        var thisroute = isRoute(first) ?
            first :
            { verb: first, route: second };
        return function (controller, member, descriptor) {
            var orig = descriptor.value;
            var newFun = function (api) {
                api[thisroute.verb](this.route.route, orig);
                this.route = thisroute;
            };
            descriptor.value = newFun;
            return descriptor;
        };
    }
    catnapify.route = route;
    /*
     *
     * modernify the route API
     *
     * Accept promise return
     * Recieve a burrito
     *
     * This is a decorator. Use `@modernify()` before the controller's method
     * It should be place AFTER route, given that route will include
     * his input function directly inside restify.
     *
     * Modernify will create a Burrito with the restify request, execute the decorated function
     * and expect a Promise. If the promise is resolved, the function expect a HttpAnswer of some sort.
     * This answer contain the HTTP code and the JSON object to send back to the client. The promise can also
     * be resolved with a simple object. In that case, the server will send a code 200.
     *
     * If the Promise fails or throw a HttpAnswer, it will be sent back to the client with the right code.
     * Any other case is handled by sending back a 500 (Internal server error) code.
     *
     * @note If the return Promise contain an object that's not a HttpAnswer but contain a
     * `code` propertie, you're in trouble. See the function isHttpAnswer() for more information.
     *
     */
    function modernify() {
        return function (controller, member, descriptor) {
            var orig = descriptor.value;
            var hooks = function (req, res, next) {
                var burrito = { req: req, res: res };
                burrito.route = orig.route;
                var promise = orig(burrito);
                promise.then(function (answer) {
                    if (catnapify.isHttpAnswer(answer))
                        res.json(answer.code, answer.answer);
                    else
                        res.json(200, answer);
                })["catch"](function (err) {
                    res.json(err.code, err.answer);
                })["catch"](function (err) {
                    res.json(500, err);
                });
            };
            descriptor.value = hooks;
            return descriptor;
        };
    }
    catnapify.modernify = modernify;
    function needParams(param_assert) {
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (burrito) {
                burrito.params = burrito.req.params;
                if (isString(param_assert)) {
                    if (burrito.req.params[param_assert] === undefined)
                        throw {
                            code: 400,
                            answer: "ERROR: Argument " + param_assert + " missing on route " + member
                        };
                }
                else if (isArrayofString(param_assert)) {
                    for (var _i = 0, param_assert_1 = param_assert; _i < param_assert_1.length; _i++) {
                        var param = param_assert_1[_i];
                        if (burrito.req.params[param] === undefined)
                            throw {
                                code: 400, answer: "ERROR: Argument " + param + " missing on route " + member
                            };
                    }
                }
                else {
                    if (!param_assert(burrito.req.params))
                        throw {
                            code: 400,
                            answer: "Error: route " + member + " didn't pass validation"
                        };
                }
                return orig(burrito);
            };
            return descriptor;
        };
    }
    catnapify.needParams = needParams;
    function answerParams(param_assert) {
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (burrito) {
                if (!burrito.params)
                    burrito.params = burrito.req.params;
                return orig(burrito).then(function (value) {
                    if (isString(param_assert)) {
                        if (value[param_assert] === undefined)
                            throw {
                                code: 500,
                                answer: "ERROR: Argument " + param_assert + " missing on route " + member
                            };
                    }
                    else if (isArrayofString(param_assert)) {
                        for (var _i = 0, param_assert_2 = param_assert; _i < param_assert_2.length; _i++) {
                            var param = param_assert_2[_i];
                            if (value[param] === undefined)
                                throw {
                                    code: 500, answer: "ERROR: Argument " + param + " missing on route " + member
                                };
                        }
                    }
                    else {
                        if (!param_assert(value))
                            throw {
                                code: 500,
                                answer: "Error: route " + member + " didn't pass validation"
                            };
                    }
                });
            };
            return descriptor;
        };
    }
    catnapify.answerParams = answerParams;
    /*
     *
     * Check that the route takes specifics headers.
     *
     * This is a decorator. Use
     * `@needHeader(header:string)` before the controller's method
     *
     * If the header isn't there, the decorator will throw a HttpAnswer with a 400
     * (Bad request) code. Header will be made available under burrito.headers[header].
     *
     */
    function needHeader(header) {
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (burrito) {
                if (!burrito.headers)
                    burrito.headers = {};
                var val = burrito.req.header(header);
                if (!val) {
                    throw { code: 400, answer: Error("ERROR: no header " + header + " in " + member) };
                }
                else
                    burrito.headers[header] = val;
                return orig(burrito);
            };
            return descriptor;
        };
    }
    catnapify.needHeader = needHeader;
    /*
     *
     * Check that the route have answer a specific header
     * and push this header into restify
     *
     * This is a decorator. Use
     * `@answerHeader(header: string)` before the controller's method
     *
     * If the header is not there, the decorator will throw a HttpAnswer with a 500
     * (Internal server Error) code. Headers will be grabbed from burrito.headers and
     * pushed into the `res` object of restify.
     *
     */
    function answerHeader(header) {
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (burrito) {
                return orig(burrito).then(function (answer) {
                    if (answer === undefined)
                        throw Error("ERROR: no header recieved on route " + member);
                    var val = answer.headers[header];
                    if (!val)
                        throw Error("ERROR: header " + header + " is not there on route " + member);
                    burrito.res.header(header, val);
                    return answer;
                });
            };
            return descriptor;
        };
    }
    catnapify.answerHeader = answerHeader;
    var loggerDefaultConfig = {
        logger: console,
        input: 'info',
        output: 'debug',
        error: 'error',
        internal: 'fatal',
        watch: []
    };
    /*
     *
     * Log routes input and output
     *
     * This CAN BE USED as a decorator. Apply `@logger` with or without
     * LoggerConfig argument before the function. You can also use this
     * as a standalone function. In this case, it will simply set the
     * configuration and keep it as a function property.
     *
     */
    function logger(config) {
        if (this.config === undefined)
            this.config = __assign({}, loggerDefaultConfig);
        if (this.config !== undefined)
            config = __assign({}, this.config, config);
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (burrito) {
                config.logger[config.input]("INPUT: " + burrito.route.verb + " " + burrito.route.route);
                var prom = orig(burrito).then(function (answer) {
                    config.logger[config.output]("OUTPUT: " + burrito.route.verb + " " + burrito.route.route);
                    if (typeof config.watch === 'function')
                        config.watch = config.watch(answer, config.logger);
                    if (config.watch)
                        for (var _i = 0, _a = config.watch; _i < _a.length; _i++) {
                            var watch_var = _a[_i];
                            config.logger[config.input](answer[watch_var]);
                        }
                    return answer;
                })["catch"](function (err) {
                    config.logger[config.error]("ERROR: " + burrito.route.verb + " " + burrito.route.route);
                    config.logger[config.error]("ERROR: We got a " + err.code + " error");
                    config.logger[config.error](err.answer);
                    return err;
                })["catch"](function (err) {
                    config.logger[config.internal]("INTERNAL: " + burrito.route.verb + " " + burrito.route.route);
                    config.logger[config.internal](err);
                });
                return prom;
            };
            return descriptor;
        };
    }
    catnapify.logger = logger;
    /*
     *
     * Execute the function as a before hooks
     *
     * The function will recieve a burrito and return a Promise<Burrito>,
     *
     * If the promise is resolved with a burrito, the decorated function will be called with the
     * burrito. If it's solved with a HttpResponse, it will be emited and the decorated function will
     * not be called at all. If rejected, the error workflow will continue (if it throw or reject with a HttpAnswer,
     * it will be used. Otherwise, a 500 will be sent).
     *
     * The `after` and `before` function can be used to create a new decorator from scratch.
     * Simply call `before(cb)` and assign it's return function to a variable.
     *
     */
    function before(cb) {
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (burrito) {
                cb(burrito).then(function (ans) {
                    if (isBurrito(ans))
                        return orig(ans);
                    else
                        return ans;
                });
            };
            return descriptor;
        };
    }
    catnapify.before = before;
    /*
     *
     * Execute the function as an after hooks
     *
     * The function will be called after the decorated one. It will recieve a promise with
     * the answer from the decorated, and should return a promise. Again, if the promise contains
     * a HttpAnswer, it will be used. Otherwise, a 500 will be answered and an Internal error emitted.
     *
     * (The following note is deprecated)
     *
     * This hooks is always called, even if there's an error or a fatal. The function is
     * expected to take a HttpAnswer of some sort OR an Error. It is thus hooks responsability
     * to check HTTP status. If the status of the response is a 40x or 50x, it will follow the
     * throw-catch and rejected promise flow. If it's a 20x or a 30x, or anything else, it
     * will go back to normal flow.
     *
     */
    function after(cb) {
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (answer) {
                return orig(answer).then(cb);
            };
            return descriptor;
        };
    }
    catnapify.after = after;
    /*
     * Execute the function as a catch hooks
     *
     * The function will be called after the decorated one in these case:
     *  - the decorated function answered a HttpAnswer with a code above 400
     *  - the decorated function answered a broken promise
     *  - the decorated function threw an error
     */
    // export function error<T> (cb: (HttpAnswer | Error) => Promise<HttpAnswer<T>>) {
    function error(cb) {
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (burrito) {
                var apply_cb = function (err) {
                    return cb(err).then(function (err) {
                        if (isHttpAnswer(err)) {
                            if (err.code < 400)
                                return err;
                            else {
                                throw err;
                            }
                        }
                    });
                };
                return orig(burrito).then(function (answer) {
                    if (answer.code >= 400)
                        throw answer;
                    return answer;
                })["catch"](apply_cb);
            };
            return descriptor;
        };
    }
    catnapify.error = error;
    /*
     * Execute a function before ALL routes
     *
     * The execution is supposed to takes place after all other decorators, but
     * before other `@before()` hooks (That being said, this is not a garanteed behavior).
     * The decorator can be used on the controller and on the catnapify server instance.
     *
     * One could extend the Burrito interface so he could transmit his own datas.
     * The behavior is overall the same as `before()` hooks
     *
     */
    function beforeAll(table) {
        /*
         * Quite frankly, I don't know how to implement that. If you want to help, see
         * CONTRIBUTE
         */
        // throw Error('Not implemented')
    }
    catnapify.beforeAll = beforeAll;
    /*
     *
     * Execute a function after ALL threatement.
     *
     * The execution takes place before decorators such as answerParams or answerHeader,
     * but after other `@after()` hooks. Overall, the behavior regarding error flow and
     * HttpAnswer are the same as other `@after()` hooks
     *
     */
    function afterAll(table) {
        /*
         * Quite frankly, I don't know how to implement that. If you want to help, see
         * CONTRIBUTE
         */
        throw Error('Not implemented');
    }
    catnapify.afterAll = afterAll;
    function hooks(first, second, third) {
        if (isHooksTable(first))
            this.table = this.table ? __assign({}, this.table, first) : first;
        else if (isHooks(second))
            this.table[first].push(second);
        else
            this.table[first].push({ priority: third, callback: second });
        return function (root, member, descriptor) {
            var orig = descriptor.value;
            descriptor.value = function (burrito) {
                var beforeHooks = burrito.hooks.before.concat(burrito.hooks.beforeAll)
                    .sort(function (hook) { return hook.priority; });
                var beforeHooksPromise = beforeHooks.reduce(function (promise, hooks) {
                    hooks.callback = typeof hooks == 'function' ? hooks : hooks.callback;
                    return promise.then(hooks.callback);
                }, es6_promise_1.Promise.resolve(burrito));
                return beforeHooksPromise
                    .then(orig)
                    .then(function (answer) {
                    var afterHooks = burrito.hooks.after.concat(burrito.hooks.afterAll)
                        .sort(function (hook) { return hook.priority; });
                    var afterHooksPromise = afterHooks.reduce(function (promise, hooks) {
                        hooks.callback = typeof hooks == 'function' ? hooks : hooks.callback;
                        return promise.then(hooks.callback);
                    }, es6_promise_1.Promise.resolve(answer));
                    return afterHooksPromise;
                    // return burrito.hooks.after.concat(burrito.hooks.afterAll)  
                    // 	.sort((hook: Hooks) => -hook.priority)
                    // 	.reduce((promise: Promise<Burrito>) => {
                    // 		hooks.callback = typeof hooks == 'function' ? hooks: hooks.callback;
                    // 		return promise.then(hooks.callback);
                });
            };
            return descriptor;
        };
    }
    catnapify.hooks = hooks;
    /*
     *
     * Mother class for controller
     *
     * To create a new controller, just create a child class of Controller and pass
     * the list of route method to the `super()` constructor. This will call `routes()` and
     * in turn each of the routes so they register inside restify.
     *
     */
    var Controller = /** @class */ (function () {
        function Controller(routes, server) {
            this._restapi = server.api;
            this.routes(routes);
        }
        Controller.prototype.routes = function (meths) {
            for (var _i = 0, meths_1 = meths; _i < meths_1.length; _i++) {
                var meth = meths_1[_i];
                var that = this;
                that[meth](this._restapi);
            }
        };
        return Controller;
    }());
    catnapify.Controller = Controller;
    /*
     *
     * Initialise the server
     *
     */
    var Server = /** @class */ (function () {
        function Server(settings, api) {
            this.settings = settings;
            this.api = api;
            if (!api)
                api = restify.createServer({
                    name: settings.name
                });
            restify.CORS.ALLOW_HEADERS.push('authorization');
            api.use(restify.CORS());
            api.pre(restify.pre.sanitizePath());
            api.use(restify.acceptParser(api.acceptable));
            api.use(restify.bodyParser());
            api.use(restify.queryParser());
            api.use(restify.authorizationParser());
            api.use(restify.fullResponse());
        }
        /*
         *
         * Allow to use the restify middleware API
         *
         */
        Server.prototype.use = function (restifyMiddleware) {
            this.api.use(restifyMiddleware);
        };
        /*
         *
         * Makes the server listen to incoming connection. The server will return a Promise,
         * that will resolve when restapi will start listening.
         *
         */
        Server.prototype.listen = function (settings) {
            var _this = this;
            var _sets = __assign({}, defaultSettings, settings);
            return new es6_promise_1.Promise(function (resolve, reject) {
                _this.api.listen(_sets.port, _sets.host, function (err) {
                    if (!err) {
                        resolve();
                    }
                    else
                        reject();
                });
            });
        };
        return Server;
    }());
    catnapify.Server = Server;
    ;
})(catnapify = exports.catnapify || (exports.catnapify = {}));
