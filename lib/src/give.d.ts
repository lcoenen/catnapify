declare function give(param: string): any;
declare function give(params: string[]): any;
declare function give<T>(paramsValidator: (tested: T) => boolean): any;
declare function give<T>(param: string, paramsValidator: (tested: T) => boolean): any;
export { give };
