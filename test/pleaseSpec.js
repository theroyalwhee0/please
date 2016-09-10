/**
 * pleaseSpec.js
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
	it('should be a namespace', () => {
		expect(Please).to.be.an('object');
	});
	it('should have a version number', () => {
		expect(Please.version).to.match(/^\d+\.\d+\.\d+$/);
	});
});
