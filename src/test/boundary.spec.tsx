import * as React from 'react';
import test from 'tape';
import { Boundary, initMountCheckError } from './boundary';
import { mount } from 'enzyme';

const WithError = () => {
	throw new Error();
}

const WithoutError = () => null;

test("Boundary. Error", (t) => {
	let wasError = false;
	const consoleError = console.error;
	console.error = () => {};

	mount(
		<Boundary onError={() => {wasError = true}}>
            <WithError />
        </Boundary>
	);

	console.error = consoleError;

	t.equal(wasError, true, 'Should call callback on error')
	t.end();
});


test("Boundary. Without error", (t) => {
	let wasError = false;
	const consoleError = console.error;
	console.error = () => {};

	mount(
		<Boundary onError={() => {wasError = true}}>
            <WithoutError />
        </Boundary>
	);

	console.error = consoleError;

	t.equal(wasError, false, 'Should not call callback')
	t.end();
});

test('initMountCheckError', (t) => {
	const consoleError = () => {};
	const testMountWithError = initMountCheckError(
		({children}) => {
			t.equal(console.error, consoleError, 'Should replace console error during render');
			t.equal(children, 'TestChildren', 'Should pass children to Boundary');
			return null;
		},
		consoleError
	);

	t.equal(typeof testMountWithError, 'function', 'Should return function');

	t.notEqual(console.error, consoleError, 'Should not replace console error before render');

	testMountWithError('TestChildren');

	t.notEqual(console.error, consoleError, 'Should not replace console error after render');
	
	t.end();
});


test('initMountCheckError. Process errors', (t) => {
	const mountWithError = initMountCheckError(
		({onError}) => {
			onError(new Error('TestError'));
			return null;
		},
		() => {}
	);

	const [_1, wasError1] = mountWithError(<WithError />);

	t.equal(wasError1, true, 'Should return error flag')

	const mountWithoutError = initMountCheckError(
		({onError}) => null,
		() => {}
	);

	const [_2, wasError2] = mountWithoutError(<WithError />);

	t.equal(wasError2, false, 'Should not return error flag')

	t.end();
});
