import test from 'tape';
import * as React from 'react';
import { mount } from 'enzyme';
import cached, {
	makeCached,
	ICachedParams,
	useEventCallback,
	useGetCallback,
	useGetEventCallback
} from 'react-cached-callback';

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

test("useEventCallback", (t) => {
	const TestComponent = ({params = []}: {params?: any[], salt?}) => {
		const callback = useEventCallback((...args) => [...params, ...args]);

		return (
			<span onClick={callback} />
		);
	}

	const wrapper = mount(<TestComponent params={[1, true]} salt={200} />);
	const onClick1 = wrapper.children().props().onClick;
	t.equal(typeof onClick1, 'function', 'Should return function');
	t.deepEqual(onClick1(5), [1, true, 5], 'Should call correct callback 1');
	t.deepEqual(onClick1(5, 'c'), [1, true, 5, 'c'], 'Should call correct callback 2');

	wrapper.setProps({salt: 100, params: [1, false]});

	const onClick2 = wrapper.children().props().onClick;
	t.equal(onClick1, onClick2, 'Should return the same callback 1');

	t.end();
});

test("useGetCallback", (t) => {
	const TestChild = ({ }: { callbacks: Array<(...args) => any> }) => null;

	const TestComponent = ({ callsParams, getKey = (...args) => args[0], usedParams }) => {
		const createCallback = useGetCallback(
			(...args) => (...callArgs) => [...args, ...callArgs],
			getKey,
			usedParams
		);

		return (
			<TestChild callbacks={callsParams.map((params) => createCallback(...params))} />
		);
	}

	const wrapper = mount(<TestComponent
		callsParams={[['a', 1], ['b', 2]]}
		getKey={(key) => key}
		usedParams={[10, true]}
	/>);

	const callbacks1 = wrapper.children().props().callbacks;
	t.equal(typeof callbacks1[0], 'function', 'Should return function');
	t.deepEqual(callbacks1[0](5), ['a', 1, 5], 'Should call correctly 1');
	t.deepEqual(callbacks1[1](6), ['b', 2, 6], 'Should call correctly 2');

	wrapper.setProps({
		callsParams: [['a', 1], ['b', 3]],
		getKey: (key) => key,
		usedParams: [10, true]
	});

	const callbacks2 = wrapper.children().props().callbacks;
	t.equal(callbacks2[0], callbacks1[0], 'Should return the same callback with the same parameters');
	t.notEqual(callbacks2[1], callbacks1[1], 'Should return a new callback with different parameters');

	wrapper.setProps({
		callsParams: [['a', 1], ['b', 3]],
		getKey: (key) => key,
		usedParams: [10, false]
	});

	const callbacks3 = wrapper.children().props().callbacks;
	t.notEqual(callbacks3[0], callbacks2[0], 'Should return a new callback with new dependencies 1');
	t.notEqual(callbacks3[1], callbacks2[1], 'Should return a new callback with new dependencies 2');

	t.end();
});

test("useCreateEventCallback", (t) => {
	const TestComponent = ({process}: {process: (getCallback: (...args) => (...callArgs) => any[]) => void}) => {
		process(useGetEventCallback((...args) => (...callArgs) => [...args, ...callArgs]));
		return null;
	};

	const callbacks1 = [];
	const wrapper = mount(
		<TestComponent
			process={(getCallback) => {
				callbacks1[0] = getCallback('a', 10);
				callbacks1[1] = getCallback('b', 12);
				callbacks1[2] = getCallback('c', 11);
			}}
		/>
	);

	t.deepEqual(callbacks1[0](true), ['a', 10, true]);
	t.deepEqual(callbacks1[1](false), ['b', 12, false]);

	const callbacks2 = [];
	wrapper.setProps({
		process: (getCallback) => {
			callbacks2[0] = getCallback('a', 10);
			callbacks2[1] = getCallback('b', 13);
		}
	});

	t.equal(callbacks1[0], callbacks2[0]);
	t.equal(callbacks1[1], callbacks2[1]);
	t.deepEqual(callbacks1[0](1), ['a', 10, 1]);
	t.deepEqual(callbacks1[1](2), ['b', 13, 2]);

	const callbacks3 = [];
	wrapper.setProps({
		process: (getCallback) => {
			callbacks3[0] = getCallback('c', 10);
		}
	});

	t.notEqual(callbacks3[0], callbacks1[2]);

	t.end();
});
