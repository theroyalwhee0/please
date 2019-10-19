/**
 * @theroyalwhee0/please:test/allprops.spec.js
 */

/**
 * Imports.
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { allProps } = require('../src');
chai.use(chaiAsPromised);
const { expect } = chai;

/**
 * Test.
 */
describe('Please', () => {
  describe('allProps', () => {
    it('should be a function', () => {
      expect(allProps).to.be.a('function');
      expect(allProps.length).to.equal(1);
    });
    if('should resolve an object as an object', async () => {
      const input = {
        a: Promise.resolve(1),
        bb: Promise.resolve(200),
        ccc: Promise.resolve('3000'),
      };
      const pm = allProps(input);
      expect(pm).to.be.a('promise');
      const results = await pm;
      expect(results).to.be.an('object');
      expect(results).to.deep.equal({
        a: 1,
        bb: 200,
        ccc: '3000',
      });
    });
    it('should reject if not given argument', async () => {
      return expect(allProps()).to.be.rejectedWith(Error, '"promises" must be an object');
    });
    it('should reject if any promise rejects', async () => {
      const input = {
        a: Promise.resolve(1),
        bb: Promise.reject(new Error('"bb" rejected')),
        ccc: Promise.reject(new Error('"ccc" rejected')),
      };
      const pm = allProps(input);
      expect(pm).to.be.a('promise');
      return expect(pm).to.be.rejectedWith(Error, '"bb" rejected');
    });
  });
});
