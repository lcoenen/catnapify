
/*
 *
 * Interface representing a route
 *
 * @interface
 *
 */
export interface Route {

	verb: string;
	path: string | RegExp;

};

export function isRoute(x: any) : x is Route {

	return x.verb !== undefined && x.path !== undefined;	

}
