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
function give(arg1, arg2) {
    return function (root, member, descriptor) {
        var orig = descriptor.value;
        descriptor.value = function (request) {
            return es6_promise_1.Promise.resolve(orig(request)).then(function (answer) {
                if (!answer_1.isAnswer(answer))
                    answer = { code: 200, response: answer };
                if (isString(arg1)) {
                    if (answer.response[arg1] === undefined)
                        throw {
                            code: 500,
                            response: "ERROR: Argument " + arg1 + " missing on answer for route " + request.route
                        };
                    else {
                        if (arg2 && !arg2(answer.response[arg1]))
                            throw {
                                code: 500,
                                response: "Error: route " + request.route.path + " answer didn't pass validation"
                            };
                    }
                }
                else if (isArrayofString(arg1)) {
                    for (var _i = 0, arg1_1 = arg1; _i < arg1_1.length; _i++) {
                        var param = arg1_1[_i];
                        if (answer.response[param] === undefined)
                            throw {
                                code: 500, response: "ERROR: argument " + param + " missing on route " + request.route.path + " answer"
                            };
                    }
                }
                else {
                    if (!arg1(answer.response))
                        throw {
                            code: 500,
                            response: "Error: route " + request.route.path + " answer didn't pass validation"
                        };
                }
                return answer;
            });
        };
        return descriptor;
    };
}
exports.give = give;
