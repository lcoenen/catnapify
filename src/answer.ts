/*
 *
 * HttpAnswer represent an answer from the handler.
 *
 * @interface
 *
 */
export interface Answer<T> {

	code: number;
	answer: T | Error;
	headers: any;

}

export function isAnswer<T>(ans: any) : ans is Answer<T> {

	return (ans.code !== undefined) && (ans.answer != undefined);	

};
