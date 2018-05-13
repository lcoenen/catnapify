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
 * Combine two hooksTable
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
 */
function hooks(table) {
    return function (root, member, descriptor) {
        var orig = descriptor.value;
        descriptor.value = function (request) {
            // Execute the hooks flow
            table = combineHooksTable(hooksTableDefault, table);
            for (var _i = 0, _a = table.before; _i < _a.length; _i++) {
                var hook = _a[_i];
                request = hook(request); // Before hooks
            }
            try {
                return orig(request).then(function (answer) {
                    for (var _i = 0, _a = table.after; _i < _a.length; _i++) {
                        var hook = _a[_i];
                        answer = hook(answer);
                    }
                    return answer;
                }).catch(function (err) {
                    for (var _i = 0, _a = table.error; _i < _a.length; _i++) {
                        var hook = _a[_i];
                        try {
                            var answer = hook(err);
                            return answer;
                        }
                        catch (err) {
                            err = err;
                            continue;
                        }
                    }
                    throw err;
                });
            }
            catch (err) {
                for (var _b = 0, _c = table.error; _b < _c.length; _b++) {
                    var hook = _c[_b];
                    try {
                        var answer = hook(err);
                        return answer;
                    }
                    catch (err) {
                        err = err;
                        continue;
                    }
                }
                throw err;
            }
        };
        return descriptor;
    };
}
exports.hooks = hooks;
function before(cb) {
    return hooks({ before: cb });
}
exports.before = before;
function after(cb) {
    return hooks({ after: cb });
}
exports.after = after;
function error(cb) {
    return hooks({ error: cb });
}
exports.error = error;
