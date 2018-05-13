declare function give(param: string): any;
declare function give(params: string[]): any;
declare function give(paramsValidator: (any) => boolean): any;
declare function give(param: string, paramsValidator: (any) => boolean): any;
export { give };
