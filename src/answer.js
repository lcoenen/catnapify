"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAnswer(ans) {
    if (ans === undefined)
        return false;
    return (ans.code !== undefined) && (ans.response != undefined);
}
exports.isAnswer = isAnswer;
;
