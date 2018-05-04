import { Promise } from 'es6-promise';

import { Server } from './server';

/*
 *
 * Mother class for controller
 *
 * To create a new controller, just create a child class of Controller and pass
 * the list of route method to the `super()` constructor. This will call `routes()` and
 * in turn each of the routes so they register inside restify.
 *
 */
export class Controller {

	public server: Server; 
	public parent: Controller;

	constructor(){
	}

	public link(controller: Controller) {

		// This become the parent controller
		// For the server, the .server property is the server itself (see src/server.ts)

		controller.server = this.server;
		controller.parent = this;

		for(let key in controller) {

			let member = controller[key];

			// If the member is a route, it will be recorded inside rectify
			// (see @catnapify decorator in src/decorator.ts)

			if(member !== undefined && member._catnapify_route !== undefined)
				this.server.api[member._catnapify_route.verb](member._catnapify_route.path, member)

		}

	}	

}
