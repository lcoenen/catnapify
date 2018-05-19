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

			return promise.then((answer: Answer<AnswerType> | AnswerType) => {

				if(isAnswer(answer))
					res.json(answer.code, answer.response);  
				else
					res.json(200, answer)


			}).catch((err: Answer<Error>) => {

				if(isAnswer(err)) {
					res.json(err.code, err.response);
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

export { give } from './give';
export { need } from './need';
export { logger } from './logger'

export { before, after, error } from './hooks'

export { catnapify };
