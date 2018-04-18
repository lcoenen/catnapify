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

	constructor(){
	}

	public link(controller: Controller) {

		controller.server = this.server;

		for(let key in controller) {

			let member = controller[key];

			try {

				this.server.api[member._catnapify_route.verb](member._catnapify_route.path, member)

			} catch {}	

		}

	}	

}
