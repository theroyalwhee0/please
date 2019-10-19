/**
 * @file Please, A Promise Helper Library.
 * @version 2.0.0
 * @author Adam Mill
 * @copyright Copyright 2019 Adam Mill
 * @license Apache-2.0
 */
'use strict';

/**
 * Imports.
 */
const setTimeoutLib=setTimeout;

/**
 * The isPromise method examines a value to determine if it is a Promise.
 * Does a ducktype check. Use instanceof only an instance check is desired.
 * @param  {any}  value The value to examine.
 * @return {boolean}       True if Promise, false if not.
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
 */
function delay(duration=1000, options={}) {
  const { setTimeout=setTimeoutLib } = options;
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

/**
 * Exports.
 * @type {Object}
 */
module.exports = {
  isPromise,
  allProps,
  delay,
};
