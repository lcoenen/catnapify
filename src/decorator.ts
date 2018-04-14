import { Request, isRequest } from './request'
import { Answer, isAnswer } from './answer'

import * as restify from 'restify';

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
function catnapify<AnswerType>(verb: string, route: string) : Function {

	return function(target: any, propertyKey: string, descriptor: PropertyDescriptor){
	
		const orig = descriptor.value;

		let hooks = function (req: restify.Request, res: restify.Response, next: restify.Next) {

			console.log(`I'm inside the handler`)

			let request: Request = {req, res};

			// request.route = orig.route;

			let promise: Promise<Answer<AnswerType>> = orig(request);

			promise.then((answer: Answer<AnswerType> | AnswerType) => {

				if(isAnswer(answer))
					res.json(answer.code, answer.answer);  
				else
					res.json(200, answer)


			}).catch((err: Answer<Error>) => {

				res.json(err.code, err.answer);

			}).catch((err: Error) => {

				res.json(500, err);

			}).then(() => {

			  next()

			})

		}

		descriptor.value = hooks;
		descriptor.value._catnapify_route = { verb, route }

		return descriptor;
	
	}

}

export { catnapify };
