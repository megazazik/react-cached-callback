import * as test from 'tape';
import cached from './';

test("cached decorator tests", (t) => {
	class Tested {
		@cached()
		args(...args) {
			return (...innerArgs) => [...args, ...innerArgs];
		}
	}
	
	const obj = new Tested();
	t.deepEqual(obj.args(5)(), [5], 'With single param');
	t.deepEqual(obj.args(5)(100), [5, 100], 'With complex params');

	t.deepEqual(obj.args(7, true, 'param')(), [7, true, 'param'], 'Params order');
	t.deepEqual(obj.args(7, false, 'param')(), [7, false, 'param'], 'Params are changed after the second call');
	t.deepEqual(obj.args(7, true, 'param')(10, false), [7, true, 'param', 10, false], 'Params order with inner params');
	t.deepEqual(obj.args(7, true, 'param')(10, true), [7, true, 'param', 10, true], 'Inner params are changed after second call');

	t.equals(obj.args(7, true, 'param'), obj.args(7, false, 'param'), 'Returned functions with the same key are equals.');
	t.notEqual(obj.args(7, true, 'param'), obj.args(8, true, 'param'), 'Returned functions with the different key are not equals.');

	const diffObj1 = new Tested();
	const diffObj2 = new Tested();
	t.notEqual(diffObj1.args(1), diffObj2.args(1), 'Bound functions for different object are not equals.')

	t.end();
});