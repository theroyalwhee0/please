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
		global.setTimeout(resolve, time || 2);
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
					return delay().then(() => {
						called.push('initial');
						return 12;
					});
				}, (value, idx) => {
					return delay().then(() => {
						called.push('condition');
						return value > 0;
					});
				}, (value, idx) => {
					return delay().then(() => {
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
});
