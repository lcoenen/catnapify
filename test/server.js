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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var catnapify_1 = require("../src/catnapify");
var chai = require('chai'), chaiHttp = require('chai-http'), chaiAsPromised = require("chai-as-promised");
/*
 * Both librairies have limited support of ES6 import.
 * See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/19480
 */
chai.use(chaiAsPromised);
chai.use(chaiHttp);
require("mocha");
var testServer = /** @class */ (function (_super) {
    __extends(testServer, _super);
    function testServer() {
        return _super.call(this, { port: 20000 }) || this;
    }
    testServer.prototype.hello = function (burrito) {
        return { code: 666, answer: { message: 'hello' } };
    };
    __decorate([
        catnapify_1.route('get', '/hello'),
        catnapify_1.modernify
    ], testServer.prototype, "hello");
    return testServer;
}(catnapify_1.Server));
describe('Server', function () {
    it('should create a server without any settings', function () {
        var serv = new catnapify_1.Server();
    });
    it('should be able to return an error code', function () {
        var serv = new catnapify_1.Server({
            name: 'test-server',
            port: 94549,
            host: '127.0.1.2'
        });
    });
    it('should answer when establishing a route', function () {
        var serv = new testServer();
        serv.listen();
    });
});
