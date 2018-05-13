declare function need(param: string): any;
declare function need(params: string[]): any;
declare function need<T>(paramsValidator: (T) => boolean): any;
declare function need<T>(param: string, paramsValidator: (T) => boolean): any;
export { need };
