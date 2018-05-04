/*
 *
 * HttpAnswer represent an answer from the handler.
 *
 * @interface
 *
 */
export interface Answer<T> {

	code: number;
	response: T | Error; // Having answer.answer is confusing. To be changed.
	headers: any;

}

export function isAnswer<T>(ans: any) : ans is Answer<T> {

	if(ans === undefined) return false;
	return (ans.code !== undefined) && (ans.response != undefined);	

};
