import * as restify from 'restify';

import { Promise } from 'es6-promise';

import { Settings, defaultSettings } from './settings';

/*
 *
 * Initialise the server
 *
 */
export class Server {

	public constructor(
		public settings?: Settings,
		public api?: restify.plugins.Server	
	){

		this.settings = { ...defaultSettings, ...settings }

		if(!this.api) this.api = restify.createServer({
			name: this.settings.name
		});
		
		this.api.pre(restify.plugins.pre.sanitizePath());
		this.api.use(restify.plugins.acceptParser(this.api.acceptable));
		this.api.use(restify.plugins.bodyParser());
		this.api.use(restify.plugins.queryParser());
		this.api.use(restify.plugins.fullResponse());

	}


	/*
	 *
	 * Allow to use the restify middleware API
	 *
	 */
	public use(restifyMiddleware: any) {

		this.api.use(restifyMiddleware);	

	}

	/*
	 *
	 * Makes the server listen to incoming connection. The server will return a Promise, 
	 * that will resolve when restapi will start listening. 
	 *
	 */
	public listen(settings?: Settings): Promise<void> {

		let _sets = {...defaultSettings, ...this.settings, ...settings}; 

		return new Promise((resolve, reject) => {

			this.api.listen(_sets.port, _sets.host, function (err: Error) {

				if(!err) {

					resolve()

				}
				else reject()

			});

		})

	}

};
