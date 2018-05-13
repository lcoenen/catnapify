"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
function need(arg1, arg2) {
    return function (root, member, descriptor) {
        var orig = descriptor.value;
        descriptor.value = function (request) {
            request.params = request.req.params ? request.req.params : {};
            if (isString(arg1)) {
                if (request.params[arg1] === undefined)
                    throw {
                        code: 400,
                        response: "ERROR: Argument " + arg1 + " missing on route " + request.route
                    };
                else {
                    if (arg2 && !arg2(request.params))
                        throw {
                            code: 400,
                            response: "Error: route " + request.route + " didn't pass validation"
                        };
                }
            }
            else if (isArrayofString(arg1)) {
                for (var _i = 0, arg1_1 = arg1; _i < arg1_1.length; _i++) {
                    var param = arg1_1[_i];
                    if (request.params[param] === undefined)
                        throw {
                            code: 400, response: "ERROR: Argument " + param + " missing on route " + request.route
                        };
                }
            }
            else {
                if (!arg1(request.params))
                    throw {
                        code: 400,
                        response: "Error: route " + request.route + " didn't pass validation"
                    };
            }
            return es6_promise_1.Promise.resolve(orig(request));
        };
        return descriptor;
    };
}
exports.need = need;
