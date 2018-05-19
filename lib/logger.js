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
var answer_1 = require("./answer");
var loggerDefaultConfig = {
    logger: console,
    input: 'info',
    output: 'debug',
    error: 'error',
    internal: 'fatal',
};
//if(property.env.NODE_ENV != 'production') loggerDefaultConfig.output = 'info';
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
            var _log_internal_error = function (error) {
                config.logger[config.internal]("INTERNAL: " + request.route.verb + " " + request.route.path + " (" + request.req.path() + "; guru meditation)");
                config.logger[config.internal](error);
            };
            config.logger[config.input]("INPUT: " + request.route.verb + " " + request.route.path + " (" + request.req.path() + ")");
            config.logger[config.input](request.req.params);
            if (process.env.NODE_ENV != 'production')
                config.logger.trace(request);
            try {
                var prom = orig(request).then(function (answer) {
                    config.logger[config.output]("OUTPUT: " + request.route.verb + " " + request.route.path + " (" + request.req.path() + ")", answer);
                    return answer;
                }).catch(function (err) {
                    config.logger[config.error]("ERROR: " + request.route.verb + " " + request.route.path + " (" + request.req.path() + ")");
                    config.logger[config.error]("ERROR: We got a " + err.code + " error");
                    config.logger[config.error](err.response);
                    return err;
                }).catch(function (err) {
                    _log_internal_error(err);
                });
                return prom;
            }
            catch (err) {
                _log_internal_error(err);
                if (!answer_1.isAnswer(err))
                    err = { code: 500, response: err };
                return Promise.reject(err);
            }
        };
        return descriptor;
    };
}
exports.logger = logger;
