/**
 * index.js
 */
'use strict';

/**
 * Imports.
 */
const pkg = require('./package.json');

/**
 * Constants.
 */
const version = pkg.version;

/**
 * Symbols.
 */
const STOP = { '<sym>': 'stop' };

/**
 * Is value a function?
 * @param  {Any}  value Type to check.
 * @return {Boolean}       True if function, false otherwise.
 */
function isFunction(value) {
	return typeof value === 'function';
}

/**
 * Is the value a promise?
 * @param  {Any}  value The value to check.
 * @return {Boolean}       True if promise, false if not.
 */
function isPromise(value) {
	return !!(
			value instanceof Promise	// Instance check.
			|| ( 											// Ducktype.
				value
				&& typeof value === 'object'
				&& typeof value.then === 'function'
				&& typeof value.catch === 'function'
			)
		);
}

/**
 * Execute action while condition is not met.
 * Like a do { } while() loop. The condition is evaluated after the loop.
 * @param  {Function|Any} initial   The initial value, if Function call and use value.
 * @param  {Function} condition Condition test, if returns false stop looping.
 * @param  {Function} action    Action to execute. Results passed to condition and next aciton.
 * @return {Promise}           Resolves when condition met.
 */
function _do(initial, condition, action) {
	if(arguments.length === 1) {
		// Supplying the action function.
		action = initial;
		condition = (value, idx) => {
			// NOTE: Must skip first condition check or it will stop immediatly.
			return !!(idx === 0 ? true : value)
		};
		initial = undefined;
	} else if(arguments.length === 2) {
		// Supplying initial value and action functions.
		action = condition;
		condition = (value, idx) => { return !!value };
	} else {
		const conditionOriginal = condition;
		condition = (value, idx) => {
			if(idx === 0) {
				return true;
			}
			// The first condition check is skipped so adjust the index.
			return conditionOriginal(value, idx-1)
		};
	}
	return _while(initial, condition, action);
}

/**
 * Execute action while condition is not met.
 * Like a while() { } loop. The condition is evaluated before the loop.
 * @param  {Function|Any} initial   The initial value, if Function call and use value.
 * @param  {Function} condition Condition test, if returns false stop looping.
 * @param  {Function} action    Action to execute. Results passed to condition and next aciton.
 * @return {Promise}           Resolves when condition met.
 */
function _while(initial, condition, action) {
	if(arguments.length === 1) {
		// Supplying the action function.
		action = initial;
		condition = (value, idx) => {
			// NOTE: Must skip first condition check or it will stop immediatly.
			return !!(idx === 0 ? true : value)
		};
		initial = undefined;
	} else if(arguments.length === 2) {
		// Supplying initial value and action functions.
		action = condition;
		condition = (value, idx) => { return !!value };
	}
	function tick(value, idx, resolve, reject) {
		Promise.resolve(condition(value, idx))
			.then(result => {
				if(result) {
					Promise.resolve(action(value, idx))
						.then((result) => {
							global.setImmediate(() => {
								tick(result, idx+1, resolve, reject);
							});
							return null;
						}).catch(reject);
				} else {
					resolve(value);
				}
				return null;
			}).catch(reject);
	};
	return new Promise((resolve, reject) => {
		Promise.resolve(isFunction(initial) ? initial() : initial)
			.then(value => {
				tick(value, 0, resolve, reject);
				return null;
			}).catch(reject);
		return null;
	});
};

/**
 * The find method returns a value in the collection, if an element in
 * the collection satisfies the provided testing function. Otherwise undefined is returned.
 * Similar to Array.find.
 * REF: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
 * @param  {Iterable} collection      Collection to search.
 * @param  {Function} condition Condition test function. Should return true if match, otherwise false.
 * @return {Promise}           Resolves when found or end of collection is reached.
 */
function find(collection, condition) {
	const next = iterable(collection);
	return _do(undefined, item => {
			if(item === STOP) {
				return false;
			}
			return Promise.resolve(condition(item.value, item.key))
				.then(result => {
					return !result;
				});
		}, () => {
			const item = next();
			if(item === undefined) {
				return STOP;
			}
			return Promise.resolve(item.value) // Resolve this, it may be a promise.
				.then(() => { return item; });
		}).then(item => {
			return item === STOP ? undefined : item.value;
		});
}

/**
 * Return a function that returns the next item in a collection each call.
 * @param  {Object|Array} collection The collection to iterate over.
 * @return {Object|undefined}            Object containing next item or undefined if done.
 */
function iterable(collection) {
	let idx = 0;
	let keys;
	let length;
	if(Array.isArray(collection)) {
		length = collection.length;
	} else if (collection && typeof collection === 'object') {
		keys = Object.keys(collection);
		length = keys.length;
	} else {
		const msg = (''+collection).substring(0,20);
		throw new Error(`Can not iterate over "${msg}" (${typeof collection})`)
	}
	return function iterable_() {
		if(idx >= length) {
			return undefined;
		}
		const key =  keys ? keys[idx] : idx;
		const value = keys ? collection[key] : collection[idx];
		return {
			// Collection.
			length,
			collection,
			// Item.
			key, value,
			idx: idx++
		};
	}
}


/**
 * Exports.
 * @type {Object}
 */
module.exports = {
	// Library.
	version,
	// Iteration.
	iterable,
	// Is-type helpers.
	isFunction, isPromise,
	// Looping.
	while: _while,
	do: _do,
	// Finding.
	find
};
