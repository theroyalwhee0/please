/**
 * @theroyalwhee0/please:test/catchas.spec.js
 */

/**
 * Imports.
 */
const { describe, it, expect } = require('./testing');
const { catchAs } = require('../src');

/**
 * Tests.
 */
describe('Please', () => {
  describe('catchAs', () => {
    it('should be a function', () => {
      expect(catchAs).to.be.a('function');
      expect(catchAs.length).to.equal(2);
    });
    it('should pass through resolved promises', async () => {
      const pm = new Promise((resolve) => {
        resolve(1337);
      });
      const value = await catchAs(pm, 100);
      expect(value).to.equal(1337);
    });
    it('should pass through non-promises', async () => {
      const value = await catchAs(8585, 100);
      expect(value).to.equal(8585);
    });
    it('should catch rejected promises', async () => {
      const pm = new Promise((_resolve, reject) => {
        reject(new Error('Boom!'));
      });
      const value = await catchAs(pm, 300);
      expect(value).to.equal(300);
    });
    it('should default to undefined', async () => {
      const pm = new Promise((_resolve, reject) => {
        reject(new Error('Boom!'));
      });
      const value = await catchAs(pm);
      expect(value).to.equal(undefined);
    });
  });
});
