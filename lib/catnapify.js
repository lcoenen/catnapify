"use strict";
/**
 *
 * Catnapify is a wrapper around restify. It implements some decorators to
 * modernify request handling.
 *
 * @namespace
 *
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
exports.Server = server_1.Server;
var controller_1 = require("./controller");
exports.Controller = controller_1.Controller;
__export(require("./decorator"));
