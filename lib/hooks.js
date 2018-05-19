"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isHooksTable(x) {
    var ok = true;
    for (var key in x) {
        var found = false;
        for (var _i = 0, _a = ['before', 'after', 'error']; _i < _a.length; _i++) {
            var compare = _a[_i];
            if (key == compare)
                found = true;
        }
        ok = found && ok;
    }
    return ok;
}
/*
 *
 * Combine two hooksTable
 *
 */
function combineHooksTable(t1, t2) {
    var result = {};
    for (var _i = 0, _a = ['before', 'after', 'error']; _i < _a.length; _i++) {
        var time = _a[_i];
        var a1 = !t1[time] || t1[time] == [] ? [] : t1[time];
        var a2 = !t2[time] || t2[time] == [] ? [] : t2[time];
        a1 = Array.isArray(a1) ? a1 : [a1];
        a2 = Array.isArray(a2) ? a2 : [a2];
        result[time] = ([]).concat(a1, a2);
    }
    return result;
}
var hooksTableDefault = {
    before: [],
    after: [],
    error: []
};
/*
 *
 * Allow to establish hooks during route threatement flow.
 *
 * The function is a decorator. It can accept a HooksTable argument, and will
 * combine it with the tables from the route, from the controller and all its parent.
 *
 * Hooks can be called at three different time: before the threatement, after the threatement,
 * and in case of an error.
 *
 */
function hooks(table) {
    return function (root, member, descriptor) {
        var orig = descriptor.value;
        descriptor.value = function (request) {
            // Execute the hooks flow
            table = combineHooksTable(hooksTableDefault, table);
            /*
             *
             * Apply each promise returning a request to the next one
             *
             * Return a new promise with the final request
             *
             */
            return table.before.reduce(function (lastPromise, hook) {
                return lastPromise.then(function (request) {
                    return hook(request);
                });
            }, Promise.resolve(request))
                /*
                 *
                 * Execute the original function with the final request
                 *
                 */
                .then(function (request) {
                return orig(request);
            })
                /*
                 *
                 * Execute every after() hooks.
                 *
                 * Each of them should return a promise or an Answer object. Each of them
                 * will be applied on the next one
                 *
                 */
                .then(function (answer) {
                return table.after.reduce(function (lastPromise, hook) {
                    return lastPromise.then(function (answer) {
                        return hook(answer);
                    });
                }, Promise.resolve(answer));
            })
                /*
                 *
                 * Execute every error() hooks.
                 *
                 * Each of them will be applied on the last error response.
                 * If the hook throw an error or return a broken promise, it will continue to the next hook.
                 * If it return a correct answer, this will be returned by the decorator and no other hooks will be called
                 *
                 */
                .catch(function (error) {
                return table.error.reduce(function (lastPromise, hook) {
                    return lastPromise.catch(function (error) {
                        return hook(error);
                    });
                }, Promise.reject(error));
            });
        };
        return descriptor;
    };
}
exports.hooks = hooks;
/*
 *
 * Shortcut for the before hooks
 *
 */
function before(cb) {
    return hooks({ before: cb });
}
exports.before = before;
/*
 *
 * SHortcut for the after hooks
 *
 */
function after(cb) {
    return hooks({ after: cb });
}
exports.after = after;
/*
 *
 * Shortcut for the error hooks
 *
 */
function error(cb) {
    return hooks({ error: cb });
}
exports.error = error;
