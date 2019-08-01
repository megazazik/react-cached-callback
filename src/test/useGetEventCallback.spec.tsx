import * as React from 'react';
import { mount } from 'enzyme';
import test from 'tape';
import useGetEventCallback from '../useGetEventCallback';
import mountCheckWarning from './mountCheckWarning';

test('useGetEventCallback. Params', (t) => {
	const TestComponent = ({params = [], args = []}) => {
		const callback = useGetEventCallback((...args) => (...callArgs) => [...params, ...args, ...callArgs]);
		
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

test('useGetEventCallback. Caching callbacks', (t) => {
	const TestComponent = ({params = [], blur}) => {
		const callback = useGetEventCallback((...args) => (...callArgs) => [...params, ...args, ...callArgs]);
		
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

	t.deepEqual(thirdOnClick(4), [false, 'click', 4]);
	t.deepEqual(thirdOnChange(5), [false, 'change', 5]);
	t.deepEqual(thirdOnBlur(6), [false, 'blur', 6]);

	t.equal(firstOnClick, thirdOnClick);
	t.equal(firstOnChange, thirdOnChange);
	t.notEqual(firstOnBlur, thirdOnBlur);

	t.end();
})

test('useGetEventCallback. Warnings during render', (t) => {
	const TestComponent = () => {
		const createCallback = useGetEventCallback(() => () => {});
		createCallback()();

		return null;
	}

	const [_, wasWarning] = mountCheckWarning(<TestComponent />);

	t.ok(wasWarning, 'Should raise warning');

	t.end();
});

test('useGetEventCallback. No warnings during render without call', (t) => {
	const TestComponent = () => {
		const createCallback = useGetEventCallback(() => () => {});

		return null;
	}

	const [_, wasWarning] = mountCheckWarning(<TestComponent />);

	t.notOk(wasWarning, 'Should raise warning');

	t.end();
});

test('useGetEventCallback. Warnings during children render', (t) => {
	const ComponentUseDuringRender = ({callback}) => {
		callback();
		return null;
	}


	const TestComponent = () => {
		const createCallback = useGetEventCallback(() => () => {});

		return (
			<ComponentUseDuringRender callback={createCallback()} />
		);
	}

	const [_, wasWarning] = mountCheckWarning(<TestComponent />);

	t.ok(wasWarning, 'Should raise warning')

	t.end();
});

test('useGetEventCallback. No warnings in useEffect', (t) => {
	const TestComponent = () => {
		const createCallback = useGetEventCallback(() => () => {});
		React.useEffect(createCallback());

		return null;
	}

	const [_, wasWarning] = mountCheckWarning(<TestComponent />);

	t.notOk(wasWarning, 'Should not raise warning')

	t.end();
});

test('useGetEventCallback. No warnings in useLayoutEffect', (t) => {
	const TestComponent = () => {
		const createCallback = useGetEventCallback(() => () => {});
		React.useLayoutEffect(() => createCallback());

		return null;
	}

	const [_, wasWarning] = mountCheckWarning(<TestComponent />);

	t.notOk(wasWarning, 'Should not raise warning')

	t.end();
});

test('useGetEventCallback. Warnings in componentDidMount', (t) => {
    class TestChildren extends React.Component<{callback}> {
        componentDidMount () {
            this.props.callback();
        }

        render () {
            return null;
        }
    }

    const TestComponentUseDuringRender = () => {
        const callback = useGetEventCallback(() => () => {});

        return (
            <TestChildren callback={callback()} />
        );
    }

    const [_, wasWarning] = mountCheckWarning(<TestComponentUseDuringRender />);

    t.ok(wasWarning, 'Should throw warning');

    t.end();
});

test('useGetEventCallback. Params variants', (t) => {
    const TestComponent = ({createCallbackParam = [], params = []}) => {
		const createCallback = useGetEventCallback(
			(...args) => (...callArgs) => [...params, ...args, ...callArgs],
			{getKey: (...args) => args[1]}
		);
		
		return (
			<input
				onClick={createCallback(...createCallbackParam)}
			/>
		);
	}
	const wrapper = mount(<TestComponent createCallbackParam={[1, 'key1']} />);
	const onClick = wrapper.children().props().onClick;

	t.deepEqual(onClick(1), [1, 'key1', 1]);
	wrapper.setProps({createCallbackParam: [1, 'key2']});
	const onClick2 = wrapper.children().props().onClick;
	t.deepEqual(onClick2(2), [1, 'key2', 2]);
	t.notEqual(onClick, onClick2, 'Callback with different keys should not be equals');

	wrapper.setProps({createCallbackParam: [2, 'key2']});
	const onClick3 = wrapper.children().props().onClick;
	t.deepEqual(onClick3(3), [2, 'key2', 3]);
	t.equal(onClick3, onClick2, 'Callback with same keys should be equals');

    t.end();
});
