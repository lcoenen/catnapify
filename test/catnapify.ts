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

describe('@catnapify', () => {

	it('should call the right function in restify', (done) => {

		let restifyMock = {
			acceptable: '',
			use: function(middleware: any) {},	
			pre: function(middleware: any) {},
			get(route: string, handler: Function) {

				expect(route).to.be.equal('/ping')

				let req = {}
				let res = {

					json: function(code: Number, message: any) {

						expect(code).to.be.equal(270)	
						expect(message).to.be.equal('pong')	

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

			@catnapify('get', '/ping')	
			ping() {

				return Promise.resolve({code: 270, answer: 'pong'})

			}

		}	

		let serv = new Server({}, restifyMock);

		let testController = new TestController();
		serv.link(testController);

	})


})

