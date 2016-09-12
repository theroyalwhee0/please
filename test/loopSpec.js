/**
 * test/loopSpec.js
 */
'use strict';

/**
 * Imports.
 */
const expect = require('expect.js');
const Please = require('../index')

/**
 * Test Helpers.
 */
function delay(time) {
	return new Promise(resolve => {
		global.setTimeout(resolve, time || 10);
	});
}
function count(list, match) {
	return list.reduce((count, item) => {
		return item === match ? count+1 : count;
	}, 0)
}

/**
 * Tests.
 */
describe('Please', () => {
	describe('do', () => {
		it('should be a function', () => {
			expect(Please.do).to.be.a('function');
			expect(Please.do.length).to.be(3);
		});
		it('should handle looping until condition is met', () => {
			const called = [];
			const indexes = [];
			return Please.do(() => {
					called.push('initial');
					return 10;
				}, (value, idx) => {
					called.push('condition');
					indexes.push(idx);
					return value > 0;
				}, (value, idx) => {
					called.push('action');
					return Promise.resolve(--value);
				})
				.then(value => {
					expect(value).to.be(0);
					expect(called.join(',')).to.match(/^initial,action,condition,action,condition,/);
					expect(indexes.join(',')).to.match(/^0,1,2,3,/);
					expect(count(called, 'initial')).to.be(1);
					expect(count(called, 'condition')).to.be(10);
					expect(count(called, 'action')).to.be(10);
				});
		});
	});
	describe('while', () => {
		it('should be a function', () => {
			expect(Please.while).to.be.a('function');
			expect(Please.while.length).to.be(3);
		});
		it('should handle looping until condition is met', () => {
			const called = [];
			return Please.while(() => {
					called.push('initial');
					return 10;
				}, (value, idx) => {
					called.push('condition');
					return value > 0;
				}, (value, idx) => {
					called.push('action');
					return Promise.resolve(--value);
				})
				.then(value => {
					expect(value).to.be(0);
					expect(called.join(',')).to.match(/^initial,condition,action,condition,action,/);
					expect(count(called, 'initial')).to.be(1);
					expect(count(called, 'condition')).to.be(11);
					expect(count(called, 'action')).to.be(10);
				});
		});
		it('should handle constant initial value', () => {
			const called = [];
			return Please.while(0, (value, idx) => {
					called.push('condition');
					return value < 13;
				}, (value, idx) => {
					called.push('action');
					return ++value;
				})
				.then(value => {
					expect(value).to.be(13);
					expect(called.join(',')).to.match(/^condition,action,condition,action,/);
					expect(count(called, 'initial')).to.be(0);
					expect(count(called, 'condition')).to.be(14);
					expect(count(called, 'action')).to.be(13);
				});
		});
		it('should handle the action function', () => {
			const called = [];
			return Please.while((value, idx) => {
					value = value || 20;
					called.push('action');
					return --value;
				})
				.then(value => {
					expect(value).to.be(0);
					expect(called.join(',')).to.match(/^action,action,/);
					expect(count(called, 'initial')).to.be(0);
					expect(count(called, 'condition')).to.be(0);
					expect(count(called, 'action')).to.be(20);
				});
		});
		it('should handle the initial value and action function', () => {
			const called = [];
			return Please.while(14, (value, idx) => {
					called.push('action');
					return --value;
				})
				.then(value => {
					expect(value).to.be(0);
					expect(called.join(',')).to.match(/^action,action,/);
					expect(count(called, 'initial')).to.be(0);
					expect(count(called, 'condition')).to.be(0);
					expect(count(called, 'action')).to.be(14);
				});
		});
		it('should handle asynchronous results from each function', () => {
			const called = [];
			return Please.while(() => {
					return delay(2).then(() => {
						called.push('initial');
						return 12;
					});
				}, (value, idx) => {
					return delay(2).then(() => {
						called.push('condition');
						return value > 0;
					});
				}, (value, idx) => {
					return delay(2).then(() => {
						called.push('action');
						return --value;
					});
				})
				.then(value => {
					expect(value).to.be(0);
					expect(called.join(',')).to.match(/^initial,condition,action,condition,action,/);
					expect(count(called, 'initial')).to.be(1);
					expect(count(called, 'condition')).to.be(13);
					expect(count(called, 'action')).to.be(12);
				});
		});
		it('should handle rejections', () => {
			return Please.while((value, idx) => {
					return Promise.reject(new Error("Bam!"));
				})
				.then(value => {
					expect().fail('Should not pass.')
				})
				.catch(err => {
					expect(err).to.be.an(Error);
					expect(err.message).to.be('Bam!');
				});
		});
		it('should handle exceptions', () => {
			return Please.while((value, idx) => {
					throw new Error("Pow!");
				})
				.then(value => {
					expect().fail('Should not pass.')
				})
				.catch(err => {
					expect(err).to.be.an(Error);
					expect(err.message).to.be('Pow!');
				});
		});
	});
	describe('forEach', () => {
		it('should be a function', () => {
			expect(Please.forEach).to.be.a('function');
			expect(Please.forEach.length).to.be(2);
		});
		it('should iterate over each item in an array', () => {
			const collection = [ 1, 2, 4, 6 ];
			const results = [ ];
			return Please.forEach(collection, (value, idx) => {
				const result = value*value;
				results.push(result);
				return Promise.resolve(result);
			}).then(value => {
				expect(value).to.be(undefined);
				expect(results.length).to.be(4);
				expect(results[0]).to.be(1);
				expect(results[1]).to.be(4);
				expect(results[2]).to.be(16);
				expect(results[3]).to.be(36);
			});
		});
		it('should iterate over each item in an object', () => {
			const collection = { a: 2, b: 4, c: 6, d: 8 };
			const results = [ ];
			return Please.forEach(collection, (value, key) => {
				const result = value*value;
				results[key] = result;
				return Promise.resolve(result);
			}).then(value => {
				expect(value).to.be(undefined);
				expect(Object.keys(results).length).to.be(4);
				expect(results.a).to.be(4);
				expect(results.b).to.be(16);
				expect(results.c).to.be(36);
				expect(results.d).to.be(64);
			});
		});
		it('should halt on rejection', () => {
			const collection = [ 1, 2, 4, 6 ];
			const results = [ ];
			return Please.forEach(collection, (value, idx) => {
				const result = value*value;
				results.push(result);
				if(value === 2) {
					return Promise.reject(new Error('Boom!'));
				}
				return Promise.resolve(result);
			}).then(() => {
				expect().fail('Should have rejected.');
			}, err => {
				expect(err).to.be.an(Error);
				expect(err.message).to.be('Boom!');
				expect(Object.keys(results).length).to.be(2);
				expect(results[0]).to.be(1);
				expect(results[1]).to.be(4);
				expect(results[2]).to.be(undefined);
			});
		});
	});
	describe('callEach', () => {
		it('should be a function', () => {
			expect(Please.callEach).to.be.a('function');
			expect(Please.callEach.length).to.be(1);
		});
		it('should iterate over each function in an array', () => {
			const collection = [
				() => { return 1; },
				2,
				() => { return Promise.resolve(4); },
				Promise.resolve(6)
			];
			return Please.callEach(collection)
				.then(results => {
					expect(results).to.be.an('array');
					expect(results.length).to.be(4);
					expect(results[0]).to.be(1);
					expect(results[1]).to.be(2);
					expect(results[2]).to.be(4);
					expect(results[3]).to.be(6);
				});
		});
		it('should iterate over each function in an object', () => {
			const collection = {
				a: () => { return 5; },
				b: 4,
				c: () => { return Promise.resolve(3); },
				d: Promise.resolve(2)
			};
			return Please.callEach(collection)
				.then(results => {
					expect(results).to.be.an('array');
					expect(results.length).to.be(4);
					expect(results[0]).to.be(5);
					expect(results[1]).to.be(4);
					expect(results[2]).to.be(3);
					expect(results[3]).to.be(2);
				});
		});
		it('should halt on rejection', () => {
			let called = 0;
			const collection = [
				() => { called++; return 100; },
				() => { called++; return Promise.reject(new Error('Boom!')); },
				() => { called++; return 200; }
			];
			return Please.callEach(collection)
				.then(() => {
					expect().fail('Should have rejected.');
				}, err => {
					expect(err).to.be.an(Error);
					expect(err.message).to.be('Boom!');
					expect(called).to.be(2);
				});
		});
	});
});
