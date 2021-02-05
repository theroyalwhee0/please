/**
 * @file Please, A Promise Helper Library.
 * @version v2.0.4
 * @author Adam Mill <hismajesty@theroyalwhee.com>
 * @copyright Copyright 2019-2021 Adam Mill
 * @license Apache-2.0
 */

/**
 * Imports.
 * @ignore
 */
const setTimeoutLib=setTimeout;

/**
 * The isPromise method examines a value to determine if it is a Promise.
 * Does a ducktype check. Use instanceof only an instance check is desired.
 * @param  {any}  value The value to examine.
 * @returns {boolean}  True if Promise, false if not.
 */
function isPromise(value) {
  return !!(
  	// Instance check.
    value instanceof Promise || (
      // Ducktype check.
      value
      && typeof value === 'object'
      && typeof value.then === 'function'
      && typeof value.catch === 'function'
    )
  );
};

/**
 * Like Promise.all over an object.
 * @param {Object<any,Promise>} promises An object with promises as values.
 * @returns {Object<any,any>} A new object with the resolved promise values mapped to keys.
 */
async function allProps(promises) {
  if(!(promises && typeof promises === 'object')) {
    throw new Error(`"promises" must be an object`);
  }
  const keys = Object.keys(promises);
  const values = Object.values(promises);
  const results = await Promise.all(values);
  return keys.reduce((mapped, key, idx) => {
    mapped[key] = results[idx];
    return mapped;
  }, {});
}

/**
 * Delay for given ms.
 * @param {number} duration The duration in ms.
 * @param {object} options Options. Optional.
 * @returns {Promise<undefined>} Resolves after delay.
 */
function delay(duration=1000, options={}) {
  const { setTimeout=setTimeoutLib } = options;
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/**
 * Catch rejections and resolve to a given value.
 * @param {Promise} promise The promise to operate on.
 * @param {any} rejectValue The value to resolve to if a rejection occurs.
 * @returns {Promise<any>} The resolved value or the reject value if rejected.
 */
function catchAs(promise, rejectValue) {
  return Promise.resolve(promise)
    .catch(() => {
      return rejectValue;
    });
}

/**
 * Exports.
 */
module.exports = {
  isPromise,
  allProps,
  delay,
  catchAs,
};
