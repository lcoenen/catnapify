import { Promise } from 'es6-promise';

import { catnapify, logger, Server, Controller, Request, Answer } from '../src/catnapify';

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

describe('@logger', () => {

	it("should correctly log the request and response", (done) => {

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {}				
				let res = {

					json: function(code: Number, message: any) {
						
						expect(code).to.be.equal(200)	

					}

				}

				let next = function() {

					done()	

				}

				handler(req, res, next).catch((err: any) => done(err))

			}
		}

		let loggerMock = {

			info: function(message: string, req: any) {

				expect(message).to.be.equal(
					'INPUT: post /post'	
				)

			},

			debug: function(message: string, answer: any) {

				expect(message).to.be.equal(
					'OUTPUT: post /post'		
				)

				expect(answer.response).to.be.equal('ok')

			}

		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@logger({logger: loggerMock})
			post(request: Request) {

				return Promise.resolve({code: 200, response: 'ok'})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should correctly log the errors and fatals", (done) => {

		let i = 0;

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},
			get(route: string, handler: Function) {

				let req = {

					params: {

						foo: 'bar'	

					}

				}
				let res = {

					json: function(code: Number, message: any) {
					}

				}

				let next = function() {

					if(++i == 4) done() 

				}

				handler(req, res, next).catch((err: any) => done(err))

			}
		}

		let loggerMock = {

			error: function(message: string, answer: Answer<any>) {
			
				expect(answer.code).to.be.equal(400)
				expect(answer.response).to.be.equal('Non ok')

			},

			fatal: function(message: string, answer: Answer<any>) {
			
				expect(answer.code).to.be.equal(500)
				expect(answer.response).to.be.equal('An awful thing happened')

			}
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('get', '/error')	
			@logger({logger: loggerMock})
			error(request: Request) {

				return Promise.resolve({code: 400, response: 'Non ok'})

			}

			@catnapify('get', '/fatal')
			@logger({logger: loggerMock})
			fatal(request: Request) {
			
				throw { code: 500, response: 'An awful thing happened' }	
			
			}

			@catnapify('get', '/gentle_fatal')
			@logger({logger: loggerMock})
			gentle_fatal(request: Request) {
			
				return { code: 500, response: 'An awful thing happened'}	
			
			}

			@catnapify('get', '/hard_fatal')
			@logger({logger: loggerMock})
			hard_fatal(request: Request) {
			
				throw 'An awful thing happened';	
			
			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});

	it("should take the configuration into account", (done) => {

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {}				
				let res = {

					json: function(code: Number, message: any) {

						expect(code).to.be.equal(200)	

					}

				}

				let next = function() {

					done()	

				}

				handler(req, res, next).catch((err: any) => done(err))

			}
		}

		let loggerMock = {

			notice: function(message: string, req: any) {

				expect(message).to.be.equal(
					'INPUT: post /post'	
				)

			},

			trace: function(message: string, answer: any) {

				expect(message).to.be.equal(
					'OUTPUT: post /post'		
				)

				expect(answer.response).to.be.equal('ok')

			}

		}

		let loggerConfig = {
			logger: loggerMock,
			input: 'notice',
			output: 'trace'
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@logger(loggerConfig)
			post(request: Request) {

				return Promise.resolve({code: 200, response: 'ok'})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	});
});
