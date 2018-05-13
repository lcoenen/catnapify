"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var loggerDefaultConfig = {
    logger: console,
    input: 'info',
    output: 'debug',
    error: 'error',
    internal: 'fatal',
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
        descriptor.value = function (request) {
            config.logger[config.input]("INPUT: " + request.route.verb + " " + request.route.path, request);
            var prom = orig(request).then(function (answer) {
                config.logger[config.output]("OUTPUT: " + request.route.verb + " " + request.route.path, answer);
                // if(typeof config.watch === 'function') config.watch = config.watch(answer, config.logger);
                /*
                if (config.watch) for(let watch_var of <string[]>config.watch){
                    config.logger[config.input](answer[watch_var])
                }
                */
                return answer;
            }).catch(function (err) {
                config.logger[config.error]("ERROR: " + request.route.verb + " " + request.route.path);
                config.logger[config.error]("ERROR: We got a " + err.code + " error");
                config.logger[config.error](err.response);
                return err;
            }).catch(function (err) {
                config.logger[config.internal]("INTERNAL: " + request.route.verb + " " + request.route.path);
                config.logger[config.internal](err);
            });
            return prom;
        };
        return descriptor;
    };
}
exports.logger = logger;
