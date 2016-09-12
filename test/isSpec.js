/**
 * test/isSpec.js
 */
'use strict';

/**
 * Imports.
 */
const expect = require('expect.js');
const Please = require('../index');

/**
 * Tests.
 */
describe('Please', () => {
	describe('isPromise', () => {
		it('should be a function', () => {
			expect(Please.isPromise).to.be.a('function');
			expect(Please.isPromise.length).to.be(1);
		});
		it('should be true for promises', () => {
			const promise = new Promise(resolve => resolve());
			const result = Please.isPromise(promise);
			expect(result).to.be(true);
		});
		it('should be true for rejected promises', () => {
			const promise = Promise.reject(new Error('Boom!'));
			const result = Please.isPromise(promise);
			expect(result).to.be(true);
		});
		it('should be false for undefined', () => {
			const result = Please.isPromise();
			expect(result).to.be(false);
		});
		it('should be false for an object', () => {
			const result = Please.isPromise({ });
			expect(result).to.be(false);
		});
		it('should be false for Promise class', () => {
			const result = Please.isPromise(Promise);
			expect(result).to.be(false);
		});
	});
});
