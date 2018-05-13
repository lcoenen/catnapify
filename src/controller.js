"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 *
 * Mother class for controller
 *
 * To create a new controller, just create a child class of Controller and pass
 * the list of route method to the `super()` constructor. This will call `routes()` and
 * in turn each of the routes so they register inside restify.
 *
 */
var Controller = /** @class */ (function () {
    function Controller() {
    }
    Controller.prototype.link = function (controller) {
        // This become the parent controller
        // For the server, the .server property is the server itself (see src/server.ts)
        controller.server = this.server;
        controller.parent = this;
        for (var key in controller) {
            var member = controller[key];
            // If the member is a route, it will be recorded inside rectify
            // (see @catnapify decorator in src/decorator.ts)
            if (member !== undefined && member._catnapify_route !== undefined)
                this.server.api[member._catnapify_route.verb](member._catnapify_route.path, member);
            /*
             * WARNING:
             *
             * The core feature of catnapify, iterating through decorated method of controler subclass, will NOT
             * work when transpiled to ES6. This is because it will be translated into a class and not into an object.
             *
             * A work around would be to declare it as an object directly.
             *
             */
        }
    };
    return Controller;
}());
exports.Controller = Controller;
