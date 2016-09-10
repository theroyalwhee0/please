/**
 * iterableSpec.js
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
	describe('iterable', () => {
		it('should be a function', () => {
			expect(Please.iterable).to.be.a('function');
			expect(Please.iterable.length).to.be(1);
		});
		it('should get a value from an array', () => {
			const collection = [ 1, 2, 3, 4 ];
			const next = Please.iterable(collection);
			expect(next).to.be.a('function');
			const result = next();
			expect(result).to.be.an('object');
			expect(result.collection).to.be(collection);
			expect(result.length).to.be(collection.length);
			expect(result.value).to.be(1);
			expect(result.key).to.be(0);
			expect(result.idx).to.be(0);
		});
		it('should get each value from an array', () => {
			const collection = [ 2, 4, 6 ];
			let next = Please.iterable(collection);
			// Index 0.
			let result = next();
			expect(result.value).to.be(2);
			expect(result.key).to.be(0);
			expect(result.idx).to.be(0);
			// Index 1.
			result = next();
			expect(result.value).to.be(4);
			expect(result.key).to.be(1);
			expect(result.idx).to.be(1);
			// Index 2.
			result = next();
			expect(result.value).to.be(6);
			expect(result.key).to.be(2);
			expect(result.idx).to.be(2);
			// Done.
			result = next();
			expect(result).to.be(undefined);
		});
		it('should get a value from an object', () => {
			const collection = { a: 1, b: 2, c: 3 };
			const next = Please.iterable(collection);
			expect(next).to.be.a('function');
			const result = next();
			expect(result).to.be.an('object');
			expect(result.collection).to.be(collection);
			expect(result.length).to.be(3);
			expect(result.value).to.be(1);
			expect(result.key).to.be('a');
			expect(result.idx).to.be(0);
		});
		it('should get each value from an object', () => {
			const collection = { dog: 'woof', cat: true, bird: 999 };
			let next = Please.iterable(collection);
			// Index 0.
			let result = next();
			expect(result.value).to.be('woof');
			expect(result.key).to.be('dog');
			expect(result.idx).to.be(0);
			// Index 1.
			result = next();
			expect(result.value).to.be(true);
			expect(result.key).to.be('cat');
			expect(result.idx).to.be(1);
			// Index 2.
			result = next();
			expect(result.value).to.be(999);
			expect(result.key).to.be('bird');
			expect(result.idx).to.be(2);
			// Done.
			result = next();
			expect(result).to.be(undefined);
		});
		it('should throw if given null', () => {
			expect(() => {
				Please.iterable(null);
			}).to.throwException(/^Can not iterate over \"null\" \(object\)$/i);
		});
		it('should throw if given nothing', () => {
			expect(() => {
				Please.iterable();
			}).to.throwException(/^Can not iterate over \"undefined\" \(undefined\)$/i);
		});
		it('should throw if given a string', () => {
			expect(() => {
				Please.iterable("Boom! This is also too long and will be cut.");
			}).to.throwException(/^Can not iterate over \"Boom! This is also t\" \(string\)$/i);
		});
	});
});
