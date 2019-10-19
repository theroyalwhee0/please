/**
 * @theroyalwhee0/please:test/ispromise.spec.js
 */

/**
 * Imports.
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { isPromise } = require('../src');
chai.use(chaiAsPromised);
const { expect } = chai;

/**
 * Tests.
 */
describe('Please', () => {
  describe('isPromise', () => {
    it('should be a function', () => {
      expect(isPromise).to.be.a('function');
      expect(isPromise.length).to.equal(1);
    });
    describe('should be true for', () => {
      it('promises', () => {
        const promise = new Promise((resolve) => resolve());
        const result = isPromise(promise);
        expect(result).to.equal(true);
        return expect(promise).to.be.fulfilled;
      });
      it('promise-likes', () => {
        const promise = {
          then() { },
          catch() { },
        };
        const result = isPromise(promise);
        expect(result).to.equal(true);
        // NOTE: Not a real promise, no need to chain it.
      });
      it('rejected promises', () => {
        const promise = Promise.reject(new Error('Boom!'));
        const result = isPromise(promise);
        expect(result).to.equal(true);
        return expect(promise).to.be.rejected;
      });
    });
    describe('should be false for', () => {
      it('undefined', () => {
        const result = isPromise();
        expect(result).to.equal(false);
      });
      it('an object', () => {
        const result = isPromise({ });
        expect(result).to.equal(false);
      });
      it('the Promise class', () => {
        const result = isPromise(Promise);
        expect(result).to.equal(false);
      });
    });
  });
});
