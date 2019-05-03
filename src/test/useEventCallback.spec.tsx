import * as React from 'react';
import { mount } from 'enzyme';
import test from 'tape';
import useEventCallback from '../useEventCallback';
import mountCheckWarning from './mountCheckWarning';

const TestComponent = ({params = []}: {params?: any[]}) => {
    const callback = useEventCallback((...args) => [...params, ...args]);

    return (
        <span onClick={callback} />
    );
}

test('EventCallback. Params', (t) => {    
    const wrapper = mount(<TestComponent />);

    t.deepEqual(wrapper.children().props().onClick(), [], 'Without params');
    t.deepEqual(wrapper.children().props().onClick(5), [5], 'Simple call param');
    t.deepEqual(wrapper.children().props().onClick(5, 'c'), [5, 'c'], 'Multi call param');

    const wrapperWithParams = mount(<TestComponent params={[true, 'a']}/>);

    t.deepEqual(wrapperWithParams.children().props().onClick(), [true, 'a'], 'With params');
    t.deepEqual(wrapperWithParams.children().props().onClick(5), [true, 'a', 5], 'With params. Simple call param');
    t.deepEqual(wrapperWithParams.children().props().onClick(5, 'c'), [true, 'a', 5, 'c'], 'With params. Multi call param');

    const wrapperAfterUpdate = mount(<TestComponent />);
    wrapperAfterUpdate.setProps({params:[true, 'a']});

    t.deepEqual(wrapperWithParams.children().props().onClick(), [true, 'a'], 'After update');
    t.deepEqual(wrapperWithParams.children().props().onClick(5), [true, 'a', 5], 'After update. Simple call param');
    t.deepEqual(wrapperWithParams.children().props().onClick(5, 'c'), [true, 'a', 5, 'c'], 'After update. Multi call param');

    t.end();
})

test('EventCallback. Cache', (t) => {
    const wrapper = mount(<TestComponent />);

    const callback = wrapper.children().props().onClick;
    t.deepEqual(callback(), [], 'Without params');
    t.deepEqual(callback(5), [5], 'Simple call param');
    t.deepEqual(callback(5, 'c'), [5, 'c'], 'Multi call param');

    wrapper.setProps({params:[true, 'a']});

    const callbackAfterUpdate = wrapper.children().props().onClick;
    t.deepEqual(callbackAfterUpdate(), [true, 'a'], 'With params');
    t.deepEqual(callbackAfterUpdate(5), [true, 'a', 5], 'With params. Simple call param');
    t.deepEqual(callbackAfterUpdate(5, 'c'), [true, 'a', 5, 'c'], 'With params. Multi call param');

    wrapper.setProps({params:[false]});
    const callbackAfter2Updates = wrapper.children().props().onClick;
    t.deepEqual(callbackAfter2Updates(5), [false, 5], 'After 2 updates. Params');

    t.equal(callback, callbackAfterUpdate, 'Callbacks are equels');
    t.equal(callback, callbackAfter2Updates, 'Callbacks are equels')

    t.end();
});

test('EventCallback. Warning inside render', (t) => {
    const TestComponentUseDuringRender = () => {
        const callback = useEventCallback(() => {});

        callback();
    
        return (
            <span onClick={callback} />
        );
    }

    const [_, wasWarning] = mountCheckWarning(<TestComponentUseDuringRender />);

    t.equal(wasWarning, true, 'Should throw warning');

    t.end();
});

test('EventCallback. Warning inside render in children', (t) => {
    const TestChildren = ({callback}) => {
        callback();
        return null;
    }
    const TestComponentUseDuringRender = () => {
        const callback = useEventCallback(() => {});
    
        return (
            <TestChildren callback={callback} />
        );
    }

    const [_, wasWarning] = mountCheckWarning(<TestComponentUseDuringRender />);

    t.equal(wasWarning, true, 'Should throw warning');
    
    t.end();
});

test('EventCallback. In useEffect', (t) => {
    const TestChildren = ({callback}) => {
        React.useEffect(callback);
        return null;
    }
    const TestComponentNoUseDuringRender = () => {
        const callback = useEventCallback(() => {});
    
        return (
            <TestChildren callback={callback} />
        );
    }

    const [_, wasWarning] = mountCheckWarning(<TestComponentNoUseDuringRender />);

    t.equal(wasWarning, false, 'Should not throw warning');
    
    t.end();
});

test('EventCallback. In componentDidMount', (t) => {
    class TestChildren extends React.Component<{callback}> {
        componentDidMount () {
            this.props.callback();
        }

        render () {
            return null;
        }
    }

    const TestComponentUseDuringRender = () => {
        const callback = useEventCallback(() => {});
    
        return (
            <TestChildren callback={callback} />
        );
    }

    const [_, wasWarning] = mountCheckWarning(<TestComponentUseDuringRender />);

    t.equal(wasWarning, true, 'Should throw warning');

    t.end();
});