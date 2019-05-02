import * as React from 'react';
import test from 'tape';
import { mount } from 'enzyme';
import mountCheckWarning from './mountCheckWarning';

test('MountCheckWarning. Check warning', (t) => {
	const WithWarning = () => {
		console.warn('Test warning');
		return null;
	}

	const [_, wasWarning] = mountCheckWarning(<WithWarning />);

	t.ok(wasWarning, 'Should detect warning');

	const WithoutWarning = () => null;

	const [_2, wasWarning2] = mountCheckWarning(<WithoutWarning />);

	t.notOk(wasWarning2, 'Should not detect warning');

	t.end();
});

test('MountCheckWarning. Original console warning', (t) => {
	const consoleWarning = console.warn;

	const WithoutWarning = () => null;

	mountCheckWarning(<WithoutWarning />);

	t.equal(consoleWarning, console.warn, 'The oroginal console warning should work');

	t.end();
});
