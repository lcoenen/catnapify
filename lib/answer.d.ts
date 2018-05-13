export interface Answer<T> {
    code: number;
    response: T | Error;
    headers: any;
}
export declare function isAnswer<T>(ans: any): ans is Answer<T>;
