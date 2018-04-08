import { Server, Burrito, route, modernify } from '../src/catnapify';

var chai = require('chai'),
	chaiHttp = require('chai-http'),
	chaiAsPromised = require("chai-as-promised");

/* 
 * Both librairies have limited support of ES6 import.
 * See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/19480
 */

chai.use(chaiAsPromised);
chai.use(chaiHttp);

import { expect } from 'chai' ;
import 'mocha';



class testServer extends Server {

	constructor(){

		super({port: 20000})

	}	

	@route('get', '/hello')
	@modernify
	public hello(burrito: Burrito) {

		return { code: 666, answer: { message: 'hello' } }	

	}

}


describe('Server', () => {

	it('should create a server without any settings', () => {

		let serv = new Server()

	}) 

	it('should be able to return an error code', () => {

		let serv = new Server({
			name: 'test-server',
			port: 94549,
			host: '127.0.1.2'
		})

	})

	it('should answer when establishing a route', () => {

		let serv = new testServer()
		serv.listen()

	})

})
