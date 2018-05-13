import { Server } from './server';
export declare class Controller {
    server: Server;
    parent: Controller;
    constructor();
    link(controller: Controller): void;
}
