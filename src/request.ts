import * as restify from 'restify';

import { Route } from './route'

import { HooksTable } from './hooks'

/*
 *
 *	Wrapper around Restify request, response and next type
 *	
 *	@interface
 *
 */
export interface Request {

	req: restify.Request;
	res: restify.Response;
	next?: restify.Next;
	params?: any;
	headers?: any;
	route: Route;
	hooks?: HooksTable;
	// hooks?: HooksTable;

}

export function isRequest(x: any) : x is Request {

	return x.req !== undefined &&
		x.res !== undefined &&
		x.next !== undefined;

}

