export interface Route {
    verb: string;
    path: string | RegExp;
}
export declare function isRoute(x: any): x is Route;
