/**
 * @file Please, A Promise Helper Library.
 * @version 0.0.3
 * @author Adam Mill
 * @copyright Copyright 2016 Adam Mill
 * @license Apache-2.0
 */
'use strict';

/**
 * Stop symbol. Used to indicate stopping iteration.
 * @private
 * @type {Object}
 */
const STOP = { '<sym>': 'stop' };

/**
 * Is value a function?
 * @private
 * @param  {any}  value Type to check.
 * @return {boolean}       True if function, false otherwise.
 */
function isFunction(value) {
	return typeof value === 'function';
}

/**
 * The Please namespace.
 * @namespace Please
 */
const Please = { };

/**
 * The version of the library.
 * @type {string}
 */
Please.version = '0.0.3';

/**
 * Return a function that returns the next item in a collection each call.
 * @param  {Object|Array} collection The collection to iterate over.
 * @return {function}            Function that returns the object containing next item or undefined if done.
 */
Please.takable = function takable(collection) {
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
		throw new Error(`Can not iterate over "${msg}" (${typeof collection})`);
	}
	return function takeNext() {
		if(idx >= length) {
			return undefined;
		}
		const key =  keys ? keys[idx] : idx;
		const value = collection[key];
		return {
			// Collection.
			length,
			collection,
			// Item.
			key, value,
			idx: idx++
		};
	}
};

/**
 * The forEach() method executes a provided function once per array element.
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach Similar to Array#forEach.}
 * @param  {Array|Object} collection      Collection to loop over.
 * @param  {function} action    Action to execute.
 * @return {Promise}           Resolves when end of collection is reached. Resolves to undefined.
 */
Please.forEach = function forEach(collection, action) {
	const takeNext = Please.takable(collection);
	return Please.while(undefined, item => {
			return item !== STOP;
		}, () => {
			const item = takeNext();
			if(item === undefined) {
				return STOP;
			}
			const value = action(item.value, item.key);
			return Promise.resolve(value);
		}).then(() => {
			return undefined;
		});
};


/**
 * The callEach() calls each function in an array and resolves any values
 * returned. Items that are not functions are resolved.
 * @param  {Array|Object} collection      Collection to loop over.
 * @return {Promise}           Resolves when end of collection is reached.
 * Resolves to an array containing the results of each resolved item.
 */
Please.callEach = function callEach(collection) {
	const takeNext = Please.takable(collection);
	const results = [ ];
	return Please.while(undefined, item => {
			return item !== STOP;
		}, () => {
			const item = takeNext();
			if(item === undefined) {
				return STOP;
			}
			const value = isFunction(item.value)
				? item.value()
				: item.value;
			return Promise.resolve(value)
				.then(value => {
					results.push(value);
					return undefined;
				});
		}).then(() => {
			return results;
		})
};

/**
 * The isPromise method examines a value to determine if it is a Promise.
 * Does a ducktype check. Use instanceof only an instance check is desired.
 * @param  {any}  value The value to examine.
 * @return {boolean}       True if Promise, false if not.
 */
Please.isPromise = function isPromise(value) {
	return !!(
			value instanceof Promise	// Instance check.
			|| ( 											// Ducktype.
				value
				&& typeof value === 'object'
				&& typeof value.then === 'function'
				&& typeof value.catch === 'function'
			)
		);
};

/**
 * Execute action until condition is met. The condition is evaluated before the first action is run.
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while Similar to a while loop.}
 * @param  {any} initial   The initial value, if function call and use value.
 * @param  {function} condition Condition test, if returns false stop looping.
 * @param  {function} action    Action to execute. Results passed to condition and next aciton.
 * @return {Promise}           Resolves when condition met.
 */
Please.while = function _while(initial, condition, action) {
	if(arguments.length === 1) {
		// Only supplying the action function.
		action = initial;
		condition = (value, idx) => {
			// NOTE: Must skip first condition check or it will stop immediatly.
			return !!(idx === 0 ? true : value)
		};
		initial = undefined;
	} else if(arguments.length === 2) {
		// Only supplying initial value and action functions.
		action = condition;
		condition = (value, idx) => { return !!value };
	}
	function tick(value, idx, resolve, reject) {
		// NOTE: Does not return Promise on purpose.
		Promise.resolve(condition(value, idx))
			.then(result => {
				if(result) {
					// NOTE: Does not return Promise on purpose.
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
		// NOTE: Does not return Promise on purpose.
		Promise.resolve(isFunction(initial) ? initial() : initial)
			.then(value => {
				tick(value, 0, resolve, reject);
				return null;
			}).catch(reject);
		return null;
	});
};

/**
 * Execute action until condition is met. The condition is evaluated after the first action is run.
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/do...while Similar to a do...while loop.}
 * @param  {any} initial   The initial value, if function call and use value.
 * @param  {function} condition Condition test, if returns false stop looping.
 * @param  {function} action    Action to execute. Results passed to condition and next aciton.
 * @return {Promise}           Resolves when condition met.
 */
Please.do = function _do(initial, condition, action) {
	if(arguments.length === 1) {
		// Only supplying the action function.
		action = initial;
		condition = (value, idx) => {
			// NOTE: Must skip first condition check or it will stop immediatly.
			return !!(idx === 0 ? true : value)
		};
		initial = undefined;
	} else if(arguments.length === 2) {
		// Only supplying initial value and action functions.
		action = condition;
		condition = (value, idx) => { return !!value };
	} else {
		// Supplying all three parameters.
		const conditionOriginal = condition;
		condition = (value, idx) => {
			if(idx === 0) {
				return true;
			}
			// The first condition check is skipped so adjust the index.
			return conditionOriginal(value, idx-1)
		};
	}
	return Please.while(initial, condition, action);
};

/**
 * The find method returns a value in the collection, if an element in
 * the collection satisfies the provided testing function. Otherwise undefined is returned.
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find Similar to Array#find.}
 * @param  {Array|Object} collection      Collection to search.
 * @param  {function} condition Condition test function. Should return true if match, otherwise false.
 * @return {Promise}           Resolves to the found value when found or undefined when no match was found.
 */
Please.find = function find(collection, condition) {
	const takeNext = Please.takable(collection);
	return Please.do(undefined, item => {
			if(item === STOP) {
				return false;
			}
			return Promise.resolve(condition(item.value, item.key))
				.then(result => {
					return !result;
				});
		}, () => {
			const item = takeNext();
			if(item === undefined) {
				return STOP;
			}
			return Promise.resolve(item.value) // Resolve this, it may be a promise.
				.then(() => { return item; });
		}).then(item => {
			return item === STOP ? undefined : item.value;
		});
};

/**
 * Exports.
 * @type {Object}
 */
module.exports = Please;
