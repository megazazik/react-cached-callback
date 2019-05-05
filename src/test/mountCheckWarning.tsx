import { mount } from 'enzyme';

export default function mountCheckWarning (element: JSX.Element) {
	const tempConsoleWarning = console.warn;
	let wasWarning = false;
	console.warn = () => { wasWarning = true; };
	const wrapper = mount(element);
	console.warn = tempConsoleWarning;
	return [wrapper, wasWarning];
}
