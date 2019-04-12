import * as React from 'react';
import { mount } from 'enzyme';
import test from 'tape';
import useEventCallbacks from '../useEventCallbacks';

test('EventCallback. Params', (t) => {
	const TestComponent = ({params = [], args = []}) => {
		const callback = useEventCallbacks((...args) => (...callArgs) => [...params, ...args, ...callArgs]);
		
		return (
			<span onClick={callback(...args)} />
		);
	}
	const createCallback = (...params) => (...args) => mount(<TestComponent params={params} args={args} />).children().props().onClick;

	t.deepEqual(createCallback()()(), [], 'Without params');
	t.deepEqual(createCallback(true, 1)()(), [true, 1], 'Props');
	t.deepEqual(createCallback(true)(2)(), [true, 2], 'Params');
	t.deepEqual(createCallback()(2)('a'), [2, 'a'], 'Without props');
	t.deepEqual(createCallback()()('a'), ['a'], 'Only args');

	t.end();
})


test('EventCallback. Caching callbacks', (t) => {
	const TestComponent = ({params = [], blur}) => {
		const callback = useEventCallbacks((...args) => (...callArgs) => [...params, ...args, ...callArgs]);
		
		return (
			<input
				onClick={callback('click')}
				onChange={callback('change')}
				onBlur={callback(blur)}
			/>
		);
	}
	const wrapper = mount(<TestComponent params={[false]} blur='blur' />);
	const props = wrapper.children().props();
	const firstOnClick = props.onClick;
	const firstOnChange = props.onChange;
	const firstOnBlur = props.onBlur;

	t.deepEqual(firstOnClick(1), [false, 'click', 1]);
	t.deepEqual(firstOnChange(2), [false, 'change', 2]);
	t.deepEqual(firstOnBlur(3), [false, 'blur', 3]);

	wrapper.setProps({params: [true], blur: 'diff'});
	const secondProps = wrapper.children().props();
	const secondOnClick = secondProps.onClick;
	const secondOnChange = secondProps.onChange;
	const secondOnBlur = secondProps.onBlur;

	t.deepEqual(secondOnClick(1), [true, 'click', 1]);
	t.deepEqual(secondOnChange(2), [true, 'change', 2]);
	t.deepEqual(secondOnBlur(3), [true, 'diff', 3]);

	t.equal(firstOnClick, secondOnClick);
	t.equal(firstOnChange, secondOnChange);
	t.notEqual(firstOnBlur, secondOnBlur);

	wrapper.setProps({params: [false], blur: 'blur'});
	const thirdProps = wrapper.children().props();
	const thirdOnClick = thirdProps.onClick;
	const thirdOnChange = thirdProps.onChange;
	const thirdOnBlur = thirdProps.onBlur;

	t.deepEqual(thirdOnClick(1), [false, 'click', 1]);
	t.deepEqual(thirdOnChange(2), [false, 'change', 2]);
	t.deepEqual(thirdOnBlur(3), [false, 'blur', 3]);

	t.equal(firstOnClick, thirdOnClick);
	t.equal(firstOnChange, thirdOnChange);
	t.notEqual(firstOnBlur, thirdOnBlur);

	t.end();
})

