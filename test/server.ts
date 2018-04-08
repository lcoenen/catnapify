import { Server } from '../src/catnapify';

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


describe('Server', () => {

	it('should create a server without any settings', () => {

		let serv = new Server()

		expect(serv.settings.name).to.be.equal('catnapify-server')

	}) 

	it('should create a server with defined parameters', () => {

		let serv = new Server({
			name: 'test-server',
			port: 94549
		})

		expect(serv.settings.port).to.be.equal(94549)
		expect(serv.settings.host).to.be.equal('127.0.0.1')

	})

	it('should accept a random restify instance and tell it to listen', () => {

		let called : boolean = false;
		const port = 32423;

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},	
			listen: function(port: number, host: string, cb: Function) {
				expect(port).to.be.equal(port)
				expect(host).to.be.equal('192.179.12.1')
				called = true;
				cb()
			}
		}

		let serv = new Server({	
			port: port,
			host: '192.179.12.1'
		}, restifyMock)
			
		return serv.listen().then(() => {

		 	expect(called).to.be.equal(true)

		})

	})

})
