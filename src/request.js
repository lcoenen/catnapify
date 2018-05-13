"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isRequest(x) {
    return x.req !== undefined &&
        x.res !== undefined &&
        x.next !== undefined;
}
exports.isRequest = isRequest;
