import * as restify from 'restify';
import { Route } from './route';
import { HooksTable } from './hooks';
export interface Request {
    req: restify.Request;
    res: restify.Response;
    next?: restify.Next;
    params?: any;
    headers?: any;
    route: Route;
    hooks?: HooksTable;
}
export declare function isRequest(x: any): x is Request;
