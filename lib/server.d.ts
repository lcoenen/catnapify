import * as restify from 'restify';
import { Promise } from 'es6-promise';
import { Settings } from './settings';
import { Controller } from './controller';
export declare class Server extends Controller {
    settings: Settings;
    api: restify.Server;
    constructor(settings?: Settings, api?: restify.Server, routes?: string[]);
    use(restifyMiddleware: any): void;
    listen(settings?: Settings): Promise<void>;
    link(controller: Controller): void;
}
