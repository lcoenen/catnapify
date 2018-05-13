"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
function isRoute(x) {
    return x.verb !== undefined && x.path !== undefined;
}
exports.isRoute = isRoute;
