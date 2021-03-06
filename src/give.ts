
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

function give(param: string) : any;
function give(params: string[]) : any;
function give<T>(paramsValidator: (tested: T) => boolean);
function give<T>(param: string, paramsValidator: (tested: T) => boolean);
function give<T>(arg1: string | string[] | ((tested: T) => boolean), arg2?: ((tested: T) => boolean)) {

	return function (root: any, member: string, descriptor: PropertyDescriptor) {

		const orig = descriptor.value;

		descriptor.value = function (request: Request) {

			return Promise.resolve(orig(request)).then((answer: Answer<T> | T) => {

				if(!isAnswer(answer)) answer = <Answer<T>>{code: 200, response: answer}	

				if(isString(arg1)){

					if(answer.response[arg1] === undefined) throw { 
						code: 500, 
						response: `ERROR: Argument ${ arg1 } missing on answer for route ${ request.route }`
					};

					else {	

						if(arg2 && !arg2(answer.response[arg1])) throw {
							code: 500,
							response: `Error: route ${ request.route.path } answer didn't pass validation`
						}	

					}

				}	else if (isArrayofString(arg1)) {

					for(let param of arg1) {

						if(answer.response[param] === undefined) throw { 
							code: 500, response: `ERROR: argument ${ param } missing on route ${ request.route.path } answer`
						}	

					}

				} else {

					if(!arg1(<T>answer.response)) throw {
						code: 500,
						response: `Error: route ${ request.route.path } answer didn't pass validation`
					}	

				}

				return answer;

			})

		}

		return descriptor;

	}

}

export { give };
