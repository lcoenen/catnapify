declare function need(param: string): any;
declare function need(params: string[]): any;
declare function need(paramsValidator: (any) => boolean): any;
declare function need(param: string, paramsValidator: (any) => boolean): any;
export { need };
