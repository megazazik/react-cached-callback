import test from 'tape';
import cached, { makeCached } from 'react-cached-callback';

function testCached (t: test.Test, obj: {args(...args): (...innerAgrs) => any[]}) {
	t.equal(typeof obj.args('str1', 5, 10), 'function', 'Should return function');

	t.equal(obj.args('str1', 5, 10), obj.args('str2', 6, 10), 'Should return same callbacks with same keys');
	t.notEqual(obj.args('str1', 5, 10), obj.args('str1', 5, 11), 'Should return different callbacks with different keys');

	t.deepEqual(obj.args('str1', 5, 10)(1), ['str1', 5, 10, 1], 'Should return correct arguments 1');
	t.deepEqual(obj.args('str1', 5, 10)(2), ['str1', 5, 10, 2], 'Should return correct arguments 2');
}

test("cached", (t) => {
	class Tested {
		@cached({getKey: (...args) => args[2]})
		args(...args) {
			return (...innerArgs) => [...args, ...innerArgs];
		}
	}
	
	const obj = new Tested();
	testCached(t, obj);
	
	t.end();
});

test("makeCached", (t) => {
	class Tested {
		args(...args) {
			return (...innerArgs) => [...args, ...innerArgs];
		}
	}
	
	makeCached(Tested, 'args', 2);
	const obj = new Tested();
	testCached(t, obj);
	
	t.end();
});
