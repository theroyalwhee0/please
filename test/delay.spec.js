/**
 * @theroyalwhee0/please:test/delay.spec.js
 */

/**
 * Imports.
 */
const { spy, describe, it, expect } = require('./testing');
const { delay } = require('../src');

/**
 * Tests.
 */
describe('Please', () => {
  describe('delay', () => {
    it('should be a function', () => {
      expect(delay).to.be.a('function');
      expect(delay.length).to.equal(0);
      // NOTE: Argument is defaulted.
    });
    it('should resolve everything correctly', async () => {
      const setTimeout = spy((cb, duration) => {
        expect(cb).to.be.a('function');
        expect(duration).to.equal(1000);
        cb();
      });;
      const pm = delay(undefined, { setTimeout });
      expect(pm).to.be.a('promise');
      const results = await pm;
      expect(setTimeout.callCount).to.equal(1);
      expect(results).to.equal(undefined);
    });
    it('should delay for a moment', async () => {
      const beforeDate = Date.now();
      const pm = delay(20);
      expect(pm).to.be.a('promise');
      const results = await pm;
      const afterDate = Date.now();
      expect(results).to.equal(undefined);
      // NOTE: The time difference can be rounded down to be less than 20, add one to it.
      expect((afterDate-beforeDate)+1).to.be.at.least(20);
    });
  });
});
