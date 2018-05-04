
import { Promise } from 'es6-promise';

import { catnapify, give, Server, Controller, Request, Answer } from '../src/catnapify';

import { HooksTable , hooks, before, after, error } from '../src/hooks'

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

interface TestRequest extends Request { foo: string; xyzzy: string; }


describe('@hooks', () => {

	it("should accept a before hook", (done) => {

		let restifyMock = {
			...restifyMockBase,
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

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@hooks(<HooksTable>{before: function(request: TestRequest){

				request.foo = 'bar'
				return request;	

			}})
			post(request: TestRequest) {

				expect(request.foo).to.be.equal('bar')
				return Promise.resolve({code: 200, give: 'ok'})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);


	});

	it("should execute the after hook", function(done){

		let restifyMock = {

			...restifyMockBase,
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {}
				let res = {

					json: function(code: Number, message: any) {
				

						expect(code).to.be.equal(200)	
						expect(message).to.be.equal('all right')

					}

				}

				let next = function() {

					done()	

				}

				handler(req, res, next).catch((err: any) => done(err))

			}
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@hooks(<HooksTable>{after: function(answer: Answer<any>){

				expect(answer.response).to.be.equal('ok')
				answer.response = 'all right'
				return answer;	

			}})
			post(request: TestRequest) {

				return Promise.resolve({code: 200, response: 'ok'})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	})

	it("should execute the catch hook", function(done){

		let restifyMock = {

			...restifyMockBase,
			post(route: string, handler: Function) {

				expect(route).to.be.equal('/post')

				let req = {}
				let res = {

					json: function(code: Number, message: any) {

						expect(code).to.be.equal(200)	
						expect(message).to.be.equal('all right')

					}

				}

				let next = function() {

					done()	

				}

				handler(req, res, next).catch((err: any) => done(err))

			}
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@hooks(<HooksTable>{after: function(answer: Answer<any>){

				expect(answer.response).to.be('ok')
				answer.response = 'all right'
				return answer;	

			}, 
				error: function(err: Answer<any>){

					expect(err.response).to.be.equal('not ok')				
					expect(err.code).to.be.equal(588)

					return 'all right';

				}})
			post(request: TestRequest) {

				throw {code: 588, response: 'not ok'}

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	})
	it("should understand the shortcut", function(done){

		let restifyMock = {
			...restifyMockBase,
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

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@before(function(request: TestRequest){

				request.foo = 'bar'
				return request;	

			})
			post(request: TestRequest) {

				expect(request.foo).to.be.equal('bar')
				return Promise.resolve({code: 200, give: 'ok'})

			}

		} 

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	})

	/* 
	 * This unfortunately cannot be done. I have no access to the instance from
	 * inside the decorator. Thus, I cannot access the server.
	 */

	// it("should execute hooks from higher-level controller", (done) => {

	// 	let restifyMock = {
	// 		...restifyMockBase,
	// 		post(route: string, handler: Function) {

	// 			expect(route).to.be.equal('/post')

	// 			let req = {}
	// 			let res = {

	// 				json: function(code: Number, message: any) {

	// 					expect(code).to.be.equal(200)	

	// 				}

	// 			}

	// 			let next = function() {

	// 				done()	

	// 			}

	// 			handler(req, res, next).catch((err: any) => done(err))

	// 		}
	// 	}

	// 	class TestController extends Controller {

	// 		constructor(){ super() }	

	// 		@hooks('before')
	// 		beforeAll(request: TestRequest){

	// 			request.foo = 'bar'
	// 			return request;	

	// 		}

	// 		@catnapify('post', '/post')	
	// 		@before(function(request: TestRequest){

	// 			request.xyzzy = 'waldo'	
	// 			return request;

	// 		})
	// 		post(request: TestRequest) {

	// 			expect(request.xyzzy).to.be.equal('waldo')
	// 			expect(request.foo).to.be.equal('bar')
	// 			return Promise.resolve({code: 200, give: 'ok'})

	// 		}

	// 	} 

	// 	let serv = new Server({}, restifyMock);

	// 	let testController = new TestController();
	// 	serv.link(testController);


	// })

});
