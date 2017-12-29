import * as test from 'tape';
import { makeCached } from './';

test("makeCached tests", (t) => {
	class Tested {
		args(...args) {
			return (...innerArgs) => [...args, ...innerArgs];
		}
	}
	makeCached(Tested, 'args');
	
	const obj = new Tested();
	t.deepEqual(obj.args(5)(), [5], 'With single param');
	t.deepEqual(obj.args(5)(100), [5, 100], 'With complex params');

	t.deepEqual(obj.args(7, true, 'param')(), [7, true, 'param'], 'Params order');
	t.deepEqual(obj.args(7, false, 'param')(), [7, false, 'param'], 'Params are changed after the second call');
	t.deepEqual(obj.args(7, true, 'param')(10, false), [7, true, 'param', 10, false], 'Params order with inner params');
	t.deepEqual(obj.args(7, true, 'param')(10, true), [7, true, 'param', 10, true], 'Inner params are changed after second call');

	t.equals(obj.args(7, true, 'param'), obj.args(7, false, 'param'), 'Returned functions with the same key are equals.');
	t.notEqual(obj.args(7, true, 'param'), obj.args(8, true, 'param'), 'Returned functions with the different key are not equals.');

	const cachedCallback = obj.args(7, true, 'param');
	obj.args(8, true, 'param');
	t.deepEqual(cachedCallback(100, true), [7, true, 'param', 100, true], 'Calls  with other params do not affect the previously bound function.');

	const diffObj1 = new Tested();
	const diffObj2 = new Tested();
	t.notEqual(diffObj1.args(1), diffObj2.args(1), 'Bound functions for different object are not equals.')

	t.end();
});

test("index parameter tests", (t) => {
	class Tested {
		args(...args) {
			return (...innerArgs) => [...args, ...innerArgs];
		}
	}
	makeCached(Tested, 'args', {index: 2});
	
	const obj = new Tested();
	t.equal(obj.args('str1', 5, 10), obj.args('str2', 6, 10), 'The index parameter is used to specify a key.');
	t.notEqual(obj.args('str1', 5, 10), obj.args('str1', 5, 11), 'Bound functions for different key are not equals.');

	t.end();
});

test("index parameter simplified tests", (t) => {
	class Tested {
		args(...args) {
			return (...innerArgs) => [...args, ...innerArgs];
		}
	}
	makeCached(Tested, 'args', 2);
	
	const obj = new Tested();
	t.equal(obj.args('str1', 5, 10), obj.args('str2', 6, 10), 'The index parameter is used to specify a key.');
	t.notEqual(obj.args('str1', 5, 10), obj.args('str1', 5, 11), 'Bound functions for different key are not equals.');

	t.end();
});

test("getKey parameter tests", (t) => {
	class Tested {
		args(...args) {
			return (...innerArgs) => [...args, ...innerArgs];
		}
	}
	makeCached(Tested, 'args', {getKey: (...args) => args[0].id});
	
	const obj = new Tested();
	t.equal(obj.args({id: 10}, 'str1'), obj.args({id: 10}, 'str2'), 'The getKey parameter is used to specify a key.');
	t.notEqual(obj.args({id: 10}, 5, 10), obj.args({id: 11}, 5, 11), 'Bound functions for different key are not equals.');

	t.end();
});

test("getKey parameter simplified tests", (t) => {
	class Tested {
		args(...args) {
			return (...innerArgs) => [...args, ...innerArgs];
		}
	}
	makeCached(Tested, 'args', (...args) => args[0].id);
	
	const obj = new Tested();
	t.equal(obj.args({id: 10}, 'str1'), obj.args({id: 10}, 'str2'), 'The getKey parameter is used to specify a key.');
	t.notEqual(obj.args({id: 10}, 5, 10), obj.args({id: 11}, 5, 11), 'Bound functions for different key are not equals.');

	t.end();
});

test("pure parameter tests", (t) => {
	t.test('pure is true', (t) => {
		class Tested {
			count = 0;

			args(...args) {
				this.count++;
				return (...innerArgs) => [...args, ...innerArgs];
			}
		}
		makeCached(Tested, 'args', {pure: true});
		
		const obj = new Tested();
		obj.args(1, 10);
		obj.args(1, 10);
		obj.args(1, 10);
		obj.args(1, 10);
		t.equal(obj.count, 1, 'The origin method is not called when parameters are the same.');

		obj.args(1, 11);
		t.equal(obj.count, 2, 'The origin method is called when parameters change.');
	
		t.end();
	});
	
	t.end();
});