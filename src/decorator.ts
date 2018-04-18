import { Promise } from 'es6-promise';

import { Request, isRequest } from './request'
import { Answer, isAnswer } from './answer'

import * as restify from 'restify';

function isString(x: any): x is string {
	return typeof x === "string";
}

function isFunction(x: any): x is Function {
	return typeof x === "function";
}

function isArrayofString(x: any): x is String[] {
	return x.filter != undefined &&
		!(x.filter((v:any) => {
			return !isString(v);	
		}).length)
}

/*
 * Establish a route inside a controler
 *
 * This is a decorator. Use 
 * `@route('verb', '/api/route')` before a controller's method
 *
 * This replace the function with one that record the route in restify according to
 * the route parameters. 
 *
 */
function catnapify<AnswerType>(verb: string, path: string) : Function {

	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor){

		const orig = descriptor.value;

		let hooks = function (req: restify.Request, res: restify.Response, next: restify.Next) {

			let request: Request = {req, res, route: {verb, path}};

			let promise: Promise<Answer<AnswerType>>;

			try {

				promise = Promise.resolve(orig(request));

			} catch(err) {

				promise = Promise.reject(err);

			}

			promise.then((answer: Answer<AnswerType> | AnswerType) => {

				if(isAnswer(answer))
					res.json(answer.code, answer.answer);  
				else
					res.json(200, answer)


			}).catch((err: Answer<Error>) => {

				if(isAnswer(err)) {
					res.json(err.code, err.answer);
				}
				else
					res.json(500, err);

			}).then(() => {

				next()

			})

		}

		descriptor.value = hooks;
		descriptor.value._catnapify_route = { verb, path }

		return descriptor;

	}

}

function need(param: string) : any;
function need(params: string[]) : any;
function need<T>(paramsValidator: (T) => boolean);
function need<T>(param: string, paramsValidator: (T) => boolean);
function need<T>(arg1: string | string[] | ((T) => boolean), arg2?: ((T) => boolean)) {

	return function (root: any, member: string, descriptor: PropertyDescriptor) {

		const orig = descriptor.value;

		descriptor.value = function (request: Request) {

			request.params = request.req.params ? request.req.params: {};	

			if(isString(arg1)){

				if(request.params[arg1] === undefined) throw { 
					code: 400, 
					answer: `ERROR: Argument ${ arg1 } missing on route ${ request.route }`
				};

				else {	

					if(arg2 && !arg2(request.params)) throw {
						code: 400,
						answer: `Error: route ${ request.route } didn't pass validation`
					}	

				}

			}	else if (isArrayofString(arg1)) {

				for(let param of arg1) {

					if(request.params[param] === undefined) throw { 
						code: 400, answer: `ERROR: Argument ${ param } missing on route ${ request.route }`
					}	

				}

			} else {

				if(!arg1(request.params)) throw {
					code: 400,
					answer: `Error: route ${ request.route } didn't pass validation`
				}	

			}

			return Promise.resolve(orig(request));

		}

		return descriptor;

	}

}

function answer(param: string) : any;
function answer(params: string[]) : any;
function answer<T>(paramsValidator: (T) => boolean);
function answer<T>(param: string, paramsValidator: (T) => boolean);
function answer<T>(arg1: string | string[] | ((T) => boolean), arg2?: ((T) => boolean)) {

	return function (root: any, member: string, descriptor: PropertyDescriptor) {

		const orig = descriptor.value;

		descriptor.value = function (request: Request) {

			return Promise.resolve(orig(request)).then((answer: Answer<T>) => {

				if(isString(arg1)){

					if(answer.answer[arg1] === undefined) throw { 
						code: 500, 
						answer: `ERROR: Argument ${ arg1 } missing on answer for route ${ request.route }`
					};

					else {	

						if(arg2 && !arg2(answer.answer[arg1])) throw {
							code: 500,
							answer: `Error: route ${ request.route } answer didn't pass validation`
						}	

					}

				}	else if (isArrayofString(arg1)) {

					for(let param of arg1) {

						if(answer.answer[param] === undefined) throw { 
							code: 500, answer: `ERROR: argument ${ param } missing on route ${ request.route } answer`
						}	

					}

				} else {

					if(!arg1(answer)) throw {
						code: 500,
						answer: `Error: route ${ request.route } answer didn't pass validation`
					}	

				}

				return answer;

			})

		}

		return descriptor;

	}

}


export { catnapify, need, answer };
