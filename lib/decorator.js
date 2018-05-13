"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var es6_promise_1 = require("es6-promise");
var answer_1 = require("./answer");
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
/*
 * Establish a route inside a controler
 *
 * This is a decorator. Use
 * `@route('verb', '/api/route')` before a controller's method
 *
 * This replace the function with one that record the route in restify according to
 * the route parameters.
 *
 */
function catnapify(verb, path) {
    return function (target, propertyKey, descriptor) {
        var orig = descriptor.value;
        var hooks = function (req, res, next) {
            var request = { req: req, res: res, route: { verb: verb, path: path } };
            var promise;
            try {
                promise = es6_promise_1.Promise.resolve(orig(request));
            }
            catch (err) {
                promise = es6_promise_1.Promise.reject(err);
            }
            return promise.then(function (answer) {
                if (answer_1.isAnswer(answer))
                    res.json(answer.code, answer.response);
                else
                    res.json(200, answer);
            }).catch(function (err) {
                if (answer_1.isAnswer(err)) {
                    res.json(err.code, err.response);
                }
                else
                    res.json(500, err);
            }).then(function () {
                next();
            });
        };
        descriptor.value = hooks;
        descriptor.value._catnapify_route = { verb: verb, path: path };
        return descriptor;
    };
}
exports.catnapify = catnapify;
var give_1 = require("./give");
exports.give = give_1.give;
var need_1 = require("./need");
exports.need = need_1.need;
var logger_1 = require("./logger");
exports.logger = logger_1.logger;
