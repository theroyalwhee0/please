/**
 * test/findSpec.js
 */
'use strict';

/**
 * Imports.
 */
const expect = require('expect.js');
const Please = require('../index')

/**
 * Tests.
 */
describe('Please', () => {
	describe('find', () => {
		it('should be a function', () => {
			expect(Please.find).to.be.a('function');
			expect(Please.find.length).to.be(2);
		});
		it('should find the first match in an array', () => {
			return Please.find([ 1, 2, 3, 4 ], value => {
					return value % 2 === 0;
				}).then(result => {
					expect(result).to.be(2);
				})
		});
		it('should not find a match in an array', () => {
			return Please.find([ 1, 2, 3, 4 ], value => {
					return value === 9999;
				}).then(result => {
					expect(result).to.be(undefined);
				});
		});
		it('should handle an empty array', () => {
			return Please.find([ ], value => {
					return value === 0;
				}).then(result => {
					expect(result).to.be(undefined);
				});
		});
		it('should find the first match in an object', () => {
			return Please.find({ a: 2, b: 4, c: 6 }, value => {
					return value % 2 === 0;
				}).then(result => {
					expect(result).to.be(2);
				})
		});
		it('should not find a match in an object', () => {
			return Please.find({ a: 2, b: 4, c: 6 }, value => {
					return value === 9999;
				}).then(result => {
					expect(result).to.be(undefined);
				});
		});
		it('should handle an empty object', () => {
			return Please.find({ }, value => {
					return value === 0;
				}).then(result => {
					expect(result).to.be(undefined);
				});
		});
	});
});
