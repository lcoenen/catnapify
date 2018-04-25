
import { Request, isRequest } from './request'
import { Answer, isAnswer } from './answer'

/*
 *
 * Interface for logger configuration
 *
 * This interface explains the @logger decorator how to log things.
 * Especially, it is used to know to which level it should log request, 
 * answers and errors into bunyan.
 * 
 * @interface
 *
 * @properties logger The logger used. Can be a bunyan or anything else that implement methods
 * 		correspondings to the differents levels of log
 * @property input Logging of incoming requests from clients (default: info)
 * @property output Logging of routes response (default: debug)
 * @property error Logging of server error (400 types, default: error)
 * @property internal Logging of internal error or assertions error, unhandled throw,... (default: fatal)
 *
 */
interface LoggerConfig {

	logger: any;
	input?: string;
	output?: string;
	error?: string;
	internal?: string;

}

let loggerDefaultConfig: LoggerConfig = {

	logger: console,
	input: 'info',
	output: 'debug',
	error: 'error',
	internal: 'fatal',

}

/*
 *
 * Log routes input and output
 *
 * This CAN BE USED as a decorator. Apply `@logger` with or without 
 * LoggerConfig argument before the function. You can also use this
 * as a standalone function. In this case, it will simply set the 
 * configuration and keep it as a function property.
 * 
 */
export function logger<T>(config?: LoggerConfig){

	if(this.config === undefined) this.config = { ...loggerDefaultConfig};
	if(this.config !== undefined) config = {...this.config, ...config};

	return function (root: any, member: string, descriptor: PropertyDescriptor) {

		const orig = descriptor.value;

		descriptor.value = function(request: Request){

			config.logger[config.input](`INPUT: ${ request.route.verb } ${ request.route.path }`, request)
			let prom: Promise<Answer<T>> = orig(request).then((answer: Answer<T>) => {

				config.logger[config.output](`OUTPUT: ${ request.route.verb } ${ request.route.path }`, answer)	
				
				// if(typeof config.watch === 'function') config.watch = config.watch(answer, config.logger);

				/*
				if (config.watch) for(let watch_var of <string[]>config.watch){
					config.logger[config.input](answer[watch_var])	
				}
				*/

				return answer;

			}).catch((err: Answer<T>) => {

				console.log(`l. 81`)
				console.log(err)

				config.logger[config.error](`ERROR: ${ request.route.verb } ${ request.route.path }`)  
				config.logger[config.error](`ERROR: We got a ${ err.code } error`)
				config.logger[config.error](err.response)
				return err;

			}).catch((err: Error) => {

				console.log(err)

				console.log(`l. 87 ${ config.internal }`)

				config.logger[config.internal](`INTERNAL: ${ request.route.verb } ${ request.route.path }`)	
				config.logger[config.internal](err)

			})

			return prom;			

		}

		return descriptor;

	}

}

