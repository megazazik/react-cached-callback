import * as React from 'react';
import { mount } from 'enzyme';
import test from 'tape';
import useCallbacks from '../useCallbacks';

test('SimpleTest', (t) => {

    const TestComponent = () => {
        const createCollback = useCallbacks((...args) => (...callArgs) => [...args, ...callArgs], {});

        return (
            <span onClick={createCollback(5)} />
        );
    }
    
    const wrapper = mount(<TestComponent />);

    t.deepEqual(wrapper.children().props().onClick(), [5], 'Hook param');

    t.end();
})