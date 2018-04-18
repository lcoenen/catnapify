import { Promise } from 'es6-promise';

import { catnapify, need, Server, Controller, Request } from '../src/catnapify';

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

describe('@need', () => {

	it("should fail with a 400 if the parameter is not there", (done) => {

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

			let req = {}
			let res = {

				json: function(code: Number, message: any) {
		
						expect(code).to.be.equal(400)	

					}

				}

				let next = function() {

					done()	

				}

				handler(req, res, next)

			}
		}
		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@need('data')
			post(request: Request) {

				return Promise.resolve({code: 200, answer: 'ok'})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should respond a 200 if the data is there", (done) => {

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {
					params: {
						data: 'this is test data'	
					}	
				}
				let res = {

					json: function(code: Number, message: any) {

						expect(code).to.be.equal(200)	
						expect(message.data).to.be.equal('this is test data');
					}

				}

				let next = function() {

					done()	

				}

				handler(req, res, next)

			}
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@need('data')
			post(request: Request) {

				return Promise.resolve({code: 200, answer: {status: 'ok', data: request.params.data}})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should accept an array of parameters", (done) => {

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {
					params: {
						data: 'this is test data',
						date: '21/12/1499'
					}	
				}
				let res = {

					json: function(code: Number, message: any) {

						expect(code).to.be.equal(200)	
						expect(message.data).to.be.equal('this is test data in 21/12/1499');

					}

				}

				let next = function() {

					done()	

				}

				handler(req, res, next)

			}
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@need(['data'])
			post(request: Request) {

				let data = `${ request.params.data } in ${ request.params.date }`
				return Promise.resolve({code: 200, answer: {status: 'ok', data}})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should accept a validator for a specific parameter", (done) => {

		interface Doggo {
			race: string;	
			name: string;
			good_doggo: boolean;
		}

		function isGoodDoggo(doggo: any) : boolean {
			return doggo.good_doggo;	
		}

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {
					params: {
						doggo: {
							race: 'Pit bull',
							name: 'Headeater',
							good_doggo: false
						}
					}	
				}
				let res = {

					json: function(code: Number, message: any) {

						expect(code).to.be.equal(400)

						/* Headeater is a bad doggo :( */

					}

				}

				let next = function() {

					done()	

				}

				handler(req, res, next)

			}
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@need('doggo', isGoodDoggo)
			post(request: Request) {

				return Promise.resolve({code: 200, answer: {status: 'ok', data: request.params.data}})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});


});
