declare function need(param: string): any;
declare function need(params: string[]): any;
declare function need<T>(paramsValidator: (tested: T) => boolean): any;
declare function need<T>(param: string, paramsValidator: (tested: T) => boolean): any;
export { need };
