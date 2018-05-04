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
 * Combine two hooksTable
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
 */
function hooks(table: HooksTable) {

	return function(root: any, member: string, descriptor: PropertyDescriptor){

		let orig = descriptor.value;
		descriptor.value = function(request: Request) {

			// Execute the hooks flow


			table = combineHooksTable(hooksTableDefault, table)	

			for(let hook of <beforeHook[]>table.before){

				request = hook(request) // Before hooks

			} 

			try {

				return orig(request).then((answer: Answer<any>) => {

					for(let hook of <afterHook[]>table.after){

						answer = hook(answer)

					} 

					return answer;

				}).catch((err: any) => {

					for(let hook of <errorHook[]>table.error) {

						try { 

							let answer: Answer<any> = hook(err)
							return answer;

						} catch(err) {

							err = err;
							continue;	

						}

					}	

					throw err;

				})

			} catch (err) {

				for(let hook of <errorHook[]>table.error) {

					try { 

						let answer: Answer<any> = hook(err)
						return answer;

					} catch(err) {

						err = err;
						continue;	

					}

				}	

				throw err;

			}

		}

		return descriptor;

	}

}

function before(cb: Function) {


	return hooks(<HooksTable>{before: cb})


}

function after(cb: Function) {

	return hooks(<HooksTable>{after: cb})

}

function error(cb: Function) {

	return hooks(<HooksTable>{error: cb})

}


export { Hook, HooksTable, hooks, before, after, error }
