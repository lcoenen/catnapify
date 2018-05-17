"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var restify = require("restify");
var es6_promise_1 = require("es6-promise");
var settings_1 = require("./settings");
var controller_1 = require("./controller");
/*
 *
 * Initialise the server
 *
 */
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server(settings, api, routes) {
        if (routes === void 0) { routes = []; }
        var _this = _super.call(this) || this;
        _this.settings = settings;
        _this.api = api;
        _this.link(_this);
        _this.settings = __assign({}, settings_1.defaultSettings, settings);
        if (!_this.api)
            _this.api = restify.createServer({
                name: _this.settings.name
            });
        _this.api.pre(restify.plugins.pre.sanitizePath());
        _this.api.use(restify.plugins.acceptParser(_this.api.acceptable));
        _this.api.use(restify.plugins.bodyParser({ mapParams: true }));
        _this.api.use(restify.plugins.queryParser());
        _this.api.use(restify.plugins.fullResponse());
        return _this;
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
        var _sets = __assign({}, settings_1.defaultSettings, this.settings, settings);
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
    /*
     * Link a server to a controller
     *
     * This function specialize the parent controller's link
     * in order to apply the routes to restify
     *
     */
    Server.prototype.link = function (controller) {
        this.server = this;
        _super.prototype.link.call(this, controller);
    };
    return Server;
}(controller_1.Controller));
exports.Server = Server;
;
