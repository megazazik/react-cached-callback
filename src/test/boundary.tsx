import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';

export interface IProps {
	onError: (error: Error) => void;
}

interface IState {
	error: boolean;
}

export function initMountCheckError (Component: React.ComponentType<IProps>, consoleError: (...args) => any) {
	return function mountCheckError (element): [ReactWrapper, boolean] { 
		let wasError = false;
		const tempConsoleError = console.error;
		console.error = consoleError;
		const wrapper = mount(
			<Component onError={() => {wasError = true}}>
				{element}
			</Component>
		);
		console.error = tempConsoleError;
		return [wrapper, wasError];
	}
}

export class Boundary extends React.Component<IProps, IState> {
	state: IState = {error: false}
	
	constructor (props) {
		super (props);	
	}

	componentDidCatch (error) {
		this.props.onError(error);
	}

	static getDerivedStateFromError(error) {
		return {error: true};
	}

	render () {
		return this.state.error ? null : this.props.children;
	}
}

export default initMountCheckError(Boundary, () => {});