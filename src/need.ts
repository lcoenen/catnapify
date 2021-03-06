
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

function need(param: string) : any;
function need(params: string[]) : any;
function need<T>(paramsValidator: (tested: T) => boolean);
function need<T>(param: string, paramsValidator: (tested: T) => boolean);
function need<T>(arg1: string | string[] | ((tested: T) => boolean), arg2?: ((tested: T) => boolean)) {

	return function (root: any, member: string, descriptor: PropertyDescriptor) {

		const orig = descriptor.value;

		descriptor.value = function (request: Request) {

			request.params = request.req.params ? request.req.params: {};	

			if(isString(arg1)){

				if(request.params[arg1] === undefined) throw { 
					code: 400, 
					response: `ERROR: Argument ${ arg1 } missing on route ${ request.route.path }`
				};

				else {	

					if(arg2 && !arg2(request.params)) throw {
						code: 400,
						response: `Error: route ${ request.route.path } didn't pass validation`
					}	

				}

			}	else if (isArrayofString(arg1)) {

				for(let param of arg1) {

					if(request.params[param] === undefined) throw { 
						code: 400, response: `ERROR: Argument ${ param } missing on route ${ request.route.path }`
					}	

				}

			} else {

				if(!arg1(request.params)) throw {
					code: 400,
					response: `Error: route ${ request.route.path } didn't pass validation`
				}	

			}

			return Promise.resolve(orig(request));

		}

		return descriptor;

	}

}

export { need }
