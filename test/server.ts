var chai = require('chai'),
		chaiHttp = require('chai-http'),
		chaiAsPromised = require("chai-as-promised");

/* 
 * Both librairies have limited support of ES6 import.
 * See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/19480
 */

chai.use(chaiAsPromised);
chai.use(chaiHttp);

import { expect } from 'chai' ;
import 'mocha';


describe('Server', () => {

	it('should answer') 
	it('should be able to return an error code')

})
