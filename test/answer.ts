import { Promise } from 'es6-promise';

import { catnapify, answer, Server, Controller, Request } from '../src/catnapify';

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

const restifyMockBase = {

	acceptable: '',
	use: function(middleware: any) {},
	pre: function(middleware: any) {},

};


describe('@answer', () => {

	it("should fail with a 500 if the parameter is not answered", (done) => {

		let restifyMock = {
			...restifyMockBase,
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {}
				let res = {

					json: function(code: Number, message: any) {

						expect(code).to.be.equal(500)	

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
			@answer('doggo')
			post(request: Request) {

				return Promise.resolve({code: 200, answer: 'ok'})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should respond the data if it's there", (done) => {

		let restifyMock = {
			...restifyMockBase,
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {
				}
				let res = {

					json: function(code: Number, message: any) {
						expect(code).to.be.equal(200)	
						expect(message.data).to.be.equal('Hello world!');
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
			@answer('data')
			post(request: Request) {

				return Promise.resolve({code: 200, answer: {data: 'Hello world!'}})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should also accept it if the data isn't in a promise", (done) => {

		let restifyMock = {
			...restifyMockBase,
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {
				}
				let res = {

					json: function(code: Number, message: any) {
						expect(code).to.be.equal(200)	
						expect(message.data).to.be.equal('Hello world!');
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
			@answer('data')
			post(request: Request) {

				return {code: 200, answer: {data: 'Hello world!'}}

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should accept an array of data", (done) => {

		let restifyMock = {
			...restifyMockBase,
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {
				}
				let res = {

					json: function(code: Number, message: any) {
						expect(code).to.be.equal(200)	
						expect(message.data).to.be.equal('Hello world!');
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
			@answer(['data', 'id'])
			post(request: Request) {

				return Promise.resolve({code: 200, answer: {id: 42, data: 'Hello world!'}})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should accept a validator for a specific answer", (done) => {

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
						}	
					}
					let res = {

						json: function(code: Number, message: any) {

							expect(code).to.be.equal(500)

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
				@answer('doggo', isGoodDoggo)
				post(request: Request) {

					return Promise.resolve({code: 200, answer: {
							doggo: {
								race: 'Pit bull',
								name: 'Headeater',
								good_doggo: false
							}}})

				}

			} 

			let serv = new Server({}, restifyMock);

			let testController = new TestController();
			serv.link(testController);

		});


});
