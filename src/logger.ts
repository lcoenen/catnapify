
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
export interface LoggerConfig {

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

//if(property.env.NODE_ENV != 'production') loggerDefaultConfig.output = 'info';

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

			let _log_error = function(error: any) {

				if(isAnswer(error) && error.code < 500) {
				
					config.logger[config.error](`ERROR: ${ request.route.verb } ${ request.route.path } (${ request.req.path() })`)  
					config.logger[config.error](`ERROR: We got a ${ error.code } error`)
					config.logger[config.error](error.response)
				
				}
				else {

					config.logger[config.internal](`INTERNAL: ${ request.route.verb } ${ request.route.path } (${ request.req.path() }; guru meditation)`)	
					config.logger[config.internal](error)

				}

				if(!isAnswer(error)) error = {code: 500, response: error}
				return Promise.reject(error)
			
			}

			config.logger[config.input](`INPUT: ${ request.route.verb } ${ request.route.path } (${ request.req.path() })`)
			config.logger[config.input](request.req.params)
			if(process.env.NODE_ENV != 'production') config.logger.trace(request)

			try {
			
					let prom: Promise<Answer<T>> = orig(request).then((answer: Answer<T>) => {

					config.logger[config.output](`OUTPUT: ${ request.route.verb } ${ request.route.path } (${ request.req.path() })`, answer)	
					
					return answer;

				}).catch((err: Error) => {

					return _log_error(err);

				})

				return prom;			

			}
			catch(err) {

				return _log_error(err);

			}
			
		}

		return descriptor;

	}

}

