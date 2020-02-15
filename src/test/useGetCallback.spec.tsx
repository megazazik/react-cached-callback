import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import test from 'tape';
import useGetCallback, {
	useGetCallbackInner,
	checkParams
} from '../useGetCallback';

const TestChild = ({}: { callbacks: Array<(...args) => any> }) => null;

const TestComponent = ({
	callsParams,
	getKey = (...args) => args[0],
	usedParams
}) => {
	const createCallback = useGetCallbackInner(
		(...args) => (...callArgs) => [...args, ...callArgs],
		getKey,
		usedParams
	);

	return (
		<TestChild
			callbacks={callsParams.map(params => createCallback(...params))}
		/>
	);
};

const mountWithCallbacks = ({
	calls,
	getKey = undefined,
	usedParams = undefined
}) =>
	mount(
		<TestComponent
			callsParams={calls}
			getKey={getKey}
			usedParams={usedParams}
		/>
	);
const getCallbacks = (wrapper: ReactWrapper) =>
	wrapper.children().props().callbacks;

test('useGetCallback. No error without calls', t => {
	try {
		getCallbacks(mountWithCallbacks({ calls: [] }));
		t.pass('No errors');
	} catch (e) {
		t.error(e);
	}

	t.end();
});

test('useGetCallback. Params', t => {
	const callback1 = getCallbacks(mountWithCallbacks({ calls: [[]] }))[0];

	t.deepEqual(callback1(5), [5], 'Call params');
	t.deepEqual(callback1(6), [6], 'Call params');
	t.deepEqual(callback1(6, 7), [6, 7], 'Call params');

	const callbacks2 = getCallbacks(
		mountWithCallbacks({ calls: [['first'], ['second'], []] })
	);

	t.deepEqual(callbacks2[0](3), ['first', 3], 'Create callback params');
	t.deepEqual(callbacks2[1](6), ['second', 6], 'Create callback params');
	t.deepEqual(callbacks2[2](6, 7), [6, 7], 'Create callback params');

	t.end();
});

test('useGetCallback. Caching', t => {
	const wrapper = mountWithCallbacks({
		calls: [['first'], ['second'], ['third']]
	});
	const callbacks1 = getCallbacks(wrapper);

	wrapper.setProps({ callsParams: [['zero'], ['first'], ['second']] });
	const callbacks2 = getCallbacks(wrapper);
	t.equal(callbacks1[0], callbacks2[1], 'With first key');
	t.equal(callbacks1[1], callbacks2[2], 'With second key');
	t.notEqual(callbacks1[2], callbacks2[0], 'With third key');

	wrapper.setProps({ callsParams: [['first'], ['second'], ['third']] });
	const callbacks3 = getCallbacks(wrapper);
	t.equal(callbacks2[1], callbacks3[0], 'With first key. Again');
	t.equal(callbacks2[2], callbacks3[1], 'With second key. Again');
	t.notEqual(callbacks1[2], callbacks3[2], 'With third key. Again');

	t.end();
});

test('useGetCallback. User params', t => {
	const wrapper = mountWithCallbacks({
		calls: [['first'], ['second']],
		usedParams: ['p1', 2]
	});
	const callbacks1 = getCallbacks(wrapper);

	wrapper.setProps({
		callsParams: [['first'], ['second']],
		usedParams: ['p1', 2]
	});
	const callbacks2 = getCallbacks(wrapper);
	t.equal(callbacks1[0], callbacks2[0], 'With first key');
	t.equal(callbacks1[1], callbacks2[1], 'With second key');

	wrapper.setProps({
		callsParams: [['first'], ['second']],
		usedParams: ['p1', 3]
	});
	const callbacks3 = getCallbacks(wrapper);
	t.notEqual(callbacks2[0], callbacks3[0], 'With first key. Again');
	t.notEqual(callbacks2[1], callbacks3[1], 'With second key. Again');

	t.end();
});

test('useGetCallback. checkParams', t => {
	t.deepEqual(checkParams(), [undefined, undefined]);

	t.deepEqual(checkParams(undefined, undefined), [undefined, undefined]);

	t.deepEqual(checkParams(1, undefined), [1, undefined]);

	t.deepEqual(checkParams({ index: 0 }, undefined), [
		{ index: 0 },
		undefined
	]);

	const getKeyMock = () => '';
	t.deepEqual(checkParams(getKeyMock, undefined), [getKeyMock, undefined]);

	t.deepEqual(checkParams(1, ['t']), [1, ['t']]);

	t.deepEqual(checkParams(['t']), [undefined, ['t']]);

	t.end();
});

test('useGetCallback. Using getKey', t => {
	const GetKeyTestComponent = ({ callsParams }) => {
		const createCallback = useGetCallback(
			(...args) => (...callArgs) => [...args, ...callArgs],
			2
		);

		return (
			<TestChild
				callbacks={callsParams.map(params => createCallback(...params))}
			/>
		);
	};

	const wrapper = mount(
		<GetKeyTestComponent
			callsParams={[
				[11, false, 'k1'],
				[5, true, 'k2'],
				[7, 33, 'k2'],
				[7, 33, 'k2']
			]}
		/>
	);

	const callbacks1 = getCallbacks(wrapper);

	t.notEqual(
		callbacks1[0],
		callbacks1[1],
		'Should not be equals with the same key'
	);
	t.notEqual(
		callbacks1[1],
		callbacks1[2],
		'Should not be equals with the same key and different params'
	);
	t.equal(
		callbacks1[2],
		callbacks1[3],
		'Should be equals with the same key and same params'
	);

	wrapper.setProps({
		callsParams: [
			[11, false, 'k1'],
			[7, 33, 'k2'],
			[8, 33, 'k2']
		]
	});

	const callbacks2 = getCallbacks(wrapper);
	t.equal(callbacks1[0], callbacks2[0], 'After render 1');
	t.equal(callbacks1[2], callbacks2[1], 'After render 2');
	t.notEqual(callbacks2[1], callbacks2[2], 'After render 3');

	t.end();
});

test('useGetCallback. used values', t => {
	const GetKeyTestComponent = ({ callsParams, usedValues }) => {
		const createCallback = useGetCallback(
			(...args) => (...callArgs) => [...args, ...callArgs],
			usedValues
		);

		return (
			<TestChild
				callbacks={callsParams.map(params => createCallback(...params))}
			/>
		);
	};

	const wrapper = mount(
		<GetKeyTestComponent
			callsParams={[
				['k1', 2],
				['k2', 3]
			]}
			usedValues={[1]}
		/>
	);

	const callbacks1 = getCallbacks(wrapper);

	wrapper.setProps({
		callsParams: [
			['k1', 2],
			['k2', 3]
		],
		usedValues: [1]
	});

	const callbacks2 = getCallbacks(wrapper);
	t.equal(
		callbacks1[0],
		callbacks2[0],
		'Callbacks should be equal before values changed 1'
	);
	t.equal(
		callbacks1[1],
		callbacks2[1],
		'Callbacks should be equal before values changed 2'
	);

	wrapper.setProps({
		callsParams: [
			['k1', 2],
			['k2', 3]
		],
		usedValues: [2]
	});

	const callbacks3 = getCallbacks(wrapper);
	t.notEqual(
		callbacks1[0],
		callbacks3[0],
		'Callbacks should not be equal before values changed 1'
	);
	t.notEqual(
		callbacks1[1],
		callbacks3[1],
		'Callbacks should not be equal before values changed 2'
	);

	t.end();
});

test('useGetCallback. Create callback args', t => {
	const GetKeyTestComponent = ({ callsParams, usedValues }) => {
		const createCallback = useGetCallback(
			(...args) => (...callArgs) => [...args, ...callArgs],
			usedValues
		);

		return (
			<TestChild
				callbacks={callsParams.map(params => createCallback(...params))}
			/>
		);
	};

	const wrapper = mount(
		<GetKeyTestComponent
			callsParams={[
				['k1', 2],
				['k2', 3]
			]}
			usedValues={[1]}
		/>
	);

	const callbacks1 = getCallbacks(wrapper);

	wrapper.setProps({
		callsParams: [
			['k1', 2],
			['k2', 3]
		],
		usedValues: [1]
	});

	const callbacks2 = getCallbacks(wrapper);
	t.equal(
		callbacks1[0],
		callbacks2[0],
		'Callbacks should be equal before values changed 1'
	);
	t.equal(
		callbacks1[1],
		callbacks2[1],
		'Callbacks should be equal before values changed 2'
	);

	wrapper.setProps({
		callsParams: [
			['k1', 1],
			['k2', 2]
		],
		usedValues: [1]
	});

	const callbacks3 = getCallbacks(wrapper);
	t.notEqual(
		callbacks1[0],
		callbacks3[0],
		'Callbacks should not be equal before values changed 1'
	);
	t.notEqual(
		callbacks1[1],
		callbacks3[1],
		'Callbacks should not be equal before values changed 2'
	);

	t.end();
});
