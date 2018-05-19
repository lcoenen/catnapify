import { Request, isRequest } from './request'
import { Answer, isAnswer } from './answer'

interface Hook {

	priority?: number;

}

interface beforeHook extends Hook {

	(request: Request) : Request;

}

interface afterHook extends Hook {

	(answer: Answer<any>) : Answer<any>;

}

interface errorHook extends Hook {

	(error: any) : Answer<any>;

}

interface HooksTable {

	before?: Hook | Hook[];
	after?: Hook | Hook[];
	error?: Hook | Hook[];

}

function isHooksTable(x:any) : x is HooksTable {


	let ok: boolean = true;
	for(let key in x) {


		let found: boolean = false;
		for(let compare of ['before', 'after', 'error'])
			if(key == compare) found = true;
		ok = found && ok;	

	}

	return ok;

}

/*
 *
 * Combine two hooksTable
 *
 */
function combineHooksTable(t1: HooksTable, t2: HooksTable) {


	let result: HooksTable = {};

	for(let time of ['before', 'after', 'error']) {

		let a1 = !t1[time] || t1[time] == [] ? [] : t1[time] 
		let a2 = !t2[time] || t2[time] == [] ? [] : t2[time] 

		a1 = Array.isArray(a1) ? a1 : [a1]
		a2 = Array.isArray(a2) ? a2 : [a2]

		result[time] = ([]).concat(a1, a2)

	}

	return result;

}


let hooksTableDefault: HooksTable = {

	before: [],
	after: [],
	error: []

}

/*
 *
 * Allow to establish hooks during route threatement flow.
 *
 * The function is a decorator. It can accept a HooksTable argument, and will 
 * combine it with the tables from the route, from the controller and all its parent.
 *
 * Hooks can be called at three different time: before the threatement, after the threatement,
 * and in case of an error. 
 *
 */
function hooks(table: HooksTable) {

	return function(root: any, member: string, descriptor: PropertyDescriptor){

		let orig = descriptor.value;
		descriptor.value = function(request: Request) {

			// Execute the hooks flow


			table = combineHooksTable(hooksTableDefault, table)	

			/*
			 *
			 * Apply each promise returning a request to the next one
			 *
			 * Return a new promise with the final request
			 *
			 */
			return (<beforeHook[]>table.before).reduce((lastPromise, hook) => {

				return lastPromise.then((request: Request) => {

					return hook(request)  

				}) 

			}, Promise.resolve(request))

			/*
			 *
			 * Execute the original function with the final request
			 *
			 */
				.then((request: Request) => {

					return orig(request)   

				})

			/* 
			 *
			 * Execute every after() hooks. 
			 *
			 * Each of them should return a promise or an Answer object. Each of them
			 * will be applied on the next one
			 *
			 */
				.then((answer: Answer<any>) => {

					return (<afterHook[]>table.after).reduce((lastPromise, hook) => {

						return lastPromise.then((answer: Answer<any>) => {

							return hook(answer)  

						})  

					}, Promise.resolve(answer))  

				})

			/*
			 *
			 * Execute every error() hooks.
			 *
			 * Each of them will be applied on the last error response.
			 * If the hook throw an error or return a broken promise, it will continue to the next hook. 
			 * If it return a correct answer, this will be returned by the decorator and no other hooks will be called
			 *
			 */
				.catch((error: any) => {

					return (<errorHook[]>table.error).reduce((lastPromise, hook) => {

						return lastPromise.catch((error: any) => {

							return hook(error); 

						})  

					}, Promise.reject(error))

				})

		}

		return descriptor;

	}

}


/*
 *
 * Shortcut for the before hooks
 *
 */
function before(cb: Function) {


	return hooks(<HooksTable>{before: cb})


}

/*
 *
 * SHortcut for the after hooks
 *
 */
function after(cb: Function) {

	return hooks(<HooksTable>{after: cb})

}

/*
 *
 * Shortcut for the error hooks
 *
 */
function error(cb: Function) {

	return hooks(<HooksTable>{error: cb})

}


export { Hook, HooksTable, hooks, before, after, error }
