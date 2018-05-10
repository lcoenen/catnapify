# catnapify

![catnapify logo](https://github.com/lcoenen/catnapify/raw/master/logo.png)
[![Build Status](https://travis-ci.org/lcoenen/catnapify.svg?branch=master)](https://travis-ci.org/lcoenen/catnapify)

Catnapify is a pretty, decorated wrapper around [restify](https://github.com/restify/node-restify). Using brand new, [ES6](https://www.typescriptlang.org/docs/handbook/decorators.html) decorators, It allows developpers to move logic such as data validation, logging and sourcing datas. It is typescript ready and promise based. It also support hooks and header validation. 

## Try it out

Install with the usual 

    npm install catnapify --save

Then, create a server and a simple route:

    import { Server, catnapify } from 'catnapify';

    constructor(){ super() }	

		class MyServer extends Server {
		
			@catnapify('get', '/ping')	
			ping(request: Request) {
			
				return 'pong'	
			
			}
		
		
		}
		
		let serv = new MyServer;
		serv.listen()

That's it! No need to register the route. You can add middleware using the same API as in restify (using `use()`), and pass a customer restify instance to Server constructor. Notice that you can link a server to a `Controller` instance using `.link()`. The example above works because Server is itself inheritating from the Controller class. 

## Chaining

The decorated function must accept a `Request` object. This object is a wrapper around the usual `req`, `res`, `done` triplet, and is used to store custom data as well. 
It must return either a `Response` (which would follow a pattern `{code: XXX, answer: {}}`) or a simple object (in this case, the HTTP code 200 would be used). The function can also 
throw a `Response`, which would be correctly interpreted by the catnapify instance. The `Response` can or cannot be wrapped in a Promise (which allow for asynchrone threatement such as grabbing data from MongoDB)

## Need and give

A weakness of restify is that it force the coder to check incoming and outgoing variable on everyroute. Catnapify prevent that by providing the `give()` and `need()` decorator. 
Both of them accept a variable name, an array of variable name, or a variable name and a validator, like in this exemple:


		interface Doggo {
        race: string;	
        name: string;
        good_doggo: boolean;
		}

		function isGoodDoggo(doggo: any) : boolean {
        return doggo.good_doggo;	
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@give('doggo', isGoodDoggo)
			post(request: Request) {

				return Promise.resolve({code: 200, give: {
						doggo: {
							race: 'Pit bull',
							name: 'Headeater',
							good_doggo: false
						}}})

			}

		}

If the route is not called with the right request parameters, catnapify will answer a 400 BAD REQUEST HTTP response. 
	
## Logger

Logger link to a [bunzyan](https://www.npmjs.com/package/bunyan) instance to log inbound and outbound stream. It can be linked with a `loggerConfig` instance to set in which stream the 'input', 'output', 'error' and 'internal' error will be showed.

		let loggerConfig = {
			logger: loggerMock,
			input: 'notice',
			output: 'trace'
		}

		class TestController extends Controller {

			constructor(){ super() }	

			@catnapify('post', '/post')	
			@logger(loggerConfig)
			post(request: Request) {

				return Promise.resolve({code: 200, response: 'ok'})

			}

		} 

## Hooks

Catnapify also add a support for Hooks. It can execute function before or after the decorated function, and in case of an error. 

			@catnapify('post', '/post')	
			@before(function(request: TestRequest){

				request.foo = 'bar'
				return request;	

			})
			post(request: TestRequest) {

				expect(request.foo).to.be.equal('bar')
				return Promise.resolve({code: 200, give: 'ok'})

			}
