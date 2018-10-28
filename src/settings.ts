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
	host: '0.0.0.0',
	port: 3000

}

