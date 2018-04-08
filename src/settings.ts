/*
 *
 * Interface representing setting for 
 * the restify server
 *
 * @interface
 *
 */
export interface Settings {

	name?: string;
	port?: number;
	host?: string;

}

export let defaultSettings = {

	name: 'catnapify-server',
	host: '127.0.0.1',
	port: 3000

}

